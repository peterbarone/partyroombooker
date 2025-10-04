"use client";

import { useEffect, useMemo, useState } from "react";
import AdminLayout from "../../../../components/AdminLayout";
import { supabase } from "@/lib/supabase";

interface BlackoutsPageProps {
  params: { tenant: string };
}

type UIBlackout = {
  id: string;
  start_date: string; // YYYY-MM-DD
  end_date: string; // YYYY-MM-DD
  reason?: string;
  active: boolean;
};

export default function BlackoutsPage({ params }: BlackoutsPageProps) {
  const tenant = params.tenant;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [blackouts, setBlackouts] = useState<UIBlackout[]>([]);

  // New blackout form
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [reason, setReason] = useState("");
  const [active, setActive] = useState(true);

  const [tenantId, setTenantId] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const { data: tenantRow } = await supabase
        .from("tenants")
        .select("id")
        .eq("slug", tenant)
        .eq("active", true)
        .single();
      if (!tenantRow?.id) {
        setTenantId(null);
        setBlackouts([]);
        return;
      }
      setTenantId(tenantRow.id);

      const { data } = await supabase
        .from("blackouts")
        .select("id,start_date,end_date,reason,active")
        .eq("tenant_id", tenantRow.id)
        .order("start_date", { ascending: false });

      const ui: UIBlackout[] = (data || []).map((b: any) => ({
        id: b.id,
        start_date: b.start_date,
        end_date: b.end_date,
        reason: b.reason || "",
        active: !!b.active,
      }));
      setBlackouts(ui);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tenant]);

  const addBlackout = async () => {
    if (!tenantId) return;
    if (!start || !end) return;
    if (new Date(start) > new Date(end)) return;
    setSaving(true);
    try {
      await supabase.from("blackouts").insert({
        tenant_id: tenantId,
        start_date: start,
        end_date: end,
        reason: reason || null,
        active,
      });
      setStart("");
      setEnd("");
      setReason("");
      setActive(true);
      await load();
    } finally {
      setSaving(false);
    }
  };

  const removeBlackout = async (id: string) => {
    if (!tenantId) return;
    setSaving(true);
    try {
      await supabase.from("blackouts").delete().eq("tenant_id", tenantId).eq("id", id);
      await load();
    } finally {
      setSaving(false);
    }
  };

  const toggleActive = async (id: string, value: boolean) => {
    if (!tenantId) return;
    setSaving(true);
    try {
      await supabase.from("blackouts").update({ active: value }).eq("tenant_id", tenantId).eq("id", id);
      await load();
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading blackouts...</p>
        </div>
      </div>
    );
  }

  return (
    <AdminLayout tenant={tenant}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Blackouts</h1>
        </div>

        {/* Create blackout */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
            <div>
              <label className="block text-sm text-gray-600 mb-1">Start Date</label>
              <input
                type="date"
                value={start}
                onChange={(e) => setStart(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">End Date</label>
              <input
                type="date"
                value={end}
                onChange={(e) => setEnd(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm text-gray-600 mb-1">Reason</label>
              <input
                type="text"
                placeholder="Maintenance, holiday, private event..."
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>
            <div className="flex items-center space-x-2">
              <input
                id="active"
                type="checkbox"
                checked={active}
                onChange={(e) => setActive(e.target.checked)}
              />
              <label htmlFor="active" className="text-sm text-gray-700">Active</label>
            </div>
          </div>
          <div className="mt-4">
            <button
              onClick={addBlackout}
              disabled={saving || !start || !end || new Date(start) > new Date(end)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {saving ? "Saving..." : "+ Add Blackout"}
            </button>
          </div>
        </div>

        {/* List */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Start</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">End</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reason</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Active</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {blackouts.map((b) => (
                  <tr key={b.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{b.start_date}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{b.end_date}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{b.reason || ""}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${b.active ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}`}>
                        {b.active ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-900">
                      <div className="flex justify-end space-x-2">
                        <button
                          onClick={() => toggleActive(b.id, !b.active)}
                          disabled={saving}
                          className="px-3 py-1 rounded bg-blue-50 text-blue-700 hover:bg-blue-100 disabled:opacity-50"
                        >
                          {b.active ? "Deactivate" : "Activate"}
                        </button>
                        <button
                          onClick={() => removeBlackout(b.id)}
                          disabled={saving}
                          className="px-3 py-1 rounded bg-red-50 text-red-700 hover:bg-red-100 disabled:opacity-50"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {blackouts.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500">No blackouts created yet.</p>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
