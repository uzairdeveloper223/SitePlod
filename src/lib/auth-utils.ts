/**
 * Authentication Utilities
 * 
 * This module provides JWT token verification and authentication helpers.
 * Uses Supabase Auth for token validation.
 * 
 * Requirements: 2, 3, 4
 */

import { createAuthClient } from './supabase'

/**
 * Error thrown when token verification fails
 */
export class AuthError extends Error {
  constructor(message: string, public statusCode: number = 401) {
    super(message)
    this.name = 'AuthError'
  }
}

/**
 * Verify JWT token and return user ID
 * 
 * Uses Supabase auth.getUser() to verify the token.
 * Handles token expiration and invalid tokens.
 * 
 * @param token - JWT access token from Authorization header
 * @returns User ID if token is valid
 * @throws AuthError if token is invalid, expired, or missing
 * 
 * @example
 * ```typescript
 * try {
 *   const userId = await verifyToken(token)
 *   // Use userId for authorization
 * } catch (error) {
 *   if (error instanceof AuthError) {
 *     return NextResponse.json(
 *       { error: 'Unauthorized', message: error.message, statusCode: error.statusCode },
 *       { status: error.statusCode }
 *     )
 *   }
 * }
 * ```
 */
export async function verifyToken(token: string): Promise<string> {
  if (!token || token.trim() === '') {
    throw new AuthError('No token provided', 401)
  }

  try {
    const supabase = createAuthClient(token)
    
    const { data, error } = await supabase.auth.getUser()
    
    if (error) {
      // Handle specific Supabase auth errors
      if (error.message.includes('expired')) {
        throw new AuthError('Token has expired', 401)
      }
      if (error.message.includes('invalid')) {
        throw new AuthError('Invalid token', 401)
      }
      throw new AuthError(error.message, 401)
    }
    
    if (!data.user) {
      throw new AuthError('Invalid token', 401)
    }
    
    return data.user.id
  } catch (error) {
    // Re-throw AuthError as-is
    if (error instanceof AuthError) {
      throw error
    }
    
    // Wrap other errors
    const message = error instanceof Error ? error.message : 'Token verification failed'
    throw new AuthError(message, 401)
  }
}

/**
 * Authentication middleware for API routes
 * 
 * Extracts JWT token from Authorization header and verifies it.
 * Returns the authenticated user ID or throws an AuthError.
 * 
 * @param request - Next.js request object
 * @returns User ID if authentication succeeds
 * @throws AuthError if authentication fails
 * 
 * Requirements: 10, 11, 12, 13, 17, 18, 19
 * 
 * @example
 * ```typescript
 * export async function GET(request: NextRequest) {
 *   try {
 *     const userId = await requireAuth(request)
 *     // User is authenticated, proceed with request
 *   } catch (error) {
 *     if (error instanceof AuthError) {
 *       return NextResponse.json(
 *         { error: 'Unauthorized', message: error.message, statusCode: error.statusCode },
 *         { status: error.statusCode }
 *       )
 *     }
 *   }
 * }
 * ```
 */
export async function requireAuth(request: Request): Promise<string> {
  const authHeader = request.headers.get('authorization')
  
  if (!authHeader) {
    throw new AuthError('No authorization header provided', 401)
  }
  
  // Check if header starts with "Bearer " (case-insensitive)
  if (!/^Bearer\s+/i.test(authHeader)) {
    throw new AuthError('Invalid authorization header format. Expected: Bearer <token>', 401)
  }
  
  // Extract token from "Bearer <token>" format
  const token = authHeader.replace(/^Bearer\s+/i, '').trim()
  
  return await verifyToken(token)
}
