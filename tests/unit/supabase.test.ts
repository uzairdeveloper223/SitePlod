/**
 * Tests for Supabase Client Utilities
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { getAdminClient, getAnonClient, createAuthClient, clearClientCache } from '@/lib/supabase'
import { clearEnvCache } from '@/lib/env-validation'

describe('Supabase Client Utilities', () => {
  const originalEnv = process.env

  beforeEach(() => {
    // Reset environment and caches before each test
    process.env = { ...originalEnv }
    clearClientCache()
    clearEnvCache()
  })

  afterEach(() => {
    // Restore original environment
    process.env = originalEnv
    clearClientCache()
    clearEnvCache()
  })

  describe('getAdminClient', () => {
    it('should create admin client with valid credentials', () => {
      process.env.SUPABASE_URL = 'https://test.supabase.co'
      process.env.SUPABASE_SERVICE_KEY = 'test-service-key-12345678901234567890'
      process.env.SUPABASE_ANON_KEY = 'test-anon-key'
      process.env.PASTEBIN_API_KEY = 'test-pastebin-key'
      process.env.IMGBB_API_KEY = 'test-imgbb-key'
      process.env.NEXT_PUBLIC_BASE_URL = 'http://localhost:3000'
      process.env.JWT_SECRET = 'test-jwt-secret-12345678901234567890'

      const client = getAdminClient()
      expect(client).toBeDefined()
    })

    it('should return same instance on multiple calls', () => {
      process.env.SUPABASE_URL = 'https://test.supabase.co'
      process.env.SUPABASE_SERVICE_KEY = 'test-service-key-12345678901234567890'
      process.env.SUPABASE_ANON_KEY = 'test-anon-key'
      process.env.PASTEBIN_API_KEY = 'test-pastebin-key'
      process.env.IMGBB_API_KEY = 'test-imgbb-key'
      process.env.NEXT_PUBLIC_BASE_URL = 'http://localhost:3000'
      process.env.JWT_SECRET = 'test-jwt-secret-12345678901234567890'

      const client1 = getAdminClient()
      const client2 = getAdminClient()
      expect(client1).toBe(client2)
    })

    it('should throw error when SUPABASE_URL is missing', () => {
      process.env.SUPABASE_SERVICE_KEY = 'test-service-key-12345678901234567890'
      process.env.SUPABASE_ANON_KEY = 'test-anon-key'
      process.env.PASTEBIN_API_KEY = 'test-pastebin-key'
      process.env.IMGBB_API_KEY = 'test-imgbb-key'
      process.env.NEXT_PUBLIC_BASE_URL = 'http://localhost:3000'
      process.env.JWT_SECRET = 'test-jwt-secret-12345678901234567890'

      expect(() => getAdminClient()).toThrow(/SUPABASE_URL/)
    })

    it('should throw error when SUPABASE_SERVICE_KEY is missing', () => {
      process.env.SUPABASE_URL = 'https://test.supabase.co'
      process.env.SUPABASE_ANON_KEY = 'test-anon-key'
      process.env.PASTEBIN_API_KEY = 'test-pastebin-key'
      process.env.IMGBB_API_KEY = 'test-imgbb-key'
      process.env.NEXT_PUBLIC_BASE_URL = 'http://localhost:3000'
      process.env.JWT_SECRET = 'test-jwt-secret-12345678901234567890'

      expect(() => getAdminClient()).toThrow(/SUPABASE_SERVICE_KEY/)
    })
  })

  describe('getAnonClient', () => {
    it('should create anon client with valid credentials', () => {
      process.env.SUPABASE_URL = 'https://test.supabase.co'
      process.env.SUPABASE_ANON_KEY = 'test-anon-key'
      process.env.SUPABASE_SERVICE_KEY = 'test-service-key-12345678901234567890'
      process.env.PASTEBIN_API_KEY = 'test-pastebin-key'
      process.env.IMGBB_API_KEY = 'test-imgbb-key'
      process.env.NEXT_PUBLIC_BASE_URL = 'http://localhost:3000'
      process.env.JWT_SECRET = 'test-jwt-secret-12345678901234567890'

      const client = getAnonClient()
      expect(client).toBeDefined()
    })

    it('should return same instance on multiple calls', () => {
      process.env.SUPABASE_URL = 'https://test.supabase.co'
      process.env.SUPABASE_ANON_KEY = 'test-anon-key'
      process.env.SUPABASE_SERVICE_KEY = 'test-service-key-12345678901234567890'
      process.env.PASTEBIN_API_KEY = 'test-pastebin-key'
      process.env.IMGBB_API_KEY = 'test-imgbb-key'
      process.env.NEXT_PUBLIC_BASE_URL = 'http://localhost:3000'
      process.env.JWT_SECRET = 'test-jwt-secret-12345678901234567890'

      const client1 = getAnonClient()
      const client2 = getAnonClient()
      expect(client1).toBe(client2)
    })

    it('should throw error when SUPABASE_URL is missing', () => {
      process.env.SUPABASE_ANON_KEY = 'test-anon-key'
      process.env.SUPABASE_SERVICE_KEY = 'test-service-key-12345678901234567890'
      process.env.PASTEBIN_API_KEY = 'test-pastebin-key'
      process.env.IMGBB_API_KEY = 'test-imgbb-key'
      process.env.NEXT_PUBLIC_BASE_URL = 'http://localhost:3000'
      process.env.JWT_SECRET = 'test-jwt-secret-12345678901234567890'

      expect(() => getAnonClient()).toThrow(/SUPABASE_URL/)
    })

    it('should throw error when SUPABASE_ANON_KEY is missing', () => {
      process.env.SUPABASE_URL = 'https://test.supabase.co'
      process.env.SUPABASE_SERVICE_KEY = 'test-service-key-12345678901234567890'
      process.env.PASTEBIN_API_KEY = 'test-pastebin-key'
      process.env.IMGBB_API_KEY = 'test-imgbb-key'
      process.env.NEXT_PUBLIC_BASE_URL = 'http://localhost:3000'
      process.env.JWT_SECRET = 'test-jwt-secret-12345678901234567890'

      expect(() => getAnonClient()).toThrow(/SUPABASE_ANON_KEY/)
    })
  })

  describe('createAuthClient', () => {
    it('should create authenticated client with access token', () => {
      process.env.SUPABASE_URL = 'https://test.supabase.co'
      process.env.SUPABASE_ANON_KEY = 'test-anon-key'
      process.env.SUPABASE_SERVICE_KEY = 'test-service-key-12345678901234567890'
      process.env.PASTEBIN_API_KEY = 'test-pastebin-key'
      process.env.IMGBB_API_KEY = 'test-imgbb-key'
      process.env.NEXT_PUBLIC_BASE_URL = 'http://localhost:3000'
      process.env.JWT_SECRET = 'test-jwt-secret-12345678901234567890'

      const client = createAuthClient('test-access-token')
      expect(client).toBeDefined()
    })

    it('should create new instance on each call', () => {
      process.env.SUPABASE_URL = 'https://test.supabase.co'
      process.env.SUPABASE_ANON_KEY = 'test-anon-key'
      process.env.SUPABASE_SERVICE_KEY = 'test-service-key-12345678901234567890'
      process.env.PASTEBIN_API_KEY = 'test-pastebin-key'
      process.env.IMGBB_API_KEY = 'test-imgbb-key'
      process.env.NEXT_PUBLIC_BASE_URL = 'http://localhost:3000'
      process.env.JWT_SECRET = 'test-jwt-secret-12345678901234567890'

      const client1 = createAuthClient('token1')
      const client2 = createAuthClient('token2')
      expect(client1).not.toBe(client2)
    })

    it('should throw error when SUPABASE_URL is missing', () => {
      process.env.SUPABASE_ANON_KEY = 'test-anon-key'
      process.env.SUPABASE_SERVICE_KEY = 'test-service-key-12345678901234567890'
      process.env.PASTEBIN_API_KEY = 'test-pastebin-key'
      process.env.IMGBB_API_KEY = 'test-imgbb-key'
      process.env.NEXT_PUBLIC_BASE_URL = 'http://localhost:3000'
      process.env.JWT_SECRET = 'test-jwt-secret-12345678901234567890'

      expect(() => createAuthClient('test-token')).toThrow(/SUPABASE_URL/)
    })

    it('should throw error when SUPABASE_ANON_KEY is missing', () => {
      process.env.SUPABASE_URL = 'https://test.supabase.co'
      process.env.SUPABASE_SERVICE_KEY = 'test-service-key-12345678901234567890'
      process.env.PASTEBIN_API_KEY = 'test-pastebin-key'
      process.env.IMGBB_API_KEY = 'test-imgbb-key'
      process.env.NEXT_PUBLIC_BASE_URL = 'http://localhost:3000'
      process.env.JWT_SECRET = 'test-jwt-secret-12345678901234567890'

      expect(() => createAuthClient('test-token')).toThrow(/SUPABASE_ANON_KEY/)
    })
  })

  describe('clearClientCache', () => {
    it('should clear cached clients', () => {
      process.env.SUPABASE_URL = 'https://test.supabase.co'
      process.env.SUPABASE_ANON_KEY = 'test-anon-key'
      process.env.SUPABASE_SERVICE_KEY = 'test-service-key-12345678901234567890'
      process.env.PASTEBIN_API_KEY = 'test-pastebin-key'
      process.env.IMGBB_API_KEY = 'test-imgbb-key'
      process.env.NEXT_PUBLIC_BASE_URL = 'http://localhost:3000'
      process.env.JWT_SECRET = 'test-jwt-secret-12345678901234567890'

      const client1 = getAdminClient()
      clearClientCache()
      const client2 = getAdminClient()
      
      expect(client1).not.toBe(client2)
    })
  })
})
