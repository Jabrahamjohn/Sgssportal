// Frontend/src/pages/dashboard/committee/applications.tsx
import React, { useEffect, useState } from "react";
import api from "~/config/api";

interface Application {
  id: string;
  user_full_name: string;
  email: string;
  membership_type_name?: string;
  status: string;
  nhif_number?: string;
  mailing_address?: string;
  phone_mobile?: string;
  benefits_from?: string | null;
  valid_from?: string | null;
  valid_to?: string | null;
}

export default function CommitteeApplicationsPage() {
  const [items, setItems] = useState<Application[]>([]);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState<Application | null>(null);
  const [membershipNumber, setMembershipNumber] = useState("");
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const fetchApps = async () => {
    setLoading(true);
    try {
      const res = await api.get("committee/members/applications/");
      setItems(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApps();
  }, []);

  const open = (app: Application) => {
    setSelected(app);
    setMembershipNumber("");
    setNote("");
  };

  const close = () => {
    setSelected(null);
    setMembershipNumber("");
    setNote("");
  };

  const act = async (action: "approve" | "reject") => {
    if (!selected) return;
    if (action === "reject" && !note.trim()) {
      if (!window.confirm("Reject without a note?")) return;
    }
    setSubmitting(true);
    try {
      const res = await api.post(
        `committee/members/applications/${selected.id}/`,
        {
          action,
          membership_number: membershipNumber || undefined,
          note: note || undefined,
        }
      );
      const updated: Application = res.data;
      setItems((prev) =>
        prev.map((m) => (m.id === updated.id ? updated : m))
      );
      close();
    } catch (e) {
      console.error(e);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Membership Applications</h1>
      </div>

      <div className="bg-white rounded-xl shadow-sm border overflow-auto">
        {loading ? (
          <div className="p-4 text-sm text-gray-500">Loading…</div>
        ) : items.length === 0 ? (
          <div className="p-4 text-sm text-gray-500">
            No pending membership applications.
          </div>
        ) : (
          <table className="min-w-full text-sm">
            <thead>
              <tr className="bg-gray-50 text-left text-xs uppercase text-gray-500">
                <th className="px-4 py-2">Applicant</th>
                <th className="px-4 py-2">Email</th>
                <th className="px-4 py-2">Membership Type</th>
                <th className="px-4 py-2">Status</th>
                <th className="px-4 py-2 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((a) => (
                <tr key={a.id} className="border-t">
                  <td className="px-4 py-2">{a.user_full_name}</td>
                  <td className="px-4 py-2">{a.email}</td>
                  <td className="px-4 py-2">
                    {a.membership_type_name || "—"}
                  </td>
                  <td className="px-4 py-2 capitalize">{a.status}</td>
                  <td className="px-4 py-2 text-right">
                    <button
                      onClick={() => open(a)}
                      className="text-xs text-blue-600 hover:underline"
                    >
                      Review
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {selected && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-40">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">
                Review Application – {selected.user_full_name}
              </h2>
              <button
                onClick={close}
                className="text-xs text-gray-500 hover:underline"
              >
                Close
              </button>
            </div>

            <div className="space-y-2 text-sm text-gray-700">
              <p>
                <span className="font-medium">Email: </span>
                {selected.email}
              </p>
              <p>
                <span className="font-medium">Membership Type: </span>
                {selected.membership_type_name || "—"}
              </p>
              <p>
                <span className="font-medium">NHIF Number: </span>
                {selected.nhif_number || "—"}
              </p>
              <p>
                <span className="font-medium">Mobile: </span>
                {selected.phone_mobile || "—"}
              </p>
              <p>
                <span className="font-medium">Address: </span>
                {selected.mailing_address || "—"}
              </p>
            </div>

            <div className="space-y-3 text-sm">
              <label className="block text-xs">
                <span className="block text-[11px] text-gray-500 mb-1">
                  Membership Number (optional)
                </span>
                <input
                  className="w-full border rounded-lg px-3 py-2 text-sm"
                  value={membershipNumber}
                  onChange={(e) => setMembershipNumber(e.target.value)}
                  placeholder="e.g. SGSS-M-000123"
                />
              </label>

              <label className="block text-xs">
                <span className="block text-[11px] text-gray-500 mb-1">
                  Note (optional, required if rejecting)
                </span>
                <textarea
                  className="w-full border rounded-lg px-3 py-2 text-sm"
                  rows={3}
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                />
              </label>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={close}
                className="px-4 py-2 text-sm rounded-lg border border-gray-200"
                disabled={submitting}
              >
                Cancel
              </button>
              <button
                onClick={() => act("reject")}
                disabled={submitting}
                className="px-4 py-2 text-sm rounded-lg bg-red-600 text-white hover:bg-red-700 disabled:opacity-50"
              >
                {submitting ? "Working…" : "Reject"}
              </button>
              <button
                onClick={() => act("approve")}
                disabled={submitting}
                className="px-4 py-2 text-sm rounded-lg bg-[#03045f] text-white hover:bg-[#021f4a] disabled:opacity-50"
              >
                {submitting ? "Working…" : "Approve"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
