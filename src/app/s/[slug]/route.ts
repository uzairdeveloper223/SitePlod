import { NextRequest, NextResponse } from 'next/server'
import { getAdminClient } from '@/lib/supabase'
import axios from 'axios'

/**
 * Dynamic site serving route
 * 
 * This route serves deployed static sites by their slug as raw HTML.
 * Returns the HTML directly without any Next.js wrapper.
 * 
 * Requirements: 14, 16
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params

  const supabase = getAdminClient()

  // Fetch site by slug
  const { data: site, error: siteError } = await supabase
    .from('sites')
    .select('*')
    .eq('slug', slug)
    .maybeSingle() as { data: any; error: any }

  if (siteError || !site) {
    return new NextResponse('Site not found', { status: 404 })
  }

  // Fetch index.html file
  const { data: indexFile, error: fileError } = await supabase
    .from('site_files')
    .select('*')
    .eq('site_id', site.id)
    .eq('path', 'index.html')
    .maybeSingle() as { data: any; error: any }

  if (fileError || !indexFile) {
    return new NextResponse('Site content not found', { status: 404 })
  }

  // Fetch content from Pastebin
  let content: string | undefined
  try {
    // Convert Pastebin URL to raw URL if needed
    let fetchUrl = indexFile.storage_url
    if (fetchUrl.includes('pastebin.com/') && !fetchUrl.includes('/raw/')) {
      fetchUrl = fetchUrl.replace('pastebin.com/', 'pastebin.com/raw/')
    }

    console.log('Fetching content from:', fetchUrl)

    // Retry logic for flaky networks
    let lastError: any
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        const response = await axios.get(fetchUrl, {
          timeout: 15000,
          headers: {
            'User-Agent': 'Mozilla/5.0 (compatible; SitePlod/1.0)',
          },
          validateStatus: (status) => status < 500,
        })

        if (response.status >= 400) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`)
        }

        content = typeof response.data === 'string' ? response.data : JSON.stringify(response.data)
        console.log('Content fetched successfully, length:', content.length)
        break
      } catch (err) {
        lastError = err
        if (attempt < 2) {
          console.log(`Attempt ${attempt + 1} failed, retrying...`)
          await new Promise(resolve => setTimeout(resolve, 1000 * (attempt + 1)))
        }
      }
    }

    if (!content) {
      throw lastError || new Error('Failed to fetch content after retries')
    }
  } catch (error) {
    console.error('Error fetching site content:', error)
    return new NextResponse('Failed to load site content', { status: 500 })
  }

  // Track view asynchronously (non-blocking)
  trackView(site.id).catch(err => {
    console.error('Failed to track view:', err)
  })

  // Inject <base> tag to correctly resolve relative asset paths (like css/style.css)
  // because Next.js strips the slug in /s/[slug] when parsing relative URLs
  const baseTag = `<base href="/s/${slug}/">\n`
  let finalContent = content
  if (finalContent.match(/<head[^>]*>/i)) {
    finalContent = finalContent.replace(/(<head[^>]*>)/i, `$1\n  ${baseTag}`)
  } else if (finalContent.match(/<html[^>]*>/i)) {
    finalContent = finalContent.replace(/(<html[^>]*>)/i, `$1\n<head>\n  ${baseTag}</head>\n`)
  } else {
    // If no HTML boilerplate exists
    finalContent = `<head>\n  ${baseTag}</head>\n` + finalContent
  }

  // Return raw HTML
  return new NextResponse(finalContent, {
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    },
  })
}

/**
 * Track site view asynchronously
 */
async function trackView(siteId: string) {
  try {
    const supabase = getAdminClient() as any
    await supabase.rpc('increment_views', { site_id: siteId })
    await supabase.from('site_views').insert({ site_id: siteId })
  } catch (error) {
    console.error('Error tracking view:', error)
  }
}

export const dynamic = 'force-dynamic'
export const revalidate = 3600
