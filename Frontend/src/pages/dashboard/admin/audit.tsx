// Frontend/src/pages/dashboard/admin/audit.tsx
import React, { useEffect, useState } from "react";
import api from "~/config/api";
import AuditTimeline from "~/components/sgss/AuditTimeline";
import Skeleton from "~/components/loader/skeleton";
import PageTransition from "~/components/animations/PageTransition";
import { ClipboardDocumentListIcon, ArrowPathIcon } from "@heroicons/react/24/outline";
import Button from "~/components/controls/button";

export default function AdminAuditPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    // Ensure this endpoint exists or mock it if needed
    api.get("dashboard/admin/audit/")
      .then(res => setLogs(res.data.results || []))
      .catch(err => {
          console.error(err);
          // Fallback empty if 404
          setLogs([]);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <PageTransition className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
            <h1 className="text-2xl font-bold text-[var(--sgss-navy)] flex items-center gap-2">
                <ClipboardDocumentListIcon className="w-6 h-6 text-[var(--sgss-gold)]" />
                System Audit Logs
            </h1>
            <p className="text-sm text-gray-500 mt-1">Complete chronological trail of all system activities.</p>
        </div>
        <Button onClick={load} disabled={loading} className="text-xs bg-white border border-gray-200 text-gray-700 hover:bg-gray-50">
            <ArrowPathIcon className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
        </Button>
      </div>

      <div className="sgss-card bg-white min-h-[500px]">
        {loading ? (
           <div className="p-8 space-y-8">
               {[1,2,3].map(i => (
                   <div key={i} className="flex gap-4">
                       <Skeleton className="w-4 h-4 rounded-full mt-2" />
                       <div className="flex-1 space-y-2">
                            <Skeleton className="h-4 w-48" />
                            <Skeleton className="h-16 w-full" />
                       </div>
                   </div>
               ))}
           </div>
        ) : logs.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-gray-400">
                <ClipboardDocumentListIcon className="w-16 h-16 mb-4 text-gray-200" />
                <p>No audit logs available.</p>
            </div>
        ) : (
          <div className="p-6">
             <AuditTimeline logs={logs} />
          </div>
        )}
      </div>
    </PageTransition>
  );
}
