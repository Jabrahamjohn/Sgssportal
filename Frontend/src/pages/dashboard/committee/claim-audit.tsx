import React, { useEffect, useState } from "react";
import api from "~/config/api";

export default function ClaimAudit({ id }: { id: string }) {
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    api.get(`claims/${id}/audit/`).then((res) => {
      setLogs(res.data.results || []);
    });
  }, [id]);

  return (
    <div className="border rounded p-4 bg-white shadow-sm">
      <h3 className="text-lg font-semibold mb-2">Audit Trail</h3>

      {!logs.length && <p className="text-gray-600">No audit entries.</p>}

      {logs.map((l, idx) => (
        <div key={idx} className="border-b py-2">
          <p><strong>{l.action}</strong> — {new Date(l.created_at).toLocaleString()}</p>
          {l.reviewer && (
            <p className="text-xs text-gray-600">
              By: {l.reviewer.name} ({l.role})
            </p>
          )}
        </div>
      ))}
    </div>
  );
}
