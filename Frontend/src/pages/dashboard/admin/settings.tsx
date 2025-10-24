import React from 'react';
import { Link } from 'react-router-dom';

export default function AdminDashboard() {
  return (
    <div className="p-6 space-y-3">
      <h2 className="text-xl font-semibold">Admin Dashboard</h2>
      <Link className="underline" to="/dashboard/admin/settings">Settings</Link>
    </div>
  );
}
