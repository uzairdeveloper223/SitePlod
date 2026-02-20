/**
 * Tests for environment variable validation
 * 
 * Requirements: 20
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { validateEnv, getEnv, isEmailConfigured, isRedisConfigured, clearEnvCache } from '@/lib/env-validation'

describe('Environment Validation', () => {
  const originalEnv = process.env

  beforeEach(() => {
    // Reset environment before each test
    process.env = { ...originalEnv }
    clearEnvCache()
  })

  afterEach(() => {
    // Restore original environment
    process.env = originalEnv
    clearEnvCache()
  })

  describe('validateEnv', () => {
    it('should pass with all required variables set', () => {
      process.env.SUPABASE_URL = 'https://test.supabase.co'
      process.env.SUPABASE_ANON_KEY = 'test_anon_key'
      process.env.SUPABASE_SERVICE_KEY = 'test_service_key'
      process.env.PASTEBIN_API_KEY = 'test_pastebin_key'
      process.env.IMGBB_API_KEY = 'test_imgbb_key'
      process.env.NEXT_PUBLIC_BASE_URL = 'http://localhost:3000'
      process.env.JWT_SECRET = 'a'.repeat(32)

      expect(() => validateEnv()).not.toThrow()
    })

    it('should throw error when SUPABASE_URL is missing', () => {
      process.env.SUPABASE_ANON_KEY = 'test_anon_key'
      process.env.SUPABASE_SERVICE_KEY = 'test_service_key'
      process.env.PASTEBIN_API_KEY = 'test_pastebin_key'
      process.env.IMGBB_API_KEY = 'test_imgbb_key'
      process.env.NEXT_PUBLIC_BASE_URL = 'http://localhost:3000'
      process.env.JWT_SECRET = 'a'.repeat(32)

      expect(() => validateEnv()).toThrow(/SUPABASE_URL/)
    })

    it('should throw error when JWT_SECRET is too short', () => {
      process.env.SUPABASE_URL = 'https://test.supabase.co'
      process.env.SUPABASE_ANON_KEY = 'test_anon_key'
      process.env.SUPABASE_SERVICE_KEY = 'test_service_key'
      process.env.PASTEBIN_API_KEY = 'test_pastebin_key'
      process.env.IMGBB_API_KEY = 'test_imgbb_key'
      process.env.NEXT_PUBLIC_BASE_URL = 'http://localhost:3000'
      process.env.JWT_SECRET = 'short'

      expect(() => validateEnv()).toThrow(/JWT_SECRET/)
    })

    it('should throw error when SUPABASE_URL does not start with https://', () => {
      process.env.SUPABASE_URL = 'http://test.supabase.co'
      process.env.SUPABASE_ANON_KEY = 'test_anon_key'
      process.env.SUPABASE_SERVICE_KEY = 'test_service_key'
      process.env.PASTEBIN_API_KEY = 'test_pastebin_key'
      process.env.IMGBB_API_KEY = 'test_imgbb_key'
      process.env.NEXT_PUBLIC_BASE_URL = 'http://localhost:3000'
      process.env.JWT_SECRET = 'a'.repeat(32)

      expect(() => validateEnv()).toThrow(/SUPABASE_URL/)
    })

    it('should throw error when multiple variables are missing', () => {
      process.env.SUPABASE_URL = 'https://test.supabase.co'

      expect(() => validateEnv()).toThrow()
    })
  })

  describe('isEmailConfigured', () => {
    it('should return true when both SMTP variables are set', () => {
      process.env.SUPABASE_URL = 'https://test.supabase.co'
      process.env.SUPABASE_ANON_KEY = 'test_anon_key'
      process.env.SUPABASE_SERVICE_KEY = 'test_service_key'
      process.env.PASTEBIN_API_KEY = 'test_pastebin_key'
      process.env.IMGBB_API_KEY = 'test_imgbb_key'
      process.env.NEXT_PUBLIC_BASE_URL = 'http://localhost:3000'
      process.env.JWT_SECRET = 'a'.repeat(32)
      process.env.SMTP_USER = 'user@example.com'
      process.env.SMTP_PASSWORD = 'password'

      expect(isEmailConfigured()).toBe(true)
    })

    it('should return false when SMTP variables are not set', () => {
      process.env.SUPABASE_URL = 'https://test.supabase.co'
      process.env.SUPABASE_ANON_KEY = 'test_anon_key'
      process.env.SUPABASE_SERVICE_KEY = 'test_service_key'
      process.env.PASTEBIN_API_KEY = 'test_pastebin_key'
      process.env.IMGBB_API_KEY = 'test_imgbb_key'
      process.env.NEXT_PUBLIC_BASE_URL = 'http://localhost:3000'
      process.env.JWT_SECRET = 'a'.repeat(32)

      expect(isEmailConfigured()).toBe(false)
    })
  })

  describe('isRedisConfigured', () => {
    it('should return true when REDIS_URL is set', () => {
      process.env.SUPABASE_URL = 'https://test.supabase.co'
      process.env.SUPABASE_ANON_KEY = 'test_anon_key'
      process.env.SUPABASE_SERVICE_KEY = 'test_service_key'
      process.env.PASTEBIN_API_KEY = 'test_pastebin_key'
      process.env.IMGBB_API_KEY = 'test_imgbb_key'
      process.env.NEXT_PUBLIC_BASE_URL = 'http://localhost:3000'
      process.env.JWT_SECRET = 'a'.repeat(32)
      process.env.REDIS_URL = 'redis://localhost:6379'

      expect(isRedisConfigured()).toBe(true)
    })

    it('should return false when REDIS_URL is not set', () => {
      process.env.SUPABASE_URL = 'https://test.supabase.co'
      process.env.SUPABASE_ANON_KEY = 'test_anon_key'
      process.env.SUPABASE_SERVICE_KEY = 'test_service_key'
      process.env.PASTEBIN_API_KEY = 'test_pastebin_key'
      process.env.IMGBB_API_KEY = 'test_imgbb_key'
      process.env.NEXT_PUBLIC_BASE_URL = 'http://localhost:3000'
      process.env.JWT_SECRET = 'a'.repeat(32)

      expect(isRedisConfigured()).toBe(false)
    })
  })
})
