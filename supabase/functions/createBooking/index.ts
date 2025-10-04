// Supabase Edge Function: createBooking
// Runtime: Deno
// Purpose: Validate availability, compute price & deposit, create pending booking, return Clover checkout URL
// Returns: { checkoutUrl: string, bookingId: string, paymentId?: string }

import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
});

function addMinutesISO(iso: string, minutes: number) {
  const d = new Date(iso);
  d.setMinutes(d.getMinutes() + minutes);
  return d.toISOString();
}

serve(async (req) => {
  try {
    if (req.method !== "POST") {
      return new Response(JSON.stringify({ error: "Method not allowed" }), { status: 405 });
    }

    const body = await req.json();
    const { tenantSlug, customer, packageId, roomId, startTime, kidsCount } = body ?? {};
    if (!tenantSlug || !customer || !packageId || !roomId || !startTime || !kidsCount) {
      return new Response(
        JSON.stringify({ error: "Missing required fields: tenantSlug, customer{name,email,phone}, packageId, roomId, startTime, kidsCount" }),
        { status: 400 },
      );
    }

    // Resolve tenant
    const { data: tenantRow, error: tenantErr } = await supabase
      .from("tenants")
      .select("id, timezone")
      .eq("slug", tenantSlug)
      .eq("active", true)
      .single();
    if (tenantErr || !tenantRow) throw tenantErr ?? new Error("tenant not found");
    const tenantId = tenantRow.id;

    // Load package pricing and duration
    const { data: pkg, error: pkgErr } = await supabase
      .from("packages")
      .select("id, base_price, base_kids, extra_kid_price, duration_min, duration_minutes")
      .eq("tenant_id", tenantId)
      .eq("id", packageId)
      .single();
    if (pkgErr || !pkg) throw pkgErr ?? new Error("package not found");
    const durationMin: number = Number(pkg.duration_min ?? pkg.duration_minutes ?? 120);

    // Validate room eligibility and capacity
    const { data: room, error: roomErr } = await supabase
      .from("rooms")
      .select("id, name, max_kids, active")
      .eq("tenant_id", tenantId)
      .eq("id", roomId)
      .eq("active", true)
      .single();
    if (roomErr || !room) throw roomErr ?? new Error("room not found");
    if (Number(room.max_kids) < Number(kidsCount)) {
      return new Response(JSON.stringify({ error: "Room capacity exceeded" }), { status: 400 });
    }

    const { data: mapping, error: mapErr } = await supabase
      .from("package_rooms")
      .select("room_id")
      .eq("tenant_id", tenantId)
      .eq("package_id", packageId)
      .eq("room_id", roomId)
      .maybeSingle();
    if (mapErr) throw mapErr;
    if (!mapping) {
      return new Response(JSON.stringify({ error: "Package is not eligible for selected room" }), { status: 400 });
    }

    // Check availability overlap with buffer
    const { data: policy, error: polErr } = await supabase
      .from("tenant_policies")
      .select("buffer_minutes")
      .eq("tenant_id", tenantId)
      .single();
    const bufferMinutes = Number(policy?.buffer_minutes ?? 30);

    const endTime = addMinutesISO(startTime, durationMin);

    function overlaps(aStart: string, aEnd: string, bStart: string, bEnd: string) {
      return new Date(aStart) < new Date(bEnd) && new Date(bStart) < new Date(aEnd);
    }

    const startWithBuffer = addMinutesISO(startTime, -bufferMinutes);
    const endWithBuffer = addMinutesISO(endTime, bufferMinutes);

    const { data: overlapsExisting, error: overlapErr } = await supabase
      .from("bookings")
      .select("id, start_time, end_time, status")
      .eq("tenant_id", tenantId)
      .eq("room_id", roomId)
      .gte("start_time", new Date(new Date(startTime).setHours(0,0,0,0)).toISOString())
      .lte("start_time", new Date(new Date(startTime).setHours(23,59,59,999)).toISOString());
    if (overlapErr) throw overlapErr;
    const clash = (overlapsExisting ?? []).some((b: any) =>
      overlaps(startWithBuffer, endWithBuffer, addMinutesISO(b.start_time, -bufferMinutes), addMinutesISO(b.end_time, bufferMinutes))
    );
    if (clash) {
      return new Response(JSON.stringify({ error: "Selected time is no longer available" }), { status: 409 });
    }

    // Upsert or insert customer
    const { data: customerRow, error: custErr } = await supabase
      .from("customers")
      .upsert(
        {
          tenant_id: tenantId,
          name: customer.name,
          email: customer.email,
          phone: customer.phone,
        },
        { onConflict: "tenant_id,email" },
      )
      .select("id")
      .single();
    if (custErr || !customerRow) throw custErr ?? new Error("customer upsert failed");

    // Compute price & deposit
    const basePrice = Number(pkg.base_price ?? 0);
    const baseKids = Number(pkg.base_kids ?? 0);
    const extraKidPrice = Number(pkg.extra_kid_price ?? 0);
    const extraKids = Math.max(0, Number(kidsCount) - baseKids);
    const totalPrice = basePrice + extraKids * extraKidPrice;
    const depositDue = Math.round(totalPrice * 0.5 * 100) / 100;

    // Create pending booking
    const { data: booking, error: bookErr } = await supabase
      .from("bookings")
      .insert({
        tenant_id: tenantId,
        customer_id: customerRow.id,
        package_id: packageId,
        room_id: roomId,
        start_time: startTime,
        end_time: endTime,
        kids_count: kidsCount,
        status: "pending",
        deposit_due: depositDue,
      })
      .select("id")
      .single();
    if (bookErr || !booking) throw bookErr ?? new Error("booking creation failed");

    // Attempt to create a Clover Hosted Checkout session using tenant integrations
    let checkoutUrl: string | null = null;
    try {
      const { data: integ } = await supabase
        .from("tenant_integrations")
        .select("clover_api_key, clover_merchant_id, clover_checkout_endpoint, clover_success_url, clover_cancel_url, clover_webhook_secret")
        .eq("tenant_id", tenantId)
        .maybeSingle();

      if (integ?.clover_api_key && integ?.clover_checkout_endpoint && integ?.clover_merchant_id) {
        const origin = new URL(req.url).origin;
        const webhookUrl = `${origin}/functions/v1/cloverWebhook?tenant=${encodeURIComponent(tenantSlug)}`;
        const successUrl = integ.clover_success_url || `${origin}/success?bookingId=${booking.id}`;
        const cancelUrl = integ.clover_cancel_url || `${origin}/cancel?bookingId=${booking.id}`;

        const amountCents = Math.round(totalPrice * 0.5 * 100); // deposit only

        // Generic POST to a Clover Hosted Checkout endpoint expected by your integration
        const res = await fetch(integ.clover_checkout_endpoint, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${integ.clover_api_key}`,
          },
          body: JSON.stringify({
            merchantId: integ.clover_merchant_id,
            amount: amountCents,
            currency: "USD",
            reference: String(booking.id),
            metadata: { bookingId: booking.id, tenantSlug },
            successUrl,
            cancelUrl,
            webhookUrl,
          }),
        });

        if (res.ok) {
          const json = await res.json();
          checkoutUrl = json.checkoutUrl || json.url || null;
        } else {
          console.error("Clover checkout creation failed", await res.text());
        }
      }
    } catch (e) {
      console.error("Clover integration error", e);
    }

    // Fallback to a mock URL if Clover is not configured
    if (!checkoutUrl) {
      checkoutUrl = `${new URL(req.url).origin}/checkout/mock?bookingId=${booking.id}`;
    }

    return new Response(
      JSON.stringify({ checkoutUrl, bookingId: booking.id }),
      { headers: { "Content-Type": "application/json" } },
    );
  } catch (error) {
    console.error("createBooking error", error);
    return new Response(JSON.stringify({ error: String(error) }), { status: 500 });
  }
});
