'use client'

import { Zap, Github, Twitter, Mail } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="relative bg-obsidian border-t border-gold/20 overflow-hidden">
      {/* Decorative top border */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold/50 to-transparent" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12">
          {/* Brand Column */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gold rotate-45">
                <div className="absolute inset-0 flex items-center justify-center -rotate-45">
                  <Zap className="w-5 h-5 text-obsidian" />
                </div>
              </div>
              <span className="font-display text-2xl text-gold uppercase tracking-widest">
                SitePlod
              </span>
            </div>
            <p className="text-pewter leading-relaxed max-w-md">
              Deploy your static websites in seconds. Upload HTML, CSS, and JavaScript
              files and get a live URL instantly. Free, fast, and always available.
            </p>
            <div className="flex items-center gap-4">
              <a
                href="https://github.com/uzairdeveloper223/SitePlod"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 flex items-center justify-center border border-gold/30 text-gold/60 hover:text-gold hover:border-gold transition-all duration-300"
                aria-label="GitHub"
              >
                <Github className="w-5 h-5" />
              </a>
              <a
                href="https://uzair.is-a.dev"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 flex items-center justify-center border border-gold/30 text-gold/60 hover:text-gold hover:border-gold transition-all duration-300"
                aria-label="Website"
              >
                <Zap className="w-5 h-5" />
              </a>
              <a
                href="mailto:contact@uzair.is-a.dev"
                className="w-10 h-10 flex items-center justify-center border border-gold/30 text-gold/60 hover:text-gold hover:border-gold transition-all duration-300"
                aria-label="Email"
              >
                <Mail className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Product Column */}
          <div className="space-y-6">
            <h3 className="font-display text-lg text-gold uppercase tracking-widest">
              Product
            </h3>
            <nav className="flex flex-col gap-3">
              <a href="#features" className="text-champagne/70 hover:text-gold transition-colors duration-300 text-sm">
                Features
              </a>
              <a href="#pricing" className="text-champagne/70 hover:text-gold transition-colors duration-300 text-sm">
                Pricing
              </a>
              <a href="/docs" className="text-champagne/70 hover:text-gold transition-colors duration-300 text-sm">
                Documentation
              </a>
            </nav>
          </div>

          {/* Company Column */}
          <div className="space-y-6">
            <h3 className="font-display text-lg text-gold uppercase tracking-widest">
              Company
            </h3>
            <nav className="flex flex-col gap-3">
              <a href="/about" className="text-champagne/70 hover:text-gold transition-colors duration-300 text-sm">
                About Us
              </a>
              <a href="/contact" className="text-champagne/70 hover:text-gold transition-colors duration-300 text-sm">
                Contact
              </a>
            </nav>
          </div>

          {/* Legal Column */}
          <div className="space-y-6">
            <h3 className="font-display text-lg text-gold uppercase tracking-widest">
              Legal
            </h3>
            <nav className="flex flex-col gap-3">
              <a href="/privacy" className="text-champagne/70 hover:text-gold transition-colors duration-300 text-sm">
                Privacy Policy
              </a>
              <a href="/terms" className="text-champagne/70 hover:text-gold transition-colors duration-300 text-sm">
                Terms of Service
              </a>
              <a href="/acceptable-use" className="text-champagne/70 hover:text-gold transition-colors duration-300 text-sm">
                Acceptable Use
              </a>
              <a href="/cookies" className="text-champagne/70 hover:text-gold transition-colors duration-300 text-sm">
                Cookie Policy
              </a>
            </nav>
          </div>
        </div>

        {/* CLI Announcement Banner */}
        <div className="mt-16 p-6 bg-charcoal border border-gold/20 relative overflow-hidden">
          <div className="absolute top-2 right-2 w-4 h-4 border-t-2 border-r-2 border-gold/30" aria-hidden="true" />
          <div className="absolute bottom-2 left-2 w-4 h-4 border-b-2 border-l-2 border-gold/30" aria-hidden="true" />

          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-obsidian border border-gold/30 flex items-center justify-center">
                <span className="font-mono text-gold text-lg">$</span>
              </div>
              <div>
                <h4 className="font-display text-lg text-gold uppercase tracking-widest">
                  CLI Coming Soon
                </h4>
                <p className="text-pewter text-sm">
                  Deploy directly from your terminal with our upcoming CLI tool.
                </p>
              </div>
            </div>
            <Button variant="outline" className="whitespace-nowrap">
              Get Notified
            </Button>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-12 pt-8 border-t border-gold/10 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-pewter text-sm">
            © {currentYear} SitePlod. All rights reserved.
          </p>
          <p className="text-pewter text-sm">
            Created by{' '}
            <a
              href="https://uzair.is-a.dev"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gold hover:text-gold-light transition-colors"
            >
              Uzair Mughal
            </a>
            {' '}(@uzairdveloper223)
          </p>
        </div>
      </div>
    </footer>
  )
}
