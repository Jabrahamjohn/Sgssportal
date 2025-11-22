// Frontend/src/pages/dashboard/committee/claim-detail.tsx
import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
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

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold">Claim #{id?.slice(0, 8)}</h2>
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
      <div className="border rounded p-4 bg-white shadow-sm">
        <h3 className="text-lg font-semibold mb-2">Claim Summary</h3>
        <p><strong>Type:</strong> {claim.type}</p>
        <p><strong>Status:</strong> <Badge>{claim.status}</Badge></p>
        <p><strong>Notes:</strong> {claim.notes}</p>
        <p><strong>Total Claimed:</strong> Ksh {Number(claim.total_claimed).toLocaleString()}</p>
        <p><strong>Payable:</strong> Ksh {Number(claim.total_payable).toLocaleString()}</p>
        <p><strong>Member Share:</strong> Ksh {Number(claim.member_payable).toLocaleString()}</p>
        <p><strong>Date Submitted:</strong> {claim.submitted_at ? new Date(claim.submitted_at).toLocaleString() : "N/A"}</p>
      </div>

      {/* ITEMS */}
      {!!items.length && (
        <div className="border rounded p-4 bg-white shadow-sm">
          <h3 className="text-lg font-semibold mb-2">Items Breakdown</h3>
          {items.map((i) => (
            <div key={i.id} className="border-b py-2">
              <p><strong>{i.category}</strong></p>
              <p>{i.description}</p>
              <p>Ksh {Number(i.line_total).toLocaleString()}</p>
            </div>
          ))}
        </div>
      )}

      {/* ATTACHMENTS */}
      <div className="border rounded p-4 bg-white shadow-sm">
        <h3 className="text-lg font-semibold mb-2">Attachments</h3>

        {attachments.length === 0 && <p>No attachments.</p>}

        {attachments.map((a: any) => {
          const label = a.label
            ? a.label
            : a.is_summary
            ? "Claim Summary PDF"
            : "Attachment";

          return (
            <div
              key={a.id}
              className="border-b py-2 flex justify-between items-center last:border-b-0"
            >
              <div>
                <p className="font-medium text-sm">{label}</p>
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
          );
        })}
      </div>

    </div>
  );
}
