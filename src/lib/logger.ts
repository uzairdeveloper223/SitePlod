/**
 * Secure Logger Utility
 * 
 * Provides logging that sanitizes PII (emails, user IDs) in production.
 * In development, full details are logged for debugging convenience.
 * 
 * Security: H2 - Prevents sensitive data from leaking into production logs.
 */

const isDev = process.env.NODE_ENV === 'development'

/**
 * Mask an email address for safe logging
 * e.g. "user@example.com" -> "u***@e***.com"
 */
function maskEmail(email: string): string {
  const [local, domain] = email.split('@')
  if (!domain) return '***'
  const domainParts = domain.split('.')
  const maskedLocal = local[0] + '***'
  const maskedDomain = domainParts[0][0] + '***.' + domainParts.slice(1).join('.')
  return `${maskedLocal}@${maskedDomain}`
}

/**
 * Mask a user ID for safe logging
 * e.g. "abc12345-6789-..." -> "abc1****"
 */
function maskId(id: string): string {
  if (id.length <= 4) return '****'
  return id.substring(0, 4) + '****'
}

/**
 * Recursively sanitize an object, masking fields that look like PII
 */
function sanitizeData(data: unknown): unknown {
  if (data === null || data === undefined) return data
  if (typeof data === 'string') return data
  if (typeof data !== 'object') return data

  if (data instanceof Error) {
    return {
      message: data.message,
      name: data.name,
      // Don't include stack traces in production
      ...(isDev ? { stack: data.stack } : {})
    }
  }

  if (Array.isArray(data)) {
    return data.map(sanitizeData)
  }

  const sanitized: Record<string, unknown> = {}
  for (const [key, value] of Object.entries(data as Record<string, unknown>)) {
    const lowerKey = key.toLowerCase()
    if (lowerKey === 'email' && typeof value === 'string') {
      sanitized[key] = maskEmail(value)
    } else if ((lowerKey === 'id' || lowerKey === 'user_id' || lowerKey === 'userid') && typeof value === 'string') {
      sanitized[key] = maskId(value)
    } else if (lowerKey === 'password' || lowerKey === 'token' || lowerKey === 'secret' || lowerKey === 'access_token') {
      sanitized[key] = '[REDACTED]'
    } else {
      sanitized[key] = sanitizeData(value)
    }
  }
  return sanitized
}

export const logger = {
  /**
   * Log informational messages. In production, PII is masked.
   * In development, full data is logged.
   */
  info: (message: string, ...args: unknown[]) => {
    if (isDev) {
      console.log(`[INFO] ${message}`, ...args)
    } else {
      const sanitizedArgs = args.map(sanitizeData)
      console.log(`[INFO] ${message}`, ...sanitizedArgs)
    }
  },

  /**
   * Log warning messages. In production, PII is masked.
   */
  warn: (message: string, ...args: unknown[]) => {
    if (isDev) {
      console.warn(`[WARN] ${message}`, ...args)
    } else {
      const sanitizedArgs = args.map(sanitizeData)
      console.warn(`[WARN] ${message}`, ...sanitizedArgs)
    }
  },

  /**
   * Log error messages. In production, PII is masked and stack traces are omitted.
   */
  error: (message: string, ...args: unknown[]) => {
    if (isDev) {
      console.error(`[ERROR] ${message}`, ...args)
    } else {
      const sanitizedArgs = args.map(sanitizeData)
      console.error(`[ERROR] ${message}`, ...sanitizedArgs)
    }
  },

  /**
   * Log debug messages. Only logs in development.
   */
  debug: (message: string, ...args: unknown[]) => {
    if (isDev) {
      console.log(`[DEBUG] ${message}`, ...args)
    }
  }
}
