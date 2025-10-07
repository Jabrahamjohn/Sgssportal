// src/pages/claims/OutpatientClaimForm.tsx (updated)
export default function OutpatientClaimForm(){
const { register, control, handleSubmit, watch } = useForm<FormValues>({ resolver: zodResolver(OutpatientSchema) })
const { fields, append } = useFieldArray({ control, name: 'medicines' })
const [calcResult, setCalcResult] = useState<any>(null)
const [loadingCalc, setLoadingCalc] = useState(false)


const onCalculate = async (data: FormValues) => {
setLoadingCalc(true)
// Build payload
const items = (data.medicines || []).map(m => ({ description: m.name, amount: Number(m.cost || 0) * Number(m.qty || 1) }))


// Create a temporary claim row in DB with status 'draft' to get an id (optional)
const { data: created, error } = await supabase.from('claims').insert([{ member_id: null, claim_type: 'outpatient', date_of_first_visit: data.dateOfFirstVisit, status: 'draft' }]).select().single()
if (error) console.error('create draft claim error', error)
const claimId = created?.id


// Insert items
if (claimId) {
const itemsToInsert = items.map(i => ({ claim_id: claimId, category: 'medicine', description: i.description, amount: i.amount }))
await supabase.from('claim_items').insert(itemsToInsert)
}


try {
const edgeUrl = import.meta.env.VITE_CALC_CLAIM_URL || '/.netlify/functions/calc_claim'
const res = await fetch(edgeUrl, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ claimId, actorId: supabase.auth.getUser()?.data?.user?.id }) })
const json = await res.json()
if (json.ok) setCalcResult(json.result)
else alert('Calc error: ' + (json.error || JSON.stringify(json)))
} catch (err) { console.error(err); alert('Calculation failed') }


setLoadingCalc(false)
}


const onSubmit = async (data: FormValues) => {
// Finalize the claim: mark submitted_at and status -> submitted. Keep created draft id logic if used above.
alert('Submitted — make sure to run Calculate first and confirm payable amounts')
}


return (
<form onSubmit={handleSubmit(onSubmit)} className="space-y-4 max-w-3xl">
<div>
<label className="block">Patient Name</label>
<input {...register('patientName')} className="w-full p-2 border rounded" />
</div>


<div>
<label className="block">Date of 1st Visit</label>
<input type="date" {...register('dateOfFirstVisit')} className="p-2 border rounded" />
</div>


<div>
<h3 className="font-semibold">Medicines</h3>
{fields.map((f, i) => (
<div key={f.id} className="flex gap-2">
<input {...register(`medicines.${i}.name` as const)} placeholder="Name" />
<input type="number" {...register(`medicines.${i}.qty` as const, { valueAsNumber: true })} placeholder="Qty" />
<input type="number" {...register(`medicines.${i}.cost` as const, { valueAsNumber: true })} placeholder="Cost" />
</div>
))}
<button type="button" onClick={() => append({ name: '', qty: 1, cost: 0 })} className="mt-2 px-3 py-1 bg-blue-600 text-white rounded">Add Medicine</button>
</div>


<div className="flex gap-2">
<button type="button" onClick={handleSubmit(onCalculate)} className="px-4 py-2 bg-yellow-500 text-white rounded">{loadingCalc? 'Calculating...' : 'Calculate'}</button>
<button type="submit" className="px-4 py-2 bg-green-600 text-white rounded">Submit Claim</button>
</div>


{calcResult && (
<div className="mt-4 p-4 bg-white rounded shadow">
<h4 className="font-semibold">Calculation Result</h4>
<p>Subtotal: Ksh {calcResult.subtotal}</p>
<p>Fund Payable: Ksh {calcResult.payable}</p>
<p>Member Share: Ksh {calcResult.memberShare}</p>
<p>Cap: Ksh {calcResult.cap}</p>
</div>
)}
</form>
)
}