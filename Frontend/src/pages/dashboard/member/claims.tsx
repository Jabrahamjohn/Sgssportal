// Frontend/src/pages/dashboard/member/claims.tsx
import React, { useEffect, useState } from "react";
import api from "~/config/api";
import Button from "~/components/controls/button";
import Badge from "~/components/controls/badge";
import { useNavigate, Link } from "react-router-dom";
import {
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  CurrencyDollarIcon,
  EyeIcon,
} from "@heroicons/react/24/outline";

type Claim = {
  id: string;
  claim_type: string;
  status: string;
  total_claimed: number;
  total_payable: number;
  member_payable: number;
  submitted_at: string | null;
};

export default function MemberClaimsList() {
  const [claims, setClaims] = useState<Claim[]>([]);
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
        <div className="h-7 w-40 bg-gray-200 rounded animate-pulse" />
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="h-16 bg-gray-100 rounded-lg animate-pulse"
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-[#03045f]">
            My Claims
          </h2>
          <p className="text-sm text-gray-600">
            View all claims submitted under your SGSS Medical Fund membership.
          </p>
        </div>
        <Button
          onClick={() => nav("/dashboard/member/claims/new")}
          className="bg-[var(--sgss-navy)] hover:bg-[var(--sgss-gold)] text-white">
          + New Claim
        </Button>
      </div>

      {/* Desktop TABLE view */}
      <div className="hidden md:block border rounded-lg bg-white shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gradient-to-r from-[#03045f] to-[#0b2f7c] text-white">
            <tr>
              <th className="px-4 py-3 text-left">Claim ID</th>
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
                    to={`/dashboard/member/claims/${c.id}`}
                    className="inline-flex items-center gap-1 text-[#03045f] hover:text-[#caa631] text-xs font-semibold"
                  >
                    <EyeIcon className="w-4 h-4" />
                    View
                  </Link>
                </td>
              </tr>
            ))}

            {!claims.length && (
              <tr>
                <td
                  colSpan={8}
                  className="px-4 py-6 text-center text-gray-500 text-sm"
                >
                  You have not submitted any claims yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile CARDS view */}
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
                <p className="text-sm font-semibold capitalize">
                  {c.claim_type} claim
                </p>
              </div>
              <Badge variant={statusColor(c.status)}>{c.status}</Badge>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs mt-1">
              <div className="flex items-center gap-1">
                <CurrencyDollarIcon className="w-4 h-4 text-[#03045f]" />
                <span>
                  <strong>Claimed:</strong>{" "}
                  Ksh {Number(c.total_claimed || 0).toLocaleString()}
                </span>
              </div>
              <div className="flex items-center gap-1">
                <CheckCircleIcon className="w-4 h-4 text-emerald-600" />
                <span>
                  <strong>Fund:</strong>{" "}
                  Ksh {Number(c.total_payable || 0).toLocaleString()}
                </span>
              </div>
              <div className="flex items-center gap-1">
                <XCircleIcon className="w-4 h-4 text-red-500" />
                <span>
                  <strong>Member:</strong>{" "}
                  Ksh {Number(c.member_payable || 0).toLocaleString()}
                </span>
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
                onClick={() => nav(`/dashboard/member/claims/${c.id}`)}
              >
                View details
              </Button>
            </div>
          </div>
        ))}

        {!claims.length && (
          <p className="text-sm text-center text-gray-500">
            You have not submitted any claims yet.
          </p>
        )}
      </div>
    </div>
  );
}
