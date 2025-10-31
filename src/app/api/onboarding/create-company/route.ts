import { NextResponse } from "next/server";
import { stripe, PRICE_ID, SITE_URL } from "@/lib/stripe";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";

// Helper function to create a URL-safe slug
function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export async function POST(req: Request) {
  try {
    // Get the authenticated user from the request
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      return NextResponse.json(
        { error: "Supabase configuration missing" },
        { status: 500 }
      );
    }

    // Get session from authorization header
    const authHeader = req.headers.get("authorization");
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: {
        headers: authHeader ? { Authorization: authHeader } : {},
      },
    });

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: "Unauthorized. Please sign in first." },
        { status: 401 }
      );
    }

    const body = await req.json();
    const {
      companyName,
      streetAddress,
      address2,
      city,
      state,
      postalCode,
      country,
      phone,
      email,
    } = body;

    // Validate inputs
    if (!companyName || !streetAddress || !city || !state || !postalCode || !country || !phone || !email) {
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 }
      );
    }

    const composedAddress = [
      streetAddress,
      address2 && address2.trim() ? address2 : null,
      `${city}, ${state} ${postalCode}`,
      country,
    ]
      .filter(Boolean)
      .join("\n");

    // Create unique slug
    let slug = slugify(companyName);
    let slugSuffix = 0;

    // Check if slug exists, add number if needed
    while (true) {
      const testSlug = slugSuffix > 0 ? `${slug}-${slugSuffix}` : slug;
      const { data: existing } = await supabaseAdmin
        .from("tenants")
        .select("id")
        .eq("slug", testSlug)
        .single();

      if (!existing) {
        slug = testSlug;
        break;
      }
      slugSuffix++;
    }

    // 1. Create tenant record
    const { data: tenant, error: tenantError } = await supabaseAdmin
      .from("tenants")
      .insert({
        slug,
        name: companyName,
        contact_address: composedAddress,
        contact_phone: phone,
        contact_email: email,
        active: false, // Will be activated after successful payment
        timezone: "America/New_York",
        currency: "USD",
      })
      .select()
      .single();

    if (tenantError || !tenant) {
      console.error("Error creating tenant:", tenantError);
      return NextResponse.json(
        { error: "Failed to create company" },
        { status: 500 }
      );
    }

    // 2. Create default tenant policies
    await supabaseAdmin.from("tenant_policies").insert({
      tenant_id: tenant.id,
      buffer_minutes: 30,
      refund_days_full: 7,
      reschedule_window_days: 60,
      tax_rate: 0.0875,
      deposit_percent: 50,
      duration_minutes: 120,
    });

    // 3. Link user to tenant as owner
    const { error: userTenantError } = await supabaseAdmin
      .from("user_tenants")
      .insert({
        user_id: user.id,
        tenant_id: tenant.id,
        role: "owner",
        permissions: ["all"],
      });

    if (userTenantError) {
      console.error("Error linking user to tenant:", userTenantError);
      // Don't fail here, tenant is created
    }

    // 4. Create Stripe customer if Stripe is configured
    if (stripe && PRICE_ID) {
      try {
        const customer = await stripe.customers.create({
          name: companyName,
          email: email,
          phone: phone,
          address: {
            line1: streetAddress,
            line2: address2 || undefined,
            city: city,
            state: state,
            postal_code: postalCode,
            country: country,
          },
          metadata: {
            tenant_id: tenant.id,
            tenant_slug: slug,
          },
        });

        // Update tenant with Stripe customer ID
        await supabaseAdmin
          .from("tenants")
          .update({ stripe_customer_id: customer.id })
          .eq("id", tenant.id);

        // 5. Create Stripe checkout session
        const session = await stripe.checkout.sessions.create({
          customer: customer.id,
          mode: "subscription",
          line_items: [{ price: PRICE_ID, quantity: 1 }],
          success_url: `${SITE_URL}/${slug}/admin?setup=success`,
          cancel_url: `${SITE_URL}/setup/company?setup=cancel`,
          metadata: {
            tenant_id: tenant.id,
            tenant_slug: slug,
          },
          allow_promotion_codes: true,
        });

        return NextResponse.json({
          tenantSlug: slug,
          tenantId: tenant.id,
          checkoutUrl: session.url,
        });
      } catch (stripeError: any) {
        console.error("Stripe error:", stripeError);
        // Stripe failed, but tenant is created - activate it anyway
        await supabaseAdmin
          .from("tenants")
          .update({ active: true })
          .eq("id", tenant.id);

        return NextResponse.json({
          tenantSlug: slug,
          tenantId: tenant.id,
          warning: "Payment setup failed, but account created",
        });
      }
    } else {
      // No Stripe configured - activate tenant immediately
      await supabaseAdmin
        .from("tenants")
        .update({ active: true })
        .eq("id", tenant.id);

      return NextResponse.json({
        tenantSlug: slug,
        tenantId: tenant.id,
        message: "Company created successfully",
      });
    }
  } catch (error: any) {
    console.error("Onboarding error:", error);
    return NextResponse.json(
      { error: error.message || "An unexpected error occurred" },
      { status: 500 }
    );
  }
}
