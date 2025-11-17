import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import api from "~/config/api";
import Badge from "~/components/controls/badge";
import Button from "~/components/controls/button";

export default function MemberClaimDetail() {
  const { id } = useParams();
  const nav = useNavigate();

  const [claim, setClaim] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`claims/${id}/`)
      .then((res) => setClaim(res.data))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="p-6">Loading…</div>;
  if (!claim) return <div className="p-6">Claim not found</div>;

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

  return (
    <div className="p-6 space-y-6">
      {/* HEADER */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">
          Claim Details – <span className="text-purple-600">{id?.slice(0, 8)}…</span>
        </h2>
        <Button variant="outline" onClick={() => nav(-1)}>
          ← Back
        </Button>
      </div>

      {/* STATUS CARD */}
      <div className="border rounded bg-white shadow p-4">
        <div className="flex justify-between">
          <div>
            <h3 className="font-semibold text-lg capitalize">
              {claim.claim_type} Claim
            </h3>
            <p className="text-sm text-gray-600">
              Submitted:{" "}
              {claim.submitted_at
                ? new Date(claim.submitted_at).toLocaleString()
                : "—"}
            </p>
            <p className="text-sm text-gray-600">
              Created: {new Date(claim.created_at).toLocaleString()}
            </p>
          </div>

          <Badge variant={statusColor(claim.status)}>{claim.status}</Badge>
        </div>
      </div>

      {/* FINANCIAL BREAKDOWN */}
      <div className="border rounded bg-white shadow p-4">
        <h3 className="font-semibold text-lg mb-3">Financial Summary</h3>

        <div className="grid md:grid-cols-3 gap-4">
          <div className="p-3 bg-gray-50 border rounded">
            <p className="text-xs text-gray-500">Total Claimed</p>
            <p className="text-lg font-bold">
              Ksh {Number(claim.total_claimed).toLocaleString()}
            </p>
          </div>

          <div className="p-3 bg-gray-50 border rounded">
            <p className="text-xs text-gray-500">Fund Payable (80%)</p>
            <p className="text-lg font-bold">
              Ksh {Number(claim.total_payable).toLocaleString()}
            </p>
          </div>

          <div className="p-3 bg-gray-50 border rounded">
            <p className="text-xs text-gray-500">Your Share (20%)</p>
            <p className="text-lg font-bold text-red-600">
              Ksh {Number(claim.member_payable).toLocaleString()}
            </p>
          </div>
        </div>
      </div>

      {/* DETAILS (PER CLAIM TYPE) */}
      <ClaimDetailSections claim={claim} />

      {/* ATTACHMENTS */}
      <div className="border rounded bg-white shadow p-4">
        <h3 className="font-semibold text-lg mb-3">Uploaded Attachments</h3>

        {!claim.attachments?.length && (
          <p className="text-gray-500 text-sm">No attachments uploaded.</p>
        )}

        <div className="space-y-2">
          {claim.attachments?.map((att: any) => (
            <div
              key={att.id}
              className="flex justify-between items-center p-2 border rounded bg-gray-50"
            >
              <div>
                <p className="text-sm font-medium">{att.file.split("/").pop()}</p>
                <p className="text-xs text-gray-500">
                  Uploaded: {new Date(att.uploaded_at).toLocaleString()}
                </p>
              </div>

              <a
                href={att.file}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 underline text-sm"
              >
                View / Download
              </a>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* -----------------------------
   Sub-component: DETAIL SECTIONS
----------------------------- */

function ClaimDetailSections({ claim }: any) {
  const d = claim.details || {};

  const row = (label: string, val: any) => (
    <div className="flex justify-between p-2 border-b">
      <span className="text-gray-600">{label}</span>
      <span className="font-medium">{val || "—"}</span>
    </div>
  );

  if (claim.claim_type === "outpatient") {
    return (
      <div className="border rounded bg-white shadow p-4">
        <h3 className="font-semibold text-lg mb-3">Outpatient Details</h3>
        {row("Date of Visit", claim.date_of_first_visit)}
        {row("Diagnosis", d.diagnosis)}
        {row("Consultation Fees", `Ksh ${d.consultation_fee || 0}`)}
        {row("Medicines", `Ksh ${d.medicine_cost || 0}`)}
        {row("Investigations", `Ksh ${d.investigation_cost || 0}`)}
        {row("Procedures", `Ksh ${d.procedure_cost || 0}`)}
      </div>
    );
  }

  if (claim.claim_type === "inpatient") {
    return (
      <div className="border rounded bg-white shadow p-4">
        <h3 className="font-semibold text-lg mb-3">Inpatient Details</h3>
        {row("Hospital", d.hospital_name)}
        {row("Admission", d.date_of_admission)}
        {row("Discharge", claim.date_of_discharge)}
        {row("Bed Charge Per Day", `Ksh ${d.bed_charge_per_day || 0}`)}
        {row("NHIF Total", `Ksh ${d.nhif_total || 0}`)}
        {row("Inpatient Charges", `Ksh ${d.inpatient_total || 0}`)}
        {row("Doctor Charges", `Ksh ${d.doctor_total || 0}`)}
        {row("Claimable Charges", `Ksh ${d.claimable_total || 0}`)}
        {row("Discounts", `Ksh ${d.discounts_total || 0}`)}
        {row("Critical Illness", d.critical_illness ? "Yes" : "No")}
      </div>
    );
  }

  if (claim.claim_type === "chronic") {
    return (
      <div className="border rounded bg-white shadow p-4">
        <h3 className="font-semibold text-lg mb-3">Chronic Medication Details</h3>

        {(d.medicines || []).map((m: any, idx: number) => (
          <div key={idx} className="border rounded p-2 mb-2 bg-gray-50">
            {row("Medicine", m.name)}
            {row("Strength", m.strength)}
            {row("Dosage", m.dosage)}
            {row("Duration", m.duration)}
            {row("Cost", `Ksh ${m.cost}`)}
          </div>
        ))}
      </div>
    );
  }

  return null;
}
