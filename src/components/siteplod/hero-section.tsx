'use client'

import { Button } from '@/components/ui/button'
import { Upload, ArrowRight, Sparkles, ChevronDown } from 'lucide-react'

interface HeroSectionProps {
  onNavigate?: (page: 'home' | 'upload' | 'dashboard') => void
}

export function HeroSection({ onNavigate }: HeroSectionProps) {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
      {/* Sunburst radial gradient background */}
      <div className="absolute inset-0 sunburst opacity-50" aria-hidden="true" />

      {/* Floating geometric decorations */}
      <div className="absolute top-1/4 left-1/4 w-32 h-32 border border-gold/10 rotate-45 animate-pulse" aria-hidden="true" />
      <div className="absolute bottom-1/4 right-1/4 w-24 h-24 border border-gold/10 rotate-12" aria-hidden="true" />
      <div className="absolute top-1/3 right-1/3 w-16 h-16 border border-gold/5 rotate-45" aria-hidden="true" />

      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-charcoal border border-gold/30 mb-8 animate-fade-in">
          <Sparkles className="w-4 h-4 text-gold" />
          <span className="text-xs uppercase tracking-widest text-gold">
            Free Static Site Hosting
          </span>
        </div>

        {/* Main heading */}
        <h1 className="font-display text-5xl sm:text-6xl md:text-7xl lg:text-8xl text-champagne uppercase tracking-widest leading-tight mb-6 animate-slide-up">
          Deploy Your
          <br />
          <span className="text-gold text-glow">Static Sites</span>
          <br />
          In Seconds
        </h1>

        {/* Subtitle */}
        <p className="text-lg md:text-xl text-pewter max-w-2xl mx-auto leading-relaxed mb-12 animate-slide-up [animation-delay:200ms]">
          Upload your HTML, CSS, and JavaScript files. Get a live URL instantly.
          No backend required. No credit card needed. Just pure, elegant static hosting.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-slide-up [animation-delay:400ms]">
          <Button
            size="lg"
            variant="solid"
            onClick={() => onNavigate?.('upload')}
            className="min-w-[200px] group"
          >
            <Upload className="w-5 h-5 mr-2 group-hover:animate-bounce" />
            Deploy Now
          </Button>
        </div>

        {/* Stats */}
        <div className="mt-20 grid grid-cols-3 gap-8 max-w-3xl mx-auto animate-fade-in [animation-delay:600ms]">
          <div className="text-center">
            <div className="font-display text-4xl md:text-5xl text-gold mb-2">∞</div>
            <div className="text-xs uppercase tracking-widest text-pewter">Free Sites</div>
          </div>
          <div className="text-center border-x border-gold/20 px-4">
            <div className="font-display text-4xl md:text-5xl text-gold mb-2">0s</div>
            <div className="text-xs uppercase tracking-widest text-pewter">Deploy Time</div>
          </div>
          <div className="text-center">
            <div className="font-display text-4xl md:text-5xl text-gold mb-2">99%</div>
            <div className="text-xs uppercase tracking-widest text-pewter">Uptime</div>
          </div>
        </div>

        {/* Bouncing scroll button */}
        <div className="mt-16 flex justify-center animate-fade-in [animation-delay:800ms]">
          <button
            onClick={() => {
              const nextSection = document.querySelector('#features');
              nextSection?.scrollIntoView({ behavior: 'smooth' });
            }}
            className="flex flex-col items-center gap-2 group cursor-pointer animate-bounce hover:animate-none transition-all"
            aria-label="Scroll to features"
          >
            <div className="w-12 h-12 rounded-full border-2 border-gold/40 flex items-center justify-center group-hover:border-gold group-hover:bg-gold/10 transition-all">
              <ChevronDown className="w-6 h-6 text-gold" />
            </div>
            <span className="text-xs text-pewter uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">
              Explore
            </span>
          </button>
        </div>
      </div>
    </section>
  )
}
