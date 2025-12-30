// Frontend/src/pages/dashboard/committee/claims-table.tsx
import React, { useEffect, useState } from "react";
import Badge from "~/components/controls/badge";
import {
  listCommitteeClaims,
  type CommitteeClaimRow,
} from "~/server/services/claim.service";

export default function ClaimsTable() {
  const [data, setData] = useState<CommitteeClaimRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState("");
  const [type, setType] = useState("");
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    listCommitteeClaims({ status, type, q: query })
      .then((rows: CommitteeClaimRow[]) => setData(rows))
      .finally(() => setLoading(false));
  }, [status, type, query]);

  const statusColor = (s: string) => {
    switch (s) {
      case "approved":
        return "success";
      case "rejected":
        return "danger";
      case "paid":
        return "success";
      case "reviewed":
        return "info";
      default:
        return "warning";
    }
  };

  if (loading) {
    return <div className="p-4">Loading…</div>;
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="grid gap-3 md:grid-cols-3 mb-2">
        <select
          className="border p-2 rounded"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          aria-label="Filter by status"
        >
          <option value="">All Status</option>
          <option value="submitted">Submitted</option>
          <option value="reviewed">Reviewed</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
          <option value="paid">Paid</option>
        </select>

        <select
          className="border p-2 rounded"
          value={type}
          onChange={(e) => setType(e.target.value)}
          aria-label="Filter by type"
        >
          <option value="">All Types</option>
          <option value="outpatient">Outpatient</option>
          <option value="inpatient">Inpatient</option>
          <option value="chronic">Chronic</option>
        </select>

        <input
          className="border p-2 rounded"
          placeholder="Search member name / username / SHIF/SHA…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      {/* Stats row */}
      <div className="flex flex-wrap gap-4 p-3 bg-gray-100 rounded text-sm">
        <div>Total Claims: {data.length}</div>
        <div>
          Approved: {data.filter((x) => x.status === "approved").length}
        </div>
        <div>
          Submitted: {data.filter((x) => x.status === "submitted").length}
        </div>
        <div>Paid: {data.filter((x) => x.status === "paid").length}</div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-[800px] w-full border rounded bg-white">
          <thead className="bg-gray-50">
            <tr>
              <th className="p-2 text-left">Member</th>
              <th className="p-2 text-left">Type</th>
              <th className="p-2 text-left">Total Claimed</th>
              <th className="p-2 text-left">Fund Payable</th>
              <th className="p-2 text-left">Member Share</th>
              <th className="p-2 text-left">Status</th>
              <th className="p-2 text-left">Created</th>
            </tr>
          </thead>
          <tbody>
            {data.map((c) => (
              <tr
                key={c.id}
                className="border-t hover:bg-blue-50 cursor-pointer"
                onClick={() => setSelectedId(c.id)}
              >
                <td className="p-2">
                  {c.member_name}
                  {c.membership_type && (
                    <span className="ml-1 text-xs text-gray-500">
                      ({c.membership_type})
                    </span>
                  )}
                </td>
                <td className="p-2 capitalize">{c.claim_type}</td>
                <td className="p-2">
                  Ksh {Number(c.total_claimed).toLocaleString()}
                </td>
                <td className="p-2">
                  Ksh {Number(c.total_payable).toLocaleString()}
                </td>
                <td className="p-2">
                  Ksh {Number(c.member_payable).toLocaleString()}
                </td>
                <td className="p-2">
                  <Badge variant={statusColor(c.status)}>{c.status}</Badge>
                </td>
                <td className="p-2">
                  {new Date(c.created_at).toLocaleDateString()}
                </td>
              </tr>
            ))}
            {!data.length && (
              <tr>
                <td className="p-3 text-gray-500" colSpan={7}>
                  No claims found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
