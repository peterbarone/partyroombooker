"use client";

import { useState, useEffect } from "react";
import AdminLayout from "../../../../components/AdminLayout";
import { supabase } from "@/lib/supabase";

interface BookingManagementProps {
  params: { tenant: string };
}

type UIBooking = {
  id: string;
  customerName: string;
  customerEmail?: string;
  customerPhone?: string;
  date: string;
  time: string; // formatted range
  package: string;
  room: string;
  kidsCount: number;
  status: string;
  depositPaid: number;
  totalAmount: number;
  balanceDue: number;
  notes?: string;
  createdAt: string;
};

type UIAddonLine = {
  id: string; // addon_id
  name: string;
  quantity: number;
  unitPrice: number;
  total: number;
};

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
  booking: UIBooking;
  onEdit: (booking: UIBooking) => void;
  onViewDetails: (booking: UIBooking) => void;
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
        <div className="text-xs text-gray-500">{booking.customerEmail || ""}</div>
        <div className="text-xs text-gray-500">{booking.customerPhone || ""}</div>
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
  addons,
  isOpen,
  onClose,
}: {
  booking: UIBooking | null;
  addons: UIAddonLine[];
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

          {/* Add-ons */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-3">Add-ons</h3>
            {addons.length > 0 ? (
              <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                      <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Qty</th>
                      <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Unit</th>
                      <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {addons.map((a) => (
                      <tr key={a.id}>
                        <td className="px-4 py-2 text-sm text-gray-900">{a.name}</td>
                        <td className="px-4 py-2 text-sm text-gray-900 text-right">{a.quantity}</td>
                        <td className="px-4 py-2 text-sm text-gray-900 text-right">${a.unitPrice.toFixed(2)}</td>
                        <td className="px-4 py-2 text-sm text-gray-900 text-right">${a.total.toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-gray-50">
                    <tr>
                      <td className="px-4 py-2 text-sm font-semibold text-gray-900" colSpan={3}>Add-ons Subtotal</td>
                      <td className="px-4 py-2 text-sm font-semibold text-gray-900 text-right">
                        ${addons.reduce((s, a) => s + a.total, 0).toFixed(2)}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            ) : (
              <p className="text-sm text-gray-600">No add-ons for this booking.</p>
            )}
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
  const tenant = params.tenant;
  const [loading, setLoading] = useState(true);
  const [bookings, setBookings] = useState<UIBooking[]>([]);
  const [filteredBookings, setFilteredBookings] = useState<UIBooking[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<BookingStatus>("all");
  const [selectedBooking, setSelectedBooking] = useState<UIBooking | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [bookingAddons, setBookingAddons] = useState<UIAddonLine[]>([]);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        // resolve tenant id
        const { data: tenantRow } = await supabase
          .from("tenants")
          .select("id")
          .eq("slug", tenant)
          .eq("active", true)
          .single();
        if (!tenantRow?.id) {
          setBookings([]);
          setFilteredBookings([]);
          return;
        }

        // fetch latest bookings
        const { data: rawBookings } = await supabase
          .from("bookings")
          .select("id, customer_id, package_id, room_id, start_time, end_time, kids_count, status, deposit_due, notes, created_at")
          .eq("tenant_id", tenantRow.id)
          .order("start_time", { ascending: false })
          .limit(100);

        const customerIds = Array.from(new Set((rawBookings || []).map(b => b.customer_id)));
        const packageIds = Array.from(new Set((rawBookings || []).map(b => b.package_id)));
        const roomIds = Array.from(new Set((rawBookings || []).map(b => b.room_id)));

        const [customersRes, packagesRes, roomsRes, paymentsRes] = await Promise.all([
          customerIds.length ? supabase.from("customers").select("id,name,email,phone").in("id", customerIds) : Promise.resolve({ data: [] as any[] }),
          packageIds.length ? supabase.from("packages").select("id,name,duration_min,duration_minutes,base_price,base_kids,extra_kid_price").in("id", packageIds) : Promise.resolve({ data: [] as any[] }),
          roomIds.length ? supabase.from("rooms").select("id,name").in("id", roomIds) : Promise.resolve({ data: [] as any[] }),
          supabase.from("payments").select("booking_id, amount, status, type"),
        ]);

        const customers = new Map((customersRes.data || []).map((c: any) => [c.id, c]));
        const packages = new Map((packagesRes.data || []).map((p: any) => [p.id, p]));
        const rooms = new Map((roomsRes.data || []).map((r: any) => [r.id, r]));
        const payments = paymentsRes.data || [];

        const ui: UIBooking[] = (rawBookings || []).map((b: any) => {
          const cust = customers.get(b.customer_id) || {};
          const pkg = packages.get(b.package_id) || {};
          const room = rooms.get(b.room_id) || {};
          const start = new Date(b.start_time);
          const end = new Date(b.end_time);

          // compute total using package pricing if desired; use deposit_due as total fallback
          const base = Number(pkg.base_price || 0);
          const baseKids = Number(pkg.base_kids || 0);
          const extraPrice = Number(pkg.extra_kid_price || 0);
          const extraKids = Math.max(0, Number(b.kids_count || 0) - baseKids);
          const totalAmount = base + extraKids * extraPrice;

          const paid = payments
            .filter((p: any) => p.booking_id === b.id && p.status === "completed")
            .reduce((sum: number, p: any) => sum + Number(p.amount || 0), 0);

          return {
            id: b.id,
            customerName: cust.name || "Customer",
            customerEmail: cust.email,
            customerPhone: cust.phone,
            date: start.toISOString().split("T")[0],
            time: `${start.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })} - ${end.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}`,
            package: pkg.name || "Package",
            room: room.name || "Room",
            kidsCount: Number(b.kids_count || 0),
            status: b.status,
            depositPaid: paid,
            totalAmount: totalAmount || Number(b.deposit_due || 0) * 2, // assume deposit is 50%
            balanceDue: Math.max(0, (totalAmount || Number(b.deposit_due || 0) * 2) - paid),
            notes: b.notes || undefined,
            createdAt: new Date(b.created_at).toISOString().split("T")[0],
          };
        });

        setBookings(ui);
        setFilteredBookings(ui);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [tenant]);

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
          (booking.customerEmail || "")
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          booking.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (booking.customerPhone || "").includes(searchTerm)
      );
    }

    // Apply status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter((booking) => booking.status === statusFilter);
    }

    setFilteredBookings(filtered);
  }, [searchTerm, statusFilter, bookings]);

  const handleViewDetails = (booking: UIBooking) => {
    setSelectedBooking(booking);
    setIsDetailModalOpen(true);
  };

  // Load add-ons whenever we open the modal for a booking
  useEffect(() => {
    const loadAddons = async (bookingId: string) => {
      // fetch booking_addons for this booking
      const { data: baRows } = await supabase
        .from("booking_addons")
        .select("addon_id, quantity, unit_price")
        .eq("booking_id", bookingId);
      const rows = baRows || [];
      if (rows.length === 0) {
        setBookingAddons([]);
        return;
      }
      const addonIds = Array.from(new Set(rows.map((r: any) => r.addon_id).filter(Boolean)));
      const { data: addonsRows } = await supabase
        .from("addons")
        .select("id, name")
        .in("id", addonIds);
      const nameMap = new Map((addonsRows || []).map((a: any) => [a.id, a.name]));
      const ui: UIAddonLine[] = rows.map((r: any) => {
        const qty = Number(r.quantity || 0);
        const unit = Number(r.unit_price || 0);
        return {
          id: r.addon_id,
          name: nameMap.get(r.addon_id) || "Addon",
          quantity: qty,
          unitPrice: unit,
          total: qty * unit,
        };
      });
      setBookingAddons(ui);
    };

    if (isDetailModalOpen && selectedBooking) {
      loadAddons(selectedBooking.id);
    } else {
      setBookingAddons([]);
    }
  }, [isDetailModalOpen, selectedBooking]);

  const handleEdit = (booking: UIBooking) => {
    // In a real app, this would open an edit modal or navigate to edit page
    console.log("Edit booking:", booking.id);
  };

  if (loading) {
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
    <AdminLayout tenant={tenant}>
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
        addons={bookingAddons}
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
      />
    </AdminLayout>
  );
}
