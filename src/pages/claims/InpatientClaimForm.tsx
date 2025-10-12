// src/pages/claims/InpatientClaimForm.tsx
import React, { useState, useEffect } from 'react'
import { ClaimSection } from '../../components/claims/ClaimSection'
import { ClaimItemsTable } from '../../components/claims/ClaimItemsTable'
import TotalsCard from '../../components/claims/TotalsCard'
import { Button } from '../../components/ui/Button'
import FileUploader from '../../components/claims/FileUploader'
import { createClaimWithAttachments } from '../../services/claimsService'
import { supabase } from '../../services/supabaseClient'
import { toast } from 'react-hot-toast'

export default function InpatientClaimForm() {
  const [bedCharges, setBedCharges] = useState(0)
  const [days, setDays] = useState(1)
  const [nhifRebate, setNhifRebate] = useState(0)
  const [inpatientCharges, setInpatientCharges] = useState<any[]>([])
  const [doctorCharges, setDoctorCharges] = useState<any[]>([])
  const [otherCharges, setOtherCharges] = useState<any[]>([])
  const [discounts, setDiscounts] = useState(0)
  const [files, setFiles] = useState<File[]>([])
  const [total, setTotal] = useState(0)
  const [admissionDate, setAdmissionDate] = useState('')
  const [dischargeDate, setDischargeDate] = useState('')
  const [loading, setLoading] = useState(false)

  // 🔹 Auto-recalculate total when relevant values change
  useEffect(() => {
    const inpatient = inpatientCharges.reduce((a, b) => a + Number(b.cost || 0), 0)
    const doctors = doctorCharges.reduce((a, b) => a + Number(b.cost || 0), 0)
    const others = otherCharges.reduce((a, b) => a + Number(b.cost || 0), 0)
    const accommodation = bedCharges * days - nhifRebate
    const totalCalc = accommodation + inpatient + doctors + others - discounts
    setTotal(totalCalc)
  }, [bedCharges, days, nhifRebate, inpatientCharges, doctorCharges, otherCharges, discounts])

  // 🔹 Submit claim
  const handleSubmit = async () => {
    setLoading(true)
    try {
      const { data: session } = await supabase.auth.getSession()
      const user = session?.user
      if (!user) throw new Error('Please log in first.')

      if (!admissionDate || !dischargeDate) {
        throw new Error('Please provide both admission and discharge dates.')
      }

      if (files.length === 0 || !files.some(f => /discharge/i.test(f.name))) {
        throw new Error('Please attach a discharge summary document.')
      }

      const items = [
        ...inpatientCharges.map((c) => ({
          category: 'inpatient',
          description: c.description || 'Inpatient Charge',
          amount: Number(c.cost || 0),
        })),
        ...doctorCharges.map((d) => ({
          category: 'doctor',
          description: d.description || 'Doctor Charge',
          amount: Number(d.cost || 0),
        })),
        ...otherCharges.map((o) => ({
          category: 'other',
          description: o.description || 'Other Charge',
          amount: Number(o.cost || 0),
        })),
      ]

      await createClaimWithAttachments(
        user.id,
        'inpatient',
        items,
        files,
        admissionDate,
        dischargeDate
      )

      toast.success('✅ Inpatient claim submitted successfully!')
      setInpatientCharges([])
      setDoctorCharges([])
      setOtherCharges([])
      setFiles([])
      setAdmissionDate('')
      setDischargeDate('')
      setDiscounts(0)
    } catch (err: any) {
      console.error(err)
      toast.error(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-semibold text-gray-800">🏥 Inpatient Claim Form</h1>

      <ClaimSection title="Part A — Hospital & Stay Details">
        <div className="grid grid-cols-2 gap-4">
          <label>
            <span className="text-sm text-gray-700">Admission Date</span>
            <input
              type="date"
              className="w-full border rounded px-3 py-2"
              value={admissionDate}
              onChange={(e) => setAdmissionDate(e.target.value)}
            />
          </label>
          <label>
            <span className="text-sm text-gray-700">Discharge Date</span>
            <input
              type="date"
              className="w-full border rounded px-3 py-2"
              value={dischargeDate}
              onChange={(e) => setDischargeDate(e.target.value)}
            />
          </label>
          <label>
            <span className="text-sm text-gray-700">Bed Charges (per day)</span>
            <input
              type="number"
              className="w-full border rounded px-3 py-2"
              value={bedCharges}
              onChange={(e) => setBedCharges(Number(e.target.value))}
            />
          </label>
          <label>
            <span className="text-sm text-gray-700">Number of Days</span>
            <input
              type="number"
              className="w-full border rounded px-3 py-2"
              value={days}
              onChange={(e) => setDays(Number(e.target.value))}
            />
          </label>
          <label>
            <span className="text-sm text-gray-700">NHIF Rebate</span>
            <input
              type="number"
              className="w-full border rounded px-3 py-2"
              value={nhifRebate}
              onChange={(e) => setNhifRebate(Number(e.target.value))}
            />
          </label>
        </div>
      </ClaimSection>

      <ClaimSection title="Part D — Inpatient Charges">
        <ClaimItemsTable items={inpatientCharges} setItems={setInpatientCharges} columns={['Description', 'Cost']} />
      </ClaimSection>

      <ClaimSection title="Part E — Doctor Charges">
        <ClaimItemsTable items={doctorCharges} setItems={setDoctorCharges} columns={['Doctor Name', 'Cost']} />
      </ClaimSection>

      <ClaimSection title="Part F — Other Claimable Charges">
        <ClaimItemsTable items={otherCharges} setItems={setOtherCharges} columns={['Description', 'Cost']} />
      </ClaimSection>

      <ClaimSection title="Part G — Discounts">
        <label>
          <span className="text-sm text-gray-700">Total Discounts</span>
          <input
            type="number"
            className="w-40 border rounded px-3 py-2"
            value={discounts}
            onChange={(e) => setDiscounts(Number(e.target.value))}
          />
        </label>
      </ClaimSection>

      <FileUploader onFilesSelected={setFiles} />

      <TotalsCard title="Inpatient Total" amount={total} />

      <div className="flex justify-end gap-3 mt-4">
        <Button onClick={handleSubmit} disabled={loading}>
          {loading ? 'Submitting...' : 'Submit Claim'}
        </Button>
      </div>

      <div className="bg-yellow-50 text-sm p-3 rounded border border-yellow-200">
        <strong>Byelaws reminders:</strong>
        <ul className="list-disc ml-5">
          <li>Claims must be submitted within 90 days of discharge (Byelaws §4.1).</li>
          <li>NHIF deductions must be declared before fund calculation (Byelaws §6.3).</li>
          <li>Attach original receipts and discharge summary. (Byelaws §4.2)</li>
        </ul>
      </div>
    </div>
  )
}
