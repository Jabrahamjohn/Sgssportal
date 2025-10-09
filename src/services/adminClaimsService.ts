import { supabase } from '../services/supabaseClient'

export async function getAllClaims() {
  const { data, error } = await supabase
    .from('claims')
    .select('id, claim_type, total_claimed, status, created_at, fund_share, member_share, members(full_name)')
    .order('created_at', { ascending: false })
  if (error) throw error
  return data
}

export async function updateClaimStatus(id: string, status: string, user_id: string) {
  const updates: any = { status }
  if (status === 'processed') updates.processed_at = new Date()
  if (status === 'approved') updates.approved_at = new Date()
  if (status === 'paid') updates.paid_at = new Date()

  const { error } = await supabase
    .from('claims')
    .update({ ...updates, processed_by: user_id })
    .eq('id', id)

  if (error) throw error
  return true
}

export async function fetchClaimDetails(id: string) {
  const { data, error } = await supabase
    .from('claims')
    .select('*, claim_items(*)')
    .eq('id', id)
    .single()

  if (error) throw error
  return data
}
