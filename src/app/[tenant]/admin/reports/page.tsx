"use client";

import { useState, useEffect } from "react";
import AdminLayout from "../../../../components/AdminLayout";

interface ReportsProps {
  params: Promise<{ tenant: string }>;
}

// Mock analytics data
const mockAnalytics = {
  revenue: {
    current: 142850,
    previous: 128940,
    growth: 10.8,
    target: 150000,
    monthly: [
      { month: "Jan", amount: 12450 },
      { month: "Feb", amount: 13200 },
      { month: "Mar", amount: 14850 },
      { month: "Apr", amount: 13980 },
      { month: "May", amount: 15600 },
      { month: "Jun", amount: 16200 },
      { month: "Jul", amount: 17100 },
      { month: "Aug", amount: 15800 },
      { month: "Sep", amount: 16950 },
      { month: "Oct", amount: 6720 }, // Partial month
    ],
  },
  bookings: {
    total: 478,
    confirmed: 412,
    pending: 28,
    cancelled: 38,
    completed: 385,
    growth: 15.2,
    daily: [
      { date: "2025-09-25", bookings: 8 },
      { date: "2025-09-26", bookings: 12 },
      { date: "2025-09-27", bookings: 6 },
      { date: "2025-09-28", bookings: 15 },
      { date: "2025-09-29", bookings: 18 },
      { date: "2025-09-30", bookings: 9 },
      { date: "2025-10-01", bookings: 14 },
      { date: "2025-10-02", bookings: 11 },
    ],
  },
  customers: {
    total: 312,
    new: 45,
    returning: 267,
    vip: 28,
    retention: 85.6,
    acquisition: [
      { month: "Jul", new: 38, returning: 42 },
      { month: "Aug", new: 42, returning: 48 },
      { month: "Sep", new: 45, returning: 52 },
      { month: "Oct", new: 18, returning: 23 }, // Partial month
    ],
  },
  rooms: {
    utilization: [
      { room: "Party Room A", bookings: 125, revenue: 18750, utilization: 78 },
      { room: "Party Room B", bookings: 98, revenue: 16660, utilization: 65 },
      { room: "Sports Arena", bookings: 87, revenue: 19575, utilization: 58 },
      { room: "Craft Corner", bookings: 168, revenue: 11340, utilization: 89 },
    ],
  },
  packages: {
    performance: [
      {
        name: "Birthday Bash",
        bookings: 203,
        revenue: 60697,
        popularity: 92,
        avgPrice: 299,
      },
      {
        name: "Mini Party",
        bookings: 156,
        revenue: 31044,
        popularity: 85,
        avgPrice: 199,
      },
      {
        name: "Ultimate Celebration",
        bookings: 89,
        revenue: 40851,
        popularity: 78,
        avgPrice: 459,
      },
      {
        name: "Craft Party Special",
        bookings: 67,
        revenue: 16683,
        popularity: 71,
        avgPrice: 249,
      },
    ],
  },
  timeAnalysis: {
    busyHours: [
      { hour: "10:00", bookings: 45 },
      { hour: "11:00", bookings: 78 },
      { hour: "12:00", bookings: 92 },
      { hour: "13:00", bookings: 125 },
      { hour: "14:00", bookings: 156 },
      { hour: "15:00", bookings: 142 },
      { hour: "16:00", bookings: 98 },
      { hour: "17:00", bookings: 67 },
    ],
    seasonality: [
      { period: "Weekday Mornings", percentage: 15, trend: "stable" },
      { period: "Weekday Afternoons", percentage: 35, trend: "growing" },
      { period: "Weekend Mornings", percentage: 25, trend: "growing" },
      { period: "Weekend Afternoons", percentage: 45, trend: "peak" },
    ],
  },
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

const OverviewReport = () => (
  <div className="space-y-6">
    {/* Key Metrics */}
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <MetricCard
        title="Total Revenue"
        value={mockAnalytics.revenue.current}
        change={mockAnalytics.revenue.growth}
        format="currency"
        trend="up"
      />
      <MetricCard
        title="Total Bookings"
        value={mockAnalytics.bookings.total}
        change={mockAnalytics.bookings.growth}
        trend="up"
      />
      <MetricCard
        title="Total Customers"
        value={mockAnalytics.customers.total}
        change={14.2}
        trend="up"
      />
      <MetricCard
        title="Customer Retention"
        value={mockAnalytics.customers.retention}
        change={2.1}
        format="percentage"
        trend="up"
      />
    </div>

    {/* Charts */}
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <SimpleChart
        title="Monthly Revenue Trend"
        data={mockAnalytics.revenue.monthly.slice(-6)}
        xKey="month"
        yKey="amount"
        type="bar"
      />
      <SimpleChart
        title="Daily Bookings (Last 7 Days)"
        data={mockAnalytics.bookings.daily}
        xKey="date"
        yKey="bookings"
        type="line"
      />
    </div>

    {/* Performance Tables */}
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <TableReport
        title="Top Performing Packages"
        data={mockAnalytics.packages.performance}
        columns={[
          { key: "name", label: "Package" },
          { key: "bookings", label: "Bookings" },
          { key: "revenue", label: "Revenue", format: "currency" },
          { key: "popularity", label: "Score", format: "percentage" },
        ]}
      />
      <TableReport
        title="Room Utilization"
        data={mockAnalytics.rooms.utilization}
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

const RevenueReport = () => (
  <div className="space-y-6">
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <MetricCard
        title="Current Month Revenue"
        value={mockAnalytics.revenue.current}
        format="currency"
      />
      <MetricCard
        title="Revenue Growth"
        value={mockAnalytics.revenue.growth}
        format="percentage"
        trend="up"
      />
      <MetricCard
        title="Target Achievement"
        value={
          (mockAnalytics.revenue.current / mockAnalytics.revenue.target) * 100
        }
        format="percentage"
        trend="up"
      />
    </div>

    <SimpleChart
      title="Revenue by Month"
      data={mockAnalytics.revenue.monthly}
      xKey="month"
      yKey="amount"
      height={300}
    />

    <TableReport
      title="Revenue by Package"
      data={mockAnalytics.packages.performance}
      columns={[
        { key: "name", label: "Package" },
        { key: "bookings", label: "Bookings" },
        { key: "avgPrice", label: "Avg Price", format: "currency" },
        { key: "revenue", label: "Total Revenue", format: "currency" },
      ]}
    />
  </div>
);

const BookingsReport = () => (
  <div className="space-y-6">
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
      <MetricCard title="Total Bookings" value={mockAnalytics.bookings.total} />
      <MetricCard
        title="Confirmed"
        value={mockAnalytics.bookings.confirmed}
        trend="up"
      />
      <MetricCard
        title="Pending"
        value={mockAnalytics.bookings.pending}
        trend="neutral"
      />
      <MetricCard
        title="Cancelled"
        value={mockAnalytics.bookings.cancelled}
        trend="down"
      />
    </div>

    <SimpleChart
      title="Daily Booking Trend"
      data={mockAnalytics.bookings.daily}
      xKey="date"
      yKey="bookings"
      height={250}
    />

    <SimpleChart
      title="Peak Booking Hours"
      data={mockAnalytics.timeAnalysis.busyHours}
      xKey="hour"
      yKey="bookings"
      height={300}
    />
  </div>
);

const CustomersReport = () => (
  <div className="space-y-6">
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
      <MetricCard
        title="Total Customers"
        value={mockAnalytics.customers.total}
      />
      <MetricCard
        title="New Customers"
        value={mockAnalytics.customers.new}
        trend="up"
      />
      <MetricCard title="VIP Customers" value={mockAnalytics.customers.vip} />
      <MetricCard
        title="Retention Rate"
        value={mockAnalytics.customers.retention}
        format="percentage"
        trend="up"
      />
    </div>

    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <SimpleChart
        title="Customer Acquisition"
        data={mockAnalytics.customers.acquisition}
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
                (mockAnalytics.customers.returning /
                  mockAnalytics.customers.total) *
                  100
              )}
              %
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">VIP Conversion Rate</span>
            <span className="text-sm font-medium text-gray-900">
              {Math.round(
                (mockAnalytics.customers.vip / mockAnalytics.customers.total) *
                  100
              )}
              %
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">
              Average Bookings per Customer
            </span>
            <span className="text-sm font-medium text-gray-900">
              {(
                mockAnalytics.bookings.total / mockAnalytics.customers.total
              ).toFixed(1)}
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
);

export default function ReportsAnalytics({ params }: ReportsProps) {
  const [resolvedParams, setResolvedParams] = useState<{
    tenant: string;
  } | null>(null);
  const [activeReport, setActiveReport] = useState<ReportType>("overview");
  const [dateRange, setDateRange] = useState("last_30_days");

  useEffect(() => {
    params.then(setResolvedParams);
  }, [params]);

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

  if (!resolvedParams) {
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
        return <OverviewReport />;
      case "revenue":
        return <RevenueReport />;
      case "bookings":
        return <BookingsReport />;
      case "customers":
        return <CustomersReport />;
      case "rooms":
        return (
          <TableReport
            title="Room Performance Analysis"
            data={mockAnalytics.rooms.utilization}
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
            data={mockAnalytics.packages.performance}
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
        return <OverviewReport />;
    }
  };

  return (
    <AdminLayout tenant={resolvedParams.tenant}>
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
