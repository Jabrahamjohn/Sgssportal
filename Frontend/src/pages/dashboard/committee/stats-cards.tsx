// Frontend/src/pages/dashboard/committee/stats-cards.tsx
import React, { useEffect, useState } from "react";
import { listCommitteeClaims, type CommitteeClaimRow } from "~/server/services/claim.service";

export default function StatsCards() {
  const [rows, setRows] = useState<CommitteeClaimRow[]>([]);

  useEffect(() => {
    listCommitteeClaims()
      .then((r) => setRows(r))
      .catch(() => setRows([]));
  }, []);

  const total = rows.length;
  const submitted = rows.filter((c) => c.status === "submitted").length;
  const approved = rows.filter((c) => c.status === "approved").length;
  const rejected = rows.filter((c) => c.status === "rejected").length;
  const paid = rows.filter((c) => c.status === "paid").length;

  const card = (label: string, value: number, extra?: string) => (
    <div className="bg-white rounded-xl shadow-sm p-4 flex flex-col">
      <span className="text-xs text-gray-500 uppercase">{label}</span>
      <span className="text-2xl font-semibold mt-1">{value}</span>
      {extra && <span className="text-xs text-gray-400 mt-1">{extra}</span>}
    </div>
  );

  return (
    <div className="grid gap-4 md:grid-cols-4">
      {card("Total Claims", total)}
      {card("Submitted", submitted)}
      {card("Approved", approved, "Ready for payment")}
      {card("Paid", paid, "Settled")}
    </div>
  );
}
