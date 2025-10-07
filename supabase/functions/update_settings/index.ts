// supabase/functions/update_settings/index.ts
import { serve } from 'std/server'
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm'


const SUPABASE_URL = Deno.env.get('SUPABASE_URL') || ''
const SUPABASE_SERVICE_ROLE = Deno.env.get('SUPABASE_SERVICE_ROLE') || ''
const ADMIN_SECRET = Deno.env.get('ADMIN_SECRET') || ''
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE)


serve(async (req) => {
try {
const authHeader = req.headers.get('x-admin-secret') || ''
if (authHeader !== ADMIN_SECRET) return new Response(JSON.stringify({ error: 'unauthorized' }), { status: 401 })


const body = await req.json()
const allowedKeys = ['procedure_tiers', 'general_limits']
for (const key of Object.keys(body)) {
if (!allowedKeys.includes(key)) return new Response(JSON.stringify({ error: 'invalid key ' + key }), { status: 400 })
}


// Upsert each key
for (const key of Object.keys(body)) {
await supabase.from('settings').upsert([{ key, value: body[key] }], { onConflict: ['key'] })
}


await supabase.from('audit_logs').insert([{ actor_id: null, action: 'update_settings', meta: body, created_at: new Date().toISOString() }])


return new Response(JSON.stringify({ ok: true }), { status: 200 })
} catch (err) {
console.error(err)
return new Response(JSON.stringify({ error: String(err) }), { status: 500 })
}
})