import React, { useState } from 'react'
import { Button } from '../../components/ui/Button'
import { ClaimSection } from '../../components/claims/ClaimSection'
import { ClaimItemsTable } from '../../components/claims/ClaimItemsTable'
import TotalsCard  from '../../components/claims/TotalsCard'
import ReimbursementPreview from '../../components/claims/ReimbursementPreview'


export default function OutpatientClaimForm() {
  const [consultations, setConsultations] = useState<any[]>([])
  const [medicines, setMedicines] = useState<any[]>([])
  const [investigations, setInvestigations] = useState<any[]>([])
  const [procedures, setProcedures] = useState<any[]>([])

  const [totals, setTotals] = useState({ grandTotal: 0 })

  const calculateTotal = () => {
    const sum = (arr: any[]) => arr.reduce((a, b) => a + (Number(b.cost) || 0), 0)
    const total = sum(consultations) + sum(medicines) + sum(investigations) + sum(procedures)
    setTotals({ grandTotal: total })
  }

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-semibold text-gray-800">Outpatient Claim Form</h1>

      <ClaimSection title="Part A — Consultations">
        <ClaimItemsTable items={consultations} setItems={setConsultations} columns={['Date', 'Diagnosis', 'Charge']} />
      </ClaimSection>

      <ClaimSection title="Part B — Medicines/Injections">
        <ClaimItemsTable items={medicines} setItems={setMedicines} columns={['Medicine', 'Qty', 'Cost']} />
      </ClaimSection>

      <ClaimSection title="Part C — Investigations">
        <ClaimItemsTable items={investigations} setItems={setInvestigations} columns={['Test', 'Cost']} />
      </ClaimSection>

      <ClaimSection title="Part D — Procedures">
        <ClaimItemsTable items={procedures} setItems={setProcedures} columns={['Procedure', 'Cost']} />
      </ClaimSection>

      <TotalsCard title="Outpatient Total" amount={totals.grandTotal} />

      <div className="flex justify-end">
        <Button onClick={calculateTotal}>Calculate Total</Button>
      </div>
      <ReimbursementPreview
  total={totals.grandTotal}
  category="Outpatient"
  scales={[
    { category: 'Outpatient', fund_share: 80, member_share: 20, ceiling: 50000 },
    { category: 'Inpatient', fund_share: 85, member_share: 15, ceiling: 200000 },
    { category: 'Chronic', fund_share: 60, member_share: 40, ceiling: 120000 },
  ]}
/>
    </div>
  )
}
