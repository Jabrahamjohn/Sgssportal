import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "~/config/api";
import Button from "~/components/controls/button";
import Alert from "~/components/controls/alert";

export default function MemberClaimDetail() {
  const { id } = useParams();
  const nav = useNavigate();
  const [claim, setClaim] = useState<any>(null);
  const [err, setErr] = useState("");

  useEffect(() => {
    api
      .get(`claims/${id}/`)
      .then((res) => setClaim(res.data))
      .catch(() => setErr("Unable to load claim details."));
  }, [id]);

  if (err) return <Alert type="error" message={err} />;
  if (!claim) return <p>Loading…</p>;

  return (
    <div className="p-6 space-y-6">
      <h2 className="text-2xl font-semibold">Claim Details</h2>

      <div className="border p-4 rounded bg-white shadow">
        <p><strong>Claim Type:</strong> {claim.claim_type}</p>
        <p><strong>Status:</strong> {claim.status}</p>
        <p><strong>Total Claimed:</strong> Ksh {claim.total_claimed}</p>
        <p><strong>Fund Payable:</strong> Ksh {claim.total_payable}</p>
        <p><strong>Member Payable:</strong> Ksh {claim.member_payable}</p>
        <p><strong>Submitted:</strong> {claim.submitted_at}</p>
      </div>

      <h3 className="text-xl font-medium">Attachments</h3>
      <ul className="list-disc pl-5">
        {claim.attachments?.map((a: any) => (
          <li key={a.id}>
            <a
              className="text-blue-600 underline"
              href={a.file}
              target="_blank"
              rel="noopener noreferrer"
            >
              {a.file.split("/").pop()}
            </a>
          </li>
        ))}
      </ul>

      <Button onClick={() => nav("/dashboard/member/claims")} variant="outline">
        Back to Claims
      </Button>
    </div>
  );
}
