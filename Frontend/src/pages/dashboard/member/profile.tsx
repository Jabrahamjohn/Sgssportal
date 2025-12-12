// Frontend/src/pages/dashboard/member/profile.tsx
import React, { useEffect, useState } from "react";
import api from "~/config/api";
import PageTransition from "~/components/animations/PageTransition";
import Button from "~/components/controls/button";
import Input from "~/components/controls/input";
import { UserCircleIcon, IdentificationIcon, PhoneIcon, BuildingOffice2Icon, HeartIcon } from "@heroicons/react/24/outline";

export default function MemberProfilePage() {
  const [profile, setProfile] = useState<any>(null);
  const [saving, setSaving] = useState(false);

  const fetchProfile = async () => {
    try {
        const res = await api.get("members/me/profile/");
        setProfile(res.data);
    } catch (e) {
        console.error(e);
    }
  };

  useEffect(() => {
    fetchProfile();
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
    return (
        <div className="p-8 space-y-4">
            <div className="h-8 w-48 bg-gray-200 rounded animate-pulse" />
            <div className="h-64 bg-gray-100 rounded-xl animate-pulse" />
        </div>
    );
  }

  return (
    <PageTransition className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
            <h1 className="text-2xl font-bold text-[var(--sgss-navy)] tracking-tight">My Profile</h1>
            <p className="text-sm text-gray-500 mt-1">Manage your personal information and contact details.</p>
        </div>
        <Button
            onClick={save}
            disabled={saving}
            className="bg-[var(--sgss-navy)] hover:bg-[var(--sgss-gold)] text-white shadow-lg shadow-blue-900/10 px-6"
        >
            {saving ? "Saving..." : "Save Changes"}
        </Button>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left Column: Avatar & Membership Info */}
        <div className="lg:col-span-1 space-y-6">
            <div className="sgss-card p-6 flex flex-col items-center text-center bg-white relative overflow-hidden">
                <div className="absolute top-0 inset-x-0 h-24 bg-gradient-to-br from-[var(--sgss-navy)] to-[#0b2f7c]"></div>
                <div className="w-24 h-24 rounded-full border-4 border-white shadow-lg bg-white flex items-center justify-center text-[var(--sgss-navy)] relative z-10 mb-4">
                    <span className="text-4xl font-bold">{profile.user_full_name?.charAt(0) || "U"}</span>
                </div>
                <h2 className="font-bold text-lg text-[var(--sgss-navy)] relative z-10">{profile.user_full_name}</h2>
                <p className="text-sm text-gray-500 relative z-10">{profile.email}</p>
                <div className="mt-4 inline-flex items-center px-3 py-1 bg-green-50 text-green-700 rounded-full text-xs font-medium border border-green-100 relative z-10">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500 mr-2"></span>
                    {profile.status}
                </div>
            </div>

            <div className="sgss-card p-0 overflow-hidden bg-white">
                <div className="bg-gray-50 px-4 py-3 border-b border-gray-100 font-semibold text-sm text-[var(--sgss-navy)] flex items-center gap-2">
                    <IdentificationIcon className="w-4 h-4" />
                    Membership Details
                </div>
                <div className="p-4 space-y-3 text-sm">
                    <div className="flex justify-between">
                        <span className="text-gray-500">Type</span>
                        <span className="font-medium text-[var(--sgss-navy)]">{profile.membership_type ?? "—"}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-gray-500">Valid From</span>
                        <span className="font-medium">{profile.valid_from || "—"}</span>
                    </div>
                     <div className="flex justify-between">
                        <span className="text-gray-500">Valid To</span>
                        <span className="font-medium">{profile.valid_to || "—"}</span>
                    </div>
                     <div className="flex justify-between border-t border-gray-50 pt-2">
                        <span className="text-gray-500">Benefits Start</span>
                        <span className="font-medium text-[var(--sgss-navy)]">{profile.benefits_from || "—"}</span>
                    </div>
                </div>
            </div>
        </div>

        {/* Right Column: Editable Forms */}
        <div className="lg:col-span-2 space-y-6">
            {/* Personal Details */}
            <div className="sgss-card bg-white p-6">
                <h3 className="font-bold text-[var(--sgss-navy)] mb-4 flex items-center gap-2 text-base pb-2 border-b border-gray-100">
                    <UserCircleIcon className="w-5 h-5 text-[var(--sgss-gold)]" />
                    Personal Information
                </h3>
                <div className="grid md:grid-cols-2 gap-4">
                    <Input label="Full Name" value={profile.user_full_name} disabled className="bg-gray-50 text-gray-500 cursor-not-allowed" />
                    <Input label="Email Address" value={profile.email} disabled className="bg-gray-50 text-gray-500 cursor-not-allowed" />
                    <Input
                        label="Mailing Address"
                        value={profile.mailing_address || ""}
                        onChange={(e) => handleChange("mailing_address", e.target.value)}
                    />
                    <Input
                        label="NHIF Number"
                        value={profile.nhif_number || ""}
                        onChange={(e) => handleChange("nhif_number", e.target.value)}
                    />
                </div>
                <div className="mt-4">
                    <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wider">Other Medical Scheme</label>
                    <textarea
                        className="w-full text-sm border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[var(--sgss-gold)]/20 focus:border-[var(--sgss-gold)] transition-all resize-none bg-gray-50/30"
                        rows={2}
                        placeholder="Details of other medical covers..."
                        value={profile.other_medical_scheme || ""}
                        onChange={(e) => handleChange("other_medical_scheme", e.target.value)}
                    />
                </div>
            </div>

            {/* Contact Numbers */}
            <div className="sgss-card bg-white p-6">
                <h3 className="font-bold text-[var(--sgss-navy)] mb-4 flex items-center gap-2 text-base pb-2 border-b border-gray-100">
                    <PhoneIcon className="w-5 h-5 text-[var(--sgss-gold)]" />
                    Contact Numbers
                </h3>
                <div className="grid md:grid-cols-2 gap-4">
                    <Input
                        label="Mobile Phone"
                        value={profile.phone_mobile || ""}
                        onChange={(e) => handleChange("phone_mobile", e.target.value)}
                        type="tel"
                    />
                     <Input
                        label="Home Phone"
                        value={profile.phone_home || ""}
                        onChange={(e) => handleChange("phone_home", e.target.value)}
                        type="tel"
                    />
                    <Input
                        label="Office Phone"
                        value={profile.phone_office || ""}
                        onChange={(e) => handleChange("phone_office", e.target.value)}
                         type="tel"
                    />
                    <Input
                        label="Fax Number"
                        value={profile.phone_fax || ""}
                        onChange={(e) => handleChange("phone_fax", e.target.value)}
                         type="tel"
                    />
                </div>
            </div>

            {/* Family Doctor */}
             <div className="sgss-card bg-white p-6">
                <h3 className="font-bold text-[var(--sgss-navy)] mb-4 flex items-center gap-2 text-base pb-2 border-b border-gray-100">
                    <HeartIcon className="w-5 h-5 text-[var(--sgss-gold)]" />
                    Family Doctor
                </h3>
                <div className="space-y-4">
                     <Input
                        label="Doctor Name"
                        value={profile.family_doctor_name || ""}
                        onChange={(e) => handleChange("family_doctor_name", e.target.value)}
                        placeholder="Dr. Name"
                    />
                    <div className="grid md:grid-cols-2 gap-4">
                         <Input
                            label="Doctor Mobile"
                            value={profile.family_doctor_phone_mobile || ""}
                            onChange={(e) => handleChange("family_doctor_phone_mobile", e.target.value)}
                            type="tel"
                        />
                         <Input
                            label="Doctor Office"
                            value={profile.family_doctor_phone_office || ""}
                            onChange={(e) => handleChange("family_doctor_phone_office", e.target.value)}
                            type="tel"
                        />
                         <Input
                            label="Doctor Home"
                            value={profile.family_doctor_phone_home || ""}
                            onChange={(e) => handleChange("family_doctor_phone_home", e.target.value)}
                            type="tel"
                        />
                         <Input
                            label="Doctor Fax"
                            value={profile.family_doctor_phone_fax || ""}
                            onChange={(e) => handleChange("family_doctor_phone_fax", e.target.value)}
                            type="tel"
                        />
                    </div>
                </div>
            </div>
        </div>
      </div>
    </PageTransition>
  );
}
