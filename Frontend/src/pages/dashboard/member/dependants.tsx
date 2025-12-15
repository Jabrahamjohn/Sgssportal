// Frontend/src/pages/dashboard/member/dependants.tsx
import React, { useEffect, useState } from "react";
import api from "~/config/api";
import PageTransition from "~/components/animations/PageTransition";
import Button from "~/components/controls/button";
import Input from "~/components/controls/input";
import Modal from "~/components/controls/modal";
import {
  UsersIcon,
  PencilSquareIcon,
  TrashIcon,
  PlusIcon,
  UserIcon,
  IdentificationIcon,
} from "@heroicons/react/24/outline";

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
  const [saving, setSaving] = useState(false);

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
    setSaving(true);
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
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: string) => {
    if (
      !window.confirm(
        "Are you sure you want to remove this dependant? This cannot be undone."
      )
    )
      return;
    try {
      await api.delete(`dependants/${id}/`);
      setDeps((prev) => prev.filter((d) => d.id !== id));
    } catch (e) {
      console.error(e);
    }
  };

  const updateField = (key: keyof Dependant, val: string) => {
    setEditing((prev) => (prev ? { ...prev, [key]: val } : null));
  };

  if (loading) {
    return (
      <div className="p-8 space-y-4">
        <div className="h-8 w-48 bg-gray-200 rounded animate-pulse" />
        <div className="grid md:grid-cols-2 gap-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-32 bg-gray-100 rounded-xl animate-pulse"
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <PageTransition className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[var(--sgss-navy)] tracking-tight">
            Family & Dependants
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage family members covered under your medical fund.
          </p>
        </div>
        <Button
          onClick={openNew}
          className="bg-[var(--sgss-navy)] hover:bg-[var(--sgss-gold)] text-white shadow-lg shadow-blue-900/10 flex items-center gap-2"
        >
          <PlusIcon className="w-5 h-5" />
          Add Dependant
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {deps.map((d) => (
          <div
            key={d.id}
            className="sgss-card p-6 flex flex-col justify-between group hover:border-[var(--sgss-gold)]/50 transition-colors bg-white relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-24 h-24 bg-[var(--sgss-gold)]/5 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110"></div>

            <div className="relative z-10">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center text-[var(--sgss-navy)]">
                  <UserIcon className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-[var(--sgss-navy)] text-lg leading-tight">
                    {d.full_name}
                  </h3>
                  <span className="inline-block bg-[var(--sgss-navy)]/5 text-[var(--sgss-navy)] text-xs px-2 py-0.5 rounded-full font-medium mt-1">
                    {d.relationship || "Dependant"}
                  </span>
                </div>
              </div>

              <div className="space-y-2 text-sm text-gray-600 mb-6">
                <div className="flex justify-between border-b border-gray-50 pb-1">
                  <span className="text-gray-400 text-xs uppercase tracking-wider">
                    Date of Birth
                  </span>
                  <span className="font-medium">{d.date_of_birth || "—"}</span>
                </div>
                <div className="flex justify-between border-b border-gray-50 pb-1">
                  <span className="text-gray-400 text-xs uppercase tracking-wider">
                    Blood Group
                  </span>
                  <span className="font-medium">{d.blood_group || "—"}</span>
                </div>
                <div className="flex justify-between border-b border-gray-50 pb-1">
                  <span className="text-gray-400 text-xs uppercase tracking-wider">
                    ID Number
                  </span>
                  <span className="font-medium">{d.id_number || "—"}</span>
                </div>
              </div>
            </div>

            <div className="flex gap-2 pt-2 border-t border-gray-100 relative z-10">
              <Button
                variant="outline"
                size="sm"
                onClick={() => openEdit(d)}
                className="flex-1 flex items-center justify-center gap-1"
              >
                <PencilSquareIcon className="w-4 h-4" /> Edit
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => remove(d.id)}
                className="flex-1 border-red-200 text-red-600 hover:bg-red-50 flex items-center justify-center gap-1"
              >
                <TrashIcon className="w-4 h-4" /> Remove
              </Button>
            </div>
          </div>
        ))}

        {deps.length === 0 && (
          <div className="col-span-full py-16 text-center bg-gray-50 rounded-2xl border border-dashed border-gray-200">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <UsersIcon className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-gray-900 font-medium">No dependants added</h3>
            <p className="text-gray-500 text-sm mt-1 mb-4">
              Add your family members to manage their claims.
            </p>
            <Button onClick={openNew} variant="outline" className="bg-white">
              Add Dependant
            </Button>
          </div>
        )}
      </div>

      {/* Modal using standard component */}
      {modalOpen && editing && (
        <Modal
          open={modalOpen}
          onClose={closeModal}
          title={editing.id ? "Edit Dependant" : "Add New Dependant"}
        >
          <div className="space-y-4 p-1">
            <Input
              label="Full Name"
              placeholder="e.g. John Doe Singh"
              value={editing.full_name}
              onChange={(e) => updateField("full_name", e.target.value)}
            />
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Relationship" // Could be a select, but text for now to match original
                placeholder="e.g. Spouse / Child"
                value={editing.relationship || ""}
                onChange={(e) => updateField("relationship", e.target.value)}
              />
              <Input
                label="Date of Birth"
                type="date"
                value={editing.date_of_birth || ""}
                onChange={(e) => updateField("date_of_birth", e.target.value)}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Blood Group"
                placeholder="e.g. O+"
                value={editing.blood_group || ""}
                onChange={(e) => updateField("blood_group", e.target.value)}
              />
              <Input
                label="ID Number / Birth Cert"
                placeholder="ID or Certificate No."
                value={editing.id_number || ""}
                onChange={(e) => updateField("id_number", e.target.value)}
              />
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 mt-4">
              <Button variant="outline" onClick={closeModal}>
                Cancel
              </Button>
              <Button
                onClick={save}
                disabled={saving || !editing.full_name}
                className="bg-[var(--sgss-navy)] hover:bg-[var(--sgss-gold)] text-white"
              >
                {saving ? "Saving..." : "Save Dependant"}
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </PageTransition>
  );
}
