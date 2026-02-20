/**
 * Email Verification Endpoint
 * 
 * GET /api/auth/verify
 * 
 * Handles email verification callback from Supabase Auth.
 * Verifies the user's email and creates their database record if needed.
 */

import { NextRequest, NextResponse } from 'next/server'
import { getServerClient, getAdminClient } from '@/lib/supabase'
import { sendWelcomeEmail } from '@/lib/email'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const token_hash = searchParams.get('token_hash')
    const type = searchParams.get('type')
    const error = searchParams.get('error')
    const error_description = searchParams.get('error_description')

    // Check if there's an error from Supabase
    if (error) {
      console.error('Supabase verification error:', error, error_description)
      return NextResponse.redirect(
        new URL(`/?error=${error}`, request.url)
      )
    }

    // If no token_hash or type, the verification likely already happened
    // Supabase redirects here after successful verification
    if (!token_hash || !type) {
      console.log('No token parameters - verification likely already completed')
      // Just redirect to success since Supabase already verified the email
      // Note: Welcome email won't be sent in this case since we don't have user info
      return NextResponse.redirect(
        new URL('/?verified=true', request.url)
      )
    }

    // Verify the email using the token
    const supabase = getServerClient()
    const { data, error: verifyError } = await supabase.auth.verifyOtp({
      token_hash,
      type: type as any
    })

    if (verifyError) {
      console.error('Email verification error:', verifyError)
      return NextResponse.redirect(
        new URL('/?error=verification_failed', request.url)
      )
    }

    if (!data.user) {
      console.error('No user returned from verification')
      return NextResponse.redirect(
        new URL('/?error=verification_failed', request.url)
      )
    }

    console.log('Email verified successfully:', data.user.id)

    // Check if user record exists in database
    const adminClient = getAdminClient() as any
    const { data: existingUser } = await adminClient
      .from('users')
      .select('id')
      .eq('id', data.user.id)
      .single()

    // If user doesn't exist in database, create the record
    if (!existingUser) {
      const username = data.user.user_metadata?.username || data.user.email?.split('@')[0]
      
      const { error: insertError } = await adminClient
        .from('users')
        .insert({
          id: data.user.id,
          username,
          email: data.user.email!
        })

      if (insertError) {
        console.error('Failed to create user record:', insertError)
        // Continue anyway - user is verified in auth
      }
    }

    // Send welcome email (non-blocking)
    if (data.user.email) {
      const username = data.user.user_metadata?.username || data.user.email.split('@')[0]
      console.log('Sending welcome email to:', data.user.email)
      sendWelcomeEmail(data.user.email, username).catch(error => {
        console.error('Failed to send welcome email:', error)
      })
    }

    // Redirect to success page or dashboard
    return NextResponse.redirect(
      new URL('/?verified=true', request.url)
    )
  } catch (error) {
    console.error('Verification error:', error)
    return NextResponse.redirect(
      new URL('/?error=verification_failed', request.url)
    )
  }
}
