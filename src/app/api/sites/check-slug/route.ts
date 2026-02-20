/**
 * Check Slug Availability Endpoint
 * 
 * GET /api/sites/check-slug?slug=my-site
 * 
 * Validates slug format and checks if it's available.
 * Requirements: 8, 21
 */

import { NextRequest, NextResponse } from 'next/server'
import { getAdminClient } from '@/lib/supabase'
import { validateSlug } from '@/lib/validation'
import { withRateLimit } from '@/lib/with-rate-limit'

async function handler(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const slug = searchParams.get('slug')

    if (!slug) {
      return NextResponse.json(
        { error: 'Missing slug', message: 'Slug parameter is required', statusCode: 400 },
        { status: 400 }
      )
    }

    // Validate slug format
    const validation = validateSlug(slug)
    if (!validation.valid) {
      return NextResponse.json(
        { error: 'Invalid slug', message: validation.error, statusCode: 400 },
        { status: 400 }
      )
    }

    // Check if slug exists (case-insensitive)
    const supabase = getAdminClient()
    const { data, error } = await supabase
      .from('sites')
      .select('id')
      .ilike('slug', slug)
      .maybeSingle()

    if (error) {
      console.error('Database error checking slug:', error)
      return NextResponse.json(
        { error: 'Database error', message: 'Failed to check slug availability', statusCode: 500 },
        { status: 500 }
      )
    }

    return NextResponse.json({
      available: !data,
      slug
    })
  } catch (error) {
    console.error('Error checking slug:', error)
    return NextResponse.json(
      { error: 'Server error', message: 'An unexpected error occurred', statusCode: 500 },
      { status: 500 }
    )
  }
}

// Apply rate limiting: 10 checks per minute
export const GET = withRateLimit(handler, 'checkSlug')
