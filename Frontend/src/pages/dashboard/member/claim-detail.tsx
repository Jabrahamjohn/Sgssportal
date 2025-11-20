// frontend/src/pages/dashboard/member/claim-detail
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "~/config/api";
import Button from "~/components/controls/button";

export default function MemberClaimDetail() {
  const { id } = useParams();
  const nav = useNavigate();
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    api.get(`claims/${id}/`).then(res => setData(res.data));
  }, [id]);

  if (!data) return <div className="p-6">Loading…</div>;

  return (
    <div className="p-6 space-y-6">
      <Button variant="outline" onClick={() => nav(-1)}>← Back</Button>

      <h2 className="text-2xl font-bold">Claim #{id?.slice(0, 8)}</h2>

      <div className="border p-4 rounded bg-white shadow-sm">
        <p><strong>Type:</strong> {data.claim_type}</p>
        <p><strong>Status:</strong> {data.status}</p>
        <p><strong>Total Claimed:</strong> Ksh {Number(data.total_claimed).toLocaleString()}</p>
        <p><strong>Payable:</strong> Ksh {Number(data.total_payable).toLocaleString()}</p>
        <p><strong>Member Share:</strong> Ksh {Number(data.member_payable).toLocaleString()}</p>
        <p><strong>Submitted:</strong> {data.submitted_at ? new Date(data.submitted_at).toLocaleString() : "Pending"}</p>
      </div>

      {/* Attachments */}
      <div className="border p-4 rounded bg-white shadow-sm">
        <h3 className="font-semibold mb-2">Attachments</h3>

        {data.attachments.length === 0 && <p>No attachments.</p>}

        {data.attachments.map((a: any) => (
          <div key={a.id} className="border-b py-2 flex justify-between">
            <p>{a.content_type}</p>
            <a href={a.file} target="_blank" className="text-blue-600 hover:underline">
              View
            </a>
          </div>
        ))}
      </div>
    </div>
  );
}
