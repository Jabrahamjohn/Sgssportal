// Frontend/src/pages/dashboard/admin/settings/general-settings.tsx
import  { useEffect, useState } from "react";
import api from "~/config/api";
import Button from "~/components/controls/button";
import Input from "~/components/controls/input";
import Alert from "~/components/controls/alert";
import PageTransition from "~/components/animations/PageTransition";
import { 
    Cog6ToothIcon, 
    CurrencyDollarIcon,
    ShieldCheckIcon,
    ArrowPathIcon
} from "@heroicons/react/24/outline";

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
      // Handle both array and paginated response
      const all: SettingRecord[] = Array.isArray(res.data) ? res.data : (res.data.results || []);
      const gen = all.find((s) => s.key === "general_limits") as SettingRecord | undefined;

      if (!gen) {
        // If not found, log what WAS found to help debug
        console.warn("general_limits not found in settings:", all);
        setError("Settings not initialized. Please run the backend seed script or contact support.");
      } else {
        setRecord(gen);
        setDraft({
          annual_limit: Number(gen.value.annual_limit ?? 250000),
          critical_addon: Number(gen.value.critical_addon ?? 200000),
          fund_share_percent: Number(gen.value.fund_share_percent ?? 80),
          clinic_outpatient_percent: Number(gen.value.clinic_outpatient_percent ?? 100),
        });
      }
    } catch (e: any) {
      console.error("Settings load error:", e);
      setError(
          e.response?.data?.detail || 
          e.message || 
          "Failed to load settings. Ensure backend is running."
      );
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
      setSuccess("Configuration updated successfully.");
      await load();
    } catch (e: any) {
      console.error(e);
      setError("Failed to save changes. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
     return <div className="p-12 text-center text-gray-400">Loading settings...</div>;
  }

  if (!record || !draft) {
    return (
      <div className="space-y-4 max-w-lg mb-4">
         {error && <Alert type="error" message={error} />}
         <Button onClick={load} variant="outline" className="w-full">
             <ArrowPathIcon className="w-4 h-4 mr-2" />
             Retry
         </Button>
      </div>
    );
  }

  return (
    <PageTransition className="space-y-6 max-w-3xl">
      <div className="flex items-start gap-4">
          <div className="p-3 bg-blue-50 text-[var(--sgss-navy)] rounded-xl hidden md:block">
              <Cog6ToothIcon className="w-8 h-8" />
          </div>
          <div>
              <h2 className="text-xl font-bold text-[var(--sgss-navy)]">General Fund Limits</h2>
              <p className="text-sm text-gray-500 mt-1">
                  Global configuration for fund limits and default coverage rules as per Byelaws Section 6.
              </p>
          </div>
      </div>

      {error && <Alert type="error" message={error} />}
      {success && <Alert type="success" message={success} />}

      <div className="grid md:grid-cols-2 gap-6">
          {/* Card 1: Limits */}
          <div className="sgss-card bg-white p-6 space-y-6">
              <div className="flex items-center gap-2 border-b border-gray-100 pb-3">
                  <CurrencyDollarIcon className="w-5 h-5 text-[var(--sgss-gold)]" />
                  <h3 className="font-bold text-[var(--sgss-navy)]">Financial Limits</h3>
              </div>
              
              <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Standard Annual Limit</label>
                  <Input
                      type="number"
                      value={draft.annual_limit}
                      onChange={(e) => handleChange("annual_limit", Number(e.target.value))}
                      suffix="Ksh"
                  />
                  <p className="text-xs text-gray-400 mt-1">Maximum payable benefit per member per year.</p>
              </div>

              <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Critical Illness Add-on</label>
                  <Input
                      type="number"
                      value={draft.critical_addon}
                      onChange={(e) => handleChange("critical_addon", Number(e.target.value))}
                      suffix="Ksh"
                  />
                  <p className="text-xs text-gray-400 mt-1">Additional coverage for approved critical illnesses.</p>
              </div>
          </div>

          {/* Card 2: Percentages */}
          <div className="sgss-card bg-white p-6 space-y-6">
              <div className="flex items-center gap-2 border-b border-gray-100 pb-3">
                  <ShieldCheckIcon className="w-5 h-5 text-[var(--sgss-gold)]" />
                  <h3 className="font-bold text-[var(--sgss-navy)]">Coverage Rates</h3>
              </div>

              <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Default Fund Share</label>
                  <div className="relative">
                      <Input
                          type="number"
                          value={draft.fund_share_percent}
                          onChange={(e) => handleChange("fund_share_percent", Number(e.target.value))}
                          className="pr-8"
                      />
                      <span className="absolute right-3 top-2.5 text-gray-400 text-sm">%</span>
                  </div>
                  <p className="text-xs text-gray-400 mt-1">Base rate when no specific scale applies.</p>
              </div>

              <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Clinic Outpatient Share</label>
                  <div className="relative">
                      <Input
                          type="number"
                          value={draft.clinic_outpatient_percent}
                          onChange={(e) => handleChange("clinic_outpatient_percent", Number(e.target.value))}
                          className="pr-8"
                      />
                      <span className="absolute right-3 top-2.5 text-gray-400 text-sm">%</span>
                  </div>
                  <p className="text-xs text-gray-400 mt-1">Applied to claims from Siri Guru Nanak Clinic.</p>
              </div>
          </div>
      </div>

      <div className="flex justify-end pt-4 border-t border-gray-100">
          <Button 
            onClick={save} 
            disabled={saving} 
            className="bg-[var(--sgss-navy)] hover:bg-blue-900 text-white min-w-[150px] shadow-lg shadow-blue-900/10"
          >
              {saving ? <ArrowPathIcon className="w-4 h-4 animate-spin mr-2" /> : null}
              {saving ? "Saving Changes..." : "Save Configuration"}
          </Button>
      </div>
    </PageTransition>
  );
}
