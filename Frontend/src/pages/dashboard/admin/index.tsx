import React, { useEffect, useState } from "react";
import api from "~/config/api";

export default function AdminDashboard() {
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    async function load() {
      const [members, claims] = await Promise.all([
        api.get("members/"),
        api.get("claims/"),
      ]);

      const claimsList = claims.data.results || claims.data || [];
      const pending = claimsList.filter((c:any) => c.status === "submitted").length;

      setStats({
        members: members.data.length,
        claims: claimsList.length,
        pending,
        committee: members.data.filter((m:any) => m.role === "Committee").length,
      });
    }
    load();
  }, []);

  if (!stats) return <div className="p-6">Loading…</div>;

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-sgss-navy">Admin Dashboard</h2>

      <div className="grid md:grid-cols-4 gap-4">
        <Card title="Members" value={stats.members} color="gold" />
        <Card title="Claims" value={stats.claims} />
        <Card title="Pending Approvals" value={stats.pending} color="red" />
        <Card title="Committee Members" value={stats.committee} />
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
