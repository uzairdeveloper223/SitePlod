'use client'

import { Upload, FileCode, Globe, Rocket, ArrowRight } from 'lucide-react'
import { Section, SectionTitle, RomanNumeral } from '@/components/siteplod/page-wrapper'
import { Button } from '@/components/ui/button'

const steps = [
  {
    numeral: 'I',
    icon: Upload,
    title: 'Upload Your Files',
    description: 'Drag and drop your HTML file, or upload a ZIP package containing your entire website. We support HTML, CSS, JavaScript, images, and other static assets.',
    color: 'from-gold/20 to-transparent'
  },
  {
    numeral: 'II',
    icon: FileCode,
    title: 'Choose Your Path',
    description: 'Decide if you want a managed site with a dashboard for future edits, or an unmanaged one-time deployment. Both are free and get instant live URLs.',
    color: 'from-gold/20 to-transparent'
  },
  {
    numeral: 'III',
    icon: Globe,
    title: 'Pick Your Slug',
    description: 'Select a unique URL slug for your site. Your site will be live at siteplod.com/s/your-slug. Check availability and claim your custom URL.',
    color: 'from-gold/20 to-transparent'
  },
  {
    numeral: 'IV',
    icon: Rocket,
    title: 'Go Live Instantly',
    description: 'Your site is deployed immediately. Share the URL, make updates from your dashboard (if managed), or let it live forever as a static page.',
    color: 'from-gold/20 to-transparent'
  }
]

interface HowItWorksSectionProps {
  onNavigate?: (page: 'home' | 'upload' | 'dashboard') => void
}

export function HowItWorksSection({ onNavigate }: HowItWorksSectionProps) {
  return (
    <Section id="how-it-works" variant="alternate">
      <SectionTitle
        title="How It Works"
        subtitle="Four simple steps to deploy your static website. No complexity, no configuration, just results."
      />
      
      <div className="relative">
        {/* Connecting line */}
        <div className="hidden lg:block absolute top-1/2 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold/30 to-transparent -translate-y-1/2" aria-hidden="true" />
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-4">
          {steps.map((step, index) => {
            const Icon = step.icon
            return (
              <div key={index} className="relative group">
                {/* Step card */}
                <div className="relative bg-charcoal border border-gold/30 p-6 transition-all duration-500 hover:border-gold hover:shadow-gold">
                  {/* Corner decorations */}
                  <div className="absolute top-2 right-2 w-4 h-4 border-t-2 border-r-2 border-gold/40 transition-all duration-300 group-hover:border-gold" aria-hidden="true" />
                  <div className="absolute bottom-2 left-2 w-4 h-4 border-b-2 border-l-2 border-gold/40 transition-all duration-300 group-hover:border-gold" aria-hidden="true" />
                  
                  {/* Number badge */}
                  <div className="absolute -top-4 left-6">
                    <RomanNumeral numeral={step.numeral} />
                  </div>
                  
                  {/* Icon */}
                  <div className="mt-4 mb-6">
                    <div className="w-14 h-14 bg-obsidian border border-gold/30 flex items-center justify-center transition-all duration-300 group-hover:border-gold group-hover:shadow-gold">
                      <Icon className="w-7 h-7 text-gold" />
                    </div>
                  </div>
                  
                  {/* Content */}
                  <h3 className="font-display text-xl text-gold uppercase tracking-widest mb-3">
                    {step.title}
                  </h3>
                  <p className="text-pewter text-sm leading-relaxed">
                    {step.description}
                  </p>
                  
                  {/* Arrow (except last) */}
                  {index < steps.length - 1 && (
                    <div className="hidden lg:flex absolute -right-6 top-1/2 -translate-y-1/2 z-10">
                      <ArrowRight className="w-5 h-5 text-gold/50" />
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>
      
      {/* CTA */}
      <div className="text-center mt-16">
        <Button size="lg" variant="solid" onClick={() => onNavigate?.('upload')}>
          <Upload className="w-5 h-5 mr-2" />
          Start Deploying Now
        </Button>
      </div>
    </Section>
  )
}
