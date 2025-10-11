import React, { useState } from 'react'
import { ClaimSection } from '../../components/claims/ClaimSection'
import { Button } from '../../components/ui/Button'
import TotalsCard  from '../../components/claims/TotalsCard'
import FileUploader from '../../components/claims/FileUploader'
import { createClaimWithAttachments } from '../../services/claimsService'
import { supabase } from '../../services/supabaseClient'


export default function ChronicClaimForm() {
  const [doctor, setDoctor] = useState('')
  const [medicines, setMedicines] = useState([{ name: '', dosage: '', duration: '', cost: 0 }])
  const [total, setTotal] = useState(0)

  const updateMedicine = (i: number, field: string, value: any) => {
    const updated = [...medicines]
    updated[i][field] = value
    setMedicines(updated)
  }

  const addMedicine = () => {
    setMedicines([...medicines, { name: '', dosage: '', duration: '', cost: 0 }])
  }

  const calculate = () => {
    const totalAmount = medicines.reduce((a, b) => a + Number(b.cost || 0), 0)
    setTotal(totalAmount)
  }

  const [files, setFiles] = useState<File[]>([])

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-semibold text-gray-800"> 💉 Chronic Illness Medication Form</h1>

      <ClaimSection title="Doctor Details">
        <input
          type="text"
          placeholder="Doctor Name"
          value={doctor}
          onChange={(e) => setDoctor(e.target.value)}
          className="w-full border rounded px-3 py-2"
        />
      </ClaimSection>

      <ClaimSection title="Prescribed Medicines">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b text-gray-600">
              <th>Medicine</th>
              <th>Dosage</th>
              <th>Duration</th>
              <th>Cost (Ksh)</th>
            </tr>
          </thead>
          <tbody>
            {medicines.map((m, i) => (
              <tr key={i} className="border-b">
                <td><input className="border rounded px-2 py-1" value={m.name} onChange={e => updateMedicine(i, 'name', e.target.value)} /></td>
                <td><input className="border rounded px-2 py-1" value={m.dosage} onChange={e => updateMedicine(i, 'dosage', e.target.value)} /></td>
                <td><input className="border rounded px-2 py-1" value={m.duration} onChange={e => updateMedicine(i, 'duration', e.target.value)} /></td>
                <td><input className="border rounded px-2 py-1 w-24" type="number" value={m.cost} onChange={e => updateMedicine(i, 'cost', e.target.value)} /></td>
              </tr>
            ))}
          </tbody>
        </table>
        <Button className="mt-3" onClick={addMedicine}>+ Add Medicine</Button>
      </ClaimSection>
      
      <FileUploader onFilesSelected={setFiles} />
      <div className="flex gap-2 justify-end">
        <Button onClick={async () => {
          const { data: session } = await supabase.auth.getSession()
          if (!session?.user) { alert('Login required'); return }
          try {
            const created = await createClaimWithAttachments(session.user.id, 'outpatient', [...consultations, ...medicines, ...investigations, ...procedures], files)
            alert('Claim submitted: ' + created.id)
            // optionally redirect to claim history
          } catch (err: any) {
            alert('Error: ' + err.message)
          }
        }}>Submit Claim</Button>
      </div>


      <TotalsCard title="Total Medication Cost" amount={total} />

      <div className="flex justify-end">
        <Button onClick={calculate}>Calculate Total</Button>
      </div>
    </div>
  )
}
