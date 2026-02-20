/**
 * Unit tests for Pastebin upload utility
 * 
 * Tests text file upload functionality, error handling, and API integration
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import axios from 'axios'
import { uploadToPastebin, PastebinUploadError } from '@/lib/pastebin'

// Mock axios
vi.mock('axios')
const mockedAxios = vi.mocked(axios)

describe('uploadToPastebin', () => {
  const originalEnv = process.env

  beforeEach(() => {
    // Reset mocks before each test
    vi.clearAllMocks()
    
    // Set up environment
    process.env = { ...originalEnv }
    process.env.PASTEBIN_API_KEY = 'test_pastebin_key_12345'
  })

  afterEach(() => {
    // Restore original environment
    process.env = originalEnv
  })

  describe('successful uploads', () => {
    it('should upload text content and return Pastebin URL', async () => {
      const content = '<html><body>Hello World</body></html>'
      const filename = 'index.html'
      const mockUrl = 'https://pastebin.com/abc123XY'

      mockedAxios.post.mockResolvedValueOnce({
        data: mockUrl
      })

      const result = await uploadToPastebin(content, filename)

      expect(result).toBe(mockUrl)
      expect(mockedAxios.post).toHaveBeenCalledTimes(1)
      expect(mockedAxios.post).toHaveBeenCalledWith(
        'https://pastebin.com/api/api_post.php',
        expect.any(Object),
        expect.objectContaining({
          headers: expect.any(Object),
          timeout: 30000
        })
      )
    })

    it('should upload CSS content', async () => {
      const content = 'body { margin: 0; padding: 0; }'
      const filename = 'styles.css'
      const mockUrl = 'https://pastebin.com/xyz789AB'

      mockedAxios.post.mockResolvedValueOnce({
        data: mockUrl
      })

      const result = await uploadToPastebin(content, filename)

      expect(result).toBe(mockUrl)
    })

    it('should upload JavaScript content', async () => {
      const content = 'console.log("Hello from Pastebin");'
      const filename = 'script.js'
      const mockUrl = 'https://pastebin.com/def456CD'

      mockedAxios.post.mockResolvedValueOnce({
        data: mockUrl
      })

      const result = await uploadToPastebin(content, filename)

      expect(result).toBe(mockUrl)
    })

    it('should handle large text content', async () => {
      // Create a large HTML file (1MB)
      const largeContent = '<html><body>' + 'a'.repeat(1024 * 1024) + '</body></html>'
      const filename = 'large.html'
      const mockUrl = 'https://pastebin.com/large123'

      mockedAxios.post.mockResolvedValueOnce({
        data: mockUrl
      })

      const result = await uploadToPastebin(largeContent, filename)

      expect(result).toBe(mockUrl)
    })

    it('should trim whitespace from response URL', async () => {
      const content = '<html></html>'
      const filename = 'test.html'
      const mockUrl = '  https://pastebin.com/trimmed123  \n'

      mockedAxios.post.mockResolvedValueOnce({
        data: mockUrl
      })

      const result = await uploadToPastebin(content, filename)

      expect(result).toBe('https://pastebin.com/trimmed123')
    })
  })

  describe('environment validation', () => {
    it('should throw error if PASTEBIN_API_KEY is not set', async () => {
      delete process.env.PASTEBIN_API_KEY

      const content = '<html></html>'
      const filename = 'test.html'

      await expect(uploadToPastebin(content, filename)).rejects.toThrow(PastebinUploadError)
      await expect(uploadToPastebin(content, filename)).rejects.toThrow(
        'PASTEBIN_API_KEY environment variable is not set'
      )
    })

    it('should throw error with status code 500 for missing API key', async () => {
      delete process.env.PASTEBIN_API_KEY

      const content = '<html></html>'
      const filename = 'test.html'

      try {
        await uploadToPastebin(content, filename)
        expect.fail('Should have thrown an error')
      } catch (error) {
        expect(error).toBeInstanceOf(PastebinUploadError)
        expect((error as PastebinUploadError).statusCode).toBe(500)
      }
    })
  })

  describe('input validation', () => {
    it('should throw error for empty content', async () => {
      const content = ''
      const filename = 'test.html'

      await expect(uploadToPastebin(content, filename)).rejects.toThrow(PastebinUploadError)
      await expect(uploadToPastebin(content, filename)).rejects.toThrow(
        'Content is empty or invalid'
      )
    })

    it('should throw error for whitespace-only content', async () => {
      const content = '   \n\t  '
      const filename = 'test.html'

      await expect(uploadToPastebin(content, filename)).rejects.toThrow(PastebinUploadError)
      await expect(uploadToPastebin(content, filename)).rejects.toThrow(
        'Content is empty or invalid'
      )
    })

    it('should throw error with status code 400 for empty content', async () => {
      const content = ''
      const filename = 'test.html'

      try {
        await uploadToPastebin(content, filename)
        expect.fail('Should have thrown an error')
      } catch (error) {
        expect(error).toBeInstanceOf(PastebinUploadError)
        expect((error as PastebinUploadError).statusCode).toBe(400)
      }
    })

    it('should throw error for empty filename', async () => {
      const content = '<html></html>'
      const filename = ''

      await expect(uploadToPastebin(content, filename)).rejects.toThrow(PastebinUploadError)
      await expect(uploadToPastebin(content, filename)).rejects.toThrow(
        'Filename is required'
      )
    })

    it('should throw error for whitespace-only filename', async () => {
      const content = '<html></html>'
      const filename = '   '

      await expect(uploadToPastebin(content, filename)).rejects.toThrow(PastebinUploadError)
      await expect(uploadToPastebin(content, filename)).rejects.toThrow(
        'Filename is required'
      )
    })
  })

  describe('API error handling', () => {
    it('should handle rate limit errors (429)', async () => {
      const content = '<html></html>'
      const filename = 'test.html'

      mockedAxios.post.mockRejectedValue({
        isAxiosError: true,
        response: {
          status: 429,
          data: {}
        },
        message: 'Rate limit exceeded'
      })

      mockedAxios.isAxiosError = vi.fn().mockReturnValue(true)

      await expect(uploadToPastebin(content, filename)).rejects.toThrow(PastebinUploadError)
      await expect(uploadToPastebin(content, filename)).rejects.toThrow(
        'Pastebin API rate limit exceeded'
      )
    })

    it('should handle authentication errors (401)', async () => {
      const content = '<html></html>'
      const filename = 'test.html'

      mockedAxios.post.mockRejectedValue({
        isAxiosError: true,
        response: {
          status: 401,
          data: {}
        },
        message: 'Unauthorized'
      })

      mockedAxios.isAxiosError = vi.fn().mockReturnValue(true)

      await expect(uploadToPastebin(content, filename)).rejects.toThrow(PastebinUploadError)
      await expect(uploadToPastebin(content, filename)).rejects.toThrow('Invalid Pastebin API key')
    })

    it('should handle forbidden errors (403)', async () => {
      const content = '<html></html>'
      const filename = 'test.html'

      mockedAxios.post.mockRejectedValue({
        isAxiosError: true,
        response: {
          status: 403,
          data: {}
        },
        message: 'Forbidden'
      })

      mockedAxios.isAxiosError = vi.fn().mockReturnValue(true)

      await expect(uploadToPastebin(content, filename)).rejects.toThrow(PastebinUploadError)
      await expect(uploadToPastebin(content, filename)).rejects.toThrow('Invalid Pastebin API key')
    })

    it('should handle bad request errors (400)', async () => {
      const content = '<html></html>'
      const filename = 'test.html'

      mockedAxios.post.mockRejectedValue({
        isAxiosError: true,
        response: {
          status: 400,
          data: {}
        },
        message: 'Bad request'
      })

      mockedAxios.isAxiosError = vi.fn().mockReturnValue(true)

      await expect(uploadToPastebin(content, filename)).rejects.toThrow(PastebinUploadError)
      await expect(uploadToPastebin(content, filename)).rejects.toThrow('Invalid request')
    })

    it('should handle timeout errors', async () => {
      const content = '<html></html>'
      const filename = 'test.html'

      mockedAxios.post.mockRejectedValue({
        isAxiosError: true,
        code: 'ECONNABORTED',
        message: 'timeout of 30000ms exceeded'
      })

      mockedAxios.isAxiosError = vi.fn().mockReturnValue(true)

      await expect(uploadToPastebin(content, filename)).rejects.toThrow(PastebinUploadError)
      await expect(uploadToPastebin(content, filename)).rejects.toThrow('Pastebin upload timed out')
    })

    it('should handle network errors (ENOTFOUND)', async () => {
      const content = '<html></html>'
      const filename = 'test.html'

      mockedAxios.post.mockRejectedValue({
        isAxiosError: true,
        code: 'ENOTFOUND',
        message: 'getaddrinfo ENOTFOUND pastebin.com'
      })

      mockedAxios.isAxiosError = vi.fn().mockReturnValue(true)

      await expect(uploadToPastebin(content, filename)).rejects.toThrow(PastebinUploadError)
      await expect(uploadToPastebin(content, filename)).rejects.toThrow(
        'Unable to connect to Pastebin API'
      )
    })

    it('should handle connection refused errors', async () => {
      const content = '<html></html>'
      const filename = 'test.html'

      mockedAxios.post.mockRejectedValue({
        isAxiosError: true,
        code: 'ECONNREFUSED',
        message: 'connect ECONNREFUSED'
      })

      mockedAxios.isAxiosError = vi.fn().mockReturnValue(true)

      await expect(uploadToPastebin(content, filename)).rejects.toThrow(PastebinUploadError)
      await expect(uploadToPastebin(content, filename)).rejects.toThrow(
        'Unable to connect to Pastebin API'
      )
    })

    it('should handle generic axios errors', async () => {
      const content = '<html></html>'
      const filename = 'test.html'

      mockedAxios.post.mockRejectedValue({
        isAxiosError: true,
        response: {
          status: 500,
          data: {}
        },
        message: 'Internal server error'
      })

      mockedAxios.isAxiosError = vi.fn().mockReturnValue(true)

      await expect(uploadToPastebin(content, filename)).rejects.toThrow(PastebinUploadError)
      
      try {
        await uploadToPastebin(content, filename)
        expect.fail('Should have thrown an error')
      } catch (error) {
        expect(error).toBeInstanceOf(PastebinUploadError)
        expect((error as PastebinUploadError).statusCode).toBe(500)
      }
    })

    it('should handle Pastebin API error messages', async () => {
      const content = '<html></html>'
      const filename = 'test.html'

      // Pastebin returns error messages as plain text
      mockedAxios.post.mockResolvedValue({
        data: 'Bad API request, invalid api_dev_key'
      })

      await expect(uploadToPastebin(content, filename)).rejects.toThrow(PastebinUploadError)
      await expect(uploadToPastebin(content, filename)).rejects.toThrow(
        'Pastebin API error: Bad API request, invalid api_dev_key'
      )
    })

    it('should reject non-Pastebin URLs in response', async () => {
      const content = '<html></html>'
      const filename = 'test.html'

      mockedAxios.post.mockResolvedValue({
        data: 'https://malicious-site.com/fake'
      })

      await expect(uploadToPastebin(content, filename)).rejects.toThrow(PastebinUploadError)
    })
  })

  describe('error object properties', () => {
    it('should create PastebinUploadError with correct properties', () => {
      const error = new PastebinUploadError('Test error', 400, new Error('Original'))

      expect(error).toBeInstanceOf(Error)
      expect(error).toBeInstanceOf(PastebinUploadError)
      expect(error.message).toBe('Test error')
      expect(error.statusCode).toBe(400)
      expect(error.originalError).toBeInstanceOf(Error)
      expect(error.name).toBe('PastebinUploadError')
    })

    it('should create PastebinUploadError without optional properties', () => {
      const error = new PastebinUploadError('Test error')

      expect(error.message).toBe('Test error')
      expect(error.statusCode).toBeUndefined()
      expect(error.originalError).toBeUndefined()
    })

    it('should preserve original error in PastebinUploadError', async () => {
      const content = '<html></html>'
      const filename = 'test.html'

      mockedAxios.post.mockRejectedValueOnce({
        isAxiosError: true,
        code: 'ENOTFOUND',
        message: 'Network failure'
      })

      mockedAxios.isAxiosError = vi.fn().mockReturnValue(true)

      try {
        await uploadToPastebin(content, filename)
        expect.fail('Should have thrown an error')
      } catch (error) {
        expect(error).toBeInstanceOf(PastebinUploadError)
        expect((error as PastebinUploadError).originalError).toBeDefined()
      }
    })
  })

  describe('API request configuration', () => {
    it('should send correct form data fields', async () => {
      const content = '<html><body>Test</body></html>'
      const filename = 'test.html'
      const mockUrl = 'https://pastebin.com/test123'

      mockedAxios.post.mockResolvedValueOnce({
        data: mockUrl
      })

      await uploadToPastebin(content, filename)

      expect(mockedAxios.post).toHaveBeenCalledWith(
        'https://pastebin.com/api/api_post.php',
        expect.any(Object),
        expect.any(Object)
      )
    })

    it('should set paste to never expire', async () => {
      const content = '<html></html>'
      const filename = 'test.html'
      const mockUrl = 'https://pastebin.com/never123'

      mockedAxios.post.mockResolvedValueOnce({
        data: mockUrl
      })

      await uploadToPastebin(content, filename)

      // Verify FormData contains expire_date = 'N'
      expect(mockedAxios.post).toHaveBeenCalled()
    })

    it('should set paste to unlisted', async () => {
      const content = '<html></html>'
      const filename = 'test.html'
      const mockUrl = 'https://pastebin.com/unlisted123'

      mockedAxios.post.mockResolvedValueOnce({
        data: mockUrl
      })

      await uploadToPastebin(content, filename)

      // Verify FormData contains private = '1'
      expect(mockedAxios.post).toHaveBeenCalled()
    })

    it('should set 30 second timeout', async () => {
      const content = '<html></html>'
      const filename = 'test.html'
      const mockUrl = 'https://pastebin.com/timeout123'

      mockedAxios.post.mockResolvedValueOnce({
        data: mockUrl
      })

      await uploadToPastebin(content, filename)

      expect(mockedAxios.post).toHaveBeenCalledWith(
        expect.any(String),
        expect.any(Object),
        expect.objectContaining({
          timeout: 30000
        })
      )
    })

    it('should include proper headers for FormData', async () => {
      const content = '<html></html>'
      const filename = 'test.html'
      const mockUrl = 'https://pastebin.com/headers123'

      mockedAxios.post.mockResolvedValueOnce({
        data: mockUrl
      })

      await uploadToPastebin(content, filename)

      expect(mockedAxios.post).toHaveBeenCalledWith(
        expect.any(String),
        expect.any(Object),
        expect.objectContaining({
          headers: expect.any(Object)
        })
      )
    })
  })

  describe('edge cases', () => {
    it('should handle non-axios errors', async () => {
      const content = '<html></html>'
      const filename = 'test.html'

      mockedAxios.post.mockRejectedValue(new Error('Unexpected error'))
      mockedAxios.isAxiosError = vi.fn().mockReturnValue(false)

      await expect(uploadToPastebin(content, filename)).rejects.toThrow(PastebinUploadError)
      await expect(uploadToPastebin(content, filename)).rejects.toThrow(
        'An unexpected error occurred during text upload'
      )
    })

    it('should re-throw PastebinUploadError without wrapping', async () => {
      const content = '<html></html>'
      const filename = 'test.html'
      const customError = new PastebinUploadError('Custom error', 418)

      mockedAxios.post.mockRejectedValueOnce(customError)
      mockedAxios.isAxiosError = vi.fn().mockReturnValue(false)

      await expect(uploadToPastebin(content, filename)).rejects.toThrow(customError)
    })

    it('should handle content with special characters', async () => {
      const content = '<html><body>Special: \x00\x01\x02 & < > " \' </body></html>'
      const filename = 'special.html'
      const mockUrl = 'https://pastebin.com/special123'

      mockedAxios.post.mockResolvedValueOnce({
        data: mockUrl
      })

      const result = await uploadToPastebin(content, filename)

      expect(result).toBe(mockUrl)
    })

    it('should handle Unicode content', async () => {
      const content = '<html><body>Hello 世界 🌍 مرحبا</body></html>'
      const filename = 'unicode.html'
      const mockUrl = 'https://pastebin.com/unicode123'

      mockedAxios.post.mockResolvedValueOnce({
        data: mockUrl
      })

      const result = await uploadToPastebin(content, filename)

      expect(result).toBe(mockUrl)
    })

    it('should handle multiline content', async () => {
      const content = `<!DOCTYPE html>
<html>
<head>
  <title>Test</title>
</head>
<body>
  <h1>Hello World</h1>
</body>
</html>`
      const filename = 'multiline.html'
      const mockUrl = 'https://pastebin.com/multiline123'

      mockedAxios.post.mockResolvedValueOnce({
        data: mockUrl
      })

      const result = await uploadToPastebin(content, filename)

      expect(result).toBe(mockUrl)
    })
  })
})
