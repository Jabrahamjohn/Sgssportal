import React, { useEffect, useState } from 'react'
import { supabase } from '../../services/supabaseClient'
import { Button } from '../../components/ui/Button'

export default function ClaimDetailAdmin({ claimId }: { claimId: string }) {
  const [claim, setClaim] = useState<any>(null)
  const [attachments, setAttachments] = useState<any[]>([])
  const [note, setNote] = useState('')

  useEffect(() => { load() }, [claimId])

  async function load() {
    const { data } = await supabase
      .from('claims')
      .select('*, members(*), claim_attachments(*)')
      .eq('id', claimId)
      .single()
    setClaim(data)
    setAttachments(data?.claim_attachments || [])
  }

  async function handleAction(action: string) {
    const { data: session } = await supabase.auth.getSession()
    if (!session?.user) return
    await supabase.from('claim_reviews').insert([{
      claim_id: claimId,
      reviewer_id: session.user.id,
      role: 'admin',
      action,
      note
    }])
    await supabase.from('claims').update({ status: action }).eq('id', claimId)
    load()
  }

  if (!claim) return <p>Loading...</p>

  return (
    <div className="p-6">
      <h1 className="text-xl font-semibold mb-3">Claim Details</h1>
      <p><strong>Member:</strong> {claim.members?.full_name}</p>
      <p><strong>Claim Type:</strong> {claim.claim_type}</p>
      <p><strong>Total Claimed:</strong> {claim.total_claimed}</p>
      <p><strong>Payable:</strong> {claim.total_payable}</p>

      <h2 className="font-semibold mt-4">Attachments</h2>
      <ul className="list-disc ml-5">
        {attachments.map(a => (
          <li key={a.id}><a href={a.url} target="_blank" rel="noreferrer">{a.file_name}</a></li>
        ))}
      </ul>

      <textarea
        value={note}
        onChange={e => setNote(e.target.value)}
        className="border w-full p-2 mt-3"
        placeholder="Add a review note..."
      />

      <div className="flex gap-2 mt-3">
        <Button onClick={() => handleAction('processed')}>Process</Button>
        <Button onClick={() => handleAction('approved')} className="bg-green-600 text-white">Approve</Button>
        <Button onClick={() => handleAction('rejected')} className="bg-red-600 text-white">Reject</Button>
        <Button onClick={() => handleAction('paid')} className="bg-blue-600 text-white">Mark Paid</Button>
      </div>
    </div>
  )
}
