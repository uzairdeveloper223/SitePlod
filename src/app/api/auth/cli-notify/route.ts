/**
 * CLI Notification Endpoint
 * 
 * POST /api/auth/cli-notify
 * 
 * Subscribes the authenticated user to CLI announcements.
 */

import { NextRequest, NextResponse } from 'next/server'
import { requireAuth, AuthError } from '@/lib/auth-utils'
import { getAdminClient } from '@/lib/supabase'

export async function POST(request: NextRequest) {
    try {
        // Verify JWT token and get user ID
        const userId = await requireAuth(request)

        // Get admin client to update user data
        const supabase = getAdminClient() as any

        // First, fetch the user to get their current notification array
        const { data: userData, error: fetchError } = await supabase
            .from('users')
            .select('notification')
            .eq('id', userId)
            .single()

        if (fetchError) {
            return NextResponse.json(
                {
                    error: 'Database error',
                    message: fetchError.message,
                    statusCode: 500
                },
                { status: 500 }
            )
        }

        const currentNotifications = userData?.notification || []

        // If not already subscribed, add the flag
        if (!currentNotifications.includes('CLI_ANNOUNCEMENT')) {
            const updatedNotifications = [...currentNotifications, 'CLI_ANNOUNCEMENT']

            const { error: updateError } = await supabase
                .from('users')
                .update({ notification: updatedNotifications })
                .eq('id', userId)

            if (updateError) {
                return NextResponse.json(
                    {
                        error: 'Database update error',
                        message: updateError.message,
                        statusCode: 500
                    },
                    { status: 500 }
                )
            }
        }

        return NextResponse.json({
            success: true,
            message: 'Successfully subscribed to CLI announcements',
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

        console.error('CLI Notification error:', error)

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
