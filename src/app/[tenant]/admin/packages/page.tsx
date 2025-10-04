"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import AdminLayout from "../../../../components/AdminLayout";
import { supabase } from "@/lib/supabase";

// params are accessed via useParams() in client components

type UIPackage = {
  id: string;
  name: string;
  description?: string | null;
  base_price: number;
  base_kids: number;
  extra_kid_price: number;
  duration_minutes: number;
  includes_json: any;
  active: boolean;
};

export default function PackagesPage() {
  const params = useParams<{ tenant: string }>();
  const tenant = (params?.tenant as string) || "";

  const [tenantId, setTenantId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [packages, setPackages] = useState<UIPackage[]>([]);
  const [query, setQuery] = useState("");
  const [showInactive, setShowInactive] = useState(false);

  // Create form
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [basePrice, setBasePrice] = useState<number>(0);
  const [baseKids, setBaseKids] = useState<number>(10);
  const [extraKidPrice, setExtraKidPrice] = useState<number>(0);
  const [duration, setDuration] = useState<number>(120);
  const [includes, setIncludes] = useState<string>(""); // JSON text
  const [active, setActive] = useState<boolean>(true);

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
        setPackages([]);
        return;
      }
      setTenantId(t.id);

      const { data } = await supabase
        .from("packages")
        .select("id,name,description,base_price,base_price_cents,base_kids,extra_kid_price,extra_child_price_cents,duration_minutes,includes_json,includes,active")
        .eq("tenant_id", t.id)
        .order("name");

      const pkgs: UIPackage[] = (data || []).map((p: any) => ({
        id: p.id,
        name: p.name || "",
        description: p.description || null,
        base_price: p.base_price ?? (p.base_price_cents ? p.base_price_cents / 100 : 0),
        base_kids: Number(p.base_kids || 0),
        extra_kid_price: p.extra_kid_price ?? (p.extra_child_price_cents ? p.extra_child_price_cents / 100 : 0),
        duration_minutes: Number(p.duration_minutes || 0),
        includes_json: p.includes_json ?? p.includes ?? {},
        active: !!p.active,
      }));
      setPackages(pkgs);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tenant]);

  const filtered = useMemo(() => {
    const s = query.toLowerCase();
    return packages.filter((p) => {
      if (!showInactive && !p.active) return false;
      if (!s) return true;
      return (
        p.name.toLowerCase().includes(s) ||
        (p.description || "").toLowerCase().includes(s)
      );
    });
  }, [packages, query, showInactive]);

  const parseIncludes = (text: string) => {
    try {
      const obj = text.trim() ? JSON.parse(text) : {};
      return obj;
    } catch {
      return null;
    }
  };

  const createPackage = async () => {
    if (!tenantId || !name) return;
    const parsed = parseIncludes(includes);
    if (includes && parsed === null) return; // invalid JSON; skip
    setSaving(true);
    try {
      await supabase.from("packages").insert({
        tenant_id: tenantId,
        name,
        description: description || null,
        base_price: basePrice,
        base_price_cents: Math.round((basePrice || 0) * 100),
        base_kids: baseKids,
        extra_kid_price: extraKidPrice,
        extra_child_price_cents: Math.round((extraKidPrice || 0) * 100),
        duration_minutes: duration,
        includes_json: parsed ?? {},
        includes: parsed ?? {},
        active,
      });
      // reset
      setName("");
      setDescription("");
      setBasePrice(0);
      setBaseKids(10);
      setExtraKidPrice(0);
      setDuration(120);
      setIncludes("");
      setActive(true);
      await load();
    } finally {
      setSaving(false);
    }
  };

  const updatePackage = async (pkg: UIPackage) => {
    if (!tenantId) return;
    setSaving(true);
    try {
      await supabase
        .from("packages")
        .update({
          name: pkg.name,
          description: pkg.description || null,
          base_price: pkg.base_price,
          base_price_cents: Math.round((pkg.base_price || 0) * 100),
          base_kids: pkg.base_kids,
          extra_kid_price: pkg.extra_kid_price,
          extra_child_price_cents: Math.round((pkg.extra_kid_price || 0) * 100),
          duration_minutes: pkg.duration_minutes,
          includes_json: pkg.includes_json ?? {},
          includes: pkg.includes_json ?? {},
          active: pkg.active,
        })
        .eq("tenant_id", tenantId)
        .eq("id", pkg.id);
      await load();
    } finally {
      setSaving(false);
    }
  };

  const deletePackage = async (id: string) => {
    if (!tenantId) return;
    setSaving(true);
    try {
      await supabase.from("packages").delete().eq("tenant_id", tenantId).eq("id", id);
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
          <p className="text-gray-600">Loading packages...</p>
        </div>
      </div>
    );
  }

  return (
    <AdminLayout tenant={tenant}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Packages</h1>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
            <div>
              <label className="block text-sm text-gray-600 mb-1">Search</label>
              <input
                type="text"
                placeholder="Search name or description"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>
            <div className="flex items-center space-x-2">
              <input id="showInactive" type="checkbox" checked={showInactive} onChange={(e) => setShowInactive(e.target.checked)} />
              <label htmlFor="showInactive" className="text-sm text-gray-700">Show Inactive</label>
            </div>
          </div>
        </div>

        {/* Create */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">Add Package</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm text-gray-600 mb-1">Name</label>
              <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Base Price</label>
              <input type="number" step="0.01" value={basePrice} onChange={(e) => setBasePrice(Number(e.target.value))} className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Base Kids</label>
              <input type="number" value={baseKids} onChange={(e) => setBaseKids(Number(e.target.value))} className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Extra Kid Price</label>
              <input type="number" step="0.01" value={extraKidPrice} onChange={(e) => setExtraKidPrice(Number(e.target.value))} className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Duration (min)</label>
              <input type="number" value={duration} onChange={(e) => setDuration(Number(e.target.value))} className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
            </div>
            <div className="md:col-span-3">
              <label className="block text-sm text-gray-600 mb-1">Description</label>
              <input type="text" value={description} onChange={(e) => setDescription(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
            </div>
            <div className="md:col-span-3">
              <label className="block text-sm text-gray-600 mb-1">Includes (JSON)</label>
              <textarea value={includes} onChange={(e) => setIncludes(e.target.value)} rows={3} className="w-full px-3 py-2 border border-gray-300 rounded-lg" placeholder='{"pizza": true, "balloons": 10}' />
              {includes && parseIncludes(includes) === null && (
                <p className="text-xs text-red-600 mt-1">Invalid JSON</p>
              )}
            </div>
            <div className="flex items-center space-x-2">
              <input id="active" type="checkbox" checked={active} onChange={(e) => setActive(e.target.checked)} />
              <label htmlFor="active" className="text-sm text-gray-700">Active</label>
            </div>
          </div>
          <div>
            <button onClick={createPackage} disabled={saving || !name || (!!includes && parseIncludes(includes) === null)} className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50">{saving ? "Saving..." : "+ Add Package"}</button>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Base</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Base Kids</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Extra Kid</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Duration</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Active</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filtered.map((p) => (
                  <tr key={p.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <input
                        type="text"
                        value={p.name}
                        onChange={(e) => setPackages((prev) => prev.map((r) => (r.id === p.id ? { ...r, name: e.target.value } : r)))}
                        onBlur={() => updatePackage(p)}
                        className="w-56 px-2 py-1 border border-gray-300 rounded"
                      />
                      <div className="text-xs text-gray-500 mt-1">
                        <input
                          type="text"
                          placeholder="Description"
                          value={p.description || ""}
                          onChange={(e) => setPackages((prev) => prev.map((r) => (r.id === p.id ? { ...r, description: e.target.value } : r)))}
                          onBlur={() => updatePackage(p)}
                          className="w-full px-2 py-1 border border-gray-200 rounded"
                        />
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                      <input
                        type="number"
                        step="0.01"
                        value={p.base_price}
                        onChange={(e) => setPackages((prev) => prev.map((r) => (r.id === p.id ? { ...r, base_price: Number(e.target.value) } : r)))}
                        onBlur={() => updatePackage(p)}
                        className="w-24 px-2 py-1 border border-gray-300 rounded text-right"
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                      <input
                        type="number"
                        value={p.base_kids}
                        onChange={(e) => setPackages((prev) => prev.map((r) => (r.id === p.id ? { ...r, base_kids: Number(e.target.value) } : r)))}
                        onBlur={() => updatePackage(p)}
                        className="w-20 px-2 py-1 border border-gray-300 rounded text-right"
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                      <input
                        type="number"
                        step="0.01"
                        value={p.extra_kid_price}
                        onChange={(e) => setPackages((prev) => prev.map((r) => (r.id === p.id ? { ...r, extra_kid_price: Number(e.target.value) } : r)))}
                        onBlur={() => updatePackage(p)}
                        className="w-24 px-2 py-1 border border-gray-300 rounded text-right"
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                      <input
                        type="number"
                        value={p.duration_minutes}
                        onChange={(e) => setPackages((prev) => prev.map((r) => (r.id === p.id ? { ...r, duration_minutes: Number(e.target.value) } : r)))}
                        onBlur={() => updatePackage(p)}
                        className="w-20 px-2 py-1 border border-gray-300 rounded text-right"
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <input type="checkbox" checked={p.active} onChange={(e) => updatePackage({ ...p, active: e.target.checked })} />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-900">
                      <button onClick={() => deletePackage(p.id)} disabled={saving} className="px-3 py-1 rounded bg-red-50 text-red-700 hover:bg-red-100 disabled:opacity-50">Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {filtered.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500">No packages found.</p>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
