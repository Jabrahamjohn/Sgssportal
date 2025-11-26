// Frontend/src/pages/dashboard/admin/settings/registrations.tsx
import React, { useEffect, useState } from "react";
import api from "~/config/api";
import Button from "~/components/controls/button";
import Alert from "~/components/controls/alert";

type MemberType = {
  id: string;
  user: {
    id: number | string;
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
  status: "pending" | "active" | "inactive" | string;
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

  const resetStatus = () => {
    setError("");
    setSuccess("");
  };

  const load = async () => {
    resetStatus();
    setLoading(true);
    try {
      const res = await api.get("members/");
      const all: MemberType[] = res.data;
      // filter pending in frontend for now
      const pending = all.filter((m) => m.status === "pending");
      setMembers(pending);
    } catch (e) {
      console.error(e);
      setError("Failed to load member registrations.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const approve = async (id: string) => {
    resetStatus();
    setActingId(id);
    try {
      await api.post(`members/${id}/approve/`, {});
      setSuccess("Membership approved.");
      await load();
    } catch (e: any) {
      console.error(e);
      setError(
        e.response?.data?.detail ||
          "Failed to approve member. Please check Byelaw constraints."
      );
    } finally {
      setActingId(null);
    }
  };

  // Simple "reject" = patch status to inactive
  const reject = async (id: string) => {
    resetStatus();
    setActingId(id);
    try {
      await api.patch(`members/${id}/`, { status: "inactive" });
      setSuccess("Membership marked as inactive / rejected.");
      await load();
    } catch (e: any) {
      console.error(e);
      setError(
        e.response?.data?.detail ||
          "Failed to update member status. Ensure admin permissions."
      );
    } finally {
      setActingId(null);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold">Pending Member Registrations</h2>
        <p className="text-xs text-gray-500">
          Prospective members who have registered via the public form appear here
          in <strong>Pending</strong> state. Approvals activate their coverage
          according to the Constitution and Byelaws.
        </p>
      </div>

      {error && <Alert type="error" message={error} />}
      {success && <Alert type="success" message={success} />}

      {loading ? (
        <p className="text-sm text-gray-500">Loading pending registrations…</p>
      ) : members.length === 0 ? (
        <p className="text-sm text-gray-500">
          No pending registrations at the moment.
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm border border-gray-100 rounded-lg overflow-hidden">
            <thead className="bg-gray-50">
              <tr className="text-left">
                <th className="px-3 py-2 border-b">Name</th>
                <th className="px-3 py-2 border-b">Email</th>
                <th className="px-3 py-2 border-b">Membership Type</th>
                <th className="px-3 py-2 border-b">NHIF</th>
                <th className="px-3 py-2 border-b">Phone</th>
                <th className="px-3 py-2 border-b">Address</th>
                <th className="px-3 py-2 border-b w-40">Actions</th>
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
                    <td className="px-3 py-2 text-xs text-gray-700">
                      {m.user.email}
                    </td>
                    <td className="px-3 py-2 text-xs">
                      {m.membership_type?.name || "Not specified"}
                    </td>
                    <td className="px-3 py-2 text-xs">
                      {m.nhif_number || "—"}
                    </td>
                    <td className="px-3 py-2 text-xs">
                      {m.phone_mobile || "—"}
                    </td>
                    <td className="px-3 py-2 text-xs max-w-xs truncate">
                      {m.mailing_address || "—"}
                    </td>
                    <td className="px-3 py-2">
                      <div className="flex flex-wrap gap-1">
                        <Button
                          size="sm"
                          className="bg-emerald-600 hover:bg-emerald-700 text-white"
                          disabled={actingId === m.id}
                          onClick={() => approve(m.id)}
                        >
                          {actingId === m.id ? "Approving…" : "Approve"}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-red-500 text-red-600 hover:bg-red-50"
                          disabled={actingId === m.id}
                          onClick={() => reject(m.id)}
                        >
                          {actingId === m.id ? "Updating…" : "Reject"}
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
