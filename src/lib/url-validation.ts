/**
 * URL Validation Utility
 * 
 * Validates external URLs against an allowlist to prevent SSRF attacks.
 * 
 * Security: H5 - Prevents server-side request forgery by restricting
 * which external domains the server can fetch from.
 */

/**
 * Allowed storage domains for external URL fetching.
 * Only URLs hosted on these domains (or their subdomains) are permitted.
 */
const ALLOWED_STORAGE_DOMAINS = [
  'pastebin.com',
  'imgbb.com',
  'i.ibb.co',
]

/**
 * Private/internal IP ranges that must never be accessed via SSRF
 */
const BLOCKED_IP_PATTERNS = [
  /^127\./,                    // Loopback
  /^10\./,                     // Private Class A
  /^172\.(1[6-9]|2\d|3[01])\./, // Private Class B
  /^192\.168\./,               // Private Class C
  /^169\.254\./,               // Link-local / Cloud metadata
  /^0\./,                      // Current network
  /^::1$/,                     // IPv6 loopback
  /^fc00:/,                    // IPv6 unique local
  /^fe80:/,                    // IPv6 link-local
]

/**
 * Validate that a URL is safe to fetch from the server.
 * 
 * Checks:
 * 1. URL is well-formed
 * 2. Protocol is HTTPS (or HTTP in development)
 * 3. Hostname is in the allowed domains list
 * 4. Hostname is not an IP address pointing to internal resources
 * 
 * @param url - The URL to validate
 * @param allowedDomains - Optional custom domain allowlist (defaults to ALLOWED_STORAGE_DOMAINS)
 * @returns Object with `valid` boolean and optional `error` message
 */
export function validateExternalUrl(
  url: string,
  allowedDomains: string[] = ALLOWED_STORAGE_DOMAINS
): { valid: boolean; error?: string } {
  try {
    const parsed = new URL(url)

    // Only allow HTTPS in production, HTTP allowed in development
    const allowHttp = process.env.NODE_ENV === 'development'
    if (parsed.protocol !== 'https:' && !(allowHttp && parsed.protocol === 'http:')) {
      return { valid: false, error: 'Only HTTPS URLs are allowed' }
    }

    const hostname = parsed.hostname.toLowerCase()

    // Block IP addresses that point to internal resources
    for (const pattern of BLOCKED_IP_PATTERNS) {
      if (pattern.test(hostname)) {
        return { valid: false, error: 'Internal URLs are not allowed' }
      }
    }

    // Block cloud metadata endpoint
    if (hostname === '169.254.169.254' || hostname === 'metadata.google.internal') {
      return { valid: false, error: 'Cloud metadata URLs are not allowed' }
    }

    // Check against allowed domains
    const isAllowed = allowedDomains.some(allowed => {
      const lowerAllowed = allowed.toLowerCase()
      return hostname === lowerAllowed || hostname.endsWith('.' + lowerAllowed)
    })

    if (!isAllowed) {
      return {
        valid: false,
        error: `Domain "${hostname}" is not in the allowed list`
      }
    }

    return { valid: true }
  } catch {
    return { valid: false, error: 'Invalid URL format' }
  }
}
