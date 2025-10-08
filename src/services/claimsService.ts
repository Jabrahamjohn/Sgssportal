import { supabase } from '../services/supabaseClient'

export async function createClaim(member_id: string, claim_type: string, items: any[], total_claimed: number) {
  const { data: claim, error: claimError } = await supabase
    .from('claims')
    .insert([{ member_id, claim_type, total_claimed, status: 'submitted' }])
    .select()
    .single()

  if (claimError) throw claimError

  const claim_id = claim.id

  const itemsPayload = items.map((item) => ({
    claim_id,
    category: item.category || 'other',
    description: item.description,
    amount: Number(item.amount) || 0,
  }))

  const { error: itemsError } = await supabase.from('claim_items').insert(itemsPayload)
  if (itemsError) throw itemsError

  return claim
}
