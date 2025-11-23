// Frontend/src/pages/dashboard/committee/index.tsx
import React, { useEffect, useState } from "react";
import api from "~/config/api";
import { Link } from "react-router-dom";
import Skeleton from "~/components/loader/skeleton";

export default function CommitteeDashboard() {
  const [claims, setClaims] = useState<any[]>([]);
  const [info, setInfo] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [claimsRes, infoRes] = await Promise.all([
          api.get("claims/"),
          api.get("dashboard/committee/info/"),
        ]);

        const list = claimsRes.data?.results || claimsRes.data || [];
        setClaims(list);
        setInfo(infoRes.data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const todayStr = new Date().toDateString();

  const pending = claims.filter(
    (c) => c.status === "submitted" || c.status === "reviewed"
  );
  const todays = claims.filter((c) => {
    if (!c.submitted_at) return false;
    return new Date(c.submitted_at).toDateString() === todayStr;
  });

  const approved = claims.filter((c) => c.status === "approved").length;
  const rejected = claims.filter((c) => c.status === "rejected").length;
  const paid = claims.filter((c) => c.status === "paid").length;

  const formatDate = (d?: string | null) =>
    d ? new Date(d).toLocaleDateString() : "N/A";

  return (
    <div className="space-y-6">
      {/* Header + committee profile */}
      <div className="sgss-card p-0">
        <div className="sgss-header">Committee Dashboard</div>
        <div className="p-6 text-sm text-gray-700 space-y-4">
          <p>
            Review member claims, track daily workload and monitor approvals in
            line with the SGSS Medical Fund Byelaws.
          </p>

          {/* Committee profile block */}
          <div className="border rounded-lg bg-[var(--sgss-bg)] p-4 text-xs text-gray-700 grid md:grid-cols-2 gap-4">
            {loading ? (
              <>
                <Skeleton className="h-4 w-40" />
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-48" />
              </>
            ) : info ? (
              <>
                <div>
                  <p className="font-semibold text-[var(--sgss-navy)] text-sm">
                    {info.full_name || "Committee Member"}
                  </p>
                  <p className="text-[11px] text-gray-500">{info.email}</p>
                  <p className="mt-1">
                    <span className="font-medium">Role:</span>{" "}
                    {info.role || "Committee"}
                  </p>
                </div>
                <div>
                  <p>
                    <span className="font-medium">Membership No:</span>{" "}
                    {info.membership_no || "N/A"}
                  </p>
                  <p>
                    <span className="font-medium">Membership Type:</span>{" "}
                    {info.membership_type || "Not set"}
                  </p>
                </div>
                <div>
                  <p>
                    <span className="font-medium">NHIF No:</span>{" "}
                    {info.nhif_number || "Not provided"}
                  </p>
                  <p className="mt-1">
                    <span className="font-medium">Pending Total:</span>{" "}
                    {typeof info.pending_total === "number"
                      ? `${info.pending_total} claims`
                      : "—"}
                  </p>
                  <p>
                    <span className="font-medium">New Today:</span>{" "}
                    {typeof info.today_new === "number"
                      ? `${info.today_new} claim(s)`
                      : "—"}
                  </p>
                </div>
              </>
            ) : (
              <p className="text-xs text-red-600">
                Committee profile not available.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid md:grid-cols-4 gap-4">
        <div className="sgss-card">
          <p className="small-label">Pending Review</p>
          {loading ? (
            <Skeleton className="h-7 w-16 mt-2" />
          ) : (
            <p className="text-2xl font-bold text-[var(--sgss-navy)] mt-1">
              {pending.length}
            </p>
          )}
        </div>
        <div className="sgss-card">
          <p className="small-label">Approved</p>
          {loading ? (
            <Skeleton className="h-7 w-16 mt-2" />
          ) : (
            <p className="text-2xl font-bold text-[var(--sgss-navy)] mt-1">
              {approved}
            </p>
          )}
        </div>
        <div className="sgss-card">
          <p className="small-label">Rejected</p>
          {loading ? (
            <Skeleton className="h-7 w-16 mt-2" />
          ) : (
            <p className="text-2xl font-bold text-[var(--sgss-navy)] mt-1">
              {rejected}
            </p>
          )}
        </div>
        <div className="sgss-card">
          <p className="small-label">Paid</p>
          {loading ? (
            <Skeleton className="h-7 w-16 mt-2" />
          ) : (
            <p className="text-2xl font-bold text-[var(--sgss-navy)] mt-1">
              {paid}
            </p>
          )}
        </div>
      </div>

      {/* Pending list */}
      <div className="sgss-card">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-[var(--sgss-navy)]">
            Pending / In Progress
          </h3>
        </div>

        {loading ? (
          <div className="space-y-2">
            <Skeleton className="h-5 w-full" />
            <Skeleton className="h-5 w-4/5" />
            <Skeleton className="h-5 w-3/4" />
          </div>
        ) : pending.length === 0 ? (
          <p className="text-sm text-gray-600">No claims waiting for review.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="text-left text-xs uppercase text-gray-500 border-b">
                  <th className="py-2 pr-4">Ref</th>
                  <th className="py-2 pr-4">Member</th>
                  <th className="py-2 pr-4">Type</th>
                  <th className="py-2 pr-4">Status</th>
                  <th className="py-2 pr-4">Total</th>
                  <th className="py-2 pr-4">Submitted</th>
                  <th className="py-2 pr-4"></th>
                </tr>
              </thead>
              <tbody>
                {pending.map((c) => (
                  <tr key={c.id} className="border-b last:border-b-0">
                    <td className="py-2 pr-4 font-mono text-xs">
                      {String(c.id).slice(0, 8)}
                    </td>
                    <td className="py-2 pr-4 text-xs">
                      {c.member_user_email || "Member"}
                    </td>
                    <td className="py-2 pr-4 capitalize">{c.claim_type}</td>
                    <td className="py-2 pr-4">
                      <span className="px-2 py-0.5 rounded-full text-xs bg-yellow-100 text-yellow-800">
                        {c.status}
                      </span>
                    </td>
                    <td className="py-2 pr-4">
                      Ksh {Number(c.total_claimed || 0).toLocaleString()}
                    </td>
                    <td className="py-2 pr-4 text-xs text-gray-600">
                      {c.submitted_at
                        ? new Date(c.submitted_at).toLocaleString()
                        : "—"}
                    </td>
                    <td className="py-2 pr-4 text-right">
                      <Link
                        to={`/dashboard/committee/claims/${c.id}`}
                        className="text-[var(--sgss-navy)] hover:text-[var(--sgss-gold)] text-xs font-medium"
                      >
                        Open
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Today's submissions */}
      <div className="sgss-card">
        <h3 className="font-semibold text-[var(--sgss-navy)] mb-3">
          Today’s Submissions
        </h3>
        {loading ? (
          <Skeleton className="h-5 w-3/4" />
        ) : todays.length === 0 ? (
          <p className="text-sm text-gray-600">
            No claims submitted today ({todayStr}).
          </p>
        ) : (
          <ul className="space-y-2 text-sm">
            {todays.map((c) => (
              <li
                key={c.id}
                className="flex justify-between items-center border-b last:border-b-0 pb-2"
              >
                <div>
                  <p className="font-medium text-[var(--sgss-navy)]">
                    {c.claim_type} – Ksh{" "}
                    {Number(c.total_claimed || 0).toLocaleString()}
                  </p>
                  <p className="text-xs text-gray-600">
                    Member: {c.member_user_email || "Member"}
                  </p>
                </div>
                <Link
                  to={`/dashboard/committee/claims/${c.id}`}
                  className="text-[var(--sgss-navy)] hover:text-[var(--sgss-gold)] text-xs font-medium"
                >
                  Review
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
