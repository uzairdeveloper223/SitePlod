/**
 * API Error Response Utilities
 * 
 * Provides consistent error response formatting across all API endpoints.
 * Requirements: 22
 */

import { NextResponse } from 'next/server'

export interface ErrorResponse {
  error: string
  message: string
  statusCode: number
}

/**
 * Create a consistent error response
 */
export function createErrorResponse(
  error: string,
  message: string,
  statusCode: number
): NextResponse<ErrorResponse> {
  // Log error for debugging
  console.error(`[API Error ${statusCode}] ${error}: ${message}`)

  return NextResponse.json(
    {
      error,
      message,
      statusCode
    },
    { status: statusCode }
  )
}

/**
 * Common error responses
 */
export const ErrorResponses = {
  // 400 - Bad Request
  badRequest: (message: string) => 
    createErrorResponse('Bad request', message, 400),
  
  validationError: (message: string) =>
    createErrorResponse('Validation error', message, 400),
  
  missingField: (field: string) =>
    createErrorResponse('Missing field', `${field} is required`, 400),
  
  invalidFormat: (field: string) =>
    createErrorResponse('Invalid format', `${field} has invalid format`, 400),

  // 401 - Unauthorized
  unauthorized: (message: string = 'Authentication required') =>
    createErrorResponse('Unauthorized', message, 401),
  
  invalidToken: () =>
    createErrorResponse('Unauthorized', 'Invalid or expired token', 401),
  
  missingToken: () =>
    createErrorResponse('Unauthorized', 'No authorization token provided', 401),

  // 403 - Forbidden
  forbidden: (message: string = 'You do not have permission to perform this action') =>
    createErrorResponse('Forbidden', message, 403),
  
  notOwner: () =>
    createErrorResponse('Forbidden', 'You do not own this resource', 403),

  // 404 - Not Found
  notFound: (resource: string = 'Resource') =>
    createErrorResponse('Not found', `${resource} not found`, 404),

  // 409 - Conflict
  conflict: (message: string) =>
    createErrorResponse('Conflict', message, 409),
  
  alreadyExists: (resource: string) =>
    createErrorResponse('Conflict', `${resource} already exists`, 409),

  // 429 - Too Many Requests
  rateLimitExceeded: (message: string = 'Too many requests. Please try again later') =>
    createErrorResponse('Rate limit exceeded', message, 429),

  // 500 - Internal Server Error
  serverError: (message: string = 'An unexpected error occurred') =>
    createErrorResponse('Server error', message, 500),
  
  databaseError: (message: string = 'Database operation failed') =>
    createErrorResponse('Database error', message, 500),
  
  externalServiceError: (service: string) =>
    createErrorResponse('External service error', `Failed to communicate with ${service}`, 500),
}

/**
 * Handle caught errors and convert to error responses
 */
export function handleError(error: unknown): NextResponse<ErrorResponse> {
  // Handle known error types
  if (error instanceof Error) {
    // Check for specific error types
    if ('statusCode' in error && typeof error.statusCode === 'number') {
      return createErrorResponse(
        error.name,
        error.message,
        error.statusCode as number
      )
    }

    // Default to 500 for unknown errors
    return ErrorResponses.serverError(error.message)
  }

  // Handle string errors
  if (typeof error === 'string') {
    return ErrorResponses.serverError(error)
  }

  // Unknown error type
  return ErrorResponses.serverError('An unexpected error occurred')
}
