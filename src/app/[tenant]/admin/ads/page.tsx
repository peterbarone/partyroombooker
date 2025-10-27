"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import AdminLayout from "../../../../components/AdminLayout";
import { supabase } from "@/lib/supabase";

type Placement =
  | "GreetingScene"
  | "PackageChoiceScene"
  | "RoomChoiceScene"
  | "PartyDateScene"
  | "TimeSlotScene"
  | "GuestCountScene"
  | "ChildInfoScene"
  | "ChildAgeScene"
  | "ParentInfoScene"
  | "SpecialNotesScene"
  | "PaymentScene"
  | "ConfirmationScene";

interface UIAd {
  id: string;
  title: string;
  description: string;
  discount_percent: number;
  media_url: string | null;
  placement: Placement;
  active: boolean;
}

const placements: Placement[] = [
  "GreetingScene",
  "PackageChoiceScene",
  "RoomChoiceScene",
  "PartyDateScene",
  "TimeSlotScene",
  "GuestCountScene",
  "ChildInfoScene",
  "ChildAgeScene",
  "ParentInfoScene",
  "SpecialNotesScene",
  "PaymentScene",
  "ConfirmationScene",
];

const CreateAdModal = ({
  isOpen,
  onClose,
  tenantSlug,
  onCreated,
}: {
  isOpen: boolean;
  onClose: () => void;
  tenantSlug: string;
  onCreated: () => void;
}) => {
  const [tenantId, setTenantId] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [discount, setDiscount] = useState<number>(0);
  const [placement, setPlacement] = useState<Placement>("GreetingScene");
  const [active, setActive] = useState(true);
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    const loadTenant = async () => {
      const { data } = await supabase
        .from("tenants")
        .select("id")
        .eq("slug", tenantSlug)
        .eq("active", true)
        .single();
      setTenantId(data?.id || null);
    };
    loadTenant();
  }, [isOpen, tenantSlug]);

  const submit = async () => {
    if (!tenantId || !title) return;
    setSaving(true);
    try {
      // Insert first to get ID
      const { data: inserted, error: insertErr } = await supabase
        .from("ads")
        .insert({
          tenant_id: tenantId,
          title,
          description: description || null,
          discount_percent: Math.max(0, Math.min(100, Math.round(discount))),
          media_url: null,
          placement,
          active,
        })
        .select("id")
        .single();
      if (insertErr) throw insertErr;

      let mediaUrl: string | null = null;
      if (mediaFile) {
        const path = `${tenantId}/ads/${inserted.id}-${Date.now()}-${mediaFile.name}`;
        const { error: upErr } = await supabase.storage
          .from("tennent ads")
          .upload(path, mediaFile, { upsert: false });
        if (upErr) throw upErr;
        const { data: pub } = supabase.storage
          .from("tennent ads")
          .getPublicUrl(path);
        mediaUrl = pub?.publicUrl || null;
      }

      if (mediaUrl) {
        const { error: updateErr } = await supabase
          .from("ads")
          .update({ media_url: mediaUrl })
          .eq("id", inserted.id);
        if (updateErr) throw updateErr;
      }

      onCreated();
      onClose();
      setTitle("");
      setDescription("");
      setDiscount(0);
      setPlacement("GreetingScene");
      setActive(true);
      setMediaFile(null);
    } catch (e) {
      console.error(e);
      alert("Failed to create ad.");
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-lg w-full mx-4">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">New Ad</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">✕</button>
        </div>
        <div className="px-6 py-4 space-y-4">
          <div>
            <label className="block text-sm text-gray-600 mb-1">Title</label>
            <input value={title} onChange={(e) => setTitle(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">Description</label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg min-h-24" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm text-gray-600 mb-1">Discount (%)</label>
              <input type="number" min={0} max={100} value={discount} onChange={(e) => setDiscount(Number(e.target.value))} className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Placement</label>
              <select value={placement} onChange={(e) => setPlacement(e.target.value as Placement)} className="w-full px-3 py-2 border border-gray-300 rounded-lg">
                {placements.map((p) => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </div>
          </div>
          {/* Destination URL removed per requirements */}
          <div>
            <label className="block text-sm text-gray-600 mb-1">Media (image/video)</label>
            <input type="file" accept="image/*,video/*" onChange={(e) => setMediaFile(e.target.files?.[0] || null)} />
          </div>
          <div className="flex items-center space-x-2">
            <input id="adActiveCreate" type="checkbox" checked={active} onChange={(e) => setActive(e.target.checked)} />
            <label htmlFor="adActiveCreate" className="text-sm text-gray-700">Active</label>
          </div>
          <div>
            <button onClick={submit} disabled={saving || !title} className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50">
              {saving ? "Saving..." : "Create"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const EditAdModal = ({
  isOpen,
  onClose,
  ad,
  onUpdated,
  tenantSlug,
}: {
  isOpen: boolean;
  onClose: () => void;
  ad: UIAd | null;
  onUpdated: () => void;
  tenantSlug: string;
}) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [discount, setDiscount] = useState<number>(0);
  const [placement, setPlacement] = useState<Placement>("GreetingScene");
  const [active, setActive] = useState(true);
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (ad) {
      setTitle(ad.title || "");
      setDescription(ad.description || "");
      setDiscount(Number(ad.discount_percent || 0));
      setPlacement((ad.placement as Placement) || "GreetingScene");
      setActive(!!ad.active);
    }
  }, [ad]);

  const submit = async () => {
    if (!ad) return;
    setSaving(true);
    try {
      let mediaUrl: string | null = null;
      if (mediaFile) {
        const tenantRow = await supabase
          .from("tenants")
          .select("id")
          .eq("slug", tenantSlug)
          .eq("active", true)
          .single();
        const tenantId = tenantRow.data?.id as string | undefined;
        if (tenantId) {
          const path = `${tenantId}/ads/${ad.id}-edit-${Date.now()}-${mediaFile.name}`;
          const { error: upErr } = await supabase.storage
            .from("tennent ads")
            .upload(path, mediaFile, { upsert: false });
          if (upErr) throw upErr;
          const { data: pub } = supabase.storage
            .from("tennent ads")
            .getPublicUrl(path);
          mediaUrl = pub?.publicUrl || null;
        }
      }

      const payload: any = {
        title,
        description: description || null,
        discount_percent: Math.max(0, Math.min(100, Math.round(discount))),
        placement,
        active,
      };
      if (mediaUrl) payload.media_url = mediaUrl;

      const { error } = await supabase
        .from("ads")
        .update(payload)
        .eq("id", ad.id);
      if (error) throw error;
      onUpdated();
      onClose();
    } catch (e) {
      console.error(e);
      alert("Failed to update ad.");
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen || !ad) return null;
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-lg w-full mx-4">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Edit Ad</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">✕</button>
        </div>
        <div className="px-6 py-4 space-y-4">
          <div>
            <label className="block text-sm text-gray-600 mb-1">Title</label>
            <input value={title} onChange={(e) => setTitle(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">Description</label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg min-h-24" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm text-gray-600 mb-1">Discount (%)</label>
              <input type="number" min={0} max={100} value={discount} onChange={(e) => setDiscount(Number(e.target.value))} className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Placement</label>
              <select value={placement} onChange={(e) => setPlacement(e.target.value as Placement)} className="w-full px-3 py-2 border border-gray-300 rounded-lg">
                {placements.map((p) => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </div>
          </div>
          {/* Destination URL removed per requirements */}
          <div>
            <label className="block text-sm text-gray-600 mb-1">Replace Media (optional)</label>
            <input type="file" accept="image/*,video/*" onChange={(e) => setMediaFile(e.target.files?.[0] || null)} />
          </div>
          <div className="flex items-center space-x-2">
            <input id="adActiveEdit" type="checkbox" checked={active} onChange={(e) => setActive(e.target.checked)} />
            <label htmlFor="adActiveEdit" className="text-sm text-gray-700">Active</label>
          </div>
          <div>
            <button onClick={submit} disabled={saving || !title} className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50">
              {saving ? "Saving..." : "Save"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function AdsPage() {
  const params = useParams<{ tenant: string }>();
  const tenant = (params?.tenant as string) || "";

  const [search, setSearch] = useState("");
  const [ads, setAds] = useState<UIAd[]>([]);
  const [loading, setLoading] = useState(true);

  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [selected, setSelected] = useState<UIAd | null>(null);

  useEffect(() => {
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
          setAds([]);
          return;
        }
        const { data, error } = await supabase
          .from("ads")
          .select("id,title,description,discount_percent,media_url,placement,active")
          .eq("tenant_id", tenantRow.id)
          .order("created_at", { ascending: false });
        if (error) throw error;
        setAds(
          (data || []).map((a: any) => ({
            id: a.id,
            title: a.title,
            description: a.description || "",
            discount_percent: Number(a.discount_percent || 0),
            media_url: a.media_url || null,
            placement: a.placement,
            active: !!a.active,
          }))
        );
      } catch (e) {
        console.error(e);
        alert("Failed to load ads.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [tenant]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return ads;
    return ads.filter((a) =>
      a.title.toLowerCase().includes(q) ||
      (a.description || "").toLowerCase().includes(q)
    );
  }, [ads, search]);

  const reload = async () => {
    try {
      const { data: tenantRow } = await supabase
        .from("tenants")
        .select("id")
        .eq("slug", tenant)
        .eq("active", true)
        .single();
      if (!tenantRow?.id) {
        setAds([]);
        return;
      }
      const { data, error } = await supabase
        .from("ads")
        .select("id,title,description,discount_percent,media_url,placement,active")
        .eq("tenant_id", tenantRow.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      setAds(
        (data || []).map((a: any) => ({
          id: a.id,
          title: a.title,
          description: a.description || "",
          discount_percent: Number(a.discount_percent || 0),
          media_url: a.media_url || null,
          placement: a.placement,
          active: !!a.active,
        }))
      );
    } catch (e) {
      console.error(e);
      alert("Failed to reload ads.");
    }
  };

  const toggleActive = async (ad: UIAd) => {
    try {
      const { error } = await supabase
        .from("ads")
        .update({ active: !ad.active })
        .eq("id", ad.id);
      if (error) throw error;
      await reload();
    } catch (e) {
      console.error(e);
      alert("Failed to update ad.");
    }
  };

  const remove = async (ad: UIAd) => {
    if (!confirm(`Delete ad "${ad.title}"?`)) return;
    try {
      const { error } = await supabase
        .from("ads")
        .delete()
        .eq("id", ad.id);
      if (error) throw error;
      await reload();
    } catch (e) {
      console.error(e);
      alert("Failed to delete ad.");
    }
  };

  return (
    <AdminLayout tenant={tenant}>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Ads Management</h1>
        <div className="flex items-center gap-2">
          <button onClick={() => setCreateOpen(true)} className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
            + New Ad
          </button>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3 mb-6">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full sm:w-72 px-3 py-2 border border-gray-300 rounded-lg"
          placeholder="Search ads..."
        />
      </div>

      {loading ? (
        <div className="text-gray-500">Loading…</div>
      ) : filtered.length ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((ad) => (
            <div key={ad.id} className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm">
              {ad.media_url && (
                <div className="aspect-[16/9] bg-gray-100">
                  {/* naive media preview: image tag; videos will show as broken image, which is acceptable for MVP or could be enhanced */}
                  <img src={ad.media_url} alt={ad.title} className="w-full h-full object-cover" />
                </div>
              )}
              <div className="p-5">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="text-lg font-semibold text-gray-900">{ad.title}</h3>
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${ad.active ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-700"}`}>
                    {ad.active ? "Active" : "Inactive"}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mb-2 line-clamp-3">{ad.description}</p>
                <div className="text-sm text-gray-700 mb-3">
                  <div>Discount: {ad.discount_percent}%</div>
                  <div>Placement: {ad.placement}</div>
                  {/* Destination URL removed per requirements */}
                </div>
                <div className="flex gap-2">
                  <button onClick={() => { setSelected(ad); setEditOpen(true); }} className="flex-1 bg-gray-600 text-white py-2 px-3 rounded-lg text-sm hover:bg-gray-700">Edit</button>
                  <button onClick={() => toggleActive(ad)} className="flex-1 bg-blue-600 text-white py-2 px-3 rounded-lg text-sm hover:bg-blue-700">{ad.active ? "Deactivate" : "Activate"}</button>
                  <button onClick={() => remove(ad)} className="flex-1 bg-red-600 text-white py-2 px-3 rounded-lg text-sm hover:bg-red-700">Delete</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-gray-500">No ads found.</div>
      )}

      <CreateAdModal isOpen={createOpen} onClose={() => setCreateOpen(false)} tenantSlug={tenant} onCreated={reload} />
      <EditAdModal isOpen={editOpen} onClose={() => setEditOpen(false)} ad={selected} onUpdated={reload} tenantSlug={tenant} />
    </AdminLayout>
  );
}
