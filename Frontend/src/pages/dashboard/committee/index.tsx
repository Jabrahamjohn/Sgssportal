import React, { useEffect, useState } from "react";
import { listCommitteeClaims, setClaimStatus } from "~/server/services/claim.service";
import  Table  from "~/components/controls/table";
import Badge  from "~/components/controls/badge";
import  Button  from "~/components/controls/button";
import ClaimDetailsModal from "./modal-claim-details";

const statusColor = (s: string) => {
  switch (s) {
    case "submitted": return "warning";
    case "reviewed": return "info";
    case "approved": return "success";
    case "rejected": return "danger";
    case "paid": return "primary";
    default: return "default";
  }
};

export default function CommitteeDashboard() {
  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({ status: "submitted", type: "" });
  const [openId, setOpenId] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const data = await listCommitteeClaims({
        status: filters.status || undefined,
        type: filters.type || undefined,
      });
      setRows(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [filters.status, filters.type]);

  const onSet = async (id: string, st: "reviewed"|"approved"|"rejected"|"paid") => {
    await setClaimStatus(id, st);
    await load();
  };

  return (
    <div className="p-4 md:p-6">
      <div className="flex flex-wrap items-center gap-2 mb-4">
        <select
          className="border rounded px-2 py-1"
          value={filters.status}
          onChange={(e)=>setFilters(f=>({...f, status:e.target.value}))}
        >
          <option value="">All statuses</option>
          <option value="submitted">Submitted</option>
          <option value="reviewed">Reviewed</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
          <option value="paid">Paid</option>
        </select>
        <select
          className="border rounded px-2 py-1"
          value={filters.type}
          onChange={(e)=>setFilters(f=>({...f, type:e.target.value}))}
        >
          <option value="">All types</option>
          <option value="outpatient">Outpatient</option>
          <option value="inpatient">Inpatient</option>
        </select>
        <Button onClick={load}>Refresh</Button>
      </div>

      <Table
        loading={loading}
        columns={[
          { title: "Member", key: "member_name" },
          { title: "Membership", key: "membership_type" },
          { title: "Type", key: "claim_type" },
          {
            title: "Status",
            key: "status",
            render: (r:any)=> <Badge variant={statusColor(r.status)}>{r.status}</Badge>
          },
          { title: "Claimed", key: "total_claimed" },
          { title: "Payable", key: "total_payable" },
          { title: "Created", key: "created_at" },
          {
            title: "Actions",
            key: "actions",
            render: (r:any)=> (
              <div className="flex gap-2">
                <Button size="sm" onClick={()=>setOpenId(r.id)}>Details</Button>
                <Button size="sm" onClick={()=>onSet(r.id, "reviewed")}>Review</Button>
                <Button size="sm" onClick={()=>onSet(r.id, "approved")}>Approve</Button>
                <Button size="sm" onClick={()=>onSet(r.id, "rejected")}>Reject</Button>
                <Button size="sm" onClick={()=>onSet(r.id, "paid")}>Mark Paid</Button>
              </div>
            )
          }
        ]}
        data={rows}
        rowKey="id"
      />

      {openId && (
        <ClaimDetailsModal id={openId} onClose={()=>setOpenId(null)} />
      )}
    </div>
  );
}
