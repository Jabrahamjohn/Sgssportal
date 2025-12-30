// Frontend/src/pages/dashboard/member/claims-new.tsx
import React, { useState, useEffect } from "react";
import api from "~/config/api";
import Button from "~/components/controls/button";
import Input from "~/components/controls/input";
import Alert from "~/components/controls/alert";
import Modal from "~/components/controls/modal";
import { useNavigate } from "react-router-dom";
import { ArrowUpTrayIcon, DocumentTextIcon, XMarkIcon } from "@heroicons/react/24/outline";
import PageTransition from "~/components/animations/PageTransition";

import jsPDF from "jspdf";

async function generateClaimPDF({
  type,
  total,
  fundShare,
  memberShare,
  limit,
  formData,
  claimId,
}: any) {
  const doc = new jsPDF();
  const now = new Date().toLocaleString();

  doc.setFont("helvetica", "normal");
  doc.text("SIRI GURU SINGH SABHA MEDICAL FUND", 105, 15, { align: "center" });
  doc.text("Claim Summary Report", 105, 25, { align: "center" });

  doc.setFontSize(10);
  doc.text(`Generated on: ${now}`, 20, 35);
  doc.text(`Claim Type: ${type}`, 20, 50);
  doc.text(`Diagnosis / Notes: ${formData.diagnosis || "N/A"}`, 20, 57);
  doc.text(`Total Claimed: Ksh ${total.toLocaleString()}`, 20, 72);
  doc.text(`Fund (80%): Ksh ${fundShare.toLocaleString()}`, 20, 79);
  doc.text(`Member (20%): Ksh ${memberShare.toLocaleString()}`, 20, 86);
  doc.text(`Limit (Byelaws §6.3): Ksh ${limit.toLocaleString()}`, 20, 93);
  doc.setFont("helvetica", "italic");
  doc.text(
    "This summary follows SGSS Medical Fund Byelaws (May 2024), Section 6.",
    20,
    108
  );

  const blob = doc.output("blob");

  // 🔹 Auto-download for claimant
  doc.save(`SGSS_Claim_Summary_${Date.now()}.pdf`);

  // 🔹 Upload copy to backend
  const form = new FormData();
  form.append("file", blob, "claim_summary.pdf");
  try {
    await api.post(`claims/${claimId}/upload_summary/`, form, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    console.log("✅ PDF summary uploaded to backend");
  } catch (err) {
    console.warn("⚠️ PDF upload failed", err);
  }
}

/* ---------------------------------------------------------------------- */
/* 🌍 Claim Form with Summary Preview + Balance Check                     */
/* ---------------------------------------------------------------------- */

export default function NewClaim() {
  const [type, setType] = useState<"outpatient" | "inpatient" | "chronic">(
    "outpatient"
  );
  const [formData, setFormData] = useState<any>({});
  const [files, setFiles] = useState<File[]>([]);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [balance, setBalance] = useState<number | null>(null);
  const [showSummary, setShowSummary] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const nav = useNavigate();

  useEffect(() => {
    api
      .get("members/me/benefit_balance/")
      .then((res) => setBalance(res.data.remaining_balance))
      .catch(() => setBalance(null));
    api
      .get("members/me/rules/")
      .then((res) => {
        // You can handle the rules response here if needed
        console.log("Member rules:", res.data);
      })
      .catch(() => {
        // Handle error if needed
      });
  }, []);

  const handleChange = (key: string, value: any) =>
    setFormData((prev: any) => ({ ...prev, [key]: value }));

  const { total, limit, overLimit, fundShare, memberShare } =
    computeClaimTotals(formData, type);

  const canSubmit = !overLimit && total > 0;

  const handleSubmit = async () => {
    setBusy(true);
    setErr("");
    setUploadProgress(null);

    try {
      // create claim
      const res = await api.post("claims/", {
        claim_type: type,
        details: formData,
        status: "submitted",
      });

      const claimId = res.data.id as string;

      // upload attachments (if any)
      if (files.length) {
        for (const f of files) {
          const form = new FormData();
          form.append("file", f);
          form.append("claim", claimId);

          await api.post("claim-attachments/", form, {
            headers: { "Content-Type": "multipart/form-data" },
            onUploadProgress: (event) => {
              if (!event.total) return;
              const percent = Math.round((event.loaded / event.total) * 100);
              setUploadProgress(percent);
            },
          });
        }
        setUploadProgress(null);
      }

      // generate + upload PDF summary (best-effort)
      try {
        await generateClaimPDF({
          type,
          total,
          fundShare,
          memberShare,
          limit,
          formData,
          claimId,
        });
      } catch (e) {
        console.warn("PDF generation failed", e);
      }

      nav("/dashboard/member/claims");
    } catch (e: any) {
      console.error(e);
      setErr(e.response?.data?.detail || "Failed to submit claim");
    } finally {
      setBusy(false);
      setShowSummary(false);
    }
  };

  const renderForm = () => {
    switch (type) {
      case "inpatient":
        return <InpatientForm data={formData} onChange={handleChange} />;
      case "chronic":
        return <ChronicForm data={formData} onChange={handleChange} />;
      default:
        return <OutpatientForm data={formData} onChange={handleChange} />;
    }
  };

  const removeFile = (idx: number) => {
     setFiles(files.filter((_, i) => i !== idx));
  }

  return (
    <PageTransition className="space-y-8">
      {/* Header + basic info */}
      <div className="sgss-card p-0 overflow-hidden">
        <div className="sgss-header flex justify-between items-center">
            <span>New Claim Application</span>
            <span className="text-xs font-normal opacity-80 uppercase tracking-wider bg-white/10 px-2 py-1 rounded">2024 Byelaws</span>
        </div>
        <div className="p-6 md:p-8 space-y-6">
          {balance !== null && (
            <div className={`p-4 rounded-xl border-l-4 ${balance > 50000 ? "bg-blue-50 border-blue-500" : "bg-orange-50 border-orange-500"}`}>
               <p className="text-sm font-medium text-gray-700">Annual Limit Status</p>
               <p className={`text-xl font-bold ${balance > 50000 ? "text-blue-700" : "text-orange-700"}`}>
                  Ksh {balance.toLocaleString()} 
                  <span className="text-xs font-normal text-gray-500 ml-2">remaining</span>
               </p>
            </div>
          )}

          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <p className="text-sm text-gray-600 leading-relaxed">
                Complete this form to submit a claim in line with the SGSS
                Medical Fund Byelaws (2024).
              </p>
              <ul className="mt-3 space-y-2 text-xs text-gray-500">
                 <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-[var(--sgss-gold)]"></div>Ensure all receipts are clear</li>
                 <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-[var(--sgss-gold)]"></div>Include SHIF/SHA details where applicable</li>
                 <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-[var(--sgss-gold)]"></div>Review amounts before submitting</li>
              </ul>
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">
                Select Claim Type
              </label>
              <div className="grid grid-cols-3 gap-2">
                 {['outpatient', 'inpatient', 'chronic'].map((t) => (
                    <button
                        key={t}
                        onClick={() => setType(t as any)}
                        className={`py-2 px-1 text-sm font-medium rounded-lg capitalize transition-all ${
                             type === t 
                             ? 'bg-[var(--sgss-navy)] text-white shadow-lg shadow-blue-900/20' 
                             : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                        }`}
                    >
                       {t}
                    </button>
                 ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Form + quick totals */}
      <div className="sgss-card bg-white relative">
        <h3 className="font-bold text-[var(--sgss-navy)] mb-6 flex items-center gap-2 text-lg border-b border-gray-100 pb-3">
           <DocumentTextIcon className="w-5 h-5 text-[var(--sgss-gold)]" />
           Claim Details
        </h3>

        <div className="space-y-6">
          {renderForm()}
        </div>

        {/* Totals strip */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4 text-sm sticky bottom-0 bg-white/95 backdrop-blur-md p-4 -mx-4 md:mx-0 border-t border-gray-100 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] rounded-b-xl z-20">
          <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
            <p className="uppercase tracking-wider text-[10px] text-gray-500 font-bold mb-1">
              Total Claimed
            </p>
            <p className="text-xl font-bold text-[var(--sgss-navy)]">
              Ksh {total.toLocaleString()}
            </p>
          </div>
          <div className="p-3 bg-gradient-to-br from-[var(--sgss-navy)] to-[#0b2f7c] rounded-xl text-white shadow-lg shadow-blue-900/10">
            <p className="uppercase tracking-wider text-[10px] text-white/70 font-bold mb-1">
              Fund Liability (80%)
            </p>
            <p className="text-xl font-bold">
              Ksh {fundShare.toLocaleString()}
            </p>
          </div>
          <div className="p-3 bg-white border border-[var(--sgss-gold)]/30 rounded-xl relative overflow-hidden">
             <div className="absolute top-0 right-0 w-16 h-16 bg-[var(--sgss-gold)]/10 rounded-bl-full pointer-events-none"></div>
            <p className="uppercase tracking-wider text-[10px] text-gray-500 font-bold mb-1">
              Member Share (20%)
            </p>
            <p className="text-xl font-bold text-gray-700">
              Ksh {memberShare.toLocaleString()}
            </p>
            <p className="text-[10px] text-gray-400 mt-1">
              Max Limit: {limit.toLocaleString()}
            </p>
          </div>
        </div>
      </div>

      {/* Attachments */}
      <div className="sgss-card">
        <h3 className="font-bold text-[var(--sgss-navy)] mb-2 flex items-center gap-2">
           <ArrowUpTrayIcon className="w-5 h-5 text-[var(--sgss-gold)]" />
           Attachments
        </h3>
        <p className="text-sm text-gray-500 mb-4 max-w-2xl">
          Upload scanned hospital bills, receipts, SHIF/SHA statements and any
          supporting documents. Images and PDFs are accepted.
        </p>

        <label className="group block border-2 border-dashed border-gray-200 rounded-2xl px-8 py-10 cursor-pointer bg-gray-50/50 hover:bg-blue-50/50 hover:border-[var(--sgss-navy)]/30 transition-all text-center">
          <div className="flex flex-col items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-white shadow-sm flex items-center justify-center group-hover:scale-110 transition-transform">
               <ArrowUpTrayIcon className="w-6 h-6 text-[var(--sgss-gold)]" />
            </div>
            <div className="space-y-1">
                <p className="text-sm font-semibold text-[var(--sgss-navy)]">
                  Click to upload or drag & drop
                </p>
                <p className="text-xs text-gray-400">
                  Maximum file size 10MB per file.
                </p>
            </div>
          </div>
          <input
            type="file"
            multiple
            className="hidden"
            onChange={(e) => setFiles([...files, ...Array.from(e.target.files || [])])}
          />
        </label>

        {files.length > 0 && (
          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
            {files.map((f, idx) => (
              <div key={idx} className="flex justify-between items-center p-3 bg-white border border-gray-200 rounded-lg shadow-sm">
                <div className="flex items-center gap-3 overflow-hidden">
                   <div className="w-8 h-8 rounded bg-gray-100 flex items-center justify-center flex-shrink-0 text-gray-500 text-xs font-bold uppercase">
                      {f.name.split('.').pop()}
                   </div>
                   <div className="overflow-hidden">
                      <p className="text-sm font-medium text-gray-700 truncate">{f.name}</p>
                      <p className="text-xs text-gray-400">{(f.size / 1024).toFixed(1)} KB</p>
                   </div>
                </div>
                <button onClick={() => removeFile(idx)} className="p-1.5 text-gray-400 hover:text-red-500 rounded-full hover:bg-red-50 transition-colors">
                   <XMarkIcon className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}

        {uploadProgress !== null && uploadProgress < 100 && (
          <div className="mt-6">
             <div className="flex justify-between text-xs font-semibold text-[var(--sgss-navy)] mb-1.5">
                <span>Uploading...</span>
                <span>{uploadProgress}%</span>
             </div>
             <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
               <div
                 className="bg-[var(--sgss-gold)] h-2 rounded-full transition-all duration-300"
                 style={{ width: `${uploadProgress}%` }}
               />
             </div>
          </div>
        )}
      </div>

      {/* Warnings / errors */}
      {overLimit && (
        <Alert
          type="warning"
          message={`⚠️ Your Total (Ksh ${total.toLocaleString()}) exceeds the allowed limit (Ksh ${limit.toLocaleString()}). Adjust before proceeding.`}
        />
      )}
      {err && <Alert type="error" message={err} />}

      {/* Actions */}
      <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
        <Button onClick={() => nav(-1)} variant="outline" className="border-gray-300 text-gray-600 hover:bg-gray-50">
          Cancel
        </Button>
        <Button
          onClick={() => setShowSummary(true)}
          disabled={!canSubmit}
          className="bg-[var(--sgss-navy)] hover:bg-[var(--sgss-gold)] text-white shadow-xl shadow-blue-900/10 px-8 py-3 rounded-xl font-bold transition-transform hover:-translate-y-0.5"
        >
          Review & Submit Claim
        </Button>
      </div>

      {/* Summary modal */}
      {showSummary && (
        <Modal
          open
          onClose={() => setShowSummary(false)}
          title="Claim Summary Preview"
        >
          <div className="space-y-4 text-sm m-1 md:m-4">
            <div className="bg-blue-50 text-[var(--sgss-navy)] p-4 rounded-xl text-sm leading-relaxed">
              Please review your claim details before submission. Ensure all
              entries comply with the{" "}
              <strong className="font-bold">
                SGSS Medical Fund Byelaws (2024)
              </strong>
              .
            </div>

            <div className="border border-gray-200 rounded-xl overflow-hidden text-sm">
                <div className="bg-gray-50 px-4 py-3 border-b border-gray-200 font-semibold text-gray-700">Financial Breakdown</div>
                <div className="p-4 space-y-2">
                    <div className="flex justify-between">
                        <span className="text-gray-500">Claim Type</span>
                        <span className="font-medium capitalize">{type}</span>
                    </div>
                    <div className="flex justify-between text-lg font-bold text-[var(--sgss-navy)] border-t border-dashed border-gray-200 pt-2 mt-2">
                        <span>Total Claimed</span>
                        <span>Ksh {total.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-emerald-700 font-medium">
                        <span>Fund Liability (80%)</span>
                        <span>Ksh {fundShare.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-gray-700">
                        <span>Member Share (20%)</span>
                        <span>Ksh {memberShare.toLocaleString()}</span>
                    </div>
                </div>
            </div>

            {overLimit && (
              <Alert
                type="error"
                message="Submission blocked: exceeds your benefit limit as defined in Byelaws §6.3 (a)."
              />
            )}

            <div className="flex justify-end gap-3 pt-3">
              <Button variant="outline" onClick={() => setShowSummary(false)}>
                Edit Details
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={busy || overLimit}
                className="bg-[var(--sgss-navy)] hover:bg-[var(--sgss-gold)] text-white"
              >
                {busy ? "Submitting…" : "Confirm & Submit"}
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </PageTransition>
  );
}

/* ---------------------------------------------------------------------- */
/* 🧮 Computation Helper                                                   */
/* ---------------------------------------------------------------------- */

function toNumber(v: any): number {
  const n = typeof v === "string" ? parseFloat(v) : v;
  return isNaN(n as number) || n == null ? 0 : (n as number);
}

function computeClaimTotals(data: any, type: string) {
  const isCritical = !!data.critical_illness;
  const baseLimit = 250000;
  const criticalBoost = isCritical ? 200000 : 0;
  const limit = baseLimit + criticalBoost;

  let total = 0;

  if (type === "outpatient") {
    const consultation_fee = toNumber(data.consultation_fee);
    const house_visit_cost = toNumber(data.house_visit_cost);
    const medicine_cost = toNumber(data.medicine_cost);
    const investigation_cost = toNumber(data.investigation_cost);
    const procedure_cost = toNumber(data.procedure_cost);

    total =
      consultation_fee +
      house_visit_cost +
      medicine_cost +
      investigation_cost +
      procedure_cost;
  } else if (type === "inpatient") {
    const bed_charge_per_day = toNumber(data.bed_charge_per_day);
    const stay_days = toNumber(data.stay_days || 1);
    const shif_total = toNumber(data.shif_total);
    const inpatient_total = toNumber(data.inpatient_total);
    const doctor_total = toNumber(data.doctor_total);
    const claimable_total = toNumber(data.claimable_total);
    const discounts_total = toNumber(data.discounts_total);

    const accommodation = bed_charge_per_day * stay_days - shif_total;
    total =
      accommodation +
      inpatient_total +
      doctor_total +
      claimable_total -
      discounts_total;

    if (isCritical) {
      total += 200000;
    }
  } else if (type === "chronic") {
    const medicines = data.medicines || [];
    total = medicines.reduce(
      (sum: number, m: any) => sum + toNumber(m.cost),
      0
    );
  }

  const fundShare = total * 0.8;
  const memberShare = total * 0.2;
  const overLimit = total > limit;

  return { total, fundShare, memberShare, limit, overLimit };
}

/* ---------------------------------------------------------------------- */
/* 📄 Sub-forms (aligned with SGSS PDFs, but aggregated per section)      */
/* ---------------------------------------------------------------------- */

function OutpatientForm({ data, onChange }: any) {
  return (
    <div className="space-y-4">
      {/* Part A: Consultations */}
      <div className="border border-gray-100 rounded-xl p-4 bg-gray-50/50">
        <h4 className="font-bold mb-4 text-[var(--sgss-navy)] text-sm uppercase tracking-wider border-b border-gray-200 pb-2">
          Part A – Consultations
        </h4>
        <div className="grid md:grid-cols-2 gap-4">
          <Input
            label="Date of 1st Visit"
            type="date"
            value={data.date_of_first_visit || ""}
            onChange={(e) =>
              onChange("date_of_first_visit", e.target.value || "")
            }
          />
          <Input
            label="Diagnosis"
            placeholder="e.g. Malaria, Flu"
            value={data.diagnosis || ""}
            onChange={(e) => onChange("diagnosis", e.target.value)}
          />
          <Input
            label="Number of Consultations"
            type="number"
            value={data.consultations_count ?? ""}
            onChange={(e) =>
              onChange("consultations_count", Number(e.target.value || 0))
            }
          />
          <Input
            label="Total Consultation Fees (Ksh)"
            type="number"
            value={data.consultation_fee ?? ""}
            onChange={(e) =>
              onChange("consultation_fee", Number(e.target.value || 0))
            }
          />
        </div>

        <div className="mt-4 flex flex-col md:flex-row md:items-center gap-4 bg-white p-3 rounded-lg border border-gray-200">
          <label className="inline-flex items-center gap-3 text-sm font-medium text-gray-700 cursor-pointer">
            <input
              type="checkbox"
              className="w-4 h-4 text-[var(--sgss-navy)] rounded border-gray-300 focus:ring-[var(--sgss-navy)]"
              checked={!!data.has_house_visit}
              onChange={(e) => onChange("has_house_visit", e.target.checked)}
            />
            Was there a House Visit?
          </label>
          {data.has_house_visit && (
             <div className="flex-1 animate-in fade-in slide-in-from-left-2 duration-300">
                <Input
                  label="House Visit Cost (Ksh)"
                  type="number"
                  value={data.house_visit_cost ?? ""}
                  onChange={(e) =>
                    onChange("house_visit_cost", Number(e.target.value || 0))
                  }
                />
             </div>
          )}
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
          {/* Part B: Medicines / Injections */}
          <div className="border border-gray-100 rounded-xl p-4 bg-gray-50/50">
            <h4 className="font-bold mb-4 text-[var(--sgss-navy)] text-xs uppercase tracking-wider">
              Part B – Medicines
            </h4>
            <Input
              label="Total Cost (Ksh)"
              type="number"
              value={data.medicine_cost ?? ""}
              onChange={(e) =>
                onChange("medicine_cost", Number(e.target.value || 0))
              }
            />
          </div>

          {/* Part C: Investigations */}
          <div className="border border-gray-100 rounded-xl p-4 bg-gray-50/50">
            <h4 className="font-bold mb-4 text-[var(--sgss-navy)] text-xs uppercase tracking-wider">
              Part C – Investigations
            </h4>
            <Input
              label="Total Cost (Ksh)"
              type="number"
              value={data.investigation_cost ?? ""}
              onChange={(e) =>
                onChange("investigation_cost", Number(e.target.value || 0))
              }
            />
          </div>

          {/* Part D: Procedures */}
          <div className="border border-gray-100 rounded-xl p-4 bg-gray-50/50">
            <h4 className="font-bold mb-4 text-[var(--sgss-navy)] text-xs uppercase tracking-wider">
              Part D – Procedures
            </h4>
            <Input
              label="Total Cost (Ksh)"
              type="number"
              value={data.procedure_cost ?? ""}
              onChange={(e) =>
                onChange("procedure_cost", Number(e.target.value || 0))
              }
            />
          </div>
      </div>
    </div>
  );
}

function InpatientForm({ data, onChange }: any) {
  return (
    <div className="space-y-4">
      {/* Part A: Diagnosis & Hospital Stay */}
      <div className="border border-gray-100 rounded-xl p-4 bg-gray-50/50">
        <h4 className="font-bold mb-4 text-[var(--sgss-navy)] text-sm uppercase tracking-wider border-b border-gray-200 pb-2">
          Part A – Diagnosis & Stay
        </h4>
        <Input
          label="Hospital Name"
          value={data.hospital_name || ""}
          onChange={(e) => onChange("hospital_name", e.target.value)}
          className="mb-4"
        />
        <div className="grid md:grid-cols-2 gap-4 mb-4">
          <Input
            label="Date of Admission"
            type="date"
            value={data.date_of_admission || ""}
            onChange={(e) =>
              onChange("date_of_admission", e.target.value || "")
            }
          />
          <Input
            label="Date of Discharge"
            type="date"
            value={data.date_of_discharge || ""}
            onChange={(e) =>
              onChange("date_of_discharge", e.target.value || "")
            }
          />
        </div>
        <div className="grid md:grid-cols-2 gap-4">
          <Input
            label="Bed Charge / Day (Ksh)"
            type="number"
            value={data.bed_charge_per_day ?? ""}
            onChange={(e) =>
              onChange("bed_charge_per_day", Number(e.target.value || 0))
            }
          />
          <Input
            label="Days Stayed"
            type="number"
            value={data.stay_days ?? ""}
            onChange={(e) =>
              onChange("stay_days", Number(e.target.value || 0))
            }
          />
          <Input
            label="SHIF/SHA Total (Ksh)"
            type="number"
            value={data.shif_total ?? ""}
            onChange={(e) =>
              onChange("shif_total", Number(e.target.value || 0))
            }
          />
        </div>
      </div>

      {/* Part D/E/F/G Totals */}
      <div className="border border-gray-100 rounded-xl p-4 bg-gray-50/50">
        <h4 className="font-bold mb-4 text-[var(--sgss-navy)] text-sm uppercase tracking-wider border-b border-gray-200 pb-2">
          Parts D–G – Charges Breakdown
        </h4>
        <div className="grid md:grid-cols-2 gap-4">
            <Input
              label="Total Inpatient Charges (Part D)"
              type="number"
              value={data.inpatient_total ?? ""}
              onChange={(e) =>
                onChange("inpatient_total", Number(e.target.value || 0))
              }
            />
            <Input
              label="Total Doctor Charges (Part E)"
              type="number"
              value={data.doctor_total ?? ""}
              onChange={(e) =>
                onChange("doctor_total", Number(e.target.value || 0))
              }
            />
            <Input
              label="Other Claimable Charges (Part F)"
              type="number"
              value={data.claimable_total ?? ""}
              onChange={(e) =>
                onChange("claimable_total", Number(e.target.value || 0))
              }
            />
            <Input
              label="Discounts / Waivers (Part G)"
              type="number"
              value={data.discounts_total ?? ""}
              onChange={(e) =>
                onChange("discounts_total", Number(e.target.value || 0))
              }
            />
        </div>

        <div className="flex items-center gap-3 mt-4 bg-red-50 p-3 rounded-lg border border-red-100">
          <input
            type="checkbox"
            className="w-5 h-5 text-red-600 rounded border-red-300 focus:ring-red-500"
            checked={data.critical_illness || false}
            onChange={(e) => onChange("critical_illness", e.target.checked)}
          />
          <span className="text-sm font-semibold text-red-800">
            Critical Illness (Byelaws critical top-up applicable)
          </span>
        </div>
      </div>
    </div>
  );
}

function ChronicForm({ data, onChange }: any) {
  const medicines = data.medicines || [];
  const setMed = (i: number, k: string, v: any) =>
    onChange(
      "medicines",
      medicines.map((m: any, idx: number) =>
        idx === i ? { ...m, [k]: v } : m
      )
    );
  const addMed = () =>
    onChange("medicines", [
      ...medicines,
      { name: "", strength: "", dosage: "", duration: "", cost: 0 },
    ]);

  return (
    <div className="space-y-4">
      <h4 className="font-bold mb-2 text-[var(--sgss-navy)] text-sm uppercase tracking-wider flex justify-between items-center">
        <span>Chronic Illness Medicines</span>
        <span className="text-xs text-gray-500 normal-case font-normal">(per official requisition form)</span>
      </h4>
      
      {medicines.length === 0 && (
         <div className="text-center p-8 bg-gray-50 rounded-xl border border-dashed border-gray-200 text-gray-400 text-sm">
            No medicines added yet. Click below to add.
         </div>
      )}

      {medicines.map((m: any, i: number) => (
        <div
          key={i}
          className="grid md:grid-cols-9 gap-3 bg-white border border-gray-200 p-4 rounded-xl shadow-sm relative group"
        >
          <div className="md:col-span-2">
             <Input
                label="Name of Medicine"
                value={m.name}
                onChange={(e) => setMed(i, "name", e.target.value)}
              />
          </div>
          <div className="md:col-span-2">
          <Input
            label="Strength"
            value={m.strength || ""}
            onChange={(e) => setMed(i, "strength", e.target.value)}
          />
          </div>
          <div className="md:col-span-2">
          <Input
            label="Dosage"
            value={m.dosage || ""}
            onChange={(e) => setMed(i, "dosage", e.target.value)}
          />
          </div>
          <div className="md:col-span-2">
          <Input
            label="Duration"
            value={m.duration || ""}
            onChange={(e) => setMed(i, "duration", e.target.value)}
          />
          <Input
            label="Cost (Ksh)"
            type="number"
            value={m.cost ?? ""}
            onChange={(e) => setMed(i, "cost", Number(e.target.value || 0))}
          />
          
          <button 
            onClick={() => {
                const newMeds = medicines.filter((_: any, idx: number) => idx !== i);
                onChange("medicines", newMeds);
            }}
            className="absolute -top-2 -right-2 bg-red-100 text-red-500 rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
            title="Remove line"
          >
             <XMarkIcon className="w-4 h-4" />
          </button>
          </div>
        </div>
      ))}
      <Button variant="outline" onClick={addMed} className="w-full border-dashed">
        + Add Medicine Line
      </Button>
    </div>
  );
}
