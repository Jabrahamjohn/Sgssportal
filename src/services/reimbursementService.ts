// src/services/reimbursementService.ts
import { supabase } from './supabaseClient'

export async function getReimbursementScales() {
  const { data, error } = await supabase
    .from('reimbursement_scales')
    .select('*')
    .order('category', { ascending: true })

  if (error) {
    console.error('Error fetching reimbursement scales:', error)
    return []
  }
  return data
}
