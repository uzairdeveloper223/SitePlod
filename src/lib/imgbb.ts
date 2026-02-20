/**
 * ImgBB Upload Utility
 * 
 * Handles image uploads to ImgBB API
 * Requirements: 6
 */

import axios, { AxiosError } from 'axios'
import FormData from 'form-data'

/**
 * Error thrown when ImgBB upload fails
 */
export class ImgBBUploadError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public originalError?: unknown
  ) {
    super(message)
    this.name = 'ImgBBUploadError'
  }
}

/**
 * Response from ImgBB API
 */
interface ImgBBResponse {
  data: {
    url: string
    display_url: string
    delete_url: string
    id: string
    title: string
    size: number
  }
  success: boolean
  status: number
}

/**
 * Upload an image to ImgBB
 * 
 * @param buffer - Image file as Buffer
 * @param filename - Optional filename for the image
 * @returns Hosted image URL from ImgBB
 * @throws ImgBBUploadError if upload fails
 * 
 * Requirements: 6
 */
export async function uploadToImgBB(
  buffer: Buffer,
  filename?: string
): Promise<string> {
  // Validate API key
  const apiKey = process.env.IMGBB_API_KEY
  
  if (!apiKey) {
    throw new ImgBBUploadError(
      'IMGBB_API_KEY environment variable is not set',
      500
    )
  }

  // Validate buffer
  if (!buffer || buffer.length === 0) {
    throw new ImgBBUploadError('Image buffer is empty or invalid', 400)
  }

  try {
    // Convert buffer to base64
    const base64Image = buffer.toString('base64')

    // Create form data
    const formData = new FormData()
    formData.append('image', base64Image)
    
    if (filename) {
      formData.append('name', filename)
    }

    // Upload to ImgBB
    const response = await axios.post<ImgBBResponse>(
      `https://api.imgbb.com/1/upload?key=${apiKey}`,
      formData,
      {
        headers: formData.getHeaders(),
        timeout: 30000, // 30 second timeout
      }
    )

    // Check if upload was successful
    if (!response.data.success || !response.data.data?.url) {
      throw new ImgBBUploadError(
        'ImgBB API returned unsuccessful response',
        response.status
      )
    }

    // Return the hosted image URL
    return response.data.data.url
  } catch (error) {
    // Handle axios errors
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError<{ error?: { message?: string } }>
      
      // Rate limit error (429)
      if (axiosError.response?.status === 429) {
        throw new ImgBBUploadError(
          'ImgBB API rate limit exceeded. Please try again later.',
          429,
          error
        )
      }

      // Authentication error (401/403)
      if (axiosError.response?.status === 401 || axiosError.response?.status === 403) {
        throw new ImgBBUploadError(
          'Invalid ImgBB API key',
          axiosError.response.status,
          error
        )
      }

      // Bad request (400)
      if (axiosError.response?.status === 400) {
        const errorMessage = axiosError.response.data?.error?.message || 'Invalid image data'
        throw new ImgBBUploadError(
          `ImgBB upload failed: ${errorMessage}`,
          400,
          error
        )
      }

      // Timeout error
      if (axiosError.code === 'ECONNABORTED') {
        throw new ImgBBUploadError(
          'ImgBB upload timed out. Please try again.',
          408,
          error
        )
      }

      // Network error
      if (axiosError.code === 'ENOTFOUND' || axiosError.code === 'ECONNREFUSED') {
        throw new ImgBBUploadError(
          'Unable to connect to ImgBB API. Please check your internet connection.',
          503,
          error
        )
      }

      // Generic axios error
      const statusCode = axiosError.response?.status || 500
      throw new ImgBBUploadError(
        `ImgBB upload failed: ${axiosError.message}`,
        statusCode,
        error
      )
    }

    // Handle other errors
    if (error instanceof ImgBBUploadError) {
      throw error
    }

    throw new ImgBBUploadError(
      'An unexpected error occurred during image upload',
      500,
      error
    )
  }
}
