// Frontend/src/pages/dashboard/committee/index.tsx
import React, { useEffect, useState } from "react";
import api from "~/config/api";
import { Link } from "react-router-dom";
import Skeleton from "~/components/loader/skeleton";
import PageTransition from "~/components/animations/PageTransition";
import StatCard from "~/components/sgss/StatCard";
import Badge from "~/components/controls/badge";
import { useAuth } from "~/store/contexts/AuthContext";
import { 
  ClipboardDocumentCheckIcon, 
  CheckCircleIcon, 
  XCircleIcon, 
  BanknotesIcon,
  ClockIcon,
  UserCircleIcon,
  ArrowRightIcon
} from "@heroicons/react/24/outline";

export default function CommitteeDashboard() {
  const [claims, setClaims] = useState<any[]>([]);
  const [info, setInfo] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const { auth } = useAuth();
  const role = auth?.role?.toLowerCase();


  useEffect(() => {
    async function load() {
      try {
        const [claimsRes, infoRes] = await Promise.all([
          api.get("claims/"),
          api.get("dashboard/committee/info/"),
        ]);

        const list = claimsRes.data?.results || claimsRes.data || [];
        setClaims(list);
        setInfo(infoRes.data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const todayStr = new Date().toDateString();

  const pending = claims.filter(
    (c) => c.status === "submitted" || c.status === "reviewed"
  );
  const todays = claims.filter((c) => {
    if (!c.submitted_at) return false;
    return new Date(c.submitted_at).toDateString() === todayStr;
  });

  const approved = claims.filter((c) => c.status === "approved").length;
  const rejected = claims.filter((c) => c.status === "rejected").length;
  const paid = claims.filter((c) => c.status === "paid").length;

  const statusColor = (status: string) => {
      const s = status.toLowerCase();
      if (s === "approved" || s === "paid") return "success";
      if (s === "rejected") return "danger";
      if (s === "reviewed") return "warning";
      return "info";
  };

  return (
    <PageTransition className="space-y-6">
      {/* Header + committee profile */}
      <div className="sgss-card p-0 overflow-hidden relative">
        <div className="sgss-header flex flex-col md:flex-row justify-between md:items-center gap-4">
            <div>
                <h1 className="text-xl md:text-2xl font-bold flex items-center gap-2">
                    <ClipboardDocumentCheckIcon className="w-6 h-6 text-[var(--sgss-gold)]" />
                    Committee Dashboard
                </h1>
                <p className="text-white/80 text-sm mt-1">
                    Manage claims, track approvals, and ensure bylaw compliance.
                </p>
            </div>
             {/* Quick links for multi-role users */}
            <div className="flex flex-wrap gap-2 text-xs">
                <Link
                to="/dashboard/member"
                className="inline-flex items-center px-4 py-2 rounded-xl bg-white/10 border border-white/20 text-white hover:bg-white/20 transition-all backdrop-blur-md"
                >
                <UserCircleIcon className="w-4 h-4 mr-2" />
                Member View
                </Link>
                {role === "admin" && (
                <Link
                    to="/dashboard/admin"
                    className="inline-flex items-center px-4 py-2 rounded-xl bg-[var(--sgss-gold)] text-[var(--sgss-navy)] font-bold shadow-lg shadow-yellow-900/20 hover:scale-105 transition-transform"
                >
                    Admin Dashboard →
                </Link>
                )}
            </div>
        </div>
        
        <div className="p-6 bg-white grid lg:grid-cols-2 gap-6 relative z-10">
          <div className="space-y-4">
             <div className="flex items-center gap-3">
                 <div className="h-10 w-1 rounded-full bg-[var(--sgss-gold)]"></div>
                 <div>
                     <h3 className="text-lg font-bold text-[var(--sgss-navy)]">Welcome back, {info?.full_name?.split(" ")[0] || "Committee Member"}</h3>
                     <p className="text-sm text-gray-500">Here's your overview for today.</p>
                 </div>
             </div>
             
             <div className="grid grid-cols-2 gap-4">
                 <div className="p-3 rounded-xl bg-gray-50 border border-gray-100">
                     <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Pending Total</p>
                     <p className="text-xl font-bold text-[var(--sgss-navy)]">{loading ? "..." : info?.pending_total ?? 0}</p>
                 </div>
                 <div className="p-3 rounded-xl bg-blue-50 border border-blue-100">
                     <p className="text-xs text-blue-600 uppercase tracking-wider mb-1">New Today</p>
                     <p className="text-xl font-bold text-blue-800">{loading ? "..." : info?.today_new ?? 0}</p>
                 </div>
             </div>
          </div>

          <div className="border-l border-gray-100 pl-0 lg:pl-6">
              <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Your Profile Details</h4>
              <div className="grid grid-cols-2 gap-y-3 text-sm">
                  <div>
                      <span className="block text-gray-500 text-xs">Full Name</span>
                      <span className="font-medium text-gray-800">{info?.full_name || "—"}</span>
                  </div>
                  <div>
                      <span className="block text-gray-500 text-xs">Role</span>
                      <span className="font-medium text-gray-800">{info?.role || "Committee"}</span>
                  </div>
                   <div>
                      <span className="block text-gray-500 text-xs">Membership No</span>
                      <span className="font-medium text-gray-800">{info?.membership_no || "—"}</span>
                  </div>
                   <div>
                      <span className="block text-gray-500 text-xs">SHIF/SHA No</span>
                      <span className="font-medium text-gray-800">{info?.shif_number || "—"}</span>
                  </div>
              </div>
          </div>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
            label="Pending Review" 
            value={loading ? "..." : pending.length} 
            icon={<ClockIcon className="w-6 h-6" />}
            className="bg-white border-l-4 border-l-yellow-400"
            variant="default"
        />
        <StatCard 
            label="Approved" 
            value={loading ? "..." : approved} 
            icon={<CheckCircleIcon className="w-6 h-6" />}
            className="bg-white border-l-4 border-l-emerald-500"
            variant="default"
        />
        <StatCard 
            label="Rejected" 
            value={loading ? "..." : rejected} 
            icon={<XCircleIcon className="w-6 h-6" />}
             className="bg-white border-l-4 border-l-red-500"
            variant="default"
        />
        <StatCard 
            label="Paid" 
            value={loading ? "..." : paid} 
            icon={<BanknotesIcon className="w-6 h-6" />} 
            className="bg-white border-l-4 border-l-blue-500"
            variant="default"
        />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Pending list */}
        <div className="lg:col-span-2 sgss-card bg-white h-fit">
            <div className="p-4 border-b border-gray-100 flex justify-between items-center">
                <h3 className="font-bold text-[var(--sgss-navy)] flex items-center gap-2">
                    <ClockIcon className="w-5 h-5 text-gray-400" />
                    Pending / In Progress
                </h3>
                <span className="text-xs font-medium bg-gray-100 px-2 py-1 rounded-full text-gray-600">{pending.length} claims</span>
            </div>

            {loading ? (
                <div className="p-4 space-y-3">
                    {[1,2,3].map(i => <Skeleton key={i} className="h-12 w-full" />)}
                </div>
            ) : pending.length === 0 ? (
                <div className="p-12 text-center text-gray-500">
                    <CheckCircleIcon className="w-12 h-12 mx-auto text-gray-200 mb-2" />
                    <p>All caught up! No claims pending review.</p>
                </div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-gray-50 text-xs uppercase text-gray-500">
                            <tr>
                                <th className="px-4 py-3 font-semibold">Ref</th>
                                <th className="px-4 py-3 font-semibold">Member</th>
                                <th className="px-4 py-3 font-semibold">Type</th>
                                <th className="px-4 py-3 font-semibold">Status</th>
                                <th className="px-4 py-3 font-semibold text-right">Total</th>
                                <th className="px-4 py-3 font-semibold text-center">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {pending.slice(0, 5).map((c) => (
                                <tr key={c.id} className="hover:bg-blue-50/50 transition-colors cursor-pointer group">
                                    <td className="px-4 py-3 font-mono text-xs text-gray-500">#{String(c.id).slice(0, 8)}</td>
                                    <td className="px-4 py-3 font-medium text-[var(--sgss-navy)]">
                                        {c.member_user_email || "Member"}
                                    </td>
                                    <td className="px-4 py-3 capitalize">{c.claim_type}</td>
                                    <td className="px-4 py-3">
                                        <Badge variant={statusColor(c.status)}>{c.status}</Badge>
                                    </td>
                                    <td className="px-4 py-3 text-right font-medium">Ksh {Number(c.total_claimed || 0).toLocaleString()}</td>
                                    <td className="px-4 py-3 text-center">
                                        <Link 
                                            to={`/dashboard/committee/claims/${c.id}`}
                                            className="p-1.5 rounded-lg hover:bg-[var(--sgss-bg)] text-gray-400 hover:text-[var(--sgss-navy)] inline-flex transition-colors"
                                        >
                                            <ArrowRightIcon className="w-4 h-4" />
                                        </Link>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {pending.length > 5 && (
                        <div className="p-3 border-t border-gray-100 text-center">
                            <span className="text-xs text-gray-500">showing 5 of {pending.length} pending claims</span>
                        </div>
                    )}
                </div>
            )}
        </div>

        {/* Today's submissions */}
        <div className="sgss-card bg-white h-fit">
            <div className="p-4 border-b border-gray-100">
                <h3 className="font-bold text-[var(--sgss-navy)] text-sm uppercase tracking-wider">Today's Activity</h3>
                <p className="text-xs text-gray-400 mt-0.5">{todayStr}</p>
            </div>
            
            <div className="p-0">
                {loading ? (
                    <div className="p-4 space-y-2">
                        <Skeleton className="h-10 w-full" />
                        <Skeleton className="h-10 w-full" />
                    </div>
                ) : todays.length === 0 ? (
                    <div className="p-8 text-center text-gray-400 text-sm italic">
                        No new submissions today.
                    </div>
                ) : (
                    <ul className="divide-y divide-gray-50">
                        {todays.map((c) => (
                            <li key={c.id} className="p-4 hover:bg-gray-50 transition-colors">
                                <Link to={`/dashboard/committee/claims/${c.id}`} className="flex justify-between items-start group">
                                    <div>
                                        <p className="text-sm font-bold text-[var(--sgss-navy)] group-hover:text-blue-700 transition-colors">#{String(c.id).slice(0,6)}</p>
                                        <p className="text-xs text-gray-500 mt-0.5 capitalize">{c.claim_type} Claim</p>
                                        <p className="text-[10px] text-gray-400 mt-1">{c.member_user_email}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm font-bold text-gray-800">Ksh {Number(c.total_claimed || 0).toLocaleString()}</p>
                                        <span className="text-[10px] uppercase tracking-wider font-semibold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded mt-1 inline-block">New</span>
                                    </div>
                                </Link>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
      </div>
    </PageTransition>
  );
}
