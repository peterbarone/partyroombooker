"use client";

import { useEffect, useMemo, useState } from "react";
import AdminLayout from "../../../../components/AdminLayout";
import { supabase } from "@/lib/supabase";

interface PaymentsPageProps {
  params: { tenant: string };
}

type PaymentStatus = "pending" | "completed" | "failed" | "refunded" | "all";
type PaymentType = "deposit" | "balance" | "refund" | "all";

type UIPayment = {
  id: string;
  createdAt: string;
  type: string;
  status: string;
  amount: number;
  bookingId?: string;
  customerName?: string;
  packageName?: string;
};

const StatusBadge = ({ status }: { status: string }) => {
  const map: Record<string, { color: string; label: string }> = {
    completed: { color: "bg-green-100 text-green-800", label: "Completed" },
    pending: { color: "bg-yellow-100 text-yellow-800", label: "Pending" },
    failed: { color: "bg-red-100 text-red-800", label: "Failed" },
    refunded: { color: "bg-gray-100 text-gray-800", label: "Refunded" },
  };
  const cfg = map[status] || { color: "bg-gray-100 text-gray-800", label: status };
  return (
    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${cfg.color}`}>
      {cfg.label}
    </span>
  );
};

export default function PaymentsPage({ params }: PaymentsPageProps) {
  const tenant = params.tenant;

  const [loading, setLoading] = useState(true);
  const [payments, setPayments] = useState<UIPayment[]>([]);

  // Filters
  const [status, setStatus] = useState<PaymentStatus>("all");
  const [ptype, setPtype] = useState<PaymentType>("all");
  const [search, setSearch] = useState("");
  const [range, setRange] = useState("last_30_days");

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const { data: tenantRow, error: tErr } = await supabase
          .from("tenants")
          .select("id")
          .eq("slug", tenant)
          .eq("active", true)
          .single();
        if (tErr || !tenantRow?.id) {
          setPayments([]);
          return;
        }

        // Date range
        const now = new Date();
        let start = new Date(now);
        if (range === "last_7_days") start.setDate(now.getDate() - 6);
        else if (range === "last_30_days") start.setDate(now.getDate() - 29);
        else if (range === "last_90_days") start.setDate(now.getDate() - 89);
        else if (range === "this_year") start = new Date(now.getFullYear(), 0, 1);
        else start.setDate(now.getDate() - 29);

        let query = supabase
          .from("payments")
          .select("id, booking_id, type, amount, status, created_at")
          .eq("tenant_id", tenantRow.id)
          .gte("created_at", start.toISOString())
          .lte("created_at", now.toISOString())
          .order("created_at", { ascending: false });

        // We'll filter type/status client-side for simplicity and speed of iteration
        const { data: payRows } = await query;
        const rows = payRows || [];

        const bookingIds = Array.from(new Set(rows.map((p: any) => p.booking_id).filter(Boolean)));

        // Hydrate names
        const [bookingsRes] = await Promise.all([
          bookingIds.length
            ? supabase
                .from("bookings")
                .select("id, customer_id, package_id")
                .in("id", bookingIds)
            : Promise.resolve({ data: [] as any[] }),
        ]);
        const bookings = bookingsRes.data || [];
        const customerIds = Array.from(new Set(bookings.map((b: any) => b.customer_id).filter(Boolean)));
        const packageIds = Array.from(new Set(bookings.map((b: any) => b.package_id).filter(Boolean)));

        const [customersRes, packagesRes] = await Promise.all([
          customerIds.length
            ? supabase.from("customers").select("id,name").in("id", customerIds)
            : Promise.resolve({ data: [] as any[] }),
          packageIds.length
            ? supabase.from("packages").select("id,name").in("id", packageIds)
            : Promise.resolve({ data: [] as any[] }),
        ]);
        const bookingMap = new Map(bookings.map((b: any) => [b.id, b]));
        const customerMap = new Map((customersRes.data || []).map((c: any) => [c.id, c.name]));
        const packageMap = new Map((packagesRes.data || []).map((p: any) => [p.id, p.name]));

        const ui: UIPayment[] = rows.map((p: any) => {
          const b = p.booking_id ? bookingMap.get(p.booking_id) : undefined;
          const customerName = b ? customerMap.get(b.customer_id) : undefined;
          const packageName = b ? packageMap.get(b.package_id) : undefined;
          return {
            id: p.id,
            createdAt: new Date(p.created_at).toLocaleString(),
            type: p.type,
            status: p.status,
            amount: Number(p.amount || 0),
            bookingId: p.booking_id || undefined,
            customerName,
            packageName,
          };
        });

        setPayments(ui);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [tenant, range]);

  const filtered = useMemo(() => {
    return payments.filter((p) => {
      if (status !== "all" && p.status !== status) return false;
      if (ptype !== "all" && p.type !== ptype) return false;
      if (search) {
        const s = search.toLowerCase();
        const hay = `${p.id} ${p.bookingId || ""} ${p.customerName || ""} ${p.packageName || ""}`.toLowerCase();
        if (!hay.includes(s)) return false;
      }
      return true;
    });
  }, [payments, status, ptype, search]);

  const totals = useMemo(() => {
    const total = filtered.reduce((s, p) => s + p.amount, 0);
    const completed = filtered.filter((p) => p.status === "completed").reduce((s, p) => s + p.amount, 0);
    const refunds = filtered.filter((p) => p.type === "refund").reduce((s, p) => s + p.amount, 0);
    return { total, completed, refunds };
  }, [filtered]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading payments...</p>
        </div>
      </div>
    );
  }

  return (
    <AdminLayout tenant={tenant}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Payments</h1>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div>
              <label className="block text-sm text-gray-600 mb-1">Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as PaymentStatus)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              >
                <option value="all">All</option>
                <option value="completed">Completed</option>
                <option value="pending">Pending</option>
                <option value="failed">Failed</option>
                <option value="refunded">Refunded</option>
              </select>
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Type</label>
              <select
                value={ptype}
                onChange={(e) => setPtype(e.target.value as PaymentType)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              >
                <option value="all">All</option>
                <option value="deposit">Deposit</option>
                <option value="balance">Balance</option>
                <option value="refund">Refund</option>
              </select>
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Date Range</label>
              <select
                value={range}
                onChange={(e) => setRange(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              >
                <option value="last_7_days">Last 7 Days</option>
                <option value="last_30_days">Last 30 Days</option>
                <option value="last_90_days">Last 90 Days</option>
                <option value="this_year">This Year</option>
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm text-gray-600 mb-1">Search</label>
              <input
                type="text"
                placeholder="Search by payment ID, booking ID, customer, or package..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="text-sm text-gray-600">Total Amount</div>
            <div className="text-2xl font-bold text-gray-900">${totals.total.toLocaleString()}</div>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="text-sm text-gray-600">Completed Amount</div>
            <div className="text-2xl font-bold text-green-600">${totals.completed.toLocaleString()}</div>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="text-sm text-gray-600">Refunds</div>
            <div className="text-2xl font-bold text-gray-900">${totals.refunds.toLocaleString()}</div>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Booking</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Package</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filtered.map((p) => (
                  <tr key={p.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{p.createdAt}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 capitalize">{p.type}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <StatusBadge status={p.status} />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-900">${p.amount.toLocaleString()}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{p.bookingId || ""}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{p.customerName || ""}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{p.packageName || ""}</td>
                  </tr>) )}
              </tbody>
            </table>
          </div>
          {filtered.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500">No payments found for the selected filters.</p>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
