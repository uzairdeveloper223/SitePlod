'use client'

import { PageWrapper } from '@/components/siteplod/page-wrapper'
import { Header } from '@/components/siteplod/header'
import { Footer } from '@/components/siteplod/footer'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default function CookiePolicy() {
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
            Cookie Policy
          </h1>
          <p className="text-pewter mb-12">Last updated: February 19, 2026</p>

          <div className="space-y-8 text-champagne/90 leading-relaxed">
            <section>
              <h2 className="font-display text-2xl text-gold uppercase tracking-wider mb-4">1. What Are Cookies</h2>
              <p>
                Cookies are small text files that are placed on your device when you visit a website. They are 
                widely used to make websites work more efficiently and provide information to website owners.
              </p>
            </section>

            <section>
              <h2 className="font-display text-2xl text-gold uppercase tracking-wider mb-4">2. How We Use Cookies</h2>
              <p className="mb-4">SitePlod uses cookies for the following purposes:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Authentication: To keep you logged in to your account</li>
                <li>Preferences: To remember your settings and preferences</li>
                <li>Security: To protect against fraudulent activity and enhance security</li>
                <li>Analytics: To understand how visitors use our website</li>
                <li>Performance: To improve website functionality and user experience</li>
              </ul>
            </section>

            <section>
              <h2 className="font-display text-2xl text-gold uppercase tracking-wider mb-4">3. Types of Cookies We Use</h2>
              
              <div className="space-y-6 mt-4">
                <div>
                  <h3 className="text-xl text-gold mb-2">Essential Cookies</h3>
                  <p>
                    These cookies are necessary for the website to function properly. They enable core functionality 
                    such as security, network management, and accessibility. You cannot opt-out of these cookies.
                  </p>
                </div>

                <div>
                  <h3 className="text-xl text-gold mb-2">Functional Cookies</h3>
                  <p>
                    These cookies enable the website to provide enhanced functionality and personalization. They may 
                    be set by us or by third-party providers whose services we have added to our pages.
                  </p>
                </div>

                <div>
                  <h3 className="text-xl text-gold mb-2">Analytics Cookies</h3>
                  <p>
                    These cookies help us understand how visitors interact with our website by collecting and 
                    reporting information anonymously. This helps us improve our website and services.
                  </p>
                </div>

                <div>
                  <h3 className="text-xl text-gold mb-2">Performance Cookies</h3>
                  <p>
                    These cookies allow us to count visits and traffic sources so we can measure and improve the 
                    performance of our site. They help us know which pages are the most and least popular.
                  </p>
                </div>
              </div>
            </section>

            <section>
              <h2 className="font-display text-2xl text-gold uppercase tracking-wider mb-4">4. Third-Party Cookies</h2>
              <p>
                We may use third-party services that set cookies on your device. These third parties have their 
                own privacy policies and cookie policies. We do not control these cookies and recommend you check 
                the third-party websites for more information.
              </p>
            </section>

            <section>
              <h2 className="font-display text-2xl text-gold uppercase tracking-wider mb-4">5. Cookie Duration</h2>
              <p className="mb-4">Cookies can be either:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>
                  <strong className="text-gold">Session Cookies:</strong> Temporary cookies that expire when you 
                  close your browser
                </li>
                <li>
                  <strong className="text-gold">Persistent Cookies:</strong> Cookies that remain on your device 
                  for a set period or until you delete them
                </li>
              </ul>
            </section>

            <section>
              <h2 className="font-display text-2xl text-gold uppercase tracking-wider mb-4">6. Managing Cookies</h2>
              <p className="mb-4">
                You have the right to decide whether to accept or reject cookies. You can exercise your cookie 
                preferences by:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Using the cookie consent banner when you first visit our website</li>
                <li>Adjusting your browser settings to refuse cookies</li>
                <li>Deleting cookies that have already been set</li>
              </ul>
              <p className="mt-4">
                Please note that if you choose to block cookies, some features of our website may not function 
                properly, and you may not be able to access certain parts of the site.
              </p>
            </section>

            <section>
              <h2 className="font-display text-2xl text-gold uppercase tracking-wider mb-4">7. Browser Controls</h2>
              <p className="mb-4">Most web browsers allow you to control cookies through their settings. To find out more about cookies, including how to see what cookies have been set and how to manage and delete them, visit:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>
                  <a href="https://www.allaboutcookies.org" target="_blank" rel="noopener noreferrer" className="text-gold hover:underline">
                    www.allaboutcookies.org
                  </a>
                </li>
                <li>
                  <a href="https://www.youronlinechoices.com" target="_blank" rel="noopener noreferrer" className="text-gold hover:underline">
                    www.youronlinechoices.com
                  </a>
                </li>
              </ul>
            </section>

            <section>
              <h2 className="font-display text-2xl text-gold uppercase tracking-wider mb-4">8. Do Not Track Signals</h2>
              <p>
                Some browsers include a "Do Not Track" (DNT) feature that signals to websites that you do not want 
                to have your online activity tracked. We currently do not respond to DNT signals.
              </p>
            </section>

            <section>
              <h2 className="font-display text-2xl text-gold uppercase tracking-wider mb-4">9. Changes to This Policy</h2>
              <p>
                We may update this Cookie Policy from time to time to reflect changes in our practices or for other 
                operational, legal, or regulatory reasons. Please check this page periodically for updates.
              </p>
            </section>

            <section>
              <h2 className="font-display text-2xl text-gold uppercase tracking-wider mb-4">10. Contact Us</h2>
              <p>
                If you have any questions about our use of cookies, please contact us at:{' '}
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
