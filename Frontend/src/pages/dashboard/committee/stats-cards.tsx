import React, { useEffect, useState } from "react";
import api from "~/config/api";

export default function StatsCards() {
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    paid: 0,
  });

  useEffect(() => {
    api.get("claims/committee/").then((res) => {
      const rows = res.data.results;

      setStats({
        total: rows.length,
        pending: rows.filter((x) => x.status === "submitted").length,
        approved: rows.filter((x) => x.status === "approved").length,
        paid: rows.filter((x) => x.status === "paid").length,
      });
    });
  }, []);

  return (
    <div className="grid grid-cols-4 gap-4">
      <Card title="Total Claims" value={stats.total} />
      <Card title="Pending" value={stats.pending} />
      <Card title="Approved" value={stats.approved} />
      <Card title="Paid" value={stats.paid} />
    </div>
  );
}

function Card({ title, value }: { title: string; value: number }) {
  return (
    <div className="p-4 border rounded bg-white shadow-sm">
      <p className="text-sm text-gray-600">{title}</p>
      <p className="text-2xl font-bold">{value}</p>
    </div>
  );
}
