// Frontend/src/pages/dashboard/member/dependants.tsx
import React, { useEffect, useState } from "react";
import api from "~/config/api";

interface Dependant {
  id: string;
  full_name: string;
  date_of_birth?: string;
  blood_group?: string;
  id_number?: string;
  relationship?: string;
}

export default function MemberDependantsPage() {
  const [deps, setDeps] = useState<Dependant[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Dependant | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const emptyDep: Dependant = {
    id: "",
    full_name: "",
    date_of_birth: "",
    blood_group: "",
    id_number: "",
    relationship: "",
  };

  const openNew = () => {
    setEditing({ ...emptyDep });
    setModalOpen(true);
  };

  const openEdit = (d: Dependant) => {
    setEditing({ ...d });
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditing(null);
  };

  const fetchDeps = async () => {
    setLoading(true);
    try {
      const res = await api.get("members/me/dependants/");
      setDeps(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDeps();
  }, []);

  const save = async () => {
    if (!editing) return;
    try {
      if (editing.id) {
        const res = await api.patch(`dependants/${editing.id}/`, editing);
        setDeps((prev) =>
          prev.map((d) => (d.id === editing.id ? res.data : d))
        );
      } else {
        const payload = { ...editing } as any;
        delete payload.id;
        const res = await api.post("members/me/dependants/", payload);
        setDeps((prev) => [...prev, res.data]);
      }
      closeModal();
    } catch (e) {
      console.error(e);
    }
  };

  const remove = async (id: string) => {
    if (!window.confirm("Remove this dependant?")) return;
    try {
      await api.delete(`dependants/${id}/`);
      setDeps((prev) => prev.filter((d) => d.id !== id));
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Dependants</h1>
        <button
          onClick={openNew}
          className="px-4 py-2 bg-[#03045f] text-white rounded-lg text-sm font-medium hover:bg-[#021f4a]"
        >
          Add Dependant
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border">
        {loading ? (
          <div className="p-4 text-sm text-gray-500">Loading…</div>
        ) : deps.length === 0 ? (
          <div className="p-4 text-sm text-gray-500">
            No dependants added yet.
          </div>
        ) : (
          <table className="min-w-full text-sm">
            <thead>
              <tr className="bg-gray-50 text-left text-xs uppercase text-gray-500">
                <th className="px-4 py-2">Name</th>
                <th className="px-4 py-2">Relationship</th>
                <th className="px-4 py-2">DOB</th>
                <th className="px-4 py-2">Blood Group</th>
                <th className="px-4 py-2">ID No.</th>
                <th className="px-4 py-2 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {deps.map((d) => (
                <tr key={d.id} className="border-t">
                  <td className="px-4 py-2">{d.full_name}</td>
                  <td className="px-4 py-2">{d.relationship || "—"}</td>
                  <td className="px-4 py-2">{d.date_of_birth || "—"}</td>
                  <td className="px-4 py-2">{d.blood_group || "—"}</td>
                  <td className="px-4 py-2">{d.id_number || "—"}</td>
                  <td className="px-4 py-2 text-right space-x-2">
                    <button
                      onClick={() => openEdit(d)}
                      className="text-xs text-blue-600 hover:underline"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => remove(d.id)}
                      className="text-xs text-red-600 hover:underline"
                    >
                      Delete
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
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-5 space-y-4">
            <h2 className="text-lg font-semibold">
              {editing.id ? "Edit Dependant" : "Add Dependant"}
            </h2>

            <div className="space-y-3 text-sm">
              <Input
                label="Full Name"
                value={editing.full_name}
                onChange={(v) =>
                  setEditing((e) => e && { ...e, full_name: v })
                }
              />
              <Input
                label="Relationship"
                value={editing.relationship || ""}
                onChange={(v) =>
                  setEditing((e) => e && { ...e, relationship: v })
                }
              />
              <Input
                label="Date of Birth"
                value={editing.date_of_birth || ""}
                type="date"
                onChange={(v) =>
                  setEditing((e) => e && { ...e, date_of_birth: v })
                }
              />
              <Input
                label="Blood Group"
                value={editing.blood_group || ""}
                onChange={(v) =>
                  setEditing((e) => e && { ...e, blood_group: v })
                }
              />
              <Input
                label="ID Number"
                value={editing.id_number || ""}
                onChange={(v) =>
                  setEditing((e) => e && { ...e, id_number: v })
                }
              />
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

function Input({
  label,
  value,
  onChange,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
}) {
  return (
    <label className="block text-xs">
      <span className="block text-[11px] text-gray-500 mb-1">{label}</span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring focus:ring-blue-100"
      />
    </label>
  );
}
