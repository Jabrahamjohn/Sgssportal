import React, { useEffect, useState } from "react";
import { getCommitteeClaimDetail } from "~/server/services/claim.service";
import  Modal  from "~/components/controls/modal";
import  Badge  from "~/components/controls/badge";

export default function ClaimDetailsModal({ id, onClose }:{ id:string; onClose:()=>void }) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(()=>{
    (async ()=>{
      setLoading(true);
      try {
        const res = await getCommitteeClaimDetail(id);
        setData(res);
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  if (!data) return (
    <Modal open onClose={onClose} title="Claim Details">
      {loading ? <div className="p-6">Loading…</div> : <div className="p-6 text-red-500">Not found</div>}
    </Modal>
  );

  const c = data.claim;
  const m = data.member;

  return (
    <Modal open onClose={onClose} title={`Claim • ${m.name}`}>
      <div className="p-4 space-y-4">
        <div className="flex flex-wrap items-center gap-2">
          <Badge>{c.type}</Badge>
          <Badge variant="info">{c.status}</Badge>
          {c.override_amount && <Badge variant="warning">Override {c.override_amount}</Badge>}
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div className="border rounded-lg p-3">
            <div className="font-semibold mb-2">Member</div>
            <div>Name: {m.name}</div>
            <div>Username: {m.username}</div>
            <div>Email: {m.email}</div>
            <div>Membership: {m.membership_type || "-"}</div>
            <div>NHIF: {m.nhif_number || "-"}</div>
          </div>

          <div className="border rounded-lg p-3">
            <div className="font-semibold mb-2">Claim</div>
            <div>First visit: {c.date_of_first_visit || "-"}</div>
            <div>Discharge: {c.date_of_discharge || "-"}</div>
            <div>Notes: {c.notes || "-"}</div>
            <div>Total Claimed: {c.total_claimed}</div>
            <div>Fund Payable: {c.total_payable}</div>
            <div>Member Payable: {c.member_payable}</div>
          </div>
        </div>

        <div className="border rounded-lg p-3">
          <div className="font-semibold mb-2">Items</div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left border-b">
                  <th className="py-2 pr-3">Category</th>
                  <th className="py-2 pr-3">Description</th>
                  <th className="py-2 pr-3">Amount</th>
                  <th className="py-2 pr-3">Qty</th>
                  <th className="py-2">Line Total</th>
                </tr>
              </thead>
              <tbody>
                {data.items.map((it:any)=>(
                  <tr key={it.id} className="border-b">
                    <td className="py-2 pr-3">{it.category || "-"}</td>
                    <td className="py-2 pr-3">{it.description || "-"}</td>
                    <td className="py-2 pr-3">{it.amount}</td>
                    <td className="py-2 pr-3">{it.quantity}</td>
                    <td className="py-2">{it.line_total}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {data.attachments?.length > 0 && (
          <div className="border rounded-lg p-3">
            <div className="font-semibold mb-2">Attachments</div>
            <ul className="list-disc pl-5">
              {data.attachments.map((a:any)=>(
                <li key={a.id}>
                  <a className="text-blue-600 underline" href={a.file || "#"} target="_blank" rel="noreferrer">
                    {a.file || "(file missing)"}
                  </a>{" "}
                  <span className="text-xs text-gray-500">
                    {a.content_type || ""} • {a.uploaded_at} • by {a.uploaded_by || "-"}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </Modal>
  );
}
