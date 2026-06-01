import type { Metadata } from 'next';
import './globals.css';
import { ClientShell } from '@/components/ClientShell';
import { SEO_CONFIG } from '@/lib/seoConfig';

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
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark scroll-smooth">
      <head>
        <meta name="theme-color" content={SEO_CONFIG.themeColor} />
      </head>
      <body className="min-h-screen text-white font-sans overflow-x-hidden bg-black flex flex-col relative z-0 selection:bg-emerald-500/30">
        <ClientShell>{children}</ClientShell>
      </body>
    </html>
  );
}
