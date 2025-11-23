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
  const [exporting, setExporting] = useState(false);


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

  const apiBase =
    import.meta.env.VITE_API_URL || "http://127.0.0.1:8000/api/";
  const djangoAdminUrl = apiBase.replace(/\/api\/?$/, "") + "/admin/";

  const handleExportCsv = async () => {
    try {
      setExporting(true);
      const res = await api.get("reports/export/", {
        responseType: "blob",
      });

      const blob = new Blob([res.data], {
        type: "text/csv;charset=utf-8;",
      });

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute(
        "download",
        `sgss_claims_${year || new Date().getFullYear()}.csv`
      );
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (e) {
      console.error(e);
      alert("Could not export CSV. Check backend / network.");
    } finally {
      setExporting(false);
    }
  };


  return (
    <div className="space-y-6">
      <div className="sgss-card p-0">
        <div className="sgss-header">Admin Dashboard</div>
        <div className="p-6 text-sm text-gray-700 space-y-4">
          <p>
            High-level overview of SGSS Medical Fund activity. For full user &
            committee management, continue to use the Django admin as needed.
          </p>

          {/* Quick actions */}
          <div className="flex flex-wrap gap-3">
            <button
              onClick={handleExportCsv}
              disabled={exporting}
              className="px-3 py-1.5 rounded-lg text-xs font-medium bg-[var(--sgss-navy)] text-white hover:bg-[#04146a] disabled:opacity-60"
            >
              {exporting ? "Exporting…" : "Export Claims CSV"}
            </button>

            <a
              href={djangoAdminUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-1.5 rounded-lg text-xs font-medium bg-white border border-[var(--sgss-navy)] text-[var(--sgss-navy)] hover:bg-[var(--sgss-navy)] hover:text-white"
            >
              Open Django Admin
            </a>
          </div>
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
