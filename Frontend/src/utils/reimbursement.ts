import type { ClaimItem } from '../types'


export const ANNUAL_LIMIT = 250000
export const CRITICAL_ILLNESS_ADDON = 200000


export type ProcedureTier = 'minor'|'medium'|'major'|'regional'|'special'


const procedureTierMap: Record<ProcedureTier, number> = {
minor: 30000,
medium: 35000,
major: 50000,
regional: 90000,
special: 70000,
}


export function calculateClaimTotals(items: ClaimItem[], options?: { isCritical?: boolean, inpatient?: boolean, atClinic?: boolean }){
const subtotal = items.reduce((s, i) => s + (i.amount || 0), 0)


// Fund liability 80% except when at SGSS clinic => 100% outpatient
const fundSharePercent = options?.atClinic ? 100 : 80


let payable = Math.floor((subtotal * fundSharePercent) / 100)
let memberShare = subtotal - payable


// apply annual limit check (note: this should be compared to member's used benefit in DB)
const cap = ANNUAL_LIMIT + (options?.isCritical ? CRITICAL_ILLNESS_ADDON : 0)
if (payable > cap) {
memberShare += (payable - cap)
payable = cap
}


return { subtotal, payable, memberShare, cap }
}


export function calculateChronicDispense(totalRetailPrice: number){
// members pay 60% of retail price
const memberPay = Math.ceil((totalRetailPrice * 60) / 100)
const fundPay = totalRetailPrice - memberPay
return { totalRetailPrice, fundPay, memberPay }
}


export function getProcedureEstimate(tier: ProcedureTier){
return procedureTierMap[tier]
}