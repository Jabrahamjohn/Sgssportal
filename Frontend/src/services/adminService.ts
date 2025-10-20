import { supabase } from './supabaseClient'

export async function getReimbursementScales() {
  const { data, error } = await supabase.from('settings').select('value').eq('key', 'reimbursement_scales').single()
  if (error) {
    console.error('Error loading reimbursement scales', error)
    return null
  }
  return data?.value || []
}

export async function updateReimbursementScales(scales: any[]) {
  const { error } = await supabase
    .from('settings')
    .upsert({ key: 'reimbursement_scales', value: scales }, { onConflict: 'key' })
  if (error) {
    console.error('Error updating reimbursement scales', error)
    return false
  }
  return true
}

export async function getMembershipTypes() {
  const { data, error } = await supabase.from('membership_types').select('*')
  if (error) {
    console.error('Error loading membership types', error)
    return []
  }
  return data
}

export async function updateMembershipTypes(types: any[]) {
  for (const t of types) {
    const { error } = await supabase.from('membership_types').update(t).eq('id', t.id)
    if (error) {
      console.error('Error updating type', error)
      return false
    }
  }
  return true
}
