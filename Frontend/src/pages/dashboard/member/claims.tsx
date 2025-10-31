// Frontend/src/pages/dashboard/member/claims.tsx
import React, { useEffect, useState } from 'react';
import { listClaims } from '../../../server/services/claim.service';
import type { Claim } from '../../../types/claim';
import { Link } from 'react-router-dom';

export default function ClaimsList() {
  const [data, setData] = useState<Claim[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    listClaims()
      .then(setData)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="p-6">Loading…</div>;

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">My Claims</h2>
        <Link to="/dashboard/member/claims/new" className="underline">New claim</Link>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-[700px] w-full border rounded">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-left p-2">ID</th>
              <th className="text-left p-2">Type</th>
              <th className="text-left p-2">Total Claimed</th>
              <th className="text-left p-2">Payable</th>
              <th className="text-left p-2">Status</th>
              <th className="text-left p-2">Created</th>
            </tr>
          </thead>
          <tbody>
            {data.map((c) => (
              <tr key={c.id} className="border-t">
                <td className="p-2">{c.id.slice(0, 8)}…</td>
                <td className="p-2 capitalize">{c.claim_type}</td>
                <td className="p-2">Ksh {Number(c.total_claimed).toLocaleString()}</td>
                <td className="p-2">Ksh {Number(c.total_payable).toLocaleString()}</td>
                <td className="p-2">{c.status}</td>
                <td className="p-2">{new Date(c.created_at).toLocaleDateString()}</td>
              </tr>
            ))}
            {!data.length && (
              <tr>
                <td className="p-3 text-gray-500" colSpan={6}>No claims yet.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
