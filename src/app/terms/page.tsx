import { Metadata } from 'next';
import { SEO_CONFIG, getCanonicalUrl } from '@/lib/seoConfig';
import { TermsClient } from './TermsClient';

export const metadata: Metadata = {
  title: 'Terms of Service',
  description: 'StarX-Flow Terms of Service and End User License Agreement. Review terms governing usage of our AI receptionist platform.',
  alternates: {
    canonical: getCanonicalUrl('/terms'),
  },
  openGraph: {
    title: `Terms of Service | ${SEO_CONFIG.siteName}`,
    description: 'StarX-Flow Terms of Service and End User License Agreement. Review terms governing usage of our AI receptionist platform.',
    url: getCanonicalUrl('/terms'),
    images: [
      {
        url: SEO_CONFIG.defaultOgImage,
        width: 1200,
        height: 630,
        alt: 'StarX-Flow Terms of Service',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: `Terms of Service | ${SEO_CONFIG.siteName}`,
    description: 'StarX-Flow Terms of Service and End User License Agreement. Review terms governing usage of our AI receptionist platform.',
    images: [SEO_CONFIG.defaultOgImage],
  },
};

export default function TermsPage() {
  return <TermsClient />;
}
