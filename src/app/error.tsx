'use client'

import { AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardCornerDecorations } from '@/components/ui/card'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 art-deco-pattern">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
        <div className="absolute top-20 left-10 w-32 h-32 border border-gold/10 rotate-45" />
        <div className="absolute bottom-20 right-10 w-40 h-40 border border-gold/10 rotate-12" />
        <div className="absolute top-1/2 left-1/4 w-24 h-24 border border-gold/5 -rotate-12" />
      </div>

      <Card className="max-w-2xl w-full relative z-10 border-gold/50 shadow-gold">
        <CardCornerDecorations className="w-8 h-8" />
        
        <CardContent className="pt-16 pb-16 text-center">
          {/* 500 Icon */}
          <div className="relative inline-block mb-8">
            <div className="w-24 h-24 bg-charcoal border-2 border-gold/50 rotate-45 flex items-center justify-center">
              <AlertTriangle className="w-12 h-12 text-gold -rotate-45" />
            </div>
            {/* Decorative corner accents */}
            <div className="absolute -top-2 -left-2 w-6 h-6 border-t-2 border-l-2 border-gold" aria-hidden="true" />
            <div className="absolute -bottom-2 -right-2 w-6 h-6 border-b-2 border-r-2 border-gold" aria-hidden="true" />
          </div>

          {/* Title */}
          <h1 className="font-display text-6xl md:text-7xl text-gold uppercase tracking-widest mb-4">
            500
          </h1>

          {/* Decorative divider */}
          <div className="flex items-center justify-center gap-4 mb-6">
            <div className="h-px w-16 bg-gradient-to-r from-transparent to-gold/50" aria-hidden="true" />
            <div className="w-2 h-2 bg-gold rotate-45" aria-hidden="true" />
            <div className="h-px w-16 bg-gradient-to-l from-transparent to-gold/50" aria-hidden="true" />
          </div>

          {/* Message */}
          <h2 className="font-display text-2xl md:text-3xl text-champagne uppercase tracking-widest mb-4">
            Server Error
          </h2>
          <p className="text-pewter text-lg mb-8 max-w-md mx-auto leading-relaxed">
            Something went wrong on our end. Please try again later or refresh the page.
          </p>

          {/* Action Button */}
          <Button size="lg" onClick={reset} className="gap-2 group">
            <AlertTriangle className="w-5 h-5 transition-transform group-hover:rotate-12" />
            Try Again
          </Button>

          {/* Additional decorative elements */}
          <div className="mt-12 flex items-center justify-center gap-8" aria-hidden="true">
            <div className="w-12 h-px bg-gradient-to-r from-transparent to-gold/30" />
            <div className="w-3 h-3 border border-gold/30 rotate-45" />
            <div className="w-12 h-px bg-gradient-to-l from-transparent to-gold/30" />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
