"use client";

import { useEffect, useMemo, useState } from "react";
import AdminLayout from "../../../components/AdminLayout";
import { supabase } from "@/lib/supabase";

interface AdminDashboardProps {
  params: { tenant: string };
}

type RecentBooking = {
  id: string;
  customerName: string;
  date: string;
  time: string;
  package: string;
  room: string;
  status: string;
  amount: number; // deposit or total depending on your reporting; using deposit here if available
};

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

const BookingRow = ({ booking }: { booking: RecentBooking }) => {
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
  const tenant = params.tenant;

  const [loading, setLoading] = useState(true);
  const [tenantId, setTenantId] = useState<string | null>(null);
  const [stats, setStats] = useState({
    todayBookings: 0,
    weekRevenue: 0,
    monthBookings: 0,
    activeRooms: 0,
    pendingPayments: 0,
    upcomingEvents: 0,
  });
  const [recentBookings, setRecentBookings] = useState<RecentBooking[]>([]);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        // resolve tenant id
        const { data: tenantRow } = await supabase
          .from("tenants")
          .select("id")
          .eq("slug", tenant)
          .eq("active", true)
          .single();
        if (!tenantRow?.id) {
          setLoading(false);
          return;
        }
        setTenantId(tenantRow.id);

        const now = new Date();
        const startOfToday = new Date(now);
        startOfToday.setHours(0, 0, 0, 0);
        const endOfToday = new Date(now);
        endOfToday.setHours(23, 59, 59, 999);

        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const startOfWeek = new Date(now);
        startOfWeek.setDate(now.getDate() - 7);

        // today bookings count
        const { data: todayBookings } = await supabase
          .from("bookings")
          .select("id", { count: "exact", head: true })
          .eq("tenant_id", tenantRow.id)
          .gte("start_time", startOfToday.toISOString())
          .lte("start_time", endOfToday.toISOString());

        // month bookings count
        const { data: monthBookings } = await supabase
          .from("bookings")
          .select("id", { count: "exact", head: true })
          .eq("tenant_id", tenantRow.id)
          .gte("start_time", startOfMonth.toISOString());

        // active rooms count
        const { data: activeRooms } = await supabase
          .from("rooms")
          .select("id", { count: "exact", head: true })
          .eq("tenant_id", tenantRow.id)
          .eq("active", true);

        // pending payments count (bookings pending)
        const { data: pendingBookings } = await supabase
          .from("bookings")
          .select("id", { count: "exact", head: true })
          .eq("tenant_id", tenantRow.id)
          .eq("status", "pending");

        // upcoming confirmed events next 7 days
        const { data: upcoming } = await supabase
          .from("bookings")
          .select("id", { count: "exact", head: true })
          .eq("tenant_id", tenantRow.id)
          .eq("status", "confirmed")
          .gte("start_time", now.toISOString())
          .lte("start_time", new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString());

        // week revenue = sum of payments in last 7 days with status succeeded and type deposit
        const { data: recentPayments } = await supabase
          .from("payments")
          .select("amount, status, type, created_at")
          .eq("tenant_id", tenantRow.id)
          .gte("created_at", startOfWeek.toISOString());
        const weekRevenue = (recentPayments || [])
          .filter((p: any) => (p.status === "succeeded" || p.status === "paid") && p.type === "deposit")
          .reduce((sum: number, p: any) => sum + Number(p.amount || 0), 0);

        setStats({
          todayBookings: (todayBookings as any)?.length ?? (todayBookings as any)?.count ?? 0,
          monthBookings: (monthBookings as any)?.length ?? (monthBookings as any)?.count ?? 0,
          activeRooms: (activeRooms as any)?.length ?? (activeRooms as any)?.count ?? 0,
          pendingPayments: (pendingBookings as any)?.length ?? (pendingBookings as any)?.count ?? 0,
          upcomingEvents: (upcoming as any)?.length ?? (upcoming as any)?.count ?? 0,
          weekRevenue,
        });

        // recent bookings list (latest 10)
        const { data: bookings } = await supabase
          .from("bookings")
          .select("id, customer_id, package_id, room_id, start_time, status, deposit_due")
          .eq("tenant_id", tenantRow.id)
          .order("start_time", { ascending: false })
          .limit(10);

        const customerIds = Array.from(new Set((bookings || []).map((b: any) => b.customer_id)));
        const packageIds = Array.from(new Set((bookings || []).map((b: any) => b.package_id)));
        const roomIds = Array.from(new Set((bookings || []).map((b: any) => b.room_id)));

        const [customersRes, packagesRes, roomsRes] = await Promise.all([
          customerIds.length
            ? supabase.from("customers").select("id,name").in("id", customerIds)
            : Promise.resolve({ data: [] as any[] }),
          packageIds.length
            ? supabase.from("packages").select("id,name").in("id", packageIds)
            : Promise.resolve({ data: [] as any[] }),
          roomIds.length
            ? supabase.from("rooms").select("id,name").in("id", roomIds)
            : Promise.resolve({ data: [] as any[] }),
        ]);

        const customersMap = new Map((customersRes.data || []).map((c: any) => [c.id, c.name]));
        const packagesMap = new Map((packagesRes.data || []).map((p: any) => [p.id, p.name]));
        const roomsMap = new Map((roomsRes.data || []).map((r: any) => [r.id, r.name]));

        const recent: RecentBooking[] = (bookings || []).map((b: any) => {
          const dt = new Date(b.start_time);
          return {
            id: b.id,
            customerName: customersMap.get(b.customer_id) || "Customer",
            date: dt.toISOString().split("T")[0],
            time: dt.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" }),
            package: packagesMap.get(b.package_id) || "Package",
            room: roomsMap.get(b.room_id) || "Room",
            status: b.status,
            amount: Number(b.deposit_due ?? 0),
          };
        });
        setRecentBookings(recent);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [tenant]);

  if (loading) {
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
    <AdminLayout tenant={tenant}>
      <div className="space-y-6">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Today's Bookings"
            value={stats.todayBookings}
            icon="📅"
            trend="+2 from yesterday"
            color="blue"
          />
          <StatCard
            title="This Week Revenue"
            value={`$${stats.weekRevenue.toLocaleString()}`}
            icon="💰"
            trend="+15% from last week"
            color="green"
          />
          <StatCard
            title="Monthly Bookings"
            value={stats.monthBookings}
            icon="📊"
            trend="+8% from last month"
            color="purple"
          />
          <StatCard
            title="Active Rooms"
            value={stats.activeRooms}
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
                {recentBookings.map((booking) => (
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
