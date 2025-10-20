import React, { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { supabase } from '../../services/supabaseClient'
import { Button } from '../../components/ui/Button'

export default function MemberDetail() {
  const { id } = useParams()
  const [member, setMember] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchMember = async () => {
      const { data, error } = await supabase.from('members_view').select('*').eq('id', id).single()
      if (error) console.error(error)
      else setMember(data)
      setLoading(false)
    }
    fetchMember()
  }, [id])

  if (loading) return <div className="p-6 text-gray-600">Loading member...</div>
  if (!member) return <div className="p-6 text-gray-500">Member not found</div>

  return (
    <div className="p-6">
      <div className="flex justify-between mb-4">
        <h1 className="text-2xl font-semibold text-gray-800">{member.full_name}</h1>
        <Link to="/members">
          <Button variant="secondary">Back</Button>
        </Link>
      </div>

      <div className="bg-white shadow rounded-2xl p-6 space-y-4">
        <p><strong>NHIF Number:</strong> {member.nhif_number}</p>
        <p><strong>Membership Type:</strong> {member.membership_type}</p>
        <p><strong>Joined:</strong> {member.joined_at}</p>
        <p><strong>Valid From:</strong> {member.valid_from}</p>
        <p><strong>Valid To:</strong> {member.valid_to}</p>
        <p><strong>No-Claim Discount:</strong> {member.no_claim_discount_percent}%</p>
      </div>

      <div className="mt-6">
        <h2 className="text-lg font-semibold mb-2 text-gray-700">Claims History</h2>
        <div className="bg-white rounded-2xl shadow p-4">
          <p className="text-gray-500 text-sm">Coming soon — linked to claims module.</p>
        </div>
      </div>
    </div>
  )
}
