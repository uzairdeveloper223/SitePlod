/**
 * Single Site Management Endpoints
 * 
 * GET /api/sites/[id] - Get site details with files
 * PUT /api/sites/[id] - Update site
 * DELETE /api/sites/[id] - Delete site
 * 
 * Requirements: 11, 12, 13
 */

import { NextRequest, NextResponse } from 'next/server'
import { getAdminClient } from '@/lib/supabase'
import { requireAuth } from '@/lib/auth-utils'
import { validateSiteName } from '@/lib/validation'
import { z } from 'zod'

const updateSiteSchema = z.object({
  name: z.string().min(1).max(100)
})

/**
 * GET /api/sites/[id]
 * Get site details with all files
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = await requireAuth(request)
    const { id: siteId } = await params

    const supabase = getAdminClient()

    // Fetch site
    const { data: site, error: siteError } = await supabase
      .from('sites')
      .select('*')
      .eq('id', siteId)
      .single()

    if (siteError || !site) {
      return NextResponse.json(
        { error: 'Not found', message: 'Site not found', statusCode: 404 },
        { status: 404 }
      )
    }

    // Check ownership
    if (site.user_id !== userId) {
      return NextResponse.json(
        { error: 'Forbidden', message: 'You do not have permission to access this site', statusCode: 403 },
        { status: 403 }
      )
    }

    // Fetch files
    const { data: files, error: filesError } = await supabase
      .from('site_files')
      .select('*')
      .eq('site_id', siteId)
      .order('path')

    if (filesError) {
      console.error('Database error fetching files:', filesError)
      return NextResponse.json(
        { error: 'Database error', message: 'Failed to fetch site files', statusCode: 500 },
        { status: 500 }
      )
    }

    return NextResponse.json({
      ...site,
      files: files || []
    })
  } catch (error: any) {
    if (error.statusCode === 401) {
      return NextResponse.json(
        { error: 'Unauthorized', message: error.message, statusCode: 401 },
        { status: 401 }
      )
    }

    console.error('Error fetching site:', error)
    return NextResponse.json(
      { error: 'Server error', message: 'An unexpected error occurred', statusCode: 500 },
      { status: 500 }
    )
  }
}

/**
 * PUT /api/sites/[id]
 * Update site details
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = await requireAuth(request)
    const { id: siteId } = await params

    const body = await request.json()
    const { name } = updateSiteSchema.parse(body)

    // Validate site name
    const nameValidation = validateSiteName(name)
    if (!nameValidation.valid) {
      return NextResponse.json(
        { error: 'Invalid name', message: nameValidation.error, statusCode: 400 },
        { status: 400 }
      )
    }

    const supabase = getAdminClient()

    // Check site exists and ownership
    const { data: site, error: fetchError } = await supabase
      .from('sites')
      .select('user_id')
      .eq('id', siteId)
      .single()

    if (fetchError || !site) {
      return NextResponse.json(
        { error: 'Not found', message: 'Site not found', statusCode: 404 },
        { status: 404 }
      )
    }

    if (site.user_id !== userId) {
      return NextResponse.json(
        { error: 'Forbidden', message: 'You do not have permission to update this site', statusCode: 403 },
        { status: 403 }
      )
    }

    // Update site
    const { data: updatedSite, error: updateError } = await supabase
      .from('sites')
      .update({
        name,
        updated_at: new Date().toISOString()
      })
      .eq('id', siteId)
      .select()
      .single()

    if (updateError) {
      console.error('Database error updating site:', updateError)
      return NextResponse.json(
        { error: 'Database error', message: 'Failed to update site', statusCode: 500 },
        { status: 500 }
      )
    }

    return NextResponse.json(updatedSite)
  } catch (error: any) {
    if (error.statusCode === 401) {
      return NextResponse.json(
        { error: 'Unauthorized', message: error.message, statusCode: 401 },
        { status: 401 }
      )
    }

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', message: error.errors[0].message, statusCode: 400 },
        { status: 400 }
      )
    }

    console.error('Error updating site:', error)
    return NextResponse.json(
      { error: 'Server error', message: 'An unexpected error occurred', statusCode: 500 },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/sites/[id]
 * Delete site and all associated files and views
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = await requireAuth(request)
    const { id: siteId } = await params

    const supabase = getAdminClient()

    // Check site exists and ownership
    const { data: site, error: fetchError } = await supabase
      .from('sites')
      .select('user_id')
      .eq('id', siteId)
      .single()

    if (fetchError || !site) {
      return NextResponse.json(
        { error: 'Not found', message: 'Site not found', statusCode: 404 },
        { status: 404 }
      )
    }

    if (site.user_id !== userId) {
      return NextResponse.json(
        { error: 'Forbidden', message: 'You do not have permission to delete this site', statusCode: 403 },
        { status: 403 }
      )
    }

    // Delete site (CASCADE will delete files and views)
    const { error: deleteError } = await supabase
      .from('sites')
      .delete()
      .eq('id', siteId)

    if (deleteError) {
      console.error('Database error deleting site:', deleteError)
      return NextResponse.json(
        { error: 'Database error', message: 'Failed to delete site', statusCode: 500 },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Site deleted successfully'
    })
  } catch (error: any) {
    if (error.statusCode === 401) {
      return NextResponse.json(
        { error: 'Unauthorized', message: error.message, statusCode: 401 },
        { status: 401 }
      )
    }

    console.error('Error deleting site:', error)
    return NextResponse.json(
      { error: 'Server error', message: 'An unexpected error occurred', statusCode: 500 },
      { status: 500 }
    )
  }
}
