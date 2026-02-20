'use client'

import { useState } from 'react'
import { Upload, X, Check, AlertCircle } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

interface MissingImagesDialogProps {
  open: boolean
  onClose: () => void
  missingImages: string[]
  onImagesUploaded: (imageMap: Record<string, string>) => void
}

export function MissingImagesDialog({
  open,
  onClose,
  missingImages,
  onImagesUploaded
}: MissingImagesDialogProps) {
  const [selectedFiles, setSelectedFiles] = useState<Record<string, File>>({})
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState<Record<string, 'pending' | 'uploading' | 'success' | 'error'>>({})

  const handleFileSelect = (imageName: string, file: File | null) => {
    if (file) {
      setSelectedFiles(prev => ({ ...prev, [imageName]: file }))
      setUploadProgress(prev => ({ ...prev, [imageName]: 'pending' }))
    } else {
      const newFiles = { ...selectedFiles }
      delete newFiles[imageName]
      setSelectedFiles(newFiles)
      
      const newProgress = { ...uploadProgress }
      delete newProgress[imageName]
      setUploadProgress(newProgress)
    }
  }

  const handleUpload = async () => {
    const filesToUpload = Object.entries(selectedFiles)
    
    if (filesToUpload.length === 0) {
      toast.error('No images selected', {
        description: 'Please select at least one image to upload'
      })
      return
    }

    setUploading(true)

    try {
      const formData = new FormData()
      
      filesToUpload.forEach(([name, file], index) => {
        formData.append(`image${index}`, file, name)
        setUploadProgress(prev => ({ ...prev, [name]: 'uploading' }))
      })

      const response = await fetch('/api/upload-images', {
        method: 'POST',
        body: formData
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Upload failed')
      }

      // Create mapping of original names to uploaded URLs
      const imageMap: Record<string, string> = {}
      data.images.forEach((img: any) => {
        imageMap[img.originalName] = img.uploadedUrl
        setUploadProgress(prev => ({ ...prev, [img.originalName]: 'success' }))
      })

      // Mark any failed uploads
      if (data.errors) {
        data.errors.forEach((error: string) => {
          const imageName = error.split(':')[0]
          setUploadProgress(prev => ({ ...prev, [imageName]: 'error' }))
        })
      }

      toast.success('Images uploaded!', {
        description: `${data.uploadedCount} of ${data.totalCount} images uploaded successfully`
      })

      // Wait a moment to show success state
      setTimeout(() => {
        onImagesUploaded(imageMap)
        onClose()
      }, 1000)
    } catch (error: any) {
      console.error('Upload error:', error)
      toast.error('Upload failed', {
        description: error.message || 'Failed to upload images'
      })
      
      // Mark all as error
      Object.keys(selectedFiles).forEach(name => {
        setUploadProgress(prev => ({ ...prev, [name]: 'error' }))
      })
    } finally {
      setUploading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Missing Images Detected</DialogTitle>
          <DialogDescription>
            Your HTML file references {missingImages.length} image{missingImages.length > 1 ? 's' : ''} that need to be uploaded.
            Please select the corresponding image files below.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          {missingImages.map((imageName) => (
            <div key={imageName} className="border border-gold/20 bg-charcoal p-4 rounded">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-mono text-sm text-champagne">{imageName}</span>
                    {uploadProgress[imageName] === 'success' && (
                      <Check className="w-4 h-4 text-green-500" />
                    )}
                    {uploadProgress[imageName] === 'error' && (
                      <AlertCircle className="w-4 h-4 text-red-500" />
                    )}
                  </div>
                  
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileSelect(imageName, e.target.files?.[0] || null)}
                    disabled={uploading}
                    className="text-sm text-pewter file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-gold file:text-obsidian hover:file:bg-gold/90 file:cursor-pointer disabled:opacity-50"
                  />
                  
                  {selectedFiles[imageName] && (
                    <p className="text-xs text-pewter mt-1">
                      Selected: {selectedFiles[imageName].name} ({(selectedFiles[imageName].size / 1024).toFixed(1)} KB)
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-end gap-3 mt-6">
          <Button
            variant="ghost"
            onClick={onClose}
            disabled={uploading}
          >
            Cancel
          </Button>
          <Button
            variant="solid"
            onClick={handleUpload}
            disabled={uploading || Object.keys(selectedFiles).length === 0}
            className="gap-2"
          >
            {uploading ? (
              <>
                <div className="w-4 h-4 border-2 border-obsidian border-t-transparent rounded-full animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <Upload className="w-4 h-4" />
                Upload {Object.keys(selectedFiles).length} Image{Object.keys(selectedFiles).length !== 1 ? 's' : ''}
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
