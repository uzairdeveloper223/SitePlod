/**
 * Unit tests for ImgBB upload utility
 * 
 * Tests image upload functionality, error handling, and API integration
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import axios from 'axios'
import { uploadToImgBB, ImgBBUploadError } from '@/lib/imgbb'

// Mock axios
vi.mock('axios')
const mockedAxios = vi.mocked(axios)

describe('uploadToImgBB', () => {
  const originalEnv = process.env

  beforeEach(() => {
    // Reset mocks before each test
    vi.clearAllMocks()
    
    // Set up environment
    process.env = { ...originalEnv }
    process.env.IMGBB_API_KEY = 'test_api_key_12345'
  })

  afterEach(() => {
    // Restore original environment
    process.env = originalEnv
  })

  describe('successful uploads', () => {
    it('should upload image buffer and return URL', async () => {
      const mockBuffer = Buffer.from('fake-image-data')
      const mockUrl = 'https://i.ibb.co/abc123/image.png'

      mockedAxios.post.mockResolvedValueOnce({
        data: {
          success: true,
          status: 200,
          data: {
            url: mockUrl,
            display_url: mockUrl,
            delete_url: 'https://ibb.co/delete/abc123',
            id: 'abc123',
            title: 'image',
            size: mockBuffer.length
          }
        }
      })

      const result = await uploadToImgBB(mockBuffer)

      expect(result).toBe(mockUrl)
      expect(mockedAxios.post).toHaveBeenCalledTimes(1)
      expect(mockedAxios.post).toHaveBeenCalledWith(
        expect.stringContaining('https://api.imgbb.com/1/upload'),
        expect.any(Object),
        expect.objectContaining({
          headers: expect.any(Object),
          timeout: 30000
        })
      )
    })

    it('should upload image with filename', async () => {
      const mockBuffer = Buffer.from('fake-image-data')
      const mockUrl = 'https://i.ibb.co/abc123/logo.png'
      const filename = 'logo.png'

      mockedAxios.post.mockResolvedValueOnce({
        data: {
          success: true,
          status: 200,
          data: {
            url: mockUrl,
            display_url: mockUrl,
            delete_url: 'https://ibb.co/delete/abc123',
            id: 'abc123',
            title: filename,
            size: mockBuffer.length
          }
        }
      })

      const result = await uploadToImgBB(mockBuffer, filename)

      expect(result).toBe(mockUrl)
    })

    it('should convert buffer to base64 before upload', async () => {
      const mockBuffer = Buffer.from('test-image-content')
      const expectedBase64 = mockBuffer.toString('base64')
      const mockUrl = 'https://i.ibb.co/xyz789/test.png'

      mockedAxios.post.mockResolvedValueOnce({
        data: {
          success: true,
          status: 200,
          data: {
            url: mockUrl,
            display_url: mockUrl,
            delete_url: 'https://ibb.co/delete/xyz789',
            id: 'xyz789',
            title: 'test',
            size: mockBuffer.length
          }
        }
      })

      await uploadToImgBB(mockBuffer)

      // Verify the post was called with FormData containing base64
      expect(mockedAxios.post).toHaveBeenCalled()
      const formData = mockedAxios.post.mock.calls[0][1]
      expect(formData).toBeDefined()
    })

    it('should handle large image buffers', async () => {
      // Create a 5MB buffer
      const largeBuffer = Buffer.alloc(5 * 1024 * 1024, 'a')
      const mockUrl = 'https://i.ibb.co/large123/big-image.png'

      mockedAxios.post.mockResolvedValueOnce({
        data: {
          success: true,
          status: 200,
          data: {
            url: mockUrl,
            display_url: mockUrl,
            delete_url: 'https://ibb.co/delete/large123',
            id: 'large123',
            title: 'big-image',
            size: largeBuffer.length
          }
        }
      })

      const result = await uploadToImgBB(largeBuffer)

      expect(result).toBe(mockUrl)
    })
  })

  describe('environment validation', () => {
    it('should throw error if IMGBB_API_KEY is not set', async () => {
      delete process.env.IMGBB_API_KEY

      const mockBuffer = Buffer.from('fake-image-data')

      await expect(uploadToImgBB(mockBuffer)).rejects.toThrow(ImgBBUploadError)
      await expect(uploadToImgBB(mockBuffer)).rejects.toThrow(
        'IMGBB_API_KEY environment variable is not set'
      )
    })

    it('should throw error with status code 500 for missing API key', async () => {
      delete process.env.IMGBB_API_KEY

      const mockBuffer = Buffer.from('fake-image-data')

      try {
        await uploadToImgBB(mockBuffer)
        expect.fail('Should have thrown an error')
      } catch (error) {
        expect(error).toBeInstanceOf(ImgBBUploadError)
        expect((error as ImgBBUploadError).statusCode).toBe(500)
      }
    })
  })

  describe('input validation', () => {
    it('should throw error for empty buffer', async () => {
      const emptyBuffer = Buffer.from([])

      await expect(uploadToImgBB(emptyBuffer)).rejects.toThrow(ImgBBUploadError)
      await expect(uploadToImgBB(emptyBuffer)).rejects.toThrow(
        'Image buffer is empty or invalid'
      )
    })

    it('should throw error with status code 400 for empty buffer', async () => {
      const emptyBuffer = Buffer.from([])

      try {
        await uploadToImgBB(emptyBuffer)
        expect.fail('Should have thrown an error')
      } catch (error) {
        expect(error).toBeInstanceOf(ImgBBUploadError)
        expect((error as ImgBBUploadError).statusCode).toBe(400)
      }
    })
  })

  describe('API error handling', () => {
    it('should handle rate limit errors (429)', async () => {
      const mockBuffer = Buffer.from('fake-image-data')

      mockedAxios.post.mockRejectedValue({
        isAxiosError: true,
        response: {
          status: 429,
          data: {}
        },
        message: 'Rate limit exceeded'
      })

      mockedAxios.isAxiosError = vi.fn().mockReturnValue(true)

      await expect(uploadToImgBB(mockBuffer)).rejects.toThrow(ImgBBUploadError)
      await expect(uploadToImgBB(mockBuffer)).rejects.toThrow(
        'ImgBB API rate limit exceeded'
      )
    })

    it('should handle authentication errors (401)', async () => {
      const mockBuffer = Buffer.from('fake-image-data')

      mockedAxios.post.mockRejectedValue({
        isAxiosError: true,
        response: {
          status: 401,
          data: {}
        },
        message: 'Unauthorized'
      })

      mockedAxios.isAxiosError = vi.fn().mockReturnValue(true)

      await expect(uploadToImgBB(mockBuffer)).rejects.toThrow(ImgBBUploadError)
      await expect(uploadToImgBB(mockBuffer)).rejects.toThrow('Invalid ImgBB API key')
    })

    it('should handle forbidden errors (403)', async () => {
      const mockBuffer = Buffer.from('fake-image-data')

      mockedAxios.post.mockRejectedValue({
        isAxiosError: true,
        response: {
          status: 403,
          data: {}
        },
        message: 'Forbidden'
      })

      mockedAxios.isAxiosError = vi.fn().mockReturnValue(true)

      await expect(uploadToImgBB(mockBuffer)).rejects.toThrow(ImgBBUploadError)
      await expect(uploadToImgBB(mockBuffer)).rejects.toThrow('Invalid ImgBB API key')
    })

    it('should handle bad request errors (400)', async () => {
      const mockBuffer = Buffer.from('fake-image-data')

      mockedAxios.post.mockRejectedValue({
        isAxiosError: true,
        response: {
          status: 400,
          data: {
            error: {
              message: 'Invalid image format'
            }
          }
        },
        message: 'Bad request'
      })

      mockedAxios.isAxiosError = vi.fn().mockReturnValue(true)

      await expect(uploadToImgBB(mockBuffer)).rejects.toThrow(ImgBBUploadError)
      await expect(uploadToImgBB(mockBuffer)).rejects.toThrow('Invalid image format')
    })

    it('should handle timeout errors', async () => {
      const mockBuffer = Buffer.from('fake-image-data')

      mockedAxios.post.mockRejectedValue({
        isAxiosError: true,
        code: 'ECONNABORTED',
        message: 'timeout of 30000ms exceeded'
      })

      mockedAxios.isAxiosError = vi.fn().mockReturnValue(true)

      await expect(uploadToImgBB(mockBuffer)).rejects.toThrow(ImgBBUploadError)
      await expect(uploadToImgBB(mockBuffer)).rejects.toThrow('ImgBB upload timed out')
    })

    it('should handle network errors (ENOTFOUND)', async () => {
      const mockBuffer = Buffer.from('fake-image-data')

      mockedAxios.post.mockRejectedValue({
        isAxiosError: true,
        code: 'ENOTFOUND',
        message: 'getaddrinfo ENOTFOUND api.imgbb.com'
      })

      mockedAxios.isAxiosError = vi.fn().mockReturnValue(true)

      await expect(uploadToImgBB(mockBuffer)).rejects.toThrow(ImgBBUploadError)
      await expect(uploadToImgBB(mockBuffer)).rejects.toThrow(
        'Unable to connect to ImgBB API'
      )
    })

    it('should handle connection refused errors', async () => {
      const mockBuffer = Buffer.from('fake-image-data')

      mockedAxios.post.mockRejectedValue({
        isAxiosError: true,
        code: 'ECONNREFUSED',
        message: 'connect ECONNREFUSED'
      })

      mockedAxios.isAxiosError = vi.fn().mockReturnValue(true)

      await expect(uploadToImgBB(mockBuffer)).rejects.toThrow(ImgBBUploadError)
      await expect(uploadToImgBB(mockBuffer)).rejects.toThrow(
        'Unable to connect to ImgBB API'
      )
    })

    it('should handle generic axios errors', async () => {
      const mockBuffer = Buffer.from('fake-image-data')

      mockedAxios.post.mockRejectedValue({
        isAxiosError: true,
        response: {
          status: 500,
          data: {}
        },
        message: 'Internal server error'
      })

      mockedAxios.isAxiosError = vi.fn().mockReturnValue(true)

      await expect(uploadToImgBB(mockBuffer)).rejects.toThrow(ImgBBUploadError)
      
      try {
        await uploadToImgBB(mockBuffer)
        expect.fail('Should have thrown an error')
      } catch (error) {
        expect(error).toBeInstanceOf(ImgBBUploadError)
        expect((error as ImgBBUploadError).statusCode).toBe(500)
      }
    })

    it('should handle unsuccessful API responses', async () => {
      const mockBuffer = Buffer.from('fake-image-data')

      mockedAxios.post.mockResolvedValue({
        data: {
          success: false,
          status: 400,
          data: null
        }
      })

      await expect(uploadToImgBB(mockBuffer)).rejects.toThrow(ImgBBUploadError)
      await expect(uploadToImgBB(mockBuffer)).rejects.toThrow(
        'ImgBB API returned unsuccessful response'
      )
    })

    it('should handle missing URL in response', async () => {
      const mockBuffer = Buffer.from('fake-image-data')

      mockedAxios.post.mockResolvedValue({
        data: {
          success: true,
          status: 200,
          data: {
            url: null,
            display_url: null,
            delete_url: null,
            id: 'abc123',
            title: 'image',
            size: 0
          }
        }
      })

      await expect(uploadToImgBB(mockBuffer)).rejects.toThrow(ImgBBUploadError)
      await expect(uploadToImgBB(mockBuffer)).rejects.toThrow(
        'ImgBB API returned unsuccessful response'
      )
    })
  })

  describe('error object properties', () => {
    it('should create ImgBBUploadError with correct properties', () => {
      const error = new ImgBBUploadError('Test error', 400, new Error('Original'))

      expect(error).toBeInstanceOf(Error)
      expect(error).toBeInstanceOf(ImgBBUploadError)
      expect(error.message).toBe('Test error')
      expect(error.statusCode).toBe(400)
      expect(error.originalError).toBeInstanceOf(Error)
      expect(error.name).toBe('ImgBBUploadError')
    })

    it('should create ImgBBUploadError without optional properties', () => {
      const error = new ImgBBUploadError('Test error')

      expect(error.message).toBe('Test error')
      expect(error.statusCode).toBeUndefined()
      expect(error.originalError).toBeUndefined()
    })

    it('should preserve original error in ImgBBUploadError', async () => {
      const mockBuffer = Buffer.from('fake-image-data')
      const originalError = new Error('Network failure')

      mockedAxios.post.mockRejectedValueOnce({
        isAxiosError: true,
        code: 'ENOTFOUND',
        message: 'Network failure'
      })

      mockedAxios.isAxiosError = vi.fn().mockReturnValue(true)

      try {
        await uploadToImgBB(mockBuffer)
        expect.fail('Should have thrown an error')
      } catch (error) {
        expect(error).toBeInstanceOf(ImgBBUploadError)
        expect((error as ImgBBUploadError).originalError).toBeDefined()
      }
    })
  })

  describe('API request configuration', () => {
    it('should include API key in request URL', async () => {
      const mockBuffer = Buffer.from('fake-image-data')
      const mockUrl = 'https://i.ibb.co/abc123/image.png'

      mockedAxios.post.mockResolvedValueOnce({
        data: {
          success: true,
          status: 200,
          data: {
            url: mockUrl,
            display_url: mockUrl,
            delete_url: 'https://ibb.co/delete/abc123',
            id: 'abc123',
            title: 'image',
            size: mockBuffer.length
          }
        }
      })

      await uploadToImgBB(mockBuffer)

      expect(mockedAxios.post).toHaveBeenCalledWith(
        'https://api.imgbb.com/1/upload?key=test_api_key_12345',
        expect.any(Object),
        expect.any(Object)
      )
    })

    it('should set 30 second timeout', async () => {
      const mockBuffer = Buffer.from('fake-image-data')
      const mockUrl = 'https://i.ibb.co/abc123/image.png'

      mockedAxios.post.mockResolvedValueOnce({
        data: {
          success: true,
          status: 200,
          data: {
            url: mockUrl,
            display_url: mockUrl,
            delete_url: 'https://ibb.co/delete/abc123',
            id: 'abc123',
            title: 'image',
            size: mockBuffer.length
          }
        }
      })

      await uploadToImgBB(mockBuffer)

      expect(mockedAxios.post).toHaveBeenCalledWith(
        expect.any(String),
        expect.any(Object),
        expect.objectContaining({
          timeout: 30000
        })
      )
    })

    it('should include proper headers for FormData', async () => {
      const mockBuffer = Buffer.from('fake-image-data')
      const mockUrl = 'https://i.ibb.co/abc123/image.png'

      mockedAxios.post.mockResolvedValueOnce({
        data: {
          success: true,
          status: 200,
          data: {
            url: mockUrl,
            display_url: mockUrl,
            delete_url: 'https://ibb.co/delete/abc123',
            id: 'abc123',
            title: 'image',
            size: mockBuffer.length
          }
        }
      })

      await uploadToImgBB(mockBuffer)

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
      const mockBuffer = Buffer.from('fake-image-data')

      mockedAxios.post.mockRejectedValue(new Error('Unexpected error'))
      mockedAxios.isAxiosError = vi.fn().mockReturnValue(false)

      await expect(uploadToImgBB(mockBuffer)).rejects.toThrow(ImgBBUploadError)
      await expect(uploadToImgBB(mockBuffer)).rejects.toThrow(
        'An unexpected error occurred during image upload'
      )
    })

    it('should re-throw ImgBBUploadError without wrapping', async () => {
      const mockBuffer = Buffer.from('fake-image-data')
      const customError = new ImgBBUploadError('Custom error', 418)

      mockedAxios.post.mockRejectedValueOnce(customError)
      mockedAxios.isAxiosError = vi.fn().mockReturnValue(false)

      await expect(uploadToImgBB(mockBuffer)).rejects.toThrow(customError)
    })

    it('should handle buffer with special characters', async () => {
      const mockBuffer = Buffer.from('Special chars: \x00\x01\x02\xFF')
      const mockUrl = 'https://i.ibb.co/special123/image.png'

      mockedAxios.post.mockResolvedValueOnce({
        data: {
          success: true,
          status: 200,
          data: {
            url: mockUrl,
            display_url: mockUrl,
            delete_url: 'https://ibb.co/delete/special123',
            id: 'special123',
            title: 'image',
            size: mockBuffer.length
          }
        }
      })

      const result = await uploadToImgBB(mockBuffer)

      expect(result).toBe(mockUrl)
    })
  })
})
