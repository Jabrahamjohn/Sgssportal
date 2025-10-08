import React, { useState } from 'react'
import { ClaimSection } from '../../components/claims/ClaimSection'
import { ClaimItemsTable } from '../../components/claims/ClaimItemsTable'
import { TotalsCard } from '../../components/claims/TotalsCard'
import { Button } from '../../components/ui/Button'

export default function InpatientClaimForm() {
  const [bedCharges, setBedCharges] = useState(0)
  const [days, setDays] = useState(1)
  const [nhifRebate, setNhifRebate] = useState(0)

  const [inpatientCharges, setInpatientCharges] = useState<any[]>([])
  const [doctorCharges, setDoctorCharges] = useState<any[]>([])
  const [otherCharges, setOtherCharges] = useState<any[]>([])
  const [discounts, setDiscounts] = useState(0)
  const [total, setTotal] = useState(0)

  const calculate = () => {
    const inpatient = inpatientCharges.reduce((a, b) => a + Number(b.cost || 0), 0)
    const doctors = doctorCharges.reduce((a, b) => a + Number(b.cost || 0), 0)
    const others = otherCharges.reduce((a, b) => a + Number(b.cost || 0), 0)
    const accommodation = bedCharges * days - nhifRebate
    const totalCalc = accommodation + inpatient + doctors + others - discounts
    setTotal(totalCalc)
  }

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-semibold text-gray-800">🏥 Inpatient Claim Form</h1>

      <ClaimSection title="Part A — Diagnosis & Hospital Details">
        <div className="grid grid-cols-2 gap-4">
          <label className="block">
            <span className="text-sm text-gray-700">Bed Charges (per day)</span>
            <input
              type="number"
              className="w-full border rounded px-3 py-2"
              value={bedCharges}
              onChange={(e) => setBedCharges(Number(e.target.value))}
            />
          </label>
          <label className="block">
            <span className="text-sm text-gray-700">Number of Days</span>
            <input
              type="number"
              className="w-full border rounded px-3 py-2"
              value={days}
              onChange={(e) => setDays(Number(e.target.value))}
            />
          </label>
          <label className="block">
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
        <label className="block">
          <span className="text-sm text-gray-700">Total Discounts</span>
          <input
            type="number"
            className="w-40 border rounded px-3 py-2"
            value={discounts}
            onChange={(e) => setDiscounts(Number(e.target.value))}
          />
        </label>
      </ClaimSection>

      <TotalsCard title="Inpatient Total" amount={total} />

      <div className="flex justify-end">
        <Button onClick={calculate}>Calculate Total</Button>
      </div>
    </div>
  )
}
