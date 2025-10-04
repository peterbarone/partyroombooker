"use client";

import { useEffect, useMemo, useState } from "react";
import AdminLayout from "../../../../components/AdminLayout";
import { supabase } from "@/lib/supabase";

interface FaqsPageProps {
  params: { tenant: string };
}

type UIFaq = {
  id: string;
  question: string;
  answer: string;
  sort_order: number;
};

export default function FaqsPage({ params }: FaqsPageProps) {
  const tenant = params.tenant;

  const [tenantId, setTenantId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [faqs, setFaqs] = useState<UIFaq[]>([]);

  const [query, setQuery] = useState("");

  // Create form
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");

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
        setFaqs([]);
        return;
      }
      setTenantId(t.id);

      const { data } = await supabase
        .from("party_faqs")
        .select("id,question,answer,sort_order")
        .eq("tenant_id", t.id)
        .order("sort_order", { ascending: true });

      setFaqs(
        (data || []).map((f: any) => ({
          id: f.id,
          question: f.question,
          answer: f.answer,
          sort_order: Number(f.sort_order || 0),
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

  const filtered = useMemo(() => {
    const s = query.toLowerCase();
    return faqs.filter((f) =>
      [f.question, f.answer].some((t) => (t || "").toLowerCase().includes(s))
    );
  }, [faqs, query]);

  const createFaq = async () => {
    if (!tenantId || !question || !answer) return;
    setSaving(true);
    try {
      const maxSort = faqs.reduce((m, f) => Math.max(m, f.sort_order), 0);
      await supabase.from("party_faqs").insert({
        tenant_id: tenantId,
        question,
        answer,
        sort_order: maxSort + 1,
      });
      setQuestion("");
      setAnswer("");
      await load();
    } finally {
      setSaving(false);
    }
  };

  const updateFaq = async (faq: UIFaq) => {
    if (!tenantId) return;
    setSaving(true);
    try {
      await supabase
        .from("party_faqs")
        .update({
          question: faq.question,
          answer: faq.answer,
          sort_order: faq.sort_order,
        })
        .eq("tenant_id", tenantId)
        .eq("id", faq.id);
      await load();
    } finally {
      setSaving(false);
    }
  };

  const deleteFaq = async (id: string) => {
    if (!tenantId) return;
    setSaving(true);
    try {
      await supabase.from("party_faqs").delete().eq("tenant_id", tenantId).eq("id", id);
      await load();
    } finally {
      setSaving(false);
    }
  };

  const moveFaq = async (id: string, dir: -1 | 1) => {
    const idx = faqs.findIndex((f) => f.id === id);
    if (idx < 0) return;
    const newList = [...faqs];
    const swapIdx = idx + dir;
    if (swapIdx < 0 || swapIdx >= newList.length) return;
    // swap sort_order
    const a = newList[idx];
    const b = newList[swapIdx];
    const tmp = a.sort_order;
    a.sort_order = b.sort_order;
    b.sort_order = tmp;
    setFaqs(newList);
    await updateFaq(a);
    await updateFaq(b);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading FAQs...</p>
        </div>
      </div>
    );
  }

  return (
    <AdminLayout tenant={tenant}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">FAQs</h1>
        </div>

        {/* Search */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
            <div>
              <label className="block text-sm text-gray-600 mb-1">Search</label>
              <input
                type="text"
                placeholder="Search question or answer"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>
          </div>
        </div>

        {/* Create */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">Add FAQ</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-600 mb-1">Question</label>
              <input
                type="text"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Answer</label>
              <input
                type="text"
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>
          </div>
          <div>
            <button
              onClick={createFaq}
              disabled={saving || !question || !answer}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {saving ? "Saving..." : "+ Add FAQ"}
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Question</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Answer</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filtered.map((f) => (
                  <tr key={f.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div className="flex items-center space-x-2">
                        <button onClick={() => moveFaq(f.id, -1)} className="px-2 py-1 rounded bg-gray-100 hover:bg-gray-200">↑</button>
                        <button onClick={() => moveFaq(f.id, 1)} className="px-2 py-1 rounded bg-gray-100 hover:bg-gray-200">↓</button>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <input
                        type="text"
                        value={f.question}
                        onChange={(e) => setFaqs((prev) => prev.map((r) => (r.id === f.id ? { ...r, question: e.target.value } : r)))}
                        onBlur={() => updateFaq(f)}
                        className="w-80 px-2 py-1 border border-gray-300 rounded"
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <input
                        type="text"
                        value={f.answer}
                        onChange={(e) => setFaqs((prev) => prev.map((r) => (r.id === f.id ? { ...r, answer: e.target.value } : r)))}
                        onBlur={() => updateFaq(f)}
                        className="w-96 px-2 py-1 border border-gray-300 rounded"
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-900">
                      <button onClick={() => deleteFaq(f.id)} disabled={saving} className="px-3 py-1 rounded bg-red-50 text-red-700 hover:bg-red-100 disabled:opacity-50">Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {filtered.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500">No FAQs found.</p>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
