// Simple UI to load and save `settings` table entries `procedure_tiers` and `general_limits`.

import React, { useEffect, useState } from 'react'
import { supabase } from '../../services/supabaseClient'


export default function ReimbursementScales(){
const [tiers, setTiers] = useState<any>(null)
const [limits, setLimits] = useState<any>(null)
const [loading, setLoading] = useState(true)


useEffect(()=>{ load() }, [])


async function load(){
setLoading(true)
const { data: t } = await supabase.from('settings').select('value').eq('key','procedure_tiers').single()
const { data: l } = await supabase.from('settings').select('value').eq('key','general_limits').single()
setTiers(t?.value || {})
setLimits(l?.value || {})
setLoading(false)
}


async function save(){
await supabase.from('settings').upsert([{ key: 'procedure_tiers', value: tiers }, { key: 'general_limits', value: limits }], { onConflict: ['key'] })
alert('Saved')
}


if (loading) return <div>Loading...</div>


return (
<div className="space-y-4">
<h2 className="text-xl">Reimbursement Scales</h2>
<div className="bg-white p-4 rounded shadow">
<h3>Procedure tiers</h3>
{Object.keys(tiers).map(k => (
<div key={k} className="flex gap-2 items-center">
<label className="w-32">{k}</label>
<input value={tiers[k]} onChange={(e)=> setTiers({...tiers, [k]: Number(e.target.value)})} className="p-2 border rounded" />
</div>
))}
</div>


<div className="bg-white p-4 rounded shadow">
<h3>General limits</h3>
{Object.keys(limits).map(k => (
<div key={k} className="flex gap-2 items-center">
<label className="w-48">{k}</label>
<input value={limits[k]} onChange={(e)=> setLimits({...limits, [k]: Number(e.target.value)})} className="p-2 border rounded" />
</div>
))}
</div>


<div>
<button onClick={save} className="px-4 py-2 bg-blue-600 text-white rounded">Save</button>
</div>
</div>
)
}
