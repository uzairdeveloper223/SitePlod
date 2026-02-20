'use client'

import { PageWrapper } from '@/components/siteplod/page-wrapper'
import { Header } from '@/components/siteplod/header'
import { Footer } from '@/components/siteplod/footer'
import { ArrowLeft, Mail, Github, Globe, Send, ExternalLink } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default function ContactPage() {
  return (
    <PageWrapper>
      <Header />

      <main className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <Link href="/">
            <Button variant="ghost" className="mb-8 gap-2">
              <ArrowLeft className="w-4 h-4" />
              Back to Home
            </Button>
          </Link>

          <h1 className="font-display text-4xl md:text-5xl text-gold uppercase tracking-widest mb-4">
            Contact Us
          </h1>
          <p className="text-pewter mb-12">We'd love to hear from you</p>

          <div className="space-y-8 text-champagne/90 leading-relaxed">
            <section>
              <h2 className="font-display text-2xl text-gold uppercase tracking-wider mb-4">Get In Touch</h2>
              <p className="mb-6">
                Have questions, feedback, or need help? We're here to assist you. Choose your preferred method of contact below.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 my-8">
                <div className="bg-charcoal/50 border border-gold/20 p-6 text-center">
                  <Mail className="w-12 h-12 text-gold mx-auto mb-4" />
                  <h3 className="font-display text-lg text-gold uppercase tracking-wider mb-2">Email</h3>
                  <p className="text-sm text-pewter mb-3">Send us an email anytime</p>
                  <p className="font-mono text-sm mb-4">contact@uzair.is-a.dev</p>
                  <a
                    href="mailto:contact@uzair.is-a.dev"
                    className="inline-flex items-center gap-2 px-4 py-2 border border-gold text-gold font-display uppercase tracking-wider text-xs hover:bg-gold/10 transition-colors"
                  >
                    <Send className="w-3 h-3" />
                    Send Email
                  </a>
                </div>

                <div className="bg-charcoal/50 border border-gold/20 p-6 text-center">
                  <Github className="w-12 h-12 text-gold mx-auto mb-4" />
                  <h3 className="font-display text-lg text-gold uppercase tracking-wider mb-2">GitHub</h3>
                  <p className="text-sm text-pewter mb-3">Check out our code</p>
                  <p className="font-mono text-sm mb-4">@uzairdeveloper223</p>
                  <a
                    href="https://github.com/uzairdeveloper223"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 border border-gold text-gold font-display uppercase tracking-wider text-xs hover:bg-gold/10 transition-colors"
                  >
                    <ExternalLink className="w-3 h-3" />
                    View Profile
                  </a>
                </div>

                <div className="bg-charcoal/50 border border-gold/20 p-6 text-center">
                  <Globe className="w-12 h-12 text-gold mx-auto mb-4" />
                  <h3 className="font-display text-lg text-gold uppercase tracking-wider mb-2">Website</h3>
                  <p className="text-sm text-pewter mb-3">Visit our main site</p>
                  <p className="font-mono text-sm mb-4">uzair.is-a.dev</p>
                  <a
                    href="https://uzair.is-a.dev"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 border border-gold text-gold font-display uppercase tracking-wider text-xs hover:bg-gold/10 transition-colors"
                  >
                    <ExternalLink className="w-3 h-3" />
                    Visit Site
                  </a>
                </div>
              </div>
            </section>

            <section>
              <h2 className="font-display text-2xl text-gold uppercase tracking-wider mb-4">Quick Actions</h2>
              <p className="mb-4">
                For the fastest response, please email us directly with one of these subject lines:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <a
                  href="mailto:contact@uzair.is-a.dev?subject=Bug Report"
                  className="flex items-center gap-3 p-4 bg-charcoal/50 border border-gold/20 hover:border-gold transition-colors"
                >
                  <Send className="w-5 h-5 text-gold" />
                  <span>Report a Bug</span>
                </a>
                <a
                  href="mailto:contact@uzair.is-a.dev?subject=Feature Request"
                  className="flex items-center gap-3 p-4 bg-charcoal/50 border border-gold/20 hover:border-gold transition-colors"
                >
                  <Send className="w-5 h-5 text-gold" />
                  <span>Request Feature</span>
                </a>
                <a
                  href="mailto:contact@uzair.is-a.dev?subject=General Inquiry"
                  className="flex items-center gap-3 p-4 bg-charcoal/50 border border-gold/20 hover:border-gold transition-colors"
                >
                  <Send className="w-5 h-5 text-gold" />
                  <span>General Inquiry</span>
                </a>
                <a
                  href="mailto:contact@uzair.is-a.dev?subject=Partnership"
                  className="flex items-center gap-3 p-4 bg-charcoal/50 border border-gold/20 hover:border-gold transition-colors"
                >
                  <Send className="w-5 h-5 text-gold" />
                  <span>Partnership</span>
                </a>
              </div>
            </section>

            <section>
              <h2 className="font-display text-2xl text-gold uppercase tracking-wider mb-4">Open Source</h2>
              <div className="bg-charcoal/50 border border-gold/20 p-6">
                <div className="flex flex-col md:flex-row items-center gap-6">
                  <Github className="w-16 h-16 text-gold flex-shrink-0" />
                  <div className="flex-1 text-center md:text-left">
                    <p className="mb-4">
                      SitePlod is open source! Check out our code, report issues, or contribute to the project on GitHub.
                    </p>
                    <a
                      href="https://github.com/uzairdeveloper223"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-6 py-3 bg-gold text-obsidian font-display uppercase tracking-wider text-sm hover:bg-gold-light transition-colors"
                    >
                      <Github className="w-4 h-4" />
                      View on GitHub
                    </a>
                  </div>
                </div>
              </div>
            </section>

            <section>
              <h2 className="font-display text-2xl text-gold uppercase tracking-wider mb-4">Common Questions</h2>
              <div className="space-y-4">
                <div className="bg-charcoal/50 border border-gold/20 p-6">
                  <h3 className="font-display text-lg text-gold uppercase tracking-wider mb-2">
                    How quickly will I get a response?
                  </h3>
                  <p className="text-sm">
                    We typically respond to emails within 24-48 hours during business days. For urgent issues,
                    please mention "URGENT" in your subject line.
                  </p>
                </div>

                <div className="bg-charcoal/50 border border-gold/20 p-6">
                  <h3 className="font-display text-lg text-gold uppercase tracking-wider mb-2">
                    Can I contribute to SitePlod?
                  </h3>
                  <p className="text-sm">
                    Absolutely! SitePlod is open source. Visit our GitHub repository to see how you can contribute
                    code, report bugs, or suggest features.
                  </p>
                </div>

                <div className="bg-charcoal/50 border border-gold/20 p-6">
                  <h3 className="font-display text-lg text-gold uppercase tracking-wider mb-2">
                    Where can I report security issues?
                  </h3>
                  <p className="text-sm">
                    Please report security vulnerabilities directly to contact@uzair.is-a.dev with "SECURITY" in
                    the subject line. We take security seriously and will respond promptly.
                  </p>
                </div>
              </div>
            </section>

            <section>
              <h2 className="font-display text-2xl text-gold uppercase tracking-wider mb-4">Creator</h2>
              <div className="bg-charcoal/50 border border-gold/20 p-6 text-center">
                <div className="w-16 h-16 bg-gold rotate-45 mx-auto mb-4">
                  <div className="w-full h-full flex items-center justify-center -rotate-45">
                    <span className="font-display text-2xl text-obsidian">UM</span>
                  </div>
                </div>
                <h3 className="text-xl text-champagne mb-2">Uzair Mughal</h3>
                <p className="text-pewter mb-4">Creator & Developer of SitePlod</p>
                <div className="flex flex-wrap gap-3 justify-center">
                  <a
                    href="https://github.com/uzairdeveloper223"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 border border-gold text-gold font-display uppercase tracking-wider text-xs hover:bg-gold/10 transition-colors"
                  >
                    <Github className="w-3 h-3" />
                    GitHub
                  </a>
                  <a
                    href="https://uzair.is-a.dev"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 border border-gold text-gold font-display uppercase tracking-wider text-xs hover:bg-gold/10 transition-colors"
                  >
                    <Globe className="w-3 h-3" />
                    Website
                  </a>
                  <a
                    href="mailto:contact@uzair.is-a.dev"
                    className="inline-flex items-center gap-2 px-4 py-2 border border-gold text-gold font-display uppercase tracking-wider text-xs hover:bg-gold/10 transition-colors"
                  >
                    <Mail className="w-3 h-3" />
                    Email
                  </a>
                </div>
              </div>
            </section>
          </div>
        </div>
      </main>

      <Footer />
    </PageWrapper>
  )
}
