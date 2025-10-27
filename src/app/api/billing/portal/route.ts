import { NextResponse } from "next/server";
import { stripe, SITE_URL } from "@/lib/stripe";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function POST(req: Request) {
  try {
    if (!stripe) return NextResponse.json({ error: "Stripe not configured" }, { status: 500 });
    const body = await req.json();
    const tenantSlug = String(body?.tenantSlug || "").trim();
    if (!tenantSlug) return NextResponse.json({ error: "tenantSlug required" }, { status: 400 });

    const { data: tenant, error } = await (supabaseAdmin as any)
      .from("tenants")
      .select("id, slug, stripe_customer_id")
      .eq("slug", tenantSlug)
      .single();
    if (error || !tenant?.id) return NextResponse.json({ error: "Tenant not found" }, { status: 404 });
    if (!tenant.stripe_customer_id) return NextResponse.json({ error: "Customer not found. Subscribe first." }, { status: 400 });

    const session = await stripe.billingPortal.sessions.create({
      customer: tenant.stripe_customer_id,
      return_url: `${SITE_URL}/${tenant.slug}/admin/billing`,
    });

    return NextResponse.json({ url: session.url });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Unexpected error" }, { status: 500 });
  }
}
