// Frontend/src/pages/dashboard/committee/claims.tsx
import React, { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import api from "~/config/api";

interface CommitteeClaim {
  id: string;
  member_name: string;
  membership_type: string | null;
  claim_type: string;
  status: string;
  total_claimed: string;
  total_payable: string;
  member_payable: string;
  created_at: string;
  submitted_at: string | null;
}

const statusOptions = [
  { value: "", label: "All" },
  { value: "submitted", label: "Submitted" },
  { value: "reviewed", label: "Reviewed" },
  { value: "approved", label: "Approved" },
  { value: "rejected", label: "Rejected" },
  { value: "paid", label: "Paid" },
];

const typeOptions = [
  { value: "", label: "All" },
  { value: "outpatient", label: "Outpatient" },
  { value: "inpatient", label: "Inpatient" },
  { value: "chronic", label: "Chronic" },
];

export default function CommitteeClaimsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [claims, setClaims] = useState<CommitteeClaim[]>([]);
  const [loading, setLoading] = useState(false);

  const [status, setStatus] = useState(searchParams.get("status") || "submitted");
  const [cType, setCType] = useState(searchParams.get("type") || "");
  const [q, setQ] = useState(searchParams.get("q") || "");

  const fetchClaims = async () => {
    setLoading(true);
    try {
      const res = await api.get("claims/committee/", {
        params: {
          status: status || undefined,
          type: cType || undefined,
          q: q || undefined,
        },
      });
      // You have two versions of committee_claims; we are assuming the JSON shape:
      // { results: [...] }
      const data = res.data.results || res.data;
      setClaims(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClaims();
  }, [status, cType]);

  const submitFilters = (e: React.FormEvent) => {
    e.preventDefault();
    const params: any = {};
    if (status) params.status = status;
    if (cType) params.type = cType;
    if (q) params.q = q;
    setSearchParams(params, { replace: true });
    fetchClaims();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Claims (Committee)</h1>
      </div>

      <form
        onSubmit={submitFilters}
        className="bg-white rounded-xl shadow-sm border p-4 grid md:grid-cols-4 gap-3 text-sm"
      >
        <div>
          <label className="block text-[11px] text-gray-500 mb-1">
            Status
          </label>
          <select
            className="w-full border rounded-lg px-2 py-2"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
          >
            {statusOptions.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-[11px] text-gray-500 mb-1">
            Type
          </label>
          <select
            className="w-full border rounded-lg px-2 py-2"
            value={cType}
            onChange={(e) => setCType(e.target.value)}
          >
            {typeOptions.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-[11px] text-gray-500 mb-1">
            Member / NHIF search
          </label>
          <input
            className="w-full border rounded-lg px-3 py-2"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Name, username, NHIF..."
          />
        </div>
        <div className="flex items-end justify-end gap-2">
          <button
            type="submit"
            className="px-4 py-2 rounded-lg bg-[#03045f] text-white text-sm"
          >
            Apply Filters
          </button>
        </div>
      </form>

      <div className="bg-white rounded-xl shadow-sm border overflow-auto">
        {loading ? (
          <div className="p-4 text-sm text-gray-500">Loading…</div>
        ) : claims.length === 0 ? (
          <div className="p-4 text-sm text-gray-500">
            No claims match current filters.
          </div>
        ) : (
          <table className="min-w-full text-sm">
            <thead>
              <tr className="bg-gray-50 text-left text-xs uppercase text-gray-500">
                <th className="px-4 py-2">Ref</th>
                <th className="px-4 py-2">Member</th>
                <th className="px-4 py-2">Type</th>
                <th className="px-4 py-2">Status</th>
                <th className="px-4 py-2">Total</th>
                <th className="px-4 py-2">Fund Payable</th>
                <th className="px-4 py-2">Submitted</th>
                <th className="px-4 py-2 text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {claims.map((c) => (
                <tr key={c.id} className="border-t">
                  <td className="px-4 py-2 text-xs text-gray-500">
                    {c.id.slice(0, 8)}
                  </td>
                  <td className="px-4 py-2">
                    <div className="font-medium">{c.member_name}</div>
                    <div className="text-[11px] text-gray-500">
                      {c.membership_type || "—"}
                    </div>
                  </td>
                  <td className="px-4 py-2 capitalize">{c.claim_type}</td>
                  <td className="px-4 py-2">
                    <span className="inline-flex px-2 py-0.5 rounded-full text-[11px] bg-yellow-100 text-yellow-800 capitalize">
                      {c.status}
                    </span>
                  </td>
                  <td className="px-4 py-2">Ksh {c.total_claimed}</td>
                  <td className="px-4 py-2">Ksh {c.total_payable}</td>
                  <td className="px-4 py-2 text-xs">
                    {c.submitted_at
                      ? new Date(c.submitted_at).toLocaleDateString()
                      : "—"}
                  </td>
                  <td className="px-4 py-2 text-right">
                    <Link
                      to={`/dashboard/committee/claims/${c.id}`}
                      className="text-xs text-blue-600 hover:underline"
                    >
                      Open
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
