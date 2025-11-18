import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "~/config/api";
import Badge from "~/components/controls/badge";
import Button from "~/components/controls/button";

export default function ClaimView() {
  const { id } = useParams();
  const nav = useNavigate();

  const [claim, setClaim] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get(`claims/${id}/`)
      .then((res) => setClaim(res.data))
      .finally(() => setLoading(false));
  }, [id]);

  const statusColor = (s: string) => {
    switch (s) {
      case "approved":
        return "success";
      case "rejected":
        return "danger";
      case "paid":
        return "primary";
      case "reviewed":
        return "info";
      default:
        return "warning";
    }
  };

  if (loading) return <div className="p-6">Loading…</div>;
  if (!claim) return <div className="p-6 text-red-600">Claim not found.</div>;

  return (
    <div className="p-6 space-y-4">
      <div className="flex justify-between">
        <h2 className="text-xl font-semibold">
          Claim Details – {claim.claim_type.toUpperCase()}
        </h2>
        <Badge variant={statusColor(claim.status)}>{claim.status}</Badge>
      </div>

      <div className="grid md:grid-cols-2 gap-3 text-sm">
        <Info label="Total Claimed" value={`Ksh ${Number(claim.total_claimed).toLocaleString()}`} />
        <Info label="Fund Payable" value={`Ksh ${Number(claim.total_payable).toLocaleString()}`} />
        <Info label="Member Share" value={`Ksh ${Number(claim.member_payable).toLocaleString()}`} />
        <Info label="Submitted" value={claim.submitted_at ? new Date(claim.submitted_at).toLocaleString() : "—"} />
        {claim.date_of_first_visit && (
          <Info label="Date of First Visit" value={claim.date_of_first_visit} />
        )}
        {claim.date_of_discharge && (
          <Info label="Date of Discharge" value={claim.date_of_discharge} />
        )}
      </div>

      {/* Attachments */}
      <div>
        <h3 className="font-medium mb-2">Attachments</h3>
        {!claim.attachments?.length && (
          <p className="text-xs text-gray-500">No attachments uploaded.</p>
        )}
        {claim.attachments?.map((att: any) => (
          <div key={att.id} className="border p-2 rounded mb-1 flex justify-between items-center">
            <div>
              <p className="font-medium">{att.file.split("/").pop()}</p>
              <p className="text-xs text-gray-500">
                Uploaded: {new Date(att.uploaded_at).toLocaleString()}
              </p>
            </div>
            <a
              href={att.file}
              target="_blank"
              className="text-blue-600 underline text-sm"
              rel="noopener noreferrer"
            >
              View / Download
            </a>
          </div>
        ))}
      </div>

      <Button onClick={() => nav(-1)} variant="outline">
        Back to Claims
      </Button>
    </div>
  );
}

function Info({ label, value }: any) {
  return (
    <div className="border p-2 bg-gray-50 rounded">
      <p className="text-xs text-gray-600">{label}</p>
      <p className="text-sm font-medium">{value}</p>
    </div>
  );
}
