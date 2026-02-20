/**
 * URL Replacement Utility
 * 
 * Handles replacing local image paths with hosted URLs in HTML/CSS/JS files
 * Requirements: 6
 */

/**
 * Error thrown when URL replacement fails
 */
export class URLReplacementError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'URLReplacementError'
  }
}

/**
 * Mapping of original asset paths to hosted URLs
 */
export type AssetUrlMapping = Record<string, string>

/**
 * Replace asset URLs in text content with hosted URLs
 * 
 * Finds all asset references in HTML/CSS/JS and replaces them with
 * hosted URLs from the provided mapping. Handles various path formats:
 * - Absolute paths: /assets/style.css
 * - Relative paths: ./assets/style.css
 * - Parent paths: ../assets/style.css
 * - Direct references: style.css
 * 
 * @param content - Text content (HTML, CSS, or JS)
 * @param assetUrlMap - Mapping of original paths to hosted URLs
 * @returns Content with replaced asset URLs
 * @throws URLReplacementError if content is invalid
 * 
 * Requirements: 6
 */
export function replaceAssetUrls(
  content: string,
  assetUrlMap: AssetUrlMapping
): string {
  // Validate inputs
  if (typeof content !== 'string') {
    throw new URLReplacementError('Content must be a string')
  }

  if (!assetUrlMap || typeof assetUrlMap !== 'object' || Array.isArray(assetUrlMap)) {
    throw new URLReplacementError('Asset URL mapping must be an object')
  }

  // If no mappings, return content unchanged
  if (Object.keys(assetUrlMap).length === 0) {
    return content
  }

  let replacedContent = content

  // Process each asset path in the mapping
  for (const [originalPath, hostedUrl] of Object.entries(assetUrlMap)) {
    if (!originalPath || !hostedUrl) {
      continue
    }

    // Normalize the original path (remove leading ./)
    const normalizedPath = originalPath.replace(/^\.\//, '')

    // Create patterns for different path formats
    // Order matters: replace longer/more specific patterns first to avoid double replacement
    const patterns: string[] = []

    // Add patterns in order of specificity (longest first)
    if (normalizedPath !== originalPath) {
      // If originalPath had ./, add patterns with ../ and ./
      patterns.push('../' + normalizedPath)
      patterns.push('./' + normalizedPath)
      patterns.push(originalPath) // This is the original with ./
    } else {
      // originalPath didn't have ./, so add patterns
      patterns.push('../' + normalizedPath)
      patterns.push('./' + normalizedPath)
    }

    // Always add the normalized path last (shortest, most general)
    patterns.push(normalizedPath)

    // Remove duplicates while preserving order
    const uniquePatterns = [...new Set(patterns)]

    // Replace all occurrences of each pattern
    // We process patterns in order, and once replaced, the URL won't match again
    for (const pattern of uniquePatterns) {
      // Use regex with word boundaries to avoid partial matches
      // Match the pattern only when it's not part of a longer word
      const escapedPattern = escapeRegExp(pattern)
      // Use negative lookbehind and lookahead to avoid matching within words
      // Match pattern that is preceded by quote, paren, backtick, or whitespace
      // and followed by quote, paren, backtick, whitespace, or end
      const regex = new RegExp(
        `(["'\`(\\s]|^)(${escapedPattern})(?=["'\`)\\s]|$)`,
        'g'
      )

      replacedContent = replacedContent.replace(regex, `$1${hostedUrl}`)
    }
  }

  return replacedContent
}

/**
 * Escape special regex characters in a string
 * 
 * @param str - String to escape
 * @returns Escaped string safe for use in RegExp
 */
function escapeRegExp(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}
