'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { toast } from 'sonner'
import { PageWrapper } from '@/components/siteplod/page-wrapper'
import { Header } from '@/components/siteplod/header'
import { Footer } from '@/components/siteplod/footer'
import { HeroSection } from '@/components/siteplod/hero-section'
import { FeaturesSection, QuickFeatures } from '@/components/siteplod/features-section'
import { HowItWorksSection } from '@/components/siteplod/how-it-works-section'
import { PricingSection } from '@/components/siteplod/pricing-section'
import { CLIAnnouncement } from '@/components/siteplod/cli-announcement'
import { UploadFlow } from '@/components/siteplod/upload-flow'
import { Dashboard } from '@/components/siteplod/dashboard'
import { Divider } from '@/components/siteplod/page-wrapper'

type PageType = 'home' | 'upload' | 'dashboard'

function HomeContent() {
  const [currentPage, setCurrentPage] = useState<PageType>('home')
  const searchParams = useSearchParams()

  useEffect(() => {
    // Check for verification success
    if (searchParams.get('verified') === 'true') {
      // Show success message
      toast.success('Email verified!', {
        description: 'Your email has been verified. Click the Login button to continue.',
        duration: 8000
      })

      // Clean up URL
      window.history.replaceState({}, '', '/')

      // Auto-open login dialog after a short delay
      setTimeout(() => {
        const loginButton = document.querySelector('[data-login-button]') as HTMLElement
        if (loginButton) {
          loginButton.click()
        }
      }, 1500)
    }

    // Check for verification errors
    const error = searchParams.get('error')
    if (error) {
      const errorMessages: Record<string, string> = {
        'invalid_verification_link': 'Invalid verification link. Please try again or request a new one.',
        'verification_failed': 'Email verification failed. Please try again.',
        'email_not_verified': 'Please verify your email before logging in.'
      }

      toast.error('Verification Error', {
        description: errorMessages[error] || 'An error occurred during verification.',
        duration: 5000
      })

      // Clean up URL
      window.history.replaceState({}, '', '/')
    }
  }, [searchParams])

  const handleNavigate = (page: PageType) => {
    setCurrentPage(page)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <PageWrapper>
      <Header currentPage={currentPage} onNavigate={handleNavigate} />

      {currentPage === 'home' && (
        <main>
          <HeroSection onNavigate={handleNavigate} />

          <Divider variant="ornate" className="max-w-4xl mx-auto" />

          <section className="py-16">
            <QuickFeatures />
          </section>

          <Divider className="max-w-4xl mx-auto" />

          <FeaturesSection />

          <HowItWorksSection onNavigate={handleNavigate} />

          <PricingSection onNavigate={handleNavigate} />

          <CLIAnnouncement />
        </main>
      )}

      {currentPage === 'upload' && (
        <main>
          <UploadFlow onNavigate={handleNavigate} />
        </main>
      )}

      {currentPage === 'dashboard' && (
        <main>
          <Dashboard onNavigate={handleNavigate} />
        </main>
      )}

      <Footer />
    </PageWrapper>
  )
}

export default function Home() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-black"><p className="text-[#D4AF37]">Loading...</p></div>}>
      <HomeContent />
    </Suspense>
  )
}
