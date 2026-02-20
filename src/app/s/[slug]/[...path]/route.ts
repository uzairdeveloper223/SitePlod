
import { NextRequest, NextResponse } from 'next/server'
import { getAdminClient } from '@/lib/supabase'
import axios from 'axios'

/**
 * Static asset serving route
 * 
 * Serves static assets (CSS, JS, images, etc.) for deployed sites.
 * Fetches from storage URL and serves with appropriate MIME types.
 * 
 * Requirements: 15
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string; path: string[] }> }
) {
  const { slug, path } = await params
  const assetPath = path.join('/')

  const supabase = getAdminClient()

  // Fetch site by slug
  const { data: site, error: siteError } = await supabase
    .from('sites')
    .select('id')
    .eq('slug', slug)
    .maybeSingle() as { data: any; error: any }

  if (siteError || !site) {
    return new NextResponse('Not found', { status: 404 })
  }

  // Fetch file by path
  const { data: file, error: fileError } = await supabase
    .from('site_files')
    .select('*')
    .eq('site_id', site.id)
    .eq('path', assetPath)
    .maybeSingle() as { data: any; error: any }

  if (fileError || !file) {
    return new NextResponse('Asset not found', { status: 404 })
  }

  // Fetch content from storage URL
  try {
    // Convert Pastebin URL to raw URL if needed
    let fetchUrl = file.storage_url
    if (fetchUrl.includes('pastebin.com/') && !fetchUrl.includes('/raw/')) {
      // Convert https://pastebin.com/abc123 to https://pastebin.com/raw/abc123
      fetchUrl = fetchUrl.replace('pastebin.com/', 'pastebin.com/raw/')
    }

    const response = await axios.get(fetchUrl, {
      responseType: 'arraybuffer'
    })

    return new NextResponse(response.data, {
      headers: {
        'Content-Type': file.mime_type,
        'Cache-Control': 'public, max-age=86400', // 24 hours
      },
    })
  } catch (error) {
    console.error('Error fetching asset:', error)
    return new NextResponse('Error fetching asset', { status: 500 })
  }
}

/**
 * Configure caching behavior for static assets
 * Requirements: 15
 */
export const dynamic = 'force-dynamic'
export const revalidate = 86400 // Revalidate every 24 hours

