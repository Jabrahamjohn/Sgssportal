// Frontend/src/pages/dashboard/admin/settings/reimbursement.tsx
import React, { useEffect, useState } from "react";
import api from "~/config/api";
import Button from "~/components/controls/button";
import Input from "~/components/controls/input";
import Alert from "~/components/controls/alert";

type Scale = {
  id: string;
  category: string; // Outpatient / Inpatient / Chronic
  fund_share: number; // %
  member_share: number; // %
  ceiling: number; // Ksh
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
      setItems(res.data);
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
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold">Reimbursement Scales</h2>
          <p className="text-xs text-gray-500">
            Define fund vs member share and ceilings for Outpatient, Inpatient and
            Chronic claims, as per Byelaws.
          </p>
        </div>
        <Button
          onClick={startNew}
          className="bg-[var(--sgss-navy)] hover:bg-[var(--sgss-gold)] text-white"
        >
          + New Scale
        </Button>
      </div>

      {error && <Alert type="error" message={error} />}
      {success && <Alert type="success" message={success} />}

      {loading ? (
        <p className="text-sm text-gray-500">Loading…</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm border border-gray-100 rounded-lg overflow-hidden">
            <thead className="bg-gray-50">
              <tr className="text-left">
                <th className="px-3 py-2 border-b">Category</th>
                <th className="px-3 py-2 border-b">Fund Share (%)</th>
                <th className="px-3 py-2 border-b">Member Share (%)</th>
                <th className="px-3 py-2 border-b">Ceiling (Ksh)</th>
                <th className="px-3 py-2 border-b w-32">Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((s) => {
                const isEditing = editingId === s.id;
                return (
                  <tr key={s.id} className="border-b last:border-b-0">
                    <td className="px-3 py-2">
                      {isEditing ? (
                        <Input
                          value={draft.category || ""}
                          onChange={(e) =>
                            handleChange("category", e.target.value)
                          }
                        />
                      ) : (
                        s.category
                      )}
                    </td>
                    <td className="px-3 py-2">
                      {isEditing ? (
                        <Input
                          type="number"
                          value={draft.fund_share ?? ""}
                          onChange={(e) =>
                            handleChange(
                              "fund_share",
                              e.target.value ? Number(e.target.value) : 0
                            )
                          }
                        />
                      ) : (
                        `${s.fund_share}%`
                      )}
                    </td>
                    <td className="px-3 py-2">
                      {isEditing ? (
                        <Input
                          type="number"
                          value={draft.member_share ?? ""}
                          onChange={(e) =>
                            handleChange(
                              "member_share",
                              e.target.value ? Number(e.target.value) : 0
                            )
                          }
                        />
                      ) : (
                        `${s.member_share}%`
                      )}
                    </td>
                    <td className="px-3 py-2">
                      {isEditing ? (
                        <Input
                          type="number"
                          value={draft.ceiling ?? ""}
                          onChange={(e) =>
                            handleChange(
                              "ceiling",
                              e.target.value ? Number(e.target.value) : 0
                            )
                          }
                        />
                      ) : (
                        Number(s.ceiling).toLocaleString()
                      )}
                    </td>
                    <td className="px-3 py-2">
                      {isEditing ? (
                        <div className="flex gap-1">
                          <Button
                            size="sm"
                            onClick={save}
                            disabled={saving}
                            className="bg-[var(--sgss-navy)] hover:bg-[var(--sgss-gold)] text-white"
                          >
                            {saving ? "Saving…" : "Save"}
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={cancelEdit}
                          >
                            Cancel
                          </Button>
                        </div>
                      ) : (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => startEdit(s)}
                        >
                          Edit
                        </Button>
                      )}
                    </td>
                  </tr>
                );
              })}

              {editingId === "new" && (
                <tr className="border-t bg-gray-50/60">
                  <td className="px-3 py-2">
                    <Input
                      value={draft.category || ""}
                      onChange={(e) =>
                        handleChange("category", e.target.value)
                      }
                    />
                  </td>
                  <td className="px-3 py-2">
                    <Input
                      type="number"
                      value={draft.fund_share ?? ""}
                      onChange={(e) =>
                        handleChange(
                          "fund_share",
                          e.target.value ? Number(e.target.value) : 0
                        )
                      }
                    />
                  </td>
                  <td className="px-3 py-2">
                    <Input
                      type="number"
                      value={draft.member_share ?? ""}
                      onChange={(e) =>
                        handleChange(
                          "member_share",
                          e.target.value ? Number(e.target.value) : 0
                        )
                      }
                    />
                  </td>
                  <td className="px-3 py-2">
                    <Input
                      type="number"
                      value={draft.ceiling ?? ""}
                      onChange={(e) =>
                        handleChange(
                          "ceiling",
                          e.target.value ? Number(e.target.value) : 0
                        )
                      }
                    />
                  </td>
                  <td className="px-3 py-2">
                    <div className="flex gap-1">
                      <Button
                        size="sm"
                        onClick={save}
                        disabled={saving}
                        className="bg-[var(--sgss-navy)] hover:bg-[var(--sgss-gold)] text-white"
                      >
                        {saving ? "Saving…" : "Create"}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={cancelEdit}
                      >
                        Cancel
                      </Button>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
