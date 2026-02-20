/**
 * File Upload Endpoint
 * 
 * POST /api/upload
 * 
 * Handles file uploads (HTML or ZIP), validates content, uploads images to ImgBB,
 * uploads text files to Pastebin, and returns file metadata with storage URLs.
 * 
 * Requirements: 5, 6, 7, 21
 */

import { NextRequest, NextResponse } from 'next/server'
import AdmZip from 'adm-zip'
import { withRateLimit } from '@/lib/with-rate-limit'
import {
  validateFileExtension,
  detectVideoReferences,
  sanitizeFilename,
  getMimeType,
  ALLOWED_EXTENSIONS,
  VIDEO_EXTENSIONS
} from '@/lib/validation'
import { uploadToImgBB, ImgBBUploadError } from '@/lib/imgbb'
import { uploadToPastebin, PastebinUploadError } from '@/lib/pastebin'
import { replaceAssetUrls, type AssetUrlMapping } from '@/lib/url-replacement'
import { detectLocalImages, getUniqueImagePaths } from '@/lib/image-detection'

/**
 * File metadata structure
 */
interface FileMetadata {
  path: string
  storageUrl: string
  mimeType: string
  size: number
}

/**
 * Internal file structure during processing
 */
interface ProcessedFile {
  path: string
  content: Buffer
  mimeType: string
}

/**
 * Image file extensions
 */
const IMAGE_EXTENSIONS = ['.png', '.jpg', '.jpeg', '.gif', '.svg', '.webp', '.ico']

/**
 * Text file MIME types
 */
const TEXT_MIME_TYPES = ['text/html', 'text/css', 'application/javascript']

/**
 * Upload endpoint handler
 */
async function uploadHandler(request: NextRequest) {
  try {
    // Parse multipart form data
    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json(
        {
          error: 'No file',
          message: 'No file provided',
          statusCode: 400
        },
        { status: 400 }
      )
    }

    // Validate file size (50MB max) - Requirement 5
    const maxSize = 50 * 1024 * 1024 // 50MB in bytes
    if (file.size > maxSize) {
      return NextResponse.json(
        {
          error: 'File too large',
          message: 'File size exceeds 50MB limit',
          statusCode: 400
        },
        { status: 400 }
      )
    }

    // Validate file type (HTML or ZIP) - Requirement 5
    const fileName = file.name.toLowerCase()
    const isZip = fileName.endsWith('.zip')
    const isHtml = fileName.endsWith('.html') || fileName.endsWith('.htm')

    if (!isZip && !isHtml) {
      return NextResponse.json(
        {
          error: 'Invalid file type',
          message: 'Only HTML and ZIP files are allowed',
          statusCode: 400
        },
        { status: 400 }
      )
    }

    // Convert file to buffer
    const buffer = Buffer.from(await file.arrayBuffer())

    // Extract files from upload
    let files: ProcessedFile[] = []

    if (isHtml) {
      // Single HTML file upload
      files.push({
        path: 'index.html',
        content: buffer,
        mimeType: 'text/html'
      })
    } else {
      // ZIP file upload - extract contents
      try {
        const zip = new AdmZip(buffer)
        const zipEntries = zip.getEntries()

        if (zipEntries.length === 0) {
          return NextResponse.json(
            {
              error: 'Empty ZIP',
              message: 'ZIP file contains no files',
              statusCode: 400
            },
            { status: 400 }
          )
        }

        // Filter out macOS junk and directories
        const validFileEntries = zipEntries.filter(e => {
          if (e.isDirectory) return false
          const name = e.entryName.replace(/\\/g, '/')
          if (name.includes('__MACOSX/') || name.endsWith('.DS_Store')) return false
          return true
        })

        const targetEntries = validFileEntries.length > 0 ? validFileEntries : zipEntries.filter(e => !e.isDirectory)

        // Find common root directory to strip
        let commonPrefix = ''
        if (targetEntries.length > 0) {
          const paths = targetEntries.map(e => e.entryName.replace(/\\/g, '/'))
          const splitPaths = paths.map(p => p.split('/'))

          const shortestPathLength = Math.min(...splitPaths.map(p => p.length))

          const prefixParts: string[] = []
          for (let i = 0; i < shortestPathLength - 1; i++) { // -1 because last part is filename
            const part = splitPaths[0][i]
            if (splitPaths.every(p => p[i] === part)) {
              prefixParts.push(part)
            } else {
              break
            }
          }

          if (prefixParts.length > 0) {
            commonPrefix = prefixParts.join('/') + '/'
          }
        }

        for (const entry of zipEntries) {
          // Skip directories
          if (entry.isDirectory) continue

          // Skip macOS junk
          const rawName = entry.entryName.replace(/\\/g, '/')
          if (rawName.includes('__MACOSX/') || rawName.endsWith('.DS_Store')) continue

          let entryPath = rawName
          if (commonPrefix && entryPath.startsWith(commonPrefix)) {
            entryPath = entryPath.substring(commonPrefix.length)
          }

          // Sanitize filename to prevent path traversal - Requirement 5, 24
          const sanitizedPath = sanitizeFilename(entryPath)

          if (!sanitizedPath || sanitizedPath === 'unnamed') {
            continue // Skip invalid filenames
          }

          // Validate file extension - Requirement 5
          const validation = validateFileExtension(sanitizedPath)

          if (!validation.valid) {
            return NextResponse.json(
              {
                error: 'Invalid file type',
                message: validation.error || 'Invalid file in ZIP',
                statusCode: 400
              },
              { status: 400 }
            )
          }

          // Get file content
          const fileContent = entry.getData()

          files.push({
            path: sanitizedPath,
            content: fileContent,
            mimeType: getMimeType(sanitizedPath)
          })
        }

        if (files.length === 0) {
          return NextResponse.json(
            {
              error: 'No valid files',
              message: 'ZIP file contains no valid files',
              statusCode: 400
            },
            { status: 400 }
          )
        }
      } catch (error) {
        console.error('ZIP extraction error:', error)
        return NextResponse.json(
          {
            error: 'Invalid ZIP',
            message: 'Failed to extract ZIP file. File may be corrupted.',
            statusCode: 400
          },
          { status: 400 }
        )
      }
    }

    // Scan for video references in text files - Requirement 5
    const textFiles = files.filter(f => TEXT_MIME_TYPES.includes(f.mimeType))

    for (const textFile of textFiles) {
      const content = textFile.content.toString('utf-8')
      const { hasVideoReferences, references } = detectVideoReferences(content)

      if (hasVideoReferences) {
        return NextResponse.json(
          {
            error: 'Video references not allowed',
            message: `References to video files (${references.join(', ')}) are not supported`,
            statusCode: 400
          },
          { status: 400 }
        )
      }
    }

    // Detect missing local images in HTML files (for single HTML uploads)
    if (isHtml && files.length === 1) {
      const htmlContent = files[0].content.toString('utf-8')
      const imageReferences = detectLocalImages(htmlContent)
      const missingImages = getUniqueImagePaths(imageReferences)

      // Filter out images that don't exist in the upload
      const actuallyMissing = missingImages.filter(imgPath =>
        !files.some(f => f.path === imgPath)
      )

      if (actuallyMissing.length > 0) {
        return NextResponse.json(
          {
            error: 'Missing images',
            message: 'Your HTML file references local images that need to be uploaded',
            statusCode: 400,
            missingImages: actuallyMissing,
            requiresImageUpload: true
          },
          { status: 400 }
        )
      }
    }

    const imageFiles = files.filter(f =>
      IMAGE_EXTENSIONS.some(ext => f.path.toLowerCase().endsWith(ext))
    )

    const assetUrlMap: AssetUrlMapping = {}

    for (const imageFile of imageFiles) {
      try {
        const imgbbUrl = await uploadToImgBB(imageFile.content, imageFile.path)
        assetUrlMap[imageFile.path] = imgbbUrl
      } catch (error) {
        console.error('ImgBB upload error:', error)

        if (error instanceof ImgBBUploadError) {
          return NextResponse.json(
            {
              error: 'Image upload failed',
              message: error.message,
              statusCode: error.statusCode || 500
            },
            { status: error.statusCode || 500 }
          )
        }

        return NextResponse.json(
          {
            error: 'Image upload failed',
            message: 'Failed to upload images to hosting service',
            statusCode: 500
          },
          { status: 500 }
        )
      }
    }

    // Upload CSS and JS files to Pastebin first
    const uploadedFiles: FileMetadata[] = []

    for (const imageFile of imageFiles) {
      uploadedFiles.push({
        path: imageFile.path,
        storageUrl: assetUrlMap[imageFile.path],
        mimeType: imageFile.mimeType,
        size: imageFile.content.length
      })
    }

    const cssJsFiles = files.filter(f => f.mimeType === 'text/css' || f.mimeType === 'application/javascript')
    for (const file of cssJsFiles) {
      try {
        let content = file.content.toString('utf-8')
        // CSS files might contain image references, so replace them first
        if (file.mimeType === 'text/css') {
          content = replaceAssetUrls(content, assetUrlMap)
          file.content = Buffer.from(content, 'utf-8')
        }

        const pastebinUrl = await uploadToPastebin(content, file.path)
        // Convert to raw URL by replacing pastebin.com/ with pastebin.com/raw/
        const rawUrl = pastebinUrl.replace('pastebin.com/', 'pastebin.com/raw/')
        // We cannot use rawUrl in HTML because Pastebin serves it as text/plain which triggers ORB.
        // Instead, the assetUrlMap will hold the rawUrl for ImgBB but for text files we want to use
        // the Next.js API proxy route. However, we don't know the site slug here.
        // The most robust way is to just NOT replace CSS/JS links in the HTML at this stage.
        // Wait, if we don't replace them, then the HTML will request `<link href="style.css">`.
        // Relative paths like `style.css` will naturally resolve to `/s/[slug]/style.css` when rendered!
        // So we ONLY need to replace images in css! We do not need to replace css/js URLs in HTML at all!
        // We just need to make sure the css and js files are uploaded to storage so the proxy can serve them.
        // So we do NOT add CSS/JS to assetUrlMap.
        // assetUrlMap[file.path] = rawUrl

        uploadedFiles.push({
          path: file.path,
          storageUrl: pastebinUrl,
          mimeType: file.mimeType,
          size: file.content.length
        })
      } catch (error) {
        console.error(`Failed to upload ${file.path}:`, error)
        if (error instanceof PastebinUploadError) {
          return NextResponse.json({ error: 'Asset upload failed', message: error.message, statusCode: error.statusCode || 500 }, { status: error.statusCode || 500 })
        }
        return NextResponse.json({ error: 'Asset upload failed', message: `Failed to upload ${file.path}`, statusCode: 500 }, { status: 500 })
      }
    }

    // Replace asset URLs in HTML files
    const htmlFiles = files.filter(f => f.mimeType === 'text/html')
    for (const htmlFile of htmlFiles) {
      let content = htmlFile.content.toString('utf-8')

      // Replace image, CSS, and JS paths with their hosted URLs
      content = replaceAssetUrls(content, assetUrlMap)

      // Update file content with replaced URLs
      htmlFile.content = Buffer.from(content, 'utf-8')

      try {
        const pastebinUrl = await uploadToPastebin(content, htmlFile.path)
        uploadedFiles.push({
          path: htmlFile.path,
          storageUrl: pastebinUrl,
          mimeType: htmlFile.mimeType,
          size: htmlFile.content.length
        })
      } catch (error) {
        if (error instanceof PastebinUploadError) {
          return NextResponse.json({ error: 'HTML upload failed', message: error.message, statusCode: error.statusCode || 500 }, { status: error.statusCode || 500 })
        }
        return NextResponse.json({ error: 'HTML upload failed', message: 'Failed to upload HTML to hosting service', statusCode: 500 }, { status: 500 })
      }
    }

    // Return file metadata with storage URLs
    return NextResponse.json(
      {
        success: true,
        fileCount: uploadedFiles.length,
        files: uploadedFiles
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Upload error:', error)

    // Handle JSON parse errors
    if (error instanceof SyntaxError) {
      return NextResponse.json(
        {
          error: 'Invalid request',
          message: 'Invalid request format',
          statusCode: 400
        },
        { status: 400 }
      )
    }

    // Handle unexpected errors
    return NextResponse.json(
      {
        error: 'Upload failed',
        message: 'An unexpected error occurred during upload',
        statusCode: 500
      },
      { status: 500 }
    )
  }
}

// Apply rate limiting: 10 uploads per hour - Requirement 21
export const POST = withRateLimit(uploadHandler, 'uploadFile')
