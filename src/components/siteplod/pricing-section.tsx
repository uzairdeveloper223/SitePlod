'use client'

import { Check, X, Zap, Crown } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter, CardCornerDecorations } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Section, SectionTitle, RomanNumeral } from '@/components/siteplod/page-wrapper'

const plans = [
  {
    name: 'Unmanaged',
    numeral: 'I',
    price: 'Free',
    period: 'Forever',
    description: 'Perfect for one-time deployments. Upload and forget.',
    icon: Zap,
    features: [
      { name: 'Unlimited sites', included: true },
      { name: 'Instant deployment', included: true },
      { name: 'Custom URL slug', included: true },
      { name: 'ZIP file upload', included: true },
      { name: 'Code editor access', included: false },
      { name: 'Future edits', included: false },
      { name: 'Priority support', included: false },
    ],
    buttonText: 'Deploy Now',
    buttonVariant: 'default' as const,
    popular: false
  },
  {
    name: 'Managed',
    numeral: 'II',
    price: 'Free',
    period: 'Forever',
    description: 'Full control with a dashboard. Edit and update anytime.',
    icon: Crown,
    features: [
      { name: 'Unlimited sites', included: true },
      { name: 'Instant deployment', included: true },
      { name: 'Custom URL slug', included: true },
      { name: 'ZIP file upload', included: true },
      { name: 'Code editor access', included: true },
      { name: 'Future edits', included: true },
      { name: 'Priority support', included: false },
    ],
    buttonText: 'Register & Deploy',
    buttonVariant: 'solid' as const,
    popular: true
  }
]

interface PricingSectionProps {
  onNavigate?: (page: 'home' | 'upload' | 'dashboard') => void
}

export function PricingSection({ onNavigate }: PricingSectionProps) {
  return (
    <Section id="pricing">
      <SectionTitle
        title="Pricing"
        subtitle="Both plans are completely free. Choose based on whether you need future edit access to your sites."
      />
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
        {plans.map((plan, index) => {
          const Icon = plan.icon
          return (
            <Card 
              key={index} 
              className={`relative ${plan.popular ? 'border-gold shadow-gold' : ''}`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-gold text-obsidian text-xs uppercase tracking-widest font-semibold">
                  Recommended
                </div>
              )}
              
              <CardCornerDecorations />
              
              <CardHeader className="text-center pb-2">
                <div className="flex items-center justify-center gap-4 mb-4">
                  <RomanNumeral numeral={plan.numeral} />
                  <div className="w-12 h-12 bg-obsidian border border-gold/30 flex items-center justify-center">
                    <Icon className="w-6 h-6 text-gold" />
                  </div>
                </div>
                <CardTitle className="text-2xl">{plan.name}</CardTitle>
                <CardDescription>{plan.description}</CardDescription>
              </CardHeader>
              
              <CardContent className="pt-6">
                {/* Price */}
                <div className="text-center mb-8">
                  <span className="font-display text-5xl text-gold">{plan.price}</span>
                  <span className="text-pewter text-sm ml-2">/ {plan.period}</span>
                </div>
                
                {/* Features */}
                <ul className="space-y-4">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-center gap-3">
                      {feature.included ? (
                        <div className="w-5 h-5 bg-gold/20 flex items-center justify-center">
                          <Check className="w-3 h-3 text-gold" />
                        </div>
                      ) : (
                        <div className="w-5 h-5 bg-charcoal border border-pewter/30 flex items-center justify-center">
                          <X className="w-3 h-3 text-pewter/50" />
                        </div>
                      )}
                      <span className={feature.included ? 'text-champagne' : 'text-pewter/50'}>
                        {feature.name}
                      </span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              
              <CardFooter className="pt-6">
                <Button 
                  variant={plan.buttonVariant} 
                  className="w-full"
                  onClick={() => onNavigate?.('upload')}
                >
                  {plan.buttonText}
                </Button>
              </CardFooter>
            </Card>
          )
        })}
      </div>
      
      {/* Note about future pricing */}
      <p className="text-center text-pewter text-sm mt-8 max-w-2xl mx-auto">
        Both plans are currently free during our beta period. In the future, we may introduce 
        premium features, but your existing free sites will always remain free.
      </p>
    </Section>
  )
}
