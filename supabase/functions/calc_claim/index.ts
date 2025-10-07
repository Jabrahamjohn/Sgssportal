// supabase/functions/calc_claim/index.ts
import { serve } from 'std/server'
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm'
import { calculateClaimTotals, calculateChronicDispense } from '../../src/utils/reimbursement.ts'


const SUPABASE_URL = Deno.env.get('SUPABASE_URL') || ''
const SUPABASE_SERVICE_ROLE = Deno.env.get('SUPABASE_SERVICE_ROLE') || ''
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE)


serve(async (req) => {
try {
const body = await req.json()
// Accept either { claimId } or full claim payload { claim, items }
let claim: any = body.claim
const claimId = body.claimId || claim?.id


if (!claim && claimId) {
const { data: claimData, error } = await supabase.from('claims').select('*').eq('id', claimId).single()
if (error) throw error
claim = claimData
const { data: items } = await supabase.from('claim_items').select('*').eq('claim_id', claimId)
claim.items = items
}


if (!claim) return new Response(JSON.stringify({ error: 'No claim provided' }), { status: 400 })


// Map claim items to internal type
const items = (claim.items || []).map((i: any) => ({ description: i.description, amount: Number(i.amount) || 0 }))


// Determine options
const options = {
isCritical: claim.is_critical || false,
inpatient: claim.claim_type === 'inpatient',
atClinic: claim.at_clinic || false,
}


let result: any
if (claim.claim_type === 'chronic') {
const totalRetail = items.reduce((s: number, it: any) => s + (it.amount || 0), 0)
result = calculateChronicDispense(totalRetail)
// Write chronic_requests or update claim accordingly
await supabase.from('claims').update({ total_claimed: totalRetail, total_payable: result.fundPay }).eq('id', claimId)
} else {
result = calculateClaimTotals(items, options)
await supabase.from('claims').update({ total_claimed: result.subtotal, total_payable: result.payable }).eq('id', claimId)
}


// Insert audit log
await supabase.from('audit_logs').insert([{ actor_id: body.actorId || null, action: 'calculate_claim', meta: { claimId: claimId, result }, created_at: new Date().toISOString() }])


return new Response(JSON.stringify({ ok: true, result }), { status: 200 })
} catch (err) {
console.error(err)
return new Response(JSON.stringify({ error: err.message || String(err) }), { status: 500 })
}
})