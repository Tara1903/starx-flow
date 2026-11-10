import { createPolar, type Environment } from '@polar-sh/sdk/2026-10';

const accessToken = process.env.POLAR_ACCESS_TOKEN;

// Construct a single SDK client and reuse it across routes, reading environment from POLAR_SERVER
export const polar = createPolar({
  accessToken: accessToken ?? '',
  environment: (process.env.POLAR_SERVER as Environment | undefined) || 'production',
});

// Production Polar Product and Plan Mappings
export const POLAR_PLANS = {
  starter: {
    planId: 'starter',
    name: 'Starter Plan',
    productId: process.env.POLAR_PRODUCT_STARTER || 'e5050fd1-5a76-4bd4-ab60-b5706f6dd11f',
    priceAmount: 29,
    currency: 'USD',
    interval: 'month',
  },
  pro: {
    planId: 'pro',
    name: 'Pro Plan',
    productId: process.env.POLAR_PRODUCT_PRO || '350dca5f-0c97-45b8-8a75-e1aa506a8d14',
    priceAmount: 59,
    currency: 'USD',
    interval: 'month',
  },
  enterprise: {
    planId: 'enterprise',
    name: 'Enterprise Plan',
    productId: process.env.POLAR_PRODUCT_ENTERPRISE || 'b2cf5d17-2199-4c33-a1f6-a0b7e4d608e4',
    priceAmount: 99,
    currency: 'USD',
    interval: 'month',
  },
} as const;

// Product ID to internal Plan ID reverse lookup
export const POLAR_PRODUCT_TO_PLAN: Record<string, string> = {
  [process.env.POLAR_PRODUCT_STARTER || 'e5050fd1-5a76-4bd4-ab60-b5706f6dd11f']: 'starter',
  [process.env.POLAR_PRODUCT_PRO || '350dca5f-0c97-45b8-8a75-e1aa506a8d14']: 'pro',
  [process.env.POLAR_PRODUCT_ENTERPRISE || 'b2cf5d17-2199-4c33-a1f6-a0b7e4d608e4']: 'enterprise',
  '9c8e2e35-d2ea-4b54-a9d4-70ca3f4c786b': 'starter', // Test product fallback
};
