/**
 * Resend Verification Email Endpoint
 * 
 * POST /api/auth/resend-verification
 * 
 * Resends the email verification link to the user.
 */

import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { getServerClient } from '@/lib/supabase'

const resendSchema = z.object({
  email: z.string().email('Invalid email format')
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validationResult = resendSchema.safeParse(body)
    
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
    
    const { email } = validationResult.data
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'
    
    const supabase = getServerClient()
    
    // Resend verification email
    const { error } = await supabase.auth.resend({
      type: 'signup',
      email,
      options: {
        emailRedirectTo: `${baseUrl}/api/auth/verify`
      }
    })
    
    if (error) {
      // Don't reveal if email exists or not for security
      console.error('Resend verification error:', error)
    }
    
    // Always return success to prevent email enumeration
    return NextResponse.json(
      {
        message: 'If an account exists with this email, a verification link has been sent.'
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Resend verification error:', error)
    
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
