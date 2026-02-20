'use client'

import { PageWrapper } from '@/components/siteplod/page-wrapper'
import { Header } from '@/components/siteplod/header'
import { Footer } from '@/components/siteplod/footer'
import { ArrowLeft, Github, Mail, ExternalLink, Zap, Rocket, Code, Globe } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default function AboutPage() {
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
            About SitePlod
          </h1>
          <p className="text-pewter mb-12">Deploy static websites in seconds</p>

          <div className="space-y-8 text-champagne/90 leading-relaxed">
            <section>
              <h2 className="font-display text-2xl text-gold uppercase tracking-wider mb-4">Our Mission</h2>
              <p className="mb-4">
                SitePlod was created to solve a simple problem: deploying static websites should be instant
                and effortless. No complex configurations, no lengthy build processes—just upload your files
                and get a live URL.
              </p>
              <p>
                We believe in the power of simplicity. Whether you're a student learning web development,
                a designer showcasing your portfolio, or a developer prototyping an idea, SitePlod makes it
                easy to share your work with the world.
              </p>
            </section>

            <section>
              <h2 className="font-display text-2xl text-gold uppercase tracking-wider mb-4">What We Offer</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 my-6">
                <div className="bg-charcoal/50 border border-gold/20 p-6">
                  <div className="flex items-center gap-3 mb-3">
                    <Rocket className="w-6 h-6 text-gold" />
                    <h3 className="font-display text-lg text-gold uppercase tracking-wider">Instant Deployment</h3>
                  </div>
                  <p className="text-sm">
                    Upload your HTML, CSS, and JavaScript files or ZIP archives and get a live URL in seconds.
                  </p>
                </div>

                <div className="bg-charcoal/50 border border-gold/20 p-6">
                  <div className="flex items-center gap-3 mb-3">
                    <Code className="w-6 h-6 text-gold" />
                    <h3 className="font-display text-lg text-gold uppercase tracking-wider">Live Code Editor</h3>
                  </div>
                  <p className="text-sm">
                    Edit your site's code directly in the browser with our built-in editor and see changes instantly.
                  </p>
                </div>

                <div className="bg-charcoal/50 border border-gold/20 p-6">
                  <div className="flex items-center gap-3 mb-3">
                    <Globe className="w-6 h-6 text-gold" />
                    <h3 className="font-display text-lg text-gold uppercase tracking-wider">Custom URLs</h3>
                  </div>
                  <p className="text-sm">
                    Get clean, memorable URLs for your sites that are easy to share and remember.
                  </p>
                </div>

                <div className="bg-charcoal/50 border border-gold/20 p-6">
                  <div className="flex items-center gap-3 mb-3">
                    <Zap className="w-6 h-6 text-gold" />
                    <h3 className="font-display text-lg text-gold uppercase tracking-wider">Free Forever</h3>
                  </div>
                  <p className="text-sm">
                    Core features are completely free. No credit card required, no hidden fees, no surprises.
                  </p>
                </div>
              </div>
            </section>

            <section>
              <h2 className="font-display text-2xl text-gold uppercase tracking-wider mb-4">Created By</h2>
              <div className="bg-charcoal/50 border border-gold/20 p-8">
                <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
                  <div className="w-24 h-24 bg-gold rotate-45 flex-shrink-0">
                    <div className="w-full h-full flex items-center justify-center -rotate-45">
                      <span className="font-display text-4xl text-obsidian">UM</span>
                    </div>
                  </div>

                  <div className="flex-1 text-center md:text-left">
                    <h3 className="text-2xl text-champagne mb-2">Uzair Mughal</h3>
                    <p className="text-pewter mb-4">@uzairdeveloper223</p>
                    <p className="mb-6">
                      A passionate developer dedicated to building tools that make web development more
                      accessible and enjoyable. SitePlod combines modern technology with Art Deco aesthetics
                      to create a unique deployment experience.
                    </p>

                    <div className="flex flex-wrap gap-3 justify-center md:justify-start">
                      <a
                        href="https://github.com/uzairdeveloper223/SitePlod"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-4 py-2 bg-gold text-obsidian font-display uppercase tracking-wider text-sm hover:bg-gold-light transition-colors"
                      >
                        <Github className="w-4 h-4" />
                        GitHub
                      </a>

                      <a
                        href="https://uzair.is-a.dev"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-4 py-2 border border-gold text-gold font-display uppercase tracking-wider text-sm hover:bg-gold/10 transition-colors"
                      >
                        <ExternalLink className="w-4 h-4" />
                        Website
                      </a>

                      <a
                        href="mailto:contact@uzair.is-a.dev"
                        className="inline-flex items-center gap-2 px-4 py-2 border border-gold text-gold font-display uppercase tracking-wider text-sm hover:bg-gold/10 transition-colors"
                      >
                        <Mail className="w-4 h-4" />
                        Email
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            <section>
              <h2 className="font-display text-2xl text-gold uppercase tracking-wider mb-4">Built With</h2>
              <p className="mb-4">
                SitePlod is built with modern web technologies to ensure speed, reliability, and a great user experience.
              </p>
              <div className="flex flex-wrap gap-3">
                {['Next.js 16', 'React', 'TypeScript', 'Tailwind CSS', 'Supabase', 'Pastebin API', 'ImgBB API', 'Nodemailer'].map((tech) => (
                  <span
                    key={tech}
                    className="px-3 py-1 bg-charcoal/50 border border-gold/30 text-champagne text-sm uppercase tracking-wide"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            </section>

            <section>
              <h2 className="font-display text-2xl text-gold uppercase tracking-wider mb-4">Get Started</h2>
              <p className="mb-4">
                Ready to deploy your first site? It's completely free and takes less than a minute.
              </p>
              <Link href="/">
                <Button variant="solid" className="gap-2">
                  <Rocket className="w-4 h-4" />
                  Start Deploying Now
                </Button>
              </Link>
            </section>

            <section>
              <h2 className="font-display text-2xl text-gold uppercase tracking-wider mb-4">Contact Us</h2>
              <p>
                Have questions or feedback? We'd love to hear from you at:{' '}
                <a href="mailto:contact@uzair.is-a.dev" className="text-gold hover:underline">
                  contact@uzair.is-a.dev
                </a>
              </p>
            </section>
          </div>
        </div>
      </main>

      <Footer />
    </PageWrapper>
  )
}
