// Frontend/src/pages/dashboard/committee/claims-table.tsx
import React, { useEffect, useState } from "react";
import api from "~/config/api";
import { Link } from "react-router-dom";
import { Button } from "~/components/controls/table/components";

export default function ClaimsTable() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  const [status, setStatus] = useState("");
  const [type, setType] = useState("");
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<string[]>([]);

  const toggle = (id: string) => {
    setSelected((s) =>
      s.includes(id) ? s.filter((x) => x !== id) : [...s, id]
    );
  };

  async function bulkChange(status: string) {
  await api.post("claims/bulk_status/", { ids: selected, status });
  window.location.reload();
  }



  const fetchData = () => {
    api
      .get("claims/committee/", {
        params: {
          status: status || undefined,
          type: type || undefined,
          q: query || undefined,
        },
      })
      .then((res) => setData(res.data.results))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchData();
  }, [status, type, query]);

  if (loading) return <div className="p-4">Loading…</div>;

  return (
    <div className="space-y-6">

      {/* FILTER BAR */}
      <div className="grid grid-cols-3 gap-3">
        <select
          className="border p-2"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
        >
          <option value="">All Status</option>
          <option value="submitted">Submitted</option>
          <option value="reviewed">Reviewed</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
          <option value="paid">Paid</option>
        </select>

        <select
          className="border p-2"
          value={type}
          onChange={(e) => setType(e.target.value)}
        >
          <option value="">All Types</option>
          <option value="outpatient">Outpatient</option>
          <option value="inpatient">Inpatient</option>
          <option value="chronic">Chronic</option>
        </select>

        <input
          className="border p-2"
          placeholder="Search member or claim ID…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      {/* SUMMARY BAR */}
      <div className="flex gap-6 p-3 bg-gray-100 rounded text-sm">
        <div>Total: {data.length}</div>
        <div>Approved: {data.filter((x) => x.status === "approved").length}</div>
        <div>Pending: {data.filter((x) => x.status === "submitted").length}</div>
        <div>Paid: {data.filter((x) => x.status === "paid").length}</div>
      </div>

      {/* TABLE */}
      <div className="overflow-x-auto">
        <table className="min-w-[900px] w-full border rounded">
          <thead className="bg-gray-50">
            <tr>
              <th className="p-2 text-left">Member</th>
              <th className="p-2 text-left">Type</th>
              <th className="p-2 text-left">Total</th>
              <th className="p-2 text-left">Payable</th>
              <th className="p-2 text-left">Status</th>
              <th className="p-2 text-left">Created</th>
              <th className="p-2 text-left">Action</th>
            </tr>
          </thead>
          <tbody>
            {data.map((c) => (
              <tr key={c.id} className="border-t hover:bg-blue-50">
                <td>
                  <input
                    type="checkbox"
                    checked={selected.includes(c.id)}
                    onChange={() => toggle(c.id)}
                  />
                </td>
                <td className="p-2">{c.member_name}</td>
                <td className="p-2 capitalize">{c.claim_type}</td>
                <td className="p-2">Ksh {Number(c.total_claimed).toLocaleString()}</td>
                <td className="p-2">Ksh {Number(c.total_payable).toLocaleString()}</td>
                <td className="p-2">{c.status}</td>
                <td className="p-2">
                  {new Date(c.created_at).toLocaleDateString()}
                </td>
                <td className="p-2">
                  <Link
                    to={`/dashboard/committee/claims/${c.id}`}
                    className="text-blue-600 hover:underline"
                  >
                    View
                  </Link>
                </td>
              </tr>
            ))}

            {!data.length && (
              <tr>
                <td colSpan={7} className="p-4 text-center text-gray-500">
                  No claims match your filters
                </td>
              </tr>
            )}
          </tbody>
        </table>
        <div className="flex gap-3 my-3">
          <Button
            onClick={() => bulkChange("approved")}
            disabled={!selected.length}
          >
            Approve Selected
          </Button>

          <Button
            variant="danger"
            onClick={() => bulkChange("rejected")}
            disabled={!selected.length}
          >
            Reject Selected
          </Button>
        </div>
            
      </div>
    </div>
  );
}
