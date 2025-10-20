// src/utils/reimbursement.server.ts
import type { ClaimItem } from '../types'


export type SettingsShape = {
general_limits: {
annual_limit: number
critical_addon: number
fund_share_percent: number
clinic_outpatient_percent: number
}
procedure_tiers: Record<string, number>
}


export function calculateClaimTotalsWithSettings(items: ClaimItem[], settings: SettingsShape, options?: { isCritical?: boolean, inpatient?: boolean, atClinic?: boolean }){
const subtotal = items.reduce((s, i) => s + (i.amount || 0), 0)


const fundSharePercent = options?.atClinic ? settings.general_limits.clinic_outpatient_percent : settings.general_limits.fund_share_percent


let payable = Math.floor((subtotal * fundSharePercent) / 100)
let memberShare = subtotal - payable


const cap = settings.general_limits.annual_limit + (options?.isCritical ? settings.general_limits.critical_addon : 0)
if (payable > cap) {
memberShare += (payable - cap)
payable = cap
}


return { subtotal, payable, memberShare, cap }
}


export function calculateChronicDispenseWithSettings(totalRetailPrice: number, settings: SettingsShape){
// members pay 60% as per byelaws (kept static because it's fixed in byelaws)
const memberPay = Math.ceil((totalRetailPrice * 60) / 100)
const fundPay = totalRetailPrice - memberPay
return { totalRetailPrice, fundPay, memberPay }
}