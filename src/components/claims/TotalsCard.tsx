import React from 'react'

interface TotalsCardProps {
  title: string
  amount: number
}

export default function TotalsCard({ title, amount }: TotalsCardProps) {
  return (
    <div className="border rounded-xl bg-gray-50 p-4 flex items-center justify-between shadow-sm">
      <h3 className="text-lg font-semibold text-gray-700">{title}</h3>
      <p className="text-xl font-bold text-blue-700">Ksh {amount.toLocaleString()}</p>
    </div>
  )
}
