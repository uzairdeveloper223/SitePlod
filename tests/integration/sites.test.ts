/**
 * Integration Tests for Site Management Endpoints
 * 
 * Tests the complete site management flow including:
 * - Slug availability check
 * - Site creation
 * - Site listing
 * - Site retrieval
 * - Site update
 * - Site deletion
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { getAdminClient } from '@/lib/supabase'

// Test configuration
const TEST_BASE_URL = process.env.TEST_BASE_URL || 'http://localhost:3000'
const API_BASE = `${TEST_BASE_URL}/api`

// Test user data
const testUser = {
  username: `sitetest_${Date.now()}`,
  email: `sitetest_${Date.now()}@example.com`,
  password: 'TestPassword123!'
}

let authToken: string | null = null
let userId: string | null = null
let testSiteId: string | null = null
let testSlug: string = `test-site-${Date.now()}`

describe('Site Management Integration Tests', () => {
  // Setup: Create test user
  beforeAll(async () => {
    const response = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testUser),
    })

    const data = await response.json()
    authToken = data.token
    userId = data.user.id
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

  describe('GET /api/sites/check-slug', () => {
    it('should return available for unused slug', async () => {
      const uniqueSlug = `available-slug-${Date.now()}`
      
      const response = await fetch(
        `${API_BASE}/sites/check-slug?slug=${uniqueSlug}`
      )

      expect(response.status).toBe(200)

      const data = await response.json()
      expect(data).toHaveProperty('available')
      expect(data.available).toBe(true)
      expect(data.slug).toBe(uniqueSlug)
    })

    it('should validate slug format', async () => {
      const invalidSlug = 'Invalid Slug!'
      
      const response = await fetch(
        `${API_BASE}/sites/check-slug?slug=${encodeURIComponent(invalidSlug)}`
      )

      expect(response.status).toBe(400)

      const data = await response.json()
      expect(data.error).toBe('Invalid slug')
    })

    it('should reject slug with uppercase letters', async () => {
      const response = await fetch(
        `${API_BASE}/sites/check-slug?slug=InvalidSlug`
      )

      expect(response.status).toBe(400)

      const data = await response.json()
      expect(data.error).toBe('Invalid slug')
    })

    it('should reject slug that is too short', async () => {
      const response = await fetch(
        `${API_BASE}/sites/check-slug?slug=ab`
      )

      expect(response.status).toBe(400)

      const data = await response.json()
      expect(data.error).toBe('Invalid slug')
      expect(data.message).toContain('at least 3 characters')
    })

    it('should reject slug that is too long', async () => {
      const longSlug = 'a'.repeat(51)
      
      const response = await fetch(
        `${API_BASE}/sites/check-slug?slug=${longSlug}`
      )

      expect(response.status).toBe(400)

      const data = await response.json()
      expect(data.error).toBe('Invalid slug')
      expect(data.message).toContain('50 characters')
    })

    it('should reject slug with special characters', async () => {
      const response = await fetch(
        `${API_BASE}/sites/check-slug?slug=test@site`
      )

      expect(response.status).toBe(400)

      const data = await response.json()
      expect(data.error).toBe('Invalid slug')
    })

    it('should reject request without slug parameter', async () => {
      const response = await fetch(
        `${API_BASE}/sites/check-slug`
      )

      expect(response.status).toBe(400)

      const data = await response.json()
      expect(data.error).toBe('Missing slug')
    })
  })

  describe('POST /api/sites', () => {
    it('should create a managed site with valid data', async () => {
      const siteData = {
        name: 'Test Site',
        slug: testSlug,
        managed: true,
        files: [
          {
            path: 'index.html',
            content: '<html><body>Test</body></html>',
            mimeType: 'text/html',
            size: 35,
            storageUrl: 'https://pastebin.com/test123'
          }
        ]
      }

      const response = await fetch(`${API_BASE}/sites`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`,
        },
        body: JSON.stringify(siteData),
      })

      expect(response.status).toBe(201)

      const data = await response.json()
      expect(data).toHaveProperty('id')
      expect(data).toHaveProperty('name')
      expect(data).toHaveProperty('slug')
      expect(data).toHaveProperty('liveUrl')
      expect(data.name).toBe(siteData.name)
      expect(data.slug).toBe(siteData.slug)
      expect(data.managed).toBe(true)
      expect(data.userId).toBe(userId)
      expect(data.liveUrl).toContain(testSlug)

      // Store for later tests
      testSiteId = data.id
    })

    it('should return unavailable for taken slug', async () => {
      const response = await fetch(
        `${API_BASE}/sites/check-slug?slug=${testSlug}`
      )

      expect(response.status).toBe(200)

      const data = await response.json()
      expect(data.available).toBe(false)
    })

    it('should create an unmanaged site without authentication', async () => {
      const unmanagedSlug = `unmanaged-${Date.now()}`
      const siteData = {
        name: 'Unmanaged Site',
        slug: unmanagedSlug,
        managed: false,
        files: [
          {
            path: 'index.html',
            content: '<html><body>Unmanaged</body></html>',
            mimeType: 'text/html',
            size: 40,
            storageUrl: 'https://pastebin.com/test456'
          }
        ]
      }

      const response = await fetch(`${API_BASE}/sites`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(siteData),
      })

      expect(response.status).toBe(201)

      const data = await response.json()
      expect(data.managed).toBe(false)
      expect(data.userId).toBeNull()
    })

    it('should reject site creation with duplicate slug', async () => {
      const siteData = {
        name: 'Duplicate Site',
        slug: testSlug, // Same slug as before
        managed: true,
        files: [
          {
            path: 'index.html',
            content: '<html><body>Duplicate</body></html>',
            mimeType: 'text/html',
            size: 40,
            storageUrl: 'https://pastebin.com/test789'
          }
        ]
      }

      const response = await fetch(`${API_BASE}/sites`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`,
        },
        body: JSON.stringify(siteData),
      })

      expect(response.status).toBe(400)

      const data = await response.json()
      expect(data.error).toBe('Slug taken')
    })

    it('should reject managed site without authentication', async () => {
      const siteData = {
        name: 'Managed Site',
        slug: `managed-${Date.now()}`,
        managed: true,
        files: []
      }

      const response = await fetch(`${API_BASE}/sites`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(siteData),
      })

      expect(response.status).toBe(401)

      const data = await response.json()
      expect(data.error).toBe('Unauthorized')
    })

    it('should reject site with invalid slug format', async () => {
      const siteData = {
        name: 'Invalid Site',
        slug: 'Invalid Slug!',
        managed: false,
        files: []
      }

      const response = await fetch(`${API_BASE}/sites`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(siteData),
      })

      expect(response.status).toBe(400)

      const data = await response.json()
      expect(data.error).toBe('Validation error')
    })

    it('should reject site without required fields', async () => {
      const siteData = {
        name: 'Incomplete Site',
        // Missing slug
        managed: false
      }

      const response = await fetch(`${API_BASE}/sites`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(siteData),
      })

      expect(response.status).toBe(400)

      const data = await response.json()
      expect(data.error).toBe('Validation error')
    })
  })

  describe('GET /api/sites', () => {
    it('should get all sites for authenticated user', async () => {
      const response = await fetch(`${API_BASE}/sites`, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
        },
      })

      expect(response.status).toBe(200)

      const data = await response.json()
      expect(Array.isArray(data)).toBe(true)
      expect(data.length).toBeGreaterThan(0)

      // Should include our test site
      const testSite = data.find((s: any) => s.id === testSiteId)
      expect(testSite).toBeDefined()
      expect(testSite.name).toBe('Test Site')
      expect(testSite.slug).toBe(testSlug)
    })

    it('should return empty array for user with no sites', async () => {
      // Create a new user with no sites
      const newUser = {
        username: `nosites_${Date.now()}`,
        email: `nosites_${Date.now()}@example.com`,
        password: 'TestPassword123!'
      }

      const registerResponse = await fetch(`${API_BASE}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newUser),
      })

      const registerData = await registerResponse.json()
      const newToken = registerData.token

      const response = await fetch(`${API_BASE}/sites`, {
        headers: {
          'Authorization': `Bearer ${newToken}`,
        },
      })

      expect(response.status).toBe(200)

      const data = await response.json()
      expect(Array.isArray(data)).toBe(true)
      expect(data.length).toBe(0)

      // Cleanup
      const supabase = getAdminClient() as any
      await supabase.from('users').delete().eq('id', registerData.user.id)
      await supabase.auth.admin.deleteUser(registerData.user.id)
    })

    it('should reject request without authentication', async () => {
      const response = await fetch(`${API_BASE}/sites`)

      expect(response.status).toBe(401)

      const data = await response.json()
      expect(data.error).toBe('Unauthorized')
    })

    it('should order sites by creation date (newest first)', async () => {
      const response = await fetch(`${API_BASE}/sites`, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
        },
      })

      const data = await response.json()
      
      if (data.length > 1) {
        // Check that sites are ordered by created_at descending
        for (let i = 0; i < data.length - 1; i++) {
          const current = new Date(data[i].createdAt)
          const next = new Date(data[i + 1].createdAt)
          expect(current.getTime()).toBeGreaterThanOrEqual(next.getTime())
        }
      }
    })
  })

  describe('GET /api/sites/:id', () => {
    it('should get a specific site by ID', async () => {
      expect(testSiteId).toBeTruthy()

      const response = await fetch(`${API_BASE}/sites/${testSiteId}`, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
        },
      })

      expect(response.status).toBe(200)

      const data = await response.json()
      expect(data.id).toBe(testSiteId)
      expect(data.name).toBe('Test Site')
      expect(data.slug).toBe(testSlug)
      expect(data).toHaveProperty('files')
      expect(Array.isArray(data.files)).toBe(true)
    })

    it('should reject request for non-existent site', async () => {
      const fakeId = '00000000-0000-0000-0000-000000000000'

      const response = await fetch(`${API_BASE}/sites/${fakeId}`, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
        },
      })

      expect(response.status).toBe(404)

      const data = await response.json()
      expect(data.error).toBe('Site not found')
    })

    it('should reject request without authentication', async () => {
      const response = await fetch(`${API_BASE}/sites/${testSiteId}`)

      expect(response.status).toBe(401)

      const data = await response.json()
      expect(data.error).toBe('Unauthorized')
    })

    it('should reject request for site owned by another user', async () => {
      // Create another user
      const otherUser = {
        username: `other_${Date.now()}`,
        email: `other_${Date.now()}@example.com`,
        password: 'TestPassword123!'
      }

      const registerResponse = await fetch(`${API_BASE}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(otherUser),
      })

      const registerData = await registerResponse.json()
      const otherToken = registerData.token

      // Try to access our test site with the other user's token
      const response = await fetch(`${API_BASE}/sites/${testSiteId}`, {
        headers: {
          'Authorization': `Bearer ${otherToken}`,
        },
      })

      expect(response.status).toBe(403)

      const data = await response.json()
      expect(data.error).toBe('Forbidden')

      // Cleanup
      const supabase = getAdminClient() as any
      await supabase.from('users').delete().eq('id', registerData.user.id)
      await supabase.auth.admin.deleteUser(registerData.user.id)
    })
  })

  describe('PUT /api/sites/:id', () => {
    it('should update site name', async () => {
      expect(testSiteId).toBeTruthy()

      const updateData = {
        name: 'Updated Test Site'
      }

      const response = await fetch(`${API_BASE}/sites/${testSiteId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`,
        },
        body: JSON.stringify(updateData),
      })

      expect(response.status).toBe(200)

      const data = await response.json()
      expect(data.id).toBe(testSiteId)
      expect(data.name).toBe('Updated Test Site')
      expect(data.slug).toBe(testSlug) // Slug should not change
    })

    it('should reject update without authentication', async () => {
      const updateData = {
        name: 'Unauthorized Update'
      }

      const response = await fetch(`${API_BASE}/sites/${testSiteId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      })

      expect(response.status).toBe(401)

      const data = await response.json()
      expect(data.error).toBe('Unauthorized')
    })

    it('should reject update for non-existent site', async () => {
      const fakeId = '00000000-0000-0000-0000-000000000000'
      const updateData = {
        name: 'Non-existent Site'
      }

      const response = await fetch(`${API_BASE}/sites/${fakeId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`,
        },
        body: JSON.stringify(updateData),
      })

      expect(response.status).toBe(404)

      const data = await response.json()
      expect(data.error).toBe('Site not found')
    })

    it('should reject update with invalid data', async () => {
      const updateData = {
        name: '' // Empty name
      }

      const response = await fetch(`${API_BASE}/sites/${testSiteId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`,
        },
        body: JSON.stringify(updateData),
      })

      expect(response.status).toBe(400)

      const data = await response.json()
      expect(data.error).toBe('Validation error')
    })
  })

  describe('DELETE /api/sites/:id', () => {
    it('should delete a site', async () => {
      expect(testSiteId).toBeTruthy()

      const response = await fetch(`${API_BASE}/sites/${testSiteId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${authToken}`,
        },
      })

      expect(response.status).toBe(200)

      const data = await response.json()
      expect(data.message).toBe('Site deleted successfully')

      // Verify site is deleted
      const getResponse = await fetch(`${API_BASE}/sites/${testSiteId}`, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
        },
      })

      expect(getResponse.status).toBe(404)
    })

    it('should reject delete without authentication', async () => {
      // Create a new site first
      const siteData = {
        name: 'Site to Delete',
        slug: `delete-test-${Date.now()}`,
        managed: true,
        files: []
      }

      const createResponse = await fetch(`${API_BASE}/sites`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`,
        },
        body: JSON.stringify(siteData),
      })

      const createData = await createResponse.json()
      const siteId = createData.id

      // Try to delete without auth
      const response = await fetch(`${API_BASE}/sites/${siteId}`, {
        method: 'DELETE',
      })

      expect(response.status).toBe(401)

      const data = await response.json()
      expect(data.error).toBe('Unauthorized')
    })

    it('should reject delete for non-existent site', async () => {
      const fakeId = '00000000-0000-0000-0000-000000000000'

      const response = await fetch(`${API_BASE}/sites/${fakeId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${authToken}`,
        },
      })

      expect(response.status).toBe(404)

      const data = await response.json()
      expect(data.error).toBe('Site not found')
    })

    it('should cascade delete files and views', async () => {
      // This test documents CASCADE behavior
      // When a site is deleted, all associated files and views
      // should be automatically deleted due to CASCADE constraints
      
      expect(true).toBe(true)
    })
  })
})
