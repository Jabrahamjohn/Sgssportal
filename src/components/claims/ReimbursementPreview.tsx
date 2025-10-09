import React, { useEffect, useState } from 'react'
import { getReimbursementScales } from '../../services/reimbursementService'

interface Props {
  total: number
  category: string
}

export default function ReimbursementPreview({ total, category }: Props) {
  const [scales, setScales] = useState<any[]>([])

  useEffect(() => {
    getReimbursementScales().then(setScales)
  }, [])

  const scale = scales.find(s => s.category.toLowerCase() === category.toLowerCase())

  if (!scale) return <div className="text-sm text-gray-500">Loading reimbursement details...</div>

  const fundShare = (scale.fund_share / 100) * total
  const memberShare = (scale.member_share / 100) * total
  const cappedTotal = Math.min(total, scale.ceiling)

  return (
    <div className="border rounded-lg p-4 bg-gray-50 mt-4">
      <h3 className="font-semibold text-gray-700 mb-2">💰 Reimbursement Breakdown ({category})</h3>
      <div className="text-sm space-y-1">
        <p>Total Claimed: <strong>KES {total.toLocaleString()}</strong></p>
        <p>Fund Share ({scale.fund_share}%): <strong>KES {fundShare.toLocaleString()}</strong></p>
        <p>Member Share ({scale.member_share}%): <strong>KES {memberShare.toLocaleString()}</strong></p>
        <p>Ceiling: <strong>KES {scale.ceiling.toLocaleString()}</strong></p>
        <p className="text-blue-700 font-semibold mt-2">
          Payable (Capped): KES {cappedTotal.toLocaleString()}
        </p>
      </div>
    </div>
  )
}
