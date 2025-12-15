// Frontend/src/components/sgss/AuditTimeline.tsx

export default function AuditTimeline({ logs }: { logs: any[] }) {
  if (!logs || logs.length === 0) {
    return <p className="text-sm text-gray-500">No audit activity recorded.</p>;
  }

  return (
    <div className="space-y-4">
      {logs.map((log, i) => (
        <div
          key={i}
          className="border-l-4 border-[var(--sgss-navy)] pl-4 py-2 bg-white rounded shadow-sm"
        >
          <p className="text-[var(--sgss-navy)] font-semibold">
            {log.action.replace("_", " ").toUpperCase()}
          </p>

          {log.note && (
            <p className="text-sm text-gray-700 italic">“{log.note}”</p>
          )}

          <p className="text-xs text-gray-500">
            By: <strong>{log.actor || "System"}</strong>  
            ({log.role})
          </p>

          <p className="text-xs text-gray-400">
            {new Date(log.created_at).toLocaleString()}
          </p>
        </div>
      ))}
    </div>
  );
}
