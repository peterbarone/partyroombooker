// Supabase Edge Function: cloverWebhook
// Runtime: Deno
// Purpose: Handle Clover webhook, verify signature (shared secret), record payment, mark booking confirmed

import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
});

serve(async (req) => {
  try {
    if (req.method !== "POST") {
      return new Response(JSON.stringify({ error: "Method not allowed" }), { status: 405 });
    }

    const url = new URL(req.url);
    const tenantSlug = url.searchParams.get("tenant");
    if (!tenantSlug) return new Response(JSON.stringify({ error: "missing tenant" }), { status: 400 });

    const rawBody = await req.text();
    let payload: any;
    try {
      payload = JSON.parse(rawBody);
    } catch {
      return new Response(JSON.stringify({ error: "invalid JSON" }), { status: 400 });
    }

    // Resolve tenant and integration (for webhook secret)
    const { data: tenantRow } = await supabase
      .from("tenants")
      .select("id")
      .eq("slug", tenantSlug)
      .eq("active", true)
      .single();
    if (!tenantRow?.id) return new Response(JSON.stringify({ error: "tenant not found" }), { status: 404 });

    const { data: integ } = await supabase
      .from("tenant_integrations")
      .select("clover_webhook_secret")
      .eq("tenant_id", tenantRow.id)
      .maybeSingle();

    const providedSig = req.headers.get("x-clover-signature") ?? req.headers.get("X-Clover-Signature") ?? req.headers.get("x-signature");
    const expected = integ?.clover_webhook_secret;

    if (expected && providedSig) {
      // Very simple shared-secret compare. Replace with HMAC verification if Clover provides signed payloads.
      if (providedSig !== expected) {
        return new Response(JSON.stringify({ error: "invalid signature" }), { status: 401 });
      }
    }

    // Expect payload to include at least bookingId and status/amount
    const bookingId = payload?.bookingId ?? payload?.state ?? payload?.order?.note; // flexible
    const amountCents = Number(payload?.amount ?? payload?.amount_cents ?? 0);
    const status = String(payload?.status ?? payload?.paymentStatus ?? "succeeded").toLowerCase();
    const cloverPaymentId = payload?.id ?? payload?.paymentId ?? null;

    if (!bookingId) {
      return new Response(JSON.stringify({ error: "missing bookingId in payload" }), { status: 400 });
    }

    // Record payment row
    if (amountCents > 0) {
      await supabase.from("payments").insert({
        tenant_id: tenantRow.id,
        booking_id: bookingId,
        type: "deposit",
        amount: amountCents / 100,
        status: status === "succeeded" || status === "paid" ? "succeeded" : status,
        clover_payment_id: cloverPaymentId,
        raw_webhook_json: payload,
      });
    }

    // Mark booking confirmed if succeeded
    if (status === "succeeded" || status === "paid") {
      await supabase
        .from("bookings")
        .update({ status: "confirmed" })
        .eq("id", bookingId)
        .eq("tenant_id", tenantRow.id);
    }

    return new Response(JSON.stringify({ ok: true }), { headers: { "Content-Type": "application/json" } });
  } catch (error) {
    console.error("cloverWebhook error", error);
    return new Response(JSON.stringify({ error: String(error) }), { status: 500 });
  }
});
