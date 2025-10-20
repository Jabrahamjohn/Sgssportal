// src/pages/claims/ChronicClaimForm.tsx
import React, { useState } from 'react'
import { ClaimSection } from '../../components/claims/ClaimSection'
import { Button } from '../../components/ui/Button'
import TotalsCard from '../../components/claims/TotalsCard'
import FileUploader from '../../components/claims/FileUploader'
import { createClaimWithAttachments } from '../../services/claimsService'
import { supabase } from '../../services/supabaseClient'

export default function ChronicClaimForm() {
  const [doctor, setDoctor] = useState('')
  const [medicines, setMedicines] = useState([{ name: '', dosage: '', duration: '', cost: 0 }])
  const [total, setTotal] = useState(0)
  const [files, setFiles] = useState<File[]>([])

  // Update one medicine row
  const updateMedicine = (i: number, field: string, value: any) => {
    const updated = [...medicines]
    updated[i][field] = value
    setMedicines(updated)
  }

  // Add new medicine row
  const addMedicine = () => {
    setMedicines([...medicines, { name: '', dosage: '', duration: '', cost: 0 }])
  }

  // Compute total amount
  const calculate = () => {
    const totalAmount = medicines.reduce((a, b) => a + Number(b.cost || 0), 0)
    setTotal(totalAmount)
  }

  // Submit claim
  const handleSubmit = async () => {
    const { data: session } = await supabase.auth.getSession()
    const user = session?.user
    if (!user) return alert('Please log in first.')

    try {
      const items = medicines.map((m) => ({
        description: `${m.name} (${m.dosage}, ${m.duration})`,
        amount: m.cost,
        category: 'chronic'
      }))

      const newClaim = await createClaimWithAttachments(
        user.id,
        'chronic',
        items,
        files
      )

      alert('Chronic claim submitted successfully!')
      console.log('✅ Created claim:', newClaim)
    } catch (err: any) {
      alert('Error: ' + err.message)
    }
  }

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-semibold text-gray-800">💊 Chronic Illness Medication Form</h1>

      {/* Doctor Details */}
      <ClaimSection title="Doctor Details">
        <input
          type="text"
          placeholder="Doctor Name"
          value={doctor}
          onChange={(e) => setDoctor(e.target.value)}
          className="w-full border rounded px-3 py-2"
        />
      </ClaimSection>

      {/* Medicines Table */}
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
                <td>
                  <input
                    className="border rounded px-2 py-1"
                    value={m.name}
                    onChange={(e) => updateMedicine(i, 'name', e.target.value)}
                  />
                </td>
                <td>
                  <input
                    className="border rounded px-2 py-1"
                    value={m.dosage}
                    onChange={(e) => updateMedicine(i, 'dosage', e.target.value)}
                  />
                </td>
                <td>
                  <input
                    className="border rounded px-2 py-1"
                    value={m.duration}
                    onChange={(e) => updateMedicine(i, 'duration', e.target.value)}
                  />
                </td>
                <td>
                  <input
                    className="border rounded px-2 py-1 w-24"
                    type="number"
                    value={m.cost}
                    onChange={(e) => updateMedicine(i, 'cost', e.target.value)}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <Button className="mt-3" onClick={addMedicine}>
          + Add Medicine
        </Button>
      </ClaimSection>

      <FileUploader onFilesSelected={setFiles} />

      {/* Totals & Actions */}
      <TotalsCard title="Total Medication Cost" amount={total} />

      <div className="flex justify-end gap-3">
        <Button onClick={calculate}>Calculate Total</Button>
        <Button onClick={handleSubmit} className="bg-green-600 text-white">
          Submit Claim
        </Button>
      </div>
    </div>
  )
}
