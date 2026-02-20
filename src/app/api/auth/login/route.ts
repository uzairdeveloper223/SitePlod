/**
 * User Login Endpoint
 * 
 * POST /api/auth/login
 * 
 * Authenticates a user with email and password, returns user data and JWT token.
 * Rate limited to 5 requests per minute per IP.
 * 
 * Requirements: 3, 21
 */

import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { getServerClient, getAdminClient } from '@/lib/supabase'
import { withRateLimit } from '@/lib/with-rate-limit'
import { sendWelcomeEmail } from '@/lib/email'

/**
 * Login request schema
 * 
 * Validates:
 * - email: valid email format
 * - password: required string
 */
const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Invalid email format'),
  password: z
    .string()
    .min(1, 'Password is required')
})

async function loginHandler(request: NextRequest) {
  try {
    // Parse and validate request body
    const body = await request.json()
    const validationResult = loginSchema.safeParse(body)
    
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
    
    const { email, password } = validationResult.data
    
    // Get server client for authentication
    const supabase = getServerClient()
    
    // Authenticate with Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password
    })
    
    // Check for email not confirmed error specifically
    if (authError && authError.message === 'Email not confirmed') {
      console.log('User email not confirmed:', email)
      return NextResponse.json(
        {
          error: 'Email not verified',
          message: 'Please verify your email before logging in. Check your inbox for the verification link.',
          statusCode: 403,
          requiresVerification: true
        },
        { status: 403 }
      )
    }
    
    if (authError || !authData.user || !authData.session) {
      console.error('Auth error:', authError)
      return NextResponse.json(
        {
          error: 'Login failed',
          message: 'Invalid email or password',
          statusCode: 401
        },
        { status: 401 }
      )
    }
    
    // Check if email is verified (backup check)
    if (!authData.user.email_confirmed_at) {
      console.log('User email not verified:', authData.user.id)
      return NextResponse.json(
        {
          error: 'Email not verified',
          message: 'Please verify your email before logging in. Check your inbox for the verification link.',
          statusCode: 403,
          requiresVerification: true
        },
        { status: 403 }
      )
    }
    
    // Fetch user data from database using admin client
    const adminClient = getAdminClient() as any
    
    // Try to find user by ID first
    let { data: userData, error: dbError } = await adminClient
      .from('users')
      .select('*')
      .eq('id', authData.user.id)
      .single()
    
    // If user doesn't exist by ID, try to find by email (in case of ID mismatch)
    if (dbError && authData.user.email) {
      console.log('User not found by ID, trying by email:', authData.user.email)
      const { data: userByEmail, error: emailError } = await adminClient
        .from('users')
        .select('*')
        .eq('email', authData.user.email)
        .single()
      
      if (!emailError && userByEmail) {
        console.log('Found user by email, updating ID:', userByEmail.id, '->', authData.user.id)
        
        // Update the user record with the correct auth ID
        const { data: updatedUser, error: updateError } = await adminClient
          .from('users')
          .update({ id: authData.user.id })
          .eq('email', authData.user.email)
          .select()
          .single()
        
        if (!updateError && updatedUser) {
          userData = updatedUser
          dbError = null
        }
      }
    }
    
    // If user still doesn't exist in database, create it now (edge case)
    if (dbError || !userData) {
      console.log('User not found in database, creating record:', authData.user.id)
      
      const username = authData.user.user_metadata?.username || authData.user.email?.split('@')[0]
      
      const { data: newUserData, error: insertError } = await adminClient
        .from('users')
        .insert({
          id: authData.user.id,
          username,
          email: authData.user.email
        })
        .select()
        .single()
      
      if (insertError) {
        console.error('Failed to create user record:', insertError)
        
        // If it's a duplicate username error, try with a unique username
        if (insertError.code === '23505' && insertError.message.includes('username')) {
          console.log('Username conflict, trying with unique username')
          const uniqueUsername = `${username}_${authData.user.id.substring(0, 8)}`
          
          const { data: retryUserData, error: retryError } = await adminClient
            .from('users')
            .insert({
              id: authData.user.id,
              username: uniqueUsername,
              email: authData.user.email
            })
            .select()
            .single()
          
          if (retryError || !retryUserData) {
            console.error('Failed to create user record with unique username:', retryError)
            return NextResponse.json(
              {
                error: 'Database error',
                message: 'Failed to create user record',
                statusCode: 500
              },
              { status: 500 }
            )
          }
          
          // Use the newly created user data
          return NextResponse.json({
            user: {
              id: retryUserData.id,
              username: retryUserData.username,
              email: retryUserData.email,
              createdAt: retryUserData.created_at
            },
            token: authData.session.access_token
          })
        }
        
        return NextResponse.json(
          {
            error: 'Database error',
            message: 'Failed to create user record',
            statusCode: 500
          },
          { status: 500 }
        )
      }
      
      if (!newUserData) {
        return NextResponse.json(
          {
            error: 'Database error',
            message: 'Failed to create user record',
            statusCode: 500
          },
          { status: 500 }
        )
      }
      
      // Use the newly created user data
      return NextResponse.json({
        user: {
          id: newUserData.id,
          username: newUserData.username,
          email: newUserData.email,
          createdAt: newUserData.created_at
        },
        token: authData.session.access_token
      })
    }
    
    // Send welcome email if not sent yet (non-blocking)
    if (!userData.welcome_email_sent && authData.user.email) {
      console.log('Sending welcome email on first login:', authData.user.email)
      sendWelcomeEmail(authData.user.email, userData.username).then(() => {
        // Mark welcome email as sent
        adminClient
          .from('users')
          .update({ welcome_email_sent: true })
          .eq('id', userData.id)
          .then(() => console.log('Welcome email sent and marked'))
          .catch((err: any) => console.error('Failed to mark welcome email as sent:', err))
      }).catch((error: any) => {
        console.error('Failed to send welcome email:', error)
      })
    }
    
    // Return user data and JWT token
    return NextResponse.json({
      user: {
        id: userData.id,
        username: userData.username,
        email: userData.email,
        createdAt: userData.created_at
      },
      token: authData.session.access_token
    })
  } catch (error) {
    console.error('Login error:', error)
    
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

// Apply rate limiting: 5 requests per minute
export const POST = withRateLimit(loginHandler, 'login')
