import { Metadata } from 'next';
import { SEO_CONFIG, getCanonicalUrl } from '@/lib/seoConfig';
import { PrivacyClient } from './PrivacyClient';

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'StarX-Flow Privacy Policy. Learn how we handle data security, customer information, and HIPAA-compliant data encryption.',
  alternates: {
    canonical: getCanonicalUrl('/privacy'),
  },
  openGraph: {
    title: `Privacy Policy | ${SEO_CONFIG.siteName}`,
    description: 'StarX-Flow Privacy Policy. Learn how we handle data security, customer information, and HIPAA-compliant data encryption.',
    url: getCanonicalUrl('/privacy'),
    images: [
      {
        url: SEO_CONFIG.defaultOgImage,
        width: 1200,
        height: 630,
        alt: 'StarX-Flow Privacy Policy',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: `Privacy Policy | ${SEO_CONFIG.siteName}`,
    description: 'StarX-Flow Privacy Policy. Learn how we handle data security, customer information, and HIPAA-compliant data encryption.',
    images: [SEO_CONFIG.defaultOgImage],
  },
};

export default function PrivacyPage() {
  return <PrivacyClient />;
}
