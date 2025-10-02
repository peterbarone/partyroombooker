"use client";

import { useState, useEffect } from "react";
import AdminLayout from "../../../../components/AdminLayout";

interface BookingManagementProps {
  params: Promise<{ tenant: string }>;
}

// Mock booking data - in production this would come from your database
const mockBookings = [
  {
    id: "BK001",
    customerName: "Sarah Johnson",
    customerEmail: "sarah.j@email.com",
    customerPhone: "(555) 123-4567",
    date: "2025-10-03",
    time: "2:00 PM - 4:00 PM",
    package: "Birthday Bash",
    room: "Party Room A",
    kidsCount: 8,
    status: "confirmed",
    depositPaid: 150,
    totalAmount: 299,
    balanceDue: 149,
    notes: "Birthday for 6-year-old Emma. Allergy to nuts.",
    createdAt: "2025-09-28",
  },
  {
    id: "BK002",
    customerName: "Mike Chen",
    customerEmail: "mike.chen@email.com",
    customerPhone: "(555) 987-6543",
    date: "2025-10-03",
    time: "4:30 PM - 6:30 PM",
    package: "Ultimate Celebration",
    room: "Sports Arena",
    kidsCount: 14,
    status: "pending_payment",
    depositPaid: 0,
    totalAmount: 459,
    balanceDue: 459,
    notes: "Corporate family event. Need setup by 4:00 PM.",
    createdAt: "2025-09-30",
  },
  {
    id: "BK003",
    customerName: "Lisa Rodriguez",
    customerEmail: "lisa.r@email.com",
    customerPhone: "(555) 456-7890",
    date: "2025-10-04",
    time: "11:00 AM - 1:00 PM",
    package: "Mini Party",
    room: "Craft Corner",
    kidsCount: 5,
    status: "confirmed",
    depositPaid: 100,
    totalAmount: 199,
    balanceDue: 99,
    notes: "Quiet party - child has autism.",
    createdAt: "2025-09-25",
  },
  {
    id: "BK004",
    customerName: "David Kim",
    customerEmail: "david.kim@email.com",
    customerPhone: "(555) 111-2222",
    date: "2025-10-05",
    time: "3:00 PM - 5:00 PM",
    package: "Birthday Bash",
    room: "Party Room B",
    kidsCount: 10,
    status: "cancelled",
    depositPaid: 150,
    totalAmount: 329,
    balanceDue: 0,
    notes: "Cancelled due to illness. Refund processed.",
    createdAt: "2025-09-20",
  },
];

type BookingStatus =
  | "all"
  | "confirmed"
  | "pending_payment"
  | "cancelled"
  | "completed";

const StatusBadge = ({ status }: { status: string }) => {
  const statusConfig = {
    confirmed: { color: "bg-green-100 text-green-800", label: "Confirmed" },
    pending_payment: {
      color: "bg-yellow-100 text-yellow-800",
      label: "Pending Payment",
    },
    cancelled: { color: "bg-red-100 text-red-800", label: "Cancelled" },
    completed: { color: "bg-blue-100 text-blue-800", label: "Completed" },
  };

  const config =
    statusConfig[status as keyof typeof statusConfig] || statusConfig.confirmed;

  return (
    <span
      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${config.color}`}
    >
      {config.label}
    </span>
  );
};

const BookingRow = ({
  booking,
  onEdit,
  onViewDetails,
}: {
  booking: (typeof mockBookings)[0];
  onEdit: (booking: (typeof mockBookings)[0]) => void;
  onViewDetails: (booking: (typeof mockBookings)[0]) => void;
}) => {
  return (
    <tr className="hover:bg-gray-50">
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm font-medium text-gray-900">{booking.id}</div>
        <div className="text-xs text-gray-500">{booking.createdAt}</div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm text-gray-900 font-medium">
          {booking.customerName}
        </div>
        <div className="text-xs text-gray-500">{booking.customerEmail}</div>
        <div className="text-xs text-gray-500">{booking.customerPhone}</div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm text-gray-900 font-medium">{booking.date}</div>
        <div className="text-xs text-gray-500">{booking.time}</div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm text-gray-900">{booking.package}</div>
        <div className="text-xs text-gray-500">
          {booking.room} • {booking.kidsCount} kids
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <StatusBadge status={booking.status} />
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm text-gray-900 font-medium">
          ${booking.totalAmount}
        </div>
        <div className="text-xs text-gray-500">
          Paid: ${booking.depositPaid} | Due: ${booking.balanceDue}
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
        <div className="flex space-x-2">
          <button
            onClick={() => onViewDetails(booking)}
            className="text-blue-600 hover:text-blue-900"
          >
            View
          </button>
          <button
            onClick={() => onEdit(booking)}
            className="text-indigo-600 hover:text-indigo-900"
          >
            Edit
          </button>
        </div>
      </td>
    </tr>
  );
};

const BookingDetailModal = ({
  booking,
  isOpen,
  onClose,
}: {
  booking: (typeof mockBookings)[0] | null;
  isOpen: boolean;
  onClose: () => void;
}) => {
  if (!isOpen || !booking) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">
              Booking Details
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
          {/* Customer Information */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-3">
              Customer Information
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Name
                </label>
                <p className="text-sm text-gray-900">{booking.customerName}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Email
                </label>
                <p className="text-sm text-gray-900">{booking.customerEmail}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Phone
                </label>
                <p className="text-sm text-gray-900">{booking.customerPhone}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Kids Count
                </label>
                <p className="text-sm text-gray-900">
                  {booking.kidsCount} children
                </p>
              </div>
            </div>
          </div>

          {/* Event Details */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-3">
              Event Details
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Date & Time
                </label>
                <p className="text-sm text-gray-900">
                  {booking.date} at {booking.time}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Package
                </label>
                <p className="text-sm text-gray-900">{booking.package}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Room
                </label>
                <p className="text-sm text-gray-900">{booking.room}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Status
                </label>
                <StatusBadge status={booking.status} />
              </div>
            </div>
          </div>

          {/* Payment Information */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-3">
              Payment Information
            </h3>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Total Amount
                </label>
                <p className="text-lg font-semibold text-gray-900">
                  ${booking.totalAmount}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Deposit Paid
                </label>
                <p className="text-lg font-semibold text-green-600">
                  ${booking.depositPaid}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Balance Due
                </label>
                <p className="text-lg font-semibold text-red-600">
                  ${booking.balanceDue}
                </p>
              </div>
            </div>
          </div>

          {/* Notes */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-3">
              Special Notes
            </h3>
            <p className="text-sm text-gray-900 bg-gray-50 p-3 rounded-lg">
              {booking.notes || "No special notes"}
            </p>
          </div>

          {/* Actions */}
          <div className="flex space-x-3 pt-4 border-t border-gray-200">
            <button className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors">
              Send Confirmation Email
            </button>
            <button className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors">
              Mark as Paid
            </button>
            <button className="flex-1 bg-gray-600 text-white py-2 px-4 rounded-lg hover:bg-gray-700 transition-colors">
              Print Details
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function BookingManagement({ params }: BookingManagementProps) {
  const [resolvedParams, setResolvedParams] = useState<{
    tenant: string;
  } | null>(null);
  const [bookings, setBookings] = useState(mockBookings);
  const [filteredBookings, setFilteredBookings] = useState(mockBookings);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<BookingStatus>("all");
  const [selectedBooking, setSelectedBooking] = useState<
    (typeof mockBookings)[0] | null
  >(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  useEffect(() => {
    params.then(setResolvedParams);
  }, [params]);

  // Filter bookings based on search and status
  useEffect(() => {
    let filtered = bookings;

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (booking) =>
          booking.customerName
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          booking.customerEmail
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          booking.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
          booking.customerPhone.includes(searchTerm)
      );
    }

    // Apply status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter((booking) => booking.status === statusFilter);
    }

    setFilteredBookings(filtered);
  }, [searchTerm, statusFilter, bookings]);

  const handleViewDetails = (booking: (typeof mockBookings)[0]) => {
    setSelectedBooking(booking);
    setIsDetailModalOpen(true);
  };

  const handleEdit = (booking: (typeof mockBookings)[0]) => {
    // In a real app, this would open an edit modal or navigate to edit page
    console.log("Edit booking:", booking.id);
  };

  if (!resolvedParams) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading bookings...</p>
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
            Booking Management
          </h1>
          <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
            + New Booking
          </button>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
            {/* Search */}
            <div className="flex-1">
              <input
                type="text"
                placeholder="Search bookings by name, email, or booking ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Status Filter */}
            <div>
              <select
                value={statusFilter}
                onChange={(e) =>
                  setStatusFilter(e.target.value as BookingStatus)
                }
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Status</option>
                <option value="confirmed">Confirmed</option>
                <option value="pending_payment">Pending Payment</option>
                <option value="cancelled">Cancelled</option>
                <option value="completed">Completed</option>
              </select>
            </div>

            {/* Export Button */}
            <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
              📊 Export
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="text-2xl font-bold text-blue-600">
              {filteredBookings.length}
            </div>
            <div className="text-sm text-gray-600">Total Bookings</div>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="text-2xl font-bold text-green-600">
              {filteredBookings.filter((b) => b.status === "confirmed").length}
            </div>
            <div className="text-sm text-gray-600">Confirmed</div>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="text-2xl font-bold text-yellow-600">
              {
                filteredBookings.filter((b) => b.status === "pending_payment")
                  .length
              }
            </div>
            <div className="text-sm text-gray-600">Pending Payment</div>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="text-2xl font-bold text-gray-900">
              $
              {filteredBookings
                .reduce((sum, b) => sum + b.totalAmount, 0)
                .toLocaleString()}
            </div>
            <div className="text-sm text-gray-600">Total Revenue</div>
          </div>
        </div>

        {/* Bookings Table */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Booking ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date & Time
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Package & Room
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Payment
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredBookings.map((booking) => (
                  <BookingRow
                    key={booking.id}
                    booking={booking}
                    onEdit={handleEdit}
                    onViewDetails={handleViewDetails}
                  />
                ))}
              </tbody>
            </table>
          </div>

          {filteredBookings.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500">
                No bookings found matching your criteria.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Booking Detail Modal */}
      <BookingDetailModal
        booking={selectedBooking}
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
      />
    </AdminLayout>
  );
}
