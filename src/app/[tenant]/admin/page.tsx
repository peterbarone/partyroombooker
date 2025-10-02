"use client";

import { useState, useEffect } from "react";
import AdminLayout from "../../../components/AdminLayout";

interface AdminDashboardProps {
  params: Promise<{ tenant: string }>;
}

// Mock data - in production this would come from your database
const mockStats = {
  todayBookings: 5,
  weekRevenue: 2450,
  monthBookings: 23,
  activeRooms: 4,
  pendingPayments: 3,
  upcomingEvents: 8,
};

const mockRecentBookings = [
  {
    id: "BK001",
    customerName: "Sarah Johnson",
    date: "2025-10-03",
    time: "2:00 PM",
    package: "Birthday Bash",
    room: "Party Room A",
    status: "confirmed",
    amount: 299,
  },
  {
    id: "BK002",
    customerName: "Mike Chen",
    date: "2025-10-03",
    time: "4:30 PM",
    package: "Ultimate Celebration",
    room: "Sports Arena",
    status: "pending_payment",
    amount: 459,
  },
  {
    id: "BK003",
    customerName: "Lisa Rodriguez",
    date: "2025-10-04",
    time: "11:00 AM",
    package: "Mini Party",
    room: "Craft Corner",
    status: "confirmed",
    amount: 199,
  },
];

const StatCard = ({
  title,
  value,
  icon,
  trend,
  color = "blue",
}: {
  title: string;
  value: string | number;
  icon: string;
  trend?: string;
  color?: string;
}) => {
  const colorClasses = {
    blue: "bg-blue-50 text-blue-600 border-blue-200",
    green: "bg-green-50 text-green-600 border-green-200",
    purple: "bg-purple-50 text-purple-600 border-purple-200",
    orange: "bg-orange-50 text-orange-600 border-orange-200",
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-600 text-sm font-medium">{title}</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">{value}</p>
          {trend && <p className="text-green-600 text-sm mt-1">↗ {trend}</p>}
        </div>
        <div
          className={`w-12 h-12 rounded-full flex items-center justify-center ${
            colorClasses[color as keyof typeof colorClasses]
          }`}
        >
          <span className="text-xl">{icon}</span>
        </div>
      </div>
    </div>
  );
};

const BookingRow = ({
  booking,
}: {
  booking: (typeof mockRecentBookings)[0];
}) => {
  const statusColors = {
    confirmed: "bg-green-100 text-green-800",
    pending_payment: "bg-yellow-100 text-yellow-800",
    cancelled: "bg-red-100 text-red-800",
  };

  return (
    <tr className="hover:bg-gray-50">
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm font-medium text-gray-900">{booking.id}</div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm text-gray-900">{booking.customerName}</div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm text-gray-900">{booking.date}</div>
        <div className="text-sm text-gray-500">{booking.time}</div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm text-gray-900">{booking.package}</div>
        <div className="text-sm text-gray-500">{booking.room}</div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <span
          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
            statusColors[booking.status as keyof typeof statusColors]
          }`}
        >
          {booking.status.replace("_", " ")}
        </span>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
        ${booking.amount}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
        <button className="text-blue-600 hover:text-blue-900">Edit</button>
      </td>
    </tr>
  );
};

export default function AdminDashboard({ params }: AdminDashboardProps) {
  const [resolvedParams, setResolvedParams] = useState<{
    tenant: string;
  } | null>(null);

  useEffect(() => {
    params.then(setResolvedParams);
  }, [params]);

  if (!resolvedParams) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <AdminLayout tenant={resolvedParams.tenant}>
      <div className="space-y-6">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Today's Bookings"
            value={mockStats.todayBookings}
            icon="📅"
            trend="+2 from yesterday"
            color="blue"
          />
          <StatCard
            title="This Week Revenue"
            value={`$${mockStats.weekRevenue.toLocaleString()}`}
            icon="💰"
            trend="+15% from last week"
            color="green"
          />
          <StatCard
            title="Monthly Bookings"
            value={mockStats.monthBookings}
            icon="📊"
            trend="+8% from last month"
            color="purple"
          />
          <StatCard
            title="Active Rooms"
            value={mockStats.activeRooms}
            icon="🏢"
            color="orange"
          />
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Quick Actions
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
              <span className="text-2xl">➕</span>
              <div className="text-left">
                <div className="font-medium">New Booking</div>
                <div className="text-gray-500 text-sm">
                  Create manual booking
                </div>
              </div>
            </button>
            <button className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
              <span className="text-2xl">👥</span>
              <div className="text-left">
                <div className="font-medium">Add Customer</div>
                <div className="text-gray-500 text-sm">
                  New customer profile
                </div>
              </div>
            </button>
            <button className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
              <span className="text-2xl">📧</span>
              <div className="text-left">
                <div className="font-medium">Send Update</div>
                <div className="text-gray-500 text-sm">Email customers</div>
              </div>
            </button>
          </div>
        </div>

        {/* Recent Bookings */}
        <div className="bg-white rounded-lg border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">
                Recent Bookings
              </h2>
              <button className="text-blue-600 hover:text-blue-900 text-sm font-medium">
                View All
              </button>
            </div>
          </div>
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
                    Amount
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {mockRecentBookings.map((booking) => (
                  <BookingRow key={booking.id} booking={booking} />
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Alerts & Notifications */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Pending Actions
            </h2>
            <div className="space-y-3">
              <div className="flex items-center space-x-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <span className="text-yellow-600">⚠️</span>
                <div className="flex-1">
                  <div className="text-sm font-medium">3 payments pending</div>
                  <div className="text-xs text-gray-600">
                    Requires follow-up
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <span className="text-blue-600">📋</span>
                <div className="flex-1">
                  <div className="text-sm font-medium">
                    2 waivers incomplete
                  </div>
                  <div className="text-xs text-gray-600">Send reminders</div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Upcoming Events
            </h2>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium">
                    Birthday Party - Sarah J.
                  </div>
                  <div className="text-xs text-gray-600">
                    Tomorrow at 2:00 PM
                  </div>
                </div>
                <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                  Confirmed
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium">
                    Corporate Event - Tech Co.
                  </div>
                  <div className="text-xs text-gray-600">Oct 5 at 6:00 PM</div>
                </div>
                <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">
                  Setup Required
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
