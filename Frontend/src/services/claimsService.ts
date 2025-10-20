// src/services/claimsService.ts
import { supabase } from './supabaseClient'
import { v4 as uuidv4 } from 'uuid'

/**
 * server-side pre-checks for bylaws:
 * - membership waiting period 60 days
 * - membership expiry
 * - required attachments for inpatient (discharge summary)
 * - submission window (90 days)
 * - exclusions (cosmetic, transport, infertility), block them
 */
async function runBylawsChecks(memberId: string, claimType: string, firstVisitDate?: string, dischargeDate?: string, attachments?: File[]) {
  // 1) load member
  const { data: member, error: mErr } = await supabase.from('members').select('*').eq('id', memberId).single()
  if (mErr || !member) throw new Error('Member record not found.')

  const started = member.valid_from ? new Date(member.valid_from) : new Date()
  const daysSinceStart = Math.floor((Date.now() - started.getTime()) / (1000*60*60*24))
  if (daysSinceStart < 60) throw new Error('Membership waiting period (60 days) not satisfied. See Constitution §6.3.')

  if (member.valid_to && new Date(member.valid_to) < new Date()) throw new Error('Membership expired; renew to submit claims.')

  // 2) submission window
  if (claimType === 'outpatient') {
    if (!firstVisitDate) throw new Error('Outpatient claims require a first visit date.')
    const fv = new Date(firstVisitDate)
    const days = Math.floor((Date.now() - fv.getTime())/(1000*60*60*24))
    if (days > 90) throw new Error('Outpatient claims must be submitted within 90 days of first visit. See Byelaws §4.1.')
  } else if (claimType === 'inpatient') {
    if (!dischargeDate) throw new Error('Inpatient claims require a discharge date.')
    const dd = new Date(dischargeDate)
    const days = Math.floor((Date.now() - dd.getTime())/(1000*60*60*24))
    if (days > 90) throw new Error('Inpatient claims must be submitted within 90 days of discharge. See Byelaws §4.1.')
    // require attachments for inpatient: check presence of 'discharge' in filenames or metadata
    const hasDischarge = (attachments || []).some(f => /discharge/i.test(f.name))
    if (!hasDischarge) throw new Error('Inpatient claims require a discharge summary (attachment).')
  }

  // 3) exclude special categories
  const forbidden = ['cosmetic','infertility','transport','mortuary']
  const hasExcluded = (attachments || []).some(f => forbidden.some(k => f.name.toLowerCase().includes(k)))
  if (hasExcluded) throw new Error('Claim appears to include excluded categories (cosmetic/infertility/transport/mortuary) as per Byelaws.')
}

export async function createClaimWithAttachments(memberId: string, claimType: string, items: any[], files: File[], firstVisitDate?: string, dischargeDate?: string) {
  await runBylawsChecks(memberId, claimType, firstVisitDate, dischargeDate, files)

  const { data: claim, error: claimErr } = await supabase
    .from('claims')
    .insert([{
      member_id: memberId,
      claim_type: claimType,
      date_of_first_visit: firstVisitDate || null,
      date_of_discharge: dischargeDate || null,
      status: 'submitted'
    }])
    .select()
    .single()

  if (claimErr) throw claimErr
  const claimId = claim.id

  const itemsPayload = items.map((i: any) => ({
    claim_id: claimId,
    category: i.category || 'other',
    description: i.description || '',
    amount: Number(i.amount) || 0,
    quantity: i.quantity || 1
  }))

  const { error: itemsErr } = await supabase.from('claim_items').insert(itemsPayload)
  if (itemsErr) throw itemsErr

  // upload attachments to bucket 'claim-attachments'
  for (const file of files || []) {
    const fileExt = file.name.split('.').pop()
    const filename = `${uuidv4()}.${fileExt}`
    const path = `claims/${claimId}/${filename}`

    const { error: uploadError } = await supabase.storage.from('claim-attachments').upload(path, file as unknown as Blob)
    if (uploadError) {
      // try to rollback gracefully
      console.error('upload error', uploadError)
      throw uploadError
    }
    const { data: urlData } = supabase.storage.from('claim-attachments').getPublicUrl(path)
    const publicUrl = (urlData as any)?.publicUrl || (urlData as any)?.publicUrl || null

    const { error: insertErr } = await supabase.from('claim_attachments').insert([{
      claim_id: claimId,
      uploaded_by: memberId,
      storage_path: path,
      url: publicUrl,
      file_name: file.name,
      content_type: file.type
    }])
    if (insertErr) throw insertErr
  }

  // DB triggers compute payable automatically
  const { data: refreshed } = await supabase.from('claims').select('*').eq('id', claimId).single()
  return refreshed
}
