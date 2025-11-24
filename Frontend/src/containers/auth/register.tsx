import React, { useState } from "react";
import api from "~/config/api";
import { useNavigate } from "react-router-dom";
import Button from "~/components/controls/button";
import Input from "~/components/controls/input";
import Alert from "~/components/controls/alert";

export default function RegisterPage() {
  const nav = useNavigate();
  const [data, setData] = useState<any>({});
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  const handleChange = (k: string, v: any) =>
    setData((p: any) => ({ ...p, [k]: v }));

  const handleSubmit = async () => {
    setBusy(true);
    setErr("");
    try {
      await api.post("auth/register/", data);
      nav("/login?pending=1");
    } catch (e: any) {
      setErr(e.response?.data?.detail || "Registration failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto p-6 space-y-6">
      <h2 className="text-2xl font-semibold text-center">Apply for Membership</h2>

      {err && <Alert type="error" message={err} />}

      <Input label="First Name" onChange={(e) => handleChange("first_name", e.target.value)} />
      <Input label="Last Name" onChange={(e) => handleChange("last_name", e.target.value)} />
      <Input label="Email" type="email" onChange={(e) => handleChange("email", e.target.value)} />
      <Input label="Phone Number" onChange={(e) => handleChange("phone", e.target.value)} />
      <Input label="ID / Passport Number" onChange={(e) => handleChange("id_number", e.target.value)} />

      <Input label="NHIF Number" onChange={(e) => handleChange("nhif_number", e.target.value)} />

      <label className="block font-medium mt-3">Membership Type</label>
      <select
        className="border rounded p-2 w-full"
        onChange={(e) => handleChange("membership_type", e.target.value)}
      >
        <option value="">-- Select Type --</option>
        <option value="single">Single</option>
        <option value="family">Family</option>
        <option value="senior">Senior Citizen</option>
        <option value="widow">Widow / Widower</option>
        <option value="parents">Parents</option>
      </select>

      <Input label="Username" onChange={(e) => handleChange("username", e.target.value)} />
      <Input label="Password" type="password" onChange={(e) => handleChange("password", e.target.value)} />

      <label className="flex items-center gap-2 text-sm mt-4">
        <input
          type="checkbox"
          onChange={(e) => handleChange("agreed", e.target.checked)}
        />
        I agree to follow the SGSS Constitution & Byelaws.
      </label>

      <Button
        onClick={handleSubmit}
        disabled={!data.agreed || busy}
        className="bg-[var(--sgss-navy)] text-white w-full"
      >
        {busy ? "Submitting…" : "Submit Application"}
      </Button>
    </div>
  );
}
