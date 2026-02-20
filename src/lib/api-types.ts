/**
 * API Type Definitions for SitePlod
 * 
 * This file contains all TypeScript interfaces for API requests and responses.
 * These types serve as the contract between frontend and backend.
 */

// ============================================================================
// User Models
// ============================================================================

export interface User {
  id: string
  username: string
  email: string
  createdAt: string
  updatedAt: string
}

// ============================================================================
// Site Models
// ============================================================================

export interface Site {
  id: string
  name: string
  slug: string
  managed: boolean
  userId: string | null
  views: number
  status: 'live' | 'draft' | 'archived'
  createdAt: string
  updatedAt: string
  files?: Array<{
    id: string
    site_id: string
    path: string
    mime_type: string
    size: number
    storage_url: string
    created_at: string
    updated_at: string
  }>
}

export interface SiteFile {
  id: string
  siteId: string
  path: string
  content?: string
  mimeType: string
  size: number
  createdAt: string
  updatedAt: string
}

// ============================================================================
// Analytics Models
// ============================================================================

export interface AnalyticsData {
  siteId: string
  siteName: string
  slug: string
  totalViews: number
  dailyViews: { date: string; views: number }[]
  weeklyViews: { week: string; views: number }[]
  monthlyViews: { month: string; views: number }[]
}

// ============================================================================
// Authentication Request/Response Types
// ============================================================================

export interface RegisterRequest {
  username: string
  email: string
  password: string
}

export interface LoginRequest {
  email: string
  password: string
}

export interface AuthResponse {
  user?: User
  token?: string
  message?: string
  requiresVerification?: boolean
}

export interface ResendVerificationRequest {
  email: string
}

// ============================================================================
// Site Management Request/Response Types
// ============================================================================

export interface CreateSiteRequest {
  name: string
  slug: string
  managed: boolean
  files: Array<{
    path: string
    storageUrl: string
    mimeType: string
    size: number
  }>
}

export interface UpdateSiteRequest {
  name?: string
}

export interface SlugCheckResponse {
  available: boolean
  slug: string
}

// ============================================================================
// File Management Request/Response Types
// ============================================================================

export interface UpdateFileRequest {
  content: string
}

export interface UploadFileResponse {
  success: boolean
  fileCount: number
  files: Array<{
    path: string
    storageUrl: string
    mimeType: string
    size: number
  }>
}

// ============================================================================
// Profile Update Types
// ============================================================================

export interface ProfileUpdateRequest {
  username?: string
  email?: string
  currentPassword?: string
  newPassword?: string
}

// ============================================================================
// Error Types
// ============================================================================

export interface ApiError {
  error: string
  message: string
  statusCode: number
  missingImages?: string[]
  requiresImageUpload?: boolean
  requiresVerification?: boolean
}

export interface ImageUploadResponse {
  success: boolean
  uploadedCount: number
  totalCount: number
  images: Array<{
    originalName: string
    uploadedUrl: string
    size: number
  }>
  errors?: string[]
}
