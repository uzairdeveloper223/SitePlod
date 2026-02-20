/**
 * Input Sanitization Utilities
 * 
 * Provides functions to sanitize user inputs and prevent XSS attacks.
 * Requirements: 24
 */

/**
 * Escape HTML special characters to prevent XSS
 * Requirements: 24
 */
export function escapeHtml(text: string): string {
  const htmlEscapeMap: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#x27;',
    '/': '&#x2F;',
  }

  return text.replace(/[&<>"'/]/g, (char) => htmlEscapeMap[char] || char)
}

/**
 * Sanitize username input
 * - Escape HTML characters
 * - Trim whitespace
 * - Limit length
 * Requirements: 24
 */
export function sanitizeUsername(username: string): string {
  if (!username) return ''
  
  // Trim and limit length
  let sanitized = username.trim().slice(0, 30)
  
  // Escape HTML
  sanitized = escapeHtml(sanitized)
  
  return sanitized
}

/**
 * Sanitize site name input
 * - Escape HTML characters
 * - Trim whitespace
 * - Limit length
 * Requirements: 24
 */
export function sanitizeSiteName(name: string): string {
  if (!name) return ''
  
  // Trim and limit length
  let sanitized = name.trim().slice(0, 100)
  
  // Escape HTML
  sanitized = escapeHtml(sanitized)
  
  return sanitized
}

/**
 * Sanitize file path to prevent path traversal
 * - Remove path traversal attempts (../)
 * - Remove leading slashes
 * - Remove special characters
 * Requirements: 24
 */
export function sanitizeFilePath(path: string): string {
  if (!path) return ''
  
  // Replace backslashes with forward slashes
  let sanitized = path.replace(/\\/g, '/')
  
  // Remove path traversal attempts
  sanitized = sanitized.replace(/\.\.\//g, '')
  sanitized = sanitized.replace(/\.\./g, '.')
  
  // Remove leading slashes
  sanitized = sanitized.replace(/^\/+/, '')
  
  // Remove null bytes
  sanitized = sanitized.replace(/\0/g, '')
  
  // Remove control characters
  sanitized = sanitized.replace(/[\x00-\x1F\x7F]/g, '')
  
  // Remove multiple consecutive slashes
  sanitized = sanitized.replace(/\/+/g, '/')
  
  // Remove trailing slashes
  sanitized = sanitized.replace(/\/+$/, '')
  
  return sanitized
}

/**
 * Sanitize email input
 * - Trim whitespace
 * - Convert to lowercase
 * - Basic validation
 * Requirements: 24
 */
export function sanitizeEmail(email: string): string {
  if (!email) return ''
  
  // Trim and lowercase
  return email.trim().toLowerCase()
}

/**
 * Sanitize slug input
 * - Convert to lowercase
 * - Remove invalid characters
 * - Replace spaces with hyphens
 * Requirements: 24
 */
export function sanitizeSlug(slug: string): string {
  if (!slug) return ''
  
  return slug
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9-]/g, '-') // Replace invalid chars with hyphens
    .replace(/--+/g, '-') // Replace multiple hyphens with single
    .replace(/^-+|-+$/g, '') // Remove leading/trailing hyphens
    .slice(0, 50) // Limit length
}

/**
 * Sanitize general text input
 * - Escape HTML
 * - Trim whitespace
 * Requirements: 24
 */
export function sanitizeText(text: string): string {
  if (!text) return ''
  
  return escapeHtml(text.trim())
}

/**
 * Validate and sanitize URL
 * - Check for valid URL format
 * - Ensure HTTPS protocol
 * Requirements: 24
 */
export function sanitizeUrl(url: string): string | null {
  if (!url) return null
  
  try {
    const parsed = new URL(url)
    
    // Only allow http and https protocols
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
      return null
    }
    
    return parsed.toString()
  } catch {
    return null
  }
}

/**
 * Remove potentially dangerous content from HTML
 * Note: This is a basic implementation. For production, consider using a library like DOMPurify
 * Requirements: 24
 */
export function sanitizeHtmlContent(html: string): string {
  if (!html) return ''
  
  // Remove script tags
  let sanitized = html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
  
  // Remove event handlers
  sanitized = sanitized.replace(/on\w+\s*=\s*["'][^"']*["']/gi, '')
  sanitized = sanitized.replace(/on\w+\s*=\s*[^\s>]*/gi, '')
  
  // Remove javascript: protocol
  sanitized = sanitized.replace(/javascript:/gi, '')
  
  // Remove data: protocol (can be used for XSS)
  sanitized = sanitized.replace(/data:text\/html/gi, '')
  
  return sanitized
}
