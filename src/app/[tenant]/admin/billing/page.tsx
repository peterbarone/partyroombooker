"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import AdminLayout from "../../../../components/AdminLayout";
import { supabase } from "@/lib/supabase";

export default function BillingPage() {
  const params = useParams<{ tenant: string }>();
  const tenant = (params?.tenant as string) || "";

  const [loading, setLoading] = useState(true);
  const [subStatus, setSubStatus] = useState<string | null>(null);
  const [periodEnd, setPeriodEnd] = useState<string | null>(null);
  const [customerId, setCustomerId] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("tenants")
        .select("id, stripe_customer_id, subscription_status, subscription_current_period_end")
        .eq("slug", tenant)
        .single();
      if (!error && data) {
        setSubStatus(data.subscription_status || null);
        setCustomerId(data.stripe_customer_id || null);
        const end = data.subscription_current_period_end ? new Date(data.subscription_current_period_end).toLocaleString() : null;
        setPeriodEnd(end);
      }
      setLoading(false);
    };
    load();
  }, [tenant]);

  const subscribe = async () => {
    const res = await fetch("/api/billing/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tenantSlug: tenant }),
    });
    const j = await res.json();
    if (j?.url) window.location.href = j.url as string;
  };

  const managePortal = async () => {
    const res = await fetch("/api/billing/portal", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tenantSlug: tenant }),
    });
    const j = await res.json();
    if (j?.url) window.location.href = j.url as string;
  };

  return (
    <AdminLayout tenant={tenant}>
      <div className="max-w-2xl">
        <h1 className="text-2xl font-bold mb-4">Billing</h1>
        {loading ? (
          <div>Loading…</div>
        ) : (
          <div className="space-y-4">
            <div className="p-4 border rounded bg-white">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm text-gray-600">Subscription status</div>
                  <div className="text-lg font-semibold">{subStatus || "none"}</div>
                  {periodEnd && (
                    <div className="text-xs text-gray-600">Renews: {periodEnd}</div>
                  )}
                </div>
                <div className="flex gap-2">
                  <button onClick={subscribe} className="px-4 py-2 bg-blue-600 text-white rounded">Subscribe</button>
                  <button onClick={managePortal} disabled={!customerId} className="px-4 py-2 border rounded disabled:opacity-50">Manage</button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
