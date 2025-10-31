"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import AdminLayout from "../../../../components/AdminLayout";
import { supabase } from "@/lib/supabase";

interface Room {
  id: string;
  name: string;
  description: string | null;
  max_kids: number;
  capacity: number | null;
  active: boolean;
  notes: string | null;
}

export default function RoomsPage() {
  const params = useParams<{ tenant: string }>();
  const tenant = (params?.tenant as string) || "";
  
  const [tenantId, setTenantId] = useState<string | null>(null);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [createOpen, setCreateOpen] = useState(false);
  const [editRoom, setEditRoom] = useState<Room | null>(null);
  
  // Form state
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [maxKids, setMaxKids] = useState(10);
  const [capacity, setCapacity] = useState(15);
  const [notes, setNotes] = useState("");
  const [active, setActive] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [featureFile, setFeatureFile] = useState<File | null>(null);
  const [galleryFiles, setGalleryFiles] = useState<FileList | null>(null);

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
        setRooms([]);
        return;
      }
      
      setTenantId(t.id);
      
      const { data } = await supabase
        .from("rooms")
        .select("*")
        .eq("tenant_id", t.id)
        .order("name");
      
      setRooms(data || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [tenant]);

  const openCreate = () => {
    setName("");
    setDescription("");
    setMaxKids(10);
    setCapacity(15);
    setNotes("");
    setActive(true);
    setEditRoom(null);
    setCreateOpen(true);
    setFormError(null);
    setFeatureFile(null);
    setGalleryFiles(null);
  };

  const openEdit = (room: Room) => {
    setName(room.name);
    setDescription(room.description || "");
    setMaxKids(room.max_kids);
    setCapacity(room.capacity || 15);
    setNotes(room.notes || "");
    setActive(room.active);
    setEditRoom(room);
    setCreateOpen(true);
    setFormError(null);
    setFeatureFile(null);
    setGalleryFiles(null);
  };

  const handleSubmit = async () => {
    // Basic validation
    if (!tenantId) return;
    const trimmedName = name.trim();
    if (!trimmedName) {
      setFormError("Name is required");
      return;
    }
    if (maxKids < 1) {
      setFormError("Max kids must be at least 1");
      return;
    }
    if (capacity !== null && typeof capacity === 'number' && capacity > 0 && capacity < maxKids) {
      setFormError("Total capacity cannot be less than Max kids");
      return;
    }
    setFormError(null);
    setSaving(true);
    
    try {
      let roomId: string | null = editRoom ? editRoom.id : null;

      if (editRoom) {
        // Update base fields
        const { error } = await supabase
          .from("rooms")
          .update({
            name: trimmedName,
            description: description || null,
            max_kids: maxKids,
            capacity: capacity || null,
            notes: notes || null,
            active,
          })
          .eq("id", editRoom.id);
        if (error) throw error;
      } else {
        // Create and return id for subsequent uploads
        const { data: inserted, error } = await supabase
          .from("rooms")
          .insert({
            tenant_id: tenantId,
            name: trimmedName,
            description: description || null,
            max_kids: maxKids,
            capacity: capacity || null,
            notes: notes || null,
            active,
          })
          .select("id")
          .single();
        if (error) throw error;
        roomId = inserted?.id ?? null;
      }

      // If we have images selected, upload to 'tennent rooms' and update room.images
      if (tenantId && (featureFile || (galleryFiles && galleryFiles.length)) ) {
        const idForUpload = roomId || editRoom?.id;
        if (!idForUpload) throw new Error("Missing room id for image upload");

        const urls: string[] = [];

        if (featureFile) {
          const path = `${tenantId}/rooms/${idForUpload}/feature-${Date.now()}-${featureFile.name}`;
          const { error: upErr } = await supabase.storage
            .from("tennent rooms")
            .upload(path, featureFile, { upsert: false });
          if (upErr) throw upErr;
          const { data: pub } = supabase.storage
            .from("tennent rooms")
            .getPublicUrl(path);
          if (pub?.publicUrl) urls.push(pub.publicUrl);
        }

        if (galleryFiles && galleryFiles.length) {
          const max = Math.min(4, galleryFiles.length);
          for (let i = 0; i < max; i++) {
            const f = galleryFiles[i];
            const path = `${tenantId}/rooms/${idForUpload}/gallery-${Date.now()}-${i}-${f.name}`;
            const { error: upErr } = await supabase.storage
              .from("tennent rooms")
              .upload(path, f, { upsert: false });
            if (upErr) throw upErr;
            const { data: pub } = supabase.storage
              .from("tennent rooms")
              .getPublicUrl(path);
            if (pub?.publicUrl) urls.push(pub.publicUrl);
          }
        }

        if (urls.length) {
          const { error: imgErr } = await supabase
            .from("rooms")
            .update({ images: urls })
            .eq("id", idForUpload);
          if (imgErr) throw imgErr;
        }
      }
      
      setCreateOpen(false);
      await load();
    } catch (e: any) {
      alert(e.message || "Failed to save room");
    } finally {
      setSaving(false);
    }
  };

  const deleteRoom = async (room: Room) => {
    if (!confirm(`Delete room "${room.name}"? This cannot be undone.`)) return;
    
    try {
      const { error } = await supabase
        .from("rooms")
        .delete()
        .eq("id", room.id);
      
      if (error) throw error;
      await load();
    } catch (e: any) {
      alert(e.message || "Failed to delete room");
    }
  };

  const toggleActive = async (room: Room) => {
    try {
      const { error } = await supabase
        .from("rooms")
        .update({ active: !room.active })
        .eq("id", room.id);
      
      if (error) throw error;
      await load();
    } catch (e: any) {
      alert(e.message || "Failed to update room");
    }
  };

  return (
    <AdminLayout tenant={tenant}>
      <div>
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Rooms</h1>
          <button
            onClick={openCreate}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            + Add Room
          </button>
        </div>

        {loading ? (
          <div className="text-gray-500">Loading...</div>
        ) : rooms.length === 0 ? (
          <div className="bg-white rounded-lg border p-12 text-center">
            <p className="text-gray-500 mb-4">No rooms yet</p>
            <button
              onClick={openCreate}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
            >
              Create Your First Room
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {rooms.map((room) => (
              <div key={room.id} className="bg-white rounded-lg border p-4">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="text-lg font-semibold text-gray-900">{room.name}</h3>
                  <span className={`px-2 py-1 text-xs rounded-full ${room.active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                    {room.active ? 'Active' : 'Inactive'}
                  </span>
                </div>
                {room.description && (
                  <p className="text-sm text-gray-600 mb-3">{room.description}</p>
                )}
                <div className="text-sm text-gray-700 space-y-1 mb-4">
                  <div>Max Kids: <strong>{room.max_kids}</strong></div>
                  {room.capacity && <div>Total Capacity: <strong>{room.capacity}</strong></div>}
                  {room.notes && <div className="text-xs text-gray-500 mt-2">{room.notes}</div>}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => openEdit(room)}
                    className="flex-1 bg-gray-600 text-white py-2 px-3 rounded text-sm hover:bg-gray-700"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => toggleActive(room)}
                    className="flex-1 bg-blue-600 text-white py-2 px-3 rounded text-sm hover:bg-blue-700"
                  >
                    {room.active ? 'Deactivate' : 'Activate'}
                  </button>
                  <button
                    onClick={() => deleteRoom(room)}
                    className="flex-1 bg-red-600 text-white py-2 px-3 rounded text-sm hover:bg-red-700"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Modal */}
        {createOpen && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-lg w-full mx-4">
              <div className="px-6 py-4 border-b flex items-center justify-between">
                <h2 className="text-lg font-semibold">
                  {editRoom ? 'Edit Room' : 'Create Room'}
                </h2>
                <button onClick={() => setCreateOpen(false)} className="text-gray-400">✕</button>
              </div>
              <div className="px-6 py-4 space-y-4">
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Name</label>
                  <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg"
                    placeholder="Safari Room"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Description</label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg"
                    rows={3}
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">Max Kids</label>
                    <input
                      type="number"
                      min={1}
                      value={maxKids}
                      onChange={(e) => setMaxKids(Number(e.target.value))}
                      className="w-full px-3 py-2 border rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">Total Capacity</label>
                    <input
                      type="number"
                      min={0}
                      value={capacity}
                      onChange={(e) => setCapacity(Number(e.target.value))}
                      className="w-full px-3 py-2 border rounded-lg"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Feature Image</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setFeatureFile(e.target.files?.[0] || null)}
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Gallery Images (up to 4)</label>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={(e) => setGalleryFiles(e.target.files)}
                  />
                </div>
                {formError && (
                  <div className="text-sm text-red-600">{formError}</div>
                )}
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Notes</label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg"
                    rows={2}
                  />
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={active}
                    onChange={(e) => setActive(e.target.checked)}
                    id="activeCheck"
                  />
                  <label htmlFor="activeCheck" className="text-sm text-gray-700">Active</label>
                </div>
                <button
                  onClick={handleSubmit}
                  disabled={saving || !name.trim() || !!formError}
                  className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  {saving ? 'Saving...' : editRoom ? 'Update Room' : 'Create Room'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
