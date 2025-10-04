"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import AdminLayout from "../../../../components/AdminLayout";
import { supabase } from "@/lib/supabase";

// params are accessed via useParams() in client components

type UICharacter = {
  id: string;
  slug: string;
  name: string;
  price: number; // dollars
  is_active: boolean;
};

export default function CharactersPage() {
  const params = useParams<{ tenant: string }>();
  const tenant = (params?.tenant as string) || "";

  const [tenantId, setTenantId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [characters, setCharacters] = useState<UICharacter[]>([]);

  const [query, setQuery] = useState("");
  const [showInactive, setShowInactive] = useState(false);

  // Create form
  const [slug, setSlug] = useState("");
  const [name, setName] = useState("");
  const [price, setPrice] = useState<number>(0);
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
        setCharacters([]);
        return;
      }
      setTenantId(t.id);

      const { data } = await supabase
        .from("party_characters")
        .select("id,slug,name,price_cents,is_active")
        .eq("tenant_id", t.id)
        .order("name");

      setCharacters(
        (data || []).map((c: any) => ({
          id: c.id,
          slug: c.slug || "",
          name: c.name || "",
          price: c.price_cents ? c.price_cents / 100 : 0,
          is_active: !!c.is_active,
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
    return characters.filter((c) => {
      if (!showInactive && !c.is_active) return false;
      if (!s) return true;
      return (
        c.name.toLowerCase().includes(s) ||
        c.slug.toLowerCase().includes(s)
      );
    });
  }, [characters, showInactive, query]);

  const createCharacter = async () => {
    if (!tenantId || !name) return;
    setSaving(true);
    try {
      await supabase.from("party_characters").insert({
        tenant_id: tenantId,
        slug: slug || null,
        name,
        price_cents: Math.round((price || 0) * 100),
        is_active: active,
      });
      setSlug("");
      setName("");
      setPrice(0);
      setActive(true);
      await load();
    } finally {
      setSaving(false);
    }
  };

  const updateCharacter = async (ch: UICharacter) => {
    if (!tenantId) return;
    setSaving(true);
    try {
      await supabase
        .from("party_characters")
        .update({
          slug: ch.slug || null,
          name: ch.name,
          price_cents: Math.round((ch.price || 0) * 100),
          is_active: ch.is_active,
        })
        .eq("tenant_id", tenantId)
        .eq("id", ch.id);
      await load();
    } finally {
      setSaving(false);
    }
  };

  const deleteCharacter = async (id: string) => {
    if (!tenantId) return;
    setSaving(true);
    try {
      await supabase.from("party_characters").delete().eq("tenant_id", tenantId).eq("id", id);
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
          <p className="text-gray-600">Loading characters...</p>
        </div>
      </div>
    );
  }

  return (
    <AdminLayout tenant={tenant}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Party Characters</h1>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
            <div>
              <label className="block text-sm text-gray-600 mb-1">Search</label>
              <input
                type="text"
                placeholder="Search name or slug"
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
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Add Character</h2>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
            <div>
              <label className="block text-sm text-gray-600 mb-1">Slug</label>
              <input type="text" value={slug} onChange={(e) => setSlug(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Name</label>
              <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Price</label>
              <input type="number" step="0.01" value={price} onChange={(e) => setPrice(Number(e.target.value))} className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
            </div>
            <div className="flex items-center space-x-2">
              <input id="active" type="checkbox" checked={active} onChange={(e) => setActive(e.target.checked)} />
              <label htmlFor="active" className="text-sm text-gray-700">Active</label>
            </div>
            <div>
              <button onClick={createCharacter} disabled={saving || !name} className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50">{saving ? "Saving..." : "+ Add Character"}</button>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Slug</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Active</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filtered.map((c) => (
                  <tr key={c.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <input
                        type="text"
                        value={c.slug}
                        onChange={(e) => setCharacters((prev) => prev.map((r) => (r.id === c.id ? { ...r, slug: e.target.value } : r)))}
                        onBlur={() => updateCharacter(c)}
                        className="w-40 px-2 py-1 border border-gray-300 rounded"
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <input
                        type="text"
                        value={c.name}
                        onChange={(e) => setCharacters((prev) => prev.map((r) => (r.id === c.id ? { ...r, name: e.target.value } : r)))}
                        onBlur={() => updateCharacter(c)}
                        className="w-56 px-2 py-1 border border-gray-300 rounded"
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                      <input
                        type="number"
                        step="0.01"
                        value={c.price}
                        onChange={(e) => setCharacters((prev) => prev.map((r) => (r.id === c.id ? { ...r, price: Number(e.target.value) } : r)))}
                        onBlur={() => updateCharacter(c)}
                        className="w-28 px-2 py-1 border border-gray-300 rounded text-right"
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <input type="checkbox" checked={c.is_active} onChange={(e) => updateCharacter({ ...c, is_active: e.target.checked })} />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-900">
                      <button onClick={() => deleteCharacter(c.id)} disabled={saving} className="px-3 py-1 rounded bg-red-50 text-red-700 hover:bg-red-100 disabled:opacity-50">Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {filtered.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500">No characters found.</p>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
