'use client'

import { PageWrapper } from '@/components/siteplod/page-wrapper'
import { Header } from '@/components/siteplod/header'
import { Footer } from '@/components/siteplod/footer'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default function PrivacyPolicy() {
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
            Privacy Policy
          </h1>
          <p className="text-pewter mb-12">Last updated: February 19, 2026</p>

          <div className="space-y-8 text-champagne/90 leading-relaxed">
            <section>
              <h2 className="font-display text-2xl text-gold uppercase tracking-wider mb-4">1. Introduction</h2>
              <p>
                Welcome to SitePlod. We respect your privacy and are committed to protecting your personal data. 
                This privacy policy will inform you about how we look after your personal data when you visit our 
                website and tell you about your privacy rights.
              </p>
            </section>

            <section>
              <h2 className="font-display text-2xl text-gold uppercase tracking-wider mb-4">2. Data We Collect</h2>
              <p className="mb-4">We may collect, use, store and transfer different kinds of personal data about you:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Identity Data: username, email address</li>
                <li>Technical Data: IP address, browser type, device information</li>
                <li>Usage Data: information about how you use our website and services</li>
                <li>Content Data: files you upload to our platform (HTML, CSS, JavaScript, images)</li>
              </ul>
            </section>

            <section>
              <h2 className="font-display text-2xl text-gold uppercase tracking-wider mb-4">3. How We Use Your Data</h2>
              <p className="mb-4">We use your data to:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Provide and maintain our static site hosting service</li>
                <li>Manage your account and provide customer support</li>
                <li>Improve our website and services</li>
                <li>Send you service-related notifications</li>
                <li>Ensure security and prevent fraud</li>
              </ul>
            </section>

            <section>
              <h2 className="font-display text-2xl text-gold uppercase tracking-wider mb-4">4. Data Storage and Security</h2>
              <p>
                Your uploaded files are stored securely on our servers. We implement appropriate technical and 
                organizational measures to protect your personal data against unauthorized access, alteration, 
                disclosure, or destruction. However, no method of transmission over the internet is 100% secure.
              </p>
            </section>

            <section>
              <h2 className="font-display text-2xl text-gold uppercase tracking-wider mb-4">5. Data Sharing</h2>
              <p>
                We do not sell your personal data. We may share your data with trusted third-party service providers 
                who assist us in operating our website, conducting our business, or servicing you, as long as those 
                parties agree to keep this information confidential.
              </p>
            </section>

            <section>
              <h2 className="font-display text-2xl text-gold uppercase tracking-wider mb-4">6. Your Rights</h2>
              <p className="mb-4">You have the right to:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Access your personal data</li>
                <li>Correct inaccurate data</li>
                <li>Request deletion of your data</li>
                <li>Object to processing of your data</li>
                <li>Request transfer of your data</li>
                <li>Withdraw consent at any time</li>
              </ul>
            </section>

            <section>
              <h2 className="font-display text-2xl text-gold uppercase tracking-wider mb-4">7. Cookies</h2>
              <p>
                We use cookies and similar tracking technologies to track activity on our service and store certain 
                information. You can instruct your browser to refuse all cookies or to indicate when a cookie is 
                being sent. See our <Link href="/cookies" className="text-gold hover:underline">Cookie Policy</Link> for more details.
              </p>
            </section>

            <section>
              <h2 className="font-display text-2xl text-gold uppercase tracking-wider mb-4">8. Third-Party Links</h2>
              <p>
                Our website may contain links to third-party websites. We have no control over and assume no 
                responsibility for the content, privacy policies, or practices of any third-party sites or services.
              </p>
            </section>

            <section>
              <h2 className="font-display text-2xl text-gold uppercase tracking-wider mb-4">9. Children's Privacy</h2>
              <p>
                Our service is not intended for children under 13 years of age. We do not knowingly collect 
                personal information from children under 13. If you are a parent or guardian and believe your 
                child has provided us with personal data, please contact us.
              </p>
            </section>

            <section>
              <h2 className="font-display text-2xl text-gold uppercase tracking-wider mb-4">10. Changes to This Policy</h2>
              <p>
                We may update our Privacy Policy from time to time. We will notify you of any changes by posting 
                the new Privacy Policy on this page and updating the "Last updated" date.
              </p>
            </section>

            <section>
              <h2 className="font-display text-2xl text-gold uppercase tracking-wider mb-4">11. Contact Us</h2>
              <p>
                If you have any questions about this Privacy Policy, please contact us at:{' '}
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
