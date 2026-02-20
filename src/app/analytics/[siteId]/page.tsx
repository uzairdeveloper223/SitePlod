'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import {
  Eye,
  Globe,
  TrendingUp,
  Calendar,
  ExternalLink,
  ArrowLeft,
  BarChart3
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardCornerDecorations } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from 'recharts'
import { apiClient } from '@/lib/api-client'
import { handleApiError } from '@/lib/error-handler'
import { toast } from 'sonner'
import type { AnalyticsData } from '@/lib/api-types'

export default function AnalyticsPage() {
  const params = useParams()
  const router = useRouter()
  const siteId = params.siteId as string

  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [viewPeriod, setViewPeriod] = useState<'daily' | 'weekly' | 'monthly'>('daily')

  useEffect(() => {
    loadAnalytics()
  }, [siteId])

  const loadAnalytics = async () => {
    try {
      setLoading(true)

      // Fetch analytics data from API
      const data = await apiClient.getAnalytics(siteId)
      setAnalytics(data)
    } catch (error) {
      console.error('Failed to load analytics:', error)
      const errorMessage = handleApiError(error)
      toast.error('Failed to load analytics', {
        description: errorMessage
      })
    } finally {
      setLoading(false)
    }
  }

  const getChartData = () => {
    if (!analytics) return []

    switch (viewPeriod) {
      case 'daily':
        return analytics.dailyViews.map(item => ({
          name: new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          views: item.views
        }))
      case 'weekly':
        return analytics.weeklyViews.map(item => ({
          name: item.week,
          views: item.views
        }))
      case 'monthly':
        return analytics.monthlyViews.map(item => ({
          name: item.month,
          views: item.views
        }))
      default:
        return []
    }
  }

  const chartConfig = {
    views: {
      label: 'Views',
      color: '#D4AF37', // gold
    },
  }

  // Loading State
  if (loading) {
    return (
      <div className="min-h-screen pt-32 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <Skeleton className="h-10 w-48 mb-8 bg-charcoal border border-gold/20" />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-32 bg-charcoal border border-gold/20" />
              ))}
            </div>
            <Skeleton className="h-96 bg-charcoal border border-gold/20" />
          </div>
        </div>
      </div>
    )
  }

  // Empty State
  if (!analytics || analytics.totalViews === 0) {
    return (
      <div className="min-h-screen pt-32 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Header with back button */}
          <div className="mb-12">
            <Button
              variant="ghost"
              onClick={() => router.back()}
              className="gap-2 mb-6"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Dashboard
            </Button>
            <h1 className="font-display text-4xl text-gold uppercase tracking-widest">
              Site Analytics
            </h1>
            {analytics && (
              <p className="text-pewter mt-2">
                {analytics.siteName} • siteplod.vercel.app/s/{analytics.slug}
              </p>
            )}
          </div>

          {/* Empty State */}
          <Card>
            <CardCornerDecorations />
            <CardContent className="p-16">
              <div className="flex flex-col items-center justify-center text-center">
                <div className="w-20 h-20 bg-obsidian border border-gold/30 flex items-center justify-center mb-6">
                  <Eye className="w-10 h-10 text-gold" />
                </div>
                <h3 className="font-display text-2xl text-gold uppercase tracking-widest mb-2">
                  No Analytics Yet
                </h3>
                <p className="text-pewter max-w-md mb-6">
                  Analytics data will appear here once your site receives visitors.
                  Share your site URL to start tracking views!
                </p>
                {analytics && (
                  <Button
                    variant="outline"
                    onClick={() => {
                      navigator.clipboard.writeText(`https://siteplod.vercel.app/s/${analytics.slug}`)
                      toast.success('Link copied!', {
                        description: 'Site URL copied to clipboard'
                      })
                    }}
                    className="gap-2"
                  >
                    <Globe className="w-4 h-4" />
                    Copy Site URL
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  // Main Analytics View
  return (
    <div className="min-h-screen pt-32 pb-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-12">
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="gap-2 mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Button>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="font-display text-4xl text-gold uppercase tracking-widest mb-2">
                Site Analytics
              </h1>
              <div className="flex items-center gap-3 text-pewter">
                <span className="text-champagne font-medium">{analytics.siteName}</span>
                <span>•</span>
                <span>siteplod.vercel.app/s/{analytics.slug}</span>
              </div>
            </div>
            <Button
              variant="outline"
              onClick={() => window.open(`https://siteplod.vercel.app/s/${analytics.slug}`, '_blank')}
              className="gap-2"
            >
              <ExternalLink className="w-4 h-4" />
              View Live Site
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {[
            {
              label: 'Total Views',
              value: analytics.totalViews.toLocaleString(),
              icon: Eye,
              description: 'All-time page views'
            },
            {
              label: 'Site URL',
              value: analytics.slug,
              icon: Globe,
              description: 'Public site identifier'
            },
            {
              label: 'Tracking',
              value: 'Active',
              icon: TrendingUp,
              description: 'Real-time analytics'
            }
          ].map((stat, index) => {
            const Icon = stat.icon
            return (
              <div key={index} className="bg-charcoal border border-gold/20 p-6 relative group hover:border-gold transition-colors">
                <div className="absolute top-2 right-2 w-4 h-4 border-t-2 border-r-2 border-gold/30 group-hover:border-gold transition-colors" aria-hidden="true" />
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-obsidian border border-gold/30 flex items-center justify-center flex-shrink-0">
                    <Icon className="w-6 h-6 text-gold" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-pewter text-sm uppercase tracking-wide">{stat.label}</p>
                    <p className="font-display text-2xl text-gold truncate">{stat.value}</p>
                    <p className="text-pewter text-xs mt-1">{stat.description}</p>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Chart Card */}
        <Card>
          <CardCornerDecorations />
          <CardHeader>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-6 h-6" />
                  View Trends
                </CardTitle>
                <CardDescription className="mt-2">
                  Track your site's visitor engagement over time
                </CardDescription>
              </div>
              <div className="flex gap-2">
                <Button
                  variant={viewPeriod === 'daily' ? 'solid' : 'outline'}
                  size="sm"
                  onClick={() => setViewPeriod('daily')}
                >
                  Daily
                </Button>
                <Button
                  variant={viewPeriod === 'weekly' ? 'solid' : 'outline'}
                  size="sm"
                  onClick={() => setViewPeriod('weekly')}
                >
                  Weekly
                </Button>
                <Button
                  variant={viewPeriod === 'monthly' ? 'solid' : 'outline'}
                  size="sm"
                  onClick={() => setViewPeriod('monthly')}
                >
                  Monthly
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <ChartContainer config={chartConfig} className="h-[400px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={getChartData()}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#D4AF37" opacity={0.1} />
                  <XAxis
                    dataKey="name"
                    stroke="#8B8680"
                    style={{ fontSize: '12px' }}
                  />
                  <YAxis
                    stroke="#8B8680"
                    style={{ fontSize: '12px' }}
                  />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Line
                    type="monotone"
                    dataKey="views"
                    stroke="#D4AF37"
                    strokeWidth={2}
                    dot={{ fill: '#D4AF37', r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Additional Info */}
        <div className="mt-8 p-4 bg-charcoal/50 border border-gold/20">
          <div className="flex items-start gap-3">
            <Calendar className="w-5 h-5 text-gold flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-champagne text-sm font-medium">Analytics Information</p>
              <p className="text-pewter text-sm mt-1">
                View counts are updated in real-time as visitors access your site.
                Data is aggregated by day, week, and month for trend analysis.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
