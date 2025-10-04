"use client";

import { useState, useEffect } from "react";
import AdminLayout from "../../../../components/AdminLayout";
import { supabase } from "@/lib/supabase";

interface ReportsProps {
  params: { tenant: string };
}

type Analytics = {
  revenue: {
    current: number;
    previous: number;
    growth: number;
    target: number;
    monthly: { month: string; amount: number }[];
  };
  bookings: {
    total: number;
    confirmed: number;
    pending: number;
    cancelled: number;
    completed: number;
    growth: number;
    daily: { date: string; bookings: number }[];
  };
  customers: {
    total: number;
    new: number;
    returning: number;
    vip: number;
    retention: number;
    acquisition: { month: string; new: number; returning: number }[];
  };
  rooms: {
    utilization: { room: string; bookings: number; revenue: number; utilization: number }[];
  };
  packages: {
    performance: { name: string; bookings: number; revenue: number; popularity: number; avgPrice: number }[];
  };
  timeAnalysis: {
    busyHours: { hour: string; bookings: number }[];
    seasonality: { period: string; percentage: number; trend: string }[];
  };
};

type ReportType =
  | "overview"
  | "revenue"
  | "bookings"
  | "customers"
  | "rooms"
  | "packages";

const MetricCard = ({
  title,
  value,
  change,
  format = "number",
  trend = "neutral",
}: {
  title: string;
  value: number;
  change?: number;
  format?: "number" | "currency" | "percentage";
  trend?: "up" | "down" | "neutral";
}) => {
  const formatValue = (val: number) => {
    switch (format) {
      case "currency":
        return `$${val.toLocaleString()}`;
      case "percentage":
        return `${val}%`;
      default:
        return val.toLocaleString();
    }
  };

  const getTrendColor = () => {
    if (trend === "up") return "text-green-600";
    if (trend === "down") return "text-red-600";
    return "text-gray-600";
  };

  const getTrendIcon = () => {
    if (trend === "up") return "↗️";
    if (trend === "down") return "↘️";
    return "➡️";
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <h3 className="text-sm font-medium text-gray-700 mb-2">{title}</h3>
      <div className="flex items-baseline justify-between">
        <div className="text-2xl font-bold text-gray-900">
          {formatValue(value)}
        </div>
        {change !== undefined && (
          <div className={`flex items-center text-sm ${getTrendColor()}`}>
            <span className="mr-1">{getTrendIcon()}</span>
            {Math.abs(change)}%
          </div>
        )}
      </div>
    </div>
  );
};

const SimpleChart = ({
  data,
  title,
  type = "bar",
  xKey,
  yKey,
  height = 200,
}: {
  data: any[];
  title: string;
  type?: "bar" | "line";
  xKey: string;
  yKey: string;
  height?: number;
}) => {
  const maxValue = Math.max(...data.map((item) => item[yKey]));

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
      <div className="space-y-3" style={{ height: `${height}px` }}>
        {data.map((item, index) => (
          <div key={index} className="flex items-center space-x-3">
            <div className="w-16 text-sm text-gray-600 text-right">
              {item[xKey]}
            </div>
            <div className="flex-1 bg-gray-200 rounded-full h-6 relative">
              <div
                className="bg-blue-500 h-6 rounded-full flex items-center justify-end pr-2"
                style={{ width: `${(item[yKey] / maxValue) * 100}%` }}
              >
                <span className="text-white text-xs font-medium">
                  {typeof item[yKey] === "number"
                    ? item[yKey].toLocaleString()
                    : item[yKey]}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const TableReport = ({
  title,
  data,
  columns,
}: {
  title: string;
  data: any[];
  columns: { key: string; label: string; format?: string }[];
}) => {
  const formatCell = (value: any, format?: string) => {
    if (format === "currency") return `$${value.toLocaleString()}`;
    if (format === "percentage") return `${value}%`;
    return value;
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {columns.map((column) => (
                <th
                  key={column.key}
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  {column.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {data.map((row, index) => (
              <tr key={index}>
                {columns.map((column) => (
                  <td
                    key={column.key}
                    className="px-6 py-4 whitespace-nowrap text-sm text-gray-900"
                  >
                    {formatCell(row[column.key], column.format)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const OverviewReport = ({ analytics }: { analytics: Analytics }) => (
  <div className="space-y-6">
    {/* Key Metrics */}
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <MetricCard
        title="Total Revenue"
        value={analytics.revenue.current}
        change={analytics.revenue.growth}
        format="currency"
        trend="up"
      />
      <MetricCard
        title="Total Bookings"
        value={analytics.bookings.total}
        change={analytics.bookings.growth}
        trend="up"
      />
      <MetricCard
        title="Total Customers"
        value={analytics.customers.total}
        change={14.2}
        trend="up"
      />
      <MetricCard
        title="Customer Retention"
        value={analytics.customers.retention}
        change={2.1}
        format="percentage"
        trend="up"
      />
    </div>

    {/* Charts */}
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <SimpleChart
        title="Monthly Revenue Trend"
        data={analytics.revenue.monthly.slice(-6)}
        xKey="month"
        yKey="amount"
        type="bar"
      />
      <SimpleChart
        title="Daily Bookings (Last 7 Days)"
        data={analytics.bookings.daily}
        xKey="date"
        yKey="bookings"
        type="line"
      />
    </div>

    {/* Performance Tables */}
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <TableReport
        title="Top Performing Packages"
        data={analytics.packages.performance}
        columns={[
          { key: "name", label: "Package" },
          { key: "bookings", label: "Bookings" },
          { key: "revenue", label: "Revenue", format: "currency" },
          { key: "popularity", label: "Score", format: "percentage" },
        ]}
      />
      <TableReport
        title="Room Utilization"
        data={analytics.rooms.utilization}
        columns={[
          { key: "room", label: "Room" },
          { key: "bookings", label: "Bookings" },
          { key: "revenue", label: "Revenue", format: "currency" },
          { key: "utilization", label: "Utilization", format: "percentage" },
        ]}
      />
    </div>
  </div>
);

const RevenueReport = ({ analytics }: { analytics: Analytics }) => (
  <div className="space-y-6">
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <MetricCard
        title="Current Month Revenue"
        value={analytics.revenue.current}
        format="currency"
      />
      <MetricCard
        title="Revenue Growth"
        value={analytics.revenue.growth}
        format="percentage"
        trend="up"
      />
      <MetricCard
        title="Target Achievement"
        value={
          (analytics.revenue.current / analytics.revenue.target) * 100
        }
        format="percentage"
        trend="up"
      />
    </div>

    <SimpleChart
      title="Revenue by Month"
      data={analytics.revenue.monthly}
      xKey="month"
      yKey="amount"
      height={300}
    />

    <TableReport
      title="Revenue by Package"
      data={analytics.packages.performance}
      columns={[
        { key: "name", label: "Package" },
        { key: "bookings", label: "Bookings" },
        { key: "avgPrice", label: "Avg Price", format: "currency" },
        { key: "revenue", label: "Total Revenue", format: "currency" },
      ]}
    />
  </div>
);

const BookingsReport = ({ analytics }: { analytics: Analytics }) => (
  <div className="space-y-6">
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
      <MetricCard title="Total Bookings" value={analytics.bookings.total} />
      <MetricCard
        title="Confirmed"
        value={analytics.bookings.confirmed}
        trend="up"
      />
      <MetricCard
        title="Pending"
        value={analytics.bookings.pending}
        trend="neutral"
      />
      <MetricCard
        title="Cancelled"
        value={analytics.bookings.cancelled}
        trend="down"
      />
    </div>

    <SimpleChart
      title="Daily Booking Trend"
      data={analytics.bookings.daily}
      xKey="date"
      yKey="bookings"
      height={250}
    />

    <SimpleChart
      title="Peak Booking Hours"
      data={analytics.timeAnalysis.busyHours}
      xKey="hour"
      yKey="bookings"
      height={300}
    />
  </div>
);

const CustomersReport = ({ analytics }: { analytics: Analytics }) => (
  <div className="space-y-6">
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
      <MetricCard
        title="Total Customers"
        value={analytics.customers.total}
      />
      <MetricCard
        title="New Customers"
        value={analytics.customers.new}
        trend="up"
      />
      <MetricCard title="VIP Customers" value={analytics.customers.vip} />
      <MetricCard
        title="Retention Rate"
        value={analytics.customers.retention}
        format="percentage"
        trend="up"
      />
    </div>

    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <SimpleChart
        title="Customer Acquisition"
        data={analytics.customers.acquisition}
        xKey="month"
        yKey="new"
        height={250}
      />
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Customer Insights
        </h3>
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Repeat Customers</span>
            <span className="text-sm font-medium text-gray-900">
              {Math.round(
                (analytics.customers.returning / analytics.customers.total) *
                  100
              )}
              %
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">VIP Conversion Rate</span>
            <span className="text-sm font-medium text-gray-900">
              {Math.round(
                (analytics.customers.vip / analytics.customers.total) * 100
              )}
              %
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">
              Average Bookings per Customer
            </span>
            <span className="text-sm font-medium text-gray-900">
              {(analytics.bookings.total / analytics.customers.total).toFixed(1)}
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
);

export default function ReportsAnalytics({ params }: ReportsProps) {
  const tenant = params.tenant;
  const [activeReport, setActiveReport] = useState<ReportType>("overview");
  const [dateRange, setDateRange] = useState("last_30_days");
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState<Analytics>({
    revenue: { current: 0, previous: 0, growth: 0, target: 150000, monthly: [] },
    bookings: { total: 0, confirmed: 0, pending: 0, cancelled: 0, completed: 0, growth: 0, daily: [] },
    customers: { total: 0, new: 0, returning: 0, vip: 0, retention: 0, acquisition: [] },
    rooms: { utilization: [] },
    packages: { performance: [] },
    timeAnalysis: { busyHours: [], seasonality: [] },
  });

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
          setAnalytics((a) => ({ ...a }));
          return;
        }

        // Compute date range
        const now = new Date();
        let start = new Date(now);
        if (dateRange === "last_7_days") start.setDate(now.getDate() - 6);
        else if (dateRange === "last_30_days") start.setDate(now.getDate() - 29);
        else if (dateRange === "last_90_days") start.setDate(now.getDate() - 89);
        else if (dateRange === "this_year") start = new Date(now.getFullYear(), 0, 1);
        else start.setDate(now.getDate() - 29);
        const end = now;

        // Fetch core data in parallel
        const [paymentsRes, bookingsRes, customersRes, roomsRes, packagesRes] = await Promise.all([
          supabase
            .from("payments")
            .select("id,booking_id,amount,status,created_at,tenant_id")
            .eq("tenant_id", tenantRow.id)
            .gte("created_at", start.toISOString())
            .lte("created_at", end.toISOString()),
          supabase
            .from("bookings")
            .select("id,status,start_time,room_id,package_id,customer_id,tenant_id")
            .eq("tenant_id", tenantRow.id)
            .gte("start_time", start.toISOString())
            .lte("start_time", end.toISOString()),
          supabase
            .from("customers")
            .select("id,created_at")
            .eq("tenant_id", tenantRow.id),
          supabase
            .from("rooms")
            .select("id,name")
            .eq("tenant_id", tenantRow.id),
          supabase
            .from("packages")
            .select("id,name,base_price")
            .eq("tenant_id", tenantRow.id),
        ]);

        const payments = (paymentsRes.data || []).filter((p: any) => p.status === "completed");
        const bookings = bookingsRes.data || [];
        const customers = customersRes.data || [];
        const roomMap = new Map((roomsRes.data || []).map((r: any) => [r.id, r.name]));
        const packageMap = new Map((packagesRes.data || []).map((p: any) => [p.id, { name: p.name, base_price: p.base_price }]));

        // Revenue current & previous period
        const currentRevenue = payments.reduce((s: number, p: any) => s + Number(p.amount || 0), 0);
        const periodDays = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
        const prevStart = new Date(start);
        prevStart.setDate(start.getDate() - periodDays);
        const prevEnd = new Date(start);
        const { data: prevPaymentsData } = await supabase
          .from("payments")
          .select("amount,status,created_at,tenant_id")
          .eq("tenant_id", tenantRow.id)
          .gte("created_at", prevStart.toISOString())
          .lte("created_at", prevEnd.toISOString());
        const previousRevenue = (prevPaymentsData || [])
          .filter((p: any) => p.status === "completed")
          .reduce((s: number, p: any) => s + Number(p.amount || 0), 0);
        const revenueGrowth = previousRevenue === 0 ? 100 : ((currentRevenue - previousRevenue) / previousRevenue) * 100;

        // Monthly revenue (last 6 months incl current)
        const monthly: { month: string; amount: number }[] = [];
        for (let i = 5; i >= 0; i--) {
          const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
          const mStart = new Date(d.getFullYear(), d.getMonth(), 1);
          const mEnd = new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59);
          const { data } = await supabase
            .from("payments")
            .select("amount,status,created_at,tenant_id")
            .eq("tenant_id", tenantRow.id)
            .gte("created_at", mStart.toISOString())
            .lte("created_at", mEnd.toISOString());
          const amt = (data || [])
            .filter((p: any) => p.status === "completed")
            .reduce((s: number, p: any) => s + Number(p.amount || 0), 0);
          monthly.push({ month: mStart.toLocaleString("en-US", { month: "short" }), amount: amt });
        }

        // Booking stats
        const total = bookings.length;
        const byStatus = bookings.reduce((acc: Record<string, number>, b: any) => {
          acc[b.status] = (acc[b.status] || 0) + 1;
          return acc;
        }, {} as Record<string, number>);
        const confirmed = byStatus["confirmed"] || 0;
        const pending = (byStatus["pending"] || 0) + (byStatus["pending_payment"] || 0);
        const cancelled = byStatus["cancelled"] || 0;
        const completed = byStatus["completed"] || 0;

        // Daily booking trend (up to last 8 days of range)
        const daily: { date: string; bookings: number }[] = [];
        const days = Math.min(8, periodDays);
        for (let i = days - 1; i >= 0; i--) {
          const d = new Date(end);
          d.setDate(end.getDate() - i);
          const ds = d.toISOString().split("T")[0];
          const count = bookings.filter((b: any) => new Date(b.start_time).toISOString().split("T")[0] === ds).length;
          daily.push({ date: ds, bookings: count });
        }

        // Customers
        const totalCustomers = customers.length;
        const newCustomers = customers.filter((c: any) => c.created_at && new Date(c.created_at) >= start && new Date(c.created_at) <= end).length;
        const returning = Math.max(0, totalCustomers - newCustomers);
        const retention = totalCustomers ? Math.round((returning / totalCustomers) * 1000) / 10 : 0;
        // Acquisition last 4 months (unique customers per month via bookings)
        const acquisition: { month: string; new: number; returning: number }[] = [];
        for (let i = 3; i >= 0; i--) {
          const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
          const mStart = new Date(d.getFullYear(), d.getMonth(), 1);
          const mEnd = new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59);
          const { data: mBookings } = await supabase
            .from("bookings")
            .select("customer_id,start_time,tenant_id")
            .eq("tenant_id", tenantRow.id)
            .gte("start_time", mStart.toISOString())
            .lte("start_time", mEnd.toISOString());
          const unique = new Set((mBookings || []).map((b: any) => b.customer_id));
          acquisition.push({ month: mStart.toLocaleString("en-US", { month: "short" }), new: unique.size, returning: Math.max(0, unique.size - 1) });
        }

        // Room utilization and revenue by room
        const bookingsByRoom = new Map<string, any[]>();
        bookings.forEach((b: any) => {
          const arr = bookingsByRoom.get(b.room_id) || [];
          arr.push(b);
          bookingsByRoom.set(b.room_id, arr);
        });
        const revenueByBookingId = payments.reduce((acc: Map<string, number>, p: any) => {
          const curr = acc.get(p.booking_id) || 0;
          acc.set(p.booking_id, curr + Number(p.amount || 0));
          return acc;
        }, new Map<string, number>());
        const roomUtilization = Array.from(bookingsByRoom.entries()).map(([roomId, list]) => {
          const bookingsCount = list.length;
          const revenue = list.reduce((s: number, b: any) => s + (revenueByBookingId.get(b.id) || 0), 0);
          return {
            room: roomMap.get(roomId) || "Room",
            bookings: bookingsCount,
            revenue,
            utilization: Math.min(100, Math.round((bookingsCount / Math.max(1, total)) * 100)),
          };
        });

        // Package performance
        const bookingsByPackage = new Map<string, any[]>();
        bookings.forEach((b: any) => {
          const arr = bookingsByPackage.get(b.package_id) || [];
          arr.push(b);
          bookingsByPackage.set(b.package_id, arr);
        });
        const packagePerformance = Array.from(bookingsByPackage.entries()).map(([pkgId, list]) => {
          const revenue = list.reduce((s: number, b: any) => s + (revenueByBookingId.get(b.id) || 0), 0);
          const base = packageMap.get(pkgId)?.base_price || 0;
          const avgPrice = list.length ? Math.round((revenue || base * list.length) / list.length) : base;
          return {
            name: packageMap.get(pkgId)?.name || "Package",
            bookings: list.length,
            revenue,
            popularity: Math.min(100, Math.round((list.length / Math.max(1, total)) * 100)),
            avgPrice,
          };
        });

        // Busy hours
        const busyMap = new Map<string, number>();
        bookings.forEach((b: any) => {
          const dt = new Date(b.start_time);
          const h = `${String(dt.getHours()).padStart(2, "0")}:00`;
          busyMap.set(h, (busyMap.get(h) || 0) + 1);
        });
        const busyHours = Array.from(busyMap.entries())
          .sort((a, b) => (a[0] < b[0] ? -1 : 1))
          .map(([hour, count]) => ({ hour, bookings: count }));

        setAnalytics({
          revenue: {
            current: currentRevenue,
            previous: previousRevenue,
            growth: Math.round(revenueGrowth * 10) / 10,
            target: 150000,
            monthly,
          },
          bookings: {
            total,
            confirmed,
            pending,
            cancelled,
            completed,
            growth: 0,
            daily,
          },
          customers: {
            total: totalCustomers,
            new: newCustomers,
            returning,
            vip: 0,
            retention,
            acquisition,
          },
          rooms: { utilization: roomUtilization },
          packages: { performance: packagePerformance },
          timeAnalysis: {
            busyHours,
            seasonality: [],
          },
        });
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [tenant, dateRange]);

  const reportTypes = [
    { id: "overview", label: "Overview", icon: "📊" },
    { id: "revenue", label: "Revenue", icon: "💰" },
    { id: "bookings", label: "Bookings", icon: "📅" },
    { id: "customers", label: "Customers", icon: "👥" },
    { id: "rooms", label: "Rooms", icon: "🏠" },
    { id: "packages", label: "Packages", icon: "📦" },
  ];

  const handleExport = () => {
    // Export functionality would be implemented here
    console.log("Exporting report:", activeReport);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading analytics...</p>
        </div>
      </div>
    );
  }

  const renderReport = () => {
    switch (activeReport) {
      case "overview":
        return <OverviewReport analytics={analytics} />;
      case "revenue":
        return <RevenueReport analytics={analytics} />;
      case "bookings":
        return <BookingsReport analytics={analytics} />;
      case "customers":
        return <CustomersReport analytics={analytics} />;
      case "rooms":
        return (
          <TableReport
            title="Room Performance Analysis"
            data={analytics.rooms.utilization}
            columns={[
              { key: "room", label: "Room Name" },
              { key: "bookings", label: "Total Bookings" },
              {
                key: "revenue",
                label: "Revenue Generated",
                format: "currency",
              },
              {
                key: "utilization",
                label: "Utilization Rate",
                format: "percentage",
              },
            ]}
          />
        );
      case "packages":
        return (
          <TableReport
            title="Package Performance Analysis"
            data={analytics.packages.performance}
            columns={[
              { key: "name", label: "Package Name" },
              { key: "bookings", label: "Total Bookings" },
              { key: "avgPrice", label: "Average Price", format: "currency" },
              { key: "revenue", label: "Total Revenue", format: "currency" },
              {
                key: "popularity",
                label: "Popularity Score",
                format: "percentage",
              },
            ]}
          />
        );
      default:
        return <OverviewReport analytics={analytics} />;
    }
  };

  return (
    <AdminLayout tenant={tenant}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">
            Reports & Analytics
          </h1>
          <div className="flex space-x-3">
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="last_7_days">Last 7 Days</option>
              <option value="last_30_days">Last 30 Days</option>
              <option value="last_90_days">Last 90 Days</option>
              <option value="this_year">This Year</option>
              <option value="custom">Custom Range</option>
            </select>
            <button
              onClick={handleExport}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
            >
              📊 Export Report
            </button>
          </div>
        </div>

        {/* Report Type Tabs */}
        <div className="bg-white rounded-lg border border-gray-200 p-1">
          <div className="flex space-x-1">
            {reportTypes.map((type) => (
              <button
                key={type.id}
                onClick={() => setActiveReport(type.id as ReportType)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeReport === type.id
                    ? "bg-blue-600 text-white"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                }`}
              >
                <span>{type.icon}</span>
                <span>{type.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Report Content */}
        <div className="min-h-[600px]">{renderReport()}</div>

        {/* Quick Insights */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            📈 Quick Insights
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="text-sm font-medium text-blue-800">
                Peak Performance
              </div>
              <div className="text-xs text-blue-600 mt-1">
                Weekend afternoons show 45% higher booking rates
              </div>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <div className="text-sm font-medium text-green-800">
                Revenue Growth
              </div>
              <div className="text-xs text-green-600 mt-1">
                10.8% increase in monthly revenue vs last period
              </div>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg">
              <div className="text-sm font-medium text-purple-800">
                Customer Loyalty
              </div>
              <div className="text-xs text-purple-600 mt-1">
                85.6% customer retention rate - above industry average
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
