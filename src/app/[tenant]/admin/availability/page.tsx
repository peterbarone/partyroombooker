"use client";

import { useEffect, useMemo, useState } from "react";
import AdminLayout from "../../../../components/AdminLayout";
import { supabase } from "@/lib/supabase";

interface AvailabilityPageProps {
  params: { tenant: string };
}

type TemplateRow = {
  id: string;
  day_of_week: number | null;
  start_times_json: any;
  open_time: string | null; // HH:MM:SS
  close_time: string | null; // HH:MM:SS
  active: boolean;
};

const dayNames = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

function parseTimesInput(input: string): string[] {
  return input
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)
    .map((s) => (s.length === 5 ? `${s}:00` : s));
}

function toTimesInput(arr: any): string {
  try {
    const a: string[] = Array.isArray(arr) ? arr : [];
    return a.map((t) => (t?.length >= 5 ? t.slice(0, 5) : t)).join(", ");
  } catch {
    return "";
  }
}

export default function AvailabilityPage({ params }: AvailabilityPageProps) {
  const tenant = params.tenant;
  const [tenantId, setTenantId] = useState<string | null>(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [templates, setTemplates] = useState<TemplateRow[]>([]);

  // New template form
  const [day, setDay] = useState<number>(0);
  const [times, setTimes] = useState<string>("");
  const [open, setOpen] = useState<string>("");
  const [close, setClose] = useState<string>("");
  const [active, setActive] = useState<boolean>(true);

  const load = async () => {
    setLoading(true);
    try {
      const { data: t } = await supabase
        .from("tenants")
        .select("id")
        .eq("slug", tenant)
        .eq("active", true)
        .single();
      if (!t?.id) {
        setTenantId(null);
        setTemplates([]);
        return;
      }
      setTenantId(t.id);

      const { data } = await supabase
        .from("slot_templates")
        .select("id,day_of_week,start_times_json,open_time,close_time,active")
        .eq("tenant_id", t.id)
        .order("day_of_week", { ascending: true });

      setTemplates(
        (data || []).map((r: any) => ({
          id: r.id,
          day_of_week: r.day_of_week,
          start_times_json: r.start_times_json ?? [],
          open_time: r.open_time,
          close_time: r.close_time,
          active: !!r.active,
        }))
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tenant]);

  const addTemplate = async () => {
    if (!tenantId) return;
    setSaving(true);
    try {
      await supabase.from("slot_templates").insert({
        tenant_id: tenantId,
        day_of_week: day,
        start_times_json: parseTimesInput(times),
        open_time: open || null,
        close_time: close || null,
        active,
      });
      setTimes("");
      setOpen("");
      setClose("");
      setActive(true);
      await load();
    } finally {
      setSaving(false);
    }
  };

  const updateTemplate = async (tpl: TemplateRow) => {
    if (!tenantId) return;
    setSaving(true);
    try {
      await supabase
        .from("slot_templates")
        .update({
          day_of_week: tpl.day_of_week,
          start_times_json: tpl.start_times_json,
          open_time: tpl.open_time,
          close_time: tpl.close_time,
          active: tpl.active,
        })
        .eq("tenant_id", tenantId)
        .eq("id", tpl.id);
      await load();
    } finally {
      setSaving(false);
    }
  };

  const removeTemplate = async (id: string) => {
    if (!tenantId) return;
    setSaving(true);
    try {
      await supabase
        .from("slot_templates")
        .delete()
        .eq("tenant_id", tenantId)
        .eq("id", id);
      await load();
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading availability templates...</p>
        </div>
      </div>
    );
  }

  return (
    <AdminLayout tenant={tenant}>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-gray-900">Availability Templates</h1>

        {/* Create template */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="grid grid-cols-1 md:grid-cols-6 gap-4 items-end">
            <div>
              <label className="block text-sm text-gray-600 mb-1">Day</label>
              <select
                value={day}
                onChange={(e) => setDay(Number(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              >
                {dayNames.map((n, i) => (
                  <option key={i} value={i}>
                    {n}
                  </option>
                ))}
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm text-gray-600 mb-1">Start Times (comma-separated HH:MM)</label>
              <input
                type="text"
                placeholder="10:00, 12:30, 15:00"
                value={times}
                onChange={(e) => setTimes(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Open Time</label>
              <input
                type="time"
                value={open}
                onChange={(e) => setOpen(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Close Time</label>
              <input
                type="time"
                value={close}
                onChange={(e) => setClose(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>
            <div className="flex items-center space-x-2">
              <input id="active" type="checkbox" checked={active} onChange={(e) => setActive(e.target.checked)} />
              <label htmlFor="active" className="text-sm text-gray-700">
                Active
              </label>
            </div>
          </div>
          <div className="mt-4">
            <button
              onClick={addTemplate}
              disabled={saving}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {saving ? "Saving..." : "+ Add Template"}
            </button>
          </div>
        </div>

        {/* List */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Day</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Start Times</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Open</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Close</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Active</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {templates.map((tpl) => (
                  <tr key={tpl.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <select
                        value={tpl.day_of_week ?? 0}
                        onChange={(e) => updateTemplate({ ...tpl, day_of_week: Number(e.target.value) })}
                        className="px-2 py-1 border border-gray-300 rounded"
                      >
                        {dayNames.map((n, i) => (
                          <option key={i} value={i}>
                            {n}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <input
                        type="text"
                        value={toTimesInput(tpl.start_times_json)}
                        onChange={(e) =>
                          setTemplates((prev) =>
                            prev.map((r) =>
                              r.id === tpl.id
                                ? { ...r, start_times_json: parseTimesInput(e.target.value) }
                                : r
                            )
                          )
                        }
                        onBlur={() => updateTemplate(tpl)}
                        className="w-56 px-2 py-1 border border-gray-300 rounded"
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <input
                        type="time"
                        value={tpl.open_time || ""}
                        onChange={(e) =>
                          setTemplates((prev) =>
                            prev.map((r) => (r.id === tpl.id ? { ...r, open_time: e.target.value } : r))
                          )
                        }
                        onBlur={() => updateTemplate(tpl)}
                        className="px-2 py-1 border border-gray-300 rounded"
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <input
                        type="time"
                        value={tpl.close_time || ""}
                        onChange={(e) =>
                          setTemplates((prev) =>
                            prev.map((r) => (r.id === tpl.id ? { ...r, close_time: e.target.value } : r))
                          )
                        }
                        onBlur={() => updateTemplate(tpl)}
                        className="px-2 py-1 border border-gray-300 rounded"
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <input
                        type="checkbox"
                        checked={tpl.active}
                        onChange={(e) => updateTemplate({ ...tpl, active: e.target.checked })}
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-900">
                      <button
                        onClick={() => removeTemplate(tpl.id)}
                        disabled={saving}
                        className="px-3 py-1 rounded bg-red-50 text-red-700 hover:bg-red-100 disabled:opacity-50"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {templates.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500">No templates yet. Add some start times or hours above.</p>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
