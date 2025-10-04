"use client";

import { useState, useEffect } from "react";
import AdminLayout from "../../../../components/AdminLayout";
import { supabase } from "@/lib/supabase";

interface RoomManagementProps {
  params: { tenant: string };

// Create Room Modal
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
      await supabase.from("rooms").insert({
        tenant_id: tenantId,
        name,
        description: description || null,
        max_kids: capacity,
        active,
      });
      onCreated();
      onClose();
      setName("");
      setDescription("");
      setCapacity(0);
      setActive(true);
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
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
            <button onClick={submit} disabled={saving || !name} className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50">{saving ? "Saving..." : "Create"}</button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Edit Room Modal
const EditRoomModal = ({
  isOpen,
  onClose,
  room,
  onUpdated,
}: {
  isOpen: boolean;
  onClose: () => void;
  room: (typeof mockRooms)[0] | null;
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
      await supabase
        .from("rooms")
        .update({
          name,
          description: description || null,
          max_kids: capacity,
          active,
        })
        .eq("id", room.id);
      onUpdated();
      onClose();
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen || !room) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
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
            <button onClick={submit} disabled={saving || !name} className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50">{saving ? "Saving..." : "Save"}</button>
          </div>
        </div>
      </div>
    </div>
  );
};
}

// Mock room data
const mockRooms = [
  {
    id: "ROOM001",
    name: "Party Room A",
    description:
      "Our flagship party room perfect for birthday celebrations and special events.",
    capacity: 25,
    size: "600 sq ft",
    amenities: [
      "Tables and Chairs",
      "Sound System",
      "Projector Screen",
      "Mini Fridge",
      "Decorations Allowed",
    ],
    hourlyRate: 75,
    status: "active",
    availability: "weekdays_weekends",
    images: ["/images/party-room-a-1.jpg", "/images/party-room-a-2.jpg"],
    bookingCount: 45,
    revenue: 8250,
    rating: 4.8,
    lastMaintenance: "2025-09-15",
    nextMaintenance: "2025-12-15",
  },
  {
    id: "ROOM002",
    name: "Party Room B",
    description:
      "Spacious room with extra activities and entertainment options for larger groups.",
    capacity: 30,
    size: "750 sq ft",
    amenities: [
      "Tables and Chairs",
      "Sound System",
      "Gaming Station",
      "Craft Area",
      "Photo Booth Props",
    ],
    hourlyRate: 85,
    status: "active",
    availability: "weekends_only",
    images: ["/images/party-room-b-1.jpg"],
    bookingCount: 38,
    revenue: 7150,
    rating: 4.6,
    lastMaintenance: "2025-08-20",
    nextMaintenance: "2025-11-20",
  },
  {
    id: "ROOM003",
    name: "Sports Arena",
    description:
      "Active play area with sports equipment and physical activities for energetic celebrations.",
    capacity: 40,
    size: "900 sq ft",
    amenities: [
      "Sports Equipment",
      "Basketball Hoop",
      "Soccer Goals",
      "Safety Mats",
      "Scoreboard",
    ],
    hourlyRate: 95,
    status: "active",
    availability: "weekdays_weekends",
    images: ["/images/sports-arena-1.jpg", "/images/sports-arena-2.jpg"],
    bookingCount: 32,
    revenue: 6840,
    rating: 4.9,
    lastMaintenance: "2025-09-01",
    nextMaintenance: "2025-12-01",
  },
  {
    id: "ROOM004",
    name: "Craft Corner",
    description:
      "Quiet, creative space perfect for arts and crafts parties and smaller gatherings.",
    capacity: 15,
    size: "400 sq ft",
    amenities: [
      "Craft Tables",
      "Art Supplies Storage",
      "Sink Station",
      "Display Boards",
      "Good Lighting",
    ],
    hourlyRate: 55,
    status: "maintenance",
    availability: "weekdays_only",
    images: ["/images/craft-corner-1.jpg"],
    bookingCount: 28,
    revenue: 3920,
    rating: 4.7,
    lastMaintenance: "2025-10-01",
    nextMaintenance: "2025-10-15",
  },
];

// Mock package data
const mockPackages = [
  {
    id: "PKG001",
    name: "Mini Party",
    description:
      "Perfect starter package for smaller celebrations with essential party elements.",
    duration: 2,
    maxGuests: 10,
    basePrice: 199,
    includes: [
      "2-hour room rental",
      "Basic decorations",
      "Paper goods (plates, cups, napkins)",
      "Party host assistance",
      "Cleanup service",
    ],
    addOns: [
      { name: "Extra hour", price: 50 },
      { name: "Additional decorations", price: 25 },
      { name: "Goodie bags (per child)", price: 8 },
    ],
    availableRooms: ["ROOM001", "ROOM004"],
    status: "active",
    bookingCount: 156,
    revenue: 31044,
    popularity: 85,
  },
  {
    id: "PKG002",
    name: "Birthday Bash",
    description:
      "Our most popular package with everything needed for an amazing birthday celebration.",
    duration: 3,
    maxGuests: 20,
    basePrice: 299,
    includes: [
      "3-hour room rental",
      "Premium decorations",
      "Paper goods and utensils",
      "Birthday cake table setup",
      "Party host for full duration",
      "Games and activities",
      "Cleanup service",
      "Birthday child gets special gift",
    ],
    addOns: [
      { name: "Extra hour", price: 75 },
      { name: "Themed decorations", price: 50 },
      { name: "Face painting (1 hour)", price: 80 },
      { name: "Goodie bags (per child)", price: 12 },
    ],
    availableRooms: ["ROOM001", "ROOM002", "ROOM003"],
    status: "active",
    bookingCount: 203,
    revenue: 60697,
    popularity: 92,
  },
  {
    id: "PKG003",
    name: "Ultimate Celebration",
    description:
      "Premium all-inclusive package for the most memorable celebration experience.",
    duration: 4,
    maxGuests: 30,
    basePrice: 459,
    includes: [
      "4-hour room rental",
      "Deluxe decorations and setup",
      "Premium paper goods and utensils",
      "Cake cutting ceremony",
      "Dedicated party coordinator",
      "Entertainment package (games, music)",
      "Photo session with props",
      "Full cleanup service",
      "Special birthday child crown and sash",
      "Goodie bags for all children",
    ],
    addOns: [
      { name: "Extra hour", price: 100 },
      { name: "Professional photographer", price: 150 },
      { name: "Character appearance", price: 200 },
      { name: "Catering upgrade", price: 120 },
    ],
    availableRooms: ["ROOM001", "ROOM002", "ROOM003"],
    status: "active",
    bookingCount: 89,
    revenue: 40851,
    popularity: 78,
  },
  {
    id: "PKG004",
    name: "Craft Party Special",
    description:
      "Creative package focused on arts, crafts, and hands-on activities.",
    duration: 2.5,
    maxGuests: 12,
    basePrice: 249,
    includes: [
      "2.5-hour room rental",
      "All craft supplies included",
      "Project instruction and guidance",
      "Take-home craft projects",
      "Light refreshment setup",
      "Cleanup of craft materials",
    ],
    addOns: [
      { name: "Extra craft project", price: 15 },
      { name: "Additional supplies", price: 30 },
      { name: "Pottery painting add-on", price: 60 },
    ],
    availableRooms: ["ROOM004"],
    status: "seasonal",
    bookingCount: 67,
    revenue: 16683,
    popularity: 71,
  },
];

type RoomStatus = "all" | "active" | "maintenance" | "inactive";
type PackageStatus = "all" | "active" | "seasonal" | "inactive";

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
        maintenance: {
          color: "bg-yellow-100 text-yellow-800",
          label: "Maintenance",
        },
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
    <span
      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${config.color}`}
    >
      {config.label}
    </span>
  );
};

const RoomCard = ({
  room,
  onEdit,
  onViewDetails,
  onDelete,
}: {
  room: (typeof mockRooms)[0];
  onEdit: (room: (typeof mockRooms)[0]) => void;
  onViewDetails: (room: (typeof mockRooms)[0]) => void;
  onDelete: (room: (typeof mockRooms)[0]) => void;
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
            <span className="text-sm text-gray-900 ml-1">
              {room.capacity} guests
            </span>
          </div>
          <div>
            <span className="text-sm font-medium text-gray-700">Size:</span>
            <span className="text-sm text-gray-900 ml-1">{room.size}</span>
          </div>
          <div>
            <span className="text-sm font-medium text-gray-700">Rate:</span>
            <span className="text-sm text-gray-900 ml-1">
              ${room.hourlyRate}/hour
            </span>
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
              <span
                key={index}
                className="inline-flex px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded"
              >
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
          <button
            onClick={() => onViewDetails(room)}
            className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors text-sm"
          >
            View Details
          </button>
          <button
            onClick={() => onEdit(room)}
            className="flex-1 bg-gray-600 text-white py-2 px-4 rounded-lg hover:bg-gray-700 transition-colors text-sm"
          >
            Edit Room
          </button>
          <button
            onClick={() => onDelete(room)}
            className="flex-1 bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition-colors text-sm"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

const PackageCard = ({
  package: pkg,
  onEdit,
  onViewDetails,
}: {
  package: (typeof mockPackages)[0];
  onEdit: (pkg: (typeof mockPackages)[0]) => void;
  onViewDetails: (pkg: (typeof mockPackages)[0]) => void;
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
            <span className="text-sm text-gray-900 ml-1">
              {pkg.duration} hours
            </span>
          </div>
          <div>
            <span className="text-sm font-medium text-gray-700">
              Max Guests:
            </span>
            <span className="text-sm text-gray-900 ml-1">{pkg.maxGuests}</span>
          </div>
          <div>
            <span className="text-sm font-medium text-gray-700">
              Base Price:
            </span>
            <span className="text-sm text-gray-900 ml-1 font-semibold">
              ${pkg.basePrice}
            </span>
          </div>
          <div>
            <span className="text-sm font-medium text-gray-700">
              Popularity:
            </span>
            <span className="text-sm text-gray-900 ml-1">
              {pkg.popularity}%
            </span>
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
              <li className="text-gray-500">
                +{pkg.includes.length - 4} more items
              </li>
            )}
          </ul>
        </div>

        <div className="grid grid-cols-2 gap-4 text-sm text-gray-600 mb-4">
          <div>📅 {pkg.bookingCount} bookings</div>
          <div>💰 ${pkg.revenue.toLocaleString()} revenue</div>
        </div>

        <div className="flex space-x-2">
          <button
            onClick={() => onViewDetails(pkg)}
            className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors text-sm"
          >
            View Details
          </button>
          <button
            onClick={() => onEdit(pkg)}
            className="flex-1 bg-gray-600 text-white py-2 px-4 rounded-lg hover:bg-gray-700 transition-colors text-sm"
          >
            Edit Package
          </button>
        </div>
      </div>
    </div>
  );
};

const RoomDetailModal = ({
  room,
  isOpen,
  onClose,
}: {
  room: (typeof mockRooms)[0] | null;
  isOpen: boolean;
  onClose: () => void;
}) => {
  if (!isOpen || !room) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">
              {room.name} Details
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          </div>
        </div>

        <div className="px-6 py-4 space-y-6">
          {/* Room Information */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-3">
              Room Information
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Capacity
                </label>
                <p className="text-sm text-gray-900">{room.capacity} guests</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Size
                </label>
                <p className="text-sm text-gray-900">{room.size}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Hourly Rate
                </label>
                <p className="text-sm text-gray-900">${room.hourlyRate}/hour</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Status
                </label>
                <StatusBadge status={room.status} type="room" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Availability
                </label>
                <p className="text-sm text-gray-900 capitalize">
                  {room.availability.replace("_", " & ")}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Rating
                </label>
                <p className="text-sm text-gray-900">⭐ {room.rating} / 5.0</p>
              </div>
            </div>
          </div>

          {/* Description */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-3">
              Description
            </h3>
            <p className="text-sm text-gray-900 bg-gray-50 p-3 rounded-lg">
              {room.description}
            </p>
          </div>

          {/* Amenities */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-3">
              Amenities
            </h3>
            <div className="grid grid-cols-2 gap-2">
              {room.amenities.map((amenity, index) => (
                <div
                  key={index}
                  className="flex items-center text-sm text-gray-900"
                >
                  <span className="text-green-600 mr-2">✓</span>
                  {amenity}
                </div>
              ))}
            </div>
          </div>

          {/* Performance Stats */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-3">
              Performance
            </h3>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {room.bookingCount}
                </div>
                <div className="text-sm text-gray-600">Total Bookings</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  ${room.revenue.toLocaleString()}
                </div>
                <div className="text-sm text-gray-600">Revenue Generated</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {room.rating}
                </div>
                <div className="text-sm text-gray-600">Average Rating</div>
              </div>
            </div>
          </div>

          {/* Maintenance */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-3">
              Maintenance Schedule
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Last Maintenance
                </label>
                <p className="text-sm text-gray-900">
                  {new Date(room.lastMaintenance).toLocaleDateString()}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Next Maintenance
                </label>
                <p className="text-sm text-gray-900">
                  {new Date(room.nextMaintenance).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex space-x-3 pt-4 border-t border-gray-200">
            <button className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors">
              Edit Room
            </button>
            <button className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors">
              View Bookings
            </button>
            <button className="flex-1 bg-yellow-600 text-white py-2 px-4 rounded-lg hover:bg-yellow-700 transition-colors">
              Schedule Maintenance
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const PackageDetailModal = ({
  package: pkg,
  isOpen,
  onClose,
}: {
  package: (typeof mockPackages)[0] | null;
  isOpen: boolean;
  onClose: () => void;
}) => {
  if (!isOpen || !pkg) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">
              {pkg.name} Details
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          </div>
        </div>

        <div className="px-6 py-4 space-y-6">
          {/* Package Information */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-3">
              Package Information
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Duration
                </label>
                <p className="text-sm text-gray-900">{pkg.duration} hours</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Max Guests
                </label>
                <p className="text-sm text-gray-900">{pkg.maxGuests} people</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Base Price
                </label>
                <p className="text-sm text-gray-900 font-semibold">
                  ${pkg.basePrice}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Status
                </label>
                <StatusBadge status={pkg.status} type="package" />
              </div>
            </div>
          </div>

          {/* Description */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-3">
              Description
            </h3>
            <p className="text-sm text-gray-900 bg-gray-50 p-3 rounded-lg">
              {pkg.description}
            </p>
          </div>

          {/* Includes */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-3">
              Package Includes
            </h3>
            <div className="space-y-2">
              {pkg.includes.map((item, index) => (
                <div
                  key={index}
                  className="flex items-start text-sm text-gray-900"
                >
                  <span className="text-green-600 mr-2 mt-0.5">✓</span>
                  {item}
                </div>
              ))}
            </div>
          </div>

          {/* Add-ons */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-3">
              Available Add-ons
            </h3>
            <div className="space-y-2">
              {pkg.addOns.map((addon, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between text-sm p-2 bg-gray-50 rounded"
                >
                  <span className="text-gray-900">{addon.name}</span>
                  <span className="font-medium text-gray-900">
                    +${addon.price}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Performance Stats */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-3">
              Performance
            </h3>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {pkg.bookingCount}
                </div>
                <div className="text-sm text-gray-600">Total Bookings</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  ${pkg.revenue.toLocaleString()}
                </div>
                <div className="text-sm text-gray-600">Revenue Generated</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {pkg.popularity}%
                </div>
                <div className="text-sm text-gray-600">Popularity Score</div>
              </div>
            </div>
          </div>

          {/* Available Rooms */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-3">
              Available Rooms
            </h3>
            <div className="flex flex-wrap gap-2">
              {pkg.availableRooms.map((roomId) => {
                const room = mockRooms.find((r) => r.id === roomId);
                return room ? (
                  <span
                    key={roomId}
                    className="inline-flex px-3 py-1 text-sm bg-blue-100 text-blue-800 rounded-full"
                  >
                    {room.name}
                  </span>
                ) : null;
              })}
            </div>
          </div>

          {/* Actions */}
          <div className="flex space-x-3 pt-4 border-t border-gray-200">
            <button className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors">
              Edit Package
            </button>
            <button className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors">
              View Bookings
            </button>
            <button className="flex-1 bg-purple-600 text-white py-2 px-4 rounded-lg hover:bg-purple-700 transition-colors">
              Duplicate Package
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function RoomManagement({ params }: RoomManagementProps) {
  const tenant = params.tenant;
  const [activeTab, setActiveTab] = useState<"rooms" | "packages">("rooms");
  const [roomStatusFilter, setRoomStatusFilter] = useState<RoomStatus>("all");
  const [packageStatusFilter, setPackageStatusFilter] =
    useState<PackageStatus>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [selectedRoom, setSelectedRoom] = useState<
    (typeof mockRooms)[0] | null
  >(null);
  const [selectedPackage, setSelectedPackage] = useState<
    (typeof mockPackages)[0] | null
  >(null);
  const [isRoomModalOpen, setIsRoomModalOpen] = useState(false);
  const [isPackageModalOpen, setIsPackageModalOpen] = useState(false);
  const [isCreateRoomOpen, setIsCreateRoomOpen] = useState(false);
  const [isEditRoomOpen, setIsEditRoomOpen] = useState(false);

  const [rooms, setRooms] = useState<(typeof mockRooms)[0][]>([]);
  const [packages, setPackages] = useState<(typeof mockPackages)[0][]>([]);
  const [filteredRooms, setFilteredRooms] = useState<(typeof mockRooms)[0][]>(
    []
  );
  const [filteredPackages, setFilteredPackages] = useState<
    (typeof mockPackages)[0][]
  >([]);

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

        const mappedRooms: (typeof mockRooms)[0][] = (roomsData || []).map(
          (r: any) => ({
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
          })
        );

        const mappedPkgs: (typeof mockPackages)[0][] = (packagesData || []).map(
          (p: any) => {
            const minutes = Number(p.duration_min ?? p.duration_minutes ?? 120);
            let includes: string[] = [];
            if (Array.isArray(p.includes_json)) includes = p.includes_json;
            else if (p.includes_json?.includes) includes = p.includes_json.includes;
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
          }
        );

        setRooms(mappedRooms);
        setPackages(mappedPkgs);
        setFilteredRooms(mappedRooms);
        setFilteredPackages(mappedPkgs);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [tenant]);

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
      const { data: roomsData } = await supabase
        .from("rooms")
        .select("id,name,description,max_kids,active")
        .eq("tenant_id", tenantRow.id)
        .order("name");
      const mappedRooms: (typeof mockRooms)[0][] = (roomsData || []).map(
        (r: any) => ({
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
        })
      );
      setRooms(mappedRooms);
      setFilteredRooms(mappedRooms);
    } finally {
      setLoading(false);
    }
  };

  // Filter rooms
  useEffect(() => {
    let filtered = rooms;

    if (searchTerm) {
      filtered = filtered.filter(
        (room) =>
          room.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          room.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (roomStatusFilter !== "all") {
      filtered = filtered.filter((room) => room.status === roomStatusFilter);
    }

    setFilteredRooms(filtered);
  }, [searchTerm, roomStatusFilter, rooms]);

  // Filter packages
  useEffect(() => {
    let filtered = packages;

    if (searchTerm) {
      filtered = filtered.filter(
        (pkg) =>
          pkg.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          pkg.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (packageStatusFilter !== "all") {
      filtered = filtered.filter((pkg) => pkg.status === packageStatusFilter);
    }

    setFilteredPackages(filtered);
  }, [searchTerm, packageStatusFilter, packages]);


  const handleRoomEdit = (room: (typeof mockRooms)[0]) => {
    setSelectedRoom(room);
    setIsEditRoomOpen(true);
  };

  const handleRoomDelete = async (r: (typeof mockRooms)[0]) => {
    await supabase.from("rooms").delete().eq("id", r.id);
    await reloadRooms();
  };

        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">
            Room & Package Management
          </h1>
          <button onClick={() => setIsCreateRoomOpen(true)} className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">+ Add Room</button>
{{ ... }}
                onDelete={handleRoomDelete}
              />
            ))}
          </div>
        ) : (
          <div className="col-span-full text-center py-12">
            <p className="text-gray-500">No rooms found matching your criteria.</p>
          </div>
        )}
<RoomDetailModal
        room={selectedRoom}
        isOpen={isRoomModalOpen}
        onClose={() => setIsRoomModalOpen(false)}
      />
      <PackageDetailModal
{{ ... }}
        isOpen={isPackageModalOpen}
        onClose={() => setIsPackageModalOpen(false)}
      />

      {/* Create Room Modal */}
      <CreateRoomModal
        tenant={tenant}
        isOpen={isCreateRoomOpen}
        onClose={() => setIsCreateRoomOpen(false)}
        onCreated={reloadRooms}
      />

      {/* Edit Room Modal */}
      <EditRoomModal
        isOpen={isEditRoomOpen}
        onClose={() => setIsEditRoomOpen(false)}
        room={selectedRoom}
        onUpdated={reloadRooms}
      />
    </AdminLayout>
  );
}
