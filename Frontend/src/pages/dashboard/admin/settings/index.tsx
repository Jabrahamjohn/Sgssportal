// Frontend/src/pages/dashboard/admin/settings/index.tsx
import { NavLink, Outlet, useLocation } from "react-router-dom";

export default function AdminSettings() {
  const location = useLocation();
  const base = "/dashboard/admin/settings";

  const tabs = [
    { to: `${base}/memberships`, label: "Membership Schemes" },
    { to: `${base}/reimbursement`, label: "Reimbursement Rules" },
    { to: `${base}/general`, label: "General Limits" },
    { to: `${base}/committee`, label: "Committee Access" },
    { to: `${base}/registrations`, label: "Registration Queue" },
  ];

  return (
    <div className="space-y-6">
      {/* Header Area */}
      <div className="bg-[var(--sgss-navy)] rounded-2xl p-8 text-white relative overflow-hidden shadow-xl">
           <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
               <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-64 h-64">
                   <path strokeLinecap="round" strokeLinejoin="round" d="M10.34 15.84c-.688-.06-1.386-.09-2.09-.09H7.5a4.5 4.5 0 110-9h.75c.704 0 1.402-.03 2.09-.09m0 9.18c.253.962.584 1.892.985 2.783.247.55.06 1.21-.463 1.511l-.657.38c-.551.318-1.26.117-1.527-.461a20.845 20.845 0 01-1.44-4.282m3.102.069a18.03 18.03 0 01-.59-4.59c0-1.586.205-3.124.59-4.59m0 9.18a23.848 23.848 0 018.835 2.535M10.34 6.66a23.847 23.847 0 008.835-2.535m0 0A23.74 23.74 0 0018.795 3m.38 1.125a23.91 23.91 0 011.014 5.395m-1.014 8.855c-.118.38-.245.754-.38 1.125m.38-1.125a23.91 23.91 0 001.014-5.395m0-3.46c.495.43.872.95 1.112 1.494.44.995.338 2.17-.338 3.508-.494.976-.992 1.956-1.494 2.924m0 0a20.73 20.73 0 01-.138.252" />
               </svg>
           </div>
           
           <div className="relative z-10">
               <h1 className="text-3xl font-bold mb-2">System Configuration</h1>
               <p className="text-blue-200 max-w-xl text-sm leading-relaxed">
                   Manage core fund parameters including membership types, reimbursement formulas, logic limits, and administrative access control. 
                   Ensure all changes comply with the current SGSS Medical Fund Constitution.
               </p>
           </div>
      </div>

      {/* Tabs Layout */}
      <div>
        <div className="border-b border-gray-200">
            <nav className="-mb-px flex gap-6 overflow-x-auto" aria-label="Tabs">
            {tabs.map((tab) => {
                return (
                <NavLink
                    key={tab.to}
                    to={tab.to}
                    className={({ isActive }) =>
                    `whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-all ${
                        isActive 
                        ? 'border-[var(--sgss-navy)] text-[var(--sgss-navy)]'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`
                    }
                >
                    {tab.label}
                </NavLink>
                );
            })}
            </nav>
        </div>

        <div className="mt-6 min-h-[400px]">
             <Outlet />
        </div>
      </div>
    </div>
  );
}
