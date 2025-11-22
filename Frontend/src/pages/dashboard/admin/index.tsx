// Frontend/src/pages/dashboard/admin/index.tsx
import React, { useEffect, useState } from "react";
import api from "~/config/api";
import Skeleton from "~/components/loader/skeleton";

export default function AdminDashboard() {
  const [claims, setClaims] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await api.get("claims/");
        setClaims(res.data?.results || res.data || []);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const totalClaims = claims.length;
  const submitted = claims.filter((c) => c.status === "submitted").length;
  const approved = claims.filter((c) => c.status === "approved").length;
  const paid = claims.filter((c) => c.status === "paid").length;
  const rejected = claims.filter((c) => c.status === "rejected").length;
  const totalFundLiability = claims.reduce(
    (sum, c) => sum + Number(c.total_payable || 0),
    0
  );

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
      <div className="grid md:grid-cols-5 gap-4">
        <AdminStat label="Total Claims" value={totalClaims} loading={loading} />
        <AdminStat label="Submitted" value={submitted} loading={loading} />
        <AdminStat label="Approved" value={approved} loading={loading} />
        <AdminStat label="Paid" value={paid} loading={loading} />
        <AdminStat label="Rejected" value={rejected} loading={loading} />
      </div>

      {/* Fund liability */}
      <div className="sgss-card bg-[var(--sgss-navy)] text-white">
        <p className="text-xs uppercase tracking-[0.15em] text-white/70">
          Fund Liability (Current Year)
        </p>
        {loading ? (
          <Skeleton className="h-8 w-40 mt-3 bg-white/20" />
        ) : (
          <p className="text-3xl font-bold mt-2">
            Ksh {totalFundLiability.toLocaleString()}
          </p>
        )}
        <p className="text-xs text-white/70 mt-2">
          Sum of all claim fund-payable amounts recorded in the system.
        </p>
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
