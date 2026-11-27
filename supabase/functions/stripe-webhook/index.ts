import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0";

/* ──────────────────────────────────────────────
   HELPERS
   ────────────────────────────────────────────── */

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, stripe-signature",
};

/** Constant-time string comparison for HMAC hex digests. */
function timingSafeEqualHex(a: string, b: string): boolean {
  const enc = new TextEncoder();
  const ab = enc.encode(a.toLowerCase());
  const bb = enc.encode(b.toLowerCase());
  if (ab.length !== bb.length) return false;
  let diff = 0;
  for (let i = 0; i < ab.length; i++) {
    diff |= ab[i] ^ bb[i];
  }
  return diff === 0;
}

/** Verify Stripe webhook signature using Web Crypto API (Deno-compatible). */
async function verifyStripeSignature(
  payload: string,
  sigHeader: string,
  secret: string,
  toleranceSec = 300
): Promise<boolean> {
  const parts = sigHeader.split(",").reduce(
    (acc, part) => {
      const [key, val] = part.split("=");
      if (key === "t") acc.timestamp = val;
      if (key === "v1") acc.signatures.push(val);
      return acc;
    },
    { timestamp: "", signatures: [] as string[] }
  );

  if (!parts.timestamp || parts.signatures.length === 0) return false;

  // Check timestamp tolerance
  const ts = parseInt(parts.timestamp, 10);
  if (!Number.isFinite(ts)) return false;
  const now = Math.floor(Date.now() / 1000);
  if (Math.abs(now - ts) > toleranceSec) return false;

  // Compute expected signature
  const signedPayload = `${parts.timestamp}.${payload}`;
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const sig = await crypto.subtle.sign("HMAC", key, encoder.encode(signedPayload));
  const expectedHex = Array.from(new Uint8Array(sig))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");

  return parts.signatures.some((s) => timingSafeEqualHex(s, expectedHex));
}

/** Map Stripe subscription status → our DB status. */
function mapStripeStatus(
  stripeStatus: string
): "trialing" | "active" | "past_due" | "cancelled" | "paused" {
  switch (stripeStatus) {
    case "trialing":
      return "trialing";
    case "active":
      return "active";
    case "past_due":
      return "past_due";
    case "canceled":
    case "cancelled":
    case "incomplete_expired":
    case "unpaid":
      return "cancelled";
    case "paused":
      return "paused";
    default:
      return "active";
  }
}

/* ──────────────────────────────────────────────
   MAIN HANDLER
   ────────────────────────────────────────────── */

serve(async (req) => {
  // CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response("Method Not Allowed", { status: 405, headers: corsHeaders });
  }

  const STRIPE_WEBHOOK_SECRET = Deno.env.get("STRIPE_WEBHOOK_SECRET");
  if (!STRIPE_WEBHOOK_SECRET) {
    console.error("[stripe-webhook] STRIPE_WEBHOOK_SECRET is not set");
    return new Response("Server misconfiguration", { status: 500, headers: corsHeaders });
  }

  // Read raw body for signature verification
  const rawBody = await req.text();
  const sigHeader = req.headers.get("stripe-signature") || "";

  const isValid = await verifyStripeSignature(rawBody, sigHeader, STRIPE_WEBHOOK_SECRET);
  if (!isValid) {
    console.error("[stripe-webhook] Invalid signature");
    return new Response("Invalid signature", { status: 400, headers: corsHeaders });
  }

  // Parse the event
  let event: { id?: string; type: string; data: { object: Record<string, any> } };
  try {
    event = JSON.parse(rawBody);
  } catch {
    return new Response("Invalid JSON", { status: 400, headers: corsHeaders });
  }

  // Initialize Supabase with service_role key (bypasses RLS)
  const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
  const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
  const supabase = createClient(supabaseUrl, supabaseKey);

  // Atomic idempotency claim before applying billing state mutations
  const eventId = typeof event.id === "string" && event.id.trim() ? event.id.trim() : null;
  const workerId = `stripe_${crypto.randomUUID()}`;
  let claimedViaRpc = false;

  if (eventId) {
    const hashBuf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(rawBody));
    const payloadHash = Array.from(new Uint8Array(hashBuf))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");

    const { data: claimRows, error: claimErr } = await supabase.rpc("claim_provider_webhook_event", {
      p_provider: "stripe",
      p_event_id: eventId,
      p_payload_hash: payloadHash,
      p_org_id: null,
      p_event_type: event.type,
      p_lease_seconds: 120,
      p_worker_id: workerId,
    });

    if (!claimErr && Array.isArray(claimRows) && claimRows.length > 0) {
      claimedViaRpc = true;
      if (!claimRows[0].claimed) {
        return new Response(JSON.stringify({ received: true, deduplicated: true }), {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    } else if (claimErr) {
      const { error: insertErr } = await supabase.from("provider_webhook_events").insert({
        provider: "stripe",
        event_id: eventId,
        event_type: event.type,
        payload_hash: payloadHash,
        status: "processed",
        raw_payload: event,
      });
      if (insertErr?.code === "23505") {
        return new Response(JSON.stringify({ received: true, deduplicated: true }), {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }
  }

  const obj = event.data.object;

  console.log(`[stripe-webhook] Processing event: ${event.type}`);

  try {
    switch (event.type) {
      /* ─── CHECKOUT COMPLETED ─── */
      case "checkout.session.completed": {
        const customerId = obj.customer as string;
        const subscriptionId = obj.subscription as string;
        const userId = obj.metadata?.user_id || obj.client_reference_id;

        if (!userId) {
          console.error("[stripe-webhook] checkout.session.completed: No user_id in metadata");
          break;
        }

        // Upsert the subscription record
        const { error } = await supabase
          .from("subscriptions")
          .upsert(
            {
              user_id: userId,
              stripe_customer_id: customerId,
              stripe_subscription_id: subscriptionId,
              status: "active",
              plan_id: (obj.metadata?.plan_id as string) || "starter",
              amount: (obj.amount_total || 0) / 100,
              currency: (obj.currency as string) || "usd",
              current_period_start: new Date().toISOString(),
              current_period_end: new Date(
                Date.now() + 30 * 24 * 60 * 60 * 1000
              ).toISOString(),
            },
            { onConflict: "user_id" }
          );

        if (error) console.error("[stripe-webhook] Upsert subscription error:", error);
        break;
      }

      /* ─── INVOICE PAID ─── */
      case "invoice.paid": {
        const customerId = obj.customer as string;
        const amountPaid = (obj.amount_paid || 0) / 100;
        const periodStart = obj.period_start
          ? new Date(obj.period_start * 1000).toISOString()
          : null;
        const periodEnd = obj.period_end
          ? new Date(obj.period_end * 1000).toISOString()
          : null;

        // Look up the user by stripe_customer_id
        const { data: subData } = await supabase
          .from("subscriptions")
          .select("id, user_id")
          .eq("stripe_customer_id", customerId)
          .limit(1)
          .maybeSingle();

        if (subData) {
          // Update subscription status to active
          await supabase
            .from("subscriptions")
            .update({
              status: "active",
              current_period_start: periodStart,
              current_period_end: periodEnd,
            })
            .eq("id", subData.id);

          // Create invoice record
          const { error: invError } = await supabase.from("invoices").insert({
            user_id: subData.user_id,
            subscription_id: subData.id,
            stripe_invoice_id: obj.id as string,
            amount: amountPaid,
            currency: (obj.currency as string) || "usd",
            status: "paid",
            period_start: periodStart,
            period_end: periodEnd,
            paid_at: new Date().toISOString(),
            hosted_invoice_url: (obj.hosted_invoice_url as string) || null,
          });

          if (invError) console.error("[stripe-webhook] Insert invoice error:", invError);
        } else {
          console.warn(
            `[stripe-webhook] invoice.paid: No subscription found for customer ${customerId}`
          );
        }
        break;
      }

      /* ─── INVOICE PAYMENT FAILED ─── */
      case "invoice.payment_failed": {
        const customerId = obj.customer as string;

        const { error } = await supabase
          .from("subscriptions")
          .update({ status: "past_due" })
          .eq("stripe_customer_id", customerId);

        if (error) console.error("[stripe-webhook] Update past_due error:", error);
        break;
      }

      /* ─── SUBSCRIPTION UPDATED ─── */
      case "customer.subscription.updated": {
        const stripeSubId = obj.id as string;
        const stripeStatus = obj.status as string;
        const planId = obj.metadata?.plan_id || null;
        const periodStart = obj.current_period_start
          ? new Date(obj.current_period_start * 1000).toISOString()
          : null;
        const periodEnd = obj.current_period_end
          ? new Date(obj.current_period_end * 1000).toISOString()
          : null;
        const cancelAt = obj.cancel_at
          ? new Date(obj.cancel_at * 1000).toISOString()
          : null;
        const trialEnd = obj.trial_end
          ? new Date(obj.trial_end * 1000).toISOString()
          : null;

        const updatePayload: Record<string, unknown> = {
          status: mapStripeStatus(stripeStatus),
          current_period_start: periodStart,
          current_period_end: periodEnd,
          cancel_at: cancelAt,
          trial_end: trialEnd,
        };

        if (planId) updatePayload.plan_id = planId;

        // Extract amount from items
        const item = obj.items?.data?.[0];
        if (item?.price?.unit_amount) {
          updatePayload.amount = item.price.unit_amount / 100;
          updatePayload.currency = item.price.currency || "usd";
        }

        const { error } = await supabase
          .from("subscriptions")
          .update(updatePayload)
          .eq("stripe_subscription_id", stripeSubId);

        if (error) console.error("[stripe-webhook] Update subscription error:", error);
        break;
      }

      /* ─── SUBSCRIPTION DELETED ─── */
      case "customer.subscription.deleted": {
        const stripeSubId = obj.id as string;

        const { error } = await supabase
          .from("subscriptions")
          .update({
            status: "cancelled",
            cancelled_at: new Date().toISOString(),
          })
          .eq("stripe_subscription_id", stripeSubId);

        if (error) console.error("[stripe-webhook] Delete subscription error:", error);
        break;
      }

      default:
        console.log(`[stripe-webhook] Unhandled event type: ${event.type}`);
    }

    if (claimedViaRpc && eventId) {
      await supabase.rpc("complete_provider_webhook_event", {
        p_provider: "stripe",
        p_event_id: eventId,
        p_worker_id: workerId,
        p_org_id: null,
        p_metadata: { eventType: event.type },
      });
    }
  } catch (e: any) {
    console.error(`[stripe-webhook] Error processing ${event.type}:`, e);
    if (claimedViaRpc && eventId) {
      await supabase.rpc("fail_provider_webhook_event", {
        p_provider: "stripe",
        p_event_id: eventId,
        p_worker_id: workerId,
        p_error_message: String(e?.message || "Stripe webhook processing failed").slice(0, 500),
      });
    }
    // Still return 200 to prevent Stripe retries on processing errors
  }

  return new Response(JSON.stringify({ received: true }), {
    status: 200,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
});
