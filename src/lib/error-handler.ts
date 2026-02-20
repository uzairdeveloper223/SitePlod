/**
 * Error Handling Middleware for SitePlod
 * 
 * Provides consistent error handling and user-friendly error messages
 * for all API errors across the application.
 */

import { ApiError } from './api-client'

/**
 * Map API errors to user-friendly messages
 */
export function handleApiError(error: unknown): string {
  // Handle ApiError instances
  if (error instanceof ApiError) {
    switch (error.statusCode) {
      case 401:
        // Redirect to login for unauthorized requests
        if (typeof window !== 'undefined') {
          // Store the current path to redirect back after login
          const currentPath = window.location.pathname
          if (currentPath !== '/') {
            localStorage.setItem('redirect_after_login', currentPath)
          }
          // Clear the invalid token
          localStorage.removeItem('auth_token')
        }
        return 'Please log in to continue'

      case 403:
        return 'You do not have permission to perform this action'

      case 404:
        return 'The requested resource was not found'

      case 429:
        return 'Too many requests. Please try again in a moment'

      case 500:
        return 'A server error occurred. Please try again later'

      case 502:
      case 503:
      case 504:
        return 'The server is temporarily unavailable. Please try again later'

      default:
        // Return the specific error message from the API
        return error.message || 'An error occurred'
    }
  }

  // Handle network errors
  if (error instanceof TypeError && error.message.includes('fetch')) {
    return 'Connection failed. Please check your internet connection'
  }

  // Handle generic Error instances
  if (error instanceof Error) {
    return error.message
  }

  // Fallback for unknown error types
  return 'An unexpected error occurred'
}

/**
 * Check if an error is a network error
 */
export function isNetworkError(error: unknown): boolean {
  if (error instanceof ApiError) {
    return error.statusCode === 0
  }
  if (error instanceof TypeError && error.message.includes('fetch')) {
    return true
  }
  return false
}

/**
 * Check if an error is an authentication error
 */
export function isAuthError(error: unknown): boolean {
  if (error instanceof ApiError) {
    return error.statusCode === 401 || error.statusCode === 403
  }
  return false
}

/**
 * Check if an error is a validation error
 */
export function isValidationError(error: unknown): boolean {
  if (error instanceof ApiError) {
    return error.statusCode === 400 || error.statusCode === 422
  }
  return false
}

/**
 * Check if an error is a server error
 */
export function isServerError(error: unknown): boolean {
  if (error instanceof ApiError) {
    return error.statusCode >= 500
  }
  return false
}

/**
 * Get a retry-friendly error message
 */
export function getRetryMessage(error: unknown): string | null {
  if (isNetworkError(error) || isServerError(error)) {
    return 'This might be a temporary issue. Would you like to try again?'
  }
  return null
}

/**
 * Format validation errors for display
 */
export function formatValidationError(error: unknown): string {
  if (error instanceof ApiError && isValidationError(error)) {
    // The API should return detailed validation messages
    return error.message
  }
  return 'Please check your input and try again'
}
