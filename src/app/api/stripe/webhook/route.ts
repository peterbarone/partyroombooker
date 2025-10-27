import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    if (!stripe) return NextResponse.json({ error: "Stripe not configured" }, { status: 500 });
    const sig = (req.headers as any).get("stripe-signature");
    const whSecret = process.env.STRIPE_WEBHOOK_SECRET as string | undefined;
    if (!sig || !whSecret) return NextResponse.json({ error: "Missing webhook secret" }, { status: 500 });

    const raw = await req.text();
    let event: any;
    try {
      event = (stripe as any).webhooks.constructEvent(raw, sig, whSecret);
    } catch (err: any) {
      return NextResponse.json({ error: `Invalid signature: ${err.message}` }, { status: 400 });
    }

    switch (event.type) {
      case "checkout.session.completed": {
        const sess = event.data.object as any;
        const tenantId = sess?.metadata?.tenant_id as string | undefined;
        const subscriptionId = sess?.subscription as string | undefined;
        const customerId = sess?.customer as string | undefined;
        if (tenantId && (supabaseAdmin as any)) {
          await (supabaseAdmin as any)
            .from("tenants")
            .update({ stripe_customer_id: customerId || null, stripe_subscription_id: subscriptionId || null })
            .eq("id", tenantId);
        }
        break;
      }
      case "customer.subscription.created":
      case "customer.subscription.updated":
      case "customer.subscription.deleted": {
        const sub = event.data.object as any;
        const customerId = sub.customer as string | undefined;
        const status = sub.status as string | undefined;
        const periodEnd = sub.current_period_end ? new Date(sub.current_period_end * 1000).toISOString() : null;
        if ((supabaseAdmin as any)) {
          await (supabaseAdmin as any)
            .from("tenants")
            .update({
              stripe_subscription_id: sub.id,
              subscription_status: status || null,
              subscription_current_period_end: periodEnd,
            })
            .or(`stripe_customer_id.eq.${customerId},stripe_subscription_id.eq.${sub.id}`);
        }
        break;
      }
      case "invoice.payment_failed": {
        const inv = event.data.object as any;
        const customerId = inv.customer as string | undefined;
        if ((supabaseAdmin as any) && customerId) {
          await (supabaseAdmin as any)
            .from("tenants")
            .update({ subscription_status: "past_due" })
            .eq("stripe_customer_id", customerId);
        }
        break;
      }
      default:
        break;
    }

    return NextResponse.json({ received: true });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Unexpected error" }, { status: 500 });
  }
}
