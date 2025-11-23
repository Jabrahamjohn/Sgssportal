// Frontend/src/pages/dashboard/member/index.tsx
import React, { useEffect, useState } from "react";
import api from "~/config/api";
import Button from "~/components/controls/button";
import { useNavigate, Link } from "react-router-dom";
import Skeleton from "~/components/loader/skeleton";
import {useAuth} from "~/store/contexts/AuthContext";

export default function MemberDashboard() {
  const [balance, setBalance] = useState<number | null>(null);
  const [claims, setClaims] = useState<any[]>([]);
  const [memberInfo, setMemberInfo] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const nav = useNavigate();
  const { auth } = useAuth();
  const role = auth?.role?.toLowerCase();


  useEffect(() => {
    async function load() {
      try {
        const [balRes, claimRes, infoRes] = await Promise.all([
          api.get("members/me/benefit_balance/"),
          api.get("claims/"),
          api.get("dashboard/member/info/"),
        ]);

        setBalance(balRes.data.remaining_balance);
        setClaims(claimRes.data?.results || claimRes.data || []);
        setMemberInfo(infoRes.data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const total = claims.length;
  const submitted = claims.filter((c) => c.status === "submitted").length;
  const approved = claims.filter((c) => c.status === "approved").length;
  const paid = claims.filter((c) => c.status === "paid").length;

  const formatDate = (d?: string | null) =>
    d ? new Date(d).toLocaleDateString() : "N/A";

  return (
    <div className="space-y-6">
      {/* Header + member profile */}
      <div className="sgss-card p-0">
        <div className="sgss-header">Member Dashboard</div>
        <div className="p-6 flex flex-col gap-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <p className="text-sm text-gray-600">
                Welcome to the SGSS Medical Fund portal.
              </p>
              <p className="text-xs text-gray-500 mt-1">
                View your benefit balance, track your claims, and submit new
                claims online in line with the SGSS Medical Fund Byelaws.
              </p>
            </div>
            <Button
              onClick={() => nav("/dashboard/member/claims/new")}
              className="bg-[var(--sgss-navy)] hover:bg-[var(--sgss-gold)] text-white"
            >
              + New Claim
            </Button>
          </div>

          {role === "committee" && (
            <div className="text-[11px] text-[var(--sgss-navy)] bg-[var(--sgss-bg)] border border-[var(--sgss-navy)]/10 rounded-md px-3 py-2">
              You also serve on the{" "}
              <span className="font-semibold">Committee</span>.{" "}
              <Link
                to="/dashboard/committee"
                className="underline font-semibold hover:text-[var(--sgss-gold)]"
              >
                Go to Committee dashboard →
              </Link>
            </div>
          )}

          {role === "admin" && (
            <div className="text-[11px] text-[var(--sgss-navy)] bg-[var(--sgss-bg)] border border-[var(--sgss-navy)]/10 rounded-md px-3 py-2">
              You have{" "}
              <span className="font-semibold">Admin</span> rights.{" "}
              <Link
                to="/dashboard/admin"
                className="underline font-semibold hover:text-[var(--sgss-gold)]"
              >
                Go to Admin dashboard →
              </Link>
            </div>
          )}


          {/* Member profile strip */}
          <div className="border rounded-lg bg-[var(--sgss-bg)] p-4 text-xs text-gray-700 grid md:grid-cols-2 gap-4">
            {loading ? (
              <>
                <Skeleton className="h-4 w-40" />
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-48" />
              </>
            ) : memberInfo ? (
              <>
                <div>
                  <p className="font-semibold text-[var(--sgss-navy)] text-sm">
                    {memberInfo.full_name || "Member"}
                  </p>
                  <p className="text-[11px] text-gray-500">
                    {memberInfo.email}
                  </p>
                  <p className="mt-1">
                    <span className="font-medium">Membership No:</span>{" "}
                    {memberInfo.membership_no}
                  </p>
                </div>
                <div>
                  <p>
                    <span className="font-medium">Membership Type:</span>{" "}
                    {memberInfo.membership_type || "Not set"}
                  </p>
                  <p>
                    <span className="font-medium">NHIF No:</span>{" "}
                    {memberInfo.nhif_number || "Not provided"}
                  </p>
                </div>
                <div>
                  <p>
                    <span className="font-medium">Valid From:</span>{" "}
                    {formatDate(memberInfo.valid_from)}
                  </p>
                  <p>
                    <span className="font-medium">Valid To:</span>{" "}
                    {formatDate(memberInfo.valid_to)}
                  </p>
                </div>
              </>
            ) : (
              <p className="text-xs text-red-600">
                Member profile not found. Please contact the SGSS committee.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Cards */}
      <div className="grid md:grid-cols-4 gap-4">
        <div className="sgss-card">
          <p className="small-label">Remaining Balance</p>
          {loading ? (
            <Skeleton className="h-7 w-24 mt-2" />
          ) : (
            <p className="text-2xl font-bold text-[var(--sgss-navy)] mt-1">
              {balance !== null
                ? `Ksh ${balance.toLocaleString()}`
                : "Not available"}
            </p>
          )}
        </div>

        <StatCard label="Total Claims" value={total} />
        <StatCard label="Submitted" value={submitted} />
        <StatCard label="Approved" value={approved} />
        <StatCard label="Paid" value={paid} />
      </div>

      {/* Recent Claims */}
      <div className="sgss-card">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-[var(--sgss-navy)]">
            Recent Claims
          </h3>
          <Link
            to="/dashboard/member/claims"
            className="text-sm text-[var(--sgss-navy)] hover:text-[var(--sgss-gold)] font-medium"
          >
            View all
          </Link>
        </div>

        {loading ? (
          <div className="space-y-2">
            <Skeleton className="h-5 w-full" />
            <Skeleton className="h-5 w-full" />
            <Skeleton className="h-5 w-3/4" />
          </div>
        ) : claims.length === 0 ? (
          <p className="text-sm text-gray-600">
            You have not submitted any claims yet.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="text-left text-xs uppercase text-gray-500 border-b">
                  <th className="py-2 pr-4">Ref</th>
                  <th className="py-2 pr-4">Type</th>
                  <th className="py-2 pr-4">Status</th>
                  <th className="py-2 pr-4">Total</th>
                  <th className="py-2 pr-4">Fund</th>
                  <th className="py-2 pr-4">Submitted</th>
                  <th className="py-2 pr-4"></th>
                </tr>
              </thead>
              <tbody>
                {claims.slice(0, 5).map((c) => (
                  <tr key={c.id} className="border-b last:border-b-0">
                    <td className="py-2 pr-4 font-mono text-xs">
                      {String(c.id).slice(0, 8)}
                    </td>
                    <td className="py-2 pr-4 capitalize">{c.claim_type}</td>
                    <td className="py-2 pr-4">
                      <StatusBadge status={c.status} />
                    </td>
                    <td className="py-2 pr-4">
                      Ksh {Number(c.total_claimed || 0).toLocaleString()}
                    </td>
                    <td className="py-2 pr-4">
                      Ksh {Number(c.total_payable || 0).toLocaleString()}
                    </td>
                    <td className="py-2 pr-4 text-xs text-gray-600">
                      {c.submitted_at
                        ? new Date(c.submitted_at).toLocaleDateString()
                        : "—"}
                    </td>
                    <td className="py-2 pr-4 text-right">
                      <Link
                        to={`/dashboard/member/claims/${c.id}`}
                        className="text-[var(--sgss-navy)] hover:text-[var(--sgss-gold)] text-xs font-medium"
                      >
                        View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="sgss-card">
      <p className="small-label">{label}</p>
      <p className="text-2xl font-bold text-[var(--sgss-navy)] mt-1">
        {value}
      </p>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const s = (status || "").toLowerCase();
  let cls = "bg-gray-100 text-gray-700";

  if (s === "submitted") cls = "bg-yellow-100 text-yellow-800";
  else if (s === "approved") cls = "bg-emerald-100 text-emerald-800";
  else if (s === "paid") cls = "bg-blue-100 text-blue-800";
  else if (s === "rejected") cls = "bg-red-100 text-red-800";

  return (
    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${cls}`}>
      {status}
    </span>
  );
}
