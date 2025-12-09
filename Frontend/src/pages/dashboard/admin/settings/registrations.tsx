// Frontend/src/pages/dashboard/admin/settings/registrations.tsx
import React, { useEffect, useState } from "react";
import api from "~/config/api";
import Button from "~/components/controls/button";
import Alert from "~/components/controls/alert";

type MemberType = {
  id: string;
  user: {
    id?: string | number;
    username?: string;
    email?: string;
    first_name?: string;
    last_name?: string;
    full_name?: string;
  };
  membership_type?: { id: string; name: string; key: string } | null;
  status: string;
  nhif_number?: string | null;
  mailing_address?: string | null;
  phone_mobile?: string | null;
};

export default function RegistrationQueue() {
  const [members, setMembers] = useState<MemberType[]>([]);
  const [loading, setLoading] = useState(true);

  const [actingId, setActingId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const reset = () => {
    setError("");
    setSuccess("");
  };

  const load = async () => {
    reset();
    setLoading(true);

    try {
      const res = await api.get("members/");
      const rows: MemberType[] = res.data.results || res.data || [];

      setMembers(rows.filter((m) => m.status === "pending"));
    } catch (err) {
      console.error("Error loading registrations:", err);
      setError("Unable to load registrations.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const getFullName = (u: MemberType["user"]) => {
    return (
      u?.full_name ||
      `${u?.first_name || ""} ${u?.last_name || ""}`.trim() ||
      u?.username ||
      "Unknown User"
    );
  };

  const approve = async (id: string) => {
    reset();
    setActingId(id);

    try {
      await api.post(`members/${id}/approve/`);
      setSuccess("Member approved.");
      await load();
    } catch (err: any) {
      console.error("Approve error:", err);
      setError(err.response?.data?.detail || "Approval failed.");
    } finally {
      setActingId(null);
    }
  };

  const reject = async (id: string) => {
    reset();
    setActingId(id);

    try {
      await api.patch(`members/${id}/`, { status: "inactive" });
      setSuccess("Member marked as inactive.");
      await load();
    } catch (err: any) {
      console.error("Reject error:", err);
      setError(err.response?.data?.detail || "Rejection failed.");
    } finally {
      setActingId(null);
    }
  };

  return (
    <div className="space-y-5">
      <header>
        <h2 className="text-lg font-semibold">Pending Registrations</h2>
        <p className="text-xs text-gray-500">
          Approve or reject new Medical Fund applications.
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
                <th className="px-3 py-2 border-b text-right w-40">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody>
              {members.map((m) => (
                <tr key={m.id} className="border-b">
                  <td className="px-3 py-2">{getFullName(m.user)}</td>
                  <td className="px-3 py-2 text-xs">{m.user?.email || "—"}</td>
                  <td className="px-3 py-2 text-xs">
                    {m.membership_type?.name || "—"}
                  </td>
                  <td className="px-3 py-2 text-xs">{m.nhif_number || "—"}</td>
                  <td className="px-3 py-2 text-xs">{m.phone_mobile || "—"}</td>
                  <td className="px-3 py-2 text-xs">
                    {m.mailing_address || "—"}
                  </td>

                  <td className="px-3 py-2 text-right">
                    <div className="flex gap-2 justify-end">
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
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Debug – Safe to leave or remove 
      {process.env.NODE_ENV === "development" && (
        <pre className="mt-4 text-[10px] text-gray-500 bg-gray-50 p-2 rounded">
          {JSON.stringify(members, null, 2)}
        </pre>
      )} */}
    </div>
  );
}
