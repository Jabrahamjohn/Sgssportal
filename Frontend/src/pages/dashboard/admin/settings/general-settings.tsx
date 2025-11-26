// Frontend/src/pages/dashboard/admin/settings/general-settings.tsx
import React, { useEffect, useState } from "react";
import api from "~/config/api";
import Button from "~/components/controls/button";
import Input from "~/components/controls/input";
import Alert from "~/components/controls/alert";

type GeneralValue = {
  annual_limit: number;
  critical_addon: number;
  fund_share_percent: number;
  clinic_outpatient_percent: number;
};

type SettingRecord = {
  id: number | string;
  key: string;
  value: GeneralValue;
};

export default function GeneralFundSettings() {
  const [record, setRecord] = useState<SettingRecord | null>(null);
  const [draft, setDraft] = useState<GeneralValue | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const resetStatus = () => {
    setError("");
    setSuccess("");
  };

  const load = async () => {
    resetStatus();
    setLoading(true);
    try {
      const res = await api.get("settings/");
      const all: SettingRecord[] = res.data;
      const gen = all.find((s) => s.key === "general_limits") as
        | SettingRecord
        | undefined;

      if (!gen) {
        setError(
          "general_limits setting not found. Ensure seed_sgss has been run."
        );
      } else {
        setRecord(gen);
        setDraft({
          annual_limit: Number(gen.value.annual_limit ?? 250000),
          critical_addon: Number(gen.value.critical_addon ?? 200000),
          fund_share_percent: Number(gen.value.fund_share_percent ?? 80),
          clinic_outpatient_percent: Number(
            gen.value.clinic_outpatient_percent ?? 100
          ),
        });
      }
    } catch (e) {
      console.error(e);
      setError("Failed to load general fund settings.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleChange = (field: keyof GeneralValue, value: number) => {
    setDraft((prev) =>
      prev ? { ...prev, [field]: value } : ({} as GeneralValue)
    );
  };

  const save = async () => {
    if (!record || !draft) return;
    resetStatus();
    setSaving(true);
    try {
      await api.patch(`settings/${record.id}/`, { value: draft });
      setSuccess("General limits updated.");
      await load();
    } catch (e: any) {
      console.error(e);
      setError(
        e.response?.data?.detail ||
          "Failed to save general limits. Please check values."
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <p className="text-sm text-gray-500">Loading…</p>;
  }

  if (!record || !draft) {
    return (
      <div className="space-y-3">
        {error && <Alert type="error" message={error} />}
        <p className="text-sm text-gray-500">
          No general_limits setting found. You may need to run the seed command
          or create it in the backend.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4 max-w-xl">
      <div>
        <h2 className="text-lg font-semibold">General Fund Limits</h2>
        <p className="text-xs text-gray-500">
          Controls the overall annual limits and special rules, as defined in
          Byelaws Section 6.
        </p>
      </div>

      {error && <Alert type="error" message={error} />}
      {success && <Alert type="success" message={success} />}

      <div className="grid gap-4">
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-medium text-gray-600">
              Annual Limit per Member (Ksh)
            </label>
            <Input
              type="number"
              value={draft.annual_limit}
              onChange={(e) =>
                handleChange("annual_limit", Number(e.target.value || 0))
              }
            />
            <p className="text-[11px] text-gray-400 mt-1">
              Default: 250,000 – maximum annual benefit for ordinary cases.
            </p>
          </div>

          <div>
            <label className="text-xs font-medium text-gray-600">
              Critical Illness Add-on (Ksh)
            </label>
            <Input
              type="number"
              value={draft.critical_addon}
              onChange={(e) =>
                handleChange("critical_addon", Number(e.target.value || 0))
              }
            />
            <p className="text-[11px] text-gray-400 mt-1">
              Additional cover for critical illness claims (e.g. +200,000).
            </p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-medium text-gray-600">
              Default Fund Share (%)
            </label>
            <Input
              type="number"
              value={draft.fund_share_percent}
              onChange={(e) =>
                handleChange("fund_share_percent", Number(e.target.value || 0))
              }
            />
            <p className="text-[11px] text-gray-400 mt-1">
              Base reimbursement rate when no specific scale overrides it.
            </p>
          </div>

          <div>
            <label className="text-xs font-medium text-gray-600">
              SGN Clinic Outpatient (%)
            </label>
            <Input
              type="number"
              value={draft.clinic_outpatient_percent}
              onChange={(e) =>
                handleChange(
                  "clinic_outpatient_percent",
                  Number(e.target.value || 0)
                )
              }
            />
            <p className="text-[11px] text-gray-400 mt-1">
              For Siri Guru Nanak Clinic outpatient claims (often 100% as per
              committee decision).
            </p>
          </div>
        </div>
      </div>

      <Button
        onClick={save}
        disabled={saving}
        className="bg-[var(--sgss-navy)] hover:bg-[var(--sgss-gold)] text-white"
      >
        {saving ? "Saving…" : "Save Settings"}
      </Button>
    </div>
  );
}
