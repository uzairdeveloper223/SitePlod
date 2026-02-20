/**
 * Unit tests for authentication utilities
 * 
 * Tests JWT token verification and error handling
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { verifyToken, requireAuth, AuthError } from '@/lib/auth-utils'
import * as supabaseModule from '@/lib/supabase'

// Mock the supabase module
vi.mock('./supabase', () => ({
  createAuthClient: vi.fn()
}))

describe('verifyToken', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should return user ID when token is valid', async () => {
    const mockUserId = 'user-123'
    const mockToken = 'valid-token'
    
    const mockSupabase = {
      auth: {
        getUser: vi.fn().mockResolvedValue({
          data: { user: { id: mockUserId } },
          error: null
        })
      }
    }
    
    vi.mocked(supabaseModule.createAuthClient).mockReturnValue(mockSupabase as any)
    
    const userId = await verifyToken(mockToken)
    
    expect(userId).toBe(mockUserId)
    expect(supabaseModule.createAuthClient).toHaveBeenCalledWith(mockToken)
    expect(mockSupabase.auth.getUser).toHaveBeenCalled()
  })

  it('should throw AuthError when token is empty', async () => {
    await expect(verifyToken('')).rejects.toThrow(AuthError)
    await expect(verifyToken('')).rejects.toThrow('No token provided')
  })

  it('should throw AuthError when token is whitespace', async () => {
    await expect(verifyToken('   ')).rejects.toThrow(AuthError)
    await expect(verifyToken('   ')).rejects.toThrow('No token provided')
  })

  it('should throw AuthError when token is expired', async () => {
    const mockToken = 'expired-token'
    
    const mockSupabase = {
      auth: {
        getUser: vi.fn().mockResolvedValue({
          data: { user: null },
          error: { message: 'Token expired' }
        })
      }
    }
    
    vi.mocked(supabaseModule.createAuthClient).mockReturnValue(mockSupabase as any)
    
    await expect(verifyToken(mockToken)).rejects.toThrow(AuthError)
    await expect(verifyToken(mockToken)).rejects.toThrow('Token has expired')
  })

  it('should throw AuthError when token is invalid', async () => {
    const mockToken = 'invalid-token'
    
    const mockSupabase = {
      auth: {
        getUser: vi.fn().mockResolvedValue({
          data: { user: null },
          error: { message: 'Invalid token format' }
        })
      }
    }
    
    vi.mocked(supabaseModule.createAuthClient).mockReturnValue(mockSupabase as any)
    
    await expect(verifyToken(mockToken)).rejects.toThrow(AuthError)
    await expect(verifyToken(mockToken)).rejects.toThrow('Invalid token')
  })

  it('should throw AuthError when user data is null', async () => {
    const mockToken = 'token-without-user'
    
    const mockSupabase = {
      auth: {
        getUser: vi.fn().mockResolvedValue({
          data: { user: null },
          error: null
        })
      }
    }
    
    vi.mocked(supabaseModule.createAuthClient).mockReturnValue(mockSupabase as any)
    
    await expect(verifyToken(mockToken)).rejects.toThrow(AuthError)
    await expect(verifyToken(mockToken)).rejects.toThrow('Invalid token')
  })

  it('should throw AuthError with custom message for other Supabase errors', async () => {
    const mockToken = 'error-token'
    const errorMessage = 'Database connection failed'
    
    const mockSupabase = {
      auth: {
        getUser: vi.fn().mockResolvedValue({
          data: { user: null },
          error: { message: errorMessage }
        })
      }
    }
    
    vi.mocked(supabaseModule.createAuthClient).mockReturnValue(mockSupabase as any)
    
    await expect(verifyToken(mockToken)).rejects.toThrow(AuthError)
    await expect(verifyToken(mockToken)).rejects.toThrow(errorMessage)
  })

  it('should wrap unexpected errors in AuthError', async () => {
    const mockToken = 'exception-token'
    
    const mockSupabase = {
      auth: {
        getUser: vi.fn().mockRejectedValue(new Error('Network error'))
      }
    }
    
    vi.mocked(supabaseModule.createAuthClient).mockReturnValue(mockSupabase as any)
    
    await expect(verifyToken(mockToken)).rejects.toThrow(AuthError)
    await expect(verifyToken(mockToken)).rejects.toThrow('Network error')
  })

  it('should have statusCode 401 for AuthError', async () => {
    try {
      await verifyToken('')
    } catch (error) {
      expect(error).toBeInstanceOf(AuthError)
      expect((error as AuthError).statusCode).toBe(401)
    }
  })
})

describe('requireAuth', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should return user ID when valid Bearer token is provided', async () => {
    const mockUserId = 'user-456'
    const mockToken = 'valid-bearer-token'
    
    const mockSupabase = {
      auth: {
        getUser: vi.fn().mockResolvedValue({
          data: { user: { id: mockUserId } },
          error: null
        })
      }
    }
    
    vi.mocked(supabaseModule.createAuthClient).mockReturnValue(mockSupabase as any)
    
    const mockRequest = new Request('http://localhost:3000/api/test', {
      headers: {
        'authorization': `Bearer ${mockToken}`
      }
    })
    
    const userId = await requireAuth(mockRequest)
    
    expect(userId).toBe(mockUserId)
    expect(supabaseModule.createAuthClient).toHaveBeenCalledWith(mockToken)
  })

  it('should handle Bearer with different casing', async () => {
    const mockUserId = 'user-789'
    const mockToken = 'case-insensitive-token'
    
    const mockSupabase = {
      auth: {
        getUser: vi.fn().mockResolvedValue({
          data: { user: { id: mockUserId } },
          error: null
        })
      }
    }
    
    vi.mocked(supabaseModule.createAuthClient).mockReturnValue(mockSupabase as any)
    
    const mockRequest = new Request('http://localhost:3000/api/test', {
      headers: {
        'authorization': `bearer ${mockToken}`
      }
    })
    
    const userId = await requireAuth(mockRequest)
    
    expect(userId).toBe(mockUserId)
    expect(supabaseModule.createAuthClient).toHaveBeenCalledWith(mockToken)
  })

  it('should throw AuthError when no authorization header is provided', async () => {
    const mockRequest = new Request('http://localhost:3000/api/test')
    
    await expect(requireAuth(mockRequest)).rejects.toThrow(AuthError)
    await expect(requireAuth(mockRequest)).rejects.toThrow('No authorization header provided')
  })

  it('should throw AuthError when authorization header has no Bearer prefix', async () => {
    const mockRequest = new Request('http://localhost:3000/api/test', {
      headers: {
        'authorization': 'just-a-token'
      }
    })
    
    await expect(requireAuth(mockRequest)).rejects.toThrow(AuthError)
    await expect(requireAuth(mockRequest)).rejects.toThrow('Invalid authorization header format')
  })

  it('should throw AuthError when Bearer token is empty', async () => {
    const mockRequest = new Request('http://localhost:3000/api/test', {
      headers: {
        'authorization': 'Bearer '
      }
    })
    
    await expect(requireAuth(mockRequest)).rejects.toThrow(AuthError)
    await expect(requireAuth(mockRequest)).rejects.toThrow('Invalid authorization header format')
  })

  it('should throw AuthError when token is invalid', async () => {
    const mockToken = 'invalid-token'
    
    const mockSupabase = {
      auth: {
        getUser: vi.fn().mockResolvedValue({
          data: { user: null },
          error: { message: 'Invalid token format' }
        })
      }
    }
    
    vi.mocked(supabaseModule.createAuthClient).mockReturnValue(mockSupabase as any)
    
    const mockRequest = new Request('http://localhost:3000/api/test', {
      headers: {
        'authorization': `Bearer ${mockToken}`
      }
    })
    
    await expect(requireAuth(mockRequest)).rejects.toThrow(AuthError)
    await expect(requireAuth(mockRequest)).rejects.toThrow('Invalid token')
  })

  it('should throw AuthError when token is expired', async () => {
    const mockToken = 'expired-token'
    
    const mockSupabase = {
      auth: {
        getUser: vi.fn().mockResolvedValue({
          data: { user: null },
          error: { message: 'Token expired' }
        })
      }
    }
    
    vi.mocked(supabaseModule.createAuthClient).mockReturnValue(mockSupabase as any)
    
    const mockRequest = new Request('http://localhost:3000/api/test', {
      headers: {
        'authorization': `Bearer ${mockToken}`
      }
    })
    
    await expect(requireAuth(mockRequest)).rejects.toThrow(AuthError)
    await expect(requireAuth(mockRequest)).rejects.toThrow('Token has expired')
  })

  it('should handle authorization header with extra spaces', async () => {
    const mockUserId = 'user-space'
    const mockToken = 'token-with-spaces'
    
    const mockSupabase = {
      auth: {
        getUser: vi.fn().mockResolvedValue({
          data: { user: { id: mockUserId } },
          error: null
        })
      }
    }
    
    vi.mocked(supabaseModule.createAuthClient).mockReturnValue(mockSupabase as any)
    
    const mockRequest = new Request('http://localhost:3000/api/test', {
      headers: {
        'authorization': `Bearer   ${mockToken}`
      }
    })
    
    const userId = await requireAuth(mockRequest)
    
    expect(userId).toBe(mockUserId)
  })

  it('should have statusCode 401 for all AuthErrors', async () => {
    const mockRequest = new Request('http://localhost:3000/api/test')
    
    try {
      await requireAuth(mockRequest)
    } catch (error) {
      expect(error).toBeInstanceOf(AuthError)
      expect((error as AuthError).statusCode).toBe(401)
    }
  })
})
