// Frontend/src/pages/dashboard/admin/index.tsx
import React, { useEffect, useState } from "react";
import api from "~/config/api";
import Skeleton from "~/components/loader/skeleton";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";

export default function AdminDashboard() {
  const [summary, setSummary] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await api.get("dashboard/admin/summary/");
        setSummary(res.data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const totalClaims = summary?.total_claims ?? 0;
  const totalMembers = summary?.total_members ?? 0;
  const status = summary?.status_counts || {};
  const submitted = status.submitted ?? 0;
  const approved = status.approved ?? 0;
  const paid = status.paid ?? 0;
  const rejected = status.rejected ?? 0;
  const chronic = summary?.chronic_requests ?? 0;

  const pendingPayable = summary?.total_payable_pending ?? 0;
  const paidOut = summary?.total_paid_out ?? 0;
  const monthly = summary?.monthly || [];
  const year = summary?.year ?? new Date().getFullYear();

  return (
    <div className="space-y-6">
      <div className="sgss-card p-0">
        <div className="sgss-header">Admin Dashboard</div>
        <div className="p-6 text-sm text-gray-700">
          High-level overview of SGSS Medical Fund activity. For full user &
          committee management, continue to use the Django admin as needed.
        </div>
      </div>

      {/* Top stats */}
      <div className="grid md:grid-cols-3 gap-4">
        <AdminStat
          label="Total Members"
          value={totalMembers}
          loading={loading}
        />
        <AdminStat
          label={`Claims (${year})`}
          value={totalClaims}
          loading={loading}
        />
        <AdminStat label="Submitted" value={submitted} loading={loading} />
        <AdminStat label="Approved" value={approved} loading={loading} />
        <AdminStat label="Paid" value={paid} loading={loading} />
        <AdminStat label="Rejected" value={rejected} loading={loading} />
      </div>

      {/* Fund liability */}
      <div className="grid md:grid-cols-2 gap-4">
        <div className="sgss-card bg-[var(--sgss-navy)] text-white">
          <p className="text-xs uppercase tracking-[0.15em] text-white/70">
            Pending Fund Liability ({year})
          </p>
          {loading ? (
            <Skeleton className="h-8 w-40 mt-3 bg-white/20" />
          ) : (
            <p className="text-3xl font-bold mt-2">
              Ksh {pendingPayable.toLocaleString()}
            </p>
          )}
          <p className="text-xs text-white/70 mt-2">
            Sum of fund-payable amounts for claims not yet marked as paid or
            rejected.
          </p>
        </div>

        <div className="sgss-card bg-[var(--sgss-gold)] text-[var(--sgss-navy)]">
          <p className="text-xs uppercase tracking-[0.15em] text-[var(--sgss-navy)]/70">
            Total Paid Out ({year})
          </p>
          {loading ? (
            <Skeleton className="h-8 w-40 mt-3 bg-black/10" />
          ) : (
            <p className="text-3xl font-bold mt-2">
              Ksh {paidOut.toLocaleString()}
            </p>
          )}
          <p className="text-xs text-[var(--sgss-navy)]/80 mt-2">
            Sum of fund-payable amounts for claims marked as paid in the current
            year.
          </p>
        </div>
      </div>

      {/* Chronic requests */}
      <div className="grid md:grid-cols-3 gap-4">
        <div className="sgss-card">
          <p className="small-label">Chronic Requests ({year})</p>
          {loading ? (
            <Skeleton className="h-7 w-16 mt-2" />
          ) : (
            <p className="text-2xl font-bold text-[var(--sgss-navy)] mt-1">
              {chronic}
            </p>
          )}
        </div>
      </div>

      {/* Monthly chart */}
      <div className="sgss-card">
        <p className="small-label mb-2">Monthly Claims – {year}</p>
        {loading ? (
          <Skeleton className="h-56 w-full" />
        ) : monthly.length === 0 ? (
          <p className="text-sm text-gray-600">
            No claims recorded for the current year.
          </p>
        ) : (
          <div className="w-full h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthly}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month_label" />
                <YAxis />
                <Tooltip
                  formatter={(value: any, name: string) => {
                    if (name === "Claims") return [value, "Claims"];
                    return [`Ksh ${Number(value).toLocaleString()}`, name];
                  }}
                />
                <Bar dataKey="claims" name="Claims" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );
}

function AdminStat({
  label,
  value,
  loading,
}: {
  label: string;
  value: number;
  loading: boolean;
}) {
  return (
    <div className="sgss-card">
      <p className="small-label">{label}</p>
      {loading ? (
        <Skeleton className="h-7 w-16 mt-2" />
      ) : (
        <p className="text-2xl font-bold text-[var(--sgss-navy)] mt-1">
          {value}
        </p>
      )}
    </div>
  );
}
