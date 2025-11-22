// Frontend/src/pages/dashboard/member/claim-detail.tsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "~/config/api";
import Button from "~/components/controls/button";

export default function MemberClaimDetail() {
  const { id } = useParams();
  const nav = useNavigate();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get(`claims/${id}/`)
      .then((res) => setData(res.data))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="p-6">Loading…</div>;
  if (!data) return <div className="p-6">Not found.</div>;

  const details = data.details || {};
  const diagnosis = details.diagnosis || data.notes || "N/A";

  const submittedAt = data.submitted_at
    ? new Date(data.submitted_at).toLocaleString()
    : "Pending";

  const shortId = (id || "").slice(0, 8);

  const totalClaimed = Number(data.total_claimed || 0);
  const fundShare = Number(data.total_payable || 0);      // 80%
  const memberShare = Number(data.member_payable || 0);   // 20%

  const getAttachmentLabel = (a: any) => {
    const filename = (a.file || "").split("/").pop() || "";
    const ct = (a.content_type || "").toLowerCase();

    // Detect our auto-generated summary
    if (filename.includes("claim_summary")) return "Claim Summary PDF";

    if (ct.includes("pdf")) return "Supporting Document (PDF)";
    if (ct.includes("image")) return "Supporting Image";
    return "Attachment";
  };

  return (
    <div className="space-y-6">
      <Button variant="outline" onClick={() => nav(-1)}>
        ← Back
      </Button>

      <h2 className="text-2xl font-bold text-[#03045f]">
        Claim #{shortId}
      </h2>

      {/* SUMMARY CARD – mirrors generated PDF wording */}
      <div className="border p-5 rounded-lg bg-white shadow-sm space-y-1">
        <p>
          <strong>Claim Type:</strong> {data.claim_type}
        </p>
        <p>
          <strong>Status:</strong> {data.status}
        </p>
        <p>
          <strong>Diagnosis / Notes:</strong> {diagnosis}
        </p>
        <p>
          <strong>Total Claimed:</strong> Ksh {totalClaimed.toLocaleString()}
        </p>
        <p>
          <strong>Fund (80%):</strong> Ksh {fundShare.toLocaleString()}
        </p>
        <p>
          <strong>Member (20%):</strong> Ksh {memberShare.toLocaleString()}
        </p>
        <p>
          <strong>Submitted:</strong> {submittedAt}
        </p>
      </div>

      {/* DETAIL BLOCKS BY CLAIM TYPE */}
      {data.claim_type === "outpatient" && (
        <OutpatientDetails details={details} />
      )}

      {data.claim_type === "inpatient" && (
        <InpatientDetails details={details} />
      )}

      {data.claim_type === "chronic" && (
        <ChronicDetails details={details} />
      )}

      {/* ATTACHMENTS */}
      <div className="border p-5 rounded-lg bg-white shadow-sm">
        <h3 className="font-semibold mb-3">Attachments</h3>

        {!data.attachments?.length && <p>No attachments.</p>}

        {data.attachments?.map((a: any) => (
          <div
            key={a.id}
            className="border-b py-2 flex items-center justify-between text-sm last:border-b-0"
          >
            <div>
              <p className="font-medium">{getAttachmentLabel(a)}</p>
              <p className="text-xs text-gray-500">
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

/* ----------------------------------------------------------
   Detail blocks for each claim type
---------------------------------------------------------- */

function OutpatientDetails({ details }: { details: any }) {
  return (
    <div className="border p-5 rounded-lg bg-white shadow-sm space-y-3 text-sm">
      <h3 className="font-semibold mb-1">Outpatient Details</h3>
      <p>
        <strong>Date of 1st Visit:</strong>{" "}
        {details.date_of_first_visit || "N/A"}
      </p>
      <p>
        <strong>Number of Consultations:</strong>{" "}
        {details.consultations_count ?? "N/A"}
      </p>
      <p>
        <strong>Total Consultation Fees:</strong>{" "}
        Ksh {(details.consultation_fee || 0).toLocaleString()}
      </p>
      <p>
        <strong>House Visit Cost:</strong>{" "}
        Ksh {(details.house_visit_cost || 0).toLocaleString()}
      </p>
      <p>
        <strong>Medicines / Injections:</strong>{" "}
        Ksh {(details.medicine_cost || 0).toLocaleString()}
      </p>
      <p>
        <strong>Investigations:</strong>{" "}
        Ksh {(details.investigation_cost || 0).toLocaleString()}
      </p>
      <p>
        <strong>Procedures:</strong>{" "}
        Ksh {(details.procedure_cost || 0).toLocaleString()}
      </p>
    </div>
  );
}

function InpatientDetails({ details }: { details: any }) {
  return (
    <div className="border p-5 rounded-lg bg-white shadow-sm space-y-3 text-sm">
      <h3 className="font-semibold mb-1">Inpatient Details</h3>
      <p>
        <strong>Hospital:</strong> {details.hospital_name || "N/A"}
      </p>
      <p>
        <strong>Date of Admission:</strong>{" "}
        {details.date_of_admission || "N/A"}
      </p>
      <p>
        <strong>Date of Discharge:</strong>{" "}
        {details.date_of_discharge || "N/A"}
      </p>
      <p>
        <strong>Bed Charge per Day:</strong>{" "}
        Ksh {(details.bed_charge_per_day || 0).toLocaleString()}
      </p>
      <p>
        <strong>Number of Days:</strong> {details.stay_days ?? "N/A"}
      </p>
      <p>
        <strong>NHIF Total:</strong>{" "}
        Ksh {(details.nhif_total || 0).toLocaleString()}
      </p>
      <p>
        <strong>Inpatient Charges (Part D):</strong>{" "}
        Ksh {(details.inpatient_total || 0).toLocaleString()}
      </p>
      <p>
        <strong>Doctor Charges (Part E):</strong>{" "}
        Ksh {(details.doctor_total || 0).toLocaleString()}
      </p>
      <p>
        <strong>Other Claimable (Part F):</strong>{" "}
        Ksh {(details.claimable_total || 0).toLocaleString()}
      </p>
      <p>
        <strong>Discounts / Waivers (Part G):</strong>{" "}
        Ksh {(details.discounts_total || 0).toLocaleString()}
      </p>
      <p>
        <strong>Critical Illness:</strong>{" "}
        {details.critical_illness ? "Yes" : "No"}
      </p>
    </div>
  );
}

function ChronicDetails({ details }: { details: any }) {
  const meds = details.medicines || [];
  return (
    <div className="border p-5 rounded-lg bg-white shadow-sm space-y-3 text-sm">
      <h3 className="font-semibold mb-1">Chronic Illness Medication</h3>
      {!meds.length && <p>No medicines listed.</p>}
      {meds.map((m: any, idx: number) => (
        <div
          key={idx}
          className="grid md:grid-cols-5 gap-2 border rounded p-2"
        >
          <p>
            <strong>Name:</strong> {m.name || "-"}
          </p>
          <p>
            <strong>Strength:</strong> {m.strength || "-"}
          </p>
          <p>
            <strong>Dosage:</strong> {m.dosage || "-"}
          </p>
          <p>
            <strong>Duration:</strong> {m.duration || "-"}
          </p>
          <p>
            <strong>Cost:</strong> Ksh {(m.cost || 0).toLocaleString()}
          </p>
        </div>
      ))}
    </div>
  );
}
