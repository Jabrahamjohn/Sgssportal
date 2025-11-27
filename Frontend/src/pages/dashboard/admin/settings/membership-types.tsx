import React, { useEffect, useState } from "react";
import api from "~/config/api";

interface MembershipType {
  id: string;
  name: string;
  annual_limit: string;
  fund_share_percent: string;
  entry_fee?: string;
  term_years?: number | null;
  notes?: string;
}

const emptyType: MembershipType = {
  id: "",
  name: "",
  annual_limit: "",
  fund_share_percent: "80",
  entry_fee: "",
  term_years: 1,
  notes: "",
};

export default function AdminMembershipTypes() {
  const [items, setItems] = useState<MembershipType[]>([]);
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState<MembershipType | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const fetchItems = async () => {
    setLoading(true);
    try {
      const res = await api.get("memberships/");
      setItems(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const openNew = () => {
    setEditing({ ...emptyType });
    setModalOpen(true);
  };

  const openEdit = (m: MembershipType) => {
    setEditing({ ...m });
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditing(null);
  };

  const save = async () => {
    if (!editing) return;

    const payload: any = {
      name: editing.name,
      annual_limit: editing.annual_limit,
      fund_share_percent: editing.fund_share_percent,
      entry_fee: editing.entry_fee,
      term_years: editing.term_years,
      notes: editing.notes,
    };

    try {
      if (editing.id) {
        const res = await api.patch(`memberships/${editing.id}/`, payload);
        const updated: MembershipType = res.data;
        setItems((prev) =>
          prev.map((m) => (m.id === updated.id ? updated : m))
        );
      } else {
        const res = await api.post("memberships/", payload);
        const created: MembershipType = res.data;
        setItems((prev) => [...prev, created]);
      }
      closeModal();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Membership Types</h1>
        <button
          onClick={openNew}
          className="px-4 py-2 bg-[#03045f] text-white rounded-lg text-sm font-medium hover:bg-[#021f4a]"
        >
          New Membership Type
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border overflow-auto">
        {loading ? (
          <div className="p-4 text-sm text-gray-500">Loading…</div>
        ) : items.length === 0 ? (
          <div className="p-4 text-sm text-gray-500">No membership types yet.</div>
        ) : (
          <table className="min-w-full text-sm">
            <thead>
              <tr className="bg-gray-50 text-left text-xs uppercase text-gray-500">
                <th className="px-4 py-2">Name</th>
                <th className="px-4 py-2">Annual Limit</th>
                <th className="px-4 py-2">Fund Share %</th>
                <th className="px-4 py-2">Entry Fee</th>
                <th className="px-4 py-2">Term (Years)</th>
                <th className="px-4 py-2">Notes</th>
                <th className="px-4 py-2 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((m) => (
                <tr key={m.id} className="border-t">
                  <td className="px-4 py-2 font-medium">{m.name}</td>
                  <td className="px-4 py-2">{m.annual_limit}</td>
                  <td className="px-4 py-2">{m.fund_share_percent}%</td>
                  <td className="px-4 py-2">{m.entry_fee || "—"}</td>
                  <td className="px-4 py-2">
                    {m.term_years != null ? m.term_years : "—"}
                  </td>
                  <td className="px-4 py-2 text-xs text-gray-600">
                    {m.notes || "—"}
                  </td>
                  <td className="px-4 py-2 text-right">
                    <button
                      onClick={() => openEdit(m)}
                      className="text-xs text-blue-600 hover:underline"
                    >
                      Edit
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {modalOpen && editing && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-40">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg p-6 space-y-4">
            <h2 className="text-lg font-semibold">
              {editing.id ? "Edit Membership Type" : "New Membership Type"}
            </h2>
            <div className="space-y-3 text-sm">
              <Field
                label="Name"
                value={editing.name}
                onChange={(v) =>
                  setEditing((e) => e && { ...e, name: v })
                }
              />
              <Field
                label="Annual Limit (Ksh)"
                value={editing.annual_limit || ""}
                onChange={(v) =>
                  setEditing((e) => e && { ...e, annual_limit: v })
                }
              />
              <Field
                label="Fund Share Percent (Fund → Member pays rest)"
                value={editing.fund_share_percent || ""}
                onChange={(v) =>
                  setEditing((e) => e && { ...e, fund_share_percent: v })
                }
              />
              <Field
                label="Entry Fee (Ksh)"
                value={editing.entry_fee || ""}
                onChange={(v) =>
                  setEditing((e) => e && { ...e, entry_fee: v })
                }
              />
              <Field
                label="Term (Years)"
                value={
                  editing.term_years != null
                    ? String(editing.term_years)
                    : ""
                }
                onChange={(v) =>
                  setEditing((e) =>
                    e && {
                      ...e,
                      term_years: v ? Number(v) : null,
                    }
                  )
                }
              />
              <label className="block text-xs">
                <span className="block text-[11px] text-gray-500 mb-1">
                  Notes
                </span>
                <textarea
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring focus:ring-blue-100"
                  rows={3}
                  value={editing.notes || ""}
                  onChange={(e) =>
                    setEditing((s) =>
                      s && { ...s, notes: e.target.value }
                    )
                  }
                />
              </label>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={closeModal}
                className="px-4 py-2 text-sm rounded-lg border border-gray-200"
              >
                Cancel
              </button>
              <button
                onClick={save}
                className="px-4 py-2 text-sm rounded-lg bg-[#03045f] text-white"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <label className="block text-xs">
      <span className="block text-[11px] text-gray-500 mb-1">{label}</span>
      <input
        className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring focus:ring-blue-100"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </label>
  );
}
