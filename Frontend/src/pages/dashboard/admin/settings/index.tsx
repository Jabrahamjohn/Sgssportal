// Frontend/src/pages/dashboard/admin/settings/index.tsx
import React from "react";
import { NavLink, Outlet, useLocation } from "react-router-dom";

export default function AdminSettings() {
  const location = useLocation();
  const base = "/dashboard/admin/settings";

  const tabs = [
    { to: `${base}/memberships`, label: "Membership Types" },
    { to: `${base}/reimbursement`, label: "Reimbursement Scales" },
    { to: `${base}/general`, label: "General Fund Settings" },
    { to: `${base}/committee`, label: "Committee Management" },
    { to: `${base}/registrations`, label: "Member Registrations" },
  ];

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold text-[var(--sgss-navy)]">
          System Settings
        </h1>
        <p className="text-sm text-gray-600">
          Configure membership rules, reimbursement scales, fund limits, committee
          structure and new member approvals according to the SGSS Medical Fund
          Constitution & Byelaws.
        </p>
      </header>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex gap-4 overflow-x-auto text-sm">
          {tabs.map((tab) => {
            const isActive =
              location.pathname === tab.to ||
              location.pathname === `${tab.to}/`;

            return (
              <NavLink
                key={tab.to}
                to={tab.to}
                className={({ isActive: rrActive }) =>
                  [
                    "px-3 py-2 border-b-2 whitespace-nowrap",
                    "transition-colors duration-150",
                    isActive || rrActive
                      ? "border-[var(--sgss-gold)] text-[var(--sgss-navy)] font-semibold"
                      : "border-transparent text-gray-500 hover:text-[var(--sgss-navy)] hover:border-gray-300",
                  ].join(" ")
                }
              >
                {tab.label}
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* Content */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 md:p-6">
        <Outlet />
      </div>
    </div>
  );
}
