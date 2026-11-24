import type { Metadata } from 'next';
import Script from 'next/script';
import { Plus_Jakarta_Sans, Inter, JetBrains_Mono, Playfair_Display, Cormorant_Garamond } from 'next/font/google';
import './globals.css';
import '../styles/starx-flow-stage.css';
import '../styles/starx-motion.css';
import '../styles/starx-lusion.css';
import '../cursor/cursor.css';
import { ClientShell } from '@/components/ClientShell';
import { SEO_CONFIG } from '@/lib/seoConfig';
import { Analytics } from '@vercel/analytics/next';
import { SpeedInsights } from '@vercel/speed-insights/next';

const cormorantGaramond = Cormorant_Garamond({
  subsets: ['latin'],
  variable: '--font-cormorant',
  weight: ['300', '400', '500', '600', '700'],
  display: 'swap',
});

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-jakarta',
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
  display: 'swap',
});

const playfairDisplay = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-serif',
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
      className={`dark scroll-smooth ${plusJakartaSans.variable} ${inter.variable} ${jetbrainsMono.variable} ${playfairDisplay.variable} ${cormorantGaramond.variable}`}
    >
      <head>
        <meta name="theme-color" content={SEO_CONFIG.themeColor} />
      </head>
      <body className="min-h-screen text-white font-sans overflow-x-hidden bg-[#030706] flex flex-col relative z-0 selection:bg-emerald-500/30">
        <ClientShell>{children}</ClientShell>
        <Analytics />
        <SpeedInsights />
        <Script
          id="fb-sdk-init"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              window.fbAsyncInit = function() {
                FB.init({
                  appId      : '${process.env.NEXT_PUBLIC_META_APP_ID || '2071113703608319'}',
                  cookie     : true,
                  xfbml      : true,
                  version    : 'v19.0'
                });
                FB.AppEvents.logPageView();

                FB.getLoginStatus(function(response) {
                  if (typeof window.statusChangeCallback === 'function') {
                    window.statusChangeCallback(response);
                  }
                });
              };

              window.checkLoginState = function() {
                if (window.FB) {
                  FB.getLoginStatus(function(response) {
                    if (typeof window.statusChangeCallback === 'function') {
                      window.statusChangeCallback(response);
                    }
                  });
                }
              };
            `,
          }}
        />
        <Script
          id="facebook-jssdk"
          strategy="afterInteractive"
          src="https://connect.facebook.net/en_US/sdk.js"
        />
      </body>
    </html>
  );
}
