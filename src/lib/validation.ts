/**
 * Validation Utilities for SitePlod
 * 
 * Provides validation functions for forms and user input.
 */

/**
 * Validate email format
 */
export function validateEmail(email: string): { valid: boolean; error?: string } {
  if (!email) {
    return { valid: false, error: 'Email is required' }
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email)) {
    return { valid: false, error: 'Invalid email format' }
  }

  return { valid: true }
}

export type PasswordStrength = 'weak' | 'fair' | 'good' | 'strong'

export interface PasswordValidation {
  valid: boolean
  strength: PasswordStrength
  error?: string
  requirements: {
    minLength: boolean
    hasUppercase: boolean
    hasLowercase: boolean
    hasNumber: boolean
    hasSpecial: boolean
  }
}

/**
 * Validate password strength with detailed requirements
 */
export function validatePassword(password: string): PasswordValidation {
  const requirements = {
    minLength: password.length >= 8,
    hasUppercase: /[A-Z]/.test(password),
    hasLowercase: /[a-z]/.test(password),
    hasNumber: /\d/.test(password),
    hasSpecial: /[!@#$%^&*(),.?":{}|<>]/.test(password)
  }
  
  const metRequirements = Object.values(requirements).filter(Boolean).length
  
  let strength: PasswordStrength = 'weak'
  if (metRequirements >= 5) strength = 'strong'
  else if (metRequirements >= 4) strength = 'good'
  else if (metRequirements >= 3) strength = 'fair'
  
  const valid = requirements.minLength
  const error = !valid ? 'Password must be at least 8 characters' : undefined
  
  return {
    valid,
    strength,
    error,
    requirements
  }
}

/**
 * Validate slug format
 */
export function validateSlug(slug: string): { valid: boolean; error?: string } {
  if (!slug) {
    return { valid: false, error: 'Slug is required' }
  }

  if (slug.length < 3) {
    return { valid: false, error: 'Slug must be at least 3 characters' }
  }

  if (slug.length > 50) {
    return { valid: false, error: 'Slug must be less than 50 characters' }
  }

  const slugRegex = /^[a-z0-9-]+$/
  if (!slugRegex.test(slug)) {
    return {
      valid: false,
      error: 'Slug can only contain lowercase letters, numbers, and hyphens',
    }
  }

  if (slug.startsWith('-') || slug.endsWith('-')) {
    return { valid: false, error: 'Slug cannot start or end with a hyphen' }
  }

  if (slug.includes('--')) {
    return { valid: false, error: 'Slug cannot contain consecutive hyphens' }
  }

  return { valid: true }
}

/**
 * Validate username format
 */
export function validateUsername(username: string): { valid: boolean; error?: string } {
  if (!username) {
    return { valid: false, error: 'Username is required' }
  }

  if (username.length < 3) {
    return { valid: false, error: 'Username must be at least 3 characters' }
  }

  if (username.length > 30) {
    return { valid: false, error: 'Username must be less than 30 characters' }
  }

  const usernameRegex = /^[a-zA-Z0-9_-]+$/
  if (!usernameRegex.test(username)) {
    return {
      valid: false,
      error: 'Username can only contain letters, numbers, underscores, and hyphens',
    }
  }

  return { valid: true }
}

/**
 * Validate file type for upload
 */
export function validateFileType(filename: string): { valid: boolean; error?: string } {
  const validExtensions = ['.html', '.htm', '.zip']
  const extension = filename.toLowerCase().slice(filename.lastIndexOf('.'))

  if (!validExtensions.includes(extension)) {
    return {
      valid: false,
      error: 'Only HTML and ZIP files are allowed',
    }
  }

  return { valid: true }
}

/**
 * Validate file size
 */
export function validateFileSize(
  size: number,
  maxSizeMB = 50
): { valid: boolean; error?: string } {
  const maxSizeBytes = maxSizeMB * 1024 * 1024

  if (size > maxSizeBytes) {
    return {
      valid: false,
      error: `File size exceeds ${maxSizeMB}MB limit`,
    }
  }

  return { valid: true }
}

/**
 * Validate site name
 */
export function validateSiteName(name: string): { valid: boolean; error?: string } {
  if (!name) {
    return { valid: false, error: 'Site name is required' }
  }

  if (name.length < 1) {
    return { valid: false, error: 'Site name cannot be empty' }
  }

  if (name.length > 100) {
    return { valid: false, error: 'Site name must be less than 100 characters' }
  }

  return { valid: true }
}

/**
 * Format bytes to human-readable size
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes'

  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i]
}

/**
 * Sanitize slug (convert to valid format)
 */
export function sanitizeSlug(input: string): string {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, '-') // Replace invalid chars with hyphens
    .replace(/--+/g, '-') // Replace multiple hyphens with single
    .replace(/^-+|-+$/g, '') // Remove leading/trailing hyphens
    .slice(0, 50) // Limit length
}

/**
 * Allowed file extensions for site uploads
 */
export const ALLOWED_EXTENSIONS = [
  '.html', '.css', '.js',
  '.png', '.jpg', '.jpeg', '.gif', '.svg', '.webp', '.ico',
  '.woff', '.woff2', '.ttf', '.otf'
] as const

/**
 * Video file extensions that are explicitly rejected
 */
export const VIDEO_EXTENSIONS = [
  '.mp4', '.webm', '.ogg', '.avi', '.mov', '.wmv', '.flv', '.mkv'
] as const

/**
 * Validate file extension against allowed list and reject video files
 * Requirements: 5
 */
export function validateFileExtension(filename: string): { valid: boolean; error?: string } {
  if (!filename) {
    return { valid: false, error: 'Filename is required' }
  }

  const lastDotIndex = filename.lastIndexOf('.')
  
  // No extension found or file starts with dot (hidden file)
  if (lastDotIndex === -1 || lastDotIndex === 0) {
    return { valid: false, error: 'File must have a valid extension' }
  }

  const extension = filename.toLowerCase().slice(lastDotIndex).trim()

  // Extension is just a dot or empty after trimming
  if (extension === '.' || extension.length <= 1) {
    return { valid: false, error: 'File must have a valid extension' }
  }

  // Check if it's a video file (explicitly rejected)
  if (VIDEO_EXTENSIONS.includes(extension as any)) {
    return {
      valid: false,
      error: `Video files (${extension}) are not supported`
    }
  }

  // Check if extension is in allowed list
  if (!ALLOWED_EXTENSIONS.includes(extension as any)) {
    return {
      valid: false,
      error: `File type ${extension} is not allowed. Allowed types: ${ALLOWED_EXTENSIONS.join(', ')}`
    }
  }

  return { valid: true }
}

/**
 * Detect video file references in text content
 * Scans text for any references to video file extensions
 * Requirements: 5
 */
export function detectVideoReferences(content: string): { 
  hasVideoReferences: boolean
  references: string[]
} {
  if (!content) {
    return { hasVideoReferences: false, references: [] }
  }

  const foundReferences: string[] = []
  const contentLower = content.toLowerCase()

  // Check for each video extension in the content
  for (const extension of VIDEO_EXTENSIONS) {
    if (contentLower.includes(extension)) {
      foundReferences.push(extension)
    }
  }

  return {
    hasVideoReferences: foundReferences.length > 0,
    references: foundReferences
  }
}

/**
 * Sanitize filename to prevent path traversal and remove special characters
 * Requirements: 5, 24
 */
export function sanitizeFilename(filename: string): string {
  if (!filename) {
    return ''
  }

  // Replace backslashes with forward slashes first for consistent handling
  let sanitized = filename.replace(/\\/g, '/')
  
  // Remove path traversal attempts (../)
  sanitized = sanitized.replace(/\.\.\//g, '')
  
  // Remove any remaining .. patterns
  sanitized = sanitized.replace(/\.\./g, '.')
  
  // Remove leading slashes
  sanitized = sanitized.replace(/^\/+/, '')
  
  // Remove any null bytes
  sanitized = sanitized.replace(/\0/g, '')
  
  // Remove control characters (ASCII 0-31 and 127)
  sanitized = sanitized.replace(/[\x00-\x1F\x7F]/g, '')
  
  // Remove special characters that could cause issues, but keep:
  // - alphanumeric characters
  // - dots (for extensions)
  // - hyphens and underscores
  // - forward slashes (for paths within the site)
  sanitized = sanitized.replace(/[^a-zA-Z0-9._\-/]/g, '_')
  
  // Remove any double dots that might remain (but keep single dots for extensions)
  sanitized = sanitized.replace(/\.\.+/g, '.')
  
  // Remove multiple consecutive underscores
  sanitized = sanitized.replace(/_+/g, '_')
  
  // Remove multiple consecutive slashes
  sanitized = sanitized.replace(/\/+/g, '/')
  
  // Remove standalone slashes (slashes not part of a path)
  sanitized = sanitized.replace(/\/_/g, '_')
  sanitized = sanitized.replace(/_\//g, '_')
  
  // Remove trailing slashes
  sanitized = sanitized.replace(/\/+$/, '')
  
  // Remove leading dots and slashes that might remain
  sanitized = sanitized.replace(/^[./]+/, '')
  
  // Check if filename is only underscores or dots (meaningless)
  if (/^[._]+$/.test(sanitized)) {
    return 'unnamed'
  }
  
  // Ensure the filename is not empty after sanitization
  if (!sanitized) {
    return 'unnamed'
  }
  
  return sanitized
}

/**
 * Get MIME type from file extension
 */
export function getMimeType(filename: string): string {
  const extension = filename.toLowerCase().slice(filename.lastIndexOf('.'))

  const mimeTypes: Record<string, string> = {
    '.html': 'text/html',
    '.htm': 'text/html',
    '.css': 'text/css',
    '.js': 'application/javascript',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.webp': 'image/webp',
    '.ico': 'image/x-icon',
    '.woff': 'font/woff',
    '.woff2': 'font/woff2',
    '.ttf': 'font/ttf',
    '.otf': 'font/otf',
    '.txt': 'text/plain',
    '.pdf': 'application/pdf',
    '.zip': 'application/zip',
  }

  return mimeTypes[extension] || 'application/octet-stream'
}
