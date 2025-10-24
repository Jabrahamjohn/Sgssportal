import React, { useEffect, useState } from 'react';
import { listClaims, reviewClaim } from '../../../server/services/claim.service';
import type { Claim } from '../../../types/claim';

export default function CommitteeDashboard() {
  const [rows, setRows] = useState<Claim[]>([]);

  async function load() {
    const data = await listClaims({ status: 'submitted' });
    setRows(data);
  }

  useEffect(() => { load(); }, []);

  async function approve(id: string) {
    await reviewClaim({ claim: id, action: 'approved' });
    await load();
  }

  async function reject(id: string) {
    await reviewClaim({ claim: id, action: 'rejected' });
    await load();
  }

  return (
    <div className="p-6 space-y-4">
      <h2 className="text-xl font-semibold">Committee — Submitted Claims</h2>
      <div className="overflow-x-auto">
        <table className="min-w-[800px] w-full border rounded">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-left p-2">ID</th>
              <th className="text-left p-2">Type</th>
              <th className="text-left p-2">Claimed</th>
              <th className="text-left p-2">Payable</th>
              <th className="text-left p-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((c) => (
              <tr key={c.id} className="border-t">
                <td className="p-2">{c.id.slice(0, 8)}…</td>
                <td className="p-2">{c.claim_type}</td>
                <td className="p-2">Ksh {Number(c.total_claimed).toLocaleString()}</td>
                <td className="p-2">Ksh {Number(c.total_payable).toLocaleString()}</td>
                <td className="p-2 space-x-2">
                  <button className="px-2 py-1 rounded bg-green-600 text-white" onClick={() => approve(c.id)}>Approve</button>
                  <button className="px-2 py-1 rounded bg-red-600 text-white" onClick={() => reject(c.id)}>Reject</button>
                </td>
              </tr>
            ))}
            {!rows.length && <tr><td colSpan={5} className="p-3 text-gray-500">No submitted claims.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
