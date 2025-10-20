import React from 'react'
import { Button } from '../../components/ui/Button'
import { exportClaimsToCSV, exportClaimsToPDF } from '../../services/reportService'

export default function Reports() {
  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-semibold text-gray-800">Reports & Exports</h1>

      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <p className="text-gray-600 mb-4">
          Download payment and claim reports for financial audits and fund review meetings.
        </p>
        <div className="flex gap-4">
          <Button onClick={exportClaimsToCSV}>Export as CSV</Button>
          <Button onClick={exportClaimsToPDF} className="bg-blue-600 text-white">
            Export as PDF
          </Button>
        </div>
      </div>
    </div>
  )
}
