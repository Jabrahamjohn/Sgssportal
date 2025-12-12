// Frontend/src/pages/dashboard/member/index.tsx
import React, { useEffect, useState } from "react";
import api from "~/config/api";
import Button from "~/components/controls/button";
import { useNavigate, Link } from "react-router-dom";
import Skeleton from "~/components/loader/skeleton";
import { useAuth } from "~/store/contexts/AuthContext";
import StatCard from "~/components/sgss/StatCard";
import PageTransition from "~/components/animations/PageTransition";
import FadeIn from "~/components/animations/FadeIn";

import {
  BanknotesIcon,
  DocumentTextIcon,
  CheckCircleIcon,
  CurrencyDollarIcon,
  ArrowRightIcon,
  ClockIcon
} from "@heroicons/react/24/outline";

export default function MemberDashboard() {
  const [balance, setBalance] = useState<number | null>(null);
  const [claims, setClaims] = useState<any[]>([]);
  const [memberInfo, setMemberInfo] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const nav = useNavigate();
  const { auth } = useAuth();
  const role = auth?.role?.toLowerCase();

  useEffect(() => {
    async function load() {
      try {
        const [balRes, claimRes, infoRes] = await Promise.all([
          api.get("members/me/benefit_balance/").catch(() => ({ data: { remaining_balance: null } })),
          api.get("claims/"),
          api.get("dashboard/member/info/").catch(() => ({ data: null })),
        ]);

        setBalance(balRes.data?.remaining_balance);
        setClaims(claimRes.data?.results || claimRes.data || []);
        setMemberInfo(infoRes.data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const total = claims.length;
  const submitted = claims.filter((c) => c.status === "submitted").length;
  const approved = claims.filter((c) => c.status === "approved").length;
  const paid = claims.filter((c) => c.status === "paid").length;

  const formatDate = (d?: string | null) =>
    d ? new Date(d).toLocaleDateString() : "N/A";

  return (
    <PageTransition className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* WELCOME SECTION */}
      <div className="relative rounded-2xl overflow-hidden bg-gradient-to-r from-[var(--sgss-navy)] to-[#082e68] text-white shadow-xl p-8">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -translate-y-12 translate-x-12 pointer-events-none"></div>
        
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              Member Overview
            </h1>
            <p className="text-blue-100 mt-1 max-w-xl text-sm leading-relaxed">
              Track your medical claims, check benefits, and manage your dependants efficiently.
            </p>
          </div>
          <Button
            onClick={() => nav("/dashboard/member/claims/new")}
            className="bg-[var(--sgss-gold)] hover:bg-yellow-500 text-[var(--sgss-navy)] font-bold shadow-lg shadow-yellow-500/20 px-6 py-2.5 rounded-xl border-none transition-all hover:scale-105 active:scale-95"
          >
            + Create New Claim
          </Button>
        </div>

        {/* ALERTS */}
        <div className="mt-8 flex flex-wrap gap-3">
             {role === "committee" && (
                <Link to="/dashboard/committee" className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 hover:bg-white/20 text-xs font-semibold backdrop-blur-md transition-colors border border-white/10">
                   <div className="w-2 h-2 rounded-full bg-[var(--sgss-gold)] animate-pulse"></div>
                   Committee Access Active
                   <ArrowRightIcon className="w-3 h-3" />
                </Link>
             )}
              {role === "admin" && (
                <Link to="/dashboard/admin" className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 hover:bg-white/20 text-xs font-semibold backdrop-blur-md transition-colors border border-white/10">
                   <div className="w-2 h-2 rounded-full bg-red-400 animate-pulse"></div>
                   Admin Access Active
                   <ArrowRightIcon className="w-3 h-3" />
                </Link>
             )}
        </div>
      </div>

      {/* STATS GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard 
          label="Remaining Limit" 
          value={balance !== null && balance !== undefined ? `Ksh ${Number(balance).toLocaleString()}` : '...'} 
          icon={<BanknotesIcon className="w-6 h-6" />}
          variant="primary"
        />
        <StatCard 
          label="Total Claims" 
          value={total} 
          icon={<DocumentTextIcon className="w-6 h-6" />}
        />
        <StatCard 
          label="Pending Processing" 
          value={submitted} 
          icon={<ClockIcon className="w-6 h-6" />}
        />
        <StatCard 
          label="Paid Claims" 
          value={paid} 
          icon={<CurrencyDollarIcon className="w-6 h-6" />}
          variant="gold"
        />
      </div>

      <FadeIn delay={0.3}>
        <div className="grid lg:grid-cols-3 gap-8">
          
          {/* RECENT ACTIVITY TABLE */}
          <div className="lg:col-span-2 sgss-card p-0 overflow-hidden flex flex-col min-h-[400px]">
            <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <h3 className="font-bold text-[var(--sgss-navy)]">Recent Claims</h3>
              <Link to="/dashboard/member/claims" className="text-xs font-semibold text-[var(--sgss-gold)] hover:text-yellow-600 transition-colors uppercase tracking-wider">
                 View All
              </Link>
            </div>

            <div className="flex-1 overflow-x-auto">
               {loading ? (
                  <div className="p-6 space-y-4">
                    <Skeleton className="h-10 w-full rounded-lg" />
                    <Skeleton className="h-10 w-full rounded-lg" />
                    <Skeleton className="h-10 w-full rounded-lg" />
                  </div>
               ) : claims.length === 0 ? (
                  <div className="p-12 text-center text-gray-500 flex flex-col items-center justify-center h-full">
                    <DocumentTextIcon className="w-12 h-12 mx-auto text-gray-300 mb-3" />
                    <p>No claims found. Start by creating one!</p>
                  </div>
               ) : (
                  <table className="w-full text-sm text-left whitespace-nowrap">
                    <thead className="bg-gray-50/50 text-gray-500 font-medium border-b border-gray-100">
                       <tr>
                          <th className="px-6 py-3">Reference</th>
                          <th className="px-6 py-3">Type</th>
                          <th className="px-6 py-3">Status</th>
                          <th className="px-6 py-3 text-right">Amount</th>
                          <th className="px-6 py-3 w-10"></th>
                       </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {claims.slice(0, 5).map((c) => (
                        <tr key={c.id} className="hover:bg-gray-50/50 transition-colors group">
                          <td className="px-6 py-3 font-mono text-xs text-gray-500">#{String(c.id).slice(0, 8)}</td>
                          <td className="px-6 py-3 font-medium text-[var(--sgss-navy)] capitalize">{c.claim_type}</td>
                          <td className="px-6 py-3"><StatusBadge status={c.status} /></td>
                          <td className="px-6 py-3 text-right text-[var(--sgss-navy)] font-semibold">
                            Ksh {Number(c.total_claimed || 0).toLocaleString()}
                          </td>
                          <td className="px-6 py-3 text-right">
                             <Link to={`/dashboard/member/claims/${c.id}`} className="p-2 rounded-lg bg-gray-100 hover:bg-[var(--sgss-gold)] hover:text-white transition-colors inline-flex items-center justify-center text-gray-500">
                               <ArrowRightIcon className="w-4 h-4" />
                             </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
               )}
            </div>
          </div>

          {/* PROFILE SUMMARY */}
          <div className="sgss-card h-fit sticky top-6">
             <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[var(--sgss-navy)] to-[var(--sgss-gold)] text-white flex items-center justify-center text-lg font-bold shadow-lg">
                   {memberInfo?.full_name?.charAt(0) || "M"}
                </div>
                <div className="overflow-hidden">
                   <h3 className="font-bold text-[var(--sgss-navy)] truncate">{memberInfo?.full_name || "Guest Member"}</h3>
                   <p className="text-xs text-gray-500 truncate">{memberInfo?.email || "No Email"}</p>
                </div>
             </div>

             <div className="space-y-4">
                <ProfileItem label="Membership No" value={memberInfo?.membership_no || "N/A"} />
                <ProfileItem label="Type" value={memberInfo?.membership_type || "Standard"} />
                <ProfileItem label="NHIF No" value={memberInfo?.nhif_number || "Not set"} />
                <div className="h-px bg-gray-100 my-2"></div>
                <ProfileItem label="Valid From" value={formatDate(memberInfo?.valid_from)} />
                <ProfileItem label="Expires" value={formatDate(memberInfo?.valid_to)} />
             </div>

             <div className="mt-6 pt-4 border-t border-gray-100">
                <Link to="/dashboard/member/profile" className="block w-full text-center py-2.5 rounded-lg border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors">
                   Full Profile Settings
                </Link>
             </div>
          </div>

        </div>
      </FadeIn>
    </PageTransition>
  );
}

function StatusBadge({ status }: { status: string }) {
  const s = (status || "").toLowerCase();
  
  const styles: any = {
    submitted: "bg-yellow-50 text-yellow-700 border-yellow-200 ring-1 ring-yellow-500/10",
    approved: "bg-emerald-50 text-emerald-700 border-emerald-200 ring-1 ring-emerald-500/10",
    paid: "bg-blue-50 text-blue-700 border-blue-200 ring-1 ring-blue-500/10",
    rejected: "bg-red-50 text-red-700 border-red-200 ring-1 ring-red-500/10"
  };

  const cls = styles[s] || "bg-gray-50 text-gray-600 border-gray-200 ring-1 ring-gray-500/10";

  return (
    <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider border ${cls}`}>
      {status || "Unknown"}
    </span>
  );
}

function ProfileItem({ label, value }: { label: string, value: string }) {
   return (
      <div className="flex justify-between items-center text-sm">
         <span className="text-gray-500">{label}</span>
         <span className="font-medium text-[var(--sgss-navy)]">{value}</span>
      </div>
   )
}
