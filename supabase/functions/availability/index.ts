// Supabase Edge Function: availability
// Runtime: Deno
// Purpose: Return available time slots for a given tenant/date/package/kids
// Response shape: Array<{ timeStart: string; timeEnd: string; rooms: Array<{ roomId: string; roomName: string; maxKids: number; eligible: boolean; available: boolean }> }>

import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
});

// Helper: add minutes to ISO string
function addMinutes(iso: string, minutes: number) {
  const d = new Date(iso);
  d.setMinutes(d.getMinutes() + minutes);
  return d.toISOString();
}

serve(async (req) => {
  try {
    if (req.method !== "POST") {
      return new Response(JSON.stringify({ error: "Method not allowed" }), { status: 405 });
    }

    const { tenantSlug, date, packageId, kids } = await req.json();
    if (!tenantSlug || !date || !packageId || !kids) {
      return new Response(
        JSON.stringify({ error: "Missing required body fields: tenantSlug, date, packageId, kids" }),
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

    // Load tenant policies (buffer)
    const { data: policy, error: polErr } = await supabase
      .from("tenant_policies")
      .select("buffer_minutes")
      .eq("tenant_id", tenantId)
      .single();
    const bufferMinutes = Number(policy?.buffer_minutes ?? 30);

    // Load package duration and eligibility
    const { data: pkg, error: pkgErr } = await supabase
      .from("packages")
      .select("id, duration_min, duration_minutes")
      .eq("tenant_id", tenantId)
      .eq("id", packageId)
      .single();
    if (pkgErr || !pkg) throw pkgErr ?? new Error("package not found");
    const durationMin: number = Number(pkg.duration_min ?? pkg.duration_minutes ?? 120);

    // Rooms eligible for this package
    const { data: eligibleRooms, error: eligErr } = await supabase
      .from("package_rooms")
      .select("room_id")
      .eq("tenant_id", tenantId)
      .eq("package_id", packageId);
    if (eligErr) throw eligErr;
    const eligibleRoomIds = new Set((eligibleRooms ?? []).map((r: any) => r.room_id));

    // Load rooms for tenant (active and capacity >= kids)
    const { data: rooms, error: roomErr } = await supabase
      .from("rooms")
      .select("id, name, max_kids, active")
      .eq("tenant_id", tenantId)
      .eq("active", true)
      .gte("max_kids", kids);
    if (roomErr) throw roomErr;

    // Load slot templates for date's day-of-week
    const dow = new Date(date + "T00:00:00").getDay(); // 0..6
    const { data: slotsTemplate, error: slotErr } = await supabase
      .from("slot_templates")
      .select("start_times")
      .eq("tenant_id", tenantId)
      .eq("dow", dow)
      .maybeSingle();

    const startTimes: string[] = Array.isArray(slotsTemplate?.start_times) ? slotsTemplate!.start_times : [];

    // Build candidate slots as ISO ranges on the chosen date
    const slots = startTimes.map((start: string) => {
      const timeStart = new Date(`${date}T${start}:00`).toISOString();
      const timeEnd = addMinutes(timeStart, durationMin);
      return { timeStart, timeEnd };
    });

    // Get existing bookings overlapping (with buffer) for that date
    // We check all rooms at once to minimize roundtrips
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

    // Construct response with room eligibility and availability
    const response = slots.map(({ timeStart, timeEnd }) => {
      const timeStartWithBuffer = addMinutes(timeStart, -bufferMinutes);
      const timeEndWithBuffer = addMinutes(timeEnd, bufferMinutes);

      const roomsForSlot = (rooms ?? []).map((r: any) => {
        const eligible = eligibleRoomIds.has(r.id);
        // room is available if no existing booking overlaps the buffer-adjusted window
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
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("availability error", error);
    return new Response(JSON.stringify({ error: String(error) }), { status: 500 });
  }
});
