/**
 * Rate Limiter Utility
 * 
 * Implements in-memory rate limiting per IP address.
 * For production, consider using Redis for distributed rate limiting.
 */

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

interface RateLimitConfig {
  maxRequests: number;
  windowMs: number;
}

// In-memory store for rate limit tracking
const rateLimitStore = new Map<string, RateLimitEntry>();

// Cleanup old entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of rateLimitStore.entries()) {
    if (entry.resetAt < now) {
      rateLimitStore.delete(key);
    }
  }
}, 5 * 60 * 1000);

/**
 * Check if a request should be rate limited
 * 
 * @param identifier - Unique identifier (typically IP address)
 * @param endpoint - Endpoint name for separate rate limit tracking
 * @param config - Rate limit configuration
 * @returns Object with allowed status and remaining requests
 */
export function checkRateLimit(
  identifier: string,
  endpoint: string,
  config: RateLimitConfig
): { allowed: boolean; remaining: number; resetAt: number } {
  const key = `${endpoint}:${identifier}`;
  const now = Date.now();
  
  const entry = rateLimitStore.get(key);
  
  // No entry or expired entry - allow and create new
  if (!entry || entry.resetAt < now) {
    const resetAt = now + config.windowMs;
    rateLimitStore.set(key, {
      count: 1,
      resetAt
    });
    
    return {
      allowed: true,
      remaining: config.maxRequests - 1,
      resetAt
    };
  }
  
  // Entry exists and not expired
  if (entry.count >= config.maxRequests) {
    return {
      allowed: false,
      remaining: 0,
      resetAt: entry.resetAt
    };
  }
  
  // Increment count
  entry.count++;
  rateLimitStore.set(key, entry);
  
  return {
    allowed: true,
    remaining: config.maxRequests - entry.count,
    resetAt: entry.resetAt
  };
}

/**
 * Predefined rate limit configurations per endpoint
 */
export const RATE_LIMITS = {
  login: {
    maxRequests: 5,
    windowMs: 60 * 1000 // 1 minute
  },
  register: {
    maxRequests: 3,
    windowMs: 60 * 60 * 1000 // 1 hour
  },
  checkSlug: {
    maxRequests: 10,
    windowMs: 60 * 1000 // 1 minute
  },
  createSite: {
    maxRequests: 5,
    windowMs: 60 * 60 * 1000 // 1 hour
  },
  uploadFile: {
    maxRequests: 10,
    windowMs: 60 * 60 * 1000 // 1 hour
  }
} as const;

/**
 * Get client IP address from request headers
 * 
 * @param headers - Request headers
 * @returns IP address or 'unknown'
 */
export function getClientIp(headers: Headers): string {
  // Check common headers for IP address
  const forwardedFor = headers.get('x-forwarded-for');
  if (forwardedFor) {
    // x-forwarded-for can contain multiple IPs, take the first one
    return forwardedFor.split(',')[0].trim();
  }
  
  const realIp = headers.get('x-real-ip');
  if (realIp) {
    return realIp;
  }
  
  // Fallback to unknown if no IP found
  return 'unknown';
}

/**
 * Reset rate limit for a specific identifier and endpoint
 * Useful for testing or manual intervention
 * 
 * @param identifier - Unique identifier
 * @param endpoint - Endpoint name
 */
export function resetRateLimit(identifier: string, endpoint: string): void {
  const key = `${endpoint}:${identifier}`;
  rateLimitStore.delete(key);
}

/**
 * Clear all rate limit entries
 * Useful for testing
 */
export function clearAllRateLimits(): void {
  rateLimitStore.clear();
}
