"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import AdminLayout from "../../../../components/AdminLayout";
import { supabase } from "@/lib/supabase";

// params are accessed via useParams() in a client component

type UIAddon = {
  id: string;
  name: string;
  description?: string | null;
  unit?: string | null;
  price: number;
  taxable: boolean;
  active: boolean;
};

export default function AddonsPage() {
  const params = useParams<{ tenant: string }>();
  const tenant = (params?.tenant as string) || "";

  const [tenantId, setTenantId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [addons, setAddons] = useState<UIAddon[]>([]);

  // Filters / search
  const [showInactive, setShowInactive] = useState(false);
  const [query, setQuery] = useState("");

  // Create form
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [unit, setUnit] = useState("");
  const [price, setPrice] = useState<number>(0);
  const [taxable, setTaxable] = useState(true);
  const [active, setActive] = useState(true);

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
        setAddons([]);
        return;
      }
      setTenantId(t.id);

      const { data } = await supabase
        .from("addons")
        .select("id,name,description,unit,price,price_cents,taxable,active")
        .eq("tenant_id", t.id)
        .order("name");

      setAddons(
        (data || []).map((a: any) => ({
          id: a.id,
          name: a.name,
          description: a.description || null,
          unit: a.unit || null,
          price: a.price ?? (a.price_cents ? a.price_cents / 100 : 0),
          taxable: !!a.taxable,
          active: !!a.active,
        }))
      );
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
    return addons.filter((a) => {
      if (!showInactive && !a.active) return false;
      if (!s) return true;
      return (
        a.name.toLowerCase().includes(s) ||
        (a.description || "").toLowerCase().includes(s) ||
        (a.unit || "").toLowerCase().includes(s)
      );
    });
  }, [addons, showInactive, query]);

  const createAddon = async () => {
    if (!tenantId || !name) return;
    setSaving(true);
    try {
      await supabase.from("addons").insert({
        tenant_id: tenantId,
        name,
        description: description || null,
        unit: unit || null,
        price,
        price_cents: Math.round(price * 100),
        taxable,
        active,
      });
      setName("");
      setDescription("");
      setUnit("");
      setPrice(0);
      setTaxable(true);
      setActive(true);
      await load();
    } finally {
      setSaving(false);
    }
  };

  const updateAddon = async (addon: UIAddon) => {
    if (!tenantId) return;
    setSaving(true);
    try {
      await supabase
        .from("addons")
        .update({
          name: addon.name,
          description: addon.description || null,
          unit: addon.unit || null,
          price: addon.price,
          price_cents: Math.round((addon.price || 0) * 100),
          taxable: addon.taxable,
          active: addon.active,
        })
        .eq("tenant_id", tenantId)
        .eq("id", addon.id);
      await load();
    } finally {
      setSaving(false);
    }
  };

  const deleteAddon = async (id: string) => {
    if (!tenantId) return;
    setSaving(true);
    try {
      await supabase.from("addons").delete().eq("tenant_id", tenantId).eq("id", id);
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
          <p className="text-gray-600">Loading add-ons...</p>
        </div>
      </div>
    );
  }

  return (
    <AdminLayout tenant={tenant}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Add-ons</h1>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
            <div>
              <label className="block text-sm text-gray-600 mb-1">Search</label>
              <input
                type="text"
                placeholder="Search name, description, unit"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>
            <div className="flex items-center space-x-2">
              <input
                id="showInactive"
                type="checkbox"
                checked={showInactive}
                onChange={(e) => setShowInactive(e.target.checked)}
              />
              <label htmlFor="showInactive" className="text-sm text-gray-700">Show Inactive</label>
            </div>
          </div>
        </div>

        {/* Create */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Add Add-on</h2>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
            <div>
              <label className="block text-sm text-gray-600 mb-1">Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Unit</label>
              <input
                type="text"
                placeholder="each, hour, slice..."
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Price</label>
              <input
                type="number"
                step="0.01"
                value={price}
                onChange={(e) => setPrice(Number(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>
            <div className="flex items-center space-x-2">
              <input
                id="taxable"
                type="checkbox"
                checked={taxable}
                onChange={(e) => setTaxable(e.target.checked)}
              />
              <label htmlFor="taxable" className="text-sm text-gray-700">Taxable</label>
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
              onClick={createAddon}
              disabled={saving || !name}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {saving ? "Saving..." : "+ Add Add-on"}
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Unit</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Taxable</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Active</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filtered.map((a) => (
                  <tr key={a.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <input
                        type="text"
                        value={a.name}
                        onChange={(e) =>
                          setAddons((prev) => prev.map((r) => (r.id === a.id ? { ...r, name: e.target.value } : r)))
                        }
                        onBlur={() => updateAddon(a)}
                        className="w-56 px-2 py-1 border border-gray-300 rounded"
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <input
                        type="text"
                        value={a.unit || ""}
                        onChange={(e) =>
                          setAddons((prev) => prev.map((r) => (r.id === a.id ? { ...r, unit: e.target.value } : r)))
                        }
                        onBlur={() => updateAddon(a)}
                        className="w-40 px-2 py-1 border border-gray-300 rounded"
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                      <input
                        type="number"
                        step="0.01"
                        value={a.price}
                        onChange={(e) =>
                          setAddons((prev) =>
                            prev.map((r) => (r.id === a.id ? { ...r, price: Number(e.target.value) } : r))
                          )
                        }
                        onBlur={() => updateAddon(a)}
                        className="w-28 px-2 py-1 border border-gray-300 rounded text-right"
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <input
                        type="checkbox"
                        checked={a.taxable}
                        onChange={(e) => updateAddon({ ...a, taxable: e.target.checked })}
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <input
                        type="checkbox"
                        checked={a.active}
                        onChange={(e) => updateAddon({ ...a, active: e.target.checked })}
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-900">
                      <button
                        onClick={() => deleteAddon(a.id)}
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
              <p className="text-gray-500">No add-ons found.</p>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
