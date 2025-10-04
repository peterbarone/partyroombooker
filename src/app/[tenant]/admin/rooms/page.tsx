"use client";

import { useEffect, useState } from "react";
import AdminLayout from "../../../../components/AdminLayout";
import { supabase } from "@/lib/supabase";

/* =======================
 * Types
 * ======================= */

type RoomStatus = "all" | "active" | "maintenance" | "inactive";
type PackageStatus = "all" | "active" | "seasonal" | "inactive";

export interface RoomManagementProps {
  params: { tenant: string };
}

interface UIRoom {
  id: string;
  name: string;
  description: string;
  capacity: number;
  size: string;
  amenities: string[];
  hourlyRate: number;
  status: Exclude<RoomStatus, "all">;
  availability: string;
  images: string[];
  bookingCount: number;
  revenue: number;
  rating: number;
  lastMaintenance: string;
  nextMaintenance: string;
}

interface UIPackage {
  id: string;
  name: string;
  description: string;
  duration: number; // hours
  maxGuests: number;
  basePrice: number;
  includes: string[];
  addOns: { name: string; price: number }[];
  availableRooms: string[]; // room ids
  status: Exclude<PackageStatus, "all">;
  bookingCount: number;
  revenue: number;
  popularity: number;
}

/* =======================
 * Status Badge
 * ======================= */

const StatusBadge = ({
  status,
  type,
}: {
  status: string;
  type: "room" | "package";
}) => {
  const getConfig = () => {
    if (type === "room") {
      const configs = {
        active: { color: "bg-green-100 text-green-800", label: "Active" },
        maintenance: { color: "bg-yellow-100 text-yellow-800", label: "Maintenance" },
        inactive: { color: "bg-red-100 text-red-800", label: "Inactive" },
      };
      return configs[status as keyof typeof configs] || configs.active;
    } else {
      const configs = {
        active: { color: "bg-green-100 text-green-800", label: "Active" },
        seasonal: { color: "bg-blue-100 text-blue-800", label: "Seasonal" },
        inactive: { color: "bg-red-100 text-red-800", label: "Inactive" },
      };
      return configs[status as keyof typeof configs] || configs.active;
    }
  };

  const config = getConfig();

  return (
    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${config.color}`}>
      {config.label}
    </span>
  );
};

/* =======================
 * Edit Package Modal
 * ======================= */

const EditPackageModal = ({
  isOpen,
  onClose,
  pkg,
  onUpdated,
}: {
  isOpen: boolean;
  onClose: () => void;
  pkg: UIPackage | null;
  onUpdated: () => void;
}) => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [durationHours, setDurationHours] = useState<number>(2);
  const [maxGuests, setMaxGuests] = useState<number>(10);
  const [basePrice, setBasePrice] = useState<number>(0);
  const [active, setActive] = useState<boolean>(true);
  const [includesText, setIncludesText] = useState<string>("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (pkg) {
      setName(pkg.name || "");
      setDescription(pkg.description || "");
      setDurationHours(Number(pkg.duration || 2));
      setMaxGuests(Number(pkg.maxGuests || 0));
      setBasePrice(Number(pkg.basePrice || 0));
      setActive(pkg.status === "active");
      setIncludesText((pkg.includes || []).join("\n"));
    }
  }, [pkg]);

  const submit = async () => {
    if (!pkg) return;
    setSaving(true);
    try {
      const { error } = await supabase
        .from("packages")
        .update({
          name,
          description: description || null,
          duration_minutes: Math.max(60, Math.round(durationHours * 60)),
          base_kids: maxGuests,
          base_price: basePrice,
          active,
          includes_json: includesText
            .split(/\r?\n/)
            .map((s) => s.trim())
            .filter(Boolean),
        })
        .eq("id", pkg.id);
      if (error) throw error;
      onUpdated();
      onClose();
    } catch (e) {
      console.error(e);
      alert("Failed to update package.");
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen || !pkg) return null;
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Edit Package</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">✕</button>
        </div>
        <div className="px-6 py-4 space-y-4">
          <div>
            <label className="block text-sm text-gray-600 mb-1">Name</label>
            <input value={name} onChange={(e) => setName(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">Description</label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg min-h-20" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm text-gray-600 mb-1">Duration (hours)</label>
              <input type="number" min={1} value={durationHours} onChange={(e) => setDurationHours(Number(e.target.value))} className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Max Guests</label>
              <input type="number" min={0} value={maxGuests} onChange={(e) => setMaxGuests(Number(e.target.value))} className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
            </div>
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">Base Price</label>
            <input type="number" min={0} step={1} value={basePrice} onChange={(e) => setBasePrice(Number(e.target.value))} className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">Includes (one per line)</label>
            <textarea value={includesText} onChange={(e) => setIncludesText(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg min-h-24" />
          </div>
          <div className="flex items-center space-x-2">
            <input id="pkgActiveEdit" type="checkbox" checked={active} onChange={(e) => setActive(e.target.checked)} />
            <label htmlFor="pkgActiveEdit" className="text-sm text-gray-700">Active</label>
          </div>
          <div>
            <button onClick={submit} disabled={saving || !name} className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50">
              {saving ? "Saving..." : "Save"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

/* =======================
 * Create Room Modal
 * ======================= */

const CreateRoomModal = ({
  tenant,
  isOpen,
  onClose,
  onCreated,
}: {
  tenant: string;
  isOpen: boolean;
  onClose: () => void;
  onCreated: () => void;
}) => {
  const [tenantId, setTenantId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [capacity, setCapacity] = useState<number>(0);
  const [active, setActive] = useState<boolean>(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    const load = async () => {
      const { data: t } = await supabase
        .from("tenants")
        .select("id")
        .eq("slug", tenant)
        .eq("active", true)
        .single();
      setTenantId(t?.id || null);
    };
    load();
  }, [isOpen, tenant]);

  const submit = async () => {
    if (!tenantId || !name) return;
    setSaving(true);
    try {
      const { error } = await supabase.from("rooms").insert({
        tenant_id: tenantId,
        name,
        description: description || null,
        max_kids: capacity,
        active,
      });
      if (error) throw error;
      onCreated();
      onClose();
      setName("");
      setDescription("");
      setCapacity(0);
      setActive(true);
    } catch (e) {
      console.error(e);
      alert("Failed to create room.");
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Add Room</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">✕</button>
        </div>
        <div className="px-6 py-4 space-y-4">
          <div>
            <label className="block text-sm text-gray-600 mb-1">Name</label>
            <input value={name} onChange={(e) => setName(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">Description</label>
            <input value={description} onChange={(e) => setDescription(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">Capacity (max kids)</label>
            <input type="number" value={capacity} onChange={(e) => setCapacity(Number(e.target.value))} className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
          </div>
          <div className="flex items-center space-x-2">
            <input id="roomActive" type="checkbox" checked={active} onChange={(e) => setActive(e.target.checked)} />
            <label htmlFor="roomActive" className="text-sm text-gray-700">Active</label>
          </div>
          <div>
            <button onClick={submit} disabled={saving || !name} className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50">
              {saving ? "Saving..." : "Create"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

/* =======================
 * Edit Room Modal
 * ======================= */

const EditRoomModal = ({
  isOpen,
  onClose,
  room,
  onUpdated,
}: {
  isOpen: boolean;
  onClose: () => void;
  room: UIRoom | null;
  onUpdated: () => void;
}) => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [capacity, setCapacity] = useState<number>(0);
  const [active, setActive] = useState<boolean>(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (room) {
      setName(room.name || "");
      setDescription(room.description || "");
      setCapacity(Number(room.capacity || 0));
      setActive(room.status === "active");
    }
  }, [room]);

  const submit = async () => {
    if (!room) return;
    setSaving(true);
    try {
      const { error } = await supabase
        .from("rooms")
        .update({
          name,
          description: description || null,
          max_kids: capacity,
          active,
        })
        .eq("id", room.id);
      if (error) throw error;
      onUpdated();
      onClose();
    } catch (e) {
      console.error(e);
      alert("Failed to update room.");
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen || !room) return null;
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Edit Room</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">✕</button>
        </div>
        <div className="px-6 py-4 space-y-4">
          <div>
            <label className="block text-sm text-gray-600 mb-1">Name</label>
            <input value={name} onChange={(e) => setName(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">Description</label>
            <input value={description} onChange={(e) => setDescription(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">Capacity (max kids)</label>
            <input type="number" value={capacity} onChange={(e) => setCapacity(Number(e.target.value))} className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
          </div>
          <div className="flex items-center space-x-2">
            <input id="roomActiveEdit" type="checkbox" checked={active} onChange={(e) => setActive(e.target.checked)} />
            <label htmlFor="roomActiveEdit" className="text-sm text-gray-700">Active</label>
          </div>
          <div>
            <button onClick={submit} disabled={saving || !name} className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50">
              {saving ? "Saving..." : "Save"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

/* =======================
 * Room & Package Cards
 * ======================= */

const RoomCard = ({
  room,
  onEdit,
  onViewDetails,
  onDelete,
}: {
  room: UIRoom;
  onEdit: (room: UIRoom) => void;
  onViewDetails: (room: UIRoom) => void;
  onDelete: (room: UIRoom) => void;
}) => {
  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{room.name}</h3>
            <p className="text-sm text-gray-600 mt-1">{room.description}</p>
          </div>
          <StatusBadge status={room.status} type="room" />
        </div>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <span className="text-sm font-medium text-gray-700">Capacity:</span>
            <span className="text-sm text-gray-900 ml-1">{room.capacity} guests</span>
          </div>
          <div>
            <span className="text-sm font-medium text-gray-700">Size:</span>
            <span className="text-sm text-gray-900 ml-1">{room.size || "—"}</span>
          </div>
          <div>
            <span className="text-sm font-medium text-gray-700">Rate:</span>
            <span className="text-sm text-gray-900 ml-1">${room.hourlyRate}/hour</span>
          </div>
          <div>
            <span className="text-sm font-medium text-gray-700">Rating:</span>
            <span className="text-sm text-gray-900 ml-1">⭐ {room.rating}</span>
          </div>
        </div>

        <div className="mb-4">
          <span className="text-sm font-medium text-gray-700">Amenities:</span>
          <div className="flex flex-wrap gap-1 mt-1">
            {room.amenities.slice(0, 3).map((amenity, index) => (
              <span key={index} className="inline-flex px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded">
                {amenity}
              </span>
            ))}
            {room.amenities.length > 3 && (
              <span className="inline-flex px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded">
                +{room.amenities.length - 3} more
              </span>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 text-sm text-gray-600 mb-4">
          <div>📅 {room.bookingCount} bookings</div>
          <div>💰 ${room.revenue.toLocaleString()} revenue</div>
        </div>

        <div className="flex space-x-2">
          <button onClick={() => onViewDetails(room)} className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors text-sm">
            View Details
          </button>
          <button onClick={() => onEdit(room)} className="flex-1 bg-gray-600 text-white py-2 px-4 rounded-lg hover:bg-gray-700 transition-colors text-sm">
            Edit Room
          </button>
          <button onClick={() => onDelete(room)} className="flex-1 bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition-colors text-sm">
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

const PackageCard = ({
  pkg,
  onEdit,
  onViewDetails,
}: {
  pkg: UIPackage;
  onEdit: (pkg: UIPackage) => void;
  onViewDetails: (pkg: UIPackage) => void;
}) => {
  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{pkg.name}</h3>
            <p className="text-sm text-gray-600 mt-1">{pkg.description}</p>
          </div>
          <StatusBadge status={pkg.status} type="package" />
        </div>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <span className="text-sm font-medium text-gray-700">Duration:</span>
            <span className="text-sm text-gray-900 ml-1">{pkg.duration} hours</span>
          </div>
          <div>
            <span className="text-sm font-medium text-gray-700">Max Guests:</span>
            <span className="text-sm text-gray-900 ml-1">{pkg.maxGuests}</span>
          </div>
          <div>
            <span className="text-sm font-medium text-gray-700">Base Price:</span>
            <span className="text-sm text-gray-900 ml-1 font-semibold">${pkg.basePrice}</span>
          </div>
          <div>
            <span className="text-sm font-medium text-gray-700">Popularity:</span>
            <span className="text-sm text-gray-900 ml-1">{pkg.popularity}%</span>
          </div>
        </div>

        <div className="mb-4">
          <span className="text-sm font-medium text-gray-700">Includes:</span>
          <ul className="text-xs text-gray-600 mt-1 space-y-1">
            {pkg.includes.slice(0, 4).map((item, index) => (
              <li key={index} className="flex items-start">
                <span className="text-green-600 mr-1">✓</span>
                {item}
              </li>
            ))}
            {pkg.includes.length > 4 && (
              <li className="text-gray-500">+{pkg.includes.length - 4} more items</li>
            )}
          </ul>
        </div>

        <div className="grid grid-cols-2 gap-4 text-sm text-gray-600 mb-4">
          <div>📅 {pkg.bookingCount} bookings</div>
          <div>💰 ${pkg.revenue.toLocaleString()} revenue</div>
        </div>

        <div className="flex space-x-2">
          <button onClick={() => onViewDetails(pkg)} className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors text-sm">
            View Details
          </button>
          <button onClick={() => onEdit(pkg)} className="flex-1 bg-gray-600 text-white py-2 px-4 rounded-lg hover:bg-gray-700 transition-colors text-sm">
            Edit Package
          </button>
        </div>
      </div>
    </div>
  );
};

/* =======================
 * Detail Modals
 * ======================= */

const RoomDetailModal = ({
  room,
  isOpen,
  onClose,
}: {
  room: UIRoom | null;
  isOpen: boolean;
  onClose: () => void;
}) => {
  if (!isOpen || !room) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">{room.name} Details</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">✕</button>
          </div>
        </div>

        <div className="px-6 py-4 space-y-6">
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-3">Room Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Capacity</label>
                <p className="text-sm text-gray-900">{room.capacity} guests</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Size</label>
                <p className="text-sm text-gray-900">{room.size || "—"}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Hourly Rate</label>
                <p className="text-sm text-gray-900">${room.hourlyRate}/hour</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Status</label>
                <StatusBadge status={room.status} type="room" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Availability</label>
                <p className="text-sm text-gray-900 capitalize">{room.availability.replace("_", " & ")}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Rating</label>
                <p className="text-sm text-gray-900">⭐ {room.rating} / 5.0</p>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-3">Description</h3>
            <p className="text-sm text-gray-900 bg-gray-50 p-3 rounded-lg">{room.description}</p>
          </div>

          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-3">Amenities</h3>
            <div className="grid grid-cols-2 gap-2">
              {room.amenities.map((amenity, index) => (
                <div key={index} className="flex items-center text-sm text-gray-900">
                  <span className="text-green-600 mr-2">✓</span>
                  {amenity}
                </div>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-3">Performance</h3>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{room.bookingCount}</div>
                <div className="text-sm text-gray-600">Total Bookings</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">${room.revenue.toLocaleString()}</div>
                <div className="text-sm text-gray-600">Revenue Generated</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">{room.rating}</div>
                <div className="text-sm text-gray-600">Average Rating</div>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-3">Maintenance Schedule</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Last Maintenance</label>
                <p className="text-sm text-gray-900">{room.lastMaintenance ? new Date(room.lastMaintenance).toLocaleDateString() : "—"}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Next Maintenance</label>
                <p className="text-sm text-gray-900">{room.nextMaintenance ? new Date(room.nextMaintenance).toLocaleDateString() : "—"}</p>
              </div>
            </div>
          </div>

          <div className="flex space-x-3 pt-4 border-t border-gray-200">
            <button className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors">Edit Room</button>
            <button className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors">View Bookings</button>
            <button className="flex-1 bg-yellow-600 text-white py-2 px-4 rounded-lg hover:bg-yellow-700 transition-colors">Schedule Maintenance</button>
          </div>
        </div>
      </div>
    </div>
  );
};

const PackageDetailModal = ({
  pkg,
  isOpen,
  onClose,
}: {
  pkg: UIPackage | null;
  isOpen: boolean;
  onClose: () => void;
}) => {
  if (!isOpen || !pkg) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">{pkg.name} Details</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">✕</button>
          </div>
        </div>

        <div className="px-6 py-4 space-y-6">
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-3">Package Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Duration</label>
                <p className="text-sm text-gray-900">{pkg.duration} hours</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Max Guests</label>
                <p className="text-sm text-gray-900">{pkg.maxGuests} people</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Base Price</label>
                <p className="text-sm text-gray-900 font-semibold">${pkg.basePrice}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Status</label>
                <StatusBadge status={pkg.status} type="package" />
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-3">Description</h3>
            <p className="text-sm text-gray-900 bg-gray-50 p-3 rounded-lg">{pkg.description}</p>
          </div>

          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-3">Package Includes</h3>
            <div className="space-y-2">
              {pkg.includes.map((item, index) => (
                <div key={index} className="flex items-start text-sm text-gray-900">
                  <span className="text-green-600 mr-2 mt-0.5">✓</span>
                  {item}
                </div>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-3">Available Add-ons</h3>
            <div className="space-y-2">
              {pkg.addOns.map((addon, index) => (
                <div key={index} className="flex items-center justify-between text-sm p-2 bg-gray-50 rounded">
                  <span className="text-gray-900">{addon.name}</span>
                  <span className="font-medium text-gray-900">+${addon.price}</span>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-3">Performance</h3>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{pkg.bookingCount}</div>
                <div className="text-sm text-gray-600">Total Bookings</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">${pkg.revenue.toLocaleString()}</div>
                <div className="text-sm text-gray-600">Revenue Generated</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">{pkg.popularity}%</div>
                <div className="text-sm text-gray-600">Popularity Score</div>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-3">Available Rooms</h3>
            <div className="flex flex-wrap gap-2">
              {pkg.availableRooms.map((roomId) => (
                <span key={roomId} className="inline-flex px-3 py-1 text-sm bg-blue-100 text-blue-800 rounded-full">
                  {roomId}
                </span>
              ))}
            </div>
          </div>

          <div className="flex space-x-3 pt-4 border-t border-gray-200">
            <button className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors">Edit Package</button>
            <button className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors">View Bookings</button>
            <button className="flex-1 bg-purple-600 text-white py-2 px-4 rounded-lg hover:bg-purple-700 transition-colors">Duplicate Package</button>
          </div>
        </div>
      </div>
    </div>
  );
};

/* =======================
 * Page Component
 * ======================= */

export default function RoomManagement({ params }: RoomManagementProps) {
  const tenant = params.tenant;

  const [activeTab, setActiveTab] = useState<"rooms" | "packages">("rooms");

  const [roomStatusFilter, setRoomStatusFilter] = useState<RoomStatus>("all");
  const [packageStatusFilter, setPackageStatusFilter] =
    useState<PackageStatus>("all");

  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);

  const [rooms, setRooms] = useState<UIRoom[]>([]);
  const [packages, setPackages] = useState<UIPackage[]>([]);

  const [filteredRooms, setFilteredRooms] = useState<UIRoom[]>([]);
  const [filteredPackages, setFilteredPackages] = useState<UIPackage[]>([]);

  const [selectedRoom, setSelectedRoom] = useState<UIRoom | null>(null);
  const [selectedPackage, setSelectedPackage] = useState<UIPackage | null>(null);

  const [isRoomModalOpen, setIsRoomModalOpen] = useState(false);
  const [isPackageModalOpen, setIsPackageModalOpen] = useState(false);
  const [isCreateRoomOpen, setIsCreateRoomOpen] = useState(false);
  const [isEditRoomOpen, setIsEditRoomOpen] = useState(false);
  const [isEditPackageOpen, setIsEditPackageOpen] = useState(false);

  // Initial load
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
          setRooms([]);
          setPackages([]);
          setFilteredRooms([]);
          setFilteredPackages([]);
          return;
        }

        const [{ data: roomsData }, { data: packagesData }, { data: mappings }] =
          await Promise.all([
            supabase
              .from("rooms")
              .select("id,name,description,max_kids,active")
              .eq("tenant_id", tenantRow.id),
            supabase
              .from("packages")
              .select(
                "id,name,description,base_price,base_kids,duration_min,duration_minutes,includes_json,active"
              )
              .eq("tenant_id", tenantRow.id),
            supabase
              .from("package_rooms")
              .select("package_id,room_id")
              .eq("tenant_id", tenantRow.id),
          ]);

        const packageToRooms = new Map<string, string[]>();
        (mappings || []).forEach((m: any) => {
          const arr = packageToRooms.get(m.package_id) || [];
          arr.push(m.room_id);
          packageToRooms.set(m.package_id, arr);
        });

        const mappedRooms: UIRoom[] = (roomsData || []).map((r: any) => ({
          id: r.id,
          name: r.name,
          description: r.description || "",
          capacity: Number(r.max_kids || 0),
          size: "",
          amenities: [],
          hourlyRate: 0,
          status: r.active ? "active" : "inactive",
          availability: "weekdays_weekends",
          images: [],
          bookingCount: 0,
          revenue: 0,
          rating: 5,
          lastMaintenance: "",
          nextMaintenance: "",
        }));

        const mappedPkgs: UIPackage[] = (packagesData || []).map((p: any) => {
          const minutes = Number(p?.duration_min ?? p?.duration_minutes ?? 120);
          let includes: string[] = [];
          if (Array.isArray(p?.includes_json)) includes = p.includes_json;
          else if (p?.includes_json?.includes) includes = p.includes_json.includes;

          return {
            id: p.id,
            name: p.name,
            description: p.description || "",
            duration: Math.max(1, Math.round(minutes / 60)),
            maxGuests: Number(p.base_kids || 0),
            basePrice: Number(p.base_price || 0),
            includes,
            addOns: [],
            availableRooms: packageToRooms.get(p.id) || [],
            status: p.active ? "active" : "inactive",
            bookingCount: 0,
            revenue: 0,
            popularity: 0,
          };
        });

        setRooms(mappedRooms);
        setPackages(mappedPkgs);
        setFilteredRooms(mappedRooms);
        setFilteredPackages(mappedPkgs);
      } catch (e) {
        console.error(e);
        alert("Failed to load rooms/packages.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [tenant]);

  // Reload rooms (after create/edit/delete)
  const reloadRooms = async () => {
    setLoading(true);
    try {
      const { data: tenantRow } = await supabase
        .from("tenants")
        .select("id")
        .eq("slug", tenant)
        .eq("active", true)
        .single();
      if (!tenantRow?.id) {
        setRooms([]);
        setFilteredRooms([]);
        return;
      }
      const { data: roomsData, error } = await supabase
        .from("rooms")
        .select("id,name,description,max_kids,active")
        .eq("tenant_id", tenantRow.id)
        .order("name");
      if (error) throw error;

      const mappedRooms: UIRoom[] = (roomsData || []).map((r: any) => ({
        id: r.id,
        name: r.name,
        description: r.description || "",
        capacity: Number(r.max_kids || 0),
        size: "",
        amenities: [],
        hourlyRate: 0,
        status: r.active ? "active" : "inactive",
        availability: "weekdays_weekends",
        images: [],
        bookingCount: 0,
        revenue: 0,
        rating: 5,
        lastMaintenance: "",
        nextMaintenance: "",
      }));
      setRooms(mappedRooms);
      setFilteredRooms(mappedRooms);
    } catch (e) {
      console.error(e);
      alert("Failed to reload rooms.");
    } finally {
      setLoading(false);
    }
  };

  // Reload packages (after edit)
  const reloadPackages = async () => {
    setLoading(true);
    try {
      const { data: tenantRow } = await supabase
        .from("tenants")
        .select("id")
        .eq("slug", tenant)
        .eq("active", true)
        .single();
      if (!tenantRow?.id) {
        setPackages([]);
        setFilteredPackages([]);
        return;
      }
      const [{ data: packagesData, error: pkgErr }, { data: mappings }] = await Promise.all([
        supabase
          .from("packages")
          .select(
            "id,name,description,base_price,base_kids,duration_min,duration_minutes,includes_json,active"
          )
          .eq("tenant_id", tenantRow.id),
        supabase
          .from("package_rooms")
          .select("package_id,room_id")
          .eq("tenant_id", tenantRow.id),
      ]);
      if (pkgErr) throw pkgErr;

      const packageToRooms = new Map<string, string[]>();
      (mappings || []).forEach((m: any) => {
        const arr = packageToRooms.get(m.package_id) || [];
        arr.push(m.room_id);
        packageToRooms.set(m.package_id, arr);
      });

      const mappedPkgs: UIPackage[] = (packagesData || []).map((p: any) => {
        const minutes = Number(p?.duration_min ?? p?.duration_minutes ?? 120);
        let includes: string[] = [];
        if (Array.isArray(p?.includes_json)) includes = p.includes_json;
        else if (p?.includes_json?.includes) includes = p.includes_json.includes;
        return {
          id: p.id,
          name: p.name,
          description: p.description || "",
          duration: Math.max(1, Math.round(minutes / 60)),
          maxGuests: Number(p.base_kids || 0),
          basePrice: Number(p.base_price || 0),
          includes,
          addOns: [],
          availableRooms: packageToRooms.get(p.id) || [],
          status: p.active ? "active" : "inactive",
          bookingCount: 0,
          revenue: 0,
          popularity: 0,
        };
      });
      setPackages(mappedPkgs);
      setFilteredPackages(mappedPkgs);
    } catch (e) {
      console.error(e);
      alert("Failed to reload packages.");
    } finally {
      setLoading(false);
    }
  };

  // Filters
  useEffect(() => {
    let filtered = [...rooms];

    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (room) =>
          room.name.toLowerCase().includes(q) ||
          room.description.toLowerCase().includes(q)
      );
    }

    if (roomStatusFilter !== "all") {
      filtered = filtered.filter((room) => room.status === roomStatusFilter);
    }

    setFilteredRooms(filtered);
  }, [searchTerm, roomStatusFilter, rooms]);

  useEffect(() => {
    let filtered = [...packages];

    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (pkg) =>
          pkg.name.toLowerCase().includes(q) ||
          pkg.description.toLowerCase().includes(q)
      );
    }

    if (packageStatusFilter !== "all") {
      filtered = filtered.filter((pkg) => pkg.status === packageStatusFilter);
    }

    setFilteredPackages(filtered);
  }, [searchTerm, packageStatusFilter, packages]);

  // Handlers
  const handleRoomView = (room: UIRoom) => {
    setSelectedRoom(room);
    setIsRoomModalOpen(true);
  };

  const handlePackageView = (pkg: UIPackage) => {
    setSelectedPackage(pkg);
    setIsPackageModalOpen(true);
  };

  const handlePackageEdit = (pkg: UIPackage) => {
    setSelectedPackage(pkg);
    setIsEditPackageOpen(true);
  };

  const handleRoomEdit = (room: UIRoom) => {
    setSelectedRoom(room);
    setIsEditRoomOpen(true);
  };

  const handleRoomDelete = async (r: UIRoom) => {
    if (!confirm(`Delete room "${r.name}"?`)) return;
    try {
      const { error } = await supabase.from("rooms").delete().eq("id", r.id);
      if (error) throw error;
      await reloadRooms();
    } catch (e) {
      console.error(e);
      alert("Failed to delete room.");
    }
  };

  // Simple tabs UI + filters + lists
  return (
    <AdminLayout tenant={tenant}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Room & Package Management</h1>
        <div className="flex items-center gap-2">
          {activeTab === "rooms" && (
            <button
              onClick={() => setIsCreateRoomOpen(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              + Add Room
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-4">
        <div className="inline-flex rounded-lg border border-gray-200 overflow-hidden">
          <button
            onClick={() => setActiveTab("rooms")}
            className={`px-4 py-2 text-sm font-medium ${activeTab === "rooms" ? "bg-gray-900 text-white" : "bg-white text-gray-700 hover:bg-gray-50"}`}
          >
            Rooms
          </button>
          <button
            onClick={() => setActiveTab("packages")}
            className={`px-4 py-2 text-sm font-medium ${activeTab === "packages" ? "bg-gray-900 text-white" : "bg-white text-gray-700 hover:bg-gray-50"}`}
          >
            Packages
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <input
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full sm:w-72 px-3 py-2 border border-gray-300 rounded-lg"
          placeholder={`Search ${activeTab === "rooms" ? "rooms" : "packages"}...`}
        />
        {activeTab === "rooms" ? (
          <select
            value={roomStatusFilter}
            onChange={(e) => setRoomStatusFilter(e.target.value as RoomStatus)}
            className="px-3 py-2 border border-gray-300 rounded-lg"
          >
            <option value="all">All statuses</option>
            <option value="active">Active</option>
            <option value="maintenance">Maintenance</option>
            <option value="inactive">Inactive</option>
          </select>
        ) : (
          <select
            value={packageStatusFilter}
            onChange={(e) => setPackageStatusFilter(e.target.value as PackageStatus)}
            className="px-3 py-2 border border-gray-300 rounded-lg"
          >
            <option value="all">All statuses</option>
            <option value="active">Active</option>
            <option value="seasonal">Seasonal</option>
            <option value="inactive">Inactive</option>
          </select>
        )}
      </div>

      {/* Lists */}
      {loading ? (
        <div className="text-gray-500">Loading…</div>
      ) : activeTab === "rooms" ? (
        filteredRooms.length ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredRooms.map((room) => (
              <RoomCard
                key={room.id}
                room={room}
                onEdit={handleRoomEdit}
                onViewDetails={handleRoomView}
                onDelete={handleRoomDelete}
              />
            ))}
          </div>
        ) : (
          <div className="col-span-full text-center py-12">
            <p className="text-gray-500">No rooms found matching your criteria.</p>
          </div>
        )
      ) : filteredPackages.length ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredPackages.map((pkg) => (
            <PackageCard
              key={pkg.id}
              pkg={pkg}
              onEdit={handlePackageEdit}
              onViewDetails={handlePackageView}
            />
          ))}
        </div>
      ) : (
        <div className="col-span-full text-center py-12">
          <p className="text-gray-500">No packages found matching your criteria.</p>
        </div>
      )}

      {/* Detail Modals */}
      <RoomDetailModal
        room={selectedRoom}
        isOpen={isRoomModalOpen}
        onClose={() => setIsRoomModalOpen(false)}
      />
      <PackageDetailModal
        pkg={selectedPackage}
        isOpen={isPackageModalOpen}
        onClose={() => setIsPackageModalOpen(false)}
      />

      {/* Edit Package Modal */}
      <EditPackageModal
        isOpen={isEditPackageOpen}
        onClose={() => setIsEditPackageOpen(false)}
        pkg={selectedPackage}
        onUpdated={reloadPackages}
      />

      {/* Create / Edit Room Modals */}
      <CreateRoomModal
        tenant={tenant}
        isOpen={isCreateRoomOpen}
        onClose={() => setIsCreateRoomOpen(false)}
        onCreated={reloadRooms}
      />
      <EditRoomModal
        isOpen={isEditRoomOpen}
        onClose={() => setIsEditRoomOpen(false)}
        room={selectedRoom}
        onUpdated={reloadRooms}
      />
    </AdminLayout>
  );
}
