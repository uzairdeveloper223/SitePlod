/**
 * Health Check Endpoint
 * 
 * GET /api/health
 * 
 * Public endpoint for uptime monitoring.
 * Pings Supabase to keep the free-tier project active.
 */

import { NextResponse } from 'next/server'
import { getAdminClient } from '@/lib/supabase'

export async function GET() {
  const start = Date.now()

  try {
    // Ping Supabase to keep it alive
    const supabase = getAdminClient() as any
    const { error } = await supabase
      .from('sites')
      .select('id')
      .limit(1)

    const latency = Date.now() - start

    if (error) {
      return NextResponse.json(
        {
          status: 'degraded',
          supabase: 'error',
          error: error.message,
          latency: `${latency}ms`,
          timestamp: new Date().toISOString()
        },
        { status: 503 }
      )
    }

    return NextResponse.json({
      status: 'ok',
      supabase: 'connected',
      latency: `${latency}ms`,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    const latency = Date.now() - start
    return NextResponse.json(
      {
        status: 'error',
        supabase: 'unreachable',
        latency: `${latency}ms`,
        timestamp: new Date().toISOString()
      },
      { status: 503 }
    )
  }
}

// No auth required, allow caching for 60s
export const dynamic = 'force-dynamic'
