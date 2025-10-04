"use client";

import { useEffect, useMemo, useState } from "react";
import AdminLayout from "../../../../components/AdminLayout";
import { supabase } from "@/lib/supabase";

interface WaiversPageProps {
  params: { tenant: string };
}

type UIWaiver = {
  id: string;
  booking_id?: string;
  signer_name?: string;
  signer_email?: string;
  signed_at?: string | null;
  method?: string | null; // 'online' | 'in_person'
  file_url?: string | null;
};

export default function WaiversPage({ params }: WaiversPageProps) {
  const tenant = params.tenant;

  const [tenantId, setTenantId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [waivers, setWaivers] = useState<UIWaiver[]>([]);

  // Filters
  const [method, setMethod] = useState<string>("all");
  const [query, setQuery] = useState("");
  const [range, setRange] = useState("last_30_days");

  // Create form
  const [bookingId, setBookingId] = useState("");
  const [signerName, setSignerName] = useState("");
  const [signerEmail, setSignerEmail] = useState("");
  const [fileUrl, setFileUrl] = useState("");
  const [wMethod, setWMethod] = useState("online");

  const load = async () => {
    setLoading(true);
    try {
      const { data: t } = await supabase
        .from("tenants")
        .select("id")
        .eq("slug", tenant)
        .eq("active", true)
        .single();
      if (!t?.id) {
        setTenantId(null);
        setWaivers([]);
        return;
      }
      setTenantId(t.id);

      // Date range
      const now = new Date();
      let start = new Date(now);
      if (range === "last_7_days") start.setDate(now.getDate() - 6);
      else if (range === "last_30_days") start.setDate(now.getDate() - 29);
      else if (range === "last_90_days") start.setDate(now.getDate() - 89);
      else if (range === "this_year") start = new Date(now.getFullYear(), 0, 1);
      else start.setDate(now.getDate() - 29);

      let q = supabase
        .from("waivers")
        .select("id,booking_id,signer_name,signer_email,signed_at,method,file_url,created_at")
        .eq("tenant_id", t.id)
        .gte("created_at", start.toISOString())
        .lte("created_at", now.toISOString())
        .order("created_at", { ascending: false });

      const { data } = await q;
      setWaivers(
        (data || []).map((w: any) => ({
          id: w.id,
          booking_id: w.booking_id || undefined,
          signer_name: w.signer_name || "",
          signer_email: w.signer_email || "",
          signed_at: w.signed_at || null,
          method: w.method || null,
          file_url: w.file_url || null,
        }))
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tenant, range]);

  const filtered = useMemo(() => {
    return waivers.filter((w) => {
      if (method !== "all" && (w.method || "") !== method) return false;
      if (query) {
        const s = query.toLowerCase();
        const hay = `${w.id} ${w.booking_id || ""} ${w.signer_name || ""} ${w.signer_email || ""}`.toLowerCase();
        if (!hay.includes(s)) return false;
      }
      return true;
    });
  }, [waivers, method, query]);

  const createWaiver = async () => {
    if (!tenantId) return;
    setSaving(true);
    try {
      await supabase.from("waivers").insert({
        tenant_id: tenantId,
        booking_id: bookingId || null,
        signer_name: signerName || null,
        signer_email: signerEmail || null,
        file_url: fileUrl || null,
        method: wMethod,
        signed_at: null,
      });
      setBookingId("");
      setSignerName("");
      setSignerEmail("");
      setFileUrl("");
      setWMethod("online");
      await load();
    } finally {
      setSaving(false);
    }
  };

  const deleteWaiver = async (id: string) => {
    if (!tenantId) return;
    setSaving(true);
    try {
      await supabase.from("waivers").delete().eq("tenant_id", tenantId).eq("id", id);
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
          <p className="text-gray-600">Loading waivers...</p>
        </div>
      </div>
    );
  }

  return (
    <AdminLayout tenant={tenant}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Waivers</h1>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm text-gray-600 mb-1">Method</label>
              <select
                value={method}
                onChange={(e) => setMethod(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              >
                <option value="all">All</option>
                <option value="online">Online</option>
                <option value="in_person">In Person</option>
              </select>
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Date Range</label>
              <select
                value={range}
                onChange={(e) => setRange(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              >
                <option value="last_7_days">Last 7 Days</option>
                <option value="last_30_days">Last 30 Days</option>
                <option value="last_90_days">Last 90 Days</option>
                <option value="this_year">This Year</option>
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm text-gray-600 mb-1">Search</label>
              <input
                type="text"
                placeholder="Search by id, booking, signer, email..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>
          </div>
        </div>

        {/* Create */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Add Waiver</h2>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
            <div>
              <label className="block text-sm text-gray-600 mb-1">Booking ID (optional)</label>
              <input
                type="text"
                value={bookingId}
                onChange={(e) => setBookingId(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Signer Name</label>
              <input
                type="text"
                value={signerName}
                onChange={(e) => setSignerName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Signer Email</label>
              <input
                type="email"
                value={signerEmail}
                onChange={(e) => setSignerEmail(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Method</label>
              <select
                value={wMethod}
                onChange={(e) => setWMethod(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              >
                <option value="online">Online</option>
                <option value="in_person">In Person</option>
              </select>
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">File URL</label>
              <input
                type="url"
                value={fileUrl}
                onChange={(e) => setFileUrl(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>
          </div>
          <div className="mt-4">
            <button
              onClick={createWaiver}
              disabled={saving}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {saving ? "Saving..." : "+ Add Waiver"}
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Booking</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Signer</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Method</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Signed</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">File</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filtered.map((w: any) => (
                  <tr key={w.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{w.id.split("-")[0]}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{w.booking_id || ""}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{w.signer_name || ""}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{w.signer_email || ""}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 capitalize">{w.method || ""}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{w.signed_at ? new Date(w.signed_at).toLocaleString() : "—"}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-600 underline">
                      {w.file_url ? (
                        <a href={w.file_url} target="_blank" rel="noreferrer">
                          Open
                        </a>
                      ) : (
                        ""
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-900">
                      <button
                        onClick={() => deleteWaiver(w.id)}
                        disabled={saving}
                        className="px-3 py-1 rounded bg-red-50 text-red-700 hover:bg-red-100 disabled:opacity-50"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {filtered.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500">No waivers found for the selected filters.</p>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
