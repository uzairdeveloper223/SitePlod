'use client'

import { useEffect, useState, ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface PageWrapperProps {
  children: ReactNode
  className?: string
}

export function PageWrapper({ children, className }: PageWrapperProps) {
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    // Small delay for smooth entrance animation
    const timer = setTimeout(() => setIsLoaded(true), 50)
    return () => clearTimeout(timer)
  }, [])

  return (
    <div
      className={cn(
        'min-h-screen transition-all duration-700',
        isLoaded ? 'opacity-100' : 'opacity-0',
        className
      )}
    >
      {children}
    </div>
  )
}

// Section wrapper with fade-in animation on scroll
interface SectionProps {
  children: ReactNode
  className?: string
  id?: string
  variant?: 'default' | 'alternate'
}

export function Section({ children, className, id, variant = 'default' }: SectionProps) {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
        }
      },
      { threshold: 0.1 }
    )

    const element = document.getElementById(id || '')
    if (element) {
      observer.observe(element)
    }

    return () => observer.disconnect()
  }, [id])

  return (
    <section
      id={id}
      className={cn(
        'relative py-24 md:py-32 transition-all duration-700',
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8',
        variant === 'alternate' && 'bg-charcoal/30',
        className
      )}
    >
      {/* Decorative vertical lines */}
      <div className="absolute left-0 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-gold/20 to-transparent" aria-hidden="true" />
      <div className="absolute right-0 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-gold/20 to-transparent" aria-hidden="true" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {children}
      </div>
    </section>
  )
}

// Section title with Art Deco dividers
interface SectionTitleProps {
  title: string
  subtitle?: string
  align?: 'center' | 'left'
  className?: string
}

export function SectionTitle({ title, subtitle, align = 'center', className }: SectionTitleProps) {
  return (
    <div className={cn('mb-16', align === 'center' && 'text-center', className)}>
      <div className={cn('flex items-center gap-6', align === 'center' && 'justify-center')}>
        <div className="h-px w-12 md:w-24 bg-gradient-to-r from-transparent to-gold/50" aria-hidden="true" />
        <h2 className="font-display text-3xl md:text-4xl lg:text-5xl text-gold uppercase tracking-widest">
          {title}
        </h2>
        <div className="h-px w-12 md:w-24 bg-gradient-to-l from-transparent to-gold/50" aria-hidden="true" />
      </div>
      {subtitle && (
        <p className="mt-6 text-lg text-pewter max-w-2xl mx-auto leading-relaxed">
          {subtitle}
        </p>
      )}
    </div>
  )
}

// Decorative divider
interface DividerProps {
  className?: string
  variant?: 'simple' | 'ornate'
}

export function Divider({ className, variant = 'simple' }: DividerProps) {
  if (variant === 'ornate') {
    return (
      <div className={cn('flex items-center justify-center gap-4 my-12', className)}>
        <div className="h-px flex-1 bg-gradient-to-r from-transparent to-gold/50" aria-hidden="true" />
        <div className="w-3 h-3 bg-gold rotate-45" aria-hidden="true" />
        <div className="h-px flex-1 bg-gradient-to-l from-transparent to-gold/50" aria-hidden="true" />
      </div>
    )
  }

  return (
    <div className={cn('h-px w-full bg-gradient-to-r from-transparent via-gold/30 to-transparent my-12', className)} aria-hidden="true" />
  )
}

// Roman numeral badge
interface RomanNumeralProps {
  numeral: string
  className?: string
}

export function RomanNumeral({ numeral, className }: RomanNumeralProps) {
  return (
    <div className={cn('relative', className)}>
      <div className="w-10 h-10 border border-gold/50 flex items-center justify-center rotate-45">
        <span className="font-display text-gold text-sm -rotate-45">
          {numeral}
        </span>
      </div>
    </div>
  )
}
