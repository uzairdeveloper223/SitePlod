/**
 * Next.js Middleware
 * 
 * Applies security headers and CORS configuration to all requests.
 * Requirements: 23
 * 
 * Security: H3 (CORS restriction), H4 (CSP header)
 */

import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

/**
 * Allowed origins for CORS requests.
 * Configured via ALLOWED_ORIGINS env var (comma-separated), with sensible defaults.
 */
const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',').map(o => o.trim()).filter(Boolean) || [
  'http://localhost:3000',
  'https://siteplod.vercel.app'
]

export function middleware(request: NextRequest) {
  const response = NextResponse.next()

  // Security Headers (Requirement 23)
  
  // Prevent MIME type sniffing
  response.headers.set('X-Content-Type-Options', 'nosniff')
  
  // Prevent clickjacking attacks
  response.headers.set('X-Frame-Options', 'DENY')
  
  // Enable XSS protection
  response.headers.set('X-XSS-Protection', '1; mode=block')

  // Content-Security-Policy (H4)
  response.headers.set(
    'Content-Security-Policy',
    [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: https: blob:",
      "font-src 'self' data:",
      "connect-src 'self' https://*.supabase.co",
      "frame-ancestors 'none'",
      "base-uri 'self'",
      "form-action 'self'"
    ].join('; ')
  )
  
  // Enforce HTTPS in production
  if (process.env.NODE_ENV === 'production') {
    response.headers.set(
      'Strict-Transport-Security',
      'max-age=31536000; includeSubDomains'
    )
  }

  // CORS Headers for API routes (H3 - restricted to allowed origins)
  if (request.nextUrl.pathname.startsWith('/api/')) {
    const origin = request.headers.get('origin')
    
    if (origin && allowedOrigins.includes(origin)) {
      response.headers.set('Access-Control-Allow-Origin', origin)
    } else if (process.env.NODE_ENV === 'development') {
      // In development, allow the requesting origin for convenience
      response.headers.set('Access-Control-Allow-Origin', origin || 'http://localhost:3000')
    }
    // In production with unknown origin, no CORS header is set (request is blocked by browser)
    
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization')
    response.headers.set('Access-Control-Max-Age', '86400')

    // Handle preflight requests
    if (request.method === 'OPTIONS') {
      return new NextResponse(null, {
        status: 204,
        headers: response.headers
      })
    }
  }

  return response
}

// Configure which routes the middleware runs on
export const config = {
  matcher: [
    // Match all API routes
    '/api/:path*',
    // Match all site serving routes
    '/s/:path*',
  ],
}
