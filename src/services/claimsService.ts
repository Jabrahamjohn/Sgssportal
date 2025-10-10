// src/services/claimsService.ts
import { supabase } from './supabaseClient'
import { v4 as uuidv4 } from 'uuid'

// upload a file and attach to a claim
export async function uploadAttachment(file: File, claimId: string, userId: string) {
  const fileExt = file.name.split('.').pop()
  const filename = `${uuidv4()}.${fileExt}`
  const path = `claims/${claimId}/${filename}`

  const { data, error: uploadError } = await supabase.storage
    .from('claim-attachments')
    .upload(path, file, { cacheControl: '3600', upsert: false })

  if (uploadError) throw uploadError

  const { publicURL } = supabase.storage.from('claim-attachments').getPublicUrl(path)

  // store attachment record
  const { error: insertErr } = await supabase.from('claim_attachments').insert([{
    claim_id: claimId,
    uploaded_by: userId,
    storage_path: path,
    url: publicURL,
    file_name: file.name,
    content_type: file.type
  }])
  if (insertErr) throw insertErr

  return publicURL
}

// create claim + items + attachments in a transaction-like way
export async function createClaimWithAttachments(memberId: string, claimType: string, items: any[], files: File[]) {
  // insert claim as draft first, then items, then upload attachments, finally submit (or leave draft)
  const { data: claim, error: claimErr } = await supabase
    .from('claims')
    .insert([{ member_id: memberId, claim_type: claimType, status: 'submitted' }])
    .select()
    .single()

  if (claimErr) throw claimErr
  const claimId = claim.id

  const itemsPayload = items.map((i: any) => ({
    claim_id: claimId,
    category: i.category || 'other',
    description: i.description,
    amount: Number(i.amount) || 0,
    quantity: i.quantity || 1
  }))

  const { error: itemsErr } = await supabase.from('claim_items').insert(itemsPayload)
  if (itemsErr) throw itemsErr

  // upload attachments sequentially (frontend can do parallel)
  for (const file of files || []) {
    await uploadAttachment(file as File, claimId, claim.member_id)
  }

  // After items and attachments are added, recompute totals is done by DB triggers
  // Return claim object
  const { data: refreshed } = await supabase.from('claims').select('*').eq('id', claimId).single()
  return refreshed
}
