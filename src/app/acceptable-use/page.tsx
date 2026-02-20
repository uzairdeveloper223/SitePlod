'use client'

import { PageWrapper } from '@/components/siteplod/page-wrapper'
import { Header } from '@/components/siteplod/header'
import { Footer } from '@/components/siteplod/footer'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default function AcceptableUsePolicy() {
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
            Acceptable Use Policy
          </h1>
          <p className="text-pewter mb-12">Last updated: February 19, 2026</p>

          <div className="space-y-8 text-champagne/90 leading-relaxed">
            <section>
              <h2 className="font-display text-2xl text-gold uppercase tracking-wider mb-4">1. Purpose</h2>
              <p>
                This Acceptable Use Policy outlines the prohibited uses of SitePlod's services. By using our 
                platform, you agree to comply with this policy. Violations may result in suspension or termination 
                of your account.
              </p>
            </section>

            <section>
              <h2 className="font-display text-2xl text-gold uppercase tracking-wider mb-4">2. Prohibited Content</h2>
              <p className="mb-4">You may not upload, host, or distribute content that:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Is illegal, harmful, threatening, abusive, harassing, or defamatory</li>
                <li>Infringes on intellectual property rights or proprietary rights of others</li>
                <li>Contains malware, viruses, trojans, or other malicious code</li>
                <li>Promotes violence, discrimination, or hatred against individuals or groups</li>
                <li>Contains adult content, pornography, or sexually explicit material</li>
                <li>Exploits or harms minors in any way</li>
                <li>Violates privacy rights or discloses personal information without consent</li>
                <li>Contains spam, phishing attempts, or fraudulent schemes</li>
                <li>Impersonates any person or entity or misrepresents your affiliation</li>
              </ul>
            </section>

            <section>
              <h2 className="font-display text-2xl text-gold uppercase tracking-wider mb-4">3. Prohibited Activities</h2>
              <p className="mb-4">You may not use SitePlod to:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Attempt to gain unauthorized access to our systems or other users' accounts</li>
                <li>Interfere with or disrupt the service or servers</li>
                <li>Use automated systems (bots, scrapers) without permission</li>
                <li>Engage in any activity that could damage, disable, or impair the service</li>
                <li>Circumvent any security features or access controls</li>
                <li>Probe, scan, or test the vulnerability of our systems</li>
                <li>Reverse engineer or attempt to extract source code</li>
                <li>Use the service for cryptocurrency mining</li>
                <li>Host proxy services or VPN endpoints</li>
                <li>Engage in denial-of-service attacks or similar activities</li>
              </ul>
            </section>

            <section>
              <h2 className="font-display text-2xl text-gold uppercase tracking-wider mb-4">4. Intellectual Property</h2>
              <p>
                You must respect intellectual property rights. Only upload content that you own or have permission 
                to use. Do not upload copyrighted material, trademarks, or other proprietary content without 
                proper authorization.
              </p>
            </section>

            <section>
              <h2 className="font-display text-2xl text-gold uppercase tracking-wider mb-4">5. Resource Usage</h2>
              <p className="mb-4">You agree to use resources fairly and reasonably:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Do not consume excessive bandwidth or storage</li>
                <li>Do not host large file downloads or streaming services</li>
                <li>Do not use the service as a CDN for external websites</li>
                <li>Do not create an unreasonable number of sites to circumvent limits</li>
              </ul>
            </section>

            <section>
              <h2 className="font-display text-2xl text-gold uppercase tracking-wider mb-4">6. Compliance with Laws</h2>
              <p>
                You must comply with all applicable local, state, national, and international laws and regulations. 
                This includes but is not limited to laws regarding data protection, privacy, intellectual property, 
                and online conduct.
              </p>
            </section>

            <section>
              <h2 className="font-display text-2xl text-gold uppercase tracking-wider mb-4">7. User-Generated Content</h2>
              <p>
                While we host your static sites, you are solely responsible for the content you upload. We do not 
                pre-screen content but reserve the right to review and remove content that violates this policy.
              </p>
            </section>

            <section>
              <h2 className="font-display text-2xl text-gold uppercase tracking-wider mb-4">8. Reporting Violations</h2>
              <p className="mb-4">
                If you become aware of any content or activity that violates this policy, please report it to us 
                immediately at:{' '}
                <a href="mailto:contact@uzair.is-a.dev" className="text-gold hover:underline">
                  contact@uzair.is-a.dev
                </a>
              </p>
              <p>Please include:</p>
              <ul className="list-disc list-inside space-y-2 ml-4 mt-2">
                <li>URL of the offending content</li>
                <li>Description of the violation</li>
                <li>Any relevant evidence or documentation</li>
              </ul>
            </section>

            <section>
              <h2 className="font-display text-2xl text-gold uppercase tracking-wider mb-4">9. Enforcement</h2>
              <p className="mb-4">Violations of this policy may result in:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Warning and request to remove violating content</li>
                <li>Temporary suspension of your account</li>
                <li>Permanent termination of your account</li>
                <li>Removal of all your hosted content</li>
                <li>Legal action if required by law</li>
              </ul>
              <p className="mt-4">
                We reserve the right to take action at our sole discretion without prior notice.
              </p>
            </section>

            <section>
              <h2 className="font-display text-2xl text-gold uppercase tracking-wider mb-4">10. DMCA and Copyright</h2>
              <p>
                We respect intellectual property rights and respond to valid DMCA takedown notices. If you believe 
                your copyright has been infringed, please contact our designated agent at:{' '}
                <a href="mailto:contact@uzair.is-a.dev" className="text-gold hover:underline">
                  contact@uzair.is-a.dev
                </a>
              </p>
            </section>

            <section>
              <h2 className="font-display text-2xl text-gold uppercase tracking-wider mb-4">11. No Liability</h2>
              <p>
                We are not responsible for user-generated content hosted on our platform. Users are solely 
                responsible for their content and any consequences arising from it.
              </p>
            </section>

            <section>
              <h2 className="font-display text-2xl text-gold uppercase tracking-wider mb-4">12. Changes to This Policy</h2>
              <p>
                We may update this Acceptable Use Policy at any time. Continued use of the service after changes 
                constitutes acceptance of the updated policy.
              </p>
            </section>

            <section>
              <h2 className="font-display text-2xl text-gold uppercase tracking-wider mb-4">13. Contact Us</h2>
              <p>
                If you have questions about this policy, please contact us at:{' '}
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
