/**
 * API Client for SitePlod
 * 
 * Centralized API client with error handling, retry logic, and type safety.
 * All backend API calls should go through this client.
 */

import type {
  User,
  Site,
  SiteFile,
  AnalyticsData,
  RegisterRequest,
  LoginRequest,
  AuthResponse,
  CreateSiteRequest,
  UpdateSiteRequest,
  SlugCheckResponse,
  UpdateFileRequest,
  UploadFileResponse,
  ProfileUpdateRequest,
  ApiError as ApiErrorType,
} from './api-types'

/**
 * Custom error class for API errors
 */
export class ApiError extends Error {
  constructor(
    message: string,
    public statusCode: number,
    public error?: string,
    public data?: any
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

/**
 * Retry a function with exponential backoff
 */
async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries = 3,
  initialDelay = 1000
): Promise<T> {
  let lastError: Error | undefined

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fn()
    } catch (error) {
      lastError = error as Error

      // Don't retry on client errors (4xx) except 429 (rate limit)
      if (error instanceof ApiError) {
        if (error.statusCode >= 400 && error.statusCode < 500 && error.statusCode !== 429) {
          throw error
        }
      }

      // If this was the last attempt, throw the error
      if (attempt === maxRetries - 1) {
        throw error
      }

      // Calculate delay with exponential backoff
      const delay = initialDelay * Math.pow(2, attempt)
      await new Promise(resolve => setTimeout(resolve, delay))
    }
  }

  throw lastError || new Error('Max retries exceeded')
}

/**
 * Main API client class
 */
class ApiClient {
  private baseUrl = '/api'

  /**
   * Get the authentication token from localStorage
   */
  private getToken(): string | null {
    if (typeof window === 'undefined') return null
    return localStorage.getItem('auth_token')
  }

  /**
   * Store the authentication token in localStorage
   */
  private setToken(token: string): void {
    if (typeof window === 'undefined') return
    localStorage.setItem('auth_token', token)
  }

  /**
   * Clear the authentication token from localStorage
   */
  private clearToken(): void {
    if (typeof window === 'undefined') return
    localStorage.removeItem('auth_token')
  }

  /**
   * Make an HTTP request with error handling
   */
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const token = this.getToken()

    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    }

    if (token) {
      headers['Authorization'] = `Bearer ${token}`
    }

    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      headers,
    })

    // Handle non-JSON responses
    const contentType = response.headers.get('content-type')
    const isJson = contentType?.includes('application/json')

    if (!response.ok) {
      if (isJson) {
        const error: ApiErrorType = await response.json()
        throw new ApiError(error.message, response.status, error.error)
      } else {
        throw new ApiError(
          `HTTP ${response.status}: ${response.statusText}`,
          response.status
        )
      }
    }

    // Handle empty responses (204 No Content)
    if (response.status === 204) {
      return undefined as T
    }

    if (isJson) {
      return response.json()
    }

    // For non-JSON responses, return the text
    return response.text() as T
  }

  // ============================================================================
  // Authentication Methods
  // ============================================================================

  /**
   * Register a new user account
   */
  async register(data: RegisterRequest): Promise<AuthResponse> {
    const response = await retryWithBackoff(() =>
      this.request<AuthResponse>('/auth/register', {
        method: 'POST',
        body: JSON.stringify(data),
      })
    )

    // Store the token if provided (for auto-confirmed accounts)
    if (response.token) {
      this.setToken(response.token)
    }

    return response
  }

  /**
   * Resend verification email
   */
  async resendVerification(email: string): Promise<{ message: string }> {
    return retryWithBackoff(() =>
      this.request<{ message: string }>('/auth/resend-verification', {
        method: 'POST',
        body: JSON.stringify({ email }),
      })
    )
  }

  /**
   * Login with email and password
   */
  async login(data: LoginRequest): Promise<AuthResponse> {
    const response = await retryWithBackoff(() =>
      this.request<AuthResponse>('/auth/login', {
        method: 'POST',
        body: JSON.stringify(data),
      })
    )

    // Store the token on successful login
    if (response.token) {
      this.setToken(response.token)
    }

    return response
  }

  /**
   * Logout the current user
   */
  async logout(): Promise<void> {
    try {
      await this.request<void>('/auth/logout', {
        method: 'POST',
      })
    } finally {
      // Always clear the token, even if the request fails
      this.clearToken()
    }
  }

  /**
   * Get the current user's profile
   */
  async getProfile(): Promise<User> {
    const response = await retryWithBackoff(() => this.request<{ user: User }>('/auth/me'))
    return response.user
  }

  /**
   * Update the current user's profile
   */
  async updateProfile(data: ProfileUpdateRequest): Promise<User> {
    return retryWithBackoff(() =>
      this.request<User>('/auth/profile', {
        method: 'PUT',
        body: JSON.stringify(data),
      })
    )
  }

  /**
   * Subscribe to CLI announcements
   */
  async subscribeCliNotification(): Promise<{ success: boolean; message: string; alreadySubscribed?: boolean }> {
    return retryWithBackoff(() =>
      this.request<{ success: boolean; message: string; alreadySubscribed?: boolean }>('/auth/cli-notify', {
        method: 'POST',
      })
    )
  }

  // ============================================================================
  // Site Management Methods
  // ============================================================================

  /**
   * Check if a slug is available
   */
  async checkSlug(slug: string): Promise<SlugCheckResponse> {
    return retryWithBackoff(() =>
      this.request<SlugCheckResponse>(`/sites/check-slug?slug=${encodeURIComponent(slug)}`)
    )
  }

  /**
   * Create a new site
   */
  async createSite(data: CreateSiteRequest): Promise<Site> {
    return retryWithBackoff(() =>
      this.request<Site>('/sites', {
        method: 'POST',
        body: JSON.stringify(data),
      })
    )
  }

  /**
   * Get all sites for the current user
   */
  async getSites(): Promise<Site[]> {
    const response = await retryWithBackoff(() => this.request<any[]>('/sites'))

    // Transform database response to camelCase
    return response.map(site => ({
      id: site.id,
      name: site.name,
      slug: site.slug,
      managed: site.managed,
      userId: site.user_id,
      views: site.views,
      status: site.status,
      createdAt: site.created_at,
      updatedAt: site.updated_at
    }))
  }

  /**
   * Get a specific site by ID
   */
  async getSite(id: string): Promise<Site> {
    const response = await retryWithBackoff(() => this.request<any>(`/sites/${id}`))

    // Transform database response to camelCase
    return {
      id: response.id,
      name: response.name,
      slug: response.slug,
      managed: response.managed,
      userId: response.user_id,
      views: response.views,
      status: response.status,
      createdAt: response.created_at,
      updatedAt: response.updated_at,
      files: response.files || []
    }
  }

  /**
   * Get a site by slug (public endpoint)
   */
  async getSiteBySlug(slug: string): Promise<Site> {
    return retryWithBackoff(() =>
      this.request<Site>(`/sites/slug/${encodeURIComponent(slug)}`)
    )
  }

  /**
   * Update a site
   */
  async updateSite(id: string, data: UpdateSiteRequest): Promise<Site> {
    const response = await retryWithBackoff(() =>
      this.request<any>(`/sites/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      })
    )

    // Transform database response to camelCase
    return {
      id: response.id,
      name: response.name,
      slug: response.slug,
      managed: response.managed,
      userId: response.user_id,
      views: response.views,
      status: response.status,
      createdAt: response.created_at,
      updatedAt: response.updated_at
    }
  }

  /**
   * Delete a site
   */
  async deleteSite(id: string): Promise<void> {
    return retryWithBackoff(() =>
      this.request<void>(`/sites/${id}`, {
        method: 'DELETE',
      })
    )
  }

  // ============================================================================
  // File Management Methods
  // ============================================================================

  /**
   * Get file content from a site
   */
  async getFileContent(siteId: string, path: string): Promise<SiteFile> {
    const response = await retryWithBackoff(() =>
      this.request<any>(`/sites/${siteId}/files/${encodeURIComponent(path)}`)
    )

    // Transform database response to camelCase
    return {
      id: response.id || '',
      siteId: response.siteId || response.site_id || siteId,
      path: response.path,
      content: response.content,
      mimeType: response.mimeType || response.mime_type,
      size: response.size,
      createdAt: response.createdAt || response.created_at,
      updatedAt: response.updatedAt || response.updated_at
    }
  }

  /**
   * Update file content in a site
   */
  async updateFileContent(
    siteId: string,
    path: string,
    data: UpdateFileRequest
  ): Promise<SiteFile> {
    return retryWithBackoff(() =>
      this.request<SiteFile>(`/sites/${siteId}/files/${encodeURIComponent(path)}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      })
    )
  }

  /**
   * Upload a file (HTML or ZIP)
   */
  async uploadFile(file: File, onProgress?: (progress: number) => void): Promise<UploadFileResponse> {
    return new Promise((resolve, reject) => {
      const formData = new FormData()
      formData.append('file', file)

      const xhr = new XMLHttpRequest()

      // Track upload progress
      if (onProgress) {
        xhr.upload.addEventListener('progress', (event) => {
          if (event.lengthComputable) {
            const progress = Math.round((event.loaded / event.total) * 100)
            onProgress(progress)
          }
        })
      }

      xhr.addEventListener('load', () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            const response = JSON.parse(xhr.responseText)
            resolve(response)
          } catch (error) {
            reject(new ApiError('Invalid JSON response', xhr.status))
          }
        } else {
          try {
            const error: ApiErrorType = JSON.parse(xhr.responseText)
            reject(new ApiError(error.message, xhr.status, error.error, error))
          } catch {
            reject(new ApiError(`HTTP ${xhr.status}: ${xhr.statusText}`, xhr.status))
          }
        }
      })

      xhr.addEventListener('error', () => {
        reject(new ApiError('Network error during upload', 0))
      })

      xhr.addEventListener('abort', () => {
        reject(new ApiError('Upload aborted', 0))
      })

      xhr.open('POST', `${this.baseUrl}/upload`)

      const token = this.getToken()
      if (token) {
        xhr.setRequestHeader('Authorization', `Bearer ${token}`)
      }

      xhr.send(formData)
    })
  }

  // ============================================================================
  // Analytics Methods
  // ============================================================================

  /**
   * Get analytics data for a site
   */
  async getAnalytics(siteId: string): Promise<AnalyticsData> {
    return retryWithBackoff(() =>
      this.request<AnalyticsData>(`/analytics/${siteId}`)
    )
  }

  /**
   * Track a view for a site (called when serving site content)
   */
  async trackView(slug: string): Promise<void> {
    // Don't retry view tracking - it's fire-and-forget
    try {
      await this.request<void>('/analytics/track', {
        method: 'POST',
        body: JSON.stringify({ slug }),
      })
    } catch (error) {
      // Silently fail - view tracking shouldn't break the user experience
      console.error('Failed to track view:', error)
    }
  }
}

// Export a singleton instance
export const apiClient = new ApiClient()
