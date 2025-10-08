import React, { useEffect, useState } from 'react'
import { supabase } from '../../services/supabaseClient'

export default function ReimbursementPreview({ total, category }: { total: number; category: string }) {
  const [rule, setRule] = useState<any>(null)

  useEffect(() => {
    async function loadRule() {
      const { data } = await supabase.from('reimbursement_scales').select('*').eq('category', category).single()
      setRule(data)
    }
    loadRule()
  }, [category])

  if (!rule) return <p className="text-gray-400 text-sm">Loading reimbursement data...</p>

  const fundPortion = (total * rule.fund_share) / 100
  const memberPortion = (total * rule.member_share) / 100
  const payable = Math.min(fundPortion, rule.ceiling)

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 mt-6 shadow-sm">
      <h2 className="text-lg font-semibold text-blue-800 mb-2">Reimbursement Calculation</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
        <div><p>Fund Share</p><p>{rule.fund_share}%</p></div>
        <div><p>Member Share</p><p>{rule.member_share}%</p></div>
        <div><p>Ceiling</p><p>Ksh {rule.ceiling.toLocaleString()}</p></div>
        <div><p>Total Payable</p><p className="font-semibold">Ksh {payable.toLocaleString()}</p></div>
      </div>
      <p className="text-xs text-gray-500 mt-1">Member pays: Ksh {memberPortion.toLocaleString()}</p>
    </div>
  )
}
