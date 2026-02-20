/**
 * Additional Image Upload Endpoint
 * 
 * POST /api/upload-images
 * 
 * Handles uploading additional images that were referenced in HTML
 * but not included in the initial upload.
 */

import { NextRequest, NextResponse } from 'next/server'
import { uploadToImgBB, ImgBBUploadError } from '@/lib/imgbb'
import { withRateLimit } from '@/lib/with-rate-limit'

/**
 * Image upload result
 */
interface ImageUploadResult {
  originalName: string
  uploadedUrl: string
  size: number
}

/**
 * Upload images endpoint handler
 */
async function uploadImagesHandler(request: NextRequest) {
  try {
    // Parse multipart form data
    const formData = await request.formData()
    
    // Get all uploaded images
    const images: File[] = []
    for (const [key, value] of formData.entries()) {
      if (value instanceof File && key.startsWith('image')) {
        images.push(value)
      }
    }
    
    if (images.length === 0) {
      return NextResponse.json(
        {
          error: 'No images',
          message: 'No images provided',
          statusCode: 400
        },
        { status: 400 }
      )
    }
    
    // Validate image count (max 20 images)
    if (images.length > 20) {
      return NextResponse.json(
        {
          error: 'Too many images',
          message: 'Maximum 20 images can be uploaded at once',
          statusCode: 400
        },
        { status: 400 }
      )
    }
    
    // Validate each image
    const maxSize = 10 * 1024 * 1024 // 10MB per image
    const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/gif', 'image/svg+xml', 'image/webp', 'image/x-icon']
    
    for (const image of images) {
      // Check size
      if (image.size > maxSize) {
        return NextResponse.json(
          {
            error: 'Image too large',
            message: `Image "${image.name}" exceeds 10MB limit`,
            statusCode: 400
          },
          { status: 400 }
        )
      }
      
      // Check type
      if (!allowedTypes.includes(image.type)) {
        return NextResponse.json(
          {
            error: 'Invalid image type',
            message: `Image "${image.name}" has invalid type. Only PNG, JPG, GIF, SVG, WebP, and ICO are allowed`,
            statusCode: 400
          },
          { status: 400 }
        )
      }
    }
    
    // Upload all images to ImgBB
    const uploadResults: ImageUploadResult[] = []
    const errors: string[] = []
    
    for (const image of images) {
      try {
        const buffer = Buffer.from(await image.arrayBuffer())
        const imgbbUrl = await uploadToImgBB(buffer, image.name)
        
        uploadResults.push({
          originalName: image.name,
          uploadedUrl: imgbbUrl,
          size: image.size
        })
      } catch (error) {
        console.error(`Failed to upload image ${image.name}:`, error)
        
        if (error instanceof ImgBBUploadError) {
          errors.push(`${image.name}: ${error.message}`)
        } else {
          errors.push(`${image.name}: Upload failed`)
        }
      }
    }
    
    // If all uploads failed
    if (uploadResults.length === 0) {
      return NextResponse.json(
        {
          error: 'All uploads failed',
          message: 'Failed to upload any images',
          errors,
          statusCode: 500
        },
        { status: 500 }
      )
    }
    
    // Return results (partial success is OK)
    return NextResponse.json(
      {
        success: true,
        uploadedCount: uploadResults.length,
        totalCount: images.length,
        images: uploadResults,
        errors: errors.length > 0 ? errors : undefined
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Image upload error:', error)
    
    return NextResponse.json(
      {
        error: 'Upload failed',
        message: 'An unexpected error occurred during image upload',
        statusCode: 500
      },
      { status: 500 }
    )
  }
}

// Apply rate limiting: 10 uploads per hour
export const POST = withRateLimit(uploadImagesHandler, 'uploadFile')
