"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import AdminLayout from "../../../../components/AdminLayout";
import { supabase } from "@/lib/supabase";

type Role = "Admin" | "Manager" | "Staff";

interface StaffMember {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: Role;
  permissions: string[];
  active: boolean;
}

const ALL_PERMS = [
  "bookings",
  "customers",
  "rooms",
  "packages",
  "payments",
  "reports",
  "availability",
  "ads",
  "staff",
  "settings",
] as const;

const RoleBadge = ({ role }: { role: Role }) => {
  const map: Record<Role, string> = {
    Admin: "bg-purple-100 text-purple-800",
    Manager: "bg-blue-100 text-blue-800",
    Staff: "bg-gray-100 text-gray-800",
  };
  return (
    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${map[role]}`}>{role}</span>
  );
};

const CreateStaffModal = ({
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
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [role, setRole] = useState<Role>("Staff");
  const [perms, setPerms] = useState<string[]>([]);
  const [active, setActive] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    const load = async () => {
      const { data } = await supabase
        .from("tenants")
        .select("id")
        .eq("slug", tenantSlug)
        .eq("active", true)
        .single();
      setTenantId(data?.id || null);
    };
    load();
  }, [isOpen, tenantSlug]);

  const togglePerm = (p: string) => {
    setPerms((prev) => (prev.includes(p) ? prev.filter((x) => x !== p) : [...prev, p]));
  };

  const submit = async () => {
    if (!tenantId || !name || !email) return;
    setSaving(true);
    try {
      const { error } = await supabase
        .from("staff")
        .insert({
          tenant_id: tenantId,
          name,
          email,
          phone: phone || null,
          role,
          permissions_json: perms,
          active,
        });
      if (error) throw error;
      onCreated();
      onClose();
      setName(""); setEmail(""); setPhone(""); setRole("Staff"); setPerms([]); setActive(true);
    } catch (e) {
      console.error(e);
      alert("Failed to create staff member.");
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-lg w-full mx-4">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Add Staff Member</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">✕</button>
        </div>
        <div className="px-6 py-4 space-y-4">
          <div>
            <label className="block text-sm text-gray-600 mb-1">Name</label>
            <input value={name} onChange={(e) => setName(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm text-gray-600 mb-1">Email</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Phone</label>
              <input value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm text-gray-600 mb-1">Role</label>
              <select value={role} onChange={(e) => setRole(e.target.value as Role)} className="w-full px-3 py-2 border border-gray-300 rounded-lg">
                <option>Admin</option>
                <option>Manager</option>
                <option>Staff</option>
              </select>
            </div>
            <div className="flex items-center gap-2 pt-6">
              <input id="activeCreate" type="checkbox" checked={active} onChange={(e) => setActive(e.target.checked)} />
              <label htmlFor="activeCreate" className="text-sm text-gray-700">Active</label>
            </div>
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-2">Permissions</label>
            <div className="grid grid-cols-2 gap-2">
              {ALL_PERMS.map((p) => (
                <label key={p} className="inline-flex items-center gap-2 text-sm text-gray-800">
                  <input type="checkbox" checked={perms.includes(p)} onChange={() => togglePerm(p)} /> {p}
                </label>
              ))}
            </div>
          </div>
          <div>
            <button onClick={submit} disabled={saving || !name || !email} className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50">
              {saving ? "Saving..." : "Create"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const EditStaffModal = ({
  isOpen,
  onClose,
  staff,
  onUpdated,
}: {
  isOpen: boolean;
  onClose: () => void;
  staff: StaffMember | null;
  onUpdated: () => void;
}) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [role, setRole] = useState<Role>("Staff");
  const [perms, setPerms] = useState<string[]>([]);
  const [active, setActive] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (staff) {
      setName(staff.name || "");
      setEmail(staff.email || "");
      setPhone(staff.phone || "");
      setRole((staff.role as Role) || "Staff");
      setPerms(staff.permissions || []);
      setActive(!!staff.active);
    }
  }, [staff]);

  const togglePerm = (p: string) => {
    setPerms((prev) => (prev.includes(p) ? prev.filter((x) => x !== p) : [...prev, p]));
  };

  const submit = async () => {
    if (!staff) return;
    setSaving(true);
    try {
      const { error } = await supabase
        .from("staff")
        .update({
          name,
          email,
          phone: phone || null,
          role,
          permissions_json: perms,
          active,
        })
        .eq("id", staff.id);
      if (error) throw error;
      onUpdated();
      onClose();
    } catch (e) {
      console.error(e);
      alert("Failed to update staff member.");
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen || !staff) return null;
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-lg w-full mx-4">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Edit Staff</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">✕</button>
        </div>
        <div className="px-6 py-4 space-y-4">
          <div>
            <label className="block text-sm text-gray-600 mb-1">Name</label>
            <input value={name} onChange={(e) => setName(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm text-gray-600 mb-1">Email</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Phone</label>
              <input value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm text-gray-600 mb-1">Role</label>
              <select value={role} onChange={(e) => setRole(e.target.value as Role)} className="w-full px-3 py-2 border border-gray-300 rounded-lg">
                <option>Admin</option>
                <option>Manager</option>
                <option>Staff</option>
              </select>
            </div>
            <div className="flex items-center gap-2 pt-6">
              <input id="activeEdit" type="checkbox" checked={active} onChange={(e) => setActive(e.target.checked)} />
              <label htmlFor="activeEdit" className="text-sm text-gray-700">Active</label>
            </div>
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-2">Permissions</label>
            <div className="grid grid-cols-2 gap-2">
              {ALL_PERMS.map((p) => (
                <label key={p} className="inline-flex items-center gap-2 text-sm text-gray-800">
                  <input type="checkbox" checked={perms.includes(p)} onChange={() => togglePerm(p)} /> {p}
                </label>
              ))}
            </div>
          </div>
          <div>
            <button onClick={submit} disabled={saving || !name || !email} className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50">
              {saving ? "Saving..." : "Save"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function StaffPage() {
  const params = useParams<{ tenant: string }>();
  const tenant = (params?.tenant as string) || "";

  const [search, setSearch] = useState("");
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [loading, setLoading] = useState(true);

  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [selected, setSelected] = useState<StaffMember | null>(null);

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
        if (!tenantRow?.id) { setStaff([]); return; }
        const { data, error } = await supabase
          .from("staff")
          .select("id,name,email,phone,role,permissions_json,active")
          .eq("tenant_id", tenantRow.id)
          .order("created_at", { ascending: false });
        if (error) throw error;
        setStaff((data || []).map((s: any) => ({
          id: s.id,
          name: s.name,
          email: s.email,
          phone: s.phone || "",
          role: s.role as Role,
          permissions: Array.isArray(s.permissions_json) ? s.permissions_json : [],
          active: !!s.active,
        })));
      } catch (e) {
        console.error(e);
        alert("Failed to load staff.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [tenant]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return staff;
    return staff.filter((s) =>
      s.name.toLowerCase().includes(q) ||
      s.email.toLowerCase().includes(q) ||
      s.phone.toLowerCase().includes(q)
    );
  }, [staff, search]);

  const reload = async () => {
    try {
      const { data: tenantRow } = await supabase
        .from("tenants")
        .select("id")
        .eq("slug", tenant)
        .eq("active", true)
        .single();
      if (!tenantRow?.id) { setStaff([]); return; }
      const { data, error } = await supabase
        .from("staff")
        .select("id,name,email,phone,role,permissions_json,active")
        .eq("tenant_id", tenantRow.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      setStaff((data || []).map((s: any) => ({
        id: s.id,
        name: s.name,
        email: s.email,
        phone: s.phone || "",
        role: s.role as Role,
        permissions: Array.isArray(s.permissions_json) ? s.permissions_json : [],
        active: !!s.active,
      })));
    } catch (e) {
      console.error(e);
      alert("Failed to reload staff.");
    }
  };

  const toggleActive = async (s: StaffMember) => {
    try {
      const { error } = await supabase
        .from("staff")
        .update({ active: !s.active })
        .eq("id", s.id);
      if (error) throw error;
      await reload();
    } catch (e) {
      console.error(e);
      alert("Failed to update staff member.");
    }
  };

  const remove = async (s: StaffMember) => {
    if (!confirm(`Delete staff member "${s.name}"?`)) return;
    try {
      const { error } = await supabase
        .from("staff")
        .delete()
        .eq("id", s.id);
      if (error) throw error;
      await reload();
    } catch (e) {
      console.error(e);
      alert("Failed to delete staff member.");
    }
  };

  return (
    <AdminLayout tenant={tenant}>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Staff</h1>
        <div className="flex items-center gap-2">
          <button onClick={() => setCreateOpen(true)} className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
            + Add Staff Member
          </button>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3 mb-6">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full sm:w-72 px-3 py-2 border border-gray-300 rounded-lg"
          placeholder="Search staff..."
        />
      </div>

      {loading ? (
        <div className="text-gray-500">Loading…</div>
      ) : filtered.length ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((s) => (
            <div key={s.id} className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm">
              <div className="p-5">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <div className="text-lg font-semibold text-gray-900">{s.name}</div>
                    <div className="text-sm text-gray-600">{s.email}</div>
                    <div className="text-sm text-gray-600">{s.phone}</div>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <RoleBadge role={s.role} />
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${s.active ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-700"}`}>
                      {s.active ? "Active" : "Inactive"}
                    </span>
                  </div>
                </div>
                <div className="text-xs text-gray-700 mb-3">
                  <div className="font-medium mb-1">Permissions</div>
                  <div className="flex flex-wrap gap-1">
                    {s.permissions.length ? s.permissions.map((p) => (
                      <span key={p} className="inline-flex px-2 py-0.5 rounded-full bg-gray-100 text-gray-800">{p}</span>
                    )) : <span className="text-gray-500">None</span>}
                  </div>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => { setSelected(s); setEditOpen(true); }} className="flex-1 bg-gray-600 text-white py-2 px-3 rounded-lg text-sm hover:bg-gray-700">Edit</button>
                  <button onClick={() => toggleActive(s)} className="flex-1 bg-blue-600 text-white py-2 px-3 rounded-lg text-sm hover:bg-blue-700">{s.active ? "Deactivate" : "Activate"}</button>
                  <button onClick={() => remove(s)} className="flex-1 bg-red-600 text-white py-2 px-3 rounded-lg text-sm hover:bg-red-700">Delete</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-gray-500">No staff found.</div>
      )}

      <CreateStaffModal isOpen={createOpen} onClose={() => setCreateOpen(false)} tenantSlug={tenant} onCreated={reload} />
      <EditStaffModal isOpen={editOpen} onClose={() => setEditOpen(false)} staff={selected} onUpdated={reload} />
    </AdminLayout>
  );
}
