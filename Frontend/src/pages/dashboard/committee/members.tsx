// Frontend/src/pages/dashboard/committee/members.tsx
import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "~/config/api";
import Button from "~/components/controls/button";
import Skeleton from "~/components/loader/skeleton";

type MemberRow = {
  id: string;
  user: {
    username: string;
    email: string;
    full_name: string;
  };
  membership_type: {
    name: string;
    key: string;
  } | null;
  status: string;
  nhif_number: string | null;
  valid_from: string | null;
  valid_to: string | null;
};

export default function CommitteeMembersPage() {
  const { id: highlightId } = useParams();
  const nav = useNavigate();
  const [statusFilter, setStatusFilter] = useState<"pending" | "active" | "all">(
    "pending"
  );
  const [loading, setLoading] = useState(true);
  const [list, setList] = useState<MemberRow[]>([]);
  const [actingId, setActingId] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const params: any = {};
      if (statusFilter !== "all") params.status = statusFilter;

      const res = await api.get("members/", { params });
      setList(res.data);
    } catch (e) {
      console.error(e);
      setList([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter]);

  const approveMember = async (memberId: string) => {
    if (!window.confirm("Approve this membership?")) return;
    setActingId(memberId);
    try {
      await api.post(`members/${memberId}/approve/`);
      await load();
    } catch (e) {
      console.error(e);
      alert("Failed to approve member. Check backend logs.");
    } finally {
      setActingId(null);
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold text-[var(--sgss-navy)]">
            Membership Applications
          </h2>
          <p className="text-xs text-gray-500">
            Review and approve new Medical Fund members in line with the
            Constitution &amp; Byelaws.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <label className="text-xs font-medium text-gray-600">Status:</label>
          <select
            className="border rounded px-2 py-1 text-sm"
            value={statusFilter}
            onChange={(e) =>
              setStatusFilter(e.target.value as "pending" | "active" | "all")
            }
          >
            <option value="pending">Pending</option>
            <option value="active">Active</option>
            <option value="all">All</option>
          </select>
        </div>
      </div>

      <div className="sgss-card overflow-x-auto">
        {loading ? (
          <div className="space-y-2">
            <Skeleton className="h-6 w-40" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        ) : list.length === 0 ? (
          <p className="text-sm text-gray-600">
            No members found for this status.
          </p>
        ) : (
          <table className="min-w-full text-sm">
            <thead>
              <tr className="text-left text-xs uppercase text-gray-500 border-b">
                <th className="py-2 pr-4">Name</th>
                <th className="py-2 pr-4">Email</th>
                <th className="py-2 pr-4">Membership Type</th>
                <th className="py-2 pr-4">NHIF</th>
                <th className="py-2 pr-4">Status</th>
                <th className="py-2 pr-4">Validity</th>
                <th className="py-2 pr-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {list.map((m) => {
                const isHighlight = highlightId && highlightId === m.id;
                return (
                  <tr
                    key={m.id}
                    className={`border-b last:border-b-0 ${
                      isHighlight ? "bg-amber-50" : ""
                    }`}
                  >
                    <td className="py-2 pr-4">
                      {m.user.full_name || m.user.username}
                    </td>
                    <td className="py-2 pr-4">{m.user.email}</td>
                    <td className="py-2 pr-4">
                      {m.membership_type?.name || "—"}
                    </td>
                    <td className="py-2 pr-4">
                      {m.nhif_number || <span className="text-gray-400">—</span>}
                    </td>
                    <td className="py-2 pr-4">
                      <StatusBadge status={m.status} />
                    </td>
                    <td className="py-2 pr-4 text-xs">
                      {m.valid_from
                        ? `${new Date(m.valid_from).toLocaleDateString()} – ${
                            m.valid_to
                              ? new Date(m.valid_to).toLocaleDateString()
                              : "—"
                          }`
                        : "Pending"}
                    </td>
                    <td className="py-2 pr-4 text-right">
                      {m.status === "pending" && (
                        <Button
                          size="sm"
                          disabled={actingId === m.id}
                          onClick={() => approveMember(m.id)}
                          className="bg-emerald-600 hover:bg-emerald-700 text-white"
                        >
                          {actingId === m.id ? "Approving..." : "Approve"}
                        </Button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      <button
        className="text-xs text-[var(--sgss-navy)] underline"
        onClick={() => nav(-1)}
      >
        ← Back
      </button>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const s = (status || "").toLowerCase();
  let cls = "bg-gray-100 text-gray-700";

  if (s === "pending") cls = "bg-yellow-100 text-yellow-800";
  else if (s === "active") cls = "bg-emerald-100 text-emerald-800";
  else if (s === "rejected") cls = "bg-red-100 text-red-800";

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${cls}`}
    >
      {status}
    </span>
  );
}
