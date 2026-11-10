# Polar Payments Integration Setup Guide

## 1. Overview
Polar (https://polar.sh) has been integrated as the primary payment and checkout infrastructure for **StarX-Flow**, replacing legacy payment providers.

- **Organization Name:** `starx-flow`
- **Organization ID:** `da40c339-3d25-4754-b2b5-7a1c31c161e7`
- **Environment:** `production` (Live Production Environment)
- **Dashboard:** [https://polar.sh/dashboard/starx-flow](https://polar.sh/dashboard/starx-flow)
- **API Base:** `https://api.polar.sh`

---

## 2. Files Created & Modified

| File | Action | Purpose |
|---|---|---|
| `src/lib/polar.ts` | **Created** | Shared Polar SDK client using `@polar-sh/sdk/2026-10`. Automatically reads server environment from `POLAR_SERVER`. |
| `src/app/checkout/route.ts` | **Created** | GET route handler driven by `?products=<id>`. Creates a Polar checkout session and redirects to Polar's hosted checkout page. |
| `src/app/api/webhook/polar/route.ts` | **Created** | POST route handler that validates standard Polar webhook signatures (`webhook-id`, `webhook-timestamp`, `webhook-signature`) using `webhooks.validateEvent` against `POLAR_WEBHOOK_SECRET`. Handles `order.paid` and `customer.state_changed`. |
| `package.json` / `package-lock.json` | **Updated** | Added official `@polar-sh/sdk` dependency. |
| `.env` | **Updated** | Configured required Polar environment variable keys. |

---

## 3. Environment Variable Keys (Names Only)

The following keys have been configured in `.env` (values remain strictly secret and redacted):

- `POLAR_ACCESS_TOKEN`: Organization access token with read/write scopes for products, checkouts, and webhooks.
- `POLAR_WEBHOOK_SECRET`: Secret used by the webhook route to verify HMAC payload authenticity.
- `POLAR_SERVER`: Configured to `production`.

---

## 4. Provisioned Resources

| Resource | Identifier / Name | Details |
|---|---|---|
| **Test Product** | `9c8e2e35-d2ea-4b54-a9d4-70ca3f4c786b` | "Test Product" — $10.00 USD fixed one-time price. |
| **Webhook Endpoint** | `ad9f77dc-5750-41ea-bac5-5238103751cf` | Registered to `https://starx-flow.runs-on.dev/api/webhook/polar` (`raw` format). Subscribed to order and customer state events. |
| **Test Discount Code** | `TEST100` (`943bbfcf-e015-4eab-a362-1d8d823db02e`) | 100% discount code for testing end-to-end checkout without a real charge. |

---

## 5. Verify-Before-Merging Checklist

- [x] `@polar-sh/sdk` installed directly without deprecated framework adapters.
- [x] `.env` is covered by `.gitignore` (verified).
- [x] Single client exported from `src/lib/polar.ts` and reused across routes.
- [x] `/checkout` route validates `products` query parameter and redirects to Polar checkout URL without custom confirmation pages.
- [x] `/api/webhook/polar` validates raw body against `POLAR_WEBHOOK_SECRET` before dispatching events.
- [x] TypeScript typechecking passed cleanly (`npm run typecheck`).
- [x] Next.js production build succeeded (`npm run build`).
- [ ] Add `POLAR_ACCESS_TOKEN`, `POLAR_WEBHOOK_SECRET`, and `POLAR_SERVER=production` into Vercel Project Environment Variables before deploying to production.

---

## 6. Hosted Customer Portal
Polar provides an out-of-the-box, hosted customer portal. Polar automatically emails customers a direct access link to manage their subscriptions, invoices, and payment methods with every purchase confirmation receipt. No custom application code or portal route is required.

---

## 7. Production Environment Notice
> [!IMPORTANT]
> This integration connects to the live **production** environment of Polar. Real card transactions will process actual payments unless a discount code is applied. To test end-to-end without real charges, enter the discount code **`TEST100`** during checkout.
