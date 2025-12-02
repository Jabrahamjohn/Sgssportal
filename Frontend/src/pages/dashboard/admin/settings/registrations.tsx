// Frontend/src/pages/dashboard/admin/settings/registrations.tsx
import React, { useEffect, useState } from "react";
import api from "~/config/api";
import Button from "~/components/controls/button";
import Alert from "~/components/controls/alert";

type MemberType = {
  id: string;
  user: {
    id: string | number;
    username: string;
    email: string;
    first_name?: string;
    last_name?: string;
  };
  membership_type?: {
    id: string;
    name: string;
    key: string;
  } | null;
  status: string;
  nhif_number?: string | null;
  mailing_address?: string | null;
  phone_mobile?: string | null;
  created_at?: string;
};

export default function RegistrationQueue() {
  const [members, setMembers] = useState<MemberType[]>([]);
  const [loading, setLoading] = useState(true);

  const [actingId, setActingId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const resetMessages = () => {
    setError("");
    setSuccess("");
  };

  const load = async () => {
    resetMessages();
    setLoading(true);

    try {
      const res = await api.get("members/");
      const rows: MemberType[] = res.data.results || res.data || [];

      const pending = rows.filter((m) => m.status === "pending");

      setMembers(pending);
    } catch (e) {
      console.error("Load registrations error:", e);
      setError("Failed to load registrations.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const approve = async (id: string) => {
    resetMessages();
    setActingId(id);

    try {
      await api.post(`members/${id}/approve/`);
      setSuccess("Member successfully approved.");
      await load();
    } catch (e: any) {
      console.error("Approve error:", e);
      setError(e.response?.data?.detail || "Approval failed.");
    } finally {
      setActingId(null);
    }
  };

  const reject = async (id: string) => {
    resetMessages();
    setActingId(id);

    try {
      await api.patch(`members/${id}/`, { status: "inactive" });
      setSuccess("Member marked as inactive.");
      await load();
    } catch (e: any) {
      console.error("Reject error:", e);
      setError(e.response?.data?.detail || "Unable to update member.");
    } finally {
      setActingId(null);
    }
  };

  return (
    <div className="space-y-5">
      <header>
        <h2 className="text-lg font-semibold">Pending Registrations</h2>
        <p className="text-xs text-gray-500">
          Approve or reject new Medical Fund registrations.
        </p>
      </header>

      {error && <Alert type="error" message={error} />}
      {success && <Alert type="success" message={success} />}

      {loading ? (
        <p className="text-sm text-gray-500">Loading…</p>
      ) : members.length === 0 ? (
        <p className="text-sm text-gray-500">No pending registrations.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm border rounded-lg overflow-hidden">
            <thead className="bg-gray-50">
              <tr className="text-left">
                <th className="px-3 py-2 border-b">Name</th>
                <th className="px-3 py-2 border-b">Email</th>
                <th className="px-3 py-2 border-b">Membership</th>
                <th className="px-3 py-2 border-b">NHIF</th>
                <th className="px-3 py-2 border-b">Phone</th>
                <th className="px-3 py-2 border-b">Address</th>
                <th className="px-3 py-2 border-b w-40 text-right">Actions</th>
              </tr>
            </thead>

            <tbody>
              {members.map((m) => {
                const fullName =
                  (m.user.first_name || m.user.last_name)
                    ? `${m.user.first_name || ""} ${m.user.last_name || ""}`.trim()
                    : m.user.username;

                return (
                  <tr key={m.id} className="border-b last:border-b-0">
                    <td className="px-3 py-2">{fullName}</td>
                    <td className="px-3 py-2 text-xs">{m.user.email}</td>
                    <td className="px-3 py-2 text-xs">
                      {m.membership_type?.name || "—"}
                    </td>
                    <td className="px-3 py-2 text-xs">{m.nhif_number || "—"}</td>
                    <td className="px-3 py-2 text-xs">{m.phone_mobile || "—"}</td>
                    <td className="px-3 py-2 text-xs truncate max-w-xs">
                      {m.mailing_address || "—"}
                    </td>

                    <td className="px-3 py-2 text-right">
                      <div className="flex gap-1 justify-end">
                        <Button
                          size="sm"
                          className="bg-emerald-600 hover:bg-emerald-700 text-white"
                          disabled={actingId === m.id}
                          onClick={() => approve(m.id)}
                        >
                          {actingId === m.id ? "…" : "Approve"}
                        </Button>

                        <Button
                          size="sm"
                          variant="outline"
                          className="border-red-500 text-red-600 hover:bg-red-50"
                          disabled={actingId === m.id}
                          onClick={() => reject(m.id)}
                        >
                          {actingId === m.id ? "…" : "Reject"}
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
