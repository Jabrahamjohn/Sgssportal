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
import { motion } from "framer-motion";

import {
  BanknotesIcon,
  DocumentTextIcon,
  CheckCircleIcon,
  CurrencyDollarIcon,
  ArrowRightIcon,
  ClockIcon,
  XMarkIcon,
  InformationCircleIcon
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
      <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
        <div className="md:col-span-8">
           <BenefitUsage balance={balance} />
        </div>
        <div className="md:col-span-4 flex flex-col gap-4">
            <StatCard 
              label="Pending Board Review" 
              value={submitted} 
              icon={<ClockIcon className="w-6 h-6" />}
              variant="default"
              className="flex-1"
            />
            <StatCard 
              label="Paid Claims" 
              value={paid} 
              icon={<CurrencyDollarIcon className="w-6 h-6" />}
              variant="gold"
              className="flex-1"
            />
        </div>
      </div>

      <FadeIn delay={0.3}>
        <div className="grid lg:grid-cols-3 gap-8 pb-12">
          
          {/* RECENT ACTIVITY TABLE */}
          <div className="lg:col-span-2 sgss-card p-0 overflow-hidden flex flex-col min-h-[400px] border-none shadow-xl shadow-gray-200/50">
            <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center bg-white">
              <h3 className="font-bold text-[var(--sgss-navy)]">Recent Digital Claims</h3>
              <Link to="/dashboard/member/claims" className="text-xs font-semibold text-[var(--sgss-gold)] hover:text-yellow-600 transition-colors uppercase tracking-wider">
                 View All History
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
                  <table className="w-full text-sm text-left">
                    <thead className="bg-gray-50/50 text-gray-400 font-bold text-[10px] uppercase tracking-widest border-b border-gray-100">
                       <tr>
                          <th className="px-6 py-4">Reference</th>
                          <th className="px-6 py-4">Type</th>
                          <th className="px-6 py-4">Status</th>
                          <th className="px-6 py-4 text-right">Amount</th>
                          <th className="px-6 py-4 w-10"></th>
                       </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {claims.slice(0, 5).map((c) => (
                        <tr key={c.id} className="hover:bg-blue-50/30 transition-colors group">
                          <td className="px-6 py-4 font-mono text-[10px] text-gray-400">#{String(c.id).slice(0, 8).toUpperCase()}</td>
                          <td className="px-6 py-4">
                             <span className="font-bold text-[var(--sgss-navy)] text-xs uppercase tracking-tight">{c.claim_type}</span>
                          </td>
                          <td className="px-6 py-4"><StatusBadge status={c.status} /></td>
                          <td className="px-6 py-4 text-right text-[var(--sgss-navy)] font-black">
                            Ksh {Number(c.total_claimed || 0).toLocaleString()}
                          </td>
                          <td className="px-6 py-4 text-right">
                             <Link to={`/dashboard/member/claims/${c.id}`} className="w-8 h-8 rounded-full bg-gray-50 hover:bg-[var(--sgss-gold)] hover:text-white transition-all inline-flex items-center justify-center text-gray-400 group-hover:bg-white group-hover:shadow-md">
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
          <div className="sgss-card h-fit sticky top-6 border-none shadow-xl shadow-gray-200/50 p-6 md:p-8">
             <div className="flex items-center gap-4 mb-8">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[var(--sgss-navy)] to-[#0c1b64] text-white flex items-center justify-center text-xl font-black shadow-xl shadow-blue-900/20">
                   {memberInfo?.full_name?.charAt(0) || "M"}
                </div>
                <div className="overflow-hidden">
                   <h3 className="font-black text-[var(--sgss-navy)] truncate leading-tight">{memberInfo?.full_name || "Guest Member"}</h3>
                   <p className="text-xs text-gray-400 truncate mt-0.5">{memberInfo?.email || "No Email Address"}</p>
                </div>
             </div>

             <div className="space-y-6">
                <ProfileItem label="Membership ID" value={memberInfo?.membership_no || "N/A"} icon={<div className="w-1 h-1 rounded-full bg-[var(--sgss-gold)]"/>} />
                <ProfileItem label="Benefit Level" value={memberInfo?.membership_type || "Standard"} icon={<div className="w-1 h-1 rounded-full bg-[var(--sgss-gold)]"/>} />
                <ProfileItem label="SHA Reference" value={memberInfo?.shif_number || "Not Linked"} icon={<div className="w-1 h-1 rounded-full bg-[var(--sgss-gold)]"/>} />
                <div className="h-px bg-gray-100 my-2"></div>
                <div className="grid grid-cols-2 gap-4">
                   <div>
                       <span className="text-[10px] uppercase font-bold text-gray-400 block mb-1">Issue Date</span>
                       <span className="text-sm font-semibold text-[var(--sgss-navy)]">{formatDate(memberInfo?.valid_from)}</span>
                   </div>
                   <div>
                       <span className="text-[10px] uppercase font-bold text-gray-400 block mb-1">Expiry Date</span>
                       <span className="text-sm font-semibold text-[var(--sgss-navy)]">{formatDate(memberInfo?.valid_to)}</span>
                   </div>
                </div>
             </div>

             <div className="mt-8">
                <Link to="/dashboard/member/profile" className="flex items-center justify-center gap-2 w-full py-4 rounded-xl bg-gray-50 text-sm font-bold text-[var(--sgss-navy)] hover:bg-[var(--sgss-navy)] hover:text-white transition-all group">
                   Manage My Account
                   <ArrowRightIcon className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
             </div>
          </div>

        </div>
      </FadeIn>
    </PageTransition>
  );
}

function BenefitUsage({ balance }: { balance: number | null }) {
  const MAX = 250000;
  const used = balance !== null ? MAX - balance : 0;
  const percent = Math.min(100, Math.max(0, (used / MAX) * 100));
  
  return (
    <div className="sgss-card p-6 md:p-8 border-none shadow-xl shadow-gray-200/50 h-full flex flex-col justify-between group overflow-hidden relative min-h-[280px]">
      <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-110 transition-transform duration-1000">
         <BanknotesIcon className="w-48 h-48 text-[var(--sgss-navy)]" />
      </div>
      
      <div className="relative z-10">
        <div className="flex justify-between items-start mb-8">
          <div>
            <span className="text-[10px] uppercase font-bold tracking-[0.2em] text-gray-400">Benefit Mirror</span>
            <h3 className="text-3xl font-black text-[var(--sgss-navy)] mt-1">
              KSh {balance?.toLocaleString() || "0"}
              <span className="text-xs font-bold text-gray-400 ml-2">Remaining</span>
            </h3>
          </div>
          <div className="p-3 bg-blue-50 rounded-2xl">
             <BanknotesIcon className="w-6 h-6 text-[var(--sgss-navy)]" />
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-gray-500">
            <span>Utilization: {percent.toFixed(1)}%</span>
            <span>Limit: KSh {MAX.toLocaleString()}</span>
          </div>
          <div className="h-4 bg-gray-100 rounded-full overflow-hidden p-1 border border-gray-50">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${percent}%` }}
              transition={{ duration: 1.5, ease: "easeOut" }}
              className={`h-full rounded-full bg-gradient-to-r ${percent > 80 ? 'from-orange-400 to-red-500' : 'from-[var(--sgss-navy)] to-[var(--sgss-gold)] shadow-lg shadow-blue-900/20'}`}
            />
          </div>
        </div>
      </div>

      <div className="relative z-10 flex gap-4 mt-8 pt-6 border-t border-gray-100">
         <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-[var(--sgss-gold)]" />
            <span className="text-[10px] font-bold text-gray-400 uppercase">2024 Policy</span>
         </div>
         <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500" />
            <span className="text-[10px] font-bold text-gray-400 uppercase">Approved Status</span>
         </div>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const s = (status || "").toLowerCase();
  
  const config: any = {
    submitted: { cls: "bg-amber-50 text-amber-700 border-amber-100", icon: ClockIcon, label: "Board Review" },
    approved: { cls: "bg-emerald-50 text-emerald-700 border-emerald-100", icon: CheckCircleIcon, label: "Adjudicated" },
    paid: { cls: "bg-blue-50 text-blue-700 border-blue-100", icon: CurrencyDollarIcon, label: "Funds Disbursed" },
    rejected: { cls: "bg-red-50 text-red-700 border-red-100", icon: XMarkIcon, label: "Claim Declined" }
  };

  const { cls, icon: Icon, label } = config[s] || { cls: "bg-gray-50 text-gray-600 border-gray-200", icon: InformationCircleIcon, label: status };

  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider border ${cls}`}>
      <Icon className="w-3.5 h-3.5" />
      {label}
    </span>
  );
}

function ProfileItem({ label, value, icon }: { label: string, value: string, icon?: React.ReactNode }) {
   return (
      <div className="flex justify-between items-center text-sm border-b border-gray-50 pb-2 last:border-0">
         <div className="flex items-center gap-2">
            {icon}
            <span className="text-gray-400 font-bold text-[10px] uppercase tracking-widest">{label}</span>
         </div>
         <span className="font-bold text-[var(--sgss-navy)] text-xs">{value}</span>
      </div>
   )
}
