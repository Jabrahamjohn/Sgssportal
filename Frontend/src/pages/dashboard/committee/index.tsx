import React, { useEffect, useState } from "react";
import api from "~/config/api";

export default function CommitteeDashboard() {
  const [stats, setStats] = useState({
    total: 0,
    submitted: 0,
    reviewed: 0,
    approved: 0,
    rejected: 0,
    paid: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await api.get("committee/claims/");
        const list = res.data?.results || [];

        setStats({
          total: list.length,
          submitted: list.filter(c => c.status === "submitted").length,
          reviewed: list.filter(c => c.status === "reviewed").length,
          approved: list.filter(c => c.status === "approved").length,
          rejected: list.filter(c => c.status === "rejected").length,
          paid: list.filter(c => c.status === "paid").length,
        });
      } catch (_) {}
      setLoading(false);
    }
    load();
  }, []);

  if (loading) return <div className="p-6">Loading...</div>;

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-semibold text-[#03045f]">
        Committee Dashboard
      </h2>

      <div className="grid md:grid-cols-3 gap-6">
        <DashboardCard title="Total Claims" value={stats.total} color="blue" />
        <DashboardCard title="Submitted" value={stats.submitted} color="gray" />
        <DashboardCard title="Reviewed" value={stats.reviewed} color="purple" />
        <DashboardCard title="Approved" value={stats.approved} color="green" />
        <DashboardCard title="Rejected" value={stats.rejected} color="red" />
        <DashboardCard title="Paid" value={stats.paid} color="gold" />
      </div>
    </div>
  );
}

function DashboardCard({ title, value, color }: any) {
  const colors: any = {
    blue: "bg-[#03045f] text-white",
    gold: "bg-[#caa631] text-white",
    green: "bg-green-600 text-white",
    red: "bg-red-600 text-white",
    gray: "bg-gray-600 text-white",
    purple: "bg-purple-600 text-white",
  };

  return (
    <div className={`p-5 rounded-lg shadow ${colors[color]}`}>
      <p className="text-sm opacity-80">{title}</p>
      <p className="text-2xl font-bold mt-1">{value}</p>
    </div>
  );
}
