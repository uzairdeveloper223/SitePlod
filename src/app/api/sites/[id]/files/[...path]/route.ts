/**
 * File Management Endpoints
 * 
 * GET /api/sites/[id]/files/[...path] - Get file content
 * PUT /api/sites/[id]/files/[...path] - Update file content
 * 
 * Requirements: 18, 19
 */

import { NextRequest, NextResponse } from 'next/server'
import { getAdminClient } from '@/lib/supabase'
import { requireAuth } from '@/lib/auth-utils'
import { uploadToPastebin } from '@/lib/pastebin'
import axios from 'axios'

/**
 * GET /api/sites/[id]/files/[...path]
 * Get file content from storage
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; path: string[] }> }
) {
  try {
    const userId = await requireAuth(request)
    const { id: siteId, path: pathArray } = await params
    const filePath = pathArray.join('/')

    const supabase = getAdminClient()

    // Check site ownership
    const { data: site, error: siteError } = await supabase
      .from('sites')
      .select('user_id')
      .eq('id', siteId)
      .single() as { data: any; error: any }

    if (siteError || !site) {
      return NextResponse.json(
        { error: 'Not found', message: 'Site not found', statusCode: 404 },
        { status: 404 }
      )
    }

    if (site.user_id !== userId) {
      return NextResponse.json(
        { error: 'Forbidden', message: 'You do not have permission to access this site', statusCode: 403 },
        { status: 403 }
      )
    }

    // Fetch file record
    const { data: file, error: fileError } = await supabase
      .from('site_files')
      .select('*')
      .eq('site_id', siteId)
      .eq('path', filePath)
      .single() as { data: any; error: any }

    if (fileError || !file) {
      return NextResponse.json(
        { error: 'Not found', message: 'File not found', statusCode: 404 },
        { status: 404 }
      )
    }

    // Fetch content from storage URL
    try {
      // Convert Pastebin URL to raw URL if needed
      let fetchUrl = file.storage_url
      if (fetchUrl.includes('pastebin.com/') && !fetchUrl.includes('/raw/')) {
        // Convert https://pastebin.com/abc123 to https://pastebin.com/raw/abc123
        fetchUrl = fetchUrl.replace('pastebin.com/', 'pastebin.com/raw/')
      }
      
      const response = await axios.get(fetchUrl)
      const content = typeof response.data === 'string' ? response.data : JSON.stringify(response.data)

      return NextResponse.json({
        path: file.path,
        content,
        mimeType: file.mime_type,
        size: file.size,
        storageUrl: file.storage_url,
        createdAt: file.created_at,
        updatedAt: file.updated_at
      })
    } catch (fetchError) {
      console.error('Error fetching file content:', fetchError)
      return NextResponse.json(
        { error: 'Storage error', message: 'Failed to fetch file content from storage', statusCode: 500 },
        { status: 500 }
      )
    }
  } catch (error: any) {
    if (error.statusCode === 401) {
      return NextResponse.json(
        { error: 'Unauthorized', message: error.message, statusCode: 401 },
        { status: 401 }
      )
    }

    console.error('Error fetching file:', error)
    return NextResponse.json(
      { error: 'Server error', message: 'An unexpected error occurred', statusCode: 500 },
      { status: 500 }
    )
  }
}

/**
 * PUT /api/sites/[id]/files/[...path]
 * Update file content
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; path: string[] }> }
) {
  try {
    const userId = await requireAuth(request)
    const { id: siteId, path: pathArray } = await params
    const filePath = pathArray.join('/')

    const body = await request.json()
    const { content } = body

    if (typeof content !== 'string') {
      return NextResponse.json(
        { error: 'Invalid content', message: 'Content must be a string', statusCode: 400 },
        { status: 400 }
      )
    }

    const supabase = getAdminClient() as any

    // Check site ownership
    const { data: site, error: siteError } = await supabase
      .from('sites')
      .select('user_id')
      .eq('id', siteId)
      .single()

    if (siteError || !site) {
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

    // Fetch file record
    const { data: file, error: fileError } = await supabase
      .from('site_files')
      .select('*')
      .eq('site_id', siteId)
      .eq('path', filePath)
      .single()

    if (fileError || !file) {
      return NextResponse.json(
        { error: 'Not found', message: 'File not found', statusCode: 404 },
        { status: 404 }
      )
    }

    // Upload new content to Pastebin
    try {
      const newStorageUrl = await uploadToPastebin(content, file.path)

      // Update file record
      const { data: updatedFile, error: updateError } = await supabase
        .from('site_files')
        .update({
          storage_url: newStorageUrl,
          size: Buffer.byteLength(content, 'utf8'),
          updated_at: new Date().toISOString()
        })
        .eq('id', file.id)
        .select()
        .single()

      if (updateError) {
        console.error('Database error updating file:', updateError)
        return NextResponse.json(
          { error: 'Database error', message: 'Failed to update file record', statusCode: 500 },
          { status: 500 }
        )
      }

      return NextResponse.json({
        success: true,
        message: 'File updated successfully',
        file: updatedFile
      })
    } catch (uploadError) {
      console.error('Error uploading to Pastebin:', uploadError)
      return NextResponse.json(
        { error: 'Storage error', message: 'Failed to upload file content', statusCode: 500 },
        { status: 500 }
      )
    }
  } catch (error: any) {
    if (error.statusCode === 401) {
      return NextResponse.json(
        { error: 'Unauthorized', message: error.message, statusCode: 401 },
        { status: 401 }
      )
    }

    console.error('Error updating file:', error)
    return NextResponse.json(
      { error: 'Server error', message: 'An unexpected error occurred', statusCode: 500 },
      { status: 500 }
    )
  }
}
