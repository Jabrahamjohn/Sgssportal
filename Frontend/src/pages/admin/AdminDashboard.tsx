import React from 'react'
import { Link } from 'react-router-dom'
import { Button } from '../../components/ui/Button'

export default function AdminDashboard() {
  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-semibold text-gray-800">Admin Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Link to="/admin/reimbursement-scales">
          <div className="p-6 bg-white rounded-2xl shadow hover:shadow-lg transition cursor-pointer">
            <h2 className="text-lg font-medium text-gray-800 mb-2">Reimbursement Scales</h2>
            <p className="text-gray-500 text-sm">Edit reimbursement limits and fund-share percentages.</p>
          </div>
        </Link>

        <Link to="/admin/membership-types">
          <div className="p-6 bg-white rounded-2xl shadow hover:shadow-lg transition cursor-pointer">
            <h2 className="text-lg font-medium text-gray-800 mb-2">Membership Types</h2>
            <p className="text-gray-500 text-sm">Manage membership categories and annual fees.</p>
          </div>
        </Link>
      </div>

      <div className="mt-8">
        <Link to="/reports">
          <Button>View Reports</Button>
        </Link>
      </div>
    </div>
  )
}
