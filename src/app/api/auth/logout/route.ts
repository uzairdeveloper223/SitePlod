/**
 * User Logout Endpoint
 * 
 * POST /api/auth/logout
 * 
 * Signs out the authenticated user and invalidates their JWT token.
 * 
 * Requirements: 4
 */

import { NextRequest, NextResponse } from 'next/server'
import { requireAuth, AuthError } from '@/lib/auth-utils'
import { createAuthClient } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    // Verify JWT token and get user ID
    const userId = await requireAuth(request)
    
    // Extract token from Authorization header
    const authHeader = request.headers.get('authorization')
    const token = authHeader?.replace(/^Bearer\s+/i, '').trim() || ''
    
    // Create auth client with the user's token
    const supabase = createAuthClient(token)
    
    // Sign out with Supabase Auth
    const { error } = await supabase.auth.signOut()
    
    if (error) {
      console.error('Logout error:', error)
      // Even if signOut fails, we still return success
      // The client should clear the token regardless
    }
    
    // Return success response
    return NextResponse.json({
      success: true,
      message: 'Logged out successfully'
    })
    
  } catch (error) {
    // Handle authentication errors
    if (error instanceof AuthError) {
      return NextResponse.json(
        {
          error: 'Unauthorized',
          message: error.message,
          statusCode: error.statusCode
        },
        { status: error.statusCode }
      )
    }
    
    console.error('Logout error:', error)
    
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
