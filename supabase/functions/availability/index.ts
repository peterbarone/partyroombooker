// Runtime: Deno (Supabase Edge Functions)
// Purpose: Return available time slots for a given tenant/date (packageId, kids optional)
// Response: Array<{
//   timeStart: string;
//   timeEnd: string;
//   rooms: Array<{ roomId: string; roomName: string; maxKids: number; eligible: boolean; available: boolean }>;
// }>

import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// Helper: add minutes to ISO string
function addMinutes(iso: string, minutes: number) {
  const d = new Date(iso);
  d.setMinutes(d.getMinutes() + minutes);
  return d.toISOString();
}

function buildCorsHeaders(origin?: string | null) {
  const allowlist =
    /^(https?:\/\/(localhost:3000|127\.0\.0\.1:3000|localhost:3001|127\.0\.0\.1:3001|partybookingwizard\.com|www\.partybookingwizard\.com))$/i;
  const allowOrigin = origin && allowlist.test(origin) ? origin : "*";
  return {
    "Access-Control-Allow-Origin": allowOrigin,
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers":
      "authorization, x-client-info, apikey, content-type",
    "Access-Control-Max-Age": "86400",
    Vary: "Origin",
  } as Record<string, string>;
}

Deno.serve(async (req) => {
  const corsHeaders = buildCorsHeaders(req.headers.get("Origin"));

  // Preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (!SUPABASE_URL || !SERVICE_KEY) {
      return new Response(
        JSON.stringify({ error: "Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabase = createClient(SUPABASE_URL, SERVICE_KEY, {
      auth: { persistSession: false },
    });

    const { tenantSlug, date, packageId, kids } = await req.json();
    if (!tenantSlug || !date) {
      return new Response(
        JSON.stringify({ error: "Missing required body fields: tenantSlug, date" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Tenant
    const { data: tenantRow, error: tenantErr } = await supabase
      .from("tenants")
      .select("id, active, timezone")
      .eq("slug", tenantSlug)
      .maybeSingle();
    if (tenantErr || !tenantRow || tenantRow.active === false) {
      return new Response(JSON.stringify({ error: "tenant not found or inactive" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const tenantId = tenantRow.id as string;

    // Policy (buffer)
    const { data: policy } = await supabase
      .from("tenant_policies")
      .select("buffer_minutes")
      .eq("tenant_id", tenantId)
      .maybeSingle();
    const bufferMinutes = Number(policy?.buffer_minutes ?? 30);

    // Package (optional)
    let durationMin = 120;
    let eligibleRoomIds: Set<string> | null = null;
    if (packageId) {
      const { data: pkg, error: pkgErr } = await supabase
        .from("packages")
        .select("id, duration_minutes")
        .eq("tenant_id", tenantId)
        .eq("id", packageId)
        .maybeSingle();
      if (pkgErr || !pkg) {
        return new Response(JSON.stringify({ error: "package not found" }), {
          status: 404,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      durationMin = Number((pkg as any).duration_minutes ?? 120);

      const { data: eligibleRooms, error: eligErr } = await supabase
        .from("package_rooms")
        .select("room_id")
        .eq("tenant_id", tenantId)
        .eq("package_id", packageId);
      if (eligErr) throw eligErr;
      eligibleRoomIds = new Set((eligibleRooms ?? []).map((r: any) => r.room_id));
    }

    // Rooms (capacity optional)
    let roomsQuery = supabase
      .from("rooms")
      .select("id, name, max_kids, active")
      .eq("tenant_id", tenantId)
      .eq("active", true);
    if (typeof kids === "number" && kids > 0) {
      roomsQuery = roomsQuery.gte("max_kids", kids);
    }
    const { data: rooms, error: roomErr } = await roomsQuery;
    if (roomErr) throw roomErr;

    // Slot templates (schema: day_of_week, start_times_json)
    const dow = new Date(`${date}T00:00:00`).getDay();
    const { data: slotsTemplate, error: slotErr } = await supabase
      .from("slot_templates")
      .select("start_times_json, day_of_week")
      .eq("tenant_id", tenantId)
      .eq("day_of_week", dow)
      .maybeSingle();
    if (slotErr) throw slotErr;

    const startTimes: string[] = Array.isArray(slotsTemplate?.start_times_json)
      ? (slotsTemplate!.start_times_json as string[])
      : [];

    const slots = startTimes.map((start: string) => {
      const timeStart = new Date(`${date}T${start}:00`).toISOString();
      const timeEnd = addMinutes(timeStart, durationMin);
      return { timeStart, timeEnd };
    });

    // Bookings for the date
    const dayStart = new Date(`${date}T00:00:00`).toISOString();
    const dayEnd = new Date(`${date}T23:59:59`).toISOString();
    const { data: existingBookings, error: bookErr } = await supabase
      .from("bookings")
      .select("room_id, start_time, end_time, status")
      .eq("tenant_id", tenantId)
      .gte("start_time", dayStart)
      .lte("start_time", dayEnd);
    if (bookErr) throw bookErr;

    function overlaps(aStart: string, aEnd: string, bStart: string, bEnd: string) {
      return new Date(aStart) < new Date(bEnd) && new Date(bStart) < new Date(aEnd);
    }

    const response = slots.map(({ timeStart, timeEnd }) => {
      const timeStartWithBuffer = addMinutes(timeStart, -bufferMinutes);
      const timeEndWithBuffer = addMinutes(timeEnd, bufferMinutes);

      const roomsForSlot = (rooms ?? []).map((r: any) => {
        const eligible = eligibleRoomIds ? eligibleRoomIds.has(r.id) : true;
        const roomBookings = (existingBookings ?? []).filter((b: any) => b.room_id === r.id);
        const available = roomBookings.every((b: any) => {
          const bStart = addMinutes(b.start_time, -bufferMinutes);
          const bEnd = addMinutes(b.end_time, bufferMinutes);
          return !overlaps(timeStartWithBuffer, timeEndWithBuffer, bStart, bEnd);
        });
        return {
          roomId: r.id,
          roomName: r.name,
          maxKids: r.max_kids,
          eligible,
          available,
        };
      });

      return { timeStart, timeEnd, rooms: roomsForSlot };
    });

    return new Response(JSON.stringify(response), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("availability error", err);
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { ...buildCorsHeaders(req.headers.get("Origin")), "Content-Type": "application/json" },
    });
  }
});
