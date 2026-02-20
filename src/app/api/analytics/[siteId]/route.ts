/**
 * Analytics Endpoint
 * 
 * GET /api/analytics/[siteId] - Get site analytics
 * 
 * Requirements: 17
 */

import { NextRequest, NextResponse } from 'next/server'
import { getAdminClient } from '@/lib/supabase'
import { requireAuth } from '@/lib/auth-utils'

interface ViewsByPeriod {
  date: string
  views: number
}

/**
 * GET /api/analytics/[siteId]
 * Get analytics for a site
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ siteId: string }> }
) {
  try {
    const userId = await requireAuth(request)
    const { siteId } = await params

    const supabase = getAdminClient() as any

    // Check site ownership
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

    if (site.user_id !== userId) {
      return NextResponse.json(
        { error: 'Forbidden', message: 'You do not have permission to view analytics for this site', statusCode: 403 },
        { status: 403 }
      )
    }

    // Get total views from site record
    const totalViews = site.views || 0

    // Fetch all view records
    const { data: views, error: viewsError } = await supabase
      .from('site_views')
      .select('viewed_at, referrer')
      .eq('site_id', siteId)
      .order('viewed_at', { ascending: false })

    if (viewsError) {
      console.error('Database error fetching views:', viewsError)
      return NextResponse.json(
        { error: 'Database error', message: 'Failed to fetch analytics', statusCode: 500 },
        { status: 500 }
      )
    }

    // Aggregate views by day
    const viewsByDay: Record<string, number> = {}
    const viewsByWeek: Record<string, number> = {}
    const viewsByMonth: Record<string, number> = {}

    views?.forEach(view => {
      const date = new Date(view.viewed_at)
      
      // By day (YYYY-MM-DD)
      const dayKey = date.toISOString().split('T')[0]
      viewsByDay[dayKey] = (viewsByDay[dayKey] || 0) + 1

      // By week (YYYY-Www)
      const weekStart = new Date(date)
      weekStart.setDate(date.getDate() - date.getDay()) // Start of week (Sunday)
      const weekKey = weekStart.toISOString().split('T')[0]
      viewsByWeek[weekKey] = (viewsByWeek[weekKey] || 0) + 1

      // By month (YYYY-MM)
      const monthKey = date.toISOString().substring(0, 7)
      viewsByMonth[monthKey] = (viewsByMonth[monthKey] || 0) + 1
    })

    // Convert to arrays and sort
    const dailyViews: ViewsByPeriod[] = Object.entries(viewsByDay)
      .map(([date, views]) => ({ date, views }))
      .sort((a, b) => a.date.localeCompare(b.date))

    const weeklyViews: ViewsByPeriod[] = Object.entries(viewsByWeek)
      .map(([date, views]) => ({ date, views }))
      .sort((a, b) => a.date.localeCompare(b.date))

    const monthlyViews: ViewsByPeriod[] = Object.entries(viewsByMonth)
      .map(([date, views]) => ({ date, views }))
      .sort((a, b) => a.date.localeCompare(b.date))

    // Get recent views (last 30 days)
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
    const recentViews = views?.filter(v => new Date(v.viewed_at) >= thirtyDaysAgo) || []

    return NextResponse.json({
      siteId,
      siteName: site.name,
      slug: site.slug,
      totalViews,
      recentViews: recentViews.length,
      analytics: {
        daily: dailyViews,
        weekly: weeklyViews,
        monthly: monthlyViews
      },
      lastViewed: views && views.length > 0 ? views[0].viewed_at : null
    })
  } catch (error: any) {
    if (error.statusCode === 401) {
      return NextResponse.json(
        { error: 'Unauthorized', message: error.message, statusCode: 401 },
        { status: 401 }
      )
    }

    console.error('Error fetching analytics:', error)
    return NextResponse.json(
      { error: 'Server error', message: 'An unexpected error occurred', statusCode: 500 },
      { status: 500 }
    )
  }
}
