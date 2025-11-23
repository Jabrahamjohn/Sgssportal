import React, { useEffect, useState } from "react";
import api from "~/config/api";
import Badge from "~/components/controls/badge";
import Button from "~/components/controls/button";
import { Link, useNavigate } from "react-router-dom";
import {
  EyeIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  DocumentMagnifyingGlassIcon,
} from "@heroicons/react/24/outline";

type ClaimRow = {
  id: string;
  claim_type: string;
  status: string;
  total_claimed: number;
  total_payable: number;
  member_payable: number;
  submitted_at: string | null;
  member_user_email?: string;
};

export default function CommitteeClaimsPage() {
  const [claims, setClaims] = useState<ClaimRow[]>([]);
  const [loading, setLoading] = useState(true);
  const nav = useNavigate();

  useEffect(() => {
    api
      .get("claims/")
      .then((res) => setClaims(res.data || []))
      .finally(() => setLoading(false));
  }, []);

  const statusColor = (status: string) => {
    const s = status.toLowerCase();
    if (s === "approved" || s === "paid") return "success";
    if (s === "rejected") return "danger";
    if (s === "reviewed") return "warning";
    return "info";
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-7 w-48 bg-gray-200 rounded animate-pulse" />
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="h-16 bg-gray-100 rounded-lg animate-pulse"
          />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-[#03045f]">
            All Claims (Committee)
          </h2>
          <p className="text-sm text-gray-600">
            Review, approve or reject member claims according to SGSS Byelaws.
          </p>
        </div>
        <Button variant="outline" onClick={() => nav("/dashboard/committee")}>
          Back to Dashboard
        </Button>
      </div>

      {/* Desktop table */}
      <div className="hidden md:block border rounded-lg bg-white shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gradient-to-r from-[#03045f] to-[#0b2f7c] text-white">
            <tr>
              <th className="px-4 py-3 text-left">Claim ID</th>
              <th className="px-4 py-3 text-left">Member</th>
              <th className="px-4 py-3 text-left">Type</th>
              <th className="px-4 py-3 text-left">Status</th>
              <th className="px-4 py-3 text-right">Total Claimed</th>
              <th className="px-4 py-3 text-right">Fund Payable</th>
              <th className="px-4 py-3 text-right">Member Share</th>
              <th className="px-4 py-3 text-left">Submitted</th>
              <th className="px-4 py-3 text-center">Action</th>
            </tr>
          </thead>
          <tbody>
            {claims.map((c) => (
              <tr
                key={c.id}
                className="border-t hover:bg-gray-50 transition-colors"
              >
                <td className="px-4 py-3 font-mono text-xs">
                  {String(c.id).slice(0, 8)}…
                </td>
                <td className="px-4 py-3 text-xs">
                  {c.member_user_email || "N/A"}
                </td>
                <td className="px-4 py-3 capitalize">{c.claim_type}</td>
                <td className="px-4 py-3">
                  <Badge variant={statusColor(c.status)}>{c.status}</Badge>
                </td>
                <td className="px-4 py-3 text-right">
                  Ksh {Number(c.total_claimed || 0).toLocaleString()}
                </td>
                <td className="px-4 py-3 text-right">
                  Ksh {Number(c.total_payable || 0).toLocaleString()}
                </td>
                <td className="px-4 py-3 text-right">
                  Ksh {Number(c.member_payable || 0).toLocaleString()}
                </td>
                <td className="px-4 py-3 text-xs text-gray-600">
                  {c.submitted_at
                    ? new Date(c.submitted_at).toLocaleString()
                    : "Pending"}
                </td>
                <td className="px-4 py-3 text-center">
                  <Link
                    to={`/dashboard/committee/claims/${c.id}`}
                    className="inline-flex items-center gap-1 text-[#03045f] hover:text-[#caa631] text-xs font-semibold"
                  >
                    <DocumentMagnifyingGlassIcon className="w-4 h-4" />
                    Review
                  </Link>
                </td>
              </tr>
            ))}

            {!claims.length && (
              <tr>
                <td
                  colSpan={9}
                  className="px-4 py-6 text-center text-gray-500 text-sm"
                >
                  No claims in the system yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile cards */}
      <div className="md:hidden space-y-3">
        {claims.map((c) => (
          <div
            key={c.id}
            className="rounded-lg border bg-white shadow-sm p-4 flex flex-col gap-2"
          >
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs text-gray-500">
                  Claim ID:{" "}
                  <span className="font-mono">
                    {String(c.id).slice(0, 8)}…
                  </span>
                </p>
                <p className="text-xs text-gray-600">
                  {c.member_user_email || "Member"}
                </p>
                <p className="text-sm font-semibold capitalize mt-1">
                  {c.claim_type} claim
                </p>
              </div>
              <Badge variant={statusColor(c.status)}>{c.status}</Badge>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs mt-1">
              <div>
                <strong>Claimed:</strong>{" "}
                Ksh {Number(c.total_claimed || 0).toLocaleString()}
              </div>
              <div>
                <strong>Fund:</strong>{" "}
                Ksh {Number(c.total_payable || 0).toLocaleString()}
              </div>
              <div>
                <strong>Member:</strong>{" "}
                Ksh {Number(c.member_payable || 0).toLocaleString()}
              </div>
              <div className="flex items-center gap-1">
                <ClockIcon className="w-4 h-4 text-gray-500" />
                <span>
                  {c.submitted_at
                    ? new Date(c.submitted_at).toLocaleDateString()
                    : "Pending"}
                </span>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <Button
                size="small"
                variant="outline"
                onClick={() => nav(`/dashboard/committee/claims/${c.id}`)}
              >
                <EyeIcon className="w-4 h-4 mr-1" />
                Review
              </Button>
            </div>
          </div>
        ))}

        {!claims.length && (
          <p className="text-sm text-center text-gray-500">
            No claims available yet.
          </p>
        )}
      </div>
    </div>
  );
}
