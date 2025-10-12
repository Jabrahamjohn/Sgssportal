// src/pages/claims/OutpatientClaimForm.tsx
import React, { useState, useEffect } from 'react'
import FileUploader from '../../components/claims/FileUploader'
import { createClaimWithAttachments } from '../../services/claimsService'
import { Button } from '../../components/ui/Button'
import { ClaimSection } from '../../components/claims/ClaimSection'
import { ClaimItemsTable } from '../../components/claims/ClaimItemsTable'
import TotalsCard from '../../components/claims/TotalsCard'
import ReimbursementPreview from '../../components/claims/ReimbursementPreview'
import { supabase } from '../../services/supabaseClient'
import { toast } from 'react-hot-toast'

export default function OutpatientClaimForm() {
  const [consultations, setConsultations] = useState<any[]>([])
  const [medicines, setMedicines] = useState<any[]>([])
  const [investigations, setInvestigations] = useState<any[]>([])
  const [procedures, setProcedures] = useState<any[]>([])
  const [files, setFiles] = useState<File[]>([])
  const [totals, setTotals] = useState({ grandTotal: 0 })
  const [loading, setLoading] = useState(false)
  const [firstVisitDate, setFirstVisitDate] = useState('')

  // 🔹 Auto-recalculate totals when items change
  useEffect(() => {
    const sum = (arr: any[]) => arr.reduce((a, b) => a + (Number(b.cost || b.amount || 0)), 0)
    const total = sum(consultations) + sum(medicines) + sum(investigations) + sum(procedures)
    setTotals({ grandTotal: total })
  }, [consultations, medicines, investigations, procedures])

  // 🔹 Submit handler
  const handleSubmit = async () => {
    setLoading(true)
    try {
      const { data: session } = await supabase.auth.getSession()
      const user = session?.user
      if (!user) throw new Error('Please log in first.')

      if (
        consultations.length +
          medicines.length +
          investigations.length +
          procedures.length ===
        0
      ) {
        throw new Error('Please add at least one claim item.')
      }

      if (!firstVisitDate) throw new Error('Please provide the date of first visit.')

      const items = [
        ...consultations.map((c) => ({
          category: 'consultation',
          description: c.diagnosis || 'Consultation',
          amount: Number(c.cost || 0),
        })),
        ...medicines.map((m) => ({
          category: 'medicine',
          description: m.medicine || 'Medicine',
          amount: Number(m.cost || 0),
        })),
        ...investigations.map((i) => ({
          category: 'investigation',
          description: i.test || 'Investigation',
          amount: Number(i.cost || 0),
        })),
        ...procedures.map((p) => ({
          category: 'procedure',
          description: p.procedure || 'Procedure',
          amount: Number(p.cost || 0),
        })),
      ]

      // ✅ Call your backend helper
      await createClaimWithAttachments(
        user.id,
        'outpatient',
        items,
        files,
        firstVisitDate,
        null // no discharge date for outpatient
      )

      toast.success('✅ Claim submitted successfully!')
      // reset form
      setConsultations([])
      setMedicines([])
      setInvestigations([])
      setProcedures([])
      setFiles([])
      setFirstVisitDate('')
    } catch (err: any) {
      console.error(err)
      toast.error(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-semibold text-gray-800">
        Outpatient Claim Form
      </h1>

      {/* Part A */}
      <ClaimSection title="Part A — Consultations">
        <ClaimItemsTable
          items={consultations}
          setItems={setConsultations}
          columns={['Date', 'Diagnosis', 'Charge']}
        />
      </ClaimSection>

      {/* Part B */}
      <ClaimSection title="Part B — Medicines/Injections">
        <ClaimItemsTable
          items={medicines}
          setItems={setMedicines}
          columns={['Medicine', 'Qty', 'Cost']}
        />
      </ClaimSection>

      {/* Part C */}
      <ClaimSection title="Part C — Investigations">
        <ClaimItemsTable
          items={investigations}
          setItems={setInvestigations}
          columns={['Test', 'Cost']}
        />
      </ClaimSection>

      {/* Part D */}
      <ClaimSection title="Part D — Procedures">
        <ClaimItemsTable
          items={procedures}
          setItems={setProcedures}
          columns={['Procedure', 'Cost']}
        />
      </ClaimSection>

      {/* Date + Upload */}
      <div className="bg-white p-4 rounded border">
        <label className="block mb-2 font-medium text-gray-700">
          Date of First Visit:
        </label>
        <input
          type="date"
          value={firstVisitDate}
          onChange={(e) => setFirstVisitDate(e.target.value)}
          className="border rounded p-2 w-full mb-4"
        />
        <FileUploader onFilesSelected={setFiles} />
      </div>

      {/* Totals + Buttons */}
      <TotalsCard title="Outpatient Total" amount={totals.grandTotal} />

      <div className="flex justify-end gap-3 mt-4">
        <Button onClick={handleSubmit} disabled={loading}>
          {loading ? 'Submitting...' : 'Submit Claim'}
        </Button>
      </div>

      {/* Byelaws Reminder */}
      <div className="bg-yellow-50 text-sm p-3 rounded border border-yellow-200">
        <strong>Byelaws reminders:</strong>
        <ul className="list-disc ml-5">
          <li>Claims must be submitted within 90 days of the visit (Byelaws §4.1).</li>
          <li>Member benefits start after 60 days from membership start (Constitution §6.3).</li>
          <li>Attach original receipts and prescriptions. Photocopies not accepted (Byelaws §4.2).</li>
        </ul>
      </div>

      <ReimbursementPreview total={totals.grandTotal} category="Outpatient" />
    </div>
  )
}
