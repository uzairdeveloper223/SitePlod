'use client'

import { useState, useCallback } from 'react'
import { Upload, FileArchive, FileCode, Check, ArrowRight, ArrowLeft, User, Globe, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardCornerDecorations } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Progress } from '@/components/ui/progress'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import { validateSlug } from '@/lib/validation'
import { MissingImagesDialog } from './missing-images-dialog'
import { apiClient } from '@/lib/api-client'

type UploadStep = 'upload' | 'uploading' | 'choice' | 'slug' | 'register' | 'deploying' | 'success'

interface UploadFlowProps {
  onNavigate?: (page: 'home' | 'upload' | 'dashboard') => void
}

export function UploadFlow({ onNavigate }: UploadFlowProps) {
  const [currentStep, setCurrentStep] = useState<UploadStep>('upload')
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [isManaged, setIsManaged] = useState<boolean | null>(null)
  const [slug, setSlug] = useState('')
  const [slugAvailable, setSlugAvailable] = useState<boolean | null>(null)
  const [slugError, setSlugError] = useState<string | null>(null)
  const [isCheckingSlug, setIsCheckingSlug] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [isProcessing, setIsProcessing] = useState(false)
  const [deploymentProgress, setDeploymentProgress] = useState(0)
  const [deploymentStatus, setDeploymentStatus] = useState('')

  // Missing images state
  const [missingImages, setMissingImages] = useState<string[]>([])
  const [showMissingImagesDialog, setShowMissingImagesDialog] = useState(false)
  const [uploadedFiles, setUploadedFiles] = useState<any[]>([])
  const [uploadedImageMap, setUploadedImageMap] = useState<Record<string, string>>({})

  const handleFileUpload = useCallback(async (file: File) => {
    setCurrentStep('uploading')
    setUploadProgress(0)
    setIsProcessing(false)

    const toastId = toast.loading('Uploading file...', {
      description: `Uploading ${file.name}`
    })

    try {
      // Upload file with progress tracking
      const response = await apiClient.uploadFile(file, (progress) => {
        setUploadProgress(progress)
      })

      // Start processing phase
      setIsProcessing(true)
      toast.loading('Processing file...', {
        id: toastId,
        description: 'Analyzing and preparing your site'
      })

      // Store uploaded files for later use
      setUploadedFiles(response.files)

      // Small delay for UX
      await new Promise(resolve => setTimeout(resolve, 1000))

      setIsProcessing(false)
      setCurrentStep('choice')

      toast.success('File uploaded successfully!', {
        id: toastId,
        description: 'Ready to configure deployment'
      })
    } catch (error: any) {
      console.error('Upload error:', error)

      // Check if missing images error - ApiError now includes full error data
      if (error.data?.requiresImageUpload && error.data?.missingImages) {
        setMissingImages(error.data.missingImages)
        setShowMissingImagesDialog(true)
        setCurrentStep('upload')
        toast.dismiss(toastId)
        return
      }

      toast.error('Upload failed', {
        id: toastId,
        description: error.message || 'Failed to upload file'
      })
      setCurrentStep('upload')
    }
  }, [])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const files = e.dataTransfer.files
    if (files.length > 0) {
      const file = files[0]
      if (file.name.endsWith('.html') || file.name.endsWith('.zip')) {
        setUploadedFile(file)
        handleFileUpload(file)
      } else {
        toast.error('Invalid file type', {
          description: 'Please upload an HTML or ZIP file'
        })
      }
    }
  }, [handleFileUpload])

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      const file = files[0]
      if (file.name.endsWith('.html') || file.name.endsWith('.zip')) {
        setUploadedFile(file)
        handleFileUpload(file)
      } else {
        toast.error('Invalid file type', {
          description: 'Please upload an HTML or ZIP file'
        })
      }
    }
  }, [handleFileUpload])

  const handleChoice = (managed: boolean) => {
    setIsManaged(managed)
    if (managed) {
      // Check if user is already logged in
      const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null
      if (token) {
        // User is already logged in, skip registration and go to slug selection
        toast.success('Using your account', {
          description: 'Proceeding with managed deployment'
        })
        setCurrentStep('slug')
      } else {
        // User not logged in, prompt them to register using the header
        toast.error('Account required', {
          description: 'Please register or login using the button in the header to continue with managed deployment.',
          duration: 8000,
          action: {
            label: 'Open Login',
            onClick: () => {
              const loginButton = document.querySelector('[data-login-button]') as HTMLElement
              if (loginButton) {
                loginButton.click()
              }
            }
          }
        })
        // Reset to choice step
        setCurrentStep('choice')
      }
    } else {
      setCurrentStep('slug')
    }
  }

  const checkSlugAvailability = async (value: string) => {
    setSlug(value)

    // Reset availability state
    setSlugAvailable(null)
    setSlugError(null)

    // Validate slug format first
    const validation = validateSlug(value)
    if (!validation.valid) {
      setSlugError(validation.error || null)
      setIsCheckingSlug(false)
      return
    }

    // Show loading state
    setIsCheckingSlug(true)

    try {
      const response = await apiClient.checkSlug(value)
      setSlugAvailable(response.available)
      if (!response.available) {
        setSlugError('This slug is already taken')
      }
    } catch (error: any) {
      console.error('Slug check error:', error)
      setSlugError('Failed to check slug availability')
    } finally {
      setIsCheckingSlug(false)
    }
  }

  const handleDeploy = async () => {
    if (isManaged) {
      // Check if user is logged in
      const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null
      if (!token) {
        // User not logged in, prompt them to register using the header
        toast.error('Account required', {
          description: 'Please register or login using the button in the header to continue.',
          duration: 8000,
          action: {
            label: 'Open Login',
            onClick: () => {
              const loginButton = document.querySelector('[data-login-button]') as HTMLElement
              if (loginButton) {
                loginButton.click()
              }
            }
          }
        })
        return
      }
      // User is logged in, proceed with deployment
    }

    setCurrentStep('deploying')
    setDeploymentProgress(0)
    setDeploymentStatus('Initializing deployment...')

    const toastId = toast.loading('Deploying site...', {
      description: 'Setting up your site on our servers'
    })

    try {
      // Update progress stages
      setDeploymentProgress(20)
      setDeploymentStatus('Validating files...')
      await new Promise(resolve => setTimeout(resolve, 400))

      setDeploymentProgress(40)
      setDeploymentStatus('Creating site structure...')
      await new Promise(resolve => setTimeout(resolve, 400))

      setDeploymentProgress(60)
      setDeploymentStatus('Uploading assets...')

      // Create site with uploaded files
      const site = await apiClient.createSite({
        name: slug,
        slug: slug,
        managed: isManaged || false,
        files: uploadedFiles
      })

      setDeploymentProgress(80)
      setDeploymentStatus('Configuring server...')
      await new Promise(resolve => setTimeout(resolve, 400))

      setDeploymentProgress(100)
      setDeploymentStatus('Finalizing deployment...')
      await new Promise(resolve => setTimeout(resolve, 300))

      setCurrentStep('success')

      toast.success('Site deployed successfully!', {
        id: toastId,
        description: `Your site is now live at siteplod.vercel.app/s/${slug}`
      })
    } catch (error: any) {
      console.error('Deployment error:', error)
      toast.error('Deployment failed', {
        id: toastId,
        description: error.message || 'Failed to deploy site'
      })
      setCurrentStep('slug')
    }
  }

  const handleBack = () => {
    switch (currentStep) {
      case 'choice':
        setCurrentStep('upload')
        break
      case 'slug':
        setCurrentStep('choice')
        break
      default:
        setCurrentStep('upload')
    }
  }

  const handleImagesUploaded = async (imageMap: Record<string, string>) => {
    setUploadedImageMap(imageMap)
    setShowMissingImagesDialog(false)

    toast.success('Images uploaded!', {
      description: 'Processing your site...'
    })

    if (!uploadedFile) return

    try {
      // Read the HTML file content
      const htmlContent = await uploadedFile.text()

      // Replace local image paths with uploaded URLs
      let modifiedHtml = htmlContent
      for (const [localPath, uploadedUrl] of Object.entries(imageMap)) {
        // Replace various formats: src="image.png", src='image.png', url(image.png)
        const patterns = [
          new RegExp(`src=["']${localPath}["']`, 'gi'),
          new RegExp(`src=["']\./${localPath}["']`, 'gi'),
          new RegExp(`url\\(["']?${localPath}["']?\\)`, 'gi'),
          new RegExp(`url\\(["']?\./${localPath}["']?\\)`, 'gi'),
        ]

        for (const pattern of patterns) {
          if (pattern.toString().includes('src=')) {
            modifiedHtml = modifiedHtml.replace(pattern, `src="${uploadedUrl}"`)
          } else {
            modifiedHtml = modifiedHtml.replace(pattern, `url(${uploadedUrl})`)
          }
        }
      }

      // Create a new File object with modified content
      const modifiedFile = new File([modifiedHtml], uploadedFile.name, {
        type: uploadedFile.type
      })

      // Upload the modified file
      setUploadedFile(modifiedFile)
      await handleFileUpload(modifiedFile)
    } catch (error) {
      console.error('Error processing images:', error)
      toast.error('Failed to process images', {
        description: 'Please try uploading again'
      })
      setCurrentStep('upload')
    }
  }

  return (
    <div className="min-h-screen pt-32 pb-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        {/* Progress indicator */}
        <div className="flex items-center justify-center gap-4 mb-12">
          {['upload', 'choice', 'slug', 'success'].map((step, index) => (
            <div key={step} className="flex items-center">
              <div
                className={cn(
                  'w-10 h-10 border-2 flex items-center justify-center font-display text-sm transition-all duration-300',
                  currentStep === step ||
                    currentStep === 'uploading' && step === 'upload' ||
                    (currentStep === 'deploying' && step === 'slug') ||
                    (currentStep === 'success' && index < 3) ||
                    (currentStep === 'slug' && index < 2) ||
                    (currentStep === 'choice' && index < 1)
                    ? 'border-gold text-gold bg-gold/10'
                    : 'border-gold/30 text-pewter'
                )}
              >
                {index + 1}
              </div>
              {index < 3 && (
                <div
                  className={cn(
                    'w-12 h-0.5 mx-2 transition-all duration-300',
                    (currentStep === 'slug' && index < 2) ||
                      (currentStep === 'success' && index < 3) ||
                      (currentStep === 'deploying' && index < 2)
                      ? 'bg-gold'
                      : 'bg-gold/20'
                  )}
                />
              )}
            </div>
          ))}
        </div>

        {/* Upload Step */}
        {currentStep === 'upload' && (
          <Card className="relative overflow-hidden">
            <CardCornerDecorations />
            <CardHeader className="text-center border-b border-gold/20">
              <CardTitle className="text-3xl">Upload Your Site</CardTitle>
              <CardDescription className="text-base">
                Drag and drop your HTML file or ZIP package to get started
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-8">
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={cn(
                  'relative border-2 border-dashed transition-all duration-300 p-12 text-center cursor-pointer group',
                  isDragging
                    ? 'border-gold bg-gold/5'
                    : 'border-gold/30 hover:border-gold/50'
                )}
              >
                <input
                  type="file"
                  accept=".html,.zip"
                  onChange={handleFileSelect}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />

                <div className="flex flex-col items-center gap-4">
                  <div className="w-16 h-16 bg-obsidian border border-gold/30 flex items-center justify-center group-hover:border-gold transition-colors">
                    <Upload className="w-8 h-8 text-gold group-hover:scale-110 transition-transform" />
                  </div>
                  <div>
                    <p className="text-champagne text-lg mb-1">
                      Drop your file here, or click to browse
                    </p>
                    <p className="text-pewter text-sm">
                      Supports .html and .zip files
                    </p>
                  </div>
                </div>
              </div>

              {/* Supported formats */}
              <div className="mt-8 grid grid-cols-2 gap-4">
                <div className="flex items-center gap-3 p-4 bg-obsidian border border-gold/20">
                  <FileCode className="w-8 h-8 text-gold" />
                  <div>
                    <p className="text-champagne text-sm font-medium">Single HTML</p>
                    <p className="text-pewter text-xs">Upload an index.html file</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-4 bg-obsidian border border-gold/20">
                  <FileArchive className="w-8 h-8 text-gold" />
                  <div>
                    <p className="text-champagne text-sm font-medium">ZIP Package</p>
                    <p className="text-pewter text-xs">Include HTML, CSS, JS, images</p>
                  </div>
                </div>
              </div>

              {/* CLI Note */}
              <div className="mt-8 p-4 bg-charcoal border border-gold/20 text-center">
                <p className="text-pewter text-sm">
                  <span className="text-gold">CLI coming soon:</span>{' '}
                  Deploy from terminal with <code className="text-gold font-mono">npx siteplod deploy</code>
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Uploading Step */}
        {currentStep === 'uploading' && (
          <Card className="relative overflow-hidden">
            <CardCornerDecorations />
            <CardHeader className="text-center border-b border-gold/20">
              <CardTitle className="text-3xl">
                {isProcessing ? 'Processing File' : 'Uploading File'}
              </CardTitle>
              <CardDescription className="text-base">
                {isProcessing
                  ? 'Analyzing and preparing your site...'
                  : 'Please wait while we upload your file'
                }
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-8 pb-12">
              <div className="max-w-md mx-auto space-y-6">
                {/* File info */}
                <div className="flex items-center gap-4 p-4 bg-obsidian border border-gold/20">
                  {uploadedFile?.name.endsWith('.zip') ? (
                    <FileArchive className="w-10 h-10 text-gold flex-shrink-0" />
                  ) : (
                    <FileCode className="w-10 h-10 text-gold flex-shrink-0" />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-champagne text-sm font-medium truncate">
                      {uploadedFile?.name}
                    </p>
                    <p className="text-pewter text-xs">
                      {uploadedFile ? `${(uploadedFile.size / 1024).toFixed(2)} KB` : ''}
                    </p>
                  </div>
                </div>

                {/* Progress section */}
                {!isProcessing ? (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-pewter">Upload Progress</span>
                      <span className="text-gold font-medium">{uploadProgress}%</span>
                    </div>
                    <Progress
                      value={uploadProgress}
                      className="h-3 bg-obsidian border border-gold/30"
                    />
                    <p className="text-pewter text-xs text-center">
                      Uploading to server...
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4 text-center">
                    <Loader2 className="w-12 h-12 text-gold animate-spin mx-auto" />
                    <p className="text-pewter text-sm">
                      Processing your file and preparing for deployment
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Choice Step */}
        {currentStep === 'choice' && (
          <Card className="relative overflow-hidden">
            <CardCornerDecorations />
            <CardHeader className="text-center border-b border-gold/20">
              <div className="flex items-center justify-center gap-2 mb-4">
                <Check className="w-5 h-5 text-gold" />
                <span className="text-sm text-gold uppercase tracking-widest">File Uploaded</span>
              </div>
              <CardTitle className="text-3xl">Choose Your Path</CardTitle>
              <CardDescription className="text-base">
                Would you like to make changes to this site in the future?
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Unmanaged option */}
                <button
                  onClick={() => handleChoice(false)}
                  className="group relative p-6 bg-obsidian border border-gold/30 hover:border-gold transition-all duration-300 text-left"
                >
                  <div className="absolute top-2 right-2 w-4 h-4 border-t-2 border-r-2 border-gold/40 group-hover:border-gold transition-colors" aria-hidden="true" />
                  <div className="absolute bottom-2 left-2 w-4 h-4 border-b-2 border-l-2 border-gold/40 group-hover:border-gold transition-colors" aria-hidden="true" />

                  <Globe className="w-10 h-10 text-gold mb-4" />
                  <h3 className="font-display text-xl text-gold uppercase tracking-widest mb-2">
                    Unmanaged
                  </h3>
                  <p className="text-pewter text-sm leading-relaxed mb-4">
                    Deploy once and let it live. No account needed, no dashboard access.
                    Perfect for one-time deployments.
                  </p>
                  <div className="flex items-center gap-2 text-gold text-sm">
                    <span>Deploy Now</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </button>

                {/* Managed option */}
                <button
                  onClick={() => handleChoice(true)}
                  className="group relative p-6 bg-charcoal border border-gold hover:shadow-gold transition-all duration-300 text-left"
                >
                  <div className="absolute top-2 right-2 w-4 h-4 border-t-2 border-r-2 border-gold group-hover:opacity-100 transition-opacity" aria-hidden="true" />
                  <div className="absolute bottom-2 left-2 w-4 h-4 border-b-2 border-l-2 border-gold group-hover:opacity-100 transition-opacity" aria-hidden="true" />

                  <div className="absolute -top-3 right-4 px-3 py-1 bg-gold text-obsidian text-xs uppercase tracking-widest">
                    Recommended
                  </div>

                  <User className="w-10 h-10 text-gold mb-4" />
                  <h3 className="font-display text-xl text-gold uppercase tracking-widest mb-2">
                    Managed
                  </h3>
                  <p className="text-pewter text-sm leading-relaxed mb-4">
                    Create an account to edit and update your site anytime.
                    Full dashboard access with code editor.
                  </p>
                  <div className="flex items-center gap-2 text-gold text-sm">
                    <span>Register & Deploy</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </button>
              </div>

              <div className="mt-8">
                <Button variant="ghost" onClick={handleBack} className="gap-2">
                  <ArrowLeft className="w-4 h-4" />
                  Back to Upload
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Slug Selection Step */}
        {currentStep === 'slug' && (
          <Card className="relative overflow-hidden">
            <CardCornerDecorations />
            <CardHeader className="text-center border-b border-gold/20">
              <CardTitle className="text-3xl">Choose Your URL</CardTitle>
              <CardDescription className="text-base">
                Select a unique slug for your site. Only URL-friendly characters allowed.
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-8">
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="slug">Site Slug</Label>
                  <div className="flex items-center gap-2">
                    <span className="text-pewter text-sm whitespace-nowrap">siteplod.vercel.app/s/</span>
                    <div className="relative flex-1">
                      <Input
                        id="slug"
                        value={slug}
                        onChange={(e) => checkSlugAvailability(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                        placeholder="my-awesome-site"
                        disabled={isCheckingSlug}
                        className={cn(
                          'pr-10',
                          isCheckingSlug && 'opacity-70',
                          slugError && 'border-red-500',
                          !slugError && slugAvailable && 'border-green-500'
                        )}
                      />
                      {isCheckingSlug && (
                        <div className="absolute right-3 top-1/2 -translate-y-1/2">
                          <Loader2 className="w-4 h-4 text-gold animate-spin" />
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Availability indicator */}
                {slug.length > 0 && !isCheckingSlug && (
                  <div className={cn(
                    'p-4 border transition-all duration-300',
                    slugError
                      ? 'border-red-500/30 bg-red-500/5'
                      : slugAvailable
                        ? 'border-green-500/30 bg-green-500/5'
                        : 'border-red-500/30 bg-red-500/5'
                  )}>
                    <div className="flex items-center gap-2">
                      {slugError ? (
                        <>
                          <span className="text-red-400 text-sm">{slugError}</span>
                        </>
                      ) : slugAvailable ? (
                        <>
                          <Check className="w-5 h-5 text-green-500" />
                          <span className="text-green-400 text-sm">Slug is available!</span>
                        </>
                      ) : (
                        <>
                          <span className="text-red-400 text-sm">Slug is not available</span>
                        </>
                      )}
                    </div>
                  </div>
                )}

                {/* Preview */}
                <div className="p-6 bg-obsidian border border-gold/20 text-center">
                  <p className="text-pewter text-sm mb-2">Your site will be live at:</p>
                  <p className="font-mono text-gold text-lg">
                    siteplod.vercel.app/s/{slug || 'your-slug'}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-4">
                  <Button variant="ghost" onClick={handleBack} className="gap-2">
                    <ArrowLeft className="w-4 h-4" />
                    Back
                  </Button>
                  <Button
                    variant="solid"
                    onClick={handleDeploy}
                    disabled={!slugAvailable || !!slugError}
                    className="gap-2"
                  >
                    Deploy Site
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Deploying Step */}
        {currentStep === 'deploying' && (
          <Card className="relative overflow-hidden">
            <CardCornerDecorations />
            <CardHeader className="text-center border-b border-gold/20">
              <CardTitle className="text-3xl">Deploying Your Site</CardTitle>
              <CardDescription className="text-base">
                Setting up your site on our servers
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-8 pb-12">
              <div className="max-w-md mx-auto space-y-8">
                {/* Animated spinner */}
                <div className="flex justify-center">
                  <div className="relative w-24 h-24">
                    {/* Outer rotating border */}
                    <div className="absolute inset-0 border-4 border-gold/20 animate-spin" style={{ animationDuration: '3s' }} />
                    {/* Inner rotating border */}
                    <div className="absolute inset-2 border-4 border-t-gold border-r-gold border-b-transparent border-l-transparent animate-spin" style={{ animationDuration: '1.5s' }} />
                    {/* Center icon */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Globe className="w-10 h-10 text-gold animate-pulse" />
                    </div>
                  </div>
                </div>

                {/* Status text */}
                <div className="text-center space-y-2">
                  <p className="text-champagne text-lg font-medium">
                    {deploymentStatus}
                  </p>
                  <p className="text-pewter text-sm">
                    This usually takes just a few seconds
                  </p>
                </div>

                {/* Progress bar */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-pewter">Deployment Progress</span>
                    <span className="text-gold font-medium">{deploymentProgress}%</span>
                  </div>
                  <Progress
                    value={deploymentProgress}
                    className="h-3 bg-obsidian border border-gold/30"
                  />
                </div>

                {/* Deployment stages indicator */}
                <div className="grid grid-cols-5 gap-2">
                  {[
                    { label: 'Validate', threshold: 20 },
                    { label: 'Structure', threshold: 40 },
                    { label: 'Upload', threshold: 60 },
                    { label: 'Configure', threshold: 80 },
                    { label: 'Finalize', threshold: 100 }
                  ].map((stage, index) => (
                    <div key={index} className="text-center">
                      <div
                        className={cn(
                          'w-full h-2 mb-1 transition-all duration-300',
                          deploymentProgress >= stage.threshold
                            ? 'bg-gold'
                            : 'bg-gold/20'
                        )}
                      />
                      <p className={cn(
                        'text-xs transition-colors duration-300',
                        deploymentProgress >= stage.threshold
                          ? 'text-gold'
                          : 'text-pewter'
                      )}>
                        {stage.label}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Success Step */}
        {currentStep === 'success' && (
          <Card className="relative overflow-hidden border-gold shadow-glow">
            <CardCornerDecorations />
            <CardContent className="pt-16 pb-16 text-center">
              <div className="w-20 h-20 bg-gold rotate-45 mx-auto mb-8 flex items-center justify-center">
                <Check className="w-10 h-10 text-obsidian -rotate-45" />
              </div>
              <h2 className="font-display text-3xl text-gold uppercase tracking-widest mb-4">
                Site Deployed!
              </h2>
              <p className="text-pewter text-lg mb-8">
                Your site is now live and accessible to the world.
              </p>

              <div className="p-4 bg-obsidian border border-gold/30 max-w-md mx-auto mb-8">
                <p className="text-pewter text-sm mb-1">Your live URL:</p>
                <a
                  href={`https://siteplod.vercel.app/s/${slug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-mono text-gold text-lg hover:underline"
                >
                  siteplod.vercel.app/s/{slug}
                </a>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Button
                  variant="solid"
                  onClick={() => window.open(`https://siteplod.vercel.app/s/${slug}`, '_blank')}
                  className="gap-2"
                >
                  <Globe className="w-4 h-4" />
                  View Site
                </Button>
                <Button
                  variant="default"
                  onClick={() => {
                    setCurrentStep('upload')
                    setUploadedFile(null)
                    setIsManaged(null)
                    setSlug('')
                    setSlugAvailable(null)
                  }}
                  className="gap-2"
                >
                  Deploy Another
                </Button>
                {isManaged && (
                  <Button variant="outline" onClick={() => onNavigate?.('dashboard')}>
                    Go to Dashboard
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Missing Images Dialog */}
      <MissingImagesDialog
        open={showMissingImagesDialog}
        onClose={() => {
          setShowMissingImagesDialog(false)
          setCurrentStep('upload')
        }}
        missingImages={missingImages}
        onImagesUploaded={handleImagesUploaded}
      />
    </div>
  )
}
