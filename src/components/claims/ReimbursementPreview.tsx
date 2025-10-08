import React from 'react'

interface Props {
  total: number
  category: string // Outpatient, Inpatient, Chronic
  scales: { category: string; fund_share: number; member_share: number; ceiling: number }[]
}

export default function ReimbursementPreview({ total, category, scales }: Props) {
  const rule = scales.find((s) => s.category.toLowerCase() === category.toLowerCase())
  if (!rule) return null

  const fundPortion = (total * rule.fund_share) / 100
  const memberPortion = (total * rule.member_share) / 100
  const payable = Math.min(fundPortion, rule.ceiling)

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 mt-6 shadow-sm">
      <h2 className="text-lg font-semibold text-blue-800 mb-2">Reimbursement Calculation Preview</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
        <div>
          <p className="text-gray-600">Category</p>
          <p className="font-medium">{category}</p>
        </div>
        <div>
          <p className="text-gray-600">Fund Share</p>
          <p className="font-medium">{rule.fund_share}%</p>
        </div>
        <div>
          <p className="text-gray-600">Member Share</p>
          <p className="font-medium">{rule.member_share}%</p>
        </div>
        <div>
          <p className="text-gray-600">Ceiling</p>
          <p className="font-medium">Ksh {rule.ceiling.toLocaleString()}</p>
        </div>
      </div>

      <div className="mt-4 border-t pt-3 flex justify-between text-base">
        <span className="font-semibold text-gray-700">Fund Payable:</span>
        <span className="font-semibold text-blue-700">Ksh {payable.toLocaleString()}</span>
      </div>
      <p className="text-xs text-gray-500 mt-1">Member pays: Ksh {memberPortion.toLocaleString()}</p>
    </div>
  )
}
