'use client'

import { PageWrapper } from '@/components/siteplod/page-wrapper'
import { Header } from '@/components/siteplod/header'
import { Footer } from '@/components/siteplod/footer'
import { ArrowLeft, FileCode2, Link2, Upload, Terminal } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default function DocsPage() {
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
                        Documentation
                    </h1>
                    <p className="text-pewter mb-12">Learn how to deploy and manage your sites with SitePlod.</p>

                    <div className="space-y-12 text-champagne/90 leading-relaxed">

                        {/* Quick Start Chapter */}
                        <section>
                            <h2 className="font-display text-2xl text-gold uppercase tracking-wider mb-6 flex items-center gap-3">
                                <Upload className="w-6 h-6" /> Quick Start Guide
                            </h2>

                            <div className="space-y-6">
                                <div className="bg-charcoal/50 border border-gold/20 p-6">
                                    <h3 className="font-display text-xl text-gold mb-3">1. Uploading a Single HTML File</h3>
                                    <p className="mb-3 text-sm">
                                        The simplest way to use SitePlod is to upload a single <code>.html</code> file.
                                        Simply drag and drop your file into the upload zone or click to select it from your computer.
                                        SitePlod will instantly process it and provide you with a live URL.
                                    </p>
                                </div>

                                <div className="bg-charcoal/50 border border-gold/20 p-6">
                                    <h3 className="font-display text-xl text-gold mb-3">2. Uploading a ZIP Archive</h3>
                                    <p className="mb-3 text-sm">
                                        If your website consists of multiple files (e.g., an <code>index.html</code> alongside a <code>css/</code> or <code>js/</code> folder), you should package them into a ZIP archive.
                                    </p>
                                    <ul className="list-disc list-inside space-y-2 text-sm text-pewter ml-4">
                                        <li>Ensure your main file is named <code>index.html</code>.</li>
                                        <li>SitePlod automatically filters out macOS junk files (like <code>.DS_Store</code>) during extraction.</li>
                                        <li>We will automatically substitute all your local URLs (like <code>&lt;link href="style.css"&gt;</code>) with globally hosted equivalents to make sure your site renders correctly.</li>
                                    </ul>
                                </div>
                            </div>
                        </section>

                        {/* Asset Hosting Chapter */}
                        <section>
                            <h2 className="font-display text-2xl text-gold uppercase tracking-wider mb-6 flex items-center gap-3">
                                <Link2 className="w-6 h-6" /> How Asset Hosting Works
                            </h2>
                            <div className="bg-charcoal/50 border border-gold/20 p-8 space-y-4">
                                <p>
                                    SitePlod isn't just a static file server. It employs a distributed edge architecture for your files:
                                </p>
                                <div className="grid md:grid-cols-2 gap-6 mt-6">
                                    <div>
                                        <h4 className="font-bold text-gold mb-2">Images</h4>
                                        <p className="text-sm text-pewter">
                                            Any `.png`, `.jpg`, `.svg`, or `.gif` files found in your ZIP archive or referenced in your HTML are securely uploaded to a robust Image CDN (ImgBB) to serve your media globally at lightning speed.
                                        </p>
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-gold mb-2">Styles and Scripts</h4>
                                        <p className="text-sm text-pewter">
                                            Your `.css` and `.js` files are uploaded to our text-storage backend. When your HTML requests them, SitePlod runs a proxy route to serve them dynamically with the correct MIME Types to bypass browser security restrictions.
                                        </p>
                                    </div>
                                </div>
                                <div className="mt-6 p-4 border border-gold/10 bg-obsidian/50 rounded text-sm">
                                    <strong className="text-gold">Note:</strong> SitePlod does not support video file hosting. Please host your videos externally.
                                </div>
                            </div>
                        </section>

                        {/* API Proxy / Internal Handling */}
                        <section>
                            <h2 className="font-display text-2xl text-gold uppercase tracking-wider mb-6 flex items-center gap-3">
                                <FileCode2 className="w-6 h-6" /> Updating Code In-Browser
                            </h2>
                            <p className="mb-4">
                                Need to make a quick fix? You don't have to re-upload your entire ZIP!
                            </p>
                            <div className="bg-charcoal/50 border border-gold/20 p-6 text-sm">
                                <ol className="list-decimal list-inside space-y-3 text-pewter">
                                    <li>Navigate to your dashboard and find your newly deployed site.</li>
                                    <li>Click on the <strong>Edit Code</strong> button.</li>
                                    <li>Select the file you want to edit from the sidebar (e.g., <code>index.html</code>).</li>
                                    <li>Make your changes within the live IDE.</li>
                                    <li>Hit Save! Your changes are instantly synchronized to the global CDN.</li>
                                </ol>
                            </div>
                        </section>

                        {/* CLI Chapter */}
                        <section>
                            <h2 className="font-display text-2xl text-gold uppercase tracking-wider mb-6 flex items-center gap-3">
                                <Terminal className="w-6 h-6" /> CLI Integration
                            </h2>
                            <div className="bg-charcoal/50 border border-gold/20 p-6 flex flex-col md:flex-row items-center gap-6">
                                <div className="w-16 h-16 bg-obsidian border border-gold/30 flex items-center justify-center shrink-0">
                                    <span className="font-mono text-gold text-2xl">$</span>
                                </div>
                                <div>
                                    <h3 className="text-xl text-gold mb-2">CLI Tool is Coming Soon!</h3>
                                    <p className="text-sm text-pewter">
                                        Want to bypass the web interface? We are building a Command Line Interface (CLI) that will let you deploy folders directly from your terminal by simply typing <code>siteplod deploy ./my-site</code>. Stay tuned!
                                    </p>
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
