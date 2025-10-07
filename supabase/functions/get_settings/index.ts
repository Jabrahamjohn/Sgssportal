// supabase/functions/get_settings/index.ts
import { serve } from 'std/server'
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm'


const SUPABASE_URL = Deno.env.get('SUPABASE_URL') || ''
const SUPABASE_SERVICE_ROLE = Deno.env.get('SUPABASE_SERVICE_ROLE') || ''
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE)


serve(async (req) => {
try {
const { data: tiers } = await supabase.from('settings').select('value').eq('key','procedure_tiers').single()
const { data: limits } = await supabase.from('settings').select('value').eq('key','general_limits').single()
const settings = { procedure_tiers: tiers?.value || {}, general_limits: limits?.value || {} }
return new Response(JSON.stringify({ ok: true, settings }), { status: 200 })
} catch (err) {
console.error(err)
return new Response(JSON.stringify({ error: String(err) }), { status: 500 })
}
})