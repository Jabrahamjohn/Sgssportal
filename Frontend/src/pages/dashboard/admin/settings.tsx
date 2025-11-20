import React, { useEffect, useState } from "react";
import api from "~/config/api";
import Button from "~/components/controls/button";

export default function AdminSettings() {
  const [settings, setSettings] = useState<any>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api.get("settings/").then((res) => {
      const obj: any = {};
      res.data.forEach((s: any) => (obj[s.key] = s.value));
      setSettings(obj);
    });
  }, []);

  const handleSave = async () => {
    setSaving(true);
    await api.put("settings/general_limits/", {
      key: "general_limits",
      value: settings.general_limits,
    });
    setSaving(false);
    alert("Settings saved.");
  };

  if (!settings.general_limits)
    return <div className="p-6">Loading settings…</div>;

  const general = settings.general_limits;

  return (
    <div className="p-6 space-y-6">
      <h2 className="text-2xl font-semibold">System Settings</h2>

      <div className="bg-white p-4 rounded shadow space-y-3">
        <h3 className="font-semibold">General Limits</h3>

        <label>Annual Limit</label>
        <input
          className="border p-2 w-full"
          type="number"
          value={general.annual_limit}
          onChange={(e) =>
            setSettings({
              ...settings,
              general_limits: {
                ...general,
                annual_limit: Number(e.target.value),
              },
            })
          }
        />

        <label>Fund Share (%)</label>
        <input
          className="border p-2 w-full"
          type="number"
          value={general.fund_share_percent}
          onChange={(e) =>
            setSettings({
              ...settings,
              general_limits: {
                ...general,
                fund_share_percent: Number(e.target.value),
              },
            })
          }
        />

        <Button onClick={handleSave} disabled={saving}>
          {saving ? "Saving…" : "Save"}
        </Button>
      </div>
    </div>
  );
}
