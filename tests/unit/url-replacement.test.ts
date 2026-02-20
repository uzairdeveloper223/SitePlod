/**
 * Unit tests for URL replacement utility
 * 
 * Tests image URL replacement in HTML/CSS/JS files
 */

import { describe, it, expect } from 'vitest'
import { replaceImageUrls, URLReplacementError } from '@/lib/url-replacement'

describe('replaceImageUrls', () => {
  describe('HTML replacements', () => {
    it('should replace image src attributes', () => {
      const html = '<img src="logo.png" alt="Logo">'
      const mapping = { 'logo.png': 'https://i.ibb.co/abc123/logo.png' }

      const result = replaceImageUrls(html, mapping)

      expect(result).toBe('<img src="https://i.ibb.co/abc123/logo.png" alt="Logo">')
    })

    it('should replace multiple image references', () => {
      const html = `
        <img src="logo.png" alt="Logo">
        <img src="banner.jpg" alt="Banner">
      `
      const mapping = {
        'logo.png': 'https://i.ibb.co/abc123/logo.png',
        'banner.jpg': 'https://i.ibb.co/def456/banner.jpg'
      }

      const result = replaceImageUrls(html, mapping)

      expect(result).toContain('https://i.ibb.co/abc123/logo.png')
      expect(result).toContain('https://i.ibb.co/def456/banner.jpg')
    })

    it('should replace images with relative paths', () => {
      const html = '<img src="./images/logo.png" alt="Logo">'
      const mapping = { 'images/logo.png': 'https://i.ibb.co/abc123/logo.png' }

      const result = replaceImageUrls(html, mapping)

      expect(result).toBe('<img src="https://i.ibb.co/abc123/logo.png" alt="Logo">')
    })

    it('should replace images with parent directory paths', () => {
      const html = '<img src="../images/logo.png" alt="Logo">'
      const mapping = { 'images/logo.png': 'https://i.ibb.co/abc123/logo.png' }

      const result = replaceImageUrls(html, mapping)

      expect(result).toBe('<img src="https://i.ibb.co/abc123/logo.png" alt="Logo">')
    })

    it('should replace background images in style attributes', () => {
      const html = '<div style="background-image: url(hero.jpg)"></div>'
      const mapping = { 'hero.jpg': 'https://i.ibb.co/xyz789/hero.jpg' }

      const result = replaceImageUrls(html, mapping)

      expect(result).toContain('https://i.ibb.co/xyz789/hero.jpg')
    })

    it('should replace favicon links', () => {
      const html = '<link rel="icon" href="favicon.ico">'
      const mapping = { 'favicon.ico': 'https://i.ibb.co/favicon123/favicon.ico' }

      const result = replaceImageUrls(html, mapping)

      expect(result).toBe('<link rel="icon" href="https://i.ibb.co/favicon123/favicon.ico">')
    })

    it('should replace srcset attributes', () => {
      const html = '<img srcset="small.png 480w, large.png 800w">'
      const mapping = {
        'small.png': 'https://i.ibb.co/small123/small.png',
        'large.png': 'https://i.ibb.co/large456/large.png'
      }

      const result = replaceImageUrls(html, mapping)

      expect(result).toContain('https://i.ibb.co/small123/small.png')
      expect(result).toContain('https://i.ibb.co/large456/large.png')
    })

    it('should handle single and double quotes', () => {
      const html = `
        <img src="logo.png">
        <img src='logo.png'>
      `
      const mapping = { 'logo.png': 'https://i.ibb.co/abc123/logo.png' }

      const result = replaceImageUrls(html, mapping)

      const occurrences = (result.match(/https:\/\/i\.ibb\.co\/abc123\/logo\.png/g) || []).length
      expect(occurrences).toBe(2)
    })
  })

  describe('CSS replacements', () => {
    it('should replace background-image URLs', () => {
      const css = '.hero { background-image: url(hero.jpg); }'
      const mapping = { 'hero.jpg': 'https://i.ibb.co/hero123/hero.jpg' }

      const result = replaceImageUrls(css, mapping)

      expect(result).toBe('.hero { background-image: url(https://i.ibb.co/hero123/hero.jpg); }')
    })

    it('should replace background URLs with quotes', () => {
      const css = '.hero { background: url("hero.jpg"); }'
      const mapping = { 'hero.jpg': 'https://i.ibb.co/hero123/hero.jpg' }

      const result = replaceImageUrls(css, mapping)

      expect(result).toContain('https://i.ibb.co/hero123/hero.jpg')
    })

    it('should replace multiple background images', () => {
      const css = `
        .header { background-image: url(header.png); }
        .footer { background-image: url(footer.png); }
      `
      const mapping = {
        'header.png': 'https://i.ibb.co/header123/header.png',
        'footer.png': 'https://i.ibb.co/footer456/footer.png'
      }

      const result = replaceImageUrls(css, mapping)

      expect(result).toContain('https://i.ibb.co/header123/header.png')
      expect(result).toContain('https://i.ibb.co/footer456/footer.png')
    })

    it('should replace relative paths in CSS', () => {
      const css = '.logo { background: url(./images/logo.png); }'
      const mapping = { 'images/logo.png': 'https://i.ibb.co/logo123/logo.png' }

      const result = replaceImageUrls(css, mapping)

      expect(result).toContain('https://i.ibb.co/logo123/logo.png')
    })

    it('should replace parent directory paths in CSS', () => {
      const css = '.logo { background: url(../assets/logo.png); }'
      const mapping = { 'assets/logo.png': 'https://i.ibb.co/logo123/logo.png' }

      const result = replaceImageUrls(css, mapping)

      expect(result).toContain('https://i.ibb.co/logo123/logo.png')
    })

    it('should handle list-style-image', () => {
      const css = 'ul { list-style-image: url(bullet.png); }'
      const mapping = { 'bullet.png': 'https://i.ibb.co/bullet123/bullet.png' }

      const result = replaceImageUrls(css, mapping)

      expect(result).toBe('ul { list-style-image: url(https://i.ibb.co/bullet123/bullet.png); }')
    })

    it('should handle border-image', () => {
      const css = '.box { border-image: url(border.png) 30 round; }'
      const mapping = { 'border.png': 'https://i.ibb.co/border123/border.png' }

      const result = replaceImageUrls(css, mapping)

      expect(result).toContain('https://i.ibb.co/border123/border.png')
    })
  })

  describe('JavaScript replacements', () => {
    it('should replace image paths in JavaScript strings', () => {
      const js = 'const img = "logo.png";'
      const mapping = { 'logo.png': 'https://i.ibb.co/logo123/logo.png' }

      const result = replaceImageUrls(js, mapping)

      expect(result).toBe('const img = "https://i.ibb.co/logo123/logo.png";')
    })

    it('should replace image paths in template literals', () => {
      const js = 'const img = `logo.png`;'
      const mapping = { 'logo.png': 'https://i.ibb.co/logo123/logo.png' }

      const result = replaceImageUrls(js, mapping)

      expect(result).toBe('const img = `https://i.ibb.co/logo123/logo.png`;')
    })

    it('should replace image paths in createElement calls', () => {
      const js = 'img.src = "logo.png";'
      const mapping = { 'logo.png': 'https://i.ibb.co/logo123/logo.png' }

      const result = replaceImageUrls(js, mapping)

      expect(result).toBe('img.src = "https://i.ibb.co/logo123/logo.png";')
    })

    it('should replace relative paths in JavaScript', () => {
      const js = 'const img = "./images/logo.png";'
      const mapping = { 'images/logo.png': 'https://i.ibb.co/logo123/logo.png' }

      const result = replaceImageUrls(js, mapping)

      expect(result).toBe('const img = "https://i.ibb.co/logo123/logo.png";')
    })

    it('should replace parent directory paths in JavaScript', () => {
      const js = 'const img = "../assets/logo.png";'
      const mapping = { 'assets/logo.png': 'https://i.ibb.co/logo123/logo.png' }

      const result = replaceImageUrls(js, mapping)

      expect(result).toBe('const img = "https://i.ibb.co/logo123/logo.png";')
    })
  })

  describe('path handling', () => {
    it('should handle nested directory paths', () => {
      const html = '<img src="assets/images/icons/logo.png">'
      const mapping = { 'assets/images/icons/logo.png': 'https://i.ibb.co/logo123/logo.png' }

      const result = replaceImageUrls(html, mapping)

      expect(result).toBe('<img src="https://i.ibb.co/logo123/logo.png">')
    })

    it('should handle paths with leading ./', () => {
      const html = '<img src="./logo.png">'
      const mapping = { 'logo.png': 'https://i.ibb.co/logo123/logo.png' }

      const result = replaceImageUrls(html, mapping)

      expect(result).toBe('<img src="https://i.ibb.co/logo123/logo.png">')
    })

    it('should handle paths with leading ../', () => {
      const html = '<img src="../logo.png">'
      const mapping = { 'logo.png': 'https://i.ibb.co/logo123/logo.png' }

      const result = replaceImageUrls(html, mapping)

      expect(result).toBe('<img src="https://i.ibb.co/logo123/logo.png">')
    })

    it('should handle same image referenced multiple times', () => {
      const html = `
        <img src="logo.png">
        <img src="./logo.png">
        <img src="../logo.png">
      `
      const mapping = { 'logo.png': 'https://i.ibb.co/logo123/logo.png' }

      const result = replaceImageUrls(html, mapping)

      const occurrences = (result.match(/https:\/\/i\.ibb\.co\/logo123\/logo\.png/g) || []).length
      expect(occurrences).toBe(3)
    })

    it('should handle images with different extensions', () => {
      const html = `
        <img src="photo.jpg">
        <img src="icon.png">
        <img src="graphic.svg">
        <img src="animation.gif">
      `
      const mapping = {
        'photo.jpg': 'https://i.ibb.co/photo123/photo.jpg',
        'icon.png': 'https://i.ibb.co/icon456/icon.png',
        'graphic.svg': 'https://i.ibb.co/graphic789/graphic.svg',
        'animation.gif': 'https://i.ibb.co/anim012/animation.gif'
      }

      const result = replaceImageUrls(html, mapping)

      expect(result).toContain('https://i.ibb.co/photo123/photo.jpg')
      expect(result).toContain('https://i.ibb.co/icon456/icon.png')
      expect(result).toContain('https://i.ibb.co/graphic789/graphic.svg')
      expect(result).toContain('https://i.ibb.co/anim012/animation.gif')
    })

    it('should handle filenames with special characters', () => {
      const html = '<img src="my-logo_v2.png">'
      const mapping = { 'my-logo_v2.png': 'https://i.ibb.co/logo123/my-logo_v2.png' }

      const result = replaceImageUrls(html, mapping)

      expect(result).toBe('<img src="https://i.ibb.co/logo123/my-logo_v2.png">')
    })

    it('should handle filenames with spaces (URL encoded)', () => {
      const html = '<img src="my logo.png">'
      const mapping = { 'my logo.png': 'https://i.ibb.co/logo123/my-logo.png' }

      const result = replaceImageUrls(html, mapping)

      expect(result).toBe('<img src="https://i.ibb.co/logo123/my-logo.png">')
    })
  })

  describe('edge cases', () => {
    it('should return unchanged content if no mappings provided', () => {
      const html = '<img src="logo.png">'
      const mapping = {}

      const result = replaceImageUrls(html, mapping)

      expect(result).toBe(html)
    })

    it('should handle empty content', () => {
      const content = ''
      const mapping = { 'logo.png': 'https://i.ibb.co/logo123/logo.png' }

      const result = replaceImageUrls(content, mapping)

      expect(result).toBe('')
    })

    it('should handle content with no image references', () => {
      const html = '<div>Hello World</div>'
      const mapping = { 'logo.png': 'https://i.ibb.co/logo123/logo.png' }

      const result = replaceImageUrls(html, mapping)

      expect(result).toBe(html)
    })

    it('should skip empty paths in mapping', () => {
      const html = '<img src="logo.png">'
      const mapping = {
        '': 'https://i.ibb.co/empty/empty.png',
        'logo.png': 'https://i.ibb.co/logo123/logo.png'
      }

      const result = replaceImageUrls(html, mapping)

      expect(result).toBe('<img src="https://i.ibb.co/logo123/logo.png">')
    })

    it('should skip empty URLs in mapping', () => {
      const html = '<img src="logo.png">'
      const mapping = {
        'logo.png': ''
      }

      const result = replaceImageUrls(html, mapping)

      expect(result).toBe(html)
    })

    it('should handle large content', () => {
      const largeHtml = '<img src="logo.png">'.repeat(10000)
      const mapping = { 'logo.png': 'https://i.ibb.co/logo123/logo.png' }

      const result = replaceImageUrls(largeHtml, mapping)

      const occurrences = (result.match(/https:\/\/i\.ibb\.co\/logo123\/logo\.png/g) || []).length
      expect(occurrences).toBe(10000)
    })

    it('should not replace partial matches', () => {
      const html = '<img src="logo.png"> <img src="mylogo.png">'
      const mapping = { 'logo.png': 'https://i.ibb.co/logo123/logo.png' }

      const result = replaceImageUrls(html, mapping)

      expect(result).toContain('https://i.ibb.co/logo123/logo.png')
      expect(result).toContain('mylogo.png')
    })

    it('should handle multiline content', () => {
      const html = `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            .hero { background: url(hero.jpg); }
          </style>
        </head>
        <body>
          <img src="logo.png">
        </body>
        </html>
      `
      const mapping = {
        'hero.jpg': 'https://i.ibb.co/hero123/hero.jpg',
        'logo.png': 'https://i.ibb.co/logo456/logo.png'
      }

      const result = replaceImageUrls(html, mapping)

      expect(result).toContain('https://i.ibb.co/hero123/hero.jpg')
      expect(result).toContain('https://i.ibb.co/logo456/logo.png')
    })
  })

  describe('input validation', () => {
    it('should throw error for non-string content', () => {
      const mapping = { 'logo.png': 'https://i.ibb.co/logo123/logo.png' }

      expect(() => replaceImageUrls(null as any, mapping)).toThrow(URLReplacementError)
      expect(() => replaceImageUrls(undefined as any, mapping)).toThrow(URLReplacementError)
      expect(() => replaceImageUrls(123 as any, mapping)).toThrow(URLReplacementError)
      expect(() => replaceImageUrls([] as any, mapping)).toThrow(URLReplacementError)
    })

    it('should throw error for invalid mapping', () => {
      const html = '<img src="logo.png">'

      expect(() => replaceImageUrls(html, null as any)).toThrow(URLReplacementError)
      expect(() => replaceImageUrls(html, undefined as any)).toThrow(URLReplacementError)
      expect(() => replaceImageUrls(html, 'invalid' as any)).toThrow(URLReplacementError)
      expect(() => replaceImageUrls(html, [] as any)).toThrow(URLReplacementError)
    })

    it('should throw URLReplacementError with correct message', () => {
      expect(() => replaceImageUrls(null as any, {})).toThrow('Content must be a string')
      expect(() => replaceImageUrls('', null as any)).toThrow('Image URL mapping must be an object')
    })

    it('should create URLReplacementError with correct properties', () => {
      const error = new URLReplacementError('Test error')

      expect(error).toBeInstanceOf(Error)
      expect(error).toBeInstanceOf(URLReplacementError)
      expect(error.message).toBe('Test error')
      expect(error.name).toBe('URLReplacementError')
    })
  })

  describe('real-world scenarios', () => {
    it('should handle complete HTML page', () => {
      const html = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>My Site</title>
          <link rel="icon" href="favicon.ico">
          <style>
            body { background: url(bg.jpg); }
            .logo { background-image: url(./images/logo.png); }
          </style>
        </head>
        <body>
          <header>
            <img src="./images/logo.png" alt="Logo">
          </header>
          <main>
            <img src="hero.jpg" alt="Hero">
          </main>
          <script>
            const icon = "favicon.ico";
          </script>
        </body>
        </html>
      `
      const mapping = {
        'favicon.ico': 'https://i.ibb.co/fav123/favicon.ico',
        'bg.jpg': 'https://i.ibb.co/bg456/bg.jpg',
        'images/logo.png': 'https://i.ibb.co/logo789/logo.png',
        'hero.jpg': 'https://i.ibb.co/hero012/hero.jpg'
      }

      const result = replaceImageUrls(html, mapping)

      expect(result).toContain('https://i.ibb.co/fav123/favicon.ico')
      expect(result).toContain('https://i.ibb.co/bg456/bg.jpg')
      expect(result).toContain('https://i.ibb.co/logo789/logo.png')
      expect(result).toContain('https://i.ibb.co/hero012/hero.jpg')
    })

    it('should handle CSS file with multiple images', () => {
      const css = `
        body {
          background: url(bg.jpg) no-repeat center;
        }
        
        .header {
          background-image: url("./images/header.png");
        }
        
        .footer {
          background: url('../images/footer.png');
        }
        
        ul {
          list-style-image: url(bullet.png);
        }
      `
      const mapping = {
        'bg.jpg': 'https://i.ibb.co/bg123/bg.jpg',
        'images/header.png': 'https://i.ibb.co/header456/header.png',
        'images/footer.png': 'https://i.ibb.co/footer789/footer.png',
        'bullet.png': 'https://i.ibb.co/bullet012/bullet.png'
      }

      const result = replaceImageUrls(css, mapping)

      expect(result).toContain('https://i.ibb.co/bg123/bg.jpg')
      expect(result).toContain('https://i.ibb.co/header456/header.png')
      expect(result).toContain('https://i.ibb.co/footer789/footer.png')
      expect(result).toContain('https://i.ibb.co/bullet012/bullet.png')
    })

    it('should handle JavaScript file with image references', () => {
      const js = `
        const images = {
          logo: "logo.png",
          hero: "./images/hero.jpg",
          icon: "../assets/icon.svg"
        };
        
        function loadImage(src) {
          const img = new Image();
          img.src = src;
          return img;
        }
        
        const heroImg = loadImage("hero.jpg");
      `
      const mapping = {
        'logo.png': 'https://i.ibb.co/logo123/logo.png',
        'images/hero.jpg': 'https://i.ibb.co/hero456/hero.jpg',
        'assets/icon.svg': 'https://i.ibb.co/icon789/icon.svg',
        'hero.jpg': 'https://i.ibb.co/hero456/hero.jpg'
      }

      const result = replaceImageUrls(js, mapping)

      expect(result).toContain('https://i.ibb.co/logo123/logo.png')
      expect(result).toContain('https://i.ibb.co/hero456/hero.jpg')
      expect(result).toContain('https://i.ibb.co/icon789/icon.svg')
    })
  })
})
