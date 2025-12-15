// Frontend/src/pages/dashboard/admin/index.tsx
import { useEffect, useState } from "react";
import api from "~/config/api";
import Skeleton from "~/components/loader/skeleton";
import PageTransition from "~/components/animations/PageTransition";
import StatCard from "~/components/sgss/StatCard";
import Button from "~/components/controls/button";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from "recharts";
import { 
    UsersIcon, 
    DocumentTextIcon, 
    BanknotesIcon, 
    ArrowTopRightOnSquareIcon,
    ArrowDownTrayIcon,
    ChartBarIcon
} from "@heroicons/react/24/outline";

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
    <PageTransition className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
              <h1 className="text-2xl font-bold text-[var(--sgss-navy)] tracking-tight">Admin Dashboard</h1>
              <p className="text-sm text-gray-500 mt-1">System-wide overview and reporting.</p>
          </div>
          <div className="flex gap-2">
               <Button
                  variant="outline"
                  onClick={handleExportCsv}
                  disabled={exporting}
                  className="bg-white"
                >
                  <ArrowDownTrayIcon className="w-4 h-4 mr-2" />
                  {exporting ? "Exporting…" : "Export CSV"}
                </Button>
                 <a
                  href={djangoAdminUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center px-4 py-2 text-sm font-medium rounded-xl text-white bg-[var(--sgss-navy)] hover:bg-[#0b2f7c] shadow-lg shadow-blue-900/10 transition-all"
                >
                  Django Admin
                  <ArrowTopRightOnSquareIcon className="w-4 h-4 ml-2" />
                </a>
          </div>
      </div>

      {/* Top stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total Members"
          value={loading ? "..." : totalMembers}
          icon={<UsersIcon className="w-6 h-6" />}
          variant="primary"
        />
        <StatCard
          label={`Total Claims (${year})`}
          value={loading ? "..." : totalClaims}
          icon={<DocumentTextIcon className="w-6 h-6" />}
        />
        <StatCard label="Submitted" value={loading ? "..." : submitted} className="border-l-4 border-l-yellow-400 bg-white" />
        <StatCard label="Approved" value={loading ? "..." : approved} className="border-l-4 border-l-emerald-500 bg-white" />
        <StatCard label="Paid" value={loading ? "..." : paid} className="border-l-4 border-l-blue-500 bg-white" />
        <StatCard label="Rejected" value={loading ? "..." : rejected} className="border-l-4 border-l-red-500 bg-white" />
        <StatCard label="Chronic Reqs" value={loading ? "..." : chronic} className="border-l-4 border-l-[var(--sgss-navy)] bg-white" />
      </div>

      {/* Fund liability */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="sgss-card bg-gradient-to-br from-[var(--sgss-navy)] to-[#091e57] text-white p-6 relative overflow-hidden group">
          <div className="absolute right-0 top-0 p-6 opacity-10 transform translate-x-4 -translate-y-4 group-hover:scale-110 transition-transform">
               <BanknotesIcon className="w-32 h-32" />
          </div>
          <p className="text-xs uppercase tracking-[0.15em] text-white/60 font-medium z-10 relative">
            Pending Fund Liability ({year})
          </p>
          {loading ? (
             <Skeleton className="h-10 w-48 mt-3 bg-white/10" />
          ) : (
            <p className="text-4xl font-bold mt-2 z-10 relative tracking-tight">
              Ksh {pendingPayable.toLocaleString()}
            </p>
          )}
          <p className="text-xs text-white/60 mt-4 border-t border-white/10 pt-4 z-10 relative">
            Total payable amount for claims currently in submitted, reviewed, or approved states.
          </p>
        </div>

        <div className="sgss-card bg-gradient-to-br from-[var(--sgss-gold)] to-[#eac14d] text-[var(--sgss-navy)] p-6 relative overflow-hidden group">
           <div className="absolute right-0 top-0 p-6 opacity-10 transform translate-x-4 -translate-y-4 group-hover:scale-110 transition-transform">
               <BanknotesIcon className="w-32 h-32" />
          </div>
          <p className="text-xs uppercase tracking-[0.15em] text-[var(--sgss-navy)]/60 font-bold z-10 relative">
            Total Paid Out ({year})
          </p>
          {loading ? (
            <Skeleton className="h-10 w-48 mt-3 bg-black/5" />
          ) : (
            <p className="text-4xl font-bold mt-2 z-10 relative tracking-tight">
              Ksh {paidOut.toLocaleString()}
            </p>
          )}
          <p className="text-xs text-[var(--sgss-navy)]/60 mt-4 border-t border-black/5 pt-4 z-10 relative font-medium">
            Total amount successfully disbursed to members this year.
          </p>
        </div>
      </div>

      {/* Monthly chart */}
      <div className="sgss-card bg-white p-6">
        <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold text-[var(--sgss-navy)] flex items-center gap-2">
                <ChartBarIcon className="w-5 h-5 text-[var(--sgss-gold)]" />
                Monthly Claims Overview – {year}
            </h3>
        </div>
        
        {loading ? (
          <Skeleton className="h-72 w-full" />
        ) : monthly.length === 0 ? (
          <div className="h-64 flex items-center justify-center text-gray-400 text-sm bg-gray-50 rounded-xl border border-dashed border-gray-200">
            No claims data available for the current year.
          </div>
        ) : (
          <div className="w-full h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthly} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis 
                    dataKey="month_label" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#6b7280', fontSize: 12 }}
                    dy={10}
                />
                <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#6b7280', fontSize: 12 }}
                />
                <Tooltip
                  cursor={{ fill: '#f9fafb' }}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}
                  formatter={(value: any, name: string) => {
                    if (name === "Claims") return [value, "Claims"];
                    return [`Ksh ${Number(value).toLocaleString()}`, name];
                  }}
                />
                <Legend iconType="circle" />
                <Bar 
                    dataKey="claims" 
                    name="Claims Count" 
                    fill="var(--sgss-navy)" 
                    radius={[4, 4, 0, 0]}
                    barSize={40}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </PageTransition>
  );
}
