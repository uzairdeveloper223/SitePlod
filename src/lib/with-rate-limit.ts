/**
 * Rate Limiting Middleware for Next.js API Routes
 * 
 * Provides a Higher-Order Function (HOF) to wrap API route handlers
 * with rate limiting functionality.
 */

import { NextRequest, NextResponse } from 'next/server';
import { checkRateLimit, getClientIp, RATE_LIMITS } from './rate-limiter';

type RouteHandler = (
  request: NextRequest,
  context?: any
) => Promise<NextResponse> | NextResponse;

type RateLimitEndpoint = keyof typeof RATE_LIMITS;

/**
 * Higher-Order Function to add rate limiting to API routes
 * 
 * @param handler - The original route handler function
 * @param endpoint - The endpoint name to use for rate limiting
 * @returns Wrapped handler with rate limiting
 * 
 * @example
 * ```typescript
 * export const POST = withRateLimit(
 *   async (request: NextRequest) => {
 *     // Your handler logic
 *     return NextResponse.json({ success: true });
 *   },
 *   'login'
 * );
 * ```
 */
export function withRateLimit(
  handler: RouteHandler,
  endpoint: RateLimitEndpoint
): RouteHandler {
  return async (request: NextRequest, context?: any) => {
    // Get client IP address
    const clientIp = getClientIp(request.headers);
    
    // Get rate limit configuration for this endpoint
    const config = RATE_LIMITS[endpoint];
    
    // Check rate limit
    const { allowed, remaining, resetAt } = checkRateLimit(
      clientIp,
      endpoint,
      config
    );
    
    // If rate limit exceeded, return 429 error
    if (!allowed) {
      const resetDate = new Date(resetAt);
      const retryAfter = Math.ceil((resetAt - Date.now()) / 1000);
      
      return NextResponse.json(
        {
          error: 'Rate limit exceeded',
          message: `Too many requests. Please try again after ${resetDate.toISOString()}`,
          statusCode: 429,
          retryAfter
        },
        {
          status: 429,
          headers: {
            'Retry-After': retryAfter.toString(),
            'X-RateLimit-Limit': config.maxRequests.toString(),
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': resetAt.toString()
          }
        }
      );
    }
    
    // Rate limit not exceeded, call the original handler
    const response = await handler(request, context);
    
    // Add rate limit headers to successful responses
    response.headers.set('X-RateLimit-Limit', config.maxRequests.toString());
    response.headers.set('X-RateLimit-Remaining', remaining.toString());
    response.headers.set('X-RateLimit-Reset', resetAt.toString());
    
    return response;
  };
}
