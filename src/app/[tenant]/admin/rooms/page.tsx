"use client";

import { useState, useEffect } from "react";
import AdminLayout from "../../../../components/AdminLayout";

interface RoomManagementProps {
  params: Promise<{ tenant: string }>;
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
}: {
  room: (typeof mockRooms)[0];
  onEdit: (room: (typeof mockRooms)[0]) => void;
  onViewDetails: (room: (typeof mockRooms)[0]) => void;
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
  const [resolvedParams, setResolvedParams] = useState<{
    tenant: string;
  } | null>(null);
  const [activeTab, setActiveTab] = useState<"rooms" | "packages">("rooms");
  const [roomStatusFilter, setRoomStatusFilter] = useState<RoomStatus>("all");
  const [packageStatusFilter, setPackageStatusFilter] =
    useState<PackageStatus>("all");
  const [searchTerm, setSearchTerm] = useState("");

  const [selectedRoom, setSelectedRoom] = useState<
    (typeof mockRooms)[0] | null
  >(null);
  const [selectedPackage, setSelectedPackage] = useState<
    (typeof mockPackages)[0] | null
  >(null);
  const [isRoomModalOpen, setIsRoomModalOpen] = useState(false);
  const [isPackageModalOpen, setIsPackageModalOpen] = useState(false);

  const [filteredRooms, setFilteredRooms] = useState(mockRooms);
  const [filteredPackages, setFilteredPackages] = useState(mockPackages);

  useEffect(() => {
    params.then(setResolvedParams);
  }, [params]);

  // Filter rooms
  useEffect(() => {
    let filtered = mockRooms;

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
  }, [searchTerm, roomStatusFilter]);

  // Filter packages
  useEffect(() => {
    let filtered = mockPackages;

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
  }, [searchTerm, packageStatusFilter]);

  const handleRoomViewDetails = (room: (typeof mockRooms)[0]) => {
    setSelectedRoom(room);
    setIsRoomModalOpen(true);
  };

  const handlePackageViewDetails = (pkg: (typeof mockPackages)[0]) => {
    setSelectedPackage(pkg);
    setIsPackageModalOpen(true);
  };

  const handleRoomEdit = (room: (typeof mockRooms)[0]) => {
    console.log("Edit room:", room.id);
  };

  const handlePackageEdit = (pkg: (typeof mockPackages)[0]) => {
    console.log("Edit package:", pkg.id);
  };

  if (!resolvedParams) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading rooms and packages...</p>
        </div>
      </div>
    );
  }

  return (
    <AdminLayout tenant={resolvedParams.tenant}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">
            Room & Package Management
          </h1>
          <div className="flex space-x-2">
            <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors">
              + Add Room
            </button>
            <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
              + Add Package
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {[
              { id: "rooms", label: "Rooms", count: mockRooms.length },
              { id: "packages", label: "Packages", count: mockPackages.length },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                {tab.label} ({tab.count})
              </button>
            ))}
          </nav>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder={`Search ${activeTab}...`}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              {activeTab === "rooms" ? (
                <select
                  value={roomStatusFilter}
                  onChange={(e) =>
                    setRoomStatusFilter(e.target.value as RoomStatus)
                  }
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="maintenance">Maintenance</option>
                  <option value="inactive">Inactive</option>
                </select>
              ) : (
                <select
                  value={packageStatusFilter}
                  onChange={(e) =>
                    setPackageStatusFilter(e.target.value as PackageStatus)
                  }
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="seasonal">Seasonal</option>
                  <option value="inactive">Inactive</option>
                </select>
              )}
            </div>
            <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
              📊 Export
            </button>
          </div>
        </div>

        {/* Content */}
        {activeTab === "rooms" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredRooms.map((room) => (
              <RoomCard
                key={room.id}
                room={room}
                onEdit={handleRoomEdit}
                onViewDetails={handleRoomViewDetails}
              />
            ))}
            {filteredRooms.length === 0 && (
              <div className="col-span-full text-center py-12">
                <p className="text-gray-500">
                  No rooms found matching your criteria.
                </p>
              </div>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredPackages.map((pkg) => (
              <PackageCard
                key={pkg.id}
                package={pkg}
                onEdit={handlePackageEdit}
                onViewDetails={handlePackageViewDetails}
              />
            ))}
            {filteredPackages.length === 0 && (
              <div className="col-span-full text-center py-12">
                <p className="text-gray-500">
                  No packages found matching your criteria.
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modals */}
      <RoomDetailModal
        room={selectedRoom}
        isOpen={isRoomModalOpen}
        onClose={() => setIsRoomModalOpen(false)}
      />

      <PackageDetailModal
        package={selectedPackage}
        isOpen={isPackageModalOpen}
        onClose={() => setIsPackageModalOpen(false)}
      />
    </AdminLayout>
  );
}
