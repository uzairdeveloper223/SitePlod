/**
 * Pastebin Upload Utility
 * 
 * Handles text file uploads to Pastebin API
 * Requirements: 7
 */

import axios, { AxiosError } from 'axios'
import FormData from 'form-data'

/**
 * Error thrown when Pastebin upload fails
 */
export class PastebinUploadError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public originalError?: unknown
  ) {
    super(message)
    this.name = 'PastebinUploadError'
  }
}

/**
 * Upload text content to Pastebin
 * 
 * @param content - Text content to upload
 * @param filename - Filename for the paste
 * @returns Pastebin URL
 * @throws PastebinUploadError if upload fails
 * 
 * Requirements: 7
 */
export async function uploadToPastebin(
  content: string,
  filename: string
): Promise<string> {
  // Get API keys from environment variables (comma-separated if multiple)
  const apiKeyStr = process.env.PASTEBIN_API_KEYS || process.env.PASTEBIN_API_KEY

  if (!apiKeyStr) {
    throw new PastebinUploadError(
      'PASTEBIN_API_KEY or PASTEBIN_API_KEYS environment variable is not set',
      500
    )
  }

  const apiKeys = apiKeyStr.split(',').map(k => k.trim()).filter(Boolean)

  if (apiKeys.length === 0) {
    throw new PastebinUploadError(
      'No valid Pastebin API keys found in environment variables',
      500
    )
  }

  // Validate content
  if (!content || content.trim() === '') {
    throw new PastebinUploadError('Content is empty or invalid', 400)
  }

  // Validate filename
  if (!filename || filename.trim() === '') {
    throw new PastebinUploadError('Filename is required', 400)
  }

  let lastError: unknown

  for (let i = 0; i < apiKeys.length; i++) {
    const apiKey = apiKeys[i]
    try {
      // Create form data
      const formData = new FormData()
      formData.append('api_dev_key', apiKey)
      formData.append('api_option', 'paste')
      formData.append('api_paste_code', content)
      formData.append('api_paste_name', filename)
      formData.append('api_paste_expire_date', 'N') // Never expire
      formData.append('api_paste_private', '1') // Unlisted

      // Upload to Pastebin
      const response = await axios.post(
        'https://pastebin.com/api/api_post.php',
        formData,
        {
          headers: formData.getHeaders(),
          timeout: 45000, // 45 second timeout for safety
        }
      )

      // Check if response is a valid URL
      const pastebinUrl = response.data.trim()

      if (!pastebinUrl.startsWith('https://pastebin.com/')) {
        // Pastebin returns error messages as plain text
        throw new PastebinUploadError(
          `Pastebin API error: ${pastebinUrl}`,
          400
        )
      }

      return pastebinUrl
    } catch (error) {
      lastError = error

      // If we have more keys to try, and the error might be key-specific 
      // (like 422 limit reached, 429 rate limit, 401/403 auth issues), try the next key
      if (i < apiKeys.length - 1 && axios.isAxiosError(error)) {
        const status = error.response?.status
        const responseData = error.response?.data

        // Pastebin often returns 422 "Post limit, maximum pastes per 24h reached"
        const isRateLimit = status === 429 || status === 422 ||
          (typeof responseData === 'string' && responseData.toLowerCase().includes('limit'))

        const isAuthError = status === 401 || status === 403

        if (isRateLimit || isAuthError) {
          console.warn(`Pastebin key ${apiKey.substring(0, 4)}... failed (Status ${status}). Trying next key...`)
          continue
        }

        // Timeout or network errors could also benefit from retrying, though it might just be the service being down
        if (error.code === 'ECONNABORTED' || error.code === 'ETIMEDOUT' || error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED') {
          console.warn(`Pastebin key ${apiKey.substring(0, 4)}... network error (${error.code}). Trying next key...`)
          continue
        }
      }

      // If we got a 400 Bad Request, trying another key won't help (invalid content)
      if (axios.isAxiosError(error) && error.response?.status === 400) {
        break
      }

      // Otherwise, keep trying just in case
    }
  }

  // If we reach here, all keys failed. Parse and throw the last encountered error.
  if (axios.isAxiosError(lastError)) {
    const axiosError = lastError as AxiosError
    const status = axiosError.response?.status
    const responseData = axiosError.response?.data

    // Parse response data for better error messages if available
    const errorMessage = typeof responseData === 'string' ? responseData : axiosError.message

    // Rate limit error (429 or 422 max pastes)
    if (status === 429 || status === 422) {
      throw new PastebinUploadError(
        `Pastebin API rate limits exceeded on all available keys. Latest error: ${errorMessage}`,
        status,
        lastError
      )
    }

    // Authentication error (401/403)
    if (status === 401 || status === 403) {
      throw new PastebinUploadError(
        'All provided Pastebin API keys were invalid or rejected',
        status,
        lastError
      )
    }

    // Bad request (400)
    if (status === 400) {
      throw new PastebinUploadError(
        `Pastebin upload failed due to invalid request: ${errorMessage}`,
        400,
        lastError
      )
    }

    // Timeout error
    if (axiosError.code === 'ECONNABORTED' || axiosError.code === 'ETIMEDOUT') {
      throw new PastebinUploadError(
        'Pastebin upload timed out after trying all keys. Please try again later.',
        408,
        lastError
      )
    }

    // Network error
    if (axiosError.code === 'ENOTFOUND' || axiosError.code === 'ECONNREFUSED') {
      throw new PastebinUploadError(
        'Unable to connect to Pastebin API. Please check internet connection.',
        503,
        lastError
      )
    }

    // Generic axios error
    throw new PastebinUploadError(
      `Pastebin upload failed on all keys: ${errorMessage}`,
      status || 500,
      lastError
    )
  }

  // Handle other errors
  if (lastError instanceof PastebinUploadError) {
    throw lastError
  }

  throw new PastebinUploadError(
    'An unexpected error occurred during text upload',
    500,
    lastError
  )
}
