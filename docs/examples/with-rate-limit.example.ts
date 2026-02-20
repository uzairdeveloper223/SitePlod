/**
 * Example Usage of withRateLimit Middleware
 * 
 * This file demonstrates how to use the withRateLimit HOF
 * to add rate limiting to your API routes.
 */

import { NextRequest, NextResponse } from 'next/server';
import { withRateLimit } from './with-rate-limit';

// Example 1: Login endpoint with rate limiting (5 requests per minute)
export const POST = withRateLimit(
  async (request: NextRequest) => {
    const body = await request.json();
    
    // Your login logic here
    // ...
    
    return NextResponse.json({
      success: true,
      message: 'Login successful'
    });
  },
  'login'
);

// Example 2: Registration endpoint with rate limiting (3 requests per hour)
export const registerHandler = withRateLimit(
  async (request: NextRequest) => {
    const body = await request.json();
    
    // Your registration logic here
    // ...
    
    return NextResponse.json({
      success: true,
      message: 'Registration successful'
    });
  },
  'register'
);

// Example 3: Check slug endpoint with rate limiting (10 requests per minute)
export const checkSlugHandler = withRateLimit(
  async (request: NextRequest) => {
    const { searchParams } = new URL(request.url);
    const slug = searchParams.get('slug');
    
    // Your slug checking logic here
    // ...
    
    return NextResponse.json({
      available: true
    });
  },
  'checkSlug'
);

// Example 4: Create site endpoint with rate limiting (5 requests per hour)
export const createSiteHandler = withRateLimit(
  async (request: NextRequest) => {
    const body = await request.json();
    
    // Your site creation logic here
    // ...
    
    return NextResponse.json({
      success: true,
      siteId: 'abc123'
    });
  },
  'createSite'
);

// Example 5: File upload endpoint with rate limiting (10 requests per hour)
export const uploadFileHandler = withRateLimit(
  async (request: NextRequest) => {
    const formData = await request.formData();
    
    // Your file upload logic here
    // ...
    
    return NextResponse.json({
      success: true,
      fileId: 'file123'
    });
  },
  'uploadFile'
);

/**
 * Rate Limit Response Format
 * 
 * When rate limit is exceeded, the middleware returns:
 * 
 * Status: 429 Too Many Requests
 * 
 * Headers:
 * - Retry-After: Seconds until rate limit resets
 * - X-RateLimit-Limit: Maximum requests allowed
 * - X-RateLimit-Remaining: Requests remaining (0 when exceeded)
 * - X-RateLimit-Reset: Timestamp when rate limit resets
 * 
 * Body:
 * {
 *   "error": "Rate limit exceeded",
 *   "message": "Too many requests. Please try again after 2024-01-01T12:00:00.000Z",
 *   "statusCode": 429,
 *   "retryAfter": 60
 * }
 * 
 * 
 * Rate Limit Headers on Success
 * 
 * All successful responses include:
 * - X-RateLimit-Limit: Maximum requests allowed
 * - X-RateLimit-Remaining: Requests remaining in current window
 * - X-RateLimit-Reset: Timestamp when rate limit resets
 */
