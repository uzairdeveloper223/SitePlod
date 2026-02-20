/**
 * Image Detection Utility
 * 
 * Detects local image references in HTML content that need to be uploaded
 */

/**
 * Image reference information
 */
export interface ImageReference {
  path: string
  attribute: string // 'src', 'href', 'srcset', etc.
  element: string // 'img', 'link', 'source', etc.
}

/**
 * Image extensions to detect
 */
const IMAGE_EXTENSIONS = ['.png', '.jpg', '.jpeg', '.gif', '.svg', '.webp', '.ico', '.bmp']

/**
 * Detect local image references in HTML content
 * 
 * @param htmlContent - HTML content to scan
 * @returns Array of unique local image paths
 */
export function detectLocalImages(htmlContent: string): ImageReference[] {
  const references: ImageReference[] = []
  const seenPaths = new Set<string>()

  // Patterns to match image references
  const patterns = [
    // <img src="...">
    /<img[^>]+src=["']([^"']+)["']/gi,
    // <link rel="icon" href="...">
    /<link[^>]+href=["']([^"']+)["'][^>]*>/gi,
    // <source srcset="...">
    /<source[^>]+srcset=["']([^"']+)["']/gi,
    // CSS background: url(...)
    /background(?:-image)?:\s*url\(["']?([^"')]+)["']?\)/gi,
    // CSS content: url(...)
    /content:\s*url\(["']?([^"')]+)["']?\)/gi,
  ]

  patterns.forEach((pattern, index) => {
    let match
    while ((match = pattern.exec(htmlContent)) !== null) {
      const url = match[1].trim()
      
      // Check if it's a local path (not http://, https://, data:, //)
      if (isLocalPath(url) && isImageFile(url)) {
        const normalizedPath = normalizePath(url)
        
        if (!seenPaths.has(normalizedPath)) {
          seenPaths.add(normalizedPath)
          
          // Determine element type
          let element = 'unknown'
          let attribute = 'src'
          
          if (index === 0) {
            element = 'img'
            attribute = 'src'
          } else if (index === 1) {
            element = 'link'
            attribute = 'href'
          } else if (index === 2) {
            element = 'source'
            attribute = 'srcset'
          } else {
            element = 'css'
            attribute = 'url'
          }
          
          references.push({
            path: normalizedPath,
            attribute,
            element
          })
        }
      }
    }
  })

  return references
}

/**
 * Check if a URL is a local path
 */
function isLocalPath(url: string): boolean {
  // Exclude external URLs
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return false
  }
  
  // Exclude data URLs
  if (url.startsWith('data:')) {
    return false
  }
  
  // Exclude protocol-relative URLs
  if (url.startsWith('//')) {
    return false
  }
  
  // Exclude absolute URLs starting with /
  // (these might be CDN or external resources)
  if (url.startsWith('/') && !url.startsWith('./') && !url.startsWith('../')) {
    // Could be local, but we'll be conservative
    return true
  }
  
  return true
}

/**
 * Check if a path is an image file
 */
function isImageFile(path: string): boolean {
  const lowerPath = path.toLowerCase()
  
  // Remove query strings and fragments
  const cleanPath = lowerPath.split('?')[0].split('#')[0]
  
  return IMAGE_EXTENSIONS.some(ext => cleanPath.endsWith(ext))
}

/**
 * Normalize a file path
 * Removes ./ and ../ and query strings
 */
function normalizePath(path: string): string {
  // Remove query strings and fragments
  let cleanPath = path.split('?')[0].split('#')[0]
  
  // Remove leading ./
  if (cleanPath.startsWith('./')) {
    cleanPath = cleanPath.substring(2)
  }
  
  // Handle ../ (just remove for now, proper handling would need context)
  cleanPath = cleanPath.replace(/\.\.\//g, '')
  
  return cleanPath
}

/**
 * Extract unique image filenames from references
 */
export function getUniqueImagePaths(references: ImageReference[]): string[] {
  return Array.from(new Set(references.map(ref => ref.path)))
}
