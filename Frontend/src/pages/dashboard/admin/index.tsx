import React from "react";

export default function AdminDashboard() {
  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-semibold text-[#03045f]">
        System Administration
      </h2>

      <p className="text-gray-700">
        As an administrator, you can manage users, configure system settings,
        adjust reimbursement rules, and oversee global medical fund behavior.
      </p>

      <div className="grid md:grid-cols-2 gap-6">
        <AdminCard title="Manage Users" link="/dashboard/admin/users" />
        <AdminCard title="System Settings" link="/dashboard/admin/settings" />
      </div>
    </div>
  );
}

function AdminCard({ title, link }: any) {
  return (
    <a
      href={link}
      className="block bg-white p-5 shadow rounded-lg border hover:border-[#03045f] hover:shadow-lg transition"
    >
      <p className="font-semibold text-[#03045f] text-lg">{title}</p>
      <p className="text-sm text-gray-500 mt-1">
        Click to open module →
      </p>
    </a>
  );
}
