/**
 * API Client Usage Examples
 * 
 * This file demonstrates how to use the API client in various scenarios.
 * These examples can be converted to tests once the testing framework is set up.
 */

import { apiClient, ApiError } from './api-client'
import { handleApiError, isAuthError, isNetworkError } from './error-handler'

// ============================================================================
// Authentication Examples
// ============================================================================

/**
 * Example: User Registration
 */
export async function exampleRegister() {
  try {
    const response = await apiClient.register({
      username: 'johndoe',
      email: 'john@example.com',
      password: 'SecurePass123!',
    })

    console.log('Registration successful:', response.user)
    console.log('Token stored automatically')

    // Redirect to dashboard
    window.location.href = '/dashboard'
  } catch (error) {
    const message = handleApiError(error)
    console.error('Registration failed:', message)
    // Show error toast to user
  }
}

/**
 * Example: User Login
 */
export async function exampleLogin() {
  try {
    const response = await apiClient.login({
      email: 'john@example.com',
      password: 'SecurePass123!',
    })

    console.log('Login successful:', response.user)
    // Token is automatically stored

    // Check if there's a redirect path
    const redirectPath = localStorage.getItem('redirect_after_login')
    if (redirectPath) {
      localStorage.removeItem('redirect_after_login')
      window.location.href = redirectPath
    } else {
      window.location.href = '/dashboard'
    }
  } catch (error) {
    const message = handleApiError(error)
    console.error('Login failed:', message)
    // Show error message below form
  }
}

/**
 * Example: User Logout
 */
export async function exampleLogout() {
  try {
    await apiClient.logout()
    console.log('Logout successful')
    // Token is automatically cleared
    window.location.href = '/'
  } catch (error) {
    // Even if the API call fails, the token is cleared
    console.error('Logout error:', error)
    window.location.href = '/'
  }
}

// ============================================================================
// Site Management Examples
// ============================================================================

/**
 * Example: Check Slug Availability
 */
export async function exampleCheckSlug(slug: string) {
  try {
    const response = await apiClient.checkSlug(slug)

    if (response.available) {
      console.log(`Slug "${slug}" is available!`)
      // Show green checkmark
    } else {
      console.log(`Slug "${slug}" is taken`)
      // Show error message
    }

    return response.available
  } catch (error) {
    const message = handleApiError(error)
    console.error('Slug check failed:', message)
    return false
  }
}

/**
 * Example: Create a New Site
 */
export async function exampleCreateSite() {
  try {
    const site = await apiClient.createSite({
      name: 'My Awesome Site',
      slug: 'my-awesome-site',
      managed: true,
    })

    console.log('Site created:', site)
    // Show success toast
    // Redirect to dashboard or site page
    return site
  } catch (error) {
    const message = handleApiError(error)
    console.error('Site creation failed:', message)
    // Show error toast
    throw error
  }
}

/**
 * Example: Fetch User's Sites
 */
export async function exampleGetSites() {
  try {
    const sites = await apiClient.getSites()

    if (sites.length === 0) {
      console.log('No sites yet')
      // Show empty state
    } else {
      console.log(`Found ${sites.length} sites:`, sites)
      // Display sites in grid
    }

    return sites
  } catch (error) {
    if (isAuthError(error)) {
      console.log('User not authenticated, redirecting to login')
      // handleApiError will redirect automatically
    }

    const message = handleApiError(error)
    console.error('Failed to fetch sites:', message)
    // Show error toast
    return []
  }
}

/**
 * Example: Update a Site
 */
export async function exampleUpdateSite(siteId: string, newName: string) {
  try {
    const updatedSite = await apiClient.updateSite(siteId, {
      name: newName,
    })

    console.log('Site updated:', updatedSite)
    // Show success toast
    return updatedSite
  } catch (error) {
    const message = handleApiError(error)
    console.error('Site update failed:', message)
    // Show error toast
    throw error
  }
}

/**
 * Example: Delete a Site
 */
export async function exampleDeleteSite(siteId: string) {
  try {
    await apiClient.deleteSite(siteId)

    console.log('Site deleted successfully')
    // Show success toast
    // Remove site from UI
    return true
  } catch (error) {
    const message = handleApiError(error)
    console.error('Site deletion failed:', message)
    // Show error toast
    return false
  }
}

// ============================================================================
// File Upload Examples
// ============================================================================

/**
 * Example: Upload a File with Progress Tracking
 */
export async function exampleUploadFile(file: File) {
  try {
    // Validate file type
    const validTypes = ['text/html', 'application/zip', 'application/x-zip-compressed']
    if (!validTypes.includes(file.type)) {
      throw new Error('Invalid file type. Please upload an HTML or ZIP file.')
    }

    // Validate file size (50MB limit)
    const maxSize = 50 * 1024 * 1024 // 50MB in bytes
    if (file.size > maxSize) {
      throw new Error('File size exceeds 50MB limit.')
    }

    console.log('Starting upload...')

    const response = await apiClient.uploadFile(file, (progress) => {
      console.log(`Upload progress: ${progress}%`)
      // Update progress bar in UI
    })

    console.log('Upload complete:', response)
    // Proceed to next step in upload flow
    return response
  } catch (error) {
    const message = handleApiError(error)
    console.error('Upload failed:', message)
    // Show error toast
    throw error
  }
}

// ============================================================================
// File Management Examples
// ============================================================================

/**
 * Example: Get File Content for Code Editor
 */
export async function exampleGetFileContent(siteId: string, filePath: string) {
  try {
    const file = await apiClient.getFileContent(siteId, filePath)

    console.log('File loaded:', file.path)
    // Display content in code editor
    return file
  } catch (error) {
    const message = handleApiError(error)
    console.error('Failed to load file:', message)
    // Show error toast
    throw error
  }
}

/**
 * Example: Save File Content from Code Editor
 */
export async function exampleSaveFileContent(
  siteId: string,
  filePath: string,
  content: string
) {
  try {
    const updatedFile = await apiClient.updateFileContent(siteId, filePath, {
      content,
    })

    console.log('File saved:', updatedFile)
    // Show success toast
    // Update last modified timestamp in UI
    return updatedFile
  } catch (error) {
    const message = handleApiError(error)
    console.error('Failed to save file:', message)
    // Show error toast
    // Preserve unsaved changes
    throw error
  }
}

// ============================================================================
// Analytics Examples
// ============================================================================

/**
 * Example: Fetch Site Analytics
 */
export async function exampleGetAnalytics(siteId: string) {
  try {
    const analytics = await apiClient.getAnalytics(siteId)

    if (analytics.totalViews === 0) {
      console.log('No analytics data yet')
      // Show empty state
    } else {
      console.log('Analytics data:', analytics)
      // Display charts and stats
    }

    return analytics
  } catch (error) {
    const message = handleApiError(error)
    console.error('Failed to fetch analytics:', message)
    // Show error toast or empty state
    return null
  }
}

/**
 * Example: Track a Site View
 */
export async function exampleTrackView(slug: string) {
  // This is fire-and-forget, errors are logged but don't affect UX
  await apiClient.trackView(slug)
}

// ============================================================================
// Error Handling Examples
// ============================================================================

/**
 * Example: Handling Different Error Types
 */
export async function exampleErrorHandling() {
  try {
    await apiClient.getSites()
  } catch (error) {
    // Check error type
    if (isAuthError(error)) {
      console.log('Authentication error - user will be redirected to login')
    } else if (isNetworkError(error)) {
      console.log('Network error - show retry option')
      // Show retry button
    } else if (error instanceof ApiError) {
      console.log(`API error ${error.statusCode}: ${error.message}`)
    } else {
      console.log('Unknown error:', error)
    }

    // Get user-friendly message
    const message = handleApiError(error)
    console.log('User message:', message)
  }
}

/**
 * Example: Retry Logic in Action
 */
export async function exampleRetryLogic() {
  try {
    // The API client automatically retries on network errors and 5xx errors
    // with exponential backoff (1s, 2s, 4s)
    const sites = await apiClient.getSites()
    console.log('Sites fetched (possibly after retries):', sites)
  } catch (error) {
    // If all retries fail, the error is thrown
    console.error('All retry attempts failed:', error)
  }
}

// ============================================================================
// Profile Management Examples
// ============================================================================

/**
 * Example: Get User Profile
 */
export async function exampleGetProfile() {
  try {
    const user = await apiClient.getProfile()
    console.log('User profile:', user)
    // Display in profile page
    return user
  } catch (error) {
    const message = handleApiError(error)
    console.error('Failed to fetch profile:', message)
    throw error
  }
}

/**
 * Example: Update User Profile
 */
export async function exampleUpdateProfile() {
  try {
    const updatedUser = await apiClient.updateProfile({
      username: 'newusername',
      email: 'newemail@example.com',
    })

    console.log('Profile updated:', updatedUser)
    // Show success toast
    return updatedUser
  } catch (error) {
    const message = handleApiError(error)
    console.error('Profile update failed:', message)
    // Show error toast
    throw error
  }
}

/**
 * Example: Change Password
 */
export async function exampleChangePassword(
  currentPassword: string,
  newPassword: string
) {
  try {
    await apiClient.updateProfile({
      currentPassword,
      newPassword,
    })

    console.log('Password changed successfully')
    // Show success toast
    return true
  } catch (error) {
    const message = handleApiError(error)
    console.error('Password change failed:', message)
    // Show error toast
    return false
  }
}
