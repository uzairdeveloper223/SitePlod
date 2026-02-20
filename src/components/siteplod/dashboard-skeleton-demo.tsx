/**
 * Dashboard Skeleton Loader Demo
 * 
 * This file demonstrates how to use the skeleton loaders in the Dashboard component.
 * 
 * Usage:
 * 
 * 1. Loading state (shows skeleton loaders):
 *    <Dashboard isLoading={true} />
 * 
 * 2. Loaded state (shows actual data):
 *    <Dashboard isLoading={false} />
 * 
 * The skeleton loaders are displayed in two areas:
 * 
 * - Stats section: Shows 3 skeleton stat cards with icon placeholder and text placeholders
 * - Sites grid: Shows 3 skeleton site cards matching the structure of actual site cards
 * 
 * The skeleton cards use the Skeleton component from @/components/ui/skeleton
 * which provides a pulsing animation effect with the Art Deco styling.
 * 
 * Implementation details:
 * - SiteCardSkeleton component matches the exact layout of actual site cards
 * - Skeleton elements are sized to match the content they replace
 * - Loading state is controlled via the isLoading prop
 * - When fetching sites from the backend, set isLoading={true} until data arrives
 */

'use client'

import { useState, useEffect } from 'react'
import { Dashboard } from './dashboard'

export function DashboardSkeletonDemo() {
  const [isLoading, setIsLoading] = useState(true)

  // Simulate API call
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 2000) // Show skeleton for 2 seconds

    return () => clearTimeout(timer)
  }, [])

  return (
    <div>
      <Dashboard isLoading={isLoading} />
    </div>
  )
}
