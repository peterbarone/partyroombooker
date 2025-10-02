"use client";

import { useState, useEffect } from "react";
import AdminLayout from "../../../../components/AdminLayout";

interface CustomerManagementProps {
  params: Promise<{ tenant: string }>;
}

// Mock customer data with booking history
const mockCustomers = [
  {
    id: "CUST001",
    firstName: "Sarah",
    lastName: "Johnson",
    email: "sarah.j@email.com",
    phone: "(555) 123-4567",
    address: "123 Maple Street, Springfield, IL 62701",
    dateOfBirth: "1985-03-15",
    joinDate: "2024-01-15",
    totalBookings: 5,
    totalSpent: 1295,
    lastBooking: "2025-10-03",
    status: "active",
    loyaltyPoints: 250,
    notes: "Prefers afternoon parties. Daughter Emma has nut allergy.",
    emergencyContact: "Mike Johnson - (555) 123-4568",
    bookingHistory: [
      {
        id: "BK001",
        date: "2025-10-03",
        package: "Birthday Bash",
        room: "Party Room A",
        amount: 299,
        status: "confirmed",
        kidsCount: 8,
      },
      {
        id: "BK022",
        date: "2025-07-15",
        package: "Mini Party",
        room: "Craft Corner",
        amount: 199,
        status: "completed",
        kidsCount: 6,
      },
      {
        id: "BK035",
        date: "2025-04-22",
        package: "Birthday Bash",
        room: "Party Room B",
        amount: 329,
        status: "completed",
        kidsCount: 10,
      },
    ],
    communications: [
      {
        id: 1,
        date: "2025-09-28",
        type: "email",
        subject: "Booking Confirmation - BK001",
        content: "Thank you for booking with us! Your party is confirmed.",
        sentBy: "System",
      },
      {
        id: 2,
        date: "2025-09-25",
        type: "phone",
        subject: "Follow-up call about allergies",
        content: "Discussed Emma's nut allergy. Updated customer notes.",
        sentBy: "Maria Garcia",
      },
    ],
  },
  {
    id: "CUST002",
    firstName: "Mike",
    lastName: "Chen",
    email: "mike.chen@email.com",
    phone: "(555) 987-6543",
    address: "456 Oak Avenue, Springfield, IL 62702",
    dateOfBirth: "1980-11-22",
    joinDate: "2024-03-10",
    totalBookings: 3,
    totalSpent: 897,
    lastBooking: "2025-10-03",
    status: "active",
    loyaltyPoints: 180,
    notes: "Corporate account - family events for employees.",
    emergencyContact: "Lisa Chen - (555) 987-6544",
    bookingHistory: [
      {
        id: "BK002",
        date: "2025-10-03",
        package: "Ultimate Celebration",
        room: "Sports Arena",
        amount: 459,
        status: "pending_payment",
        kidsCount: 14,
      },
      {
        id: "BK018",
        date: "2025-06-08",
        package: "Birthday Bash",
        room: "Party Room A",
        amount: 299,
        status: "completed",
        kidsCount: 8,
      },
    ],
    communications: [
      {
        id: 1,
        date: "2025-09-30",
        type: "email",
        subject: "Payment Reminder - BK002",
        content: "Friendly reminder about outstanding payment.",
        sentBy: "System",
      },
    ],
  },
  {
    id: "CUST003",
    firstName: "Lisa",
    lastName: "Rodriguez",
    email: "lisa.r@email.com",
    phone: "(555) 456-7890",
    address: "789 Pine Road, Springfield, IL 62703",
    dateOfBirth: "1988-07-08",
    joinDate: "2023-09-20",
    totalBookings: 8,
    totalSpent: 2156,
    lastBooking: "2025-10-04",
    status: "vip",
    loyaltyPoints: 430,
    notes: "VIP customer. Son has autism - prefers quiet environments.",
    emergencyContact: "Carlos Rodriguez - (555) 456-7891",
    bookingHistory: [
      {
        id: "BK003",
        date: "2025-10-04",
        package: "Mini Party",
        room: "Craft Corner",
        amount: 199,
        status: "confirmed",
        kidsCount: 5,
      },
      {
        id: "BK025",
        date: "2025-08-12",
        package: "Birthday Bash",
        room: "Craft Corner",
        amount: 279,
        status: "completed",
        kidsCount: 7,
      },
    ],
    communications: [
      {
        id: 1,
        date: "2025-09-25",
        type: "phone",
        subject: "Special accommodations discussion",
        content: "Discussed quiet party setup for autistic child.",
        sentBy: "Jennifer Smith",
      },
    ],
  },
  {
    id: "CUST004",
    firstName: "David",
    lastName: "Kim",
    email: "david.kim@email.com",
    phone: "(555) 111-2222",
    address: "321 Elm Street, Springfield, IL 62704",
    dateOfBirth: "1990-02-14",
    joinDate: "2024-08-05",
    totalBookings: 2,
    totalSpent: 329,
    lastBooking: "2025-10-05",
    status: "inactive",
    loyaltyPoints: 65,
    notes: "Recent cancellation due to illness. Refund processed.",
    emergencyContact: "Susan Kim - (555) 111-2223",
    bookingHistory: [
      {
        id: "BK004",
        date: "2025-10-05",
        package: "Birthday Bash",
        room: "Party Room B",
        amount: 329,
        status: "cancelled",
        kidsCount: 10,
      },
      {
        id: "BK012",
        date: "2024-12-18",
        package: "Mini Party",
        room: "Craft Corner",
        amount: 199,
        status: "completed",
        kidsCount: 4,
      },
    ],
    communications: [
      {
        id: 1,
        date: "2025-09-20",
        type: "email",
        subject: "Cancellation processed",
        content: "Booking cancelled due to illness. Refund issued.",
        sentBy: "System",
      },
    ],
  },
];

type CustomerStatus = "all" | "active" | "inactive" | "vip";

const StatusBadge = ({ status }: { status: string }) => {
  const statusConfig = {
    active: { color: "bg-green-100 text-green-800", label: "Active" },
    inactive: { color: "bg-gray-100 text-gray-800", label: "Inactive" },
    vip: { color: "bg-purple-100 text-purple-800", label: "VIP" },
  };

  const config =
    statusConfig[status as keyof typeof statusConfig] || statusConfig.active;

  return (
    <span
      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${config.color}`}
    >
      {config.label}
    </span>
  );
};

const CustomerRow = ({
  customer,
  onEdit,
  onViewDetails,
}: {
  customer: (typeof mockCustomers)[0];
  onEdit: (customer: (typeof mockCustomers)[0]) => void;
  onViewDetails: (customer: (typeof mockCustomers)[0]) => void;
}) => {
  return (
    <tr className="hover:bg-gray-50">
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center">
          <div className="flex-shrink-0 h-10 w-10">
            <div className="h-10 w-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-medium">
              {customer.firstName.charAt(0)}
              {customer.lastName.charAt(0)}
            </div>
          </div>
          <div className="ml-4">
            <div className="text-sm font-medium text-gray-900">
              {customer.firstName} {customer.lastName}
            </div>
            <div className="text-sm text-gray-500">{customer.email}</div>
          </div>
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm text-gray-900">{customer.phone}</div>
        <div className="text-sm text-gray-500">ID: {customer.id}</div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm text-gray-900 font-medium">
          {customer.totalBookings}
        </div>
        <div className="text-sm text-gray-500">
          Last: {new Date(customer.lastBooking).toLocaleDateString()}
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm text-gray-900 font-medium">
          ${customer.totalSpent.toLocaleString()}
        </div>
        <div className="text-sm text-gray-500">
          {customer.loyaltyPoints} pts
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <StatusBadge status={customer.status} />
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
        <div className="flex space-x-2">
          <button
            onClick={() => onViewDetails(customer)}
            className="text-blue-600 hover:text-blue-900"
          >
            View
          </button>
          <button
            onClick={() => onEdit(customer)}
            className="text-indigo-600 hover:text-indigo-900"
          >
            Edit
          </button>
        </div>
      </td>
    </tr>
  );
};

const CustomerDetailModal = ({
  customer,
  isOpen,
  onClose,
}: {
  customer: (typeof mockCustomers)[0] | null;
  isOpen: boolean;
  onClose: () => void;
}) => {
  const [activeTab, setActiveTab] = useState<
    "info" | "bookings" | "communications"
  >("info");

  if (!isOpen || !customer) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="h-12 w-12 rounded-full bg-blue-500 flex items-center justify-center text-white font-medium text-lg">
                {customer.firstName.charAt(0)}
                {customer.lastName.charAt(0)}
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  {customer.firstName} {customer.lastName}
                </h2>
                <p className="text-sm text-gray-500">
                  Customer ID: {customer.id}
                </p>
              </div>
              <StatusBadge status={customer.status} />
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          </div>

          {/* Tabs */}
          <div className="mt-4 border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              {[
                { id: "info", label: "Customer Info" },
                { id: "bookings", label: "Booking History" },
                { id: "communications", label: "Communications" },
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
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>
        </div>

        <div className="px-6 py-4">
          {/* Customer Info Tab */}
          {activeTab === "info" && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">
                    Contact Information
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Email
                      </label>
                      <p className="text-sm text-gray-900">{customer.email}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Phone
                      </label>
                      <p className="text-sm text-gray-900">{customer.phone}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Address
                      </label>
                      <p className="text-sm text-gray-900">
                        {customer.address}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Emergency Contact
                      </label>
                      <p className="text-sm text-gray-900">
                        {customer.emergencyContact}
                      </p>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">
                    Customer Details
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Date of Birth
                      </label>
                      <p className="text-sm text-gray-900">
                        {new Date(customer.dateOfBirth).toLocaleDateString()}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Join Date
                      </label>
                      <p className="text-sm text-gray-900">
                        {new Date(customer.joinDate).toLocaleDateString()}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Total Bookings
                      </label>
                      <p className="text-sm text-gray-900">
                        {customer.totalBookings}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Total Spent
                      </label>
                      <p className="text-sm text-gray-900">
                        ${customer.totalSpent.toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Loyalty Points
                      </label>
                      <p className="text-sm text-gray-900">
                        {customer.loyaltyPoints} points
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Special Notes
                </h3>
                <p className="text-sm text-gray-900 bg-gray-50 p-3 rounded-lg">
                  {customer.notes}
                </p>
              </div>
            </div>
          )}

          {/* Booking History Tab */}
          {activeTab === "bookings" && (
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Booking History
              </h3>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Booking ID
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Package & Room
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Amount
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {customer.bookingHistory.map((booking) => (
                      <tr key={booking.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {booking.id}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {new Date(booking.date).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          <div>{booking.package}</div>
                          <div className="text-xs text-gray-500">
                            {booking.room} • {booking.kidsCount} kids
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          ${booking.amount}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              booking.status === "confirmed"
                                ? "bg-green-100 text-green-800"
                                : booking.status === "pending_payment"
                                ? "bg-yellow-100 text-yellow-800"
                                : booking.status === "completed"
                                ? "bg-blue-100 text-blue-800"
                                : "bg-red-100 text-red-800"
                            }`}
                          >
                            {booking.status.replace("_", " ").toUpperCase()}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Communications Tab */}
          {activeTab === "communications" && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                  Communication History
                </h3>
                <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                  + Add Note
                </button>
              </div>
              <div className="space-y-4">
                {customer.communications.map((comm) => (
                  <div key={comm.id} className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            comm.type === "email"
                              ? "bg-blue-100 text-blue-800"
                              : "bg-green-100 text-green-800"
                          }`}
                        >
                          {comm.type === "email" ? "📧 Email" : "📞 Phone"}
                        </span>
                        <span className="text-sm text-gray-500">
                          {new Date(comm.date).toLocaleDateString()}
                        </span>
                      </div>
                      <span className="text-sm text-gray-500">
                        by {comm.sentBy}
                      </span>
                    </div>
                    <h4 className="font-medium text-gray-900 mb-1">
                      {comm.subject}
                    </h4>
                    <p className="text-sm text-gray-700">{comm.content}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex space-x-3 pt-6 border-t border-gray-200 mt-6">
            <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
              Edit Customer
            </button>
            <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors">
              Send Email
            </button>
            <button className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors">
              Create Booking
            </button>
            <button className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors">
              Export Data
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function CustomerManagement({
  params,
}: CustomerManagementProps) {
  const [resolvedParams, setResolvedParams] = useState<{
    tenant: string;
  } | null>(null);
  const [customers, setCustomers] = useState(mockCustomers);
  const [filteredCustomers, setFilteredCustomers] = useState(mockCustomers);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<CustomerStatus>("all");
  const [selectedCustomer, setSelectedCustomer] = useState<
    (typeof mockCustomers)[0] | null
  >(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  useEffect(() => {
    params.then(setResolvedParams);
  }, [params]);

  // Filter customers based on search and status
  useEffect(() => {
    let filtered = customers;

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (customer) =>
          customer.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          customer.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          customer.phone.includes(searchTerm) ||
          customer.id.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter(
        (customer) => customer.status === statusFilter
      );
    }

    setFilteredCustomers(filtered);
  }, [searchTerm, statusFilter, customers]);

  const handleViewDetails = (customer: (typeof mockCustomers)[0]) => {
    setSelectedCustomer(customer);
    setIsDetailModalOpen(true);
  };

  const handleEdit = (customer: (typeof mockCustomers)[0]) => {
    console.log("Edit customer:", customer.id);
  };

  if (!resolvedParams) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading customers...</p>
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
            Customer Management
          </h1>
          <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
            + Add Customer
          </button>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
            {/* Search */}
            <div className="flex-1">
              <input
                type="text"
                placeholder="Search customers by name, email, phone, or ID..."
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
                  setStatusFilter(e.target.value as CustomerStatus)
                }
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="vip">VIP</option>
              </select>
            </div>

            {/* Export Button */}
            <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
              📊 Export
            </button>
          </div>
        </div>

        {/* Customer Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="text-2xl font-bold text-blue-600">
              {filteredCustomers.length}
            </div>
            <div className="text-sm text-gray-600">Total Customers</div>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="text-2xl font-bold text-green-600">
              {filteredCustomers.filter((c) => c.status === "active").length}
            </div>
            <div className="text-sm text-gray-600">Active Customers</div>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="text-2xl font-bold text-purple-600">
              {filteredCustomers.filter((c) => c.status === "vip").length}
            </div>
            <div className="text-sm text-gray-600">VIP Customers</div>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="text-2xl font-bold text-gray-900">
              $
              {filteredCustomers
                .reduce((sum, c) => sum + c.totalSpent, 0)
                .toLocaleString()}
            </div>
            <div className="text-sm text-gray-600">Total Revenue</div>
          </div>
        </div>

        {/* Customers Table */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contact
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Bookings
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Value
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredCustomers.map((customer) => (
                  <CustomerRow
                    key={customer.id}
                    customer={customer}
                    onEdit={handleEdit}
                    onViewDetails={handleViewDetails}
                  />
                ))}
              </tbody>
            </table>
          </div>

          {filteredCustomers.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500">
                No customers found matching your criteria.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Customer Detail Modal */}
      <CustomerDetailModal
        customer={selectedCustomer}
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
      />
    </AdminLayout>
  );
}
