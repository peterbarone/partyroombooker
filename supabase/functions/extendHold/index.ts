// supabase/functions/extendHold/index.ts
// Stub: extend an existing hold's expiry by a small increment, capped by a maximum window.
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
  if (req.method !== "POST") return new Response(JSON.stringify({ error: "Method not allowed" }), { status: 405, headers: { ...corsHeaders, "Content-Type": "application/json" } });

  const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
  const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!SUPABASE_URL || !SERVICE_KEY) return new Response(JSON.stringify({ error: "Missing Supabase secrets" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  const db = createClient(SUPABASE_URL, SERVICE_KEY, { auth: { persistSession: false } });

  try {
    const body = await req.json().catch(() => ({}));
    const { holdId, extendMinutes = 5, maxTotalMinutes } = body ?? {};
    if (!holdId) return new Response(JSON.stringify({ error: "Missing: holdId" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });

    // Load hold
    const { data: hold, error: hErr } = await db
      .from("booking_holds")
      .select("id, tenant_id, created_at, expires_at")
      .eq("id", holdId)
      .maybeSingle();
    if (hErr || !hold) {
      return new Response(JSON.stringify({ error: "Hold not found" }), { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
    // Load tenant policy for cap
    const { data: policy } = await db
      .from("tenant_policies")
      .select("hold_minutes")
      .eq("tenant_id", hold.tenant_id)
      .maybeSingle();
    const defaultHold = Number(policy?.hold_minutes ?? 15);
    const capMinutes = typeof maxTotalMinutes === "number" && maxTotalMinutes > 0 ? maxTotalMinutes : Math.max(defaultHold, 15);

    const createdAt = new Date((hold as any).created_at);
    const hardCapTime = new Date(createdAt.getTime() + capMinutes * 60000);
    const proposed = new Date(Math.max(Date.now(), new Date(hold.expires_at).getTime()) + Number(extendMinutes) * 60000);
    const newExpires = new Date(Math.min(proposed.getTime(), hardCapTime.getTime()));

    if (newExpires.getTime() <= Date.now()) {
      return new Response(JSON.stringify({ error: "Hold cannot be extended further" }), { status: 409, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const { data: updated, error: uErr } = await db
      .from("booking_holds")
      .update({ expires_at: newExpires.toISOString() })
      .eq("id", holdId)
      .select("id, expires_at")
      .single();
    if (uErr) {
      return new Response(JSON.stringify({ error: uErr.message }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    return new Response(JSON.stringify({ ok: true, holdId, expiresAt: updated?.expires_at }), { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (err) {
    console.error("extendHold error", err);
    return new Response(JSON.stringify({ error: String(err) }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
