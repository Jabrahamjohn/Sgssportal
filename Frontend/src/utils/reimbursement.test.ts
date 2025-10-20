import { describe, it, expect } from 'vitest'
import { calculateClaimTotals, calculateChronicDispense } from './reimbursement'


describe('reimbursement calculator', () => {
it('calculates outpatient payable at clinic as 100%', () => {
const items = [{ description: 'consult', amount: 2000 }]
const res = calculateClaimTotals(items, { atClinic: true })
expect(res.payable).toBe(2000)
expect(res.memberShare).toBe(0)
})


it('applies 80% fund share elsewhere', () => {
const items = [{ description: 'consult', amount: 2000 }]
const res = calculateClaimTotals(items, { atClinic: false })
expect(res.payable).toBe(1600)
expect(res.memberShare).toBe(400)
})


it('calculates chronic dispense 60% member payable', () => {
const res = calculateChronicDispense(1000)
expect(res.memberPay).toBe(600)
expect(res.fundPay).toBe(400)
})
})