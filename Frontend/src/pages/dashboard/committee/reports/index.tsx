import React, { useEffect, useState } from "react";
import api from "~/config/api";
import Button from "~/components/controls/button";

export default function CommitteeReports() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("claims/committee/?report=1").then((res) => {
      setStats(res.data.stats);
      setLoading(false);
    });
  }, []);

  if (loading) return <div className="p-6">Loading Reports…</div>;

  return (
    <div className="p-6 space-y-6">
      <h2 className="text-2xl font-bold">Committee Reports</h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card title="Total Claims (YTD)" value={stats.total_claims} />
        <Card
          title="Total Fund Paid"
          value={`Ksh ${Number(stats.fund_paid).toLocaleString()}`}
        />
        <Card
          title="Total Member Share"
          value={`Ksh ${Number(stats.member_paid).toLocaleString()}`}
        />
      </div>

      <h3 className="text-xl font-semibold pt-6">Claims Breakdown</h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card title="Inpatient" value={stats.inpatient} />
        <Card title="Outpatient" value={stats.outpatient} />
        <Card title="Chronic" value={stats.chronic} />
        <Card title="Critical" value={stats.critical} />
      </div>

      <div className="pt-6">
        <Button
          onClick={() => {
            window.open("/api/reports/claims/export/", "_blank");
          }}
        >
          Export CSV
        </Button>
      </div>
    </div>
  );
}

function Card({ title, value }: any) {
  return (
    <div className="bg-white p-4 rounded shadow text-center">
      <p className="text-gray-600">{title}</p>
      <p className="text-2xl font-bold">{value}</p>
    </div>
  );
}
