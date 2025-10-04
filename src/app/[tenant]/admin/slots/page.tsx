"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import AdminLayout from "../../../../components/AdminLayout";
import { supabase } from "@/lib/supabase";

// Admin UI for managing available party time slots per day of week.
// Backs onto public.slot_templates: (tenant_id, day_of_week 0-6, start_times_json jsonb[], active bool, open_time, close_time)

const DAYS = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

type TemplateRow = {
  id?: string;
  tenant_id: string;
  day_of_week: number; // 0-6
  start_times_json: string[] | null;
  active: boolean | null;
  open_time?: string | null; // HH:MM:SS
  close_time?: string | null; // HH:MM:SS
};

export default function SlotsAdminPage() {
  const params = useParams();
  const tenantSlug = String(params?.tenant ?? "");

  const [tenantId, setTenantId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [rows, setRows] = useState<Record<number, TemplateRow | null>>({});

  // Resolve tenant and load templates
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        setError(null);
        setSuccess(null);

        const { data: t, error: terr } = await supabase
          .from("tenants")
          .select("id")
          .eq("slug", tenantSlug)
          .eq("active", true)
          .single();
        if (terr || !t?.id) {
          setError("Unable to resolve tenant by slug.");
          return;
        }
        if (cancelled) return;
        setTenantId(t.id);

        const { data: templates, error: lerr } = await supabase
          .from("slot_templates")
          .select("id, tenant_id, day_of_week, start_times_json, active, open_time, close_time")
          .eq("tenant_id", t.id);
        if (lerr) throw lerr;

        const initial: Record<number, TemplateRow | null> = {};
        for (let d = 0; d < 7; d++) {
          const row = (templates || []).find((r: any) => r.day_of_week === d) || null;
          initial[d] = row
            ? {
                id: row.id,
                tenant_id: row.tenant_id,
                day_of_week: row.day_of_week,
                start_times_json: Array.isArray(row.start_times_json)
                  ? row.start_times_json
                  : [],
                active: row.active ?? true,
                open_time: row.open_time ?? null,
                close_time: row.close_time ?? null,
              }
            : null;
        }
        if (!cancelled) setRows(initial);
      } catch (e: any) {
        if (!cancelled) setError(e?.message || String(e));
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };

  // Helpers for friendlier time editing
  const normalizeHHMM = (v: string) => v.trim();
  const addTime = (dow: number, v: string) => {
    const hhmm = normalizeHHMM(v);
    if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(hhmm)) {
      setError("Enter time as HH:MM (24h), e.g. 13:30");
      return;
    }
    setError(null);
    setRows((prev) => {
      const existing = new Set(prev[dow]?.start_times_json || []);
      existing.add(hhmm);
      const next = Array.from(existing).sort();
      return {
        ...prev,
        [dow]: {
          tenant_id: tenantId || "",
          day_of_week: dow,
          start_times_json: next,
          active: prev[dow]?.active ?? true,
          open_time: prev[dow]?.open_time ?? null,
          close_time: prev[dow]?.close_time ?? null,
          id: prev[dow]?.id,
        },
      };
    });
  };

  const removeTime = (dow: number, t: string) => {
    setRows((prev) => {
      const list = (prev[dow]?.start_times_json || []).filter((x) => x !== t);
      return {
        ...prev,
        [dow]: {
          tenant_id: tenantId || "",
          day_of_week: dow,
          start_times_json: list,
          active: prev[dow]?.active ?? true,
          open_time: prev[dow]?.open_time ?? null,
          close_time: prev[dow]?.close_time ?? null,
          id: prev[dow]?.id,
        },
      };
    });
  };

  const clearDay = (dow: number) => {
    setRows((prev) => ({
      ...prev,
      [dow]: {
        tenant_id: tenantId || "",
        day_of_week: dow,
        start_times_json: [],
        active: prev[dow]?.active ?? true,
        open_time: prev[dow]?.open_time ?? null,
        close_time: prev[dow]?.close_time ?? null,
        id: prev[dow]?.id,
      },
    }));
  };

  const copyTimes = (fromDow: number, toDows: number[]) => {
    setRows((prev) => {
      const from = prev[fromDow]?.start_times_json || [];
      const next: typeof prev = { ...prev };
      toDows.forEach((d) => {
        next[d] = {
          tenant_id: tenantId || "",
          day_of_week: d,
          start_times_json: [...from],
          active: next[d]?.active ?? true,
          open_time: next[d]?.open_time ?? null,
          close_time: next[d]?.close_time ?? null,
          id: next[d]?.id,
        } as any;
      });
      return next;
    });
  };
  }, [tenantSlug]);

  const handleTimesChange = (dow: number, value: string) => {
    const parts = value
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    const valid = parts.every((t) => /^([01]\d|2[0-3]):[0-5]\d$/.test(t));
    if (!valid) {
      setError("Use HH:MM 24h format, comma-separated. Example: 10:00, 13:00, 16:00");
      return;
    }
    setError(null);
    setRows((prev) => ({
      ...prev,
      [dow]: {
        tenant_id: tenantId || "",
        day_of_week: dow,
        start_times_json: parts,
        active: prev[dow]?.active ?? true,
        open_time: prev[dow]?.open_time ?? null,
        close_time: prev[dow]?.close_time ?? null,
        id: prev[dow]?.id,
      },
    }));
  };

  const handleToggleActive = (dow: number, checked: boolean) => {
    setRows((prev) => ({
      ...prev,
      [dow]: {
        tenant_id: tenantId || "",
        day_of_week: dow,
        start_times_json: prev[dow]?.start_times_json ?? [],
        active: checked,
        open_time: prev[dow]?.open_time ?? null,
        close_time: prev[dow]?.close_time ?? null,
        id: prev[dow]?.id,
      },
    }));
  };

  const handleTimeField = (dow: number, field: "open_time" | "close_time", value: string) => {
    // Accept empty or HH:MM
    const v = value.trim();
    if (v && !/^([01]\d|2[0-3]):[0-5]\d$/.test(v)) {
      setError("Open/Close time must be HH:MM (24h) or blank");
      return;
    }
    setError(null);
    setRows((prev) => ({
      ...prev,
      [dow]: {
        tenant_id: tenantId || "",
        day_of_week: dow,
        start_times_json: prev[dow]?.start_times_json ?? [],
        active: prev[dow]?.active ?? true,
        open_time: field === "open_time" ? (v ? `${v}:00` : null) : prev[dow]?.open_time ?? null,
        close_time: field === "close_time" ? (v ? `${v}:00` : null) : prev[dow]?.close_time ?? null,
        id: prev[dow]?.id,
      },
    }));
  };

  const save = async () => {
    if (!tenantId) return;
    try {
      setSaving(true);
      setError(null);
      setSuccess(null);

      // Build upserts only for rows with data
      const payload = Object.values(rows)
        .filter((r): r is TemplateRow => !!r && !!r.tenant_id)
        .map((r) => ({
          id: r.id,
          tenant_id: tenantId,
          day_of_week: r.day_of_week,
          start_times_json: r.start_times_json ?? [],
          active: r.active ?? true,
          open_time: r.open_time ?? null,
          close_time: r.close_time ?? null,
        }));

      // Upsert per day_of_week,tenant_id (assumes unique constraint)
      const { error: upErr } = await supabase
        .from("slot_templates")
        .upsert(payload, { onConflict: "tenant_id,day_of_week" });

      if (upErr) throw upErr;
      setSuccess("Saved time slots.");
    } catch (e: any) {
      setError(e?.message || String(e));
    } finally {
      setSaving(false);
    }
  };

  const dayInputValue = (dow: number) => {
    const row = rows[dow];
    return (row?.start_times_json || []).join(", ");
  };
  const timeToHHMM = (t?: string | null) => (t ? t.slice(0, 5) : "");

  return (
    <AdminLayout tenant={tenantSlug}>
      <div className="p-6 max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-4">Party Time Slots</h1>
        <p className="text-sm text-gray-600 mb-6">Configure available start times for each day of week.</p>

        {loading ? (
          <div>Loading…</div>
        ) : (
          <div className="space-y-6">
            {error && (
              <div className="rounded-md border border-red-300 bg-red-50 text-red-700 p-3">{error}</div>
            )}
            {success && (
              <div className="rounded-md border border-green-300 bg-green-50 text-green-700 p-3">{success}</div>
            )}

            {DAYS.map((label, dow) => (
              <div key={dow} className="border rounded-lg p-4 bg-white shadow-sm">
                <div className="flex items-center justify-between mb-3">
                  <h2 className="font-semibold">{label}</h2>
                  <label className="inline-flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={rows[dow]?.active ?? true}
                      onChange={(e) => handleToggleActive(dow, e.target.checked)}
                    />
                    <span>Active</span>
                  </label>
                </div>

                {/* Time chips */}
                <div className="flex flex-wrap gap-2 mb-3">
                  {(rows[dow]?.start_times_json || []).length === 0 && (
                    <span className="text-sm text-gray-500">No times yet</span>
                  )}
                  {(rows[dow]?.start_times_json || []).map((t) => (
                    <span key={t} className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200 text-sm">
                      {t}
                      <button
                        type="button"
                        className="text-blue-700 hover:text-blue-900"
                        onClick={() => removeTime(dow, t)}
                        aria-label={`Remove ${t}`}
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>

                {/* Add time + open/close */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-end">
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Add Time (HH:MM)</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        className="w-full border rounded px-3 py-2"
                        placeholder="e.g. 10:00"
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            const target = e.target as HTMLInputElement;
                            addTime(dow, target.value);
                            target.value = "";
                          }
                        }}
                      />
                      <button
                        type="button"
                        className="px-3 py-2 rounded bg-blue-600 text-white"
                        onClick={(e) => {
                          const input = (e.currentTarget.parentElement?.querySelector('input[type="text"]') as HTMLInputElement) || null;
                          if (input) {
                            addTime(dow, input.value);
                            input.value = "";
                          }
                        }}
                      >
                        Add
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Open Time (optional)</label>
                    <input
                      type="time"
                      className="w-full border rounded px-3 py-2"
                      value={timeToHHMM(rows[dow]?.open_time)}
                      onChange={(e) => handleTimeField(dow, "open_time", e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Close Time (optional)</label>
                    <input
                      type="time"
                      className="w-full border rounded px-3 py-2"
                      value={timeToHHMM(rows[dow]?.close_time)}
                      onChange={(e) => handleTimeField(dow, "close_time", e.target.value)}
                    />
                  </div>
                </div>

                {/* Per-day actions */}
                <div className="mt-3 flex flex-wrap gap-2 text-sm">
                  <button
                    className="px-3 py-1 border rounded hover:bg-gray-50"
                    onClick={() => copyTimes(dow, [0,1,2,3,4,5,6].filter((d) => d !== dow))}
                  >
                    Copy to all
                  </button>
                  <button
                    className="px-3 py-1 border rounded hover:bg-gray-50"
                    onClick={() => copyTimes(dow, [1,2,3,4,5])}
                  >
                    Copy to weekdays
                  </button>
                  <button
                    className="px-3 py-1 border rounded hover:bg-gray-50"
                    onClick={() => copyTimes(dow, [0,6])}
                  >
                    Copy to weekend
                  </button>
                  <button
                    className="px-3 py-1 border rounded hover:bg-gray-50 text-red-700 border-red-300"
                    onClick={() => clearDay(dow)}
                  >
                    Clear day
                  </button>
                </div>
              </div>
            ))}

            <div className="flex gap-3">
              <button
                onClick={save}
                disabled={saving || !tenantId}
                className="px-4 py-2 rounded bg-blue-600 text-white disabled:opacity-50"
              >
                {saving ? "Saving…" : "Save Changes"}
              </button>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
