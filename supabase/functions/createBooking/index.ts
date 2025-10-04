// supabase/functions/createBooking/index.ts
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

function cors(origin?: string | null) {
  const allow =
    origin && /^https?:\/\/(localhost:3000|127\.0\.0\.1:3000)$/i.test(origin)
      ? origin
      : "*";
  return {
    "Access-Control-Allow-Origin": allow,
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers":
      "authorization, x-client-info, apikey, content-type",
    "Access-Control-Max-Age": "86400",
    Vary: "Origin",
  };
}

Deno.serve(async (req) => {
  const corsHeaders = cors(req.headers.get("Origin"));
  if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: corsHeaders });
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  // Read secrets after CORS
  const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
  const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!SUPABASE_URL || !SERVICE_KEY) {
    return new Response(JSON.stringify({ error: "Missing Supabase secrets" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
  const db = createClient(SUPABASE_URL, SERVICE_KEY, { auth: { persistSession: false } });

  try {
    const body = await req.json().catch(() => ({}));
    const {
      tenantSlug,
      roomId,
      packageId,
      childName,
      childAge,
      parentName,
      email,
      phone,
      startTime, // expected ISO string with Z, e.g. 2025-10-18T14:00:00.000Z
      endTime,   // ISO
      notes,
      kids,
    } = body;

    // Basic input validation
    const missing = ["tenantSlug", "roomId", "startTime", "endTime"].filter((k) => !body?.[k]);
    if (missing.length) {
      return new Response(JSON.stringify({ error: `Missing: ${missing.join(", ")}` }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const s = new Date(startTime), e = new Date(endTime);
    if (isNaN(+s) || isNaN(+e) || s >= e) {
      return new Response(JSON.stringify({ error: "Invalid startTime/endTime" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Resolve tenant
    const { data: tenant, error: tErr } = await db
      .from("tenants")
      .select("id, active")
      .eq("slug", tenantSlug)
      .single();
    if (tErr || !tenant?.id || tenant.active === false) {
      return new Response(JSON.stringify({ error: "Tenant not found or inactive" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Optional: verify room belongs to tenant
    const { data: room, error: rErr } = await db
      .from("rooms")
      .select("id, tenant_id, max_kids, active")
      .eq("id", roomId)
      .eq("tenant_id", tenant.id)
      .eq("active", true)
      .single();
    if (rErr || !room) {
      return new Response(JSON.stringify({ error: "Room not found for tenant" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (typeof kids === "number" && room.max_kids != null && kids > room.max_kids) {
      return new Response(JSON.stringify({ error: "Kids exceed room capacity" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Optional: verify package belongs to tenant
    if (packageId) {
      const { data: pkg, error: pErr } = await db
        .from("packages")
        .select("id, tenant_id, active")
        .eq("id", packageId)
        .eq("tenant_id", tenant.id)
        .maybeSingle();
      if (pErr || (pkg && pkg.active === false)) {
        return new Response(JSON.stringify({ error: "Invalid package" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    // Conflict/overlap check (server-side)
    const { data: overlapping, error: oErr } = await db
      .from("bookings")
      .select("id")
      .eq("tenant_id", tenant.id)
      .eq("room_id", roomId)
      .or("status.eq.confirmed,status.eq.pending") // adjust to your statuses
      .lt("start_time", endTime)
      .gt("end_time", startTime);
    if (oErr) {
      return new Response(JSON.stringify({ error: `Overlap check failed: ${oErr.message}` }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (overlapping && overlapping.length) {
      return new Response(JSON.stringify({ error: "Time slot already booked" }), {
        status: 409,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Insert booking
    const insertPayload = {
      tenant_id: tenant.id,
      room_id: roomId,
      package_id: packageId ?? null,
      child_name: childName ?? null,
      child_age: childAge ?? null,
      parent_name: parentName ?? null,
      email: email ?? null,
      phone: phone ?? null,
      start_time: startTime,
      end_time: endTime,
      notes: notes ?? null,
      kids: typeof kids === "number" ? kids : null,
      status: "pending", // or 'confirmed' per your flow
    };

    const { data: booking, error: bErr } = await db
      .from("bookings")
      .insert(insertPayload)
      .select("id, status")
      .single();

    if (bErr) {
      // Return Postgres error to the client for fast debugging
      return new Response(JSON.stringify({ error: bErr.message, details: bErr.details }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ ok: true, booking }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("createBooking error", err);
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
