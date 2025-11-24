// Frontend/src/pages/dashboard/admin/audit.tsx
import React, { useEffect, useState } from "react";
import api from "~/config/api";
import AuditTimeline from "~/components/sgss/AuditTimeline";
import Skeleton from "~/components/loader/skeleton";

export default function AdminAuditPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("audit/") // new endpoint, see backend update below
      .then(res => setLogs(res.data.results || []))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <div className="sgss-card p-0">
        <div className="sgss-header">System Audit Logs</div>
        <div className="p-6 text-sm text-gray-600">
          Complete system-wide audit trail of all claim activity.
        </div>
      </div>

      <div className="sgss-card">
        {loading ? (
          <Skeleton className="h-5 w-40" />
        ) : (
          <AuditTimeline logs={logs} />
        )}
      </div>
    </div>
  );
}
