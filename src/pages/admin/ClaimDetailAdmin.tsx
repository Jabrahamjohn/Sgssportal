import React, { useEffect, useState } from 'react'
import { supabase } from '../../services/supabaseClient'
import { Button } from '../../components/ui/Button'

export default function ClaimDetailAdmin({ claimId }: { claimId: string }) {
  const [claim, setClaim] = useState<any>(null)
  const [attachments, setAttachments] = useState<any[]>([])
  const [note, setNote] = useState('')

  useEffect(() => {
    load()
  }, [claimId])

  async function load() {
    const { data } = await supabase.from('claims').select('*, claim_items(*), members(*), claim_attachments(*)').eq('id', claimId).single()
    setClaim(data)
    const { data: at } = await supabase.from('claim_attachments').select('*').eq('claim_id', claimId)
    setAttachments(at || [])
  }

  async function handleAction(action: 'processed'|'approved'|'rejected'|'paid') {
    const { data: user } = await supabase.auth.getUser()
    await supabase.from('claim_reviews').insert([{ claim_id: claimId, reviewer_id: user.user.id, role: user.user.role, action, note }])
    await supabase.from('claims').update({ status: action }).eq('id', claimId)
    load()
  }

  if (!claim) return <p>Loading...</p>

  return (
    <div>
      <h2 className="text-xl font-semibold">Claim {claim.id}</h2>
      <div className="mt-3 space-y-2">
        <p>Member: {claim.members?.full_name}</p>
        <p>Total claimed: KES {claim.total_claimed}</p>
        <p>Fund payable: KES {claim.total_payable}</p>
      </div>

      <div className="mt-4">
        <h3 className="font-semibold">Attachments</h3>
        <ul>
          {attachments.map(a => (
            <li key={a.id}><a href={a.url} target="_blank" rel="noreferrer">{a.file_name}</a></li>
          ))}
        </ul>
      </div>

      <div className="mt-4">
        <textarea value={note} onChange={e => setNote(e.target.value)} className="w-full border p-2" placeholder="Reviewer note or explanation"></textarea>
        <div className="flex gap-2 mt-2">
          <Button onClick={() => handleAction('processed')}>Process</Button>
          <Button onClick={() => handleAction('approved')} className="bg-green-600 text-white">Approve</Button>
          <Button onClick={() => handleAction('rejected')} variant="outline">Reject</Button>
          <Button onClick={() => handleAction('paid')}>Mark Paid</Button>
        </div>
      </div>
    </div>
  )
}
