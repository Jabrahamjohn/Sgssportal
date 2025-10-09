import React, { useEffect, useState } from 'react'
import { supabase } from '../../services/supabaseClient'

export default function ClaimHistory() {
  const [claims, setClaims] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadClaims()
  }, [])

  async function loadClaims() {
    const { data: user } = await supabase.auth.getUser()
    const { data, error } = await supabase
      .from('claims')
      .select('id, claim_type, total_claimed, status, created_at')
      .eq('member_id', user.user.id)
      .order('created_at', { ascending: false })
    if (!error && data) setClaims(data)
    setLoading(false)
  }

  if (loading) return <p className="text-gray-500">Loading your claims...</p>

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-4 text-gray-800">My Claim History</h1>

      {claims.length === 0 ? (
        <p className="text-gray-500">You haven’t submitted any claims yet.</p>
      ) : (
        <table className="w-full border-collapse bg-white rounded-lg shadow-sm text-sm">
          <thead>
            <tr className="bg-gray-100 text-gray-600">
              <th className="py-2 px-3 text-left">Type</th>
              <th>Total (Ksh)</th>
              <th>Status</th>
              <th>Submitted On</th>
            </tr>
          </thead>
          <tbody>
            {claims.map((c) => (
              <tr key={c.id} className="border-b hover:bg-gray-50">
                <td className="py-2 px-3">{c.claim_type}</td>
                <td>{c.total_claimed?.toLocaleString()}</td>
                <td className="capitalize">{c.status}</td>
                <td>{new Date(c.created_at).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}
