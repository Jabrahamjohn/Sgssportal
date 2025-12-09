// Frontend/src/pages/dashboard/committee/members.tsx
import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "~/config/api";
import Button from "~/components/controls/button";
import Skeleton from "~/components/loader/skeleton";

type MemberRow = {
  id: string;
  user: {
    username?: string;
    email?: string;
    first_name?: string;
    last_name?: string;
    full_name?: string;
  };
  membership_type?: {
    name: string;
    key: string;
  } | null;
  status: string;
  nhif_number?: string | null;
  valid_from?: string | null;
  valid_to?: string | null;
};

export default function CommitteeMembersPage() {
  const { id: highlightId } = useParams();
  const nav = useNavigate();

  const [statusFilter, setStatusFilter] = useState<"pending" | "active" | "all">(
    "pending"
  );
  const [loading, setLoading] = useState(true);
  const [members, setMembers] = useState<MemberRow[]>([]);
  const [actingId, setActingId] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const params: any = {};
      if (statusFilter !== "all") params.status = statusFilter;

      const res = await api.get("members/", { params });
      setMembers(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Error loading members:", err);
      setMembers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [statusFilter]);

  const approve = async (memberId: string) => {
    if (!window.confirm("Approve this membership?")) return;
    setActingId(memberId);
    try {
      await api.post(`members/${memberId}/approve/`);
      await load();
    } catch (err) {
      console.error("Approval failed:", err);
      alert("Unable to approve member.");
    } finally {
      setActingId(null);
    }
  };

  const getFullName = (u: MemberRow["user"]) => {
    return (
      u?.full_name ||
      `${u?.first_name || ""} ${u?.last_name || ""}`.trim() ||
      u?.username ||
      "Unknown User"
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <header className="flex flex-col md:flex-row md:justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold text-[var(--sgss-navy)]">
            Committee – Membership Review
          </h2>
          <p className="text-xs text-gray-500">
            Review & approve Medical Fund members.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <label className="text-xs text-gray-600">Status:</label>
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
      </header>

      {/* Table */}
      <div className="sgss-card overflow-x-auto">
        {loading ? (
          <div className="space-y-2">
            <Skeleton className="h-6 w-40" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        ) : members.length === 0 ? (
          <p className="text-sm text-gray-600">No members found.</p>
        ) : (
          <table className="min-w-full text-sm">
            <thead>
              <tr className="text-left uppercase text-xs text-gray-500 border-b">
                <th className="py-2 pr-4">Name</th>
                <th className="py-2 pr-4">Email</th>
                <th className="py-2 pr-4">Membership</th>
                <th className="py-2 pr-4">NHIF</th>
                <th className="py-2 pr-4">Status</th>
                <th className="py-2 pr-4">Validity</th>
                <th className="py-2 pr-4 text-right">Actions</th>
              </tr>
            </thead>

            <tbody>
              {members.map((m) => {
                const highlight = highlightId === m.id;

                return (
                  <tr
                    key={m.id}
                    className={`border-b ${highlight ? "bg-amber-50" : ""}`}
                  >
                    <td className="py-2">{getFullName(m.user)}</td>
                    <td className="py-2">{m.user?.email || "—"}</td>
                    <td className="py-2">{m.membership_type?.name || "—"}</td>
                    <td className="py-2">{m.nhif_number || "—"}</td>

                    <td className="py-2">
                      <StatusBadge status={m.status} />
                    </td>

                    <td className="py-2 text-xs">
                      {m.valid_from
                        ? `${new Date(m.valid_from).toLocaleDateString()} → ${
                            m.valid_to
                              ? new Date(m.valid_to).toLocaleDateString()
                              : "—"
                          }`
                        : "Pending"}
                    </td>

                    <td className="py-2 text-right">
                      {m.status === "pending" && (
                        <Button
                          size="sm"
                          disabled={actingId === m.id}
                          onClick={() => approve(m.id)}
                          className="bg-emerald-600 hover:bg-emerald-700 text-white"
                        >
                          {actingId === m.id ? "Approving…" : "Approve"}
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

      {/* Back Button */}
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
  const s = status?.toLowerCase();
  const map: Record<string, string> = {
    pending: "bg-yellow-100 text-yellow-800",
    active: "bg-emerald-100 text-emerald-800",
    rejected: "bg-red-100 text-red-800",
  };

  return (
    <span
      className={`px-2 py-0.5 rounded-full text-xs font-medium ${
        map[s] || "bg-gray-100 text-gray-700"
      }`}
    >
      {status}
    </span>
  );
}
