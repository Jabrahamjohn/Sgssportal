import React, { useState, useMemo, useEffect } from "react";
import api from "~/config/api";
import  Button  from "~/components/controls/button";
import  Input  from "~/components/controls/input";
import  Alert  from "~/components/controls/alert";
import Modal from "~/components/controls/modal";
import { useNavigate } from "react-router-dom";


import jsPDF from "jspdf";

function generateClaimPDF({ type, total, fundShare, memberShare, limit, formData }: any) {
  const doc = new jsPDF();
  const now = new Date().toLocaleString();

  doc.setFont("helvetica", "normal");
  doc.text("SIRI GURU SINGH SABHA MEDICAL FUND", 105, 15, { align: "center" });
  doc.text("Claim Summary Report", 105, 25, { align: "center" });

  doc.setFontSize(10);
  doc.text(`Generated on: ${now}`, 20, 35);

  doc.text("Claim Details:", 20, 50);
  doc.text(`Claim Type: ${type}`, 20, 58);
  doc.text(`Diagnosis / Notes: ${formData.diagnosis || "N/A"}`, 20, 65);

  doc.text(`Total Claimed: Ksh ${total.toLocaleString()}`, 20, 80);
  doc.text(`Fund Liability (80%): Ksh ${fundShare.toLocaleString()}`, 20, 87);
  doc.text(`Member Share (20%): Ksh ${memberShare.toLocaleString()}`, 20, 94);
  doc.text(`Claim Limit (Byelaws §6.3): Ksh ${limit.toLocaleString()}`, 20, 101);

  doc.setFont("helvetica", "italic");
  doc.text("This summary follows SGSS Medical Fund Byelaws (May 2024), Section 6.", 20, 115);

  doc.line(20, 120, 190, 120);
  doc.text("Claimant Signature: ____________________", 20, 135);
  doc.text("Committee Review: ____________________", 20, 145);

  doc.save(`SGSS_Claim_Summary_${Date.now()}.pdf`);
}


/* ---------------------------------------------------------------------- */
/* 🌍 Claim Form with Summary Preview + Balance Check                     */
/* ---------------------------------------------------------------------- */

export default function NewClaim() {
  const [type, setType] = useState("outpatient");
  const [formData, setFormData] = useState<any>({});
  const [files, setFiles] = useState<File[]>([]);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [balance, setBalance] = useState<number | null>(null);
  const [showSummary, setShowSummary] = useState(false);
  const nav = useNavigate();

  /* 🔹 Fetch remaining benefit balance from backend */
  useEffect(() => {
    api
      .get("members/me/benefit_balance/")
      .then((res) => setBalance(res.data.remaining_balance))
      .catch(() => setBalance(null));
  }, []);

  const handleChange = (key: string, value: any) =>
    setFormData((prev: any) => ({ ...prev, [key]: value }));

  const { total, limit, overLimit, fundShare, memberShare } = computeClaimTotals(formData, type);

  const canSubmit = !overLimit && total > 0;

  /* 🧾 Submit after confirmation */
  const handleSubmit = async () => {
    setBusy(true);
    setErr("");
    try {
      const res = await api.post("claims/", {
        claim_type: type,
        details: formData,
        status: "submitted",
      });

      const claimId = res.data.id;
      for (const f of files) {
        const form = new FormData();
        form.append("file", f);
        await api.post(`claims/${claimId}/attachments/`, form);
      }

      nav("/dashboard/member/claims");
    } catch (e: any) {
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

  return (
    <div className="p-6 space-y-6">
      <h2 className="text-2xl font-semibold">New Claim</h2>

      {/* Remaining Balance */}
      {balance !== null && (
        <Alert
          type="info"
          message={`Your remaining annual benefit balance is Ksh ${balance.toLocaleString()}`}
        />
      )}

      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Claim Type</label>
          <select
            className="border rounded px-2 py-2 w-full"
            value={type}
            onChange={(e) => setType(e.target.value)}
          >
            <option value="outpatient">Outpatient</option>
            <option value="inpatient">Inpatient</option>
            <option value="chronic">Chronic Illness</option>
          </select>
        </div>
      </div>

      <div className="border rounded p-4 bg-white shadow-sm">{renderForm()}</div>

      <div className="border rounded p-4">
        <h3 className="font-medium mb-2">Attachments</h3>
        <input
          type="file"
          multiple
          onChange={(e) => setFiles(Array.from(e.target.files || []))}
        />
      </div>

      {overLimit && (
        <Alert
          type="warning"
          message={`⚠️ Your total (Ksh ${total.toLocaleString()}) exceeds the allowed limit (Ksh ${limit.toLocaleString()}). Adjust before proceeding.`}
        />
      )}
      {err && <Alert type="error" message={err} />}

      <div className="flex gap-3">
        <Button onClick={() => nav(-1)} variant="outline">
          Cancel
        </Button>
        <Button onClick={() => setShowSummary(true)} disabled={!canSubmit}>
          Review & Submit
        </Button>
      </div>

      {/* 🔍 Summary Modal */}
      {showSummary && (
        <Modal open onClose={() => setShowSummary(false)} title="Claim Summary Preview">
          <div className="space-y-4">
            <p className="text-gray-700">
              Please review your claim details before submission. Ensure all entries
              comply with the <strong>SGSS Medical Fund Byelaws (2024)</strong>.
            </p>

            <div className="border rounded p-3 bg-gray-50">
              <p><strong>Claim Type:</strong> {type}</p>
              <p><strong>Total Claimed:</strong> Ksh {total.toLocaleString()}</p>
              <p><strong>Fund Liability (80%):</strong> Ksh {fundShare.toLocaleString()}</p>
              <p><strong>Member Share (20%):</strong> Ksh {memberShare.toLocaleString()}</p>
              <p><strong>Annual Limit:</strong> Ksh {limit.toLocaleString()}</p>
              {balance !== null && (
                <p><strong>Remaining Balance:</strong> Ksh {balance.toLocaleString()}</p>
              )}
            </div>

            {overLimit && (
              <Alert
                type="error"
                message="Submission blocked: exceeds your benefit limit as defined in Byelaws §6.3 (a)."
              />
            )}

            <div className="flex justify-end gap-3 pt-3">
              <Button variant="outline" onClick={() => setShowSummary(false)}>
                Edit
              </Button>
              <Button onClick={handleSubmit} disabled={busy || overLimit}>
                {busy ? "Submitting…" : "Confirm & Submit"}
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

/* ---------------------------------------------------------------------- */
/* 🧮 Computation Helper                                                   */
/* ---------------------------------------------------------------------- */
function computeClaimTotals(data: any, type: string) {
  const isCritical = !!data.critical_illness;
  const baseLimit = 250000;
  const criticalBoost = isCritical ? 200000 : 0;
  const limit = baseLimit + criticalBoost;

  let total = 0;
  if (type === "outpatient") {
    const { consultation_fee = 0, medicine_cost = 0, investigation_cost = 0, procedure_cost = 0 } = data;
    total = consultation_fee + medicine_cost + investigation_cost + procedure_cost;
  } else if (type === "inpatient") {
    const {
      bed_charge_per_day = 0,
      stay_days = 1,
      nhif_total = 0,
      inpatient_total = 0,
      doctor_total = 0,
      claimable_total = 0,
      discounts_total = 0,
    } = data;
    const accommodation = bed_charge_per_day * stay_days - nhif_total;
    total = accommodation + inpatient_total + doctor_total + claimable_total - discounts_total;
    if (isCritical) total += 200000;
  } else if (type === "chronic") {
    total = (data.medicines || []).reduce(
      (sum: number, m: any) => sum + (m.cost || 0),
      0
    );
  }

  const fundShare = total * 0.8;
  const memberShare = total * 0.2;
  const overLimit = total > limit;
  return { total, fundShare, memberShare, limit, overLimit };
}

/* ---------------------------------------------------------------------- */
/* 📄 Sub-forms (same as before, trimmed for brevity)                      */
/* ---------------------------------------------------------------------- */

function OutpatientForm({ data, onChange }: any) {
  const { total, fundShare, memberShare } = computeClaimTotals(data, "outpatient");
  return (
    <div className="space-y-3">
      <Input label="Diagnosis" value={data.diagnosis || ""} onChange={(e) => onChange("diagnosis", e.target.value)} />
      <Input label="Consultation Fee (Ksh)" type="number" value={data.consultation_fee || ""} onChange={(e) => onChange("consultation_fee", Number(e.target.value))} />
      <Input label="Medicine Cost (Ksh)" type="number" value={data.medicine_cost || ""} onChange={(e) => onChange("medicine_cost", Number(e.target.value))} />
      <Input label="Investigation Cost (Ksh)" type="number" value={data.investigation_cost || ""} onChange={(e) => onChange("investigation_cost", Number(e.target.value))} />
      <Input label="Procedure Cost (Ksh)" type="number" value={data.procedure_cost || ""} onChange={(e) => onChange("procedure_cost", Number(e.target.value))} />
      <div className="text-right border-t pt-2 text-sm">
        Fund: Ksh {fundShare.toLocaleString()} | Member: Ksh {memberShare.toLocaleString()}
      </div>
    </div>
  );
}

function InpatientForm({ data, onChange }: any) {
  const { total, fundShare, memberShare } = computeClaimTotals(data, "inpatient");
  return (
    <div className="space-y-3">
      <Input label="Hospital Name" value={data.hospital_name || ""} onChange={(e) => onChange("hospital_name", e.target.value)} />
      <Input label="Bed Charge/Day (Ksh)" type="number" value={data.bed_charge_per_day || ""} onChange={(e) => onChange("bed_charge_per_day", Number(e.target.value))} />
      <Input label="Days Stayed" type="number" value={data.stay_days || ""} onChange={(e) => onChange("stay_days", Number(e.target.value))} />
      <Input label="NHIF Total (Ksh)" type="number" value={data.nhif_total || ""} onChange={(e) => onChange("nhif_total", Number(e.target.value))} />
      <Input label="Inpatient Total (Ksh)" type="number" value={data.inpatient_total || ""} onChange={(e) => onChange("inpatient_total", Number(e.target.value))} />
      <Input label="Doctor Charges (Ksh)" type="number" value={data.doctor_total || ""} onChange={(e) => onChange("doctor_total", Number(e.target.value))} />
      <div className="flex items-center gap-2">
        <input type="checkbox" checked={data.critical_illness || false} onChange={(e) => onChange("critical_illness", e.target.checked)} />
        <span className="text-sm">Critical Illness (+200 000 Ksh Top-up)</span>
      </div>
      <div className="text-right border-t pt-2 text-sm">
        Fund: Ksh {fundShare.toLocaleString()} | Member: Ksh {memberShare.toLocaleString()}
      </div>
    </div>
  );
}

function ChronicForm({ data, onChange }: any) {
  const medicines = data.medicines || [];
  const setMed = (i: number, k: string, v: any) =>
    onChange("medicines", medicines.map((m: any, idx: number) => (idx === i ? { ...m, [k]: v } : m)));
  const addMed = () => onChange("medicines", [...medicines, { name: "", dosage: "", cost: 0 }]);
  const { total } = computeClaimTotals(data, "chronic");
  return (
    <div className="space-y-2">
      {medicines.map((m: any, i: number) => (
        <div key={i} className="grid md:grid-cols-3 gap-2 border p-2 rounded">
          <Input placeholder="Medicine" value={m.name} onChange={(e) => setMed(i, "name", e.target.value)} />
          <Input placeholder="Dosage" value={m.dosage} onChange={(e) => setMed(i, "dosage", e.target.value)} />
          <Input type="number" placeholder="Cost" value={m.cost} onChange={(e) => setMed(i, "cost", Number(e.target.value))} />
        </div>
      ))}
      <Button variant="outline" onClick={addMed}>+ Add Medicine</Button>
      <div className="text-right text-sm border-t pt-2">Total: Ksh {total.toLocaleString()}</div>
    </div>
  );
}
