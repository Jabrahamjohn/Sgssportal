import React, { useState } from 'react'
import { Button } from '../../components/ui/Button'
import { ClaimSection } from '../../components/claims/ClaimSection'
import { ClaimItemsTable } from '../../components/claims/ClaimItemsTable'
import { TotalsCard } from '../../components/claims/TotalsCard'

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
      <h1 className="text-2xl font-semibold text-gray-800"> import React, { useState } from 'react'
import { Button } from '../../components/ui/Button'
import { ClaimSection } from '../../components/claims/ClaimSection'
import { ClaimItemsTable } from '../../components/claims/ClaimItemsTable'
import { TotalsCard } from '../../components/claims/TotalsCard'

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
      <h1 className="text-2xl font-semibold text-gray-800"> 💊 Outpatient Claim Form</h1>

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
    </div>
  )
}
Outpatient Claim Form</h1>

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
    </div>
  )
}
