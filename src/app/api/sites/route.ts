/**
 * Sites Management Endpoints
 * 
 * GET /api/sites - List user's sites
 * POST /api/sites - Create new site
 * 
 * Requirements: 9, 10, 21
 */

import { NextRequest, NextResponse } from 'next/server'
import { getAdminClient } from '@/lib/supabase'
import { requireAuth } from '@/lib/auth-utils'
import { validateSlug, validateSiteName } from '@/lib/validation'
import { withRateLimit } from '@/lib/with-rate-limit'
import { z } from 'zod'

const createSiteSchema = z.object({
  name: z.string().min(1).max(100),
  slug: z.string().min(3).max(50).regex(/^[a-z0-9-]+$/),
  managed: z.boolean(),
  files: z.array(z.object({
    path: z.string(),
    storageUrl: z.string().url(),
    mimeType: z.string(),
    size: z.number().int().positive()
  })).min(1)
})

/**
 * GET /api/sites
 * Get all sites for authenticated user
 */
async function getHandler(request: NextRequest) {
  try {
    const userId = await requireAuth(request)

    const supabase = getAdminClient()
    const { data: sites, error } = await supabase
      .from('sites')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Database error fetching sites:', error)
      return NextResponse.json(
        { error: 'Database error', message: 'Failed to fetch sites', statusCode: 500 },
        { status: 500 }
      )
    }

    return NextResponse.json(sites || [])
  } catch (error: any) {
    if (error.statusCode === 401) {
      return NextResponse.json(
        { error: 'Unauthorized', message: error.message, statusCode: 401 },
        { status: 401 }
      )
    }

    console.error('Error fetching sites:', error)
    return NextResponse.json(
      { error: 'Server error', message: 'An unexpected error occurred', statusCode: 500 },
      { status: 500 }
    )
  }
}

/**
 * POST /api/sites
 * Create a new site
 */
async function postHandler(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, slug, managed, files } = createSiteSchema.parse(body)

    // Validate site name
    const nameValidation = validateSiteName(name)
    if (!nameValidation.valid) {
      return NextResponse.json(
        { error: 'Invalid name', message: nameValidation.error, statusCode: 400 },
        { status: 400 }
      )
    }

    // Validate slug format
    const slugValidation = validateSlug(slug)
    if (!slugValidation.valid) {
      return NextResponse.json(
        { error: 'Invalid slug', message: slugValidation.error, statusCode: 400 },
        { status: 400 }
      )
    }

    const supabase = getAdminClient()

    // Check slug availability (case-insensitive)
    const { data: existing } = await supabase
      .from('sites')
      .select('id')
      .ilike('slug', slug)
      .maybeSingle()

    if (existing) {
      return NextResponse.json(
        { error: 'Slug taken', message: 'This slug is already in use', statusCode: 400 },
        { status: 400 }
      )
    }

    let userId: string | null = null

    // If managed site, require authentication
    if (managed) {
      try {
        userId = await requireAuth(request)
      } catch (error: any) {
        return NextResponse.json(
          { error: 'Unauthorized', message: 'Authentication required for managed sites', statusCode: 401 },
          { status: 401 }
        )
      }
    }

    // Create site
    const { data: site, error: siteError } = await supabase
      .from('sites')
      .insert({
        user_id: userId,
        name,
        slug,
        managed
      })
      .select()
      .single()

    if (siteError) {
      console.error('Database error creating site:', siteError)
      return NextResponse.json(
        { error: 'Database error', message: 'Failed to create site', statusCode: 500 },
        { status: 500 }
      )
    }

    // Insert files
    const fileRecords = files.map(file => ({
      site_id: site.id,
      path: file.path,
      storage_url: file.storageUrl,
      mime_type: file.mimeType,
      size: file.size
    }))

    const { error: filesError } = await supabase
      .from('site_files')
      .insert(fileRecords)

    if (filesError) {
      console.error('Database error creating files:', filesError)
      // Rollback: delete the site
      await supabase.from('sites').delete().eq('id', site.id)
      
      return NextResponse.json(
        { error: 'Database error', message: 'Failed to create site files', statusCode: 500 },
        { status: 500 }
      )
    }

    // Return site with live URL
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'
    return NextResponse.json({
      ...site,
      liveUrl: `${baseUrl}/s/${slug}`
    }, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', message: error.errors[0].message, statusCode: 400 },
        { status: 400 }
      )
    }

    console.error('Error creating site:', error)
    return NextResponse.json(
      { error: 'Server error', message: 'An unexpected error occurred', statusCode: 500 },
      { status: 500 }
    )
  }
}

// Export with rate limiting
export const GET = getHandler
export const POST = withRateLimit(postHandler, 'createSite')
