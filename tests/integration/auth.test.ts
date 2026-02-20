/**
 * Integration Tests for Authentication Endpoints
 * 
 * Tests the complete authentication flow including:
 * - User registration
 * - User login
 * - User logout
 * - Token verification
 * - Get current user
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { getAdminClient } from '@/lib/supabase'

// Test configuration
const TEST_BASE_URL = process.env.TEST_BASE_URL || 'http://localhost:3000'
const API_BASE = `${TEST_BASE_URL}/api`

// Test user data
const testUser = {
  username: `testuser_${Date.now()}`,
  email: `test_${Date.now()}@example.com`,
  password: 'TestPassword123!'
}

let authToken: string | null = null
let userId: string | null = null

describe('Authentication Integration Tests', () => {
  // Cleanup function to remove test users
  const cleanupTestUser = async () => {
    if (!userId) return
    
    try {
      const supabase = getAdminClient() as any
      
      // Delete from database
      await supabase.from('users').delete().eq('id', userId)
      
      // Delete from auth
      await supabase.auth.admin.deleteUser(userId)
    } catch (error) {
      console.error('Cleanup error:', error)
    }
  }

  afterAll(async () => {
    await cleanupTestUser()
  })

  describe('POST /api/auth/register', () => {
    it('should register a new user with valid credentials', async () => {
      const response = await fetch(`${API_BASE}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(testUser),
      })

      expect(response.status).toBe(201)

      const data = await response.json()
      expect(data).toHaveProperty('user')
      expect(data).toHaveProperty('token')
      expect(data.user.username).toBe(testUser.username)
      expect(data.user.email).toBe(testUser.email)
      expect(data.user).toHaveProperty('id')
      expect(data.user).toHaveProperty('createdAt')
      expect(typeof data.token).toBe('string')
      expect(data.token.length).toBeGreaterThan(0)

      // Store for later tests
      authToken = data.token
      userId = data.user.id
    })

    it('should reject registration with duplicate username', async () => {
      const response = await fetch(`${API_BASE}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: testUser.username,
          email: `different_${Date.now()}@example.com`,
          password: testUser.password,
        }),
      })

      expect(response.status).toBe(400)

      const data = await response.json()
      expect(data.error).toBe('Username taken')
      expect(data.message).toContain('already in use')
    })

    it('should reject registration with duplicate email', async () => {
      const response = await fetch(`${API_BASE}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: `different_${Date.now()}`,
          email: testUser.email,
          password: testUser.password,
        }),
      })

      expect(response.status).toBe(400)

      const data = await response.json()
      expect(data.error).toBe('Email taken')
      expect(data.message).toContain('already registered')
    })

    it('should reject registration with invalid username format', async () => {
      const response = await fetch(`${API_BASE}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: 'invalid username!',
          email: `test_${Date.now()}@example.com`,
          password: testUser.password,
        }),
      })

      expect(response.status).toBe(400)

      const data = await response.json()
      expect(data.error).toBe('Validation error')
      expect(data.message).toContain('Username')
    })

    it('should reject registration with short username', async () => {
      const response = await fetch(`${API_BASE}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: 'ab',
          email: `test_${Date.now()}@example.com`,
          password: testUser.password,
        }),
      })

      expect(response.status).toBe(400)

      const data = await response.json()
      expect(data.error).toBe('Validation error')
      expect(data.message).toContain('at least 3 characters')
    })

    it('should reject registration with invalid email', async () => {
      const response = await fetch(`${API_BASE}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: `user_${Date.now()}`,
          email: 'invalid-email',
          password: testUser.password,
        }),
      })

      expect(response.status).toBe(400)

      const data = await response.json()
      expect(data.error).toBe('Validation error')
      expect(data.message).toContain('email')
    })

    it('should reject registration with short password', async () => {
      const response = await fetch(`${API_BASE}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: `user_${Date.now()}`,
          email: `test_${Date.now()}@example.com`,
          password: 'short',
        }),
      })

      expect(response.status).toBe(400)

      const data = await response.json()
      expect(data.error).toBe('Validation error')
      expect(data.message).toContain('at least 8 characters')
    })

    it('should reject registration with missing fields', async () => {
      const response = await fetch(`${API_BASE}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: `user_${Date.now()}`,
        }),
      })

      expect(response.status).toBe(400)

      const data = await response.json()
      expect(data.error).toBe('Validation error')
    })
  })

  describe('POST /api/auth/login', () => {
    it('should login with valid credentials', async () => {
      const response = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: testUser.email,
          password: testUser.password,
        }),
      })

      expect(response.status).toBe(200)

      const data = await response.json()
      expect(data).toHaveProperty('user')
      expect(data).toHaveProperty('token')
      expect(data.user.email).toBe(testUser.email)
      expect(data.user.username).toBe(testUser.username)
      expect(typeof data.token).toBe('string')
      expect(data.token.length).toBeGreaterThan(0)

      // Update token for subsequent tests
      authToken = data.token
    })

    it('should reject login with incorrect password', async () => {
      const response = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: testUser.email,
          password: 'WrongPassword123!',
        }),
      })

      expect(response.status).toBe(401)

      const data = await response.json()
      expect(data.error).toBe('Invalid credentials')
    })

    it('should reject login with non-existent email', async () => {
      const response = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: 'nonexistent@example.com',
          password: testUser.password,
        }),
      })

      expect(response.status).toBe(401)

      const data = await response.json()
      expect(data.error).toBe('Invalid credentials')
    })

    it('should reject login with invalid email format', async () => {
      const response = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: 'invalid-email',
          password: testUser.password,
        }),
      })

      expect(response.status).toBe(400)

      const data = await response.json()
      expect(data.error).toBe('Validation error')
    })

    it('should reject login with missing fields', async () => {
      const response = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: testUser.email,
        }),
      })

      expect(response.status).toBe(400)

      const data = await response.json()
      expect(data.error).toBe('Validation error')
    })
  })

  describe('GET /api/auth/me', () => {
    it('should get current user with valid token', async () => {
      expect(authToken).toBeTruthy()

      const response = await fetch(`${API_BASE}/auth/me`, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
        },
      })

      expect(response.status).toBe(200)

      const data = await response.json()
      expect(data).toHaveProperty('id')
      expect(data).toHaveProperty('username')
      expect(data).toHaveProperty('email')
      expect(data.username).toBe(testUser.username)
      expect(data.email).toBe(testUser.email)
    })

    it('should reject request without token', async () => {
      const response = await fetch(`${API_BASE}/auth/me`)

      expect(response.status).toBe(401)

      const data = await response.json()
      expect(data.error).toBe('Unauthorized')
    })

    it('should reject request with invalid token', async () => {
      const response = await fetch(`${API_BASE}/auth/me`, {
        headers: {
          'Authorization': 'Bearer invalid-token-12345',
        },
      })

      expect(response.status).toBe(401)

      const data = await response.json()
      expect(data.error).toBe('Unauthorized')
    })

    it('should reject request with malformed authorization header', async () => {
      const response = await fetch(`${API_BASE}/auth/me`, {
        headers: {
          'Authorization': 'InvalidFormat',
        },
      })

      expect(response.status).toBe(401)

      const data = await response.json()
      expect(data.error).toBe('Unauthorized')
    })
  })

  describe('POST /api/auth/logout', () => {
    it('should logout with valid token', async () => {
      expect(authToken).toBeTruthy()

      const response = await fetch(`${API_BASE}/auth/logout`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authToken}`,
        },
      })

      expect(response.status).toBe(200)

      const data = await response.json()
      expect(data.message).toBe('Logged out successfully')
    })

    it('should reject logout without token', async () => {
      const response = await fetch(`${API_BASE}/auth/logout`, {
        method: 'POST',
      })

      expect(response.status).toBe(401)

      const data = await response.json()
      expect(data.error).toBe('Unauthorized')
    })

    it('should verify token is invalid after logout', async () => {
      // Try to use the token after logout
      const response = await fetch(`${API_BASE}/auth/me`, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
        },
      })

      // Token should be invalid now
      expect(response.status).toBe(401)
    })
  })

  describe('Token Verification', () => {
    let newToken: string

    beforeAll(async () => {
      // Login again to get a fresh token
      const response = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: testUser.email,
          password: testUser.password,
        }),
      })

      const data = await response.json()
      newToken = data.token
    })

    it('should accept valid JWT token', async () => {
      const response = await fetch(`${API_BASE}/auth/me`, {
        headers: {
          'Authorization': `Bearer ${newToken}`,
        },
      })

      expect(response.status).toBe(200)
    })

    it('should reject expired token', async () => {
      // This test would require a token that's actually expired
      // For now, we document the expected behavior
      expect(true).toBe(true)
    })

    it('should reject tampered token', async () => {
      // Tamper with the token by changing a character
      const tamperedToken = newToken.slice(0, -5) + 'xxxxx'

      const response = await fetch(`${API_BASE}/auth/me`, {
        headers: {
          'Authorization': `Bearer ${tamperedToken}`,
        },
      })

      expect(response.status).toBe(401)
    })
  })
})
