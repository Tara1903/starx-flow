# STARX-FLOW — PHASE 6.2: POLAR CHECKOUT IMPLEMENTATION SPECIFICATION

**Audit Date:** 2026-11-10  
**Milestone:** Phase 6.2 — Stage C  
**Lead Engineer:** Principal SaaS Billing Architect & Senior Backend Engineer  
**Component:** `src/app/api/billing/checkout/route.ts` & `src/store/billingStore.ts`  

---

## 1. Architectural Overview & Workflow

StarX-Flow replaces legacy Stripe checkout sessions with Polar's hosted Merchant of Record checkout engine using `@polar-sh/sdk/2026-10`.

```
Customer Selects Plan on Pricing or Dashboard
                      │
                      ▼
Authenticated POST Request to `/api/billing/checkout`
  - Validates Supabase JWT Session Token
  - Verifies Tenant & Organization Membership
  - Resolves Plan server-side (preventing price tampering)
                      │
                      ▼
Polar SDK Client Invocation (`polar.checkouts.create`)
  - Products: `[POLAR_PLANS[planId].productId]`
  - External Customer ID: `user.id`
  - Customer Email: `user.email`
  - Client IP: Extracted from request headers
  - Metadata: `{ user_id, plan_id, tenant_id }`
  - Return URL: `${appUrl}/dashboard?billing=cancelled`
  - Success URL: `${appUrl}/dashboard?payment=success&checkout_id={CHECKOUT_ID}`
                      │
                      ▼
Redirect Browser to Polar Hosted Checkout Page
                      │
                      ▼
Customer Completes Payment on Polar
  - Polar handles sales tax (VAT/GST/Sales Tax), payment methods, fraud scoring
  - Webhook confirms payment asynchronously
```

---

## 2. Security & Anti-Abuse Controls

| Security Dimension | Implementation Standard | Defense Verification |
|---|---|---|
| **Authentication Barrier** | Rejects unauthenticated requests with `HTTP 401`. | Validated in automated test suite. |
| **Server-Side Pricing** | Product IDs and amounts are resolved strictly from server-side configuration (`POLAR_PLANS`). | Clients cannot submit arbitrary prices or currencies. |
| **Tenant Ownership** | Queries `organization_members` to bind `tenant_id` into session metadata. | Prevents cross-tenant billing attribution. |
| **External ID Binding** | Passes `external_customer_id = user.id`. | Links the Polar customer directly to StarX-Flow account. |
| **No Premature Entitlements**| The return URL redirect grants zero permissions. | Paid entitlements are strictly gated behind verified webhooks. |

---

## 3. Server-Side Route Implementation

```typescript
// src/app/api/billing/checkout/route.ts
import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { polar, POLAR_PLANS } from '@/lib/polar';

export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized: missing authorization header' }, { status: 401 });
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authErr } = await supabaseAdmin.auth.getUser(token);
    if (authErr || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { planId } = body;

    if (!planId || !(planId in POLAR_PLANS)) {
      return NextResponse.json(
        { error: 'Invalid plan selected. Must be one of: starter, pro, enterprise' },
        { status: 400 }
      );
    }

    const planConfig = POLAR_PLANS[planId as keyof typeof POLAR_PLANS];
    const appUrl = (process.env.APP_URL || process.env.NEXT_PUBLIC_APP_URL || 'https://starx-flow.runs-on.dev').replace(/\/+$/, '');
    const ipAddress = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? undefined;

    const checkout = await polar.checkouts.create({
      products: [planConfig.productId],
      external_customer_id: user.id,
      customer_email: user.email || undefined,
      customer_ip_address: ipAddress,
      metadata: {
        user_id: user.id,
        plan_id: planId,
      },
      return_url: `${appUrl}/dashboard?billing=cancelled`,
      success_url: `${appUrl}/dashboard?payment=success&checkout_id={CHECKOUT_ID}`,
    });

    return NextResponse.json({ url: checkout.url, checkoutId: checkout.id });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to initiate Polar checkout' }, { status: 500 });
  }
}
```
