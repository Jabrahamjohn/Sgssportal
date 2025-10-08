import React from 'react'
import { Link } from 'react-router-dom'
import { Button } from '../../components/ui/Button'

export default function ClaimsDashboard() {
  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-semibold text-gray-800">🩺 Claims Management</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link to="/claims/outpatient">
          <div className="bg-white rounded-2xl p-6 shadow hover:shadow-lg transition cursor-pointer">
            <h2 className="text-lg font-medium text-gray-800 mb-2">Outpatient Claim</h2>
            <p className="text-gray-500 text-sm">Consultations, medicines, investigations, and procedures.</p>
          </div>
        </Link>

        <Link to="/claims/inpatient">
          <div className="bg-white rounded-2xl p-6 shadow hover:shadow-lg transition cursor-pointer">
            <h2 className="text-lg font-medium text-gray-800 mb-2">Inpatient Claim</h2>
            <p className="text-gray-500 text-sm">Hospitalization details, NHIF rebate, and doctor charges.</p>
          </div>
        </Link>

        <Link to="/claims/chronic">
          <div className="bg-white rounded-2xl p-6 shadow hover:shadow-lg transition cursor-pointer">
            <h2 className="text-lg font-medium text-gray-800 mb-2">Chronic Illness Claim</h2>
            <p className="text-gray-500 text-sm">Long-term medication under doctor supervision.</p>
          </div>
        </Link>
      </div>
    </div>
  )
}
