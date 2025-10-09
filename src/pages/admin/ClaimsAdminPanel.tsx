import React, { useEffect, useState } from 'react'
import { getAllClaims, updateClaimStatus, fetchClaimDetails } from '../../services/adminClaimsService'
import { supabase } from '../../services/supabaseClient'
import { Button } from '../../components/ui/Button'
import { exportClaimsToCSV, exportClaimsToPDF } from '../../services/reportService'

export default function ClaimsAdminPanel() {
  const [claims, setClaims] = useState<any[]>([])
  const [selected, setSelected] = useState<any | null>(null)

  useEffect(() => {
    loadClaims()
  }, [])

  async function loadClaims() {
    const data = await getAllClaims()
    setClaims(data)
  }

  async function handleStatusChange(id: string, status: string) {
    const { data: user } = await supabase.auth.getUser()
    await updateClaimStatus(id, status, user.user.id)
    await loadClaims()
  }

  async function viewDetails(id: string) {
    const data = await fetchClaimDetails(id)
    setSelected(data)
  }

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-semibold text-gray-800">Claims Administration</h1>
      <div className="flex justify-end gap-3 mb-4">
  <Button onClick={exportClaimsToCSV}>Export CSV</Button>
  <Button onClick={exportClaimsToPDF}>Export PDF</Button>
</div>


      <table className="w-full border-collapse text-sm bg-white shadow-sm rounded-lg">
        <thead>
          <tr className="bg-gray-100 text-gray-700">
            <th className="py-2 px-3 text-left">Member</th>
            <th>Type</th>
            <th>Total Claimed</th>
            <th>Status</th>
            <th>Date</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {claims.map((c) => (
            <tr key={c.id} className="border-b">
              <td className="py-2 px-3">{c.members?.full_name || 'N/A'}</td>
              <td>{c.claim_type}</td>
              <td>Ksh {c.total_claimed?.toLocaleString()}</td>
              <td className="capitalize">{c.status}</td>
              <td>{new Date(c.created_at).toLocaleDateString()}</td>
              <td className="space-x-2">
                <Button onClick={() => viewDetails(c.id)}>View</Button>
                {c.status === 'submitted' && (
                  <Button onClick={() => handleStatusChange(c.id, 'processed')}>Process</Button>
                )}
                {c.status === 'processed' && (
                  <Button onClick={() => handleStatusChange(c.id, 'approved')}>Approve</Button>
                )}
                {c.status === 'approved' && (
                  <Button onClick={() => handleStatusChange(c.id, 'paid')}>Mark Paid</Button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {selected && (
        <div className="p-4 border rounded-lg bg-gray-50">
          <h2 className="text-lg font-semibold mb-2">Claim Details</h2>
          <ul className="text-sm space-y-1">
            {selected.claim_items.map((i: any) => (
              <li key={i.id} className="flex justify-between border-b py-1">
                <span>{i.description}</span>
                <span>Ksh {i.amount.toLocaleString()}</span>
              </li>
            ))}
          </ul>
          <p className="font-bold text-right mt-2">Total: Ksh {selected.total_claimed.toLocaleString()}</p>
        </div>
      )}
    </div>
  )
}
