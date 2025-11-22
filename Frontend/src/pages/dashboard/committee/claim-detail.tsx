// Frontend/src/pages/dashboard/committee/claim-detail.tsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "~/config/api";
import Badge from "~/components/controls/badge";
import Button from "~/components/controls/button";

export default function CommitteeClaimDetailPage() {
  const { id } = useParams();
  const nav = useNavigate();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get(`claims/committee/${id}/`)
      .then((res) => setData(res.data))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="p-6">Loading…</div>;
  if (!data) return <div className="p-6">Not found.</div>;

  const { member, claim, items, attachments } = data;

  const shortId = (id || "").slice(0, 8);

  const getAttachmentLabel = (a: any) => {
    const filename = (a.file || "").split("/").pop() || "";
    const ct = (a.content_type || "").toLowerCase();

    if (filename.includes("claim_summary")) return "Claim Summary PDF";
    if (ct.includes("pdf")) return "Supporting Document (PDF)";
    if (ct.includes("image")) return "Supporting Image";
    return "Attachment";
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold text-[#03045f]">
          Claim #{shortId}
        </h2>
        <Button onClick={() => nav(-1)}>Back</Button>
      </div>

      {/* MEMBER INFO */}
      <div className="border rounded p-4 bg-white shadow-sm">
        <h3 className="text-lg font-semibold mb-2">Member Information</h3>
        <p><strong>Name:</strong> {member.name}</p>
        <p><strong>Email:</strong> {member.email}</p>
        <p><strong>Membership Type:</strong> {member.membership_type}</p>
        <p><strong>NHIF:</strong> {member.nhif_number || "N/A"}</p>
      </div>

      {/* CLAIM SUMMARY */}
      <div className="border rounded p-4 bg-white shadow-sm space-y-1">
        <h3 className="text-lg font-semibold mb-2">Claim Summary</h3>
        <p>
          <strong>Type:</strong> {claim.claim_type}
        </p>
        <p>
          <strong>Status:</strong>{" "}
          <Badge>{claim.status}</Badge>
        </p>
        <p>
          <strong>Notes / Diagnosis:</strong> {claim.notes || "N/A"}
        </p>
        <p>
          <strong>Total Claimed:</strong> Ksh{" "}
          {Number(claim.total_claimed).toLocaleString()}
        </p>
        <p>
          <strong>Fund Payable (80%):</strong> Ksh{" "}
          {Number(claim.total_payable).toLocaleString()}
        </p>
        <p>
          <strong>Member Share (20%):</strong> Ksh{" "}
          {Number(claim.member_payable).toLocaleString()}
        </p>
        <p>
          <strong>Date Submitted:</strong>{" "}
          {claim.submitted_at
            ? new Date(claim.submitted_at).toLocaleString()
            : "N/A"}
        </p>
      </div>

      {/* ITEMS */}
      {!!items.length && (
        <div className="border rounded p-4 bg-white shadow-sm">
          <h3 className="text-lg font-semibold mb-2">Items Breakdown</h3>
          {items.map((i: any) => (
            <div key={i.id} className="border-b py-2 text-sm">
              <p><strong>{i.category}</strong></p>
              <p>{i.description}</p>
              <p>
                Ksh{" "}
                {Number(
                  i.line_total ??
                    (Number(i.amount || 0) * (i.quantity || 1))
                ).toLocaleString()}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* ATTACHMENTS */}
      <div className="border rounded p-4 bg-white shadow-sm">
        <h3 className="text-lg font-semibold mb-2">Attachments</h3>

        {attachments.length === 0 && <p>No attachments.</p>}

        {attachments.map((a: any) => (
          <div
            key={a.id}
            className="border-b py-2 flex justify-between items-center last:border-b-0 text-sm"
          >
            <div>
              <p className="font-medium">{getAttachmentLabel(a)}</p>
              <p className="text-xs text-gray-600">
                Type: {a.content_type || "N/A"}
              </p>
              {a.uploaded_at && (
                <p className="text-xs text-gray-500">
                  Uploaded: {new Date(a.uploaded_at).toLocaleString()}
                </p>
              )}
            </div>

            <a
              href={a.file}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#03045f] font-semibold hover:text-[#caa631]"
            >
              View
            </a>
          </div>
        ))}
      </div>
    </div>
  );
}
