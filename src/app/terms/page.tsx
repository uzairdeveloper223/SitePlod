'use client'

import { PageWrapper } from '@/components/siteplod/page-wrapper'
import { Header } from '@/components/siteplod/header'
import { Footer } from '@/components/siteplod/footer'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default function TermsAndConditions() {
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
            Terms and Conditions
          </h1>
          <p className="text-pewter mb-12">Last updated: February 19, 2026</p>

          <div className="space-y-8 text-champagne/90 leading-relaxed">
            <section>
              <h2 className="font-display text-2xl text-gold uppercase tracking-wider mb-4">1. Agreement to Terms</h2>
              <p>
                By accessing or using SitePlod, you agree to be bound by these Terms and Conditions. If you 
                disagree with any part of these terms, you may not access the service.
              </p>
            </section>

            <section>
              <h2 className="font-display text-2xl text-gold uppercase tracking-wider mb-4">2. Description of Service</h2>
              <p>
                SitePlod provides static website hosting services. Users can upload HTML, CSS, JavaScript, and 
                related assets to deploy static websites. We reserve the right to modify, suspend, or discontinue 
                the service at any time without notice.
              </p>
            </section>

            <section>
              <h2 className="font-display text-2xl text-gold uppercase tracking-wider mb-4">3. User Accounts</h2>
              <p className="mb-4">When you create an account with us, you must provide accurate and complete information. You are responsible for:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Maintaining the security of your account and password</li>
                <li>All activities that occur under your account</li>
                <li>Notifying us immediately of any unauthorized use</li>
              </ul>
            </section>

            <section>
              <h2 className="font-display text-2xl text-gold uppercase tracking-wider mb-4">4. Acceptable Use</h2>
              <p className="mb-4">You agree not to use SitePlod to:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Upload or distribute malicious code, viruses, or malware</li>
                <li>Host illegal, harmful, or offensive content</li>
                <li>Infringe on intellectual property rights of others</li>
                <li>Engage in phishing, spam, or fraudulent activities</li>
                <li>Violate any applicable laws or regulations</li>
                <li>Attempt to gain unauthorized access to our systems</li>
              </ul>
              <p className="mt-4">
                See our <Link href="/acceptable-use" className="text-gold hover:underline">Acceptable Use Policy</Link> for more details.
              </p>
            </section>

            <section>
              <h2 className="font-display text-2xl text-gold uppercase tracking-wider mb-4">5. Content Ownership</h2>
              <p>
                You retain all rights to the content you upload to SitePlod. By uploading content, you grant us 
                a license to store, display, and distribute your content as necessary to provide the service. 
                You represent that you have all necessary rights to the content you upload.
              </p>
            </section>

            <section>
              <h2 className="font-display text-2xl text-gold uppercase tracking-wider mb-4">6. Free Service Limitations</h2>
              <p className="mb-4">Our free tier includes:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Unlimited static site deployments</li>
                <li>Reasonable bandwidth and storage limits</li>
                <li>Best-effort uptime (no SLA guarantee)</li>
              </ul>
              <p className="mt-4">
                We reserve the right to impose reasonable limits on resource usage to ensure fair access for all users.
              </p>
            </section>

            <section>
              <h2 className="font-display text-2xl text-gold uppercase tracking-wider mb-4">7. Content Removal</h2>
              <p>
                We reserve the right to remove any content that violates these terms, our Acceptable Use Policy, 
                or applicable laws. We may suspend or terminate accounts that repeatedly violate our policies.
              </p>
            </section>

            <section>
              <h2 className="font-display text-2xl text-gold uppercase tracking-wider mb-4">8. Disclaimer of Warranties</h2>
              <p>
                The service is provided "as is" and "as available" without warranties of any kind, either express 
                or implied. We do not warrant that the service will be uninterrupted, secure, or error-free.
              </p>
            </section>

            <section>
              <h2 className="font-display text-2xl text-gold uppercase tracking-wider mb-4">9. Limitation of Liability</h2>
              <p>
                To the maximum extent permitted by law, SitePlod shall not be liable for any indirect, incidental, 
                special, consequential, or punitive damages, or any loss of profits or revenues, whether incurred 
                directly or indirectly, or any loss of data, use, goodwill, or other intangible losses.
              </p>
            </section>

            <section>
              <h2 className="font-display text-2xl text-gold uppercase tracking-wider mb-4">10. Indemnification</h2>
              <p>
                You agree to indemnify and hold harmless SitePlod from any claims, damages, losses, liabilities, 
                and expenses arising from your use of the service or violation of these terms.
              </p>
            </section>

            <section>
              <h2 className="font-display text-2xl text-gold uppercase tracking-wider mb-4">11. Termination</h2>
              <p>
                We may terminate or suspend your account and access to the service immediately, without prior 
                notice, for any reason, including breach of these Terms. Upon termination, your right to use 
                the service will immediately cease.
              </p>
            </section>

            <section>
              <h2 className="font-display text-2xl text-gold uppercase tracking-wider mb-4">12. Changes to Terms</h2>
              <p>
                We reserve the right to modify these terms at any time. We will notify users of any material 
                changes by posting the new terms on this page. Your continued use of the service after changes 
                constitutes acceptance of the new terms.
              </p>
            </section>

            <section>
              <h2 className="font-display text-2xl text-gold uppercase tracking-wider mb-4">13. Governing Law</h2>
              <p>
                These Terms shall be governed by and construed in accordance with applicable laws, without 
                regard to conflict of law provisions.
              </p>
            </section>

            <section>
              <h2 className="font-display text-2xl text-gold uppercase tracking-wider mb-4">14. Contact Us</h2>
              <p>
                If you have any questions about these Terms, please contact us at:{' '}
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
