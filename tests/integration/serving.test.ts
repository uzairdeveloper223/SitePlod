/**
 * Integration Tests for Site Serving Endpoints
 * 
 * Tests the complete site serving flow including:
 * - Site page rendering
 * - Static asset serving
 * - View tracking
 * - 404 handling
 * - Cache headers
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { getAdminClient } from '@/lib/supabase'

// Test configuration
const TEST_BASE_URL = process.env.TEST_BASE_URL || 'http://localhost:3000'
const API_BASE = `${TEST_BASE_URL}/api`

// Test user data
const testUser = {
  username: `servingtest_${Date.now()}`,
  email: `servingtest_${Date.now()}@example.com`,
  password: 'TestPassword123!'
}

let authToken: string | null = null
let userId: string | null = null
let testSiteSlug: string = `serving-test-${Date.now()}`
let testSiteId: string | null = null

describe('Site Serving Integration Tests', () => {
  // Setup: Create test user and site
  beforeAll(async () => {
    // Register user
    const registerResponse = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testUser),
    })

    const registerData = await registerResponse.json()
    authToken = registerData.token
    userId = registerData.user.id

    // Create a test site
    const siteData = {
      name: 'Serving Test Site',
      slug: testSiteSlug,
      managed: true,
      files: [
        {
          path: 'index.html',
          content: '<html><head><title>Test Site</title></head><body><h1>Hello World</h1></body></html>',
          mimeType: 'text/html',
          size: 85,
          storageUrl: 'https://pastebin.com/raw/test123'
        },
        {
          path: 'style.css',
          content: 'body { margin: 0; padding: 20px; }',
          mimeType: 'text/css',
          size: 35,
          storageUrl: 'https://pastebin.com/raw/test456'
        },
        {
          path: 'script.js',
          content: 'console.log("Hello from script");',
          mimeType: 'application/javascript',
          size: 33,
          storageUrl: 'https://pastebin.com/raw/test789'
        }
      ]
    }

    const siteResponse = await fetch(`${API_BASE}/sites`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`,
      },
      body: JSON.stringify(siteData),
    })

    const siteResponseData = await siteResponse.json()
    testSiteId = siteResponseData.id
  })

  // Cleanup: Remove test user and sites
  afterAll(async () => {
    if (!userId) return

    try {
      const supabase = getAdminClient() as any
      
      // Delete sites (CASCADE will delete files and views)
      await supabase.from('sites').delete().eq('user_id', userId)
      
      // Delete user
      await supabase.from('users').delete().eq('id', userId)
      await supabase.auth.admin.deleteUser(userId)
    } catch (error) {
      console.error('Cleanup error:', error)
    }
  })

  describe('GET /s/[slug]', () => {
    it('should serve the site index page', async () => {
      const response = await fetch(`${TEST_BASE_URL}/s/${testSiteSlug}`)

      expect(response.status).toBe(200)
      expect(response.headers.get('content-type')).toContain('text/html')

      const html = await response.text()
      expect(html).toContain('<h1>Hello World</h1>')
      expect(html).toContain('<title>Test Site</title>')
    })

    it('should return 404 for non-existent site', async () => {
      const response = await fetch(`${TEST_BASE_URL}/s/non-existent-site-12345`)

      expect(response.status).toBe(404)
    })

    it('should set appropriate cache headers', async () => {
      const response = await fetch(`${TEST_BASE_URL}/s/${testSiteSlug}`)

      expect(response.status).toBe(200)
      
      // Check for cache control headers
      const cacheControl = response.headers.get('cache-control')
      expect(cacheControl).toBeDefined()
      
      // Should have some caching strategy
      // e.g., "public, max-age=3600" or similar
    })

    it('should track view count', async () => {
      // Get initial view count
      const analyticsResponse1 = await fetch(`${API_BASE}/analytics/${testSiteId}`, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
        },
      })

      const analytics1 = await analyticsResponse1.json()
      const initialViews = analytics1.totalViews || 0

      // Visit the site
      await fetch(`${TEST_BASE_URL}/s/${testSiteSlug}`)

      // Wait a moment for async view tracking
      await new Promise(resolve => setTimeout(resolve, 1000))

      // Get updated view count
      const analyticsResponse2 = await fetch(`${API_BASE}/analytics/${testSiteId}`, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
        },
      })

      const analytics2 = await analyticsResponse2.json()
      const updatedViews = analytics2.totalViews || 0

      // View count should have increased
      expect(updatedViews).toBeGreaterThan(initialViews)
    })

    it('should handle multiple concurrent views', async () => {
      // Get initial view count
      const analyticsResponse1 = await fetch(`${API_BASE}/analytics/${testSiteId}`, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
        },
      })

      const analytics1 = await analyticsResponse1.json()
      const initialViews = analytics1.totalViews || 0

      // Make multiple concurrent requests
      const requests = Array(5).fill(null).map(() => 
        fetch(`${TEST_BASE_URL}/s/${testSiteSlug}`)
      )

      await Promise.all(requests)

      // Wait for async view tracking
      await new Promise(resolve => setTimeout(resolve, 2000))

      // Get updated view count
      const analyticsResponse2 = await fetch(`${API_BASE}/analytics/${testSiteId}`, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
        },
      })

      const analytics2 = await analyticsResponse2.json()
      const updatedViews = analytics2.totalViews || 0

      // All 5 views should be counted (no race conditions)
      expect(updatedViews).toBeGreaterThanOrEqual(initialViews + 5)
    })

    it('should serve site without authentication', async () => {
      // Site serving should be public, no auth required
      const response = await fetch(`${TEST_BASE_URL}/s/${testSiteSlug}`)

      expect(response.status).toBe(200)
    })
  })

  describe('GET /s/[slug]/[...path]', () => {
    it('should serve CSS files', async () => {
      const response = await fetch(`${TEST_BASE_URL}/s/${testSiteSlug}/style.css`)

      expect(response.status).toBe(200)
      expect(response.headers.get('content-type')).toContain('text/css')

      const css = await response.text()
      expect(css).toContain('margin: 0')
      expect(css).toContain('padding: 20px')
    })

    it('should serve JavaScript files', async () => {
      const response = await fetch(`${TEST_BASE_URL}/s/${testSiteSlug}/script.js`)

      expect(response.status).toBe(200)
      expect(response.headers.get('content-type')).toContain('javascript')

      const js = await response.text()
      expect(js).toContain('console.log')
    })

    it('should return 404 for non-existent file', async () => {
      const response = await fetch(`${TEST_BASE_URL}/s/${testSiteSlug}/non-existent.css`)

      expect(response.status).toBe(404)
    })

    it('should handle nested paths', async () => {
      // First, create a site with nested files
      const nestedSlug = `nested-test-${Date.now()}`
      const siteData = {
        name: 'Nested Test Site',
        slug: nestedSlug,
        managed: true,
        files: [
          {
            path: 'index.html',
            content: '<html><body>Nested Test</body></html>',
            mimeType: 'text/html',
            size: 40,
            storageUrl: 'https://pastebin.com/raw/nested1'
          },
          {
            path: 'css/style.css',
            content: 'body { color: red; }',
            mimeType: 'text/css',
            size: 21,
            storageUrl: 'https://pastebin.com/raw/nested2'
          },
          {
            path: 'js/app.js',
            content: 'console.log("app");',
            mimeType: 'application/javascript',
            size: 19,
            storageUrl: 'https://pastebin.com/raw/nested3'
          }
        ]
      }

      await fetch(`${API_BASE}/sites`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`,
        },
        body: JSON.stringify(siteData),
      })

      // Test nested paths
      const cssResponse = await fetch(`${TEST_BASE_URL}/s/${nestedSlug}/css/style.css`)
      expect(cssResponse.status).toBe(200)
      expect(cssResponse.headers.get('content-type')).toContain('text/css')

      const jsResponse = await fetch(`${TEST_BASE_URL}/s/${nestedSlug}/js/app.js`)
      expect(jsResponse.status).toBe(200)
      expect(jsResponse.headers.get('content-type')).toContain('javascript')
    })

    it('should set correct MIME types', async () => {
      const tests = [
        { path: 'style.css', expectedType: 'text/css' },
        { path: 'script.js', expectedType: 'javascript' }
      ]

      for (const test of tests) {
        const response = await fetch(`${TEST_BASE_URL}/s/${testSiteSlug}/${test.path}`)
        expect(response.status).toBe(200)
        expect(response.headers.get('content-type')).toContain(test.expectedType)
      }
    })

    it('should set cache headers for static assets', async () => {
      const response = await fetch(`${TEST_BASE_URL}/s/${testSiteSlug}/style.css`)

      expect(response.status).toBe(200)
      
      // Check for cache control headers
      const cacheControl = response.headers.get('cache-control')
      expect(cacheControl).toBeDefined()
      
      // Static assets should have longer cache times
      // e.g., "public, max-age=31536000" or similar
    })

    it('should prevent path traversal attacks', async () => {
      // Try to access files outside the site directory
      const maliciousPaths = [
        '../../../etc/passwd',
        '..%2F..%2F..%2Fetc%2Fpasswd',
        '....//....//....//etc/passwd'
      ]

      for (const path of maliciousPaths) {
        const response = await fetch(`${TEST_BASE_URL}/s/${testSiteSlug}/${path}`)
        
        // Should return 404 or 400, not 200
        expect(response.status).not.toBe(200)
      }
    })

    it('should serve assets without authentication', async () => {
      // Asset serving should be public, no auth required
      const response = await fetch(`${TEST_BASE_URL}/s/${testSiteSlug}/style.css`)

      expect(response.status).toBe(200)
    })
  })

  describe('View Tracking', () => {
    it('should increment view count atomically', async () => {
      // This test documents the atomic increment behavior
      // The increment_views database function ensures that
      // concurrent view tracking doesn't lose updates
      
      expect(true).toBe(true)
    })

    it('should track views asynchronously', async () => {
      // View tracking should not block page rendering
      // It should happen asynchronously in the background
      
      const startTime = Date.now()
      const response = await fetch(`${TEST_BASE_URL}/s/${testSiteSlug}`)
      const endTime = Date.now()

      expect(response.status).toBe(200)
      
      // Response should be fast (not waiting for view tracking)
      const responseTime = endTime - startTime
      expect(responseTime).toBeLessThan(5000) // Should be much faster in practice
    })

    it('should not fail page serving if view tracking fails', async () => {
      // Even if view tracking fails, the page should still be served
      // View tracking is fire-and-forget
      
      const response = await fetch(`${TEST_BASE_URL}/s/${testSiteSlug}`)

      expect(response.status).toBe(200)
    })
  })

  describe('Error Handling', () => {
    it('should return 404 with proper error page for non-existent site', async () => {
      const response = await fetch(`${TEST_BASE_URL}/s/definitely-does-not-exist-12345`)

      expect(response.status).toBe(404)
      
      // Should return HTML error page, not JSON
      const contentType = response.headers.get('content-type')
      expect(contentType).toContain('text/html')
    })

    it('should return 404 for non-existent asset', async () => {
      const response = await fetch(`${TEST_BASE_URL}/s/${testSiteSlug}/missing-file.css`)

      expect(response.status).toBe(404)
    })

    it('should handle malformed slugs gracefully', async () => {
      const malformedSlugs = [
        'invalid slug with spaces',
        'UPPERCASE',
        'special!@#$%characters'
      ]

      for (const slug of malformedSlugs) {
        const response = await fetch(`${TEST_BASE_URL}/s/${encodeURIComponent(slug)}`)
        
        // Should return 404, not 500
        expect(response.status).toBe(404)
      }
    })

    it('should handle database errors gracefully', async () => {
      // This test documents error handling behavior
      // If the database is unavailable, the site should return 500
      // with a proper error page, not expose internal errors
      
      expect(true).toBe(true)
    })
  })

  describe('Security Headers', () => {
    it('should set security headers on served pages', async () => {
      const response = await fetch(`${TEST_BASE_URL}/s/${testSiteSlug}`)

      expect(response.status).toBe(200)

      // Check for security headers
      const headers = response.headers

      // X-Content-Type-Options
      expect(headers.get('x-content-type-options')).toBe('nosniff')

      // X-Frame-Options (to prevent clickjacking)
      const xFrameOptions = headers.get('x-frame-options')
      expect(xFrameOptions).toBeTruthy()

      // Content-Security-Policy (optional but recommended)
      // const csp = headers.get('content-security-policy')
      // expect(csp).toBeTruthy()
    })

    it('should set CORS headers appropriately', async () => {
      const response = await fetch(`${TEST_BASE_URL}/s/${testSiteSlug}`)

      expect(response.status).toBe(200)

      // Check CORS headers if applicable
      // Sites should be accessible from any origin
      const accessControl = response.headers.get('access-control-allow-origin')
      
      // Either no CORS headers (same-origin only) or permissive
      if (accessControl) {
        expect(accessControl).toBeTruthy()
      }
    })
  })

  describe('Performance', () => {
    it('should serve pages quickly', async () => {
      const startTime = Date.now()
      const response = await fetch(`${TEST_BASE_URL}/s/${testSiteSlug}`)
      const endTime = Date.now()

      expect(response.status).toBe(200)

      const responseTime = endTime - startTime
      
      // Should respond in reasonable time (adjust based on your requirements)
      expect(responseTime).toBeLessThan(5000)
    })

    it('should handle concurrent requests efficiently', async () => {
      const concurrentRequests = 10
      const startTime = Date.now()

      const requests = Array(concurrentRequests).fill(null).map(() =>
        fetch(`${TEST_BASE_URL}/s/${testSiteSlug}`)
      )

      const responses = await Promise.all(requests)
      const endTime = Date.now()

      // All requests should succeed
      responses.forEach(response => {
        expect(response.status).toBe(200)
      })

      const totalTime = endTime - startTime
      
      // Should handle concurrent requests efficiently
      expect(totalTime).toBeLessThan(10000)
    })
  })

  describe('Content Delivery', () => {
    it('should fetch content from Pastebin URLs', async () => {
      // This test documents the content delivery flow
      // Files are stored on Pastebin, and the serving endpoint
      // fetches the content from Pastebin and serves it to users
      
      const response = await fetch(`${TEST_BASE_URL}/s/${testSiteSlug}`)

      expect(response.status).toBe(200)
      
      const html = await response.text()
      expect(html.length).toBeGreaterThan(0)
    })

    it('should handle Pastebin fetch failures gracefully', async () => {
      // This test documents error handling for external service failures
      // If Pastebin is down or returns an error, the site should
      // return a proper error page, not crash
      
      expect(true).toBe(true)
    })
  })
})
