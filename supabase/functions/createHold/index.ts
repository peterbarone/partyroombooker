// supabase/functions/createHold/index.ts
// Stub: create a 15-minute hold for a tenant/room/startTime. Replace TODOs to enforce business rules.
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

function cors(origin?: string | null) {
  const allowlist = /^(https?:\/\/(localhost:3000|127\.0\.0\.1:3000|localhost:3001|127\.0\.0\.1:3001|partybookingwizard\.com|www\.partybookingwizard\.com))$/i;
  const allow = origin && allowlist.test(origin) ? origin : "*";
  return {
    "Access-Control-Allow-Origin": allow,
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Access-Control-Max-Age": "86400",
    Vary: "Origin",
  } as Record<string, string>;
}

Deno.serve(async (req) => {
  const corsHeaders = cors(req.headers.get("Origin"));
  if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: corsHeaders });
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), { status: 405, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }

  const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
  const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!SUPABASE_URL || !SERVICE_KEY) {
    return new Response(JSON.stringify({ error: "Missing Supabase secrets" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
  const db = createClient(SUPABASE_URL, SERVICE_KEY, { auth: { persistSession: false } });

  try {
    const body = await req.json().catch(() => ({}));
    const { tenantSlug, roomId, startTime, endTime, packageId, kids, clientToken } = body ?? {};

    // Basic validation
    const missing = ["tenantSlug", "roomId", "startTime"].filter((k) => !body?.[k]);
    if (missing.length) {
      return new Response(JSON.stringify({ error: `Missing: ${missing.join(", ")}` }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // Resolve tenant
    const { data: tenant, error: tErr } = await db
      .from("tenants")
      .select("id, active")
      .eq("slug", tenantSlug)
      .single();
    if (tErr || !tenant?.id || tenant.active === false) {
      return new Response(JSON.stringify({ error: "Tenant not found or inactive" }), { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // Policy values
    const { data: policy } = await db
      .from("tenant_policies")
      .select("hold_minutes, duration_minutes, buffer_minutes")
      .eq("tenant_id", tenant.id)
      .maybeSingle();
    const holdMinutes = Number(policy?.hold_minutes ?? 15);
    const fallbackDuration = Number(policy?.duration_minutes ?? 120);
    const bufferMinutes = Number(policy?.buffer_minutes ?? 30);

    // Determine times
    const s = new Date(startTime);
    let e = endTime ? new Date(endTime) : new Date(s.getTime() + fallbackDuration * 60000);
    if (isNaN(+s) || isNaN(+e) || s >= e) {
      return new Response(JSON.stringify({ error: "Invalid startTime/endTime" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // Room capacity and tenant ownership
    const { data: room, error: roomErr } = await db
      .from("rooms")
      .select("id, tenant_id, max_kids, active")
      .eq("id", roomId)
      .eq("tenant_id", tenant.id)
      .eq("active", true)
      .single();
    if (roomErr || !room) {
      return new Response(JSON.stringify({ error: "Room not found or inactive for tenant" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
    if (typeof kids === "number" && room.max_kids != null && kids > room.max_kids) {
      return new Response(JSON.stringify({ error: "Kids exceed room capacity" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // Package eligibility
    if (packageId) {
      const { data: pkg, error: pkgErr } = await db
        .from("packages")
        .select("id, tenant_id, active, duration_minutes")
        .eq("id", packageId)
        .eq("tenant_id", tenant.id)
        .maybeSingle();
      if (pkgErr || !pkg || pkg.active === false) {
        return new Response(JSON.stringify({ error: "Invalid package" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }
      // If package provides duration and client omitted endTime, recompute end
      if (!endTime && (pkg as any).duration_minutes) {
        e = new Date(s.getTime() + Number((pkg as any).duration_minutes) * 60000);
      }
      const { data: map } = await db
        .from("package_rooms")
        .select("room_id")
        .eq("tenant_id", tenant.id)
        .eq("package_id", packageId)
        .eq("room_id", roomId);
      if (!map || map.length === 0) {
        return new Response(JSON.stringify({ error: "Selected room is not eligible for the chosen package" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }
    }

    // Buffer-aware conflict checks
    const sBuff = new Date(s.getTime() - bufferMinutes * 60000).toISOString();
    const eBuff = new Date(e.getTime() + bufferMinutes * 60000).toISOString();
    const dayStart = new Date(Date.UTC(s.getUTCFullYear(), s.getUTCMonth(), s.getUTCDate(), 0, 0, 0)).toISOString();
    const dayEnd = new Date(Date.UTC(s.getUTCFullYear(), s.getUTCMonth(), s.getUTCDate(), 23, 59, 59)).toISOString();

    // Existing bookings overlap
    const { data: overlapsBookings, error: obErr } = await db
      .from("bookings")
      .select("id, start_time, end_time, status")
      .eq("tenant_id", tenant.id)
      .eq("room_id", roomId)
      .or("status.eq.pending,status.eq.confirmed")
      .gte("start_time", dayStart)
      .lte("start_time", dayEnd);
    if (obErr) {
      return new Response(JSON.stringify({ error: `Overlap check failed: ${obErr.message}` }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
    const overlapWith = (aStart: string, aEnd: string, bStart: string, bEnd: string) => new Date(aStart) < new Date(bEnd) && new Date(bStart) < new Date(aEnd);
    const bookingsClash = (overlapsBookings ?? []).some((b: any) => overlapWith(sBuff, eBuff, new Date(new Date(b.start_time).getTime() - bufferMinutes * 60000).toISOString(), new Date(new Date(b.end_time).getTime() + bufferMinutes * 60000).toISOString()));
    if (bookingsClash) {
      return new Response(JSON.stringify({ error: "Time slot already booked" }), { status: 409, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // Existing active holds overlap
    const nowIso = new Date().toISOString();
    const { data: overlapsHolds, error: ohErr } = await db
      .from("booking_holds")
      .select("id, start_time, end_time, expires_at")
      .eq("tenant_id", tenant.id)
      .eq("room_id", roomId)
      .gt("expires_at", nowIso)
      .gte("start_time", dayStart)
      .lte("start_time", dayEnd);
    if (ohErr) {
      return new Response(JSON.stringify({ error: `Hold overlap check failed: ${ohErr.message}` }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
    const holdsClash = (overlapsHolds ?? []).some((h: any) => overlapWith(sBuff, eBuff, new Date(new Date(h.start_time).getTime() - bufferMinutes * 60000).toISOString(), new Date(new Date(h.end_time).getTime() + bufferMinutes * 60000).toISOString()));
    if (holdsClash) {
      return new Response(JSON.stringify({ error: "Time slot is temporarily held by another guest" }), { status: 409, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // Create hold
    const expiresAt = new Date(Date.now() + holdMinutes * 60_000).toISOString();
    const { data: hold, error: hErr } = await db
      .from("booking_holds")
      .insert({
        tenant_id: tenant.id,
        room_id: roomId,
        package_id: packageId ?? null,
        start_time: s.toISOString(),
        end_time: e.toISOString(),
        kids_count: typeof kids === "number" ? kids : null,
        client_token: clientToken ?? null,
        expires_at: expiresAt,
      })
      .select("id, expires_at")
      .single();

    if (hErr) {
      // On unique violation, return a friendly message
      const msg = hErr.message?.toLowerCase().includes("duplicate") ? "This time is already held. Please pick another slot." : hErr.message;
      return new Response(JSON.stringify({ error: msg }), { status: 409, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    return new Response(JSON.stringify({ ok: true, holdId: hold?.id, expiresAt: hold?.expires_at }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("createHold error", err);
    return new Response(JSON.stringify({ error: String(err) }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
