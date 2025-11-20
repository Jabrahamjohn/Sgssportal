// Frontend/src/pages/dashboard/committee/audit-log.tsx
import React, { useEffect, useState } from "react";
import api from "~/config/api";

export default function AuditLogPage() {
  const [logs, setLogs] = useState([]);
  const [query, setQuery] = useState("");

  useEffect(() => {
    api.get("audit/").then((res) => setLogs(res.data.results));
  }, []);

  const filtered = logs.filter((l: any) =>
    JSON.stringify(l).toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="p-6 space-y-6">
      <h2 className="text-2xl font-semibold">Audit Log</h2>

      <input
        className="border p-2 w-full"
        placeholder="Search logs…"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />

      <div className="bg-white p-4 rounded shadow">
        <table className="w-full">
          <thead>
            <tr>
              <th>Actor</th>
              <th>Action</th>
              <th>Meta</th>
              <th>When</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((log: any) => (
              <tr key={log.id} className="border-t">
                <td>{log.reviewer?.name || "-"}</td>
                <td>{log.action}</td>
                <td>{JSON.stringify(log.meta)}</td>
                <td>{new Date(log.created_at).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
