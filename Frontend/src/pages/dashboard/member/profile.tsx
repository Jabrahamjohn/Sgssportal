// Frontend/src/pages/dashboard/member/profile.tsx
import React, { useEffect, useState } from "react";
import api from "~/config/api";

export default function MemberProfilePage() {
  const [profile, setProfile] = useState<any>(null);
  const [saving, setSaving] = useState(false);

  const fetchProfile = async () => {
    const res = await api.get("members/me/profile/");
    setProfile(res.data);
  };

  useEffect(() => {
    fetchProfile().catch(() => {});
  }, []);

  const handleChange = (field: string, value: any) => {
    setProfile((p: any) => ({ ...p, [field]: value }));
  };

  const save = async () => {
    if (!profile) return;
    setSaving(true);
    try {
      const res = await api.patch("members/me/profile/", {
        mailing_address: profile.mailing_address,
        phone_office: profile.phone_office,
        phone_home: profile.phone_home,
        phone_mobile: profile.phone_mobile,
        phone_fax: profile.phone_fax,
        family_doctor_name: profile.family_doctor_name,
        family_doctor_phone_office: profile.family_doctor_phone_office,
        family_doctor_phone_home: profile.family_doctor_phone_home,
        family_doctor_phone_mobile: profile.family_doctor_phone_mobile,
        family_doctor_phone_fax: profile.family_doctor_phone_fax,
        other_medical_scheme: profile.other_medical_scheme,
        nhif_number: profile.nhif_number,
      });
      setProfile(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  if (!profile) {
    return <div className="text-sm text-gray-500">Loading profile…</div>;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold mb-2">My Profile</h1>

      {/* Basic details */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-4 border">
          <h2 className="font-semibold mb-3 text-sm text-gray-600">
            Personal Details
          </h2>
          <div className="space-y-3 text-sm">
            <Field label="Name" value={profile.user_full_name} readOnly />
            <Field label="Email" value={profile.email} readOnly />
            <Field
              label="Mailing Address"
              value={profile.mailing_address || ""}
              onChange={(v) => handleChange("mailing_address", v)}
            />
            <Field
              label="NHIF Number"
              value={profile.nhif_number || ""}
              onChange={(v) => handleChange("nhif_number", v)}
            />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-4 border">
          <h2 className="font-semibold mb-3 text-sm text-gray-600">
            Membership
          </h2>
          <div className="space-y-2 text-sm">
            <p>
              <span className="font-medium">Membership Type: </span>
              {profile.membership_type ?? "—"}
            </p>
            <p>
              <span className="font-medium">Status: </span>
              {profile.status}
            </p>
            <p>
              <span className="font-medium">Valid From: </span>
              {profile.valid_from || "—"}
            </p>
            <p>
              <span className="font-medium">Valid To: </span>
              {profile.valid_to || "—"}
            </p>
            <p>
              <span className="font-medium">Benefits From: </span>
              {profile.benefits_from || "—"}
            </p>
          </div>
        </div>
      </div>

      {/* Contact + doctor */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-4 border">
          <h2 className="font-semibold mb-3 text-sm text-gray-600">
            Contact Numbers
          </h2>
          <div className="space-y-3 text-sm">
            <Field
              label="Phone (Office)"
              value={profile.phone_office || ""}
              onChange={(v) => handleChange("phone_office", v)}
            />
            <Field
              label="Phone (Home)"
              value={profile.phone_home || ""}
              onChange={(v) => handleChange("phone_home", v)}
            />
            <Field
              label="Phone (Mobile)"
              value={profile.phone_mobile || ""}
              onChange={(v) => handleChange("phone_mobile", v)}
            />
            <Field
              label="Fax"
              value={profile.phone_fax || ""}
              onChange={(v) => handleChange("phone_fax", v)}
            />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-4 border">
          <h2 className="font-semibold mb-3 text-sm text-gray-600">
            Family Doctor
          </h2>
          <div className="space-y-3 text-sm">
            <Field
              label="Doctor Name"
              value={profile.family_doctor_name || ""}
              onChange={(v) => handleChange("family_doctor_name", v)}
            />
            <Field
              label="Doctor Phone (Office)"
              value={profile.family_doctor_phone_office || ""}
              onChange={(v) =>
                handleChange("family_doctor_phone_office", v)
              }
            />
            <Field
              label="Doctor Phone (Home)"
              value={profile.family_doctor_phone_home || ""}
              onChange={(v) =>
                handleChange("family_doctor_phone_home", v)
              }
            />
            <Field
              label="Doctor Phone (Mobile)"
              value={profile.family_doctor_phone_mobile || ""}
              onChange={(v) =>
                handleChange("family_doctor_phone_mobile", v)
              }
            />
            <Field
              label="Doctor Fax"
              value={profile.family_doctor_phone_fax || ""}
              onChange={(v) =>
                handleChange("family_doctor_phone_fax", v)
              }
            />
          </div>
        </div>
      </div>

      {/* Other scheme */}
      <div className="bg-white rounded-xl shadow-sm p-4 border">
        <h2 className="font-semibold mb-3 text-sm text-gray-600">
          Other Medical Scheme
        </h2>
        <textarea
          className="w-full text-sm border rounded-lg px-3 py-2 focus:outline-none focus:ring focus:ring-blue-100"
          rows={3}
          value={profile.other_medical_scheme || ""}
          onChange={(e) =>
            handleChange("other_medical_scheme", e.target.value)
          }
        />
      </div>

      <div className="flex justify-end">
        <button
          onClick={save}
          disabled={saving}
          className="px-5 py-2 rounded-lg bg-[#03045f] text-white text-sm font-medium hover:bg-[#021f4a] disabled:opacity-50"
        >
          {saving ? "Saving..." : "Save Changes"}
        </button>
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  readOnly,
}: {
  label: string;
  value: string;
  onChange?: (v: string) => void;
  readOnly?: boolean;
}) {
  return (
    <label className="block text-xs">
      <span className="block text-[11px] text-gray-500 mb-1">{label}</span>
      {readOnly ? (
        <div className="px-3 py-2 rounded-lg bg-gray-50 border text-gray-700">
          {value || "—"}
        </div>
      ) : (
        <input
          className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring focus:ring-blue-100"
          value={value}
          onChange={(e) => onChange && onChange(e.target.value)}
        />
      )}
    </label>
  );
}
