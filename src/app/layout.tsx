import type { Metadata } from "next";
import { Josefin_Sans } from "next/font/google";
import { Marcellus } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";

const josefinSans = Josefin_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

const marcellus = Marcellus({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["400"],
});

export const metadata: Metadata = {
  title: "SitePlod - Deploy Static Sites in Seconds",
  description: "Upload your HTML, CSS, and JS files and deploy them instantly. Free static site hosting with managed dashboards and custom URLs. Art Deco elegance meets modern deployment.",
  keywords: ["SitePlod", "static site hosting", "free hosting", "HTML hosting", "static deployment", "no backend", "instant deploy", "Art Deco"],
  authors: [{ name: "SitePlod Team" }],
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/favicon.ico",
  },
  openGraph: {
    title: "SitePlod - Deploy Static Sites in Seconds",
    description: "Upload your HTML, CSS, and JS files and deploy them instantly. Free static site hosting with custom URLs.",
    url: "https://siteplod.com",
    siteName: "SitePlod",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "SitePlod - Deploy Static Sites in Seconds",
    description: "Upload your HTML, CSS, and JS files and deploy them instantly. Free static site hosting.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body
        className={`${josefinSans.variable} ${marcellus.variable} font-sans antialiased bg-obsidian text-champagne min-h-screen`}
      >
        <div className="art-deco-pattern grain-overlay min-h-screen relative">
          {children}
        </div>
        <Toaster />
      </body>
    </html>
  );
}
