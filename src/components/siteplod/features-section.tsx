'use client'

import { 
  Zap, 
  Globe, 
  Shield, 
  Code, 
  Layers, 
  Terminal,
  Upload,
  Link,
  Settings
} from 'lucide-react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardCornerDecorations } from '@/components/ui/card'
import { Section, SectionTitle, RomanNumeral } from '@/components/siteplod/page-wrapper'

const features = [
  {
    icon: Zap,
    numeral: 'I',
    title: 'Instant Deployment',
    description: 'Upload your files and get a live URL in seconds. No build process, no configuration, no waiting. Your site goes live the moment you upload.'
  },
  {
    icon: Globe,
    numeral: 'II',
    title: 'Custom URLs',
    description: 'Choose your own memorable slug for your site. Get a clean, shareable URL like siteplod.com/s/your-project that you can share with anyone.'
  },
  {
    icon: Shield,
    numeral: 'III',
    title: 'Always Free',
    description: 'No hidden fees, no premium tiers required for basic hosting. Static sites are always free. Upload as many sites as you need without any cost.'
  },
  {
    icon: Code,
    numeral: 'IV',
    title: 'Code Editor',
    description: 'Edit your HTML, CSS, and JavaScript directly in the browser with our built-in code editor. Make changes and publish instantly with one click.'
  },
  {
    icon: Layers,
    numeral: 'V',
    title: 'ZIP Upload',
    description: 'Upload a complete website as a ZIP file containing all your HTML, CSS, JS, and image assets. We extract and deploy everything automatically.'
  },
  {
    icon: Terminal,
    numeral: 'VI',
    title: 'CLI Support',
    description: 'Coming soon: Deploy directly from your terminal with our CLI tool. Automate your workflow and integrate with your existing development process.'
  }
]

export function FeaturesSection() {
  return (
    <Section id="features">
      <SectionTitle
        title="Features"
        subtitle="Everything you need to deploy and manage your static websites with elegance and simplicity."
      />
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {features.map((feature, index) => {
          const Icon = feature.icon
          return (
            <Card key={index} className="group">
              <CardCornerDecorations />
              <CardHeader>
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 bg-obsidian border border-gold/30 flex items-center justify-center group-hover:border-gold transition-colors duration-300">
                    <Icon className="w-6 h-6 text-gold" />
                  </div>
                  <RomanNumeral numeral={feature.numeral} />
                </div>
                <CardTitle className="text-xl">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base leading-relaxed">
                  {feature.description}
                </CardDescription>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </Section>
  )
}

// Additional smaller feature highlights
export function QuickFeatures() {
  const quickFeatures = [
    { icon: Upload, text: 'Drag & Drop Upload' },
    { icon: Link, text: 'Instant Live URL' },
    { icon: Settings, text: 'Easy Management' },
  ]

  return (
    <div className="flex flex-wrap justify-center gap-6 md:gap-12">
      {quickFeatures.map((feature, index) => {
        const Icon = feature.icon
        return (
          <div key={index} className="flex items-center gap-3">
            <div className="w-10 h-10 bg-charcoal border border-gold/30 flex items-center justify-center">
              <Icon className="w-5 h-5 text-gold" />
            </div>
            <span className="text-champagne uppercase tracking-wide text-sm">
              {feature.text}
            </span>
          </div>
        )
      })}
    </div>
  )
}
