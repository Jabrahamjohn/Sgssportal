import React, { useEffect, useState } from "react";
import api from "~/config/api";

export default function MemberDashboard() {
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    async function load() {
      const [balanceRes, claimsRes] = await Promise.all([
        api.get("members/me/benefit_balance/"),
        api.get("claims/"),
      ]);

      const claims = claimsRes.data.results || claimsRes.data || [];

      setStats({
        remaining: balanceRes.data.remaining_balance,
        total: claims.length,
        approved: claims.filter((c: any) => c.status === "approved").length,
        pending: claims.filter((c: any) => c.status === "submitted").length,
        rejected: claims.filter((c: any) => c.status === "rejected").length,
      });
    }
    load();
  }, []);

  if (!stats) return <div className="p-6">Loading…</div>;

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-sgss-navy">Member Dashboard</h2>

      <div className="grid md:grid-cols-3 gap-4">
        <Card title="Benefit Remaining" value={`Ksh ${stats.remaining.toLocaleString()}`} color="gold" />
        <Card title="Total Claims" value={stats.total} />        
        <Card title="Pending" value={stats.pending} />
        <Card title="Approved" value={stats.approved} />
        <Card title="Rejected" value={stats.rejected} color="red" />
      </div>
    </div>
  );
}

function Card({ title, value, color="navy" }) {
  const classes = {
    navy: "bg-sgss-navy text-white",
    gold: "bg-sgss-gold text-white",
    red: "bg-red-600 text-white",
  };

  return (
    <div className={`p-5 rounded shadow ${classes[color]}`}>
      <p className="text-sm opacity-80">{title}</p>
      <p className="text-2xl font-bold">{value}</p>
    </div>
  );
}
