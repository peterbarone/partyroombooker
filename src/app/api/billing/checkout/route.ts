import { NextResponse } from "next/server";
import { stripe, PRICE_ID, SITE_URL } from "@/lib/stripe";
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

    // Ensure a Stripe Customer for this tenant
    let customerId = tenant.stripe_customer_id as string | null;
    if (!customerId) {
      const customer = await stripe.customers.create({
        name: tenant.slug,
        metadata: { tenant_id: tenant.id },
      });
      customerId = customer.id;
      await (supabaseAdmin as any)
        .from("tenants")
        .update({ stripe_customer_id: customerId })
        .eq("id", tenant.id);
    }

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      line_items: [{ price: PRICE_ID, quantity: 1 }],
      customer: customerId || undefined,
      success_url: `${SITE_URL}/${tenant.slug}/admin/billing?session=success`,
      cancel_url: `${SITE_URL}/${tenant.slug}/admin/billing?session=cancel`,
      metadata: { tenant_id: tenant.id },
      allow_promotion_codes: false,
    });

    return NextResponse.json({ url: session.url });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Unexpected error" }, { status: 500 });
  }
}
