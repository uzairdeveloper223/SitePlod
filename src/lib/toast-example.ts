// Example usage of Sonner toast with Art Deco styling
// This file demonstrates how to use the configured toast notifications

import { toast } from 'sonner'

// Success toast example
export function showSuccessToast() {
  toast.success('Site deployed successfully!', {
    description: 'Your site is now live at siteplod.com/s/my-site'
  })
}

// Error toast example
export function showErrorToast() {
  toast.error('Upload failed', {
    description: 'File size exceeds 50MB limit'
  })
}

// Info toast example
export function showInfoToast() {
  toast.info('Processing your request', {
    description: 'This may take a few moments'
  })
}

// Loading toast example
export function showLoadingToast() {
  const toastId = toast.loading('Deploying site...')
  
  // Later, update the loading toast to success
  setTimeout(() => {
    toast.success('Deployed!', { id: toastId })
  }, 3000)
  
  return toastId
}

// Custom toast with action
export function showToastWithAction() {
  toast('Site ready for review', {
    description: 'Click to view your site',
    action: {
      label: 'View Site',
      onClick: () => console.log('Navigating to site...')
    }
  })
}
