'use client'

import { useState, useEffect } from 'react'
import { 
  Globe, 
  Clock, 
  MoreVertical,
  Plus,
  ExternalLink,
  Edit,
  Copy,
  Check,
  Eye,
  FileCode,
  Trash2,
  Save,
  X,
  Folder,
  File,
  ChevronRight,
  ChevronDown,
  Loader2
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent, CardFooter, CardCornerDecorations } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Input } from '@/components/ui/input'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import { apiClient } from '@/lib/api-client'
import { handleApiError } from '@/lib/error-handler'
import type { Site, SiteFile } from '@/lib/api-types'

// Skeleton card component for loading state
function SiteCardSkeleton() {
  return (
    <Card className="group relative">
      <CardCornerDecorations />
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <Skeleton className="w-10 h-10" />
            <div className="space-y-2">
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-3 w-40" />
            </div>
          </div>
          <Skeleton className="w-5 h-5" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-4">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-24" />
        </div>
        <div className="mt-4">
          <Skeleton className="h-6 w-16" />
        </div>
      </CardContent>
      <CardFooter className="gap-2">
        <Skeleton className="h-9 flex-1" />
        <Skeleton className="h-9 w-9" />
        <Skeleton className="h-9 w-9" />
      </CardFooter>
    </Card>
  )
}

interface DashboardProps {
  onNavigate?: (page: 'home' | 'upload' | 'dashboard') => void
  isLoading?: boolean
}

export function Dashboard({ onNavigate, isLoading: initialLoading = false }: DashboardProps) {
  const [sites, setSites] = useState<Site[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedSite, setSelectedSite] = useState<Site | null>(null)
  const [showEditor, setShowEditor] = useState(false)
  const [copiedSlug, setCopiedSlug] = useState<string | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [siteToDelete, setSiteToDelete] = useState<Site | null>(null)
  
  // Editor state
  const [selectedFile, setSelectedFile] = useState<string | null>(null)
  const [fileContent, setFileContent] = useState<string>('')
  const [originalContent, setOriginalContent] = useState<string>('')
  const [loadingFile, setLoadingFile] = useState(false)
  const [savingFile, setSavingFile] = useState(false)
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  const [editedSiteName, setEditedSiteName] = useState('')
  const [savingSiteName, setSavingSiteName] = useState(false)
  
  useEffect(() => {
    loadSites()
  }, [])
  
  const loadSites = async () => {
    try {
      setLoading(true)
      
      // Check if user is authenticated
      const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null
      if (!token) {
        // User not logged in, show empty state
        setSites([])
        setLoading(false)
        return
      }
      
      const fetchedSites = await apiClient.getSites()
      setSites(fetchedSites)
    } catch (error) {
      console.error('Failed to load sites:', error)
      const errorMessage = handleApiError(error)
      
      // If unauthorized, clear token and show empty state
      if ((error as any).statusCode === 401) {
        if (typeof window !== 'undefined') {
          localStorage.removeItem('auth_token')
        }
        setSites([])
      } else {
        toast.error('Failed to load sites', {
          description: errorMessage
        })
      }
    } finally {
      setLoading(false)
    }
  }
  
  const getTotalViews = () => {
    return sites.reduce((sum, site) => sum + site.views, 0)
  }
  
  const getLastUpdated = () => {
    if (sites.length === 0) return 'Never'
    const mostRecent = sites.reduce((latest, site) => {
      return new Date(site.updatedAt) > new Date(latest.updatedAt) ? site : latest
    })
    const daysSince = Math.floor((Date.now() - new Date(mostRecent.updatedAt).getTime()) / (1000 * 60 * 60 * 24))
    if (daysSince === 0) return 'Today'
    if (daysSince === 1) return '1 day ago'
    return `${daysSince} days ago`
  }
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const daysDiff = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24))
    
    if (daysDiff === 0) return 'Today'
    if (daysDiff === 1) return 'Yesterday'
    if (daysDiff < 7) return `${daysDiff} days ago`
    if (daysDiff < 30) return `${Math.floor(daysDiff / 7)} weeks ago`
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  }

  const handleCopySlug = (slug: string) => {
    navigator.clipboard.writeText(`siteplod.com/s/${slug}`)
    setCopiedSlug(slug)
    setTimeout(() => setCopiedSlug(null), 2000)
    
    toast.success('Link copied!', {
      description: 'Site URL copied to clipboard'
    })
  }
  
  const handleDeleteClick = (site: Site) => {
    setSiteToDelete(site)
    setDeleteDialogOpen(true)
  }
  
  const handleDeleteConfirm = async () => {
    if (!siteToDelete) return
    
    try {
      await apiClient.deleteSite(siteToDelete.id)
      
      toast.success('Site deleted', {
        description: `${siteToDelete.name} has been permanently deleted`
      })
      
      setDeleteDialogOpen(false)
      setSiteToDelete(null)
      
      // Remove site from local state
      setSites(sites.filter(s => s.id !== siteToDelete.id))
    } catch (error) {
      console.error('Failed to delete site:', error)
      const errorMessage = handleApiError(error)
      toast.error('Failed to delete site', {
        description: errorMessage
      })
    }
  }
  
  const handleEditSite = async (site: Site) => {
    try {
      setLoadingFile(true)
      // Fetch full site data with files
      const siteWithFiles = await apiClient.getSite(site.id)
      setSelectedSite(siteWithFiles)
      setEditedSiteName(siteWithFiles.name)
      setShowEditor(true)
      
      // Auto-select first HTML file or index.html
      const files = siteWithFiles.files || []
      const indexFile = files.find(f => f.path === 'index.html') || files.find(f => f.mime_type.includes('html')) || files[0]
      
      if (indexFile) {
        await loadFileContent(siteWithFiles.id, indexFile.path)
      }
    } catch (error) {
      console.error('Failed to load site:', error)
      const errorMessage = handleApiError(error)
      toast.error('Failed to load site', {
        description: errorMessage
      })
    } finally {
      setLoadingFile(false)
    }
  }
  
  const loadFileContent = async (siteId: string, filePath: string) => {
    try {
      setLoadingFile(true)
      setSelectedFile(filePath)
      
      const fileData = await apiClient.getFileContent(siteId, filePath)
      const content = fileData.content || ''
      
      setFileContent(content)
      setOriginalContent(content)
      setHasUnsavedChanges(false)
    } catch (error) {
      console.error('Failed to load file:', error)
      const errorMessage = handleApiError(error)
      toast.error('Failed to load file', {
        description: errorMessage
      })
    } finally {
      setLoadingFile(false)
    }
  }
  
  const handleSaveFile = async () => {
    if (!selectedSite || !selectedFile) return
    
    try {
      setSavingFile(true)
      
      await apiClient.updateFileContent(selectedSite.id, selectedFile, {
        content: fileContent
      })
      
      setOriginalContent(fileContent)
      setHasUnsavedChanges(false)
      
      toast.success('File saved', {
        description: 'Your changes have been published'
      })
    } catch (error) {
      console.error('Failed to save file:', error)
      const errorMessage = handleApiError(error)
      toast.error('Failed to save file', {
        description: errorMessage
      })
    } finally {
      setSavingFile(false)
    }
  }
  
  const handleSaveSiteName = async () => {
    if (!selectedSite || editedSiteName === selectedSite.name) return
    
    try {
      setSavingSiteName(true)
      
      const updatedSite = await apiClient.updateSite(selectedSite.id, {
        name: editedSiteName
      })
      
      setSelectedSite({ ...selectedSite, ...updatedSite })
      setSites(sites.map(s => s.id === updatedSite.id ? updatedSite : s))
      
      toast.success('Site name updated', {
        description: 'Your site name has been changed'
      })
    } catch (error) {
      console.error('Failed to update site name:', error)
      const errorMessage = handleApiError(error)
      toast.error('Failed to update site name', {
        description: errorMessage
      })
    } finally {
      setSavingSiteName(false)
    }
  }
  
  const handleContentChange = (newContent: string) => {
    setFileContent(newContent)
    setHasUnsavedChanges(newContent !== originalContent)
  }
  
  const handleCloseEditor = () => {
    if (hasUnsavedChanges) {
      if (!confirm('You have unsaved changes. Are you sure you want to close?')) {
        return
      }
    }
    setShowEditor(false)
    setSelectedSite(null)
    setSelectedFile(null)
    setFileContent('')
    setOriginalContent('')
    setHasUnsavedChanges(false)
  }
  
  const getFileIcon = (path: string) => {
    if (path.endsWith('/')) return Folder
    return File
  }
  
  const getFileExtension = (path: string) => {
    const parts = path.split('.')
    return parts.length > 1 ? parts[parts.length - 1] : ''
  }

  return (
    <div className="min-h-screen pt-24 pb-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 mb-12">
          <div>
            <h1 className="font-display text-4xl text-gold uppercase tracking-widest mb-2">
              Dashboard
            </h1>
            <p className="text-pewter">
              Manage your deployed sites and make updates anytime.
            </p>
          </div>
          <Button
            variant="solid"
            onClick={() => onNavigate?.('upload')}
            className="gap-2"
          >
            <Plus className="w-5 h-5" />
            Deploy New Site
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {loading ? (
            // Skeleton loaders for stats
            <>
              {[1, 2, 3].map((index) => (
                <div key={index} className="bg-charcoal border border-gold/20 p-6 relative group">
                  <div className="absolute top-2 right-2 w-4 h-4 border-t-2 border-r-2 border-gold/30" aria-hidden="true" />
                  <div className="flex items-center gap-4">
                    <Skeleton className="w-12 h-12" />
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-7 w-16" />
                    </div>
                  </div>
                </div>
              ))}
            </>
          ) : (
            // Actual stats
            <>
              {[
                { label: 'Total Sites', value: sites.length, icon: Globe },
                { label: 'Total Views', value: getTotalViews().toLocaleString(), icon: Eye },
                { label: 'Last Updated', value: getLastUpdated(), icon: Clock }
              ].map((stat, index) => {
                const Icon = stat.icon
                return (
                  <div key={index} className="bg-charcoal border border-gold/20 p-6 relative group">
                    <div className="absolute top-2 right-2 w-4 h-4 border-t-2 border-r-2 border-gold/30" aria-hidden="true" />
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-obsidian border border-gold/30 flex items-center justify-center">
                        <Icon className="w-6 h-6 text-gold" />
                      </div>
                      <div>
                        <p className="text-pewter text-sm uppercase tracking-wide">{stat.label}</p>
                        <p className="font-display text-2xl text-gold">{stat.value}</p>
                      </div>
                    </div>
                  </div>
                )
              })}
            </>
          )}
        </div>

        {/* Sites Grid */}
        <div className="mb-8">
          <h2 className="font-display text-2xl text-gold uppercase tracking-widest mb-6">
            Your Sites
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading ? (
            // Skeleton loaders for site cards
            <>
              {[1, 2, 3].map((index) => (
                <SiteCardSkeleton key={index} />
              ))}
            </>
          ) : sites.length === 0 ? (
            // Empty state
            <div className="col-span-full">
              <Card className="relative">
                <CardCornerDecorations />
                <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                  <div className="w-20 h-20 bg-obsidian border border-gold/30 flex items-center justify-center mb-6">
                    <Globe className="w-10 h-10 text-gold" />
                  </div>
                  <h3 className="font-display text-2xl text-gold uppercase tracking-widest mb-2">
                    No Sites Yet
                  </h3>
                  <p className="text-pewter mb-6 max-w-md">
                    {typeof window !== 'undefined' && !localStorage.getItem('auth_token')
                      ? 'Please log in to view your sites or deploy your first site.'
                      : 'Deploy your first static site to get started. It only takes a minute!'}
                  </p>
                  <Button
                    variant="solid"
                    onClick={() => onNavigate?.('upload')}
                    className="gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    Deploy Your First Site
                  </Button>
                </CardContent>
              </Card>
            </div>
          ) : (
            // Actual site cards
            <>
              {sites.map((site) => (
                <Card key={site.id} className="group relative">
                  <CardCornerDecorations />
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-obsidian border border-gold/30 flex items-center justify-center">
                          <Globe className="w-5 h-5 text-gold" />
                        </div>
                        <div>
                          <CardTitle className="text-lg">{site.name}</CardTitle>
                          <p className="text-pewter text-xs">siteplod.com/s/{site.slug}</p>
                        </div>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button className="text-pewter hover:text-gold transition-colors">
                            <MoreVertical className="w-5 h-5" />
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                          <DropdownMenuItem
                            onClick={() => handleEditSite(site)}
                            className="gap-2"
                          >
                            <Edit className="w-4 h-4" />
                            Edit Site
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleCopySlug(site.slug)}
                            className="gap-2"
                          >
                            <Copy className="w-4 h-4" />
                            Copy URL
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => window.open(`https://siteplod.com/s/${site.slug}`, '_blank')}
                            className="gap-2"
                          >
                            <ExternalLink className="w-4 h-4" />
                            View Live
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleDeleteClick(site)}
                            className="gap-2 text-red-400 focus:text-red-400"
                          >
                            <Trash2 className="w-4 h-4" />
                            Delete Site
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-4 text-sm">
                      <div className="flex items-center gap-1 text-pewter">
                        <Eye className="w-4 h-4" />
                        {site.views.toLocaleString()} views
                      </div>
                      <div className="flex items-center gap-1 text-pewter">
                        <Clock className="w-4 h-4" />
                        {formatDate(site.updatedAt)}
                      </div>
                    </div>
                    <div className="mt-4 flex items-center gap-2">
                      <span className={cn(
                        "px-2 py-1 text-xs uppercase tracking-wide",
                        site.status === 'live' && "bg-green-500/10 border border-green-500/30 text-green-400",
                        site.status === 'draft' && "bg-yellow-500/10 border border-yellow-500/30 text-yellow-400",
                        site.status === 'archived' && "bg-gray-500/10 border border-gray-500/30 text-gray-400"
                      )}>
                        {site.status}
                      </span>
                    </div>
                  </CardContent>
                  <CardFooter className="gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 gap-2"
                      onClick={() => handleEditSite(site)}
                    >
                      <Edit className="w-4 h-4" />
                      Edit
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="gap-2"
                      onClick={() => handleCopySlug(site.slug)}
                    >
                      {copiedSlug === site.slug ? (
                        <Check className="w-4 h-4 text-green-500" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="gap-2"
                      onClick={() => window.open(`https://siteplod.com/s/${site.slug}`, '_blank')}
                    >
                      <ExternalLink className="w-4 h-4" />
                    </Button>
                  </CardFooter>
                </Card>
              ))}

              {/* Add new site card */}
              <button
                onClick={() => onNavigate?.('upload')}
                className="flex flex-col items-center justify-center gap-4 p-8 border-2 border-dashed border-gold/30 hover:border-gold transition-colors min-h-[280px]"
              >
                <div className="w-16 h-16 bg-obsidian border border-gold/30 flex items-center justify-center">
                  <Plus className="w-8 h-8 text-gold" />
                </div>
                <span className="font-display text-lg text-gold uppercase tracking-widest">
                  Deploy New Site
                </span>
              </button>
            </>
          )}
        </div>

        {/* Code Editor Modal */}
        {showEditor && selectedSite && (
          <div className="fixed inset-0 z-50 bg-obsidian/98 backdrop-blur-sm flex flex-col">
            {/* Editor Header */}
            <div className="flex items-center justify-between p-4 border-b border-gold/20 bg-charcoal/95 backdrop-blur-sm">
              <div className="flex items-center gap-4">
                <div className="w-8 h-8 bg-obsidian border border-gold/30 flex items-center justify-center">
                  <FileCode className="w-4 h-4 text-gold" />
                </div>
                <div className="flex items-center gap-3">
                  <Input
                    value={editedSiteName}
                    onChange={(e) => setEditedSiteName(e.target.value)}
                    className="font-display text-lg text-gold uppercase tracking-widest bg-obsidian border-gold/30 w-64"
                    onBlur={handleSaveSiteName}
                    disabled={savingSiteName}
                  />
                  {savingSiteName && <Loader2 className="w-4 h-4 text-gold animate-spin" />}
                  <p className="text-pewter text-xs">siteplod.com/s/{selectedSite.slug}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                {hasUnsavedChanges && (
                  <span className="text-xs text-yellow-400 flex items-center gap-1">
                    <span className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse" />
                    Unsaved changes
                  </span>
                )}
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="gap-2"
                  onClick={() => window.open(`/s/${selectedSite.slug}`, '_blank')}
                >
                  <Eye className="w-4 h-4" />
                  Preview
                </Button>
                <Button 
                  variant="solid" 
                  size="sm" 
                  className="gap-2"
                  onClick={handleSaveFile}
                  disabled={!hasUnsavedChanges || savingFile || !selectedFile}
                >
                  {savingFile ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      Save Changes
                    </>
                  )}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleCloseEditor}
                  className="gap-2"
                >
                  <X className="w-4 h-4" />
                  Close
                </Button>
              </div>
            </div>

            {/* Editor Body */}
            <div className="flex-1 flex overflow-hidden">
              {/* File Tree */}
              <div className="w-72 border-r border-gold/20 bg-charcoal/50 backdrop-blur-sm overflow-y-auto">
                <div className="p-4">
                  <h4 className="font-display text-sm text-gold uppercase tracking-widest mb-4 flex items-center gap-2">
                    <Folder className="w-4 h-4" />
                    Files ({selectedSite.files?.length || 0})
                  </h4>
                  <div className="space-y-1">
                    {selectedSite.files && selectedSite.files.length > 0 ? (
                      selectedSite.files.map((file) => {
                        const Icon = getFileIcon(file.path)
                        const isSelected = selectedFile === file.path
                        const ext = getFileExtension(file.path)
                        
                        return (
                          <button
                            key={file.id}
                            onClick={() => loadFileContent(selectedSite.id, file.path)}
                            disabled={loadingFile}
                            className={cn(
                              'w-full flex items-center gap-2 p-2.5 text-left text-sm transition-all rounded',
                              isSelected
                                ? 'bg-gold/20 text-gold border-l-2 border-gold shadow-sm'
                                : 'text-pewter hover:text-champagne hover:bg-charcoal/70 border-l-2 border-transparent'
                            )}
                          >
                            <Icon className="w-4 h-4 flex-shrink-0" />
                            <span className="flex-1 truncate">{file.path}</span>
                            {ext && (
                              <span className="text-xs text-pewter/60 uppercase">{ext}</span>
                            )}
                          </button>
                        )
                      })
                    ) : (
                      <div className="text-pewter text-sm text-center py-8">
                        No files found
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Code Editor */}
              <div className="flex-1 flex flex-col bg-obsidian/95 backdrop-blur-sm overflow-hidden">
                {loadingFile ? (
                  <div className="flex-1 flex items-center justify-center">
                    <div className="text-center">
                      <Loader2 className="w-8 h-8 text-gold animate-spin mx-auto mb-4" />
                      <p className="text-pewter">Loading file...</p>
                    </div>
                  </div>
                ) : selectedFile ? (
                  <>
                    {/* Editor Toolbar */}
                    <div className="flex items-center justify-between px-4 py-2 border-b border-gold/10 bg-charcoal/30">
                      <div className="flex items-center gap-2 text-sm">
                        <File className="w-4 h-4 text-gold" />
                        <span className="text-champagne font-mono">{selectedFile}</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-pewter">
                        <span>{fileContent.split('\n').length} lines</span>
                        <span>•</span>
                        <span>{new Blob([fileContent]).size} bytes</span>
                      </div>
                    </div>
                    
                    {/* Editor Content */}
                    <div className="flex-1 overflow-auto p-4">
                      <div className="font-mono text-sm leading-relaxed">
                        <div className="flex">
                          {/* Line Numbers */}
                          <div className="text-pewter/40 text-right pr-4 select-none border-r border-gold/10 mr-4 sticky left-0 bg-obsidian/95">
                            {fileContent.split('\n').map((_, i) => (
                              <div key={i} className="leading-6 h-6">{i + 1}</div>
                            ))}
                          </div>
                          
                          {/* Editable Content */}
                          <textarea
                            value={fileContent}
                            onChange={(e) => handleContentChange(e.target.value)}
                            className="flex-1 bg-transparent text-champagne outline-none resize-none font-mono leading-6 min-h-full"
                            style={{ 
                              tabSize: 2,
                              caretColor: '#D4AF37'
                            }}
                            spellCheck={false}
                          />
                        </div>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="flex-1 flex items-center justify-center">
                    <div className="text-center">
                      <FileCode className="w-16 h-16 text-gold/30 mx-auto mb-4" />
                      <p className="text-pewter">Select a file to edit</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Site?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete <span className="text-gold font-medium">{siteToDelete?.name}</span> and all its files.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Delete Site
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
