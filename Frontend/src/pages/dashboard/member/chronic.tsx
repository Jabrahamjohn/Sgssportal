import React, { useEffect, useState } from 'react';
import { listChronic, createChronic } from '../../../server/services/chronic.service';
import type { ChronicRequest } from '../../../types/chronic';

export default function ChronicPage() {
  const [rows, setRows] = useState<ChronicRequest[]>([]);
  const [busy, setBusy] = useState(false);

  async function load() {
    const data = await listChronic();
    setRows(data);
  }

  useEffect(() => {
    load();
  }, []);

  async function createDemo() {
    setBusy(true);
    await createChronic({
      doctor_name: 'Dr. Patel',
      medicines: [{ name: 'Metformin', strength: '500mg', dosage: '2x daily', duration: '30 days' }],
      total_amount: 3000,
      member_payable: 1800,
      status: 'pending',
    } as any);
    await load();
    setBusy(false);
  }

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Chronic Requests</h2>
        <button disabled={busy} onClick={createDemo} className="px-3 py-1 rounded bg-black text-white">
          + New (demo)
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-[700px] w-full border rounded">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-left p-2">Doctor</th>
              <th className="text-left p-2">Medicines</th>
              <th className="text-left p-2">Total</th>
              <th className="text-left p-2">Member Payable</th>
              <th className="text-left p-2">Status</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id} className="border-t">
                <td className="p-2">{r.doctor_name}</td>
                <td className="p-2">{r.medicines.map(m => m.name).join(', ')}</td>
                <td className="p-2">Ksh {Number(r.total_amount).toLocaleString()}</td>
                <td className="p-2">Ksh {Number(r.member_payable).toLocaleString()}</td>
                <td className="p-2">{r.status}</td>
              </tr>
            ))}
            {!rows.length && (
              <tr><td className="p-3 text-gray-500" colSpan={5}>No chronic requests yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
