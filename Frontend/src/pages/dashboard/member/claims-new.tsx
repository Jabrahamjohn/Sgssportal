// Frontend/src/pages/dashboard/member/claims-new.tsx
import React, { useState, useEffect } from "react";
import api from "~/config/api";
import Button from "~/components/controls/button";
import Input from "~/components/controls/input";
import Alert from "~/components/controls/alert";
import Modal from "~/components/controls/modal";
import { useNavigate } from "react-router-dom";
import { 
  ArrowUpTrayIcon, 
  DocumentTextIcon, 
  XMarkIcon, 
  ChevronRightIcon, 
  ChevronLeftIcon,
  CheckIcon,
  InformationCircleIcon,
  BanknotesIcon,
  ShieldCheckIcon,
  Square3Stack3DIcon
} from "@heroicons/react/24/outline";
import PageTransition from "~/components/animations/PageTransition";
import { motion, AnimatePresence } from "framer-motion";
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

  // 🔹 Upload copy to backend
  const form = new FormData();
  form.append("file", blob, "claim_summary.pdf");
  try {
    await api.post(`claims/${claimId}/upload_summary/`, form, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  } catch (err) {
    console.warn("⚠️ PDF upload failed", err);
  }
}

/* ---------------------------------------------------------------------- */
/* 🌍 Claim Form with Stepper & Framer Motion Transitions                 */
/* ---------------------------------------------------------------------- */

const STEPS = [
  { id: 1, title: "Category", icon: Square3Stack3DIcon },
  { id: 2, title: "Details", icon: DocumentTextIcon },
  { id: 3, title: "Evidence", icon: ShieldCheckIcon },
];

export default function NewClaim() {
  const [step, setStep] = useState(1);
  const [type, setType] = useState<"outpatient" | "inpatient" | "chronic">("outpatient");
  const [formData, setFormData] = useState<any>({});
  const [files, setFiles] = useState<File[]>([]);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [balance, setBalance] = useState<number | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const nav = useNavigate();

  useEffect(() => {
    api.get("members/me/benefit_balance/").then((res) => setBalance(res.data.remaining_balance)).catch(() => setBalance(null));
  }, []);

  const handleChange = (key: string, value: any) => setFormData((prev: any) => ({ ...prev, [key]: value }));

  const { total, limit, overLimit, fundShare, memberShare } = computeClaimTotals(formData, type);

  const validateStep = (s: number) => {
    if (s === 1) return !!type;
    if (s === 2) {
       if (type === 'outpatient') return !!formData.diagnosis && !!formData.date_of_first_visit;
       if (type === 'inpatient') return !!formData.hospital_name && !!formData.date_of_admission;
       if (type === 'chronic') return (formData.medicines?.length || 0) > 0;
    }
    return true;
  };

  const handleNext = () => {
    if (validateStep(step)) setStep(step + 1);
    else setErr("Please complete the required fields before proceeding.");
  };

  const handleBack = () => setStep(step - 1);

  const handleSubmit = async () => {
    setBusy(true);
    setErr("");
    try {
      const res = await api.post("claims/", {
        claim_type: type,
        details: formData,
        status: "submitted",
      });
      const claimId = res.data.id as string;

      if (files.length) {
        for (const f of files) {
          const form = new FormData();
          form.append("file", f);
          form.append("claim", claimId);
          await api.post("claim-attachments/", form, {
            headers: { "Content-Type": "multipart/form-data" },
            onUploadProgress: (e) => e.total && setUploadProgress(Math.round((e.loaded / e.total) * 100))
          });
        }
      }
      await generateClaimPDF({ type, total, fundShare, memberShare, limit, formData, claimId });
      nav("/dashboard/member/claims");
    } catch (e: any) {
      setErr(e.response?.data?.detail || "Failed to submit claim");
    } finally {
      setBusy(false);
    }
  };

  return (
    <PageTransition className="max-w-4xl mx-auto space-y-8 pb-12">
      {/* STEPPER UI */}
      <div className="flex justify-between items-center mb-12 relative px-4">
        {/* Progress Line */}
        <div className="absolute top-1/2 left-0 w-full h-0.5 bg-gray-100 -translate-y-1/2 z-0"></div>
        <div className="absolute top-1/2 left-0 h-0.5 bg-[var(--sgss-gold)] -translate-y-1/2 z-0 transition-all duration-500" style={{ width: `${(step - 1) * 50}%` }}></div>

        {STEPS.map((s) => {
          const Icon = s.icon;
          const isActive = step === s.id;
          const isComplete = step > s.id;

          return (
            <div key={s.id} className="relative z-10 flex flex-col items-center">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 border-2 ${
                isActive ? "bg-white border-[var(--sgss-gold)] text-[var(--sgss-gold)] shadow-xl scale-110" : 
                isComplete ? "bg-[var(--sgss-gold)] border-[var(--sgss-gold)] text-white" : 
                "bg-gray-50 border-gray-200 text-gray-300"
              }`}>
                {isComplete ? <CheckIcon className="w-6 h-6" /> : <Icon className="w-6 h-6" />}
              </div>
              <span className={`text-[10px] uppercase font-bold tracking-widest mt-2 transition-colors ${isActive ? "text-[var(--sgss-navy)]" : "text-gray-400"}`}>
                {s.title}
              </span>
            </div>
          );
        })}
      </div>

      <AnimatePresence mode="wait">
        {step === 1 && (
          <motion.div 
            key="step1" 
            initial={{ opacity: 0, x: 20 }} 
            animate={{ opacity: 1, x: 0 }} 
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="sgss-card p-4 md:p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-blue-50 rounded-2xl">
                  <Square3Stack3DIcon className="w-6 h-6 text-[var(--sgss-navy)]" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-[var(--sgss-navy)]">Select Category</h2>
                  <p className="text-xs text-gray-500">How would you like to categorize this medical expense?</p>
                </div>
              </div>

              <div className="grid md:grid-cols-3 gap-4">
                {[
                  { id: "outpatient", label: "Outpatient", desc: "Consultations, Labs, Pharmacy", color: "blue" },
                  { id: "inpatient", label: "Inpatient", desc: "Admission, Surgery, Ward charges", color: "emerald" },
                  { id: "chronic", label: "Chronic", desc: "Long-term Medication Support", color: "amber" }
                ].map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setType(cat.id as any)}
                    className={`p-6 rounded-2xl text-left border-2 transition-all ${
                      type === cat.id 
                      ? "border-[var(--sgss-gold)] bg-white shadow-xl -translate-y-1" 
                      : "border-gray-100 bg-gray-50/50 hover:bg-white hover:border-gray-200"
                    }`}
                  >
                    <div className={`w-10 h-10 rounded-xl mb-4 flex items-center justify-center bg-${cat.color}-100 text-${cat.color}-600 font-bold`}>
                      {cat.label[0]}
                    </div>
                    <h3 className="font-bold text-[var(--sgss-navy)]">{cat.label}</h3>
                    <p className="text-[10px] text-gray-500 mt-1">{cat.desc}</p>
                  </button>
                ))}
              </div>

              {balance !== null && (
                <div className="mt-12 p-6 rounded-2xl bg-gradient-to-br from-[var(--sgss-navy)] to-[#0c1b64] text-white overflow-hidden relative group">
                  <div className="absolute -right-4 -bottom-4 opacity-10 group-hover:scale-110 transition-transform duration-700">
                    <BanknotesIcon className="w-32 h-32" />
                  </div>
                  <div className="relative z-10 flex justify-between items-end">
                    <div>
                      <span className="text-[10px] uppercase font-bold tracking-[0.2em] text-white/60">Annual Benefit Balance</span>
                      <h3 className="text-3xl font-bold mt-1">KSh {balance.toLocaleString()}</h3>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] block opacity-70">SGSS Medical Fund</span>
                      <span className="text-xs font-medium">Byelaws 2024</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div 
            key="step2" 
            initial={{ opacity: 0, x: 20 }} 
            animate={{ opacity: 1, x: 0 }} 
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="sgss-card p-4 md:p-8">
               <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-amber-50 rounded-2xl">
                  <DocumentTextIcon className="w-6 h-6 text-amber-600" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-[var(--sgss-navy)]">{type.toUpperCase()} Details</h2>
                  <p className="text-xs text-gray-500">Provide hospital info and expense breakdown.</p>
                </div>
              </div>
              <Divider className="!mb-8" />
              {type === "inpatient" ? <InpatientForm data={formData} onChange={handleChange} /> : 
               type === "chronic" ? <ChronicForm data={formData} onChange={handleChange} /> : 
               <OutpatientForm data={formData} onChange={handleChange} />}
            </div>
          </motion.div>
        )}

        {step === 3 && (
          <motion.div 
            key="step3" 
            initial={{ opacity: 0, x: 20 }} 
            animate={{ opacity: 1, x: 0 }} 
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="sgss-card p-4 md:p-8">
               <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-emerald-50 rounded-2xl">
                  <ShieldCheckIcon className="w-6 h-6 text-emerald-600" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-[var(--sgss-navy)]">Evidence & Preview</h2>
                  <p className="text-xs text-gray-500">Upload your receipts and review the claim summary.</p>
                </div>
              </div>

              {/* Upload area */}
              <div className="mb-8">
                <label className="group flex flex-col items-center justify-center border-2 border-dashed border-gray-200 rounded-3xl p-10 cursor-pointer bg-gray-50/50 hover:bg-emerald-50/30 hover:border-emerald-200 transition-all">
                  <div className="w-16 h-16 rounded-2xl bg-white shadow-sm flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <ArrowUpTrayIcon className="w-8 h-8 text-[var(--sgss-gold)]" />
                  </div>
                  <p className="text-sm font-bold text-[var(--sgss-navy)]">Add Receipts / Invoices</p>
                  <p className="text-xs text-gray-400 mt-1">Upload images or PDF files (Max 10MB)</p>
                  <input type="file" multiple className="hidden" onChange={(e) => setFiles([...files, ...Array.from(e.target.files || [])])} />
                </label>

                {files.length > 0 && (
                  <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
                    {files.map((f, idx) => (
                      <div key={idx} className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm relative group h-32 flex flex-col items-center justify-center text-center">
                        <div className="text-[var(--sgss-gold)] mb-2">
                           <DocumentTextIcon className="w-8 h-8" />
                        </div>
                        <p className="text-[10px] font-bold text-gray-600 truncate w-full px-2 uppercase tracking-tighter">{f.name}</p>
                        <button 
                          onClick={() => setFiles(files.filter((_, i) => i !== idx))}
                          className="absolute -top-2 -right-2 bg-red-100 text-red-600 rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <XMarkIcon className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Review Strip */}
              <div className="bg-gray-50 rounded-3xl p-6 md:p-8 space-y-6">
                 <div className="flex justify-between items-end border-b border-gray-200 pb-4">
                    <div>
                       <span className="text-[10px] uppercase font-bold text-gray-400 tracking-widest">Total Liability</span>
                       <h3 className="text-3xl font-black text-[var(--sgss-navy)]">KSh {total.toLocaleString()}</h3>
                    </div>
                    <div className="text-right">
                       <span className={`text-xs font-bold ${overLimit ? "text-red-500" : "text-emerald-600"}`}>
                        {overLimit ? "EXCEEDS LIMIT" : "WITHIN LIMIT"}
                       </span>
                    </div>
                 </div>
                 <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white p-4 rounded-2xl border border-gray-100">
                       <span className="text-[10px] block font-bold text-emerald-600 mb-1">FUND (80%)</span>
                       <span className="text-xl font-bold text-gray-800">KSh {fundShare.toLocaleString()}</span>
                    </div>
                    <div className="bg-white p-4 rounded-2xl border border-gray-100">
                       <span className="text-[10px] block font-bold text-amber-500 mb-1">MEMBER (20%)</span>
                       <span className="text-xl font-bold text-gray-800">KSh {memberShare.toLocaleString()}</span>
                    </div>
                 </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ERROR DISPLAY */}
      {err && <Alert type="error" message={err} className="rounded-2xl border-none shadow-sm" />}

      {/* ACTIONS */}
      <div className="flex justify-between items-center pt-8 border-t border-gray-100">
        <Button 
          variant="outline" 
          onClick={step === 1 ? () => nav(-1) : handleBack}
          className="rounded-xl px-8 h-12 h-12 border-gray-200"
        >
          <ChevronLeftIcon className="w-4 h-4 mr-2" />
          {step === 1 ? "Cancel" : "Back"}
        </Button>

        {step < 3 ? (
          <Button 
            onClick={handleNext}
            className="bg-[var(--sgss-navy)] text-white rounded-xl px-10 h-12 font-bold shadow-xl shadow-blue-900/10"
          >
            Next Step
            <ChevronRightIcon className="w-4 h-4 ml-2" />
          </Button>
        ) : (
          <Button 
            onClick={handleSubmit}
            disabled={busy || total === 0}
            loading={busy}
            className="bg-[var(--sgss-gold)] text-white rounded-xl px-12 h-12 font-bold shadow-xl shadow-amber-500/10"
          >
            Authorize & Submit
          </Button>
        )}
      </div>
    </PageTransition>
  );
}

const Divider = ({ className = "" }) => <div className={`h-px bg-gray-100 w-full ${className}`} />;

// ... Helper functions and Sub-forms remain same but with minor UI polishing in the return JSX ...

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
    total = toNumber(data.consultation_fee) + toNumber(data.house_visit_cost) + toNumber(data.medicine_cost) + toNumber(data.investigation_cost) + toNumber(data.procedure_cost);
  } else if (type === "inpatient") {
    const accommodation = toNumber(data.bed_charge_per_day) * toNumber(data.stay_days || 1) - toNumber(data.shif_total);
    total = accommodation + toNumber(data.inpatient_total) + toNumber(data.doctor_total) + toNumber(data.claimable_total) - toNumber(data.discounts_total);
    if (isCritical) total += 200000;
  } else if (type === "chronic") {
    total = (data.medicines || []).reduce((sum: number, m: any) => sum + toNumber(m.cost), 0);
  }

  return { total, fundShare: total * 0.8, memberShare: total * 0.2, limit, overLimit: total > limit };
}

function OutpatientForm({ data, onChange }: any) {
  return (
    <div className="space-y-8">
      <div className="grid md:grid-cols-2 gap-6 p-6 bg-gray-50/50 rounded-2xl border border-gray-100">
        <Input label="Date of 1st Visit" type="date" value={data.date_of_first_visit || ""} onChange={(e) => onChange("date_of_first_visit", e.target.value)} />
        <Input label="Diagnosis" placeholder="e.g. Malaria, Dental Pain" value={data.diagnosis || ""} onChange={(e) => onChange("diagnosis", e.target.value)} />
        <Input label="Number of Consultations" type="number" value={data.consultations_count ?? ""} onChange={(e) => onChange("consultations_count", Number(e.target.value))} />
        <Input label="Total Fees (Ksh)" type="number" value={data.consultation_fee ?? ""} onChange={(e) => onChange("consultation_fee", Number(e.target.value))} />
      </div>
      <div className="grid md:grid-cols-3 gap-4">
        <Input label="Medicines Cost" type="number" value={data.medicine_cost ?? ""} onChange={(e) => onChange("medicine_cost", Number(e.target.value))} />
        <Input label="Investigations" type="number" value={data.investigation_cost ?? ""} onChange={(e) => onChange("investigation_cost", Number(e.target.value))} />
        <Input label="Procedures" type="number" value={data.procedure_cost ?? ""} onChange={(e) => onChange("procedure_cost", Number(e.target.value))} />
      </div>
    </div>
  );
}

function InpatientForm({ data, onChange }: any) {
  return (
    <div className="space-y-8">
      <div className="p-6 bg-gray-50/50 rounded-2xl border border-gray-100 space-y-4">
        <Input label="Hospital Name" value={data.hospital_name || ""} onChange={(e) => onChange("hospital_name", e.target.value)} />
        <div className="grid md:grid-cols-2 gap-4">
          <Input label="Date of Admission" type="date" value={data.date_of_admission || ""} onChange={(e) => onChange("date_of_admission", e.target.value)} />
          <Input label="Date of Discharge" type="date" value={data.date_of_discharge || ""} onChange={(e) => onChange("date_of_discharge", e.target.value)} />
        </div>
      </div>
      <div className="grid md:grid-cols-4 gap-4">
        <Input label="Stay Days" type="number" value={data.stay_days ?? ""} onChange={(e) => onChange("stay_days", Number(e.target.value))} />
        <Input label="Inpatient Charges" type="number" value={data.inpatient_total ?? ""} onChange={(e) => onChange("inpatient_total", Number(e.target.value))} />
        <Input label="Doctor Charges" type="number" value={data.doctor_total ?? ""} onChange={(e) => onChange("doctor_total", Number(e.target.value))} />
        <Input label="SHIF Total" type="number" value={data.shif_total ?? ""} onChange={(e) => onChange("shif_total", Number(e.target.value))} />
      </div>
    </div>
  );
}

function ChronicForm({ data, onChange }: any) {
  const medicines = data.medicines || [];
  const addMed = () => onChange("medicines", [...medicines, { name: "", cost: 0 }]);
  const setMed = (i: number, k: string, v: any) => onChange("medicines", medicines.map((m: any, idx: number) => idx === i ? { ...m, [k]: v } : m));
  
  return (
    <div className="space-y-4">
      {medicines.map((m: any, i: number) => (
        <div key={i} className="flex gap-4 p-4 bg-white border border-gray-100 rounded-2xl relative shadow-sm">
          <div className="flex-1"><Input label="Medicine Name" value={m.name} onChange={(e) => setMed(i, "name", e.target.value)} /></div>
          <div className="w-40"><Input label="Cost (Ksh)" type="number" value={m.cost} onChange={(e) => setMed(i, "cost", Number(e.target.value))} /></div>
        </div>
      ))}
      <Button variant="outline" onClick={addMed} className="w-full border-dashed h-12 rounded-xl text-gray-400 font-bold">+ Add Prescription Item</Button>
    </div>
  );
}
