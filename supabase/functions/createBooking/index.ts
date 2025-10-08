// supabase/functions/createBooking/index.ts
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

function cors(origin?: string | null) {
  const allowlist = /^(https?:\/\/(localhost:3000|127\.0\.0\.1:3000|localhost:3001|127\.0\.0\.1:3001|partybookingwizard\.com|www\.partybookingwizard\.com))$/i;
  const allow = origin && allowlist.test(origin) ? origin : "*";
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
      startTime, // optional once holdId provided
      endTime,   // optional once holdId provided
      notes,
      kids,
      holdId,
    } = body;

    // Basic input validation
    const missing = ["tenantSlug", "roomId"].filter((k) => !body?.[k]);
    if (missing.length) {
      return new Response(JSON.stringify({ error: `Missing: ${missing.join(", ")}` }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (!holdId) {
      return new Response(JSON.stringify({ error: "Missing: holdId (createHold must be called first)" }), {
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
      // If package selected, ensure room is eligible
      const { data: pr } = await db
        .from("package_rooms")
        .select("room_id")
        .eq("tenant_id", tenant.id)
        .eq("package_id", packageId)
        .eq("room_id", roomId);
      if (!pr || pr.length === 0) {
        return new Response(JSON.stringify({ error: "Selected room is not eligible for the chosen package" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    // Validate hold
    const { data: hold, error: hErr } = await db
      .from("booking_holds")
      .select("id, tenant_id, room_id, start_time, end_time, expires_at")
      .eq("id", holdId)
      .maybeSingle();
    if (hErr || !hold) {
      return new Response(JSON.stringify({ error: "Hold not found" }), { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
    if (hold.tenant_id !== tenant.id || hold.room_id !== roomId) {
      return new Response(JSON.stringify({ error: "Hold does not match tenant/room selection" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
    if (new Date(hold.expires_at).getTime() <= Date.now()) {
      return new Response(JSON.stringify({ error: "Hold has expired" }), { status: 409, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // Buffer-aware overlap check against bookings using hold window
    const { data: pol } = await db
      .from("tenant_policies")
      .select("buffer_minutes")
      .eq("tenant_id", tenant.id)
      .maybeSingle();
    const bufferMinutes = Number(pol?.buffer_minutes ?? 30);

    const holdStart = new Date(hold.start_time).toISOString();
    const holdEnd = new Date(hold.end_time).toISOString();
    const bufferedStart = new Date(new Date(holdStart).getTime() - bufferMinutes * 60000).toISOString();
    const bufferedEnd = new Date(new Date(holdEnd).getTime() + bufferMinutes * 60000).toISOString();

    const { data: overlapping, error: oErr } = await db
      .from("bookings")
      .select("id")
      .eq("tenant_id", tenant.id)
      .eq("room_id", roomId)
      .or("status.eq.confirmed,status.eq.pending")
      .lt("start_time", bufferedEnd)
      .gt("end_time", bufferedStart);
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

    // Upsert/find customer (store parent info in customers)
    let customerId: string | null = null;
    if (email) {
      const { data: existingCustomer } = await db
        .from("customers")
        .select("id")
        .eq("tenant_id", tenant.id)
        .eq("email", email)
        .maybeSingle();
      customerId = existingCustomer?.id ?? null;
    }
    if (!customerId) {
      const { data: newCust } = await db
        .from("customers")
        .insert({
          tenant_id: tenant.id,
          name: parentName ?? null,
          email: email ?? null,
          phone: phone ?? null,
        })
        .select("id")
        .single();
      customerId = newCust?.id ?? null;
    }

    // Compose notes with child details (schema has no child columns)
    const notesCombined = [
      notes && String(notes).trim() ? String(notes).trim() : null,
      childName ? `Child: ${childName}` : null,
      (typeof childAge === "number" && childAge > 0) ? `Age: ${childAge}` : null,
    ]
      .filter(Boolean)
      .join(" | ") || null;

    // Insert booking with supported columns
    const { data: booking, error: bErr } = await db
      .from("bookings")
      .insert({
        tenant_id: tenant.id,
        customer_id: customerId,
        room_id: roomId,
        package_id: packageId ?? null,
        start_time: holdStart,
        end_time: holdEnd,
        kids_count: typeof kids === "number" ? kids : null,
        notes: notesCombined,
        status: "pending",
      })
      .select("id, status")
      .single();

    if (bErr) {
      // Return Postgres error to the client for fast debugging
      return new Response(JSON.stringify({ error: bErr.message, details: bErr.details }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Release hold after successful booking insert
    if (booking?.id) {
      await db.from("booking_holds").delete().eq("id", holdId);
    }

    return new Response(JSON.stringify({ ok: true, booking, bookingId: booking?.id }), {
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
