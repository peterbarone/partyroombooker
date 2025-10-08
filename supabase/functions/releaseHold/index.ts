// supabase/functions/releaseHold/index.ts
// Stub: release an existing hold (user canceled or switched selection).
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
    const { holdId } = body ?? {};
    if (!holdId) return new Response(JSON.stringify({ error: "Missing: holdId" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });

    const { data: deleted, error: dErr } = await db
      .from("booking_holds")
      .delete()
      .eq("id", holdId)
      .select("id")
      .single();
    if (dErr) {
      return new Response(JSON.stringify({ error: dErr.message }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
    if (!deleted?.id) {
      return new Response(JSON.stringify({ error: "Hold not found" }), { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    return new Response(JSON.stringify({ ok: true, holdId }), { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (err) {
    console.error("releaseHold error", err);
    return new Response(JSON.stringify({ error: String(err) }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
