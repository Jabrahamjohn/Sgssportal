// Frontend/src/containers/auth/register.tsx
import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "~/config/api";
import Input from "~/components/controls/input";
import Button from "~/components/controls/button";
import Alert from "~/components/controls/alert";

type Dependant = {
  full_name: string;
  date_of_birth: string;
  blood_group: string;
  id_number: string;
};

export default function Register() {
  const nav = useNavigate();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    first_name: "",
    last_name: "",
    membership_type: "single",
    mailing_address: "",
    phone_mobile: "",
    shif_number: "",
    family_doctor_name: "",
    family_doctor_phone_office: "",
  });

  const [dependants, setDependants] = useState<Dependant[]>([]);

  const handleChange = (key: string, value: string) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const addDependant = () =>
    setDependants((prev) => [
      ...prev,
      { full_name: "", date_of_birth: "", blood_group: "", id_number: "" },
    ]);

  const updateDependant = (idx: number, key: keyof Dependant, value: string) =>
    setDependants((prev) =>
      prev.map((d, i) => (i === idx ? { ...d, [key]: value } : d))
    );

  const removeDependant = (idx: number) =>
    setDependants((prev) => prev.filter((_, i) => i !== idx));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setBusy(true);
    try {
      await api.post("auth/register/", {
        username: form.username,
        email: form.email,
        password: form.password,
        first_name: form.first_name,
        last_name: form.last_name,
        membership_type: form.membership_type,
        mailing_address: form.mailing_address,
        phone_mobile: form.phone_mobile,
        shif_number: form.shif_number,
        family_doctor_name: form.family_doctor_name,
        family_doctor_phone_office: form.family_doctor_phone_office,
        dependants: dependants.filter((d) => d.full_name.trim().length > 0),
      });

      setSuccess(
        "Registration submitted successfully. Your membership is pending committee approval."
      );
      setTimeout(() => nav("/login"), 2000);
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.detail || "Registration failed.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-3xl bg-white shadow-md rounded-xl p-6 md:p-8 space-y-6">
        <h2 className="text-2xl font-semibold text-[var(--sgss-navy)] text-center">
          SGSS Medical Fund Registration
        </h2>
        <p className="text-sm text-gray-600 text-center">
          Complete the form below. Your application will be reviewed by the
          Medical Fund Committee in line with the Constitution &amp; Byelaws.
        </p>

        {error && <Alert type="error" message={error} />}
        {success && <Alert type="success" message={success} />}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Info */}
          <div className="grid md:grid-cols-2 gap-4">
            <Input
              label="First Name"
              value={form.first_name}
              onChange={(e) => handleChange("first_name", e.target.value)}
              required
            />
            <Input
              label="Last Name"
              value={form.last_name}
              onChange={(e) => handleChange("last_name", e.target.value)}
              required
            />
            <Input
              label="Username"
              value={form.username}
              onChange={(e) => handleChange("username", e.target.value)}
              required
            />
            <Input
              label="Email"
              type="email"
              value={form.email}
              onChange={(e) => handleChange("email", e.target.value)}
              required
            />
          </div>

          {/* Passwords */}
          <div className="grid md:grid-cols-2 gap-4">
            <Input
              label="Password"
              type="password"
              value={form.password}
              onChange={(e) => handleChange("password", e.target.value)}
              required
            />
            <Input
              label="Confirm Password"
              type="password"
              value={form.confirmPassword}
              onChange={(e) =>
                handleChange("confirmPassword", e.target.value)
              }
              required
            />
          </div>

          {/* Membership & Contact */}
          <div className="">
            <div>
              <label className="block text-sm font-medium mb-1">
                Membership Type
              </label>
              <select
                className="border rounded px-3 py-2 w-full text-sm"
                value={form.membership_type}
                onChange={(e) =>
                  handleChange("membership_type", e.target.value)
                }
              >
                <option value="single">Single</option>
                <option value="family">Family</option>
                <option value="joint">Joint</option>
                <option value="senior">Senior Citizen</option>
                <option value="life">Life Member</option>
                <option value="patron">Patron</option>
                <option value="vice_patron">Vice Patron</option>
              </select>
            </div>
            <Input
              label="Mobile Phone"
              value={form.phone_mobile}
              onChange={(e) => handleChange("phone_mobile", e.target.value)}
            />
          </div>

          <Input
            label="Mailing Address"
            value={form.mailing_address}
            onChange={(e) => handleChange("mailing_address", e.target.value)}
          />

          {/* Doctor / SHIF/SHA */}
          <div className="grid md:grid-cols-2 gap-4">
            <Input
              label="Family Doctor Name"
              value={form.family_doctor_name}
              onChange={(e) =>
                handleChange("family_doctor_name", e.target.value)
              }
            />
            <Input
              label="Family Doctor Phone (Office)"
              value={form.family_doctor_phone_office}
              onChange={(e) =>
                handleChange("family_doctor_phone_office", e.target.value)
              }
            />
            <Input
              label="SHIF/SHA Number"
              value={form.shif_number}
              onChange={(e) => handleChange("shif_number", e.target.value)}
            />
          </div>

          {/* Dependants */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-[var(--sgss-navy)]">
                Dependants (optional)
              </h3>
              <Button variant="outline" type="button" onClick={addDependant}>
                + Add Dependant
              </Button>
            </div>

            {dependants.length === 0 && (
              <p className="text-xs text-gray-500">
                Add your spouse / children here if applying for Family / Joint
                membership.
              </p>
            )}

            <div className="space-y-3">
              {dependants.map((d, i) => (
                <div
                  key={i}
                  className="border rounded-lg p-3 grid md:grid-cols-2 gap-2 items-end"
                >
                  <Input
                    label="Full Name"
                    value={d.full_name}
                    onChange={(e) =>
                      updateDependant(i, "full_name", e.target.value)
                    }
                  />
                  <Input
                    label="Date of Birth"
                    type="date"
                    value={d.date_of_birth}
                    onChange={(e) =>
                      updateDependant(i, "date_of_birth", e.target.value)
                    }
                  />
                  <Input
                    label="Blood Group"
                    value={d.blood_group}
                    onChange={(e) =>
                      updateDependant(i, "blood_group", e.target.value)
                    }
                  />
                  <div className="flex gap-4">
                    <Input
                      label="ID / Birth Cert No."
                      value={d.id_number}
                      onChange={(e) =>
                        updateDependant(i, "id_number", e.target.value)
                      }
                    />
                    <button
                      type="button"
                      onClick={() => removeDependant(i)}
                      className="text-xs text-red-600 mt-6"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Submit */}
          <div className="flex items-center justify-between pt-4">
            <p className="text-xs text-gray-500 max-w-md">
              By submitting this form, you confirm that the details provided are
              true and agree to abide by the SGSS Medical Fund Constitution &
              Byelaws.
            </p>
            <Button type="submit" disabled={busy}>
              {busy ? "Submitting..." : "Submit Application"}
            </Button>
          </div>
        </form>

        <p className="text-center text-sm text-gray-600">
          Already registered?{" "}
          <Link
            to="/login"
            className="text-[var(--sgss-navy)] font-semibold hover:underline"
          >
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}
