'use client'

import { useState, useEffect } from 'react'
import { Terminal, Bell, ArrowRight, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Section, SectionTitle } from '@/components/siteplod/page-wrapper'
import { apiClient } from '@/lib/api-client'
import { toast } from 'sonner'

export function CLIAnnouncement() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isSubscribed, setIsSubscribed] = useState(false)

  useEffect(() => {
    // Check if user is already logged in on mount
    const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null
    if (token) {
      setIsLoggedIn(true)
      checkSubscriptionStatus()
    }

    // Listen for auth state changes
    const handleAuthChange = () => {
      const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null
      setIsLoggedIn(!!token)
      if (token) checkSubscriptionStatus()
      else setIsSubscribed(false)
    }

    window.addEventListener('auth-state-changed', handleAuthChange)
    return () => window.removeEventListener('auth-state-changed', handleAuthChange)
  }, [])

  const checkSubscriptionStatus = async () => {
    try {
      const profile = await apiClient.getProfile()
      if (profile.notification?.includes('CLI_ANNOUNCEMENT') || profile.cli_announced) {
        setIsSubscribed(true)
      }
    } catch (error) {
      console.error('Failed to fetch profile', error)
    }
  }

  const handleGetNotified = async () => {
    if (!isLoggedIn) {
      document.querySelector<HTMLElement>('[data-login-button]')?.click()
      return
    }

    if (isSubscribed) {
      toast.info('Already subscribed!', {
        description: 'You are on the list for the CLI release.'
      })
      return
    }

    setIsLoading(true)
    try {
      const resp = await apiClient.subscribeCliNotification()
      setIsSubscribed(true)

      if (resp.alreadySubscribed) {
        toast.info('Already subscribed!', {
          description: 'You are already on the list for the CLI release.'
        })
      } else {
        toast.success('Subscribed!', {
          description: 'You will be notified when the CLI is released.'
        })
      }
    } catch (error: any) {
      toast.error('Subscription failed', {
        description: error.message || 'Please try again later'
      })
    } finally {
      setIsLoading(false)
    }
  }
  return (
    <Section id="cli" variant="alternate">
      <div className="max-w-4xl mx-auto">
        {/* Main announcement card */}
        <div className="relative bg-charcoal border border-gold/30 p-8 md:p-12 overflow-hidden">
          {/* Decorative corners */}
          <div className="absolute top-4 right-4 w-8 h-8 border-t-2 border-r-2 border-gold/40" aria-hidden="true" />
          <div className="absolute bottom-4 left-4 w-8 h-8 border-b-2 border-l-2 border-gold/40" aria-hidden="true" />

          {/* Sunburst effect */}
          <div className="absolute inset-0 sunburst opacity-30" aria-hidden="true" />

          <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
            {/* Terminal icon */}
            <div className="flex-shrink-0">
              <div className="w-24 h-24 bg-obsidian border-2 border-gold/50 flex items-center justify-center relative">
                <div className="absolute inset-0 flex items-center justify-center">
                  <Terminal className="w-12 h-12 text-gold" />
                </div>
                {/* Animated border */}
                <div className="absolute inset-0 border-2 border-gold/30 animate-pulse" aria-hidden="true" />
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 text-center md:text-left">
              <div className="flex items-center justify-center md:justify-start gap-2 mb-4">
                <Bell className="w-4 h-4 text-gold" />
                <span className="text-xs uppercase tracking-widest text-gold">
                  Coming Soon
                </span>
              </div>

              <h2 className="font-display text-3xl md:text-4xl text-gold uppercase tracking-widest mb-4">
                CLI Support
              </h2>

              <p className="text-pewter text-lg leading-relaxed mb-6">
                Deploy directly from your terminal. Integrate SitePlod into your CI/CD pipeline
                and automate your deployment workflow. One command is all it takes.
              </p>

              {/* Code preview */}
              <div className="bg-obsidian border border-gold/20 p-4 font-mono text-sm mb-6 overflow-x-auto">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-3 h-3 rounded-full bg-red-500/50" aria-hidden="true" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500/50" aria-hidden="true" />
                  <div className="w-3 h-3 rounded-full bg-green-500/50" aria-hidden="true" />
                </div>
                <code className="text-champagne">
                  <span className="text-pewter">$</span>{' '}
                  <span className="text-gold">npx</span> siteplod deploy ./dist
                  <br />
                  <span className="text-green-400">✓</span> Deployed to:{' '}
                  <span className="text-gold">siteplod.vercel.app/s/my-project</span>
                </code>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-center md:justify-start gap-4">
                <Button variant="solid" className="group" onClick={handleGetNotified} disabled={isLoading || isSubscribed}>
                  {isLoading ? (
                    <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Subscribing...</>
                  ) : isSubscribed ? (
                    'Already Notified / Subscribed!'
                  ) : (
                    <>
                      Get Notified
                      <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Feature highlights */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
          {[
            { title: 'One Command', desc: 'Deploy your entire site with a single command' },
            { title: 'CI/CD Ready', desc: 'Integrate with GitHub Actions, GitLab CI, and more' },
            { title: 'Instant Updates', desc: 'Push updates to your live site in seconds' }
          ].map((feature, index) => (
            <div key={index} className="bg-obsidian border border-gold/20 p-6 text-center">
              <h3 className="font-display text-lg text-gold uppercase tracking-widest mb-2">
                {feature.title}
              </h3>
              <p className="text-pewter text-sm">
                {feature.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </Section>
  )
}
