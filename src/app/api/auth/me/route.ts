/**
 * Get Current User Endpoint
 * 
 * GET /api/auth/me
 * 
 * Returns the authenticated user's data.
 * 
 * Requirements: 10
 */

import { NextRequest, NextResponse } from 'next/server'
import { requireAuth, AuthError } from '@/lib/auth-utils'
import { getAdminClient } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    // Verify JWT token and get user ID
    const userId = await requireAuth(request)

    // Get admin client to fetch user data
    const supabase = getAdminClient() as any

    // Fetch user data from database
    const { data: userData, error: dbError } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single()

    if (dbError) {
      return NextResponse.json(
        {
          error: 'Database error',
          message: dbError.message,
          statusCode: 500
        },
        { status: 500 }
      )
    }

    if (!userData) {
      return NextResponse.json(
        {
          error: 'User not found',
          message: 'User data not found',
          statusCode: 404
        },
        { status: 404 }
      )
    }

    // Return user data
    return NextResponse.json({
      user: {
        id: userData.id,
        username: userData.username,
        email: userData.email,
        notification: userData.notification,
        cli_announced: userData.cli_announced,
        createdAt: userData.created_at,
        updatedAt: userData.updated_at
      }
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

    console.error('Get current user error:', error)

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
