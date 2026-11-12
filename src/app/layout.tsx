import type { Metadata } from 'next';
import { Plus_Jakarta_Sans, Inter, JetBrains_Mono } from 'next/font/google';
import './globals.css';
import '../cursor/cursor.css';
import { ClientShell } from '@/components/ClientShell';
import { SEO_CONFIG } from '@/lib/seoConfig';
import { Analytics } from '@vercel/analytics/next';
import { SpeedInsights } from '@vercel/speed-insights/next';

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-jakarta',
  weight: ['500', '600', '700', '800'],
  display: 'swap',
});

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  weight: ['400', '500', '600', '700'],
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  weight: ['400', '500', '600', '700'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    template: `%s | ${SEO_CONFIG.siteName}`,
    default: SEO_CONFIG.siteName,
  },
  description: SEO_CONFIG.defaultDescription,
  metadataBase: new URL(SEO_CONFIG.siteUrl),
  openGraph: {
    title: SEO_CONFIG.siteName,
    description: SEO_CONFIG.defaultDescription,
    url: SEO_CONFIG.siteUrl,
    siteName: SEO_CONFIG.siteName,
    images: [
      {
        url: SEO_CONFIG.defaultOgImage,
        width: 1200,
        height: 630,
        alt: SEO_CONFIG.siteName,
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: SEO_CONFIG.siteName,
    description: SEO_CONFIG.defaultDescription,
    creator: SEO_CONFIG.twitterHandle,
    images: [SEO_CONFIG.defaultOgImage],
  },
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION || undefined,
    other: {
      ...(process.env.NEXT_PUBLIC_BING_SITE_VERIFICATION ? { 'msvalidate.01': process.env.NEXT_PUBLIC_BING_SITE_VERIFICATION } : {}),
    },
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`dark scroll-smooth ${plusJakartaSans.variable} ${inter.variable} ${jetbrainsMono.variable}`}
    >
      <head>
        <meta name="theme-color" content={SEO_CONFIG.themeColor} />
      </head>
      <body className="min-h-screen text-white font-sans overflow-x-hidden bg-[#030706] flex flex-col relative z-0 selection:bg-emerald-500/30">
        <ClientShell>{children}</ClientShell>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
