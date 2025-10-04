"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import AdminLayout from "../../../../components/AdminLayout";
import { supabase } from "@/lib/supabase";

// params are accessed via useParams() in client components

type UIPackage = { id: string; name: string };
type UIRoom = { id: string; name: string; active: boolean };

type PackageRooms = {
  [packageId: string]: Set<string>; // room ids
};

export default function MappingsPage() {
  const params = useParams<{ tenant: string }>();
  const tenant = (params?.tenant as string) || "";
  const [tenantId, setTenantId] = useState<string | null>(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [packages, setPackages] = useState<UIPackage[]>([]);
  const [rooms, setRooms] = useState<UIRoom[]>([]);
  const [mappings, setMappings] = useState<PackageRooms>({});

  const [pkgSearch, setPkgSearch] = useState("");
  const [roomSearch, setRoomSearch] = useState("");

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
        setRooms([]);
        setMappings({});
        return;
      }
      setTenantId(t.id);

      const [{ data: pkgRows }, { data: roomRows }, { data: prRows }] = await Promise.all([
        supabase
          .from("packages")
          .select("id,name,active")
          .eq("tenant_id", t.id)
          .eq("active", true)
          .order("name"),
        supabase
          .from("rooms")
          .select("id,name,active")
          .eq("tenant_id", t.id)
          .eq("active", true)
          .order("name"),
        supabase
          .from("package_rooms")
          .select("package_id,room_id")
          .eq("tenant_id", t.id),
      ]);

      const pkgs = (pkgRows || []).map((p: any) => ({ id: p.id, name: p.name })) as UIPackage[];
      const rms = (roomRows || []).map((r: any) => ({ id: r.id, name: r.name, active: !!r.active })) as UIRoom[];
      const map: PackageRooms = {};
      (prRows || []).forEach((r: any) => {
        if (!map[r.package_id]) map[r.package_id] = new Set<string>();
        map[r.package_id].add(r.room_id);
      });

      setPackages(pkgs);
      setRooms(rms);
      setMappings(map);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tenant]);

  const toggleMap = (packageId: string, roomId: string) => {
    setMappings((prev) => {
      const curr = new Set(prev[packageId] || []);
      if (curr.has(roomId)) curr.delete(roomId);
      else curr.add(roomId);
      return { ...prev, [packageId]: curr };
    });
  };

  const savePackage = async (packageId: string) => {
    if (!tenantId) return;
    setSaving(true);
    try {
      // Load current rows from DB for this package to calculate diff
      const { data: existing } = await supabase
        .from("package_rooms")
        .select("id,package_id,room_id")
        .eq("tenant_id", tenantId)
        .eq("package_id", packageId);

      const existingSet = new Set((existing || []).map((r: any) => r.room_id));
      const desiredSet = new Set(Array.from(mappings[packageId] || []));

      // Deletions
      const toDelete = (existing || []).filter((r: any) => !desiredSet.has(r.room_id));
      if (toDelete.length) {
        const ids = toDelete.map((r: any) => r.id);
        await supabase.from("package_rooms").delete().in("id", ids);
      }

      // Insertions
      const toInsert = Array.from(desiredSet).filter((rid) => !existingSet.has(rid));
      if (toInsert.length) {
        const rows = toInsert.map((rid) => ({ tenant_id: tenantId, package_id: packageId, room_id: rid }));
        await supabase.from("package_rooms").insert(rows);
      }

      await load();
    } finally {
      setSaving(false);
    }
  };

  const filteredPackages = useMemo(() => {
    const s = pkgSearch.toLowerCase();
    return packages.filter((p) => p.name.toLowerCase().includes(s));
  }, [packages, pkgSearch]);

  const filteredRooms = useMemo(() => {
    const s = roomSearch.toLowerCase();
    return rooms.filter((r) => r.name.toLowerCase().includes(s));
  }, [rooms, roomSearch]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading mappings...</p>
        </div>
      </div>
    );
  }

  return (
    <AdminLayout tenant={tenant}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Package ↔ Room Mapping</h1>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-600 mb-1">Search Packages</label>
              <input
                type="text"
                value={pkgSearch}
                onChange={(e) => setPkgSearch(e.target.value)}
                placeholder="Search packages..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Search Rooms</label>
              <input
                type="text"
                value={roomSearch}
                onChange={(e) => setRoomSearch(e.target.value)}
                placeholder="Search rooms..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>
          </div>
        </div>

        {/* Package cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredPackages.map((pkg) => (
            <div key={pkg.id} className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">{pkg.name}</h2>
                <button
                  onClick={() => savePackage(pkg.id)}
                  disabled={saving}
                  className="bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  {saving ? "Saving..." : "Save"}
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {filteredRooms.map((room) => {
                  const checked = mappings[pkg.id]?.has(room.id) || false;
                  return (
                    <label key={room.id} className="flex items-center space-x-2 p-2 border rounded hover:bg-gray-50">
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => toggleMap(pkg.id, room.id)}
                      />
                      <span className="text-sm text-gray-800">{room.name}</span>
                    </label>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {filteredPackages.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">No packages match your search.</p>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
