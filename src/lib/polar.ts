import { createPolar, type Environment } from '@polar-sh/sdk/2026-10';
import { POLAR_PRODUCT_IDS, CANONICAL_PLANS, normalizePlanId } from './plans';

const accessToken = process.env.POLAR_ACCESS_TOKEN;

// Construct a single SDK client and reuse it across routes, reading environment from POLAR_SERVER
export const polar = createPolar({
  accessToken: accessToken ?? '',
  environment: (process.env.POLAR_SERVER as Environment | undefined) || 'production',
});

// Production Polar Product and Plan Mappings aligned with Canonical Plans
export const POLAR_PLANS = {
  starter: {
    planId: 'starter',
    name: CANONICAL_PLANS.starter.name,
    productId: POLAR_PRODUCT_IDS.starter,
    priceAmount: CANONICAL_PLANS.starter.price,
    currency: 'USD',
    interval: 'month',
  },
  growth: {
    planId: 'growth',
    name: CANONICAL_PLANS.growth.name,
    productId: POLAR_PRODUCT_IDS.growth,
    priceAmount: CANONICAL_PLANS.growth.price,
    currency: 'USD',
    interval: 'month',
  },
  pro: {
    planId: 'pro',
    name: CANONICAL_PLANS.pro.name,
    productId: POLAR_PRODUCT_IDS.pro,
    priceAmount: CANONICAL_PLANS.pro.price,
    currency: 'USD',
    interval: 'month',
  },
  // Backwards compatibility alias for legacy references
  enterprise: {
    planId: 'pro',
    name: CANONICAL_PLANS.pro.name,
    productId: POLAR_PRODUCT_IDS.pro,
    priceAmount: CANONICAL_PLANS.pro.price,
    currency: 'USD',
    interval: 'month',
  },
} as const;

// Product ID to internal Plan ID reverse lookup
export const POLAR_PRODUCT_TO_PLAN: Record<string, string> = {
  [POLAR_PRODUCT_IDS.starter]: 'starter',
  [POLAR_PRODUCT_IDS.growth]: 'growth',
  [POLAR_PRODUCT_IDS.pro]: 'pro',
  '9c8e2e35-d2ea-4b54-a9d4-70ca3f4c786b': 'starter', // Test product fallback
};

// Ensure any custom env vars are also populated in reverse lookup
if (process.env.POLAR_PRODUCT_STARTER) {
  POLAR_PRODUCT_TO_PLAN[process.env.POLAR_PRODUCT_STARTER] = 'starter';
}
if (process.env.POLAR_PRODUCT_GROWTH) {
  POLAR_PRODUCT_TO_PLAN[process.env.POLAR_PRODUCT_GROWTH] = 'growth';
}
if (process.env.POLAR_PRODUCT_PRO) {
  // If POLAR_PRODUCT_PRO was set to the Growth product in legacy envs, maintain mapping
  POLAR_PRODUCT_TO_PLAN[process.env.POLAR_PRODUCT_PRO] = 'growth';
}
if (process.env.POLAR_PRODUCT_PRO_TIER) {
  POLAR_PRODUCT_TO_PLAN[process.env.POLAR_PRODUCT_PRO_TIER] = 'pro';
}
if (process.env.POLAR_PRODUCT_ENTERPRISE) {
  POLAR_PRODUCT_TO_PLAN[process.env.POLAR_PRODUCT_ENTERPRISE] = 'pro';
}

export { normalizePlanId };
