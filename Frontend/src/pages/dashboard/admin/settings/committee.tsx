// Frontend/src/pages/dashboard/admin/settings/committee.tsx
import React, { useEffect, useState } from "react";
import api from "~/config/api";
import Alert from "~/components/controls/alert";

type CommitteeUser = {
  id: number | string;
  username: string;
  full_name: string;
  email: string;
  is_superuser: boolean;
};

export default function CommitteeSettings() {
  const [members, setMembers] = useState<CommitteeUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = async () => {
    setError("");
    setLoading(true);
    try {
      const res = await api.get("admin/committee-members/");
      setMembers(res.data.results || []);
    } catch (e) {
      console.error(e);
      setError(
        "Failed to load committee members. For now you can manage them via Django Admin > Groups."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold">Committee Management</h2>
        <p className="text-xs text-gray-500">
          View current members of the Medical Fund Committee. Membership to this
          group controls access to claim approvals, member approvals and
          committee dashboards.
        </p>
      </div>

      {error && <Alert type="error" message={error} />}

      <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 text-xs text-blue-900">
        <p className="font-semibold mb-1">How to change committee members:</p>
        <ol className="list-decimal list-inside space-y-1">
          <li>Open Django Admin &gt; Authentication &gt; Groups.</li>
          <li>Select the <strong>Committee</strong> group.</li>
          <li>Add/remove users from the group membership.</li>
          <li>Those users will see the Committee dashboard and actions.</li>
        </ol>
      </div>

      {loading ? (
        <p className="text-sm text-gray-500">Loading committee members…</p>
      ) : members.length === 0 ? (
        <p className="text-sm text-gray-500">
          No committee members found in the "Committee" group.
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm border border-gray-100 rounded-lg overflow-hidden">
            <thead className="bg-gray-50">
              <tr className="text-left">
                <th className="px-3 py-2 border-b">Name</th>
                <th className="px-3 py-2 border-b">Username</th>
                <th className="px-3 py-2 border-b">Email</th>
                <th className="px-3 py-2 border-b">Role</th>
              </tr>
            </thead>
            <tbody>
              {members.map((m) => (
                <tr key={m.id} className="border-b last:border-b-0">
                  <td className="px-3 py-2">{m.full_name}</td>
                  <td className="px-3 py-2 text-xs text-gray-700">
                    {m.username}
                  </td>
                  <td className="px-3 py-2 text-xs text-gray-700">
                    {m.email}
                  </td>
                  <td className="px-3 py-2 text-xs">
                    {m.is_superuser ? (
                      <span className="inline-flex items-center rounded-full bg-red-50 px-2 py-0.5 text-[11px] text-red-700 border border-red-100">
                        Admin
                      </span>
                    ) : (
                      <span className="inline-flex items-center rounded-full bg-amber-50 px-2 py-0.5 text-[11px] text-amber-700 border border-amber-100">
                        Committee
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
