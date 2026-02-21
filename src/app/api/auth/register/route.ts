/**
 * User Registration Endpoint
 * 
 * POST /api/auth/register
 * 
 * Creates a new user account with Supabase Auth and sends email verification.
 * 
 * Requirements: 2
 */

import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { getAdminClient, getServerClient } from '@/lib/supabase'

/**
 * Registration request schema
 * 
 * Validates:
 * - username: 3-30 characters, alphanumeric with underscores and hyphens
 * - email: valid email format
 * - password: minimum 8 characters
 */
const registerSchema = z.object({
  username: z
    .string()
    .min(3, 'Username must be at least 3 characters')
    .max(30, 'Username must be less than 30 characters')
    .regex(/^[a-zA-Z0-9_-]+$/, 'Username can only contain letters, numbers, underscores, and hyphens'),
  email: z
    .string()
    .email('Invalid email format'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
})

export async function POST(request: NextRequest) {
  try {
    // Parse and validate request body
    const body = await request.json()
    const validationResult = registerSchema.safeParse(body)

    if (!validationResult.success) {
      const firstError = validationResult.error.issues[0]
      return NextResponse.json(
        {
          error: 'Validation error',
          message: firstError.message,
          statusCode: 400
        },
        { status: 400 }
      )
    }

    const { username, email, password } = validationResult.data

    // Get admin client for privileged operations
    const supabase = getAdminClient() as any

    // Check if username exists (case-insensitive)
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .ilike('username', username)
      .single()

    if (existingUser) {
      return NextResponse.json(
        {
          error: 'Username taken',
          message: 'This username is already in use',
          statusCode: 400
        },
        { status: 400 }
      )
    }

    // Get the base URL for email confirmation redirect
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'

    // Use server client for signup (sends verification email automatically)
    const serverClient = getServerClient()

    // Sign up user with email verification
    const { data: signUpData, error: signUpError } = await serverClient.auth.signUp({
      email,
      password,
      options: {
        data: {
          username
        },
        emailRedirectTo: `${baseUrl}/api/auth/verify`
      }
    })

    if (signUpError) {
      console.error('Signup error:', signUpError)
      // Handle specific auth errors
      if (signUpError.message.includes('already registered') || signUpError.message.includes('User already registered')) {
        return NextResponse.json(
          {
            error: 'Email taken',
            message: 'This email is already registered',
            statusCode: 400
          },
          { status: 400 }
        )
      }

      return NextResponse.json(
        {
          error: 'Registration failed',
          message: signUpError.message,
          statusCode: 400
        },
        { status: 400 }
      )
    }

    if (!signUpData.user) {
      console.error('No user returned from signup')
      return NextResponse.json(
        {
          error: 'Registration failed',
          message: 'Failed to create user account',
          statusCode: 500
        },
        { status: 500 }
      )
    }

    console.log('User created:', signUpData.user.id, 'Email confirmed:', signUpData.user.email_confirmed_at)

    // Insert user record into database using admin client
    const { data: userData, error: dbError } = await supabase
      .from('users')
      .insert({
        id: signUpData.user.id,
        username,
        email,
        notification: ['CLI_ANNOUNCEMENT']
      })
      .select()
      .single()

    if (dbError) {
      console.error('Database insert error:', dbError)
      // User is created in auth but not in database
      // They can still verify and we'll handle it in the verify endpoint
      return NextResponse.json(
        {
          message: 'Registration successful! Please check your email to verify your account.',
          requiresVerification: true
        },
        { status: 201 }
      )
    }

    console.log('User record created in database:', userData.id)

    // Return success message
    return NextResponse.json(
      {
        message: 'Registration successful! Please check your email to verify your account.',
        requiresVerification: true,
        user: {
          id: userData.id,
          username: userData.username,
          email: userData.email
        }
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Registration error:', error)

    // Handle JSON parse errors
    if (error instanceof SyntaxError) {
      return NextResponse.json(
        {
          error: 'Invalid request',
          message: 'Invalid JSON in request body',
          statusCode: 400
        },
        { status: 400 }
      )
    }

    // Handle unexpected errors
    return NextResponse.json(
      {
        error: 'Server error',
        message: 'An unexpected error occurred',
        statusCode: 500
      },
      { status: 500 }
    )
  }
}
