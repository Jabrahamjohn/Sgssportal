// Frontend/src/pages/dashboard/member/claims-new.tsx
import React, { useState, useMemo } from "react";
import api from "~/config/api";
import  Button  from "~/components/controls/button";
import  Input from "~/components/controls/input";
import { useNavigate } from "react-router-dom";

export default function NewClaim() {
  const [type, setType] = useState("outpatient");
  const [formData, setFormData] = useState<any>({});
  const [files, setFiles] = useState<File[]>([]);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const nav = useNavigate();

  const handleChange = (key: string, value: any) =>
    setFormData((prev: any) => ({ ...prev, [key]: value }));

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

      {err && <div className="text-red-600">{err}</div>}

      <div className="flex gap-3">
        <Button onClick={() => nav(-1)} variant="outline">
          Cancel
        </Button>
        <Button onClick={handleSubmit} disabled={busy}>
          {busy ? "Submitting..." : "Submit Claim"}
        </Button>
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------------- */
/* 🩺 OUTPATIENT FORM — includes 80/20 computation                        */
/* ---------------------------------------------------------------------- */
function OutpatientForm({ data, onChange }: any) {
  const totalClaimed = useMemo(() => {
    const { consultation_fee = 0, medicine_cost = 0, investigation_cost = 0, procedure_cost = 0 } = data;
    return consultation_fee + medicine_cost + investigation_cost + procedure_cost;
  }, [data]);

  const fundShare = useMemo(() => totalClaimed * 0.8, [totalClaimed]);
  const memberShare = useMemo(() => totalClaimed * 0.2, [totalClaimed]);

  return (
    <div className="space-y-4">
      <h3 className="font-semibold mb-3 text-gray-800">Outpatient Claim</h3>
      <Input label="Diagnosis" value={data.diagnosis || ""} onChange={(e) => onChange("diagnosis", e.target.value)} />
      <Input label="Date of Visit" type="date" value={data.date_of_first_visit || ""} onChange={(e) => onChange("date_of_first_visit", e.target.value)} />
      <Input label="Consultation Fee (Ksh)" type="number" value={data.consultation_fee || ""} onChange={(e) => onChange("consultation_fee", Number(e.target.value))} />
      <Input label="Medicine Cost (Ksh)" type="number" value={data.medicine_cost || ""} onChange={(e) => onChange("medicine_cost", Number(e.target.value))} />
      <Input label="Investigation Cost (Ksh)" type="number" value={data.investigation_cost || ""} onChange={(e) => onChange("investigation_cost", Number(e.target.value))} />
      <Input label="Procedure Cost (Ksh)" type="number" value={data.procedure_cost || ""} onChange={(e) => onChange("procedure_cost", Number(e.target.value))} />

      <div className="text-right mt-4 border-t pt-3 space-y-1">
        <div>Total Claimed: <strong>Ksh {totalClaimed.toLocaleString()}</strong></div>
        <div>Fund Liability (80%): <strong className="text-green-700">Ksh {fundShare.toLocaleString()}</strong></div>
        <div>Member Share (20%): <strong className="text-blue-700">Ksh {memberShare.toLocaleString()}</strong></div>
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------------- */
/* 🏥 INPATIENT FORM — includes 80/20 + critical illness top-up logic     */
/* ---------------------------------------------------------------------- */
function InpatientForm({ data, onChange }: any) {
  const total = useMemo(() => {
    const {
      bed_charge_per_day = 0,
      stay_days = 1,
      nhif_total = 0,
      inpatient_total = 0,
      doctor_total = 0,
      claimable_total = 0,
      discounts_total = 0,
      critical_illness = false,
    } = data;

    const accommodation = bed_charge_per_day * stay_days - nhif_total;
    const baseTotal = accommodation + inpatient_total + doctor_total + claimable_total - discounts_total;

    return critical_illness ? baseTotal + 200000 : baseTotal; // 🔹 Add critical illness top-up
  }, [data]);

  const fundShare = useMemo(() => total * 0.8, [total]);
  const memberShare = useMemo(() => total * 0.2, [total]);

  return (
    <div className="space-y-4">
      <h3 className="font-semibold mb-3 text-gray-800">Inpatient Claim</h3>
      <Input label="Hospital Name" value={data.hospital_name || ""} onChange={(e) => onChange("hospital_name", e.target.value)} />
      <div className="grid md:grid-cols-2 gap-3">
        <Input label="Admission Date" type="date" value={data.admission_date || ""} onChange={(e) => onChange("admission_date", e.target.value)} />
        <Input label="Discharge Date" type="date" value={data.discharge_date || ""} onChange={(e) => onChange("discharge_date", e.target.value)} />
      </div>
      <Input label="Bed Charge per Day (Ksh)" type="number" value={data.bed_charge_per_day || ""} onChange={(e) => onChange("bed_charge_per_day", Number(e.target.value))} />
      <Input label="Number of Days Stayed" type="number" value={data.stay_days || ""} onChange={(e) => onChange("stay_days", Number(e.target.value))} />
      <Input label="NHIF Total (Ksh)" type="number" value={data.nhif_total || ""} onChange={(e) => onChange("nhif_total", Number(e.target.value))} />
      <Input label="Inpatient Charges Total (Ksh)" type="number" value={data.inpatient_total || ""} onChange={(e) => onChange("inpatient_total", Number(e.target.value))} />
      <Input label="Doctor Charges Total (Ksh)" type="number" value={data.doctor_total || ""} onChange={(e) => onChange("doctor_total", Number(e.target.value))} />
      <Input label="Claimable Charges Total (Ksh)" type="number" value={data.claimable_total || ""} onChange={(e) => onChange("claimable_total", Number(e.target.value))} />
      <Input label="Discounts Total (Ksh)" type="number" value={data.discounts_total || ""} onChange={(e) => onChange("discounts_total", Number(e.target.value))} />

      <div className="flex items-center gap-2 mt-2">
        <input type="checkbox" checked={data.critical_illness || false} onChange={(e) => onChange("critical_illness", e.target.checked)} />
        <label className="text-sm">Mark as Critical Illness (+Ksh 200,000 top-up)</label>
      </div>

      <div className="text-right mt-4 border-t pt-3 space-y-1">
        <div>Total Payable: <strong>Ksh {total.toLocaleString()}</strong></div>
        <div>Fund Liability (80%): <strong className="text-green-700">Ksh {fundShare.toLocaleString()}</strong></div>
        <div>Member Share (20%): <strong className="text-blue-700">Ksh {memberShare.toLocaleString()}</strong></div>
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------------- */
/* 💊 CHRONIC FORM — simple total only                                    */
/* ---------------------------------------------------------------------- */
function ChronicForm({ data, onChange }: any) {
  const medicines = data.medicines || [];

  const addMedicine = () => {
    onChange("medicines", [
      ...medicines,
      { name: "", strength: "", dosage: "", duration: "", cost: 0 },
    ]);
  };

  const setMedicine = (i: number, key: string, value: any) => {
    const updated = medicines.map((m: any, idx: number) =>
      idx === i ? { ...m, [key]: value } : m
    );
    onChange("medicines", updated);
  };

  const total = useMemo(
    () => medicines.reduce((sum: number, m: any) => sum + (m.cost || 0), 0),
    [medicines]
  );

  return (
    <div className="space-y-4">
      <h3 className="font-semibold mb-3 text-gray-800">Chronic Illness Medication</h3>
      {medicines.map((m: any, i: number) => (
        <div key={i} className="grid md:grid-cols-5 gap-2 border p-3 rounded">
          <Input placeholder="Medicine Name" value={m.name} onChange={(e) => setMedicine(i, "name", e.target.value)} />
          <Input placeholder="Strength" value={m.strength} onChange={(e) => setMedicine(i, "strength", e.target.value)} />
          <Input placeholder="Dosage" value={m.dosage} onChange={(e) => setMedicine(i, "dosage", e.target.value)} />
          <Input placeholder="Duration" value={m.duration} onChange={(e) => setMedicine(i, "duration", e.target.value)} />
          <Input type="number" placeholder="Cost" value={m.cost} onChange={(e) => setMedicine(i, "cost", Number(e.target.value))} />
        </div>
      ))}
      <Button variant="outline" onClick={addMedicine}>
        + Add Medicine
      </Button>

      <div className="text-right text-lg font-semibold border-t pt-3">
        Total Cost: Ksh {total.toLocaleString()}
      </div>
    </div>
  );
}
