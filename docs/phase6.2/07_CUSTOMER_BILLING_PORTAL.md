# STARX-FLOW — PHASE 6.2: POLAR CUSTOMER BILLING PORTAL INTEGRATION

**Audit Date:** 2026-11-10  
**Milestone:** Phase 6.2 — Stage G  
**Lead Engineer:** Senior Full-Stack Engineer & Billing Architect  
**Components:** `src/app/api/billing/portal/route.ts`, `src/screens/dashboard/SettingsSection.tsx`, `src/store/billingStore.ts`  

---

## 1. Overview & Capability Set

Polar provides a fully managed, hosted Customer Portal as part of its Merchant of Record service. StarX-Flow integrates this portal directly into the customer dashboard settings, allowing authenticated customers to manage their billing without requiring StarX-Flow to store credit cards, handle PCI-DSS compliance, or generate PDF receipts.

Through the Polar Customer Portal, customers can:
- View active subscriptions, billing intervals, and renewal dates.
- Download compliant tax invoices and receipts with VAT/GST breakdown.
- Add, update, or remove credit cards and digital payment methods.
- Cancel subscription renewals or resume paused subscriptions.

---

## 2. Authenticated Portal Route Implementation

```typescript
// src/app/api/billing/portal/route.ts
import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { polar } from '@/lib/polar';

export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized: missing token' }, { status: 401 });
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authErr } = await supabaseAdmin.auth.getUser(token);
    if (authErr || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const appUrl = (process.env.APP_URL || process.env.NEXT_PUBLIC_APP_URL || 'https://starx-flow.runs-on.dev').replace(/\/+$/, '');

    try {
      const session = await polar.customerSessions.create({
        external_customer_id: user.id,
        return_url: `${appUrl}/dashboard`,
      });

      return NextResponse.json({ url: session.customer_portal_url });
    } catch (portalErr: any) {
      if (portalErr.status === 404 || portalErr.status === 422 || portalErr.message?.includes('not found')) {
        return NextResponse.json(
          { error: 'No active billing record found in Polar yet. Please subscribe to a plan first.' },
          { status: 404 }
        );
      }
      throw portalErr;
    }
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to open customer billing portal' }, { status: 500 });
  }
}
```

---

## 3. Frontend Dashboard Integration

In `src/screens/dashboard/SettingsSection.tsx`, the Subscription Plan card now features direct action triggers:

1. **"Manage Invoices & Billing" Button:** Calls `useBillingStore.getState().openCustomerPortal()`, which securely requests a short-lived customer portal session and redirects the browser to Polar's portal.
2. **"Upgrade to Pro ($59/mo)" / "Upgrade to Enterprise ($99/mo)" Buttons:** Calls `createPolarCheckout(planId)`, creating a direct checkout session for fast upgrades.
3. **Graceful Feedback:** If a trial user without previous purchases clicks the portal button, an informative alert indicates they must select a plan before an invoice portal is generated.
