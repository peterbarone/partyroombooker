import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export const dynamic = "force-dynamic";

function isActiveStatus(status?: string | null) {
  return status === "active" || status === "trialing";
}

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
          // Activate tenant and save Stripe IDs after successful checkout
          await (supabaseAdmin as any)
            .from("tenants")
            .update({
              stripe_customer_id: customerId || null,
              stripe_subscription_id: subscriptionId || null,
              active: true,
              subscription_status: "active",
            })
            .eq("id", tenantId);
        }
        break;
      }
      case "customer.subscription.created":
      case "customer.subscription.updated":
      case "customer.subscription.deleted": {
        const sub = event.data.object as any;
        const customerId = sub.customer as string | undefined;
        const status = (sub.status as string | undefined) || null;
        const periodEnd = sub.current_period_end ? new Date(sub.current_period_end * 1000).toISOString() : null;

        // Fetch matching tenants by customer or subscription id so we can decide whether to toggle `active`
        const { data: tenants } = await (supabaseAdmin as any)
          .from("tenants")
          .select("id, active, subscription_status, stripe_customer_id, stripe_subscription_id")
          .or(`stripe_customer_id.eq.${customerId},stripe_subscription_id.eq.${sub.id}`);

        if (tenants && tenants.length > 0) {
          for (const t of tenants) {
            // Determine if `active` was previously managed by billing (matches prior derived state)
            const prevDerived = isActiveStatus(t.subscription_status);
            const nextDerived = isActiveStatus(status);
            const shouldUpdateActive = t.active === prevDerived;

            const update: any = {
              stripe_subscription_id: sub.id,
              subscription_status: status,
              subscription_current_period_end: periodEnd,
            };
            if (shouldUpdateActive) {
              update.active = nextDerived;
            }

            await (supabaseAdmin as any)
              .from("tenants")
              .update(update)
              .eq("id", t.id);
          }
        }
        break;
      }
      case "invoice.payment_failed": {
        const inv = event.data.object as any;
        const customerId = inv.customer as string | undefined;
        if ((supabaseAdmin as any) && customerId) {
          // Fetch tenant to decide whether to toggle `active`
          const { data: tenants } = await (supabaseAdmin as any)
            .from("tenants")
            .select("id, active, subscription_status")
            .eq("stripe_customer_id", customerId);

          if (tenants && tenants.length > 0) {
            for (const t of tenants) {
              const prevDerived = isActiveStatus(t.subscription_status);
              const shouldUpdateActive = t.active === prevDerived;
              const update: any = { subscription_status: "past_due" };
              if (shouldUpdateActive) update.active = false;
              await (supabaseAdmin as any)
                .from("tenants")
                .update(update)
                .eq("id", t.id);
            }
          }
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
