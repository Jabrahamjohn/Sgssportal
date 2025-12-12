// Frontend/src/pages/dashboard/admin/settings/reimbursement.tsx
import React, { useEffect, useState } from "react";
import api from "~/config/api";
import Button from "~/components/controls/button";
import Input from "~/components/controls/input";
import Alert from "~/components/controls/alert";
import PageTransition from "~/components/animations/PageTransition";
import { 
    ScaleIcon, 
    PencilSquareIcon, 
    CheckIcon, 
    XMarkIcon,
    PlusIcon,
    CurrencyDollarIcon
} from "@heroicons/react/24/outline";

type Scale = {
  id: string;
  category: string;
  fund_share: number;
  member_share: number;
  ceiling: number;
};

export default function ReimbursementSettings() {
  const [items, setItems] = useState<Scale[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState<Partial<Scale>>({});

  const resetStatus = () => {
    setError("");
    setSuccess("");
  };

  const load = async () => {
    resetStatus();
    setLoading(true);
    try {
      const res = await api.get("reimbursement-scales/");
      setItems(Array.isArray(res.data) ? res.data : (res.data?.results || []));
    } catch (e) {
      console.error(e);
      setError("Failed to load reimbursement scales.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const startNew = () => {
    resetStatus();
    setEditingId("new");
    setDraft({
      category: "",
      fund_share: 80,
      member_share: 20,
      ceiling: 250000,
    });
  };

  const startEdit = (scale: Scale) => {
    resetStatus();
    setEditingId(scale.id);
    setDraft(scale);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setDraft({});
  };

  const handleChange = (field: keyof Scale, value: any) => {
    setDraft((prev) => ({ ...prev, [field]: value }));
  };

  const save = async () => {
    if (!draft.category) {
      setError("Category is required.");
      return;
    }
    resetStatus();
    setSaving(true);

    try {
      const payload = {
        category: draft.category,
        fund_share: Number(draft.fund_share ?? 80),
        member_share: Number(draft.member_share ?? 20),
        ceiling: Number(draft.ceiling ?? 0),
      };

      if (editingId === "new") {
        await api.post("reimbursement-scales/", payload);
        setSuccess("Scale created.");
      } else if (editingId) {
        await api.put(`reimbursement-scales/${editingId}/`, payload);
        setSuccess("Scale updated.");
      }

      await load();
      cancelEdit();
    } catch (e: any) {
      console.error(e);
      setError(
        e.response?.data?.detail ||
          "Failed to save reimbursement scale. Please check values."
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <PageTransition className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
           <h2 className="text-xl font-bold text-[var(--sgss-navy)] flex items-center gap-2">
               <ScaleIcon className="w-6 h-6 text-[var(--sgss-gold)]" />
               Reimbursement Rules
           </h2>
           <p className="text-sm text-gray-500 mt-1">Define fund coverage percentages and ceilings for claim types.</p>
        </div>
        <Button 
            onClick={startNew} 
            disabled={editingId === "new"}
            className="bg-[var(--sgss-navy)] hover:bg-blue-900 text-white shadow-lg shadow-blue-900/20"
        >
            <PlusIcon className="w-4 h-4 mr-2" />
            Add Rule
        </Button>
      </div>

      {error && <Alert type="error" message={error} />}
      {success && <Alert type="success" message={success} />}

      <div className="sgss-card p-0 overflow-hidden bg-white">
        {loading ? (
           <div className="p-8 text-center text-gray-400">Loading scales...</div>
        ) : (
           <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                 <thead className="bg-gray-50 text-xs uppercase text-gray-500 font-semibold border-b border-gray-100">
                    <tr>
                       <th className="px-6 py-4">Category</th>
                       <th className="px-6 py-4">Fund Share</th>
                       <th className="px-6 py-4">Member Share</th>
                       <th className="px-6 py-4">Annual Ceiling</th>
                       <th className="px-6 py-4 w-32 text-center">Actions</th>
                    </tr>
                 </thead>
                 <tbody className="divide-y divide-gray-50">
                    {/* Items */}
                    {items.map((s) => {
                        const isEditing = editingId === s.id;
                        return (
                           <tr key={s.id} className={`transition-colors ${isEditing ? 'bg-blue-50/50' : 'hover:bg-gray-50'}`}>
                              <td className="px-6 py-4">
                                  {isEditing ? (
                                      <Input 
                                          value={draft.category || ""}
                                          onChange={e => handleChange("category", e.target.value)}
                                          placeholder="e.g. Outpatient"
                                          className="bg-white"
                                      />
                                  ) : (
                                      <span className="font-medium text-gray-900">{s.category}</span>
                                  )}
                              </td>
                              <td className="px-6 py-4">
                                  {isEditing ? (
                                      <div className="relative">
                                          <Input 
                                              type="number"
                                              value={draft.fund_share ?? ""}
                                              onChange={e => handleChange("fund_share", e.target.value)}
                                              className="bg-white pr-8"
                                          />
                                          <span className="absolute right-3 top-2.5 text-gray-400">%</span>
                                      </div>
                                  ) : (
                                      <span className="text-emerald-600 font-medium">{s.fund_share}%</span>
                                  )}
                              </td>
                              <td className="px-6 py-4">
                                  {isEditing ? (
                                      <div className="relative">
                                          <Input 
                                              type="number"
                                              value={draft.member_share ?? ""}
                                              onChange={e => handleChange("member_share", e.target.value)}
                                              className="bg-white pr-8"
                                          />
                                          <span className="absolute right-3 top-2.5 text-gray-400">%</span>
                                      </div>
                                  ) : (
                                      <span className="text-orange-600 font-medium">{s.member_share}%</span>
                                  )}
                              </td>
                              <td className="px-6 py-4">
                                  {isEditing ? (
                                      <Input 
                                          type="number"
                                          value={draft.ceiling ?? ""}
                                          onChange={e => handleChange("ceiling", e.target.value)}
                                          className="bg-white"
                                          icon={<CurrencyDollarIcon className="w-4 h-4" />}
                                      />
                                  ) : (
                                      <span className="font-mono text-gray-600">Ksh {Number(s.ceiling).toLocaleString()}</span>
                                  )}
                              </td>
                              <td className="px-6 py-4 text-center">
                                  {isEditing ? (
                                      <div className="flex justify-center gap-2">
                                          <button onClick={save} disabled={saving} className="p-2 bg-emerald-100 text-emerald-600 rounded-lg hover:bg-emerald-200">
                                              <CheckIcon className="w-5 h-5" />
                                          </button>
                                          <button onClick={cancelEdit} className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200">
                                              <XMarkIcon className="w-5 h-5" />
                                          </button>
                                      </div>
                                  ) : (
                                      <button onClick={() => startEdit(s)} className="p-2 text-gray-400 hover:text-[var(--sgss-navy)] hover:bg-gray-100 rounded-lg transition-colors">
                                          <PencilSquareIcon className="w-5 h-5" />
                                      </button>
                                  )}
                              </td>
                           </tr>
                        )
                    })}
                    
                    {/* New Item Row */}
                    {editingId === "new" && (
                        <tr className="bg-blue-50/50 border-t border-blue-100 animate-in fade-in slide-in-from-top-2">
                            <td className="px-6 py-4">
                                <Input 
                                    value={draft.category || ""}
                                    onChange={e => handleChange("category", e.target.value)}
                                    placeholder="Category Name"
                                    className="bg-white border-blue-200 focus:border-blue-400 focus:ring-blue-100"
                                    autoFocus
                                />
                            </td>
                            <td className="px-6 py-4">
                                <Input 
                                    type="number"
                                    value={draft.fund_share ?? ""}
                                    onChange={e => handleChange("fund_share", e.target.value)}
                                    className="bg-white border-blue-200"
                                />
                            </td>
                            <td className="px-6 py-4">
                                <Input 
                                    type="number"
                                    value={draft.member_share ?? ""}
                                    onChange={e => handleChange("member_share", e.target.value)}
                                    className="bg-white border-blue-200"
                                />
                            </td>
                            <td className="px-6 py-4">
                                <Input 
                                    type="number"
                                    value={draft.ceiling ?? ""}
                                    onChange={e => handleChange("ceiling", e.target.value)}
                                    className="bg-white border-blue-200"
                                />
                            </td>
                            <td className="px-6 py-4 text-center">
                                <div className="flex justify-center gap-2">
                                    <button onClick={save} disabled={saving} className="p-2 bg-emerald-100 text-emerald-600 rounded-lg hover:bg-emerald-200">
                                       <CheckIcon className="w-5 h-5" />
                                    </button>
                                    <button onClick={cancelEdit} className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200">
                                       <XMarkIcon className="w-5 h-5" />
                                    </button>
                                </div>
                            </td>
                        </tr>
                    )}
                 </tbody>
              </table>
           </div>
        )}
      </div>
    </PageTransition>
  );
}
