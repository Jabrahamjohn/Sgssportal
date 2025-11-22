import React, { useEffect, useState } from "react";
import api from "~/config/api";

export default function CommitteeDashboard() {
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    async function load() {
      const res = await api.get("committee/claims/");
      const list = res.data || [];

      const today = new Date().toISOString().slice(0, 10);

      setStats({
        total: list.length,
        submitted: list.filter((c: any) => c.status === "submitted").length,
        reviewed: list.filter((c: any) => c.status === "reviewed").length,
        approved: list.filter((c: any) => c.status === "approved").length,
        rejected: list.filter((c: any) => c.status === "rejected").length,
        paid: list.filter((c: any) => c.status === "paid").length,
        today: list.filter((c: any) => (c.created_at || "").startsWith(today)).length,
      });
    }
    load();
  }, []);

  if (!stats) return <div className="p-6">Loading…</div>;

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-sgss-navy">Committee Dashboard</h2>

      <div className="grid md:grid-cols-3 gap-4">
        <Card title="New Today" value={stats.today} color="gold" />
        <Card title="Submitted" value={stats.submitted} />
        <Card title="Reviewed" value={stats.reviewed} />
        <Card title="Approved" value={stats.approved} />
        <Card title="Rejected" value={stats.rejected} color="red" />
        <Card title="Paid" value={stats.paid} />
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
