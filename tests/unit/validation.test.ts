/**
 * Unit tests for validation utilities
 * 
 * Tests file extension validation, video file rejection, and other validation functions
 */

import { describe, it, expect } from 'vitest'
import { 
  validateFileExtension, 
  ALLOWED_EXTENSIONS, 
  VIDEO_EXTENSIONS,
  detectVideoReferences,
  sanitizeFilename,
  getMimeType
} from '@/lib/validation'

describe('validateFileExtension', () => {
  describe('valid file extensions', () => {
    it('should accept HTML files', () => {
      const result = validateFileExtension('index.html')
      expect(result.valid).toBe(true)
      expect(result.error).toBeUndefined()
    })

    it('should accept CSS files', () => {
      const result = validateFileExtension('styles.css')
      expect(result.valid).toBe(true)
      expect(result.error).toBeUndefined()
    })

    it('should accept JavaScript files', () => {
      const result = validateFileExtension('script.js')
      expect(result.valid).toBe(true)
      expect(result.error).toBeUndefined()
    })

    it('should accept PNG images', () => {
      const result = validateFileExtension('image.png')
      expect(result.valid).toBe(true)
      expect(result.error).toBeUndefined()
    })

    it('should accept JPG images', () => {
      const result = validateFileExtension('photo.jpg')
      expect(result.valid).toBe(true)
      expect(result.error).toBeUndefined()
    })

    it('should accept JPEG images', () => {
      const result = validateFileExtension('photo.jpeg')
      expect(result.valid).toBe(true)
      expect(result.error).toBeUndefined()
    })

    it('should accept GIF images', () => {
      const result = validateFileExtension('animation.gif')
      expect(result.valid).toBe(true)
      expect(result.error).toBeUndefined()
    })

    it('should accept SVG images', () => {
      const result = validateFileExtension('icon.svg')
      expect(result.valid).toBe(true)
      expect(result.error).toBeUndefined()
    })

    it('should accept WEBP images', () => {
      const result = validateFileExtension('modern.webp')
      expect(result.valid).toBe(true)
      expect(result.error).toBeUndefined()
    })

    it('should accept ICO files', () => {
      const result = validateFileExtension('favicon.ico')
      expect(result.valid).toBe(true)
      expect(result.error).toBeUndefined()
    })

    it('should accept WOFF fonts', () => {
      const result = validateFileExtension('font.woff')
      expect(result.valid).toBe(true)
      expect(result.error).toBeUndefined()
    })

    it('should accept WOFF2 fonts', () => {
      const result = validateFileExtension('font.woff2')
      expect(result.valid).toBe(true)
      expect(result.error).toBeUndefined()
    })

    it('should accept TTF fonts', () => {
      const result = validateFileExtension('font.ttf')
      expect(result.valid).toBe(true)
      expect(result.error).toBeUndefined()
    })

    it('should accept OTF fonts', () => {
      const result = validateFileExtension('font.otf')
      expect(result.valid).toBe(true)
      expect(result.error).toBeUndefined()
    })

    it('should handle uppercase extensions', () => {
      const result = validateFileExtension('INDEX.HTML')
      expect(result.valid).toBe(true)
      expect(result.error).toBeUndefined()
    })

    it('should handle mixed case extensions', () => {
      const result = validateFileExtension('MyFile.JpEg')
      expect(result.valid).toBe(true)
      expect(result.error).toBeUndefined()
    })

    it('should handle files with paths', () => {
      const result = validateFileExtension('assets/images/logo.png')
      expect(result.valid).toBe(true)
      expect(result.error).toBeUndefined()
    })
  })

  describe('video file rejection', () => {
    it('should reject MP4 files', () => {
      const result = validateFileExtension('video.mp4')
      expect(result.valid).toBe(false)
      expect(result.error).toContain('Video files')
      expect(result.error).toContain('.mp4')
    })

    it('should reject WEBM files', () => {
      const result = validateFileExtension('video.webm')
      expect(result.valid).toBe(false)
      expect(result.error).toContain('Video files')
      expect(result.error).toContain('.webm')
    })

    it('should reject OGG files', () => {
      const result = validateFileExtension('video.ogg')
      expect(result.valid).toBe(false)
      expect(result.error).toContain('Video files')
      expect(result.error).toContain('.ogg')
    })

    it('should reject AVI files', () => {
      const result = validateFileExtension('video.avi')
      expect(result.valid).toBe(false)
      expect(result.error).toContain('Video files')
      expect(result.error).toContain('.avi')
    })

    it('should reject MOV files', () => {
      const result = validateFileExtension('video.mov')
      expect(result.valid).toBe(false)
      expect(result.error).toContain('Video files')
      expect(result.error).toContain('.mov')
    })

    it('should reject WMV files', () => {
      const result = validateFileExtension('video.wmv')
      expect(result.valid).toBe(false)
      expect(result.error).toContain('Video files')
      expect(result.error).toContain('.wmv')
    })

    it('should reject FLV files', () => {
      const result = validateFileExtension('video.flv')
      expect(result.valid).toBe(false)
      expect(result.error).toContain('Video files')
      expect(result.error).toContain('.flv')
    })

    it('should reject MKV files', () => {
      const result = validateFileExtension('video.mkv')
      expect(result.valid).toBe(false)
      expect(result.error).toContain('Video files')
      expect(result.error).toContain('.mkv')
    })

    it('should reject video files with uppercase extensions', () => {
      const result = validateFileExtension('VIDEO.MP4')
      expect(result.valid).toBe(false)
      expect(result.error).toContain('Video files')
    })

    it('should reject video files with paths', () => {
      const result = validateFileExtension('videos/intro.mp4')
      expect(result.valid).toBe(false)
      expect(result.error).toContain('Video files')
    })
  })

  describe('invalid file types', () => {
    it('should reject PDF files', () => {
      const result = validateFileExtension('document.pdf')
      expect(result.valid).toBe(false)
      expect(result.error).toContain('not allowed')
    })

    it('should reject EXE files', () => {
      const result = validateFileExtension('program.exe')
      expect(result.valid).toBe(false)
      expect(result.error).toContain('not allowed')
    })

    it('should reject ZIP files', () => {
      const result = validateFileExtension('archive.zip')
      expect(result.valid).toBe(false)
      expect(result.error).toContain('not allowed')
    })

    it('should reject TXT files', () => {
      const result = validateFileExtension('readme.txt')
      expect(result.valid).toBe(false)
      expect(result.error).toContain('not allowed')
    })

    it('should reject DOC files', () => {
      const result = validateFileExtension('document.doc')
      expect(result.valid).toBe(false)
      expect(result.error).toContain('not allowed')
    })

    it('should reject unknown extensions', () => {
      const result = validateFileExtension('file.xyz')
      expect(result.valid).toBe(false)
      expect(result.error).toContain('not allowed')
    })
  })

  describe('edge cases', () => {
    it('should reject empty filename', () => {
      const result = validateFileExtension('')
      expect(result.valid).toBe(false)
      expect(result.error).toContain('required')
    })

    it('should reject filename without extension', () => {
      const result = validateFileExtension('noextension')
      expect(result.valid).toBe(false)
      expect(result.error).toContain('valid extension')
    })

    it('should reject filename with only dot', () => {
      const result = validateFileExtension('.')
      expect(result.valid).toBe(false)
      expect(result.error).toContain('valid extension')
    })

    it('should reject filename ending with dot', () => {
      const result = validateFileExtension('file.')
      expect(result.valid).toBe(false)
      expect(result.error).toContain('valid extension')
    })

    it('should handle filename with multiple dots', () => {
      const result = validateFileExtension('my.file.name.html')
      expect(result.valid).toBe(true)
      expect(result.error).toBeUndefined()
    })

    it('should handle filename with spaces', () => {
      const result = validateFileExtension('my file.html')
      expect(result.valid).toBe(true)
      expect(result.error).toBeUndefined()
    })

    it('should trim whitespace from extension', () => {
      const result = validateFileExtension('file.html ')
      expect(result.valid).toBe(true)
      expect(result.error).toBeUndefined()
    })
  })

  describe('constants', () => {
    it('should export ALLOWED_EXTENSIONS array', () => {
      expect(ALLOWED_EXTENSIONS).toBeDefined()
      expect(Array.isArray(ALLOWED_EXTENSIONS)).toBe(true)
      expect(ALLOWED_EXTENSIONS.length).toBeGreaterThan(0)
    })

    it('should export VIDEO_EXTENSIONS array', () => {
      expect(VIDEO_EXTENSIONS).toBeDefined()
      expect(Array.isArray(VIDEO_EXTENSIONS)).toBe(true)
      expect(VIDEO_EXTENSIONS.length).toBeGreaterThan(0)
    })

    it('should have no overlap between ALLOWED_EXTENSIONS and VIDEO_EXTENSIONS', () => {
      const overlap = ALLOWED_EXTENSIONS.filter(ext => 
        VIDEO_EXTENSIONS.includes(ext as any)
      )
      expect(overlap.length).toBe(0)
    })

    it('ALLOWED_EXTENSIONS should include all required types', () => {
      const requiredTypes = [
        '.html', '.css', '.js',
        '.png', '.jpg', '.jpeg', '.gif', '.svg', '.webp', '.ico',
        '.woff', '.woff2', '.ttf', '.otf'
      ]
      
      for (const type of requiredTypes) {
        expect(ALLOWED_EXTENSIONS).toContain(type)
      }
    })

    it('VIDEO_EXTENSIONS should include all video types', () => {
      const videoTypes = [
        '.mp4', '.webm', '.ogg', '.avi', '.mov', '.wmv', '.flv', '.mkv'
      ]
      
      for (const type of videoTypes) {
        expect(VIDEO_EXTENSIONS).toContain(type)
      }
    })
  })
})

describe('detectVideoReferences', () => {
  describe('no video references', () => {
    it('should return false for empty string', () => {
      const result = detectVideoReferences('')
      expect(result.hasVideoReferences).toBe(false)
      expect(result.references).toEqual([])
    })

    it('should return false for HTML without video references', () => {
      const html = '<html><body><img src="image.png" /></body></html>'
      const result = detectVideoReferences(html)
      expect(result.hasVideoReferences).toBe(false)
      expect(result.references).toEqual([])
    })

    it('should return false for CSS without video references', () => {
      const css = 'body { background: url("bg.jpg"); }'
      const result = detectVideoReferences(css)
      expect(result.hasVideoReferences).toBe(false)
      expect(result.references).toEqual([])
    })

    it('should return false for JavaScript without video references', () => {
      const js = 'const img = new Image(); img.src = "photo.png";'
      const result = detectVideoReferences(js)
      expect(result.hasVideoReferences).toBe(false)
      expect(result.references).toEqual([])
    })

    it('should return false for text with allowed file types', () => {
      const text = 'Check out style.css and script.js and logo.png'
      const result = detectVideoReferences(text)
      expect(result.hasVideoReferences).toBe(false)
      expect(result.references).toEqual([])
    })
  })

  describe('single video reference detection', () => {
    it('should detect .mp4 reference', () => {
      const html = '<video src="intro.mp4"></video>'
      const result = detectVideoReferences(html)
      expect(result.hasVideoReferences).toBe(true)
      expect(result.references).toContain('.mp4')
    })

    it('should detect .webm reference', () => {
      const html = '<source src="video.webm" type="video/webm">'
      const result = detectVideoReferences(html)
      expect(result.hasVideoReferences).toBe(true)
      expect(result.references).toContain('.webm')
    })

    it('should detect .ogg reference', () => {
      const html = '<video src="clip.ogg"></video>'
      const result = detectVideoReferences(html)
      expect(result.hasVideoReferences).toBe(true)
      expect(result.references).toContain('.ogg')
    })

    it('should detect .avi reference', () => {
      const html = '<a href="movie.avi">Download</a>'
      const result = detectVideoReferences(html)
      expect(result.hasVideoReferences).toBe(true)
      expect(result.references).toContain('.avi')
    })

    it('should detect .mov reference', () => {
      const js = 'const video = "demo.mov";'
      const result = detectVideoReferences(js)
      expect(result.hasVideoReferences).toBe(true)
      expect(result.references).toContain('.mov')
    })

    it('should detect .wmv reference', () => {
      const html = '<video src="presentation.wmv"></video>'
      const result = detectVideoReferences(html)
      expect(result.hasVideoReferences).toBe(true)
      expect(result.references).toContain('.wmv')
    })

    it('should detect .flv reference', () => {
      const html = '<embed src="flash.flv">'
      const result = detectVideoReferences(html)
      expect(result.hasVideoReferences).toBe(true)
      expect(result.references).toContain('.flv')
    })

    it('should detect .mkv reference', () => {
      const html = '<video src="movie.mkv"></video>'
      const result = detectVideoReferences(html)
      expect(result.hasVideoReferences).toBe(true)
      expect(result.references).toContain('.mkv')
    })
  })

  describe('multiple video references', () => {
    it('should detect multiple different video formats', () => {
      const html = `
        <video>
          <source src="video.mp4" type="video/mp4">
          <source src="video.webm" type="video/webm">
          <source src="video.ogg" type="video/ogg">
        </video>
      `
      const result = detectVideoReferences(html)
      expect(result.hasVideoReferences).toBe(true)
      expect(result.references).toContain('.mp4')
      expect(result.references).toContain('.webm')
      expect(result.references).toContain('.ogg')
      expect(result.references.length).toBeGreaterThanOrEqual(3)
    })

    it('should detect same video format multiple times', () => {
      const html = '<video src="intro.mp4"></video><video src="outro.mp4"></video>'
      const result = detectVideoReferences(html)
      expect(result.hasVideoReferences).toBe(true)
      expect(result.references).toContain('.mp4')
    })

    it('should detect video references in mixed content', () => {
      const html = `
        <img src="logo.png">
        <video src="demo.mp4"></video>
        <link rel="stylesheet" href="style.css">
        <source src="backup.webm">
      `
      const result = detectVideoReferences(html)
      expect(result.hasVideoReferences).toBe(true)
      expect(result.references).toContain('.mp4')
      expect(result.references).toContain('.webm')
    })
  })

  describe('case insensitivity', () => {
    it('should detect uppercase video extensions', () => {
      const html = '<video src="VIDEO.MP4"></video>'
      const result = detectVideoReferences(html)
      expect(result.hasVideoReferences).toBe(true)
      expect(result.references).toContain('.mp4')
    })

    it('should detect mixed case video extensions', () => {
      const html = '<video src="intro.Mp4"></video>'
      const result = detectVideoReferences(html)
      expect(result.hasVideoReferences).toBe(true)
      expect(result.references).toContain('.mp4')
    })

    it('should detect video extensions in uppercase content', () => {
      const html = '<VIDEO SRC="DEMO.WEBM"></VIDEO>'
      const result = detectVideoReferences(html)
      expect(result.hasVideoReferences).toBe(true)
      expect(result.references).toContain('.webm')
    })
  })

  describe('video references in different contexts', () => {
    it('should detect video in HTML video tag', () => {
      const html = '<video src="assets/videos/intro.mp4" controls></video>'
      const result = detectVideoReferences(html)
      expect(result.hasVideoReferences).toBe(true)
      expect(result.references).toContain('.mp4')
    })

    it('should detect video in HTML source tag', () => {
      const html = '<source src="./videos/demo.webm" type="video/webm">'
      const result = detectVideoReferences(html)
      expect(result.hasVideoReferences).toBe(true)
      expect(result.references).toContain('.webm')
    })

    it('should detect video in anchor tag', () => {
      const html = '<a href="/downloads/tutorial.mp4">Download Video</a>'
      const result = detectVideoReferences(html)
      expect(result.hasVideoReferences).toBe(true)
      expect(result.references).toContain('.mp4')
    })

    it('should detect video in JavaScript string', () => {
      const js = 'const videoUrl = "https://example.com/video.mp4";'
      const result = detectVideoReferences(js)
      expect(result.hasVideoReferences).toBe(true)
      expect(result.references).toContain('.mp4')
    })

    it('should detect video in CSS url()', () => {
      const css = 'background: url("background-video.mp4");'
      const result = detectVideoReferences(css)
      expect(result.hasVideoReferences).toBe(true)
      expect(result.references).toContain('.mp4')
    })

    it('should detect video in comments', () => {
      const html = '<!-- TODO: Add video.mp4 here -->'
      const result = detectVideoReferences(html)
      expect(result.hasVideoReferences).toBe(true)
      expect(result.references).toContain('.mp4')
    })

    it('should detect video in data attributes', () => {
      const html = '<div data-video="promo.mp4"></div>'
      const result = detectVideoReferences(html)
      expect(result.hasVideoReferences).toBe(true)
      expect(result.references).toContain('.mp4')
    })
  })

  describe('edge cases', () => {
    it('should handle content with paths', () => {
      const html = '<video src="/assets/videos/intro.mp4"></video>'
      const result = detectVideoReferences(html)
      expect(result.hasVideoReferences).toBe(true)
      expect(result.references).toContain('.mp4')
    })

    it('should handle content with query parameters', () => {
      const html = '<video src="video.mp4?autoplay=1"></video>'
      const result = detectVideoReferences(html)
      expect(result.hasVideoReferences).toBe(true)
      expect(result.references).toContain('.mp4')
    })

    it('should handle content with URL fragments', () => {
      const html = '<video src="video.mp4#t=10"></video>'
      const result = detectVideoReferences(html)
      expect(result.hasVideoReferences).toBe(true)
      expect(result.references).toContain('.mp4')
    })

    it('should handle content with full URLs', () => {
      const html = '<video src="https://cdn.example.com/videos/demo.mp4"></video>'
      const result = detectVideoReferences(html)
      expect(result.hasVideoReferences).toBe(true)
      expect(result.references).toContain('.mp4')
    })

    it('should handle multiline content', () => {
      const html = `
        <video
          src="intro.mp4"
          controls
          autoplay
        ></video>
      `
      const result = detectVideoReferences(html)
      expect(result.hasVideoReferences).toBe(true)
      expect(result.references).toContain('.mp4')
    })

    it('should handle content with special characters', () => {
      const html = '<video src="my-video_2024.mp4"></video>'
      const result = detectVideoReferences(html)
      expect(result.hasVideoReferences).toBe(true)
      expect(result.references).toContain('.mp4')
    })

    it('should not detect partial matches', () => {
      const text = 'This is about mp4 format but no actual .mp4 file'
      const result = detectVideoReferences(text)
      expect(result.hasVideoReferences).toBe(true)
      expect(result.references).toContain('.mp4')
    })
  })
})

describe('sanitizeFilename', () => {
  describe('path traversal prevention', () => {
    it('should remove ../ path traversal attempts', () => {
      const result = sanitizeFilename('../../../etc/passwd')
      expect(result).not.toContain('..')
      expect(result).toBe('etc/passwd')
    })

    it('should remove multiple ../ sequences', () => {
      const result = sanitizeFilename('../../folder/../file.html')
      expect(result).not.toContain('..')
      expect(result).toBe('folder/file.html')
    })

    it('should remove ../ in the middle of path', () => {
      const result = sanitizeFilename('assets/../../../secret.txt')
      expect(result).not.toContain('..')
      expect(result).toBe('assets/secret.txt')
    })

    it('should handle mixed path separators with ../', () => {
      const result = sanitizeFilename('..\\..\\windows\\system32')
      expect(result).not.toContain('..')
      expect(result).toBe('windows/system32')
    })
  })

  describe('special character removal', () => {
    it('should replace spaces with underscores', () => {
      const result = sanitizeFilename('my file name.html')
      expect(result).toBe('my_file_name.html')
    })

    it('should replace special characters with underscores', () => {
      const result = sanitizeFilename('file@#$%^&*().html')
      expect(result).toBe('file_.html')
    })

    it('should remove null bytes', () => {
      const result = sanitizeFilename('file\0name.html')
      expect(result).not.toContain('\0')
      expect(result).toBe('filename.html')
    })

    it('should remove control characters', () => {
      const result = sanitizeFilename('file\x00\x1F\x7Fname.html')
      expect(result).toBe('filename.html')
    })

    it('should keep alphanumeric characters', () => {
      const result = sanitizeFilename('file123ABC.html')
      expect(result).toBe('file123ABC.html')
    })

    it('should keep dots for extensions', () => {
      const result = sanitizeFilename('my.file.name.html')
      expect(result).toBe('my.file.name.html')
    })

    it('should keep hyphens', () => {
      const result = sanitizeFilename('my-file-name.html')
      expect(result).toBe('my-file-name.html')
    })

    it('should keep underscores', () => {
      const result = sanitizeFilename('my_file_name.html')
      expect(result).toBe('my_file_name.html')
    })

    it('should keep forward slashes for paths', () => {
      const result = sanitizeFilename('assets/images/logo.png')
      expect(result).toBe('assets/images/logo.png')
    })
  })

  describe('path separator normalization', () => {
    it('should convert backslashes to forward slashes', () => {
      const result = sanitizeFilename('assets\\images\\logo.png')
      expect(result).toBe('assets/images/logo.png')
    })

    it('should remove leading slashes', () => {
      const result = sanitizeFilename('/assets/file.html')
      expect(result).toBe('assets/file.html')
    })

    it('should remove leading backslashes', () => {
      const result = sanitizeFilename('\\assets\\file.html')
      expect(result).toBe('assets/file.html')
    })

    it('should remove multiple leading slashes', () => {
      const result = sanitizeFilename('///assets/file.html')
      expect(result).toBe('assets/file.html')
    })

    it('should remove multiple consecutive slashes', () => {
      const result = sanitizeFilename('assets///images//logo.png')
      expect(result).toBe('assets/images/logo.png')
    })

    it('should remove trailing slashes', () => {
      const result = sanitizeFilename('assets/images/')
      expect(result).toBe('assets/images')
    })
  })

  describe('double dot handling', () => {
    it('should remove double dots but keep single dots', () => {
      const result = sanitizeFilename('file..name.html')
      expect(result).toBe('file.name.html')
    })

    it('should remove multiple consecutive dots', () => {
      const result = sanitizeFilename('file....name.html')
      expect(result).toBe('file.name.html')
    })

    it('should preserve extension dots', () => {
      const result = sanitizeFilename('file.tar.gz')
      expect(result).toBe('file.tar.gz')
    })
  })

  describe('edge cases', () => {
    it('should return empty string for empty input', () => {
      const result = sanitizeFilename('')
      expect(result).toBe('')
    })

    it('should return "unnamed" for filename that becomes empty after sanitization', () => {
      const result = sanitizeFilename('../../')
      expect(result).toBe('unnamed')
    })

    it('should handle filename with only special characters', () => {
      const result = sanitizeFilename('@#$%^&*()')
      expect(result).toBe('unnamed')
    })

    it('should handle very long filenames', () => {
      const longName = 'a'.repeat(300) + '.html'
      const result = sanitizeFilename(longName)
      expect(result).toContain('.html')
      expect(result.length).toBeGreaterThan(0)
    })

    it('should handle unicode characters', () => {
      const result = sanitizeFilename('файл.html')
      expect(result).toBe('_.html')
    })

    it('should handle emoji in filename', () => {
      const result = sanitizeFilename('file😀name.html')
      expect(result).toBe('file_name.html')
    })
  })

  describe('real-world attack scenarios', () => {
    it('should prevent directory traversal to /etc/passwd', () => {
      const result = sanitizeFilename('../../../etc/passwd')
      expect(result).not.toContain('..')
      expect(result).not.toMatch(/^\//)
    })

    it('should prevent Windows path traversal', () => {
      const result = sanitizeFilename('..\\..\\..\\windows\\system32\\config')
      expect(result).not.toContain('..')
      expect(result).not.toContain('\\')
    })

    it('should prevent null byte injection', () => {
      const result = sanitizeFilename('file.html\0.jpg')
      expect(result).not.toContain('\0')
    })

    it('should prevent command injection attempts', () => {
      const result = sanitizeFilename('file; rm -rf /.html')
      expect(result).not.toContain(';')
      expect(result).toBe('file_rm_-rf_.html')
    })

    it('should prevent URL-encoded path traversal', () => {
      const result = sanitizeFilename('%2e%2e%2f%2e%2e%2ffile.html')
      expect(result).toBe('_2e_2e_2f_2e_2e_2ffile.html')
    })
  })

  describe('valid filenames should remain mostly unchanged', () => {
    it('should keep simple filename', () => {
      const result = sanitizeFilename('index.html')
      expect(result).toBe('index.html')
    })

    it('should keep filename with path', () => {
      const result = sanitizeFilename('assets/css/style.css')
      expect(result).toBe('assets/css/style.css')
    })

    it('should keep filename with hyphens and underscores', () => {
      const result = sanitizeFilename('my-awesome_file.js')
      expect(result).toBe('my-awesome_file.js')
    })

    it('should keep filename with numbers', () => {
      const result = sanitizeFilename('image-2024-01-15.png')
      expect(result).toBe('image-2024-01-15.png')
    })

    it('should keep nested paths', () => {
      const result = sanitizeFilename('assets/images/icons/logo.svg')
      expect(result).toBe('assets/images/icons/logo.svg')
    })
  })
})

describe('getMimeType', () => {
  describe('HTML files', () => {
    it('should return text/html for .html extension', () => {
      expect(getMimeType('index.html')).toBe('text/html')
    })

    it('should return text/html for .htm extension', () => {
      expect(getMimeType('page.htm')).toBe('text/html')
    })

    it('should handle uppercase HTML extension', () => {
      expect(getMimeType('INDEX.HTML')).toBe('text/html')
    })

    it('should handle mixed case HTML extension', () => {
      expect(getMimeType('page.HtMl')).toBe('text/html')
    })
  })

  describe('CSS files', () => {
    it('should return text/css for .css extension', () => {
      expect(getMimeType('styles.css')).toBe('text/css')
    })

    it('should handle uppercase CSS extension', () => {
      expect(getMimeType('STYLES.CSS')).toBe('text/css')
    })
  })

  describe('JavaScript files', () => {
    it('should return application/javascript for .js extension', () => {
      expect(getMimeType('script.js')).toBe('application/javascript')
    })

    it('should handle uppercase JS extension', () => {
      expect(getMimeType('APP.JS')).toBe('application/javascript')
    })
  })

  describe('image files', () => {
    it('should return image/png for .png extension', () => {
      expect(getMimeType('logo.png')).toBe('image/png')
    })

    it('should return image/jpeg for .jpg extension', () => {
      expect(getMimeType('photo.jpg')).toBe('image/jpeg')
    })

    it('should return image/jpeg for .jpeg extension', () => {
      expect(getMimeType('image.jpeg')).toBe('image/jpeg')
    })

    it('should return image/gif for .gif extension', () => {
      expect(getMimeType('animation.gif')).toBe('image/gif')
    })

    it('should return image/svg+xml for .svg extension', () => {
      expect(getMimeType('icon.svg')).toBe('image/svg+xml')
    })

    it('should return image/webp for .webp extension', () => {
      expect(getMimeType('modern.webp')).toBe('image/webp')
    })

    it('should return image/x-icon for .ico extension', () => {
      expect(getMimeType('favicon.ico')).toBe('image/x-icon')
    })
  })

  describe('font files', () => {
    it('should return font/woff for .woff extension', () => {
      expect(getMimeType('font.woff')).toBe('font/woff')
    })

    it('should return font/woff2 for .woff2 extension', () => {
      expect(getMimeType('font.woff2')).toBe('font/woff2')
    })

    it('should return font/ttf for .ttf extension', () => {
      expect(getMimeType('font.ttf')).toBe('font/ttf')
    })

    it('should return font/otf for .otf extension', () => {
      expect(getMimeType('font.otf')).toBe('font/otf')
    })
  })

  describe('other file types', () => {
    it('should return application/json for .json extension', () => {
      expect(getMimeType('data.json')).toBe('application/json')
    })

    it('should return text/plain for .txt extension', () => {
      expect(getMimeType('readme.txt')).toBe('text/plain')
    })

    it('should return application/pdf for .pdf extension', () => {
      expect(getMimeType('document.pdf')).toBe('application/pdf')
    })

    it('should return application/zip for .zip extension', () => {
      expect(getMimeType('archive.zip')).toBe('application/zip')
    })
  })

  describe('unknown file types', () => {
    it('should return application/octet-stream for unknown extension', () => {
      expect(getMimeType('file.xyz')).toBe('application/octet-stream')
    })

    it('should return application/octet-stream for file without extension', () => {
      expect(getMimeType('noextension')).toBe('application/octet-stream')
    })

    it('should return application/octet-stream for empty extension', () => {
      expect(getMimeType('file.')).toBe('application/octet-stream')
    })
  })

  describe('files with paths', () => {
    it('should handle files with paths', () => {
      expect(getMimeType('assets/images/logo.png')).toBe('image/png')
    })

    it('should handle nested paths', () => {
      expect(getMimeType('assets/css/components/button.css')).toBe('text/css')
    })

    it('should handle absolute paths', () => {
      expect(getMimeType('/var/www/html/index.html')).toBe('text/html')
    })
  })

  describe('files with multiple dots', () => {
    it('should use the last extension', () => {
      expect(getMimeType('my.file.name.html')).toBe('text/html')
    })

    it('should handle .tar.gz style names', () => {
      expect(getMimeType('archive.tar.gz')).toBe('application/octet-stream')
    })

    it('should handle version numbers in filename', () => {
      expect(getMimeType('jquery-3.6.0.min.js')).toBe('application/javascript')
    })
  })

  describe('case insensitivity', () => {
    it('should handle all uppercase extensions', () => {
      expect(getMimeType('FILE.PNG')).toBe('image/png')
      expect(getMimeType('STYLE.CSS')).toBe('text/css')
      expect(getMimeType('SCRIPT.JS')).toBe('application/javascript')
    })

    it('should handle mixed case extensions', () => {
      expect(getMimeType('image.JpEg')).toBe('image/jpeg')
      expect(getMimeType('font.WoFf2')).toBe('font/woff2')
    })
  })

  describe('edge cases', () => {
    it('should handle filenames with spaces', () => {
      expect(getMimeType('my file.html')).toBe('text/html')
    })

    it('should handle filenames with special characters', () => {
      expect(getMimeType('my-file_2024.png')).toBe('image/png')
    })

    it('should handle very long filenames', () => {
      const longName = 'a'.repeat(200) + '.css'
      expect(getMimeType(longName)).toBe('text/css')
    })
  })

  describe('requirement 15 compliance', () => {
    it('should return appropriate Content-Type for all allowed extensions', () => {
      const expectedMimeTypes: Record<string, string> = {
        'index.html': 'text/html',
        'styles.css': 'text/css',
        'script.js': 'application/javascript',
        'logo.png': 'image/png',
        'photo.jpg': 'image/jpeg',
        'image.jpeg': 'image/jpeg',
        'animation.gif': 'image/gif',
        'icon.svg': 'image/svg+xml',
        'modern.webp': 'image/webp',
        'favicon.ico': 'image/x-icon',
        'font.woff': 'font/woff',
        'font.woff2': 'font/woff2',
        'font.ttf': 'font/ttf',
        'font.otf': 'font/otf'
      }

      for (const [filename, expectedMime] of Object.entries(expectedMimeTypes)) {
        expect(getMimeType(filename)).toBe(expectedMime)
      }
    })
  })
})
