"use client";

import { useEffect, useState } from "react";
import AdminLayout from "../../../../components/AdminLayout";
import { supabase } from "@/lib/supabase";

interface SettingsPageProps {
  params: { tenant: string };
}

type TenantRow = {
  id: string;
  slug: string;
  name: string;
  timezone: string;
  currency: string;
  active: boolean;
};

type PolicyRow = {
  buffer_minutes: number | null;
  refund_days_full: number | null;
  reschedule_window_days: number | null;
  tax_rate: number | null;
  deposit_percent: number | null;
  duration_minutes: number | null;
  cancellation_policy: string | null;
  arrival_note: string | null;
};

type IntegrationRow = {
  clover_merchant_id: string | null;
  clover_api_token: string | null;
  clover_webhook_secret: string | null;
};

export default function SettingsPage({ params }: SettingsPageProps) {
  const tenantSlug = params.tenant;
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [tenant, setTenant] = useState<TenantRow | null>(null);
  const [policies, setPolicies] = useState<PolicyRow | null>(null);
  const [integrations, setIntegrations] = useState<IntegrationRow | null>(null);

  const [tenantId, setTenantId] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const { data: t } = await supabase
        .from("tenants")
        .select("id,slug,name,timezone,currency,active")
        .eq("slug", tenantSlug)
        .single();
      if (!t?.id) {
        setTenant(null);
        setPolicies(null);
        setIntegrations(null);
        return;
      }
      setTenantId(t.id);
      setTenant(t as TenantRow);

      const [{ data: p }, { data: i }] = await Promise.all([
        supabase
          .from("tenant_policies")
          .select(
            "buffer_minutes,refund_days_full,reschedule_window_days,tax_rate,deposit_percent,duration_minutes,cancellation_policy,arrival_note"
          )
          .eq("tenant_id", t.id)
          .maybeSingle(),
        supabase
          .from("tenant_integrations")
          .select("clover_merchant_id,clover_api_token,clover_webhook_secret")
          .eq("tenant_id", t.id)
          .maybeSingle(),
      ]);
      setPolicies((p as PolicyRow) || {
        buffer_minutes: 30,
        refund_days_full: 7,
        reschedule_window_days: 60,
        tax_rate: 0.0875,
        deposit_percent: 0,
        duration_minutes: 120,
        cancellation_policy: "",
        arrival_note: "",
      });
      setIntegrations((i as IntegrationRow) || {
        clover_merchant_id: "",
        clover_api_token: "",
        clover_webhook_secret: "",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tenantSlug]);

  const saveTenant = async () => {
    if (!tenantId || !tenant) return;
    setSaving(true);
    try {
      await supabase
        .from("tenants")
        .update({
          name: tenant.name,
          timezone: tenant.timezone,
          currency: tenant.currency,
          active: tenant.active,
        })
        .eq("id", tenantId);
      await load();
    } finally {
      setSaving(false);
    }
  };

  const savePolicies = async () => {
    if (!tenantId || !policies) return;
    setSaving(true);
    try {
      // Upsert by tenant_id unique
      await supabase.from("tenant_policies").upsert({
        tenant_id: tenantId,
        ...policies,
      }, { onConflict: "tenant_id" });
      await load();
    } finally {
      setSaving(false);
    }
  };

  const saveIntegrations = async () => {
    if (!tenantId || !integrations) return;
    setSaving(true);
    try {
      await supabase.from("tenant_integrations").upsert({
        tenant_id: tenantId,
        ...integrations,
      }, { onConflict: "tenant_id" });
      await load();
    } finally {
      setSaving(false);
    }
  };

  if (loading || !tenant || !policies || !integrations) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading settings...</p>
        </div>
      </div>
    );
  }

  return (
    <AdminLayout tenant={tenantSlug}>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>

        {/* Tenant */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">Tenant</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
            <div>
              <label className="block text-sm text-gray-600 mb-1">Name</label>
              <input
                type="text"
                value={tenant.name}
                onChange={(e) => setTenant({ ...tenant, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Timezone</label>
              <input
                type="text"
                value={tenant.timezone || ""}
                onChange={(e) => setTenant({ ...tenant, timezone: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                placeholder="America/New_York"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Currency</label>
              <input
                type="text"
                value={tenant.currency || "USD"}
                onChange={(e) => setTenant({ ...tenant, currency: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>
            <div className="flex items-center space-x-2">
              <input
                id="active"
                type="checkbox"
                checked={tenant.active}
                onChange={(e) => setTenant({ ...tenant, active: e.target.checked })}
              />
              <label htmlFor="active" className="text-sm text-gray-700">Active</label>
            </div>
          </div>
          <div>
            <button
              onClick={saveTenant}
              disabled={saving}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {saving ? "Saving..." : "Save Tenant"}
            </button>
          </div>
        </div>

        {/* Policies */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">Policies</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm text-gray-600 mb-1">Buffer Minutes</label>
              <input
                type="number"
                value={policies.buffer_minutes ?? 0}
                onChange={(e) => setPolicies({ ...policies, buffer_minutes: Number(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Refund (days full)</label>
              <input
                type="number"
                value={policies.refund_days_full ?? 0}
                onChange={(e) => setPolicies({ ...policies, refund_days_full: Number(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Reschedule Window (days)</label>
              <input
                type="number"
                value={policies.reschedule_window_days ?? 0}
                onChange={(e) => setPolicies({ ...policies, reschedule_window_days: Number(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Tax Rate</label>
              <input
                type="number"
                step="0.0001"
                value={policies.tax_rate ?? 0}
                onChange={(e) => setPolicies({ ...policies, tax_rate: Number(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Deposit %</label>
              <input
                type="number"
                value={policies.deposit_percent ?? 0}
                onChange={(e) => setPolicies({ ...policies, deposit_percent: Number(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Default Duration (min)</label>
              <input
                type="number"
                value={policies.duration_minutes ?? 0}
                onChange={(e) => setPolicies({ ...policies, duration_minutes: Number(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-600 mb-1">Cancellation Policy</label>
              <textarea
                value={policies.cancellation_policy || ""}
                onChange={(e) => setPolicies({ ...policies, cancellation_policy: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                rows={4}
              />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Arrival Note</label>
              <textarea
                value={policies.arrival_note || ""}
                onChange={(e) => setPolicies({ ...policies, arrival_note: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                rows={4}
              />
            </div>
          </div>
          <div>
            <button
              onClick={savePolicies}
              disabled={saving}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {saving ? "Saving..." : "Save Policies"}
            </button>
          </div>
        </div>

        {/* Integrations */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">Integrations</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm text-gray-600 mb-1">Clover Merchant ID</label>
              <input
                type="text"
                value={integrations.clover_merchant_id || ""}
                onChange={(e) => setIntegrations({ ...integrations, clover_merchant_id: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Clover API Token</label>
              <input
                type="password"
                value={integrations.clover_api_token || ""}
                onChange={(e) => setIntegrations({ ...integrations, clover_api_token: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Clover Webhook Secret</label>
              <input
                type="password"
                value={integrations.clover_webhook_secret || ""}
                onChange={(e) => setIntegrations({ ...integrations, clover_webhook_secret: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>
          </div>
          <div>
            <button
              onClick={saveIntegrations}
              disabled={saving}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {saving ? "Saving..." : "Save Integrations"}
            </button>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
