// Frontend/src/pages/dashboard/committee/index.tsx
import React, { useEffect, useState } from "react";
import api from "~/config/api";
import { Link } from "react-router-dom";
import Skeleton from "~/components/loader/skeleton";
import PageTransition from "~/components/animations/PageTransition";
import StatCard from "~/components/sgss/StatCard";
import Badge from "~/components/controls/badge";
import { useAuth } from "~/store/contexts/AuthContext";
import { motion } from "framer-motion";
import { 
  ClipboardDocumentCheckIcon, 
  CheckCircleIcon, 
  XCircleIcon, 
  BanknotesIcon,
  ClockIcon,
  UserCircleIcon,
  ArrowRightIcon
} from "@heroicons/react/24/outline";
import { LockOutlined } from "@ant-design/icons";

export default function CommitteeDashboard() {
  const [claims, setClaims] = useState<any[]>([]);
  const [meetings, setMeetings] = useState<any[]>([]);
  const [info, setInfo] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const { auth } = useAuth();
  const role = auth?.role?.toLowerCase();

  useEffect(() => {
    async function load() {
      try {
        const [claimsRes, infoRes, meetingsRes] = await Promise.all([
          api.get("claims/"),
          api.get("dashboard/committee/info/"),
          api.get("meetings/"),
        ]);

        setClaims(claimsRes.data?.results || claimsRes.data || []);
        setInfo(infoRes.data);
        setMeetings(meetingsRes.data?.results || meetingsRes.data || []);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const pending = claims.filter((c) => c.status === "submitted" || c.status === "reviewed");
  const approved = claims.filter((c) => c.status === "approved").length;
  const rejected = claims.filter((c) => c.status === "rejected").length;
  const paid = claims.filter((c) => c.status === "paid").length;

  return (
    <PageTransition className="space-y-6 pb-12">
      {/* Header */}
      <div className="sgss-card p-0 overflow-hidden relative border-none shadow-2xl shadow-blue-900/5">
        <div className="bg-gradient-to-r from-[var(--sgss-navy)] to-[#0c1b64] p-8 md:p-10 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-3xl -translate-y-12 translate-x-12 pointer-events-none"></div>
            <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <h1 className="text-3xl font-black tracking-tight flex items-center gap-3">
                        Operational Command
                        <span className="text-[10px] uppercase bg-white/10 px-2 py-1 rounded-md font-bold text-white/70 tracking-[0.2em] border border-white/10">Committee</span>
                    </h1>
                    <p className="text-blue-100/70 mt-2 text-sm max-w-xl font-medium">
                        Welcome, {info?.full_name?.split(" ")[0] || "Committee Member"}. You have {pending.length} claims awaiting your review.
                    </p>
                </div>
                <div className="flex gap-3">
                    <Link to="/dashboard/member" className="px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-bold backdrop-blur-md transition-all border border-white/5">
                        Member Portal
                    </Link>
                    {role === "admin" && (
                        <Link to="/dashboard/admin" className="px-5 py-2.5 rounded-xl bg-[var(--sgss-gold)] text-[var(--sgss-navy)] font-black shadow-xl shadow-yellow-500/20 hover:scale-105 active:scale-95 transition-all">
                            Administrative View
                        </Link>
                    )}
                </div>
            </div>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard label="In Review" value={pending.length} icon={<ClockIcon className="w-6 h-6" />} variant="default" className="border-none shadow-xl shadow-gray-200/50" />
        <StatCard label="Approved" value={approved} icon={<CheckCircleIcon className="w-6 h-6" />} variant="default" className="border-none shadow-xl shadow-gray-200/50" />
        <StatCard label="Paid Total" value={paid} icon={<BanknotesIcon className="w-6 h-6" />} variant="gold" className="border-none shadow-xl shadow-amber-500/10" />
        <StatCard label="Rejected" value={rejected} icon={<XCircleIcon className="w-6 h-6" />} variant="default" className="border-none shadow-xl shadow-gray-200/50" />
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Pending list */}
        <div className="lg:col-span-2 space-y-8">
          <div className="sgss-card bg-white p-0 overflow-hidden border-none shadow-xl shadow-gray-200/50 min-h-[400px] flex flex-col">
              <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center">
                  <h3 className="font-black text-[var(--sgss-navy)] flex items-center gap-2 text-sm uppercase tracking-wider">
                      Adjudication Queue
                  </h3>
                  <Link to="/dashboard/committee/applications" className="text-[10px] font-black text-[var(--sgss-gold)] uppercase tracking-[0.2em]">View Workflow</Link>
              </div>

              <div className="flex-1 overflow-x-auto">
                 {loading ? <div className="p-6 space-y-4"><Skeleton className="h-10 w-full" /><Skeleton className="h-10 w-full" /></div> : 
                  pending.length === 0 ? <div className="p-16 text-center text-gray-400 font-medium italic">Queue is clear. Well done!</div> : (
                    <table className="w-full text-sm text-left">
                        <thead className="bg-gray-50/50 text-[10px] uppercase font-bold text-gray-400 tracking-widest border-b border-gray-100">
                            <tr>
                                <th className="px-6 py-4">Ref</th>
                                <th className="px-6 py-4">Member</th>
                                <th className="px-6 py-4">Type</th>
                                <th className="px-6 py-4 text-right">Amount</th>
                                <th className="px-6 py-4 text-center">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {pending.slice(0, 8).map((c) => (
                                <tr key={c.id} className="hover:bg-blue-50/30 transition-colors group">
                                    <td className="px-6 py-4 font-mono text-[10px] text-gray-400">#{String(c.id).slice(0, 8).toUpperCase()}</td>
                                    <td className="px-6 py-4">
                                        <p className="font-bold text-[var(--sgss-navy)] text-xs truncate max-w-[150px]">{c.member_user_email}</p>
                                    </td>
                                    <td className="px-6 py-4">
                                       <span className="text-[10px] font-bold text-gray-500 uppercase">{c.claim_type}</span>
                                    </td>
                                    <td className="px-6 py-4 text-right font-black text-[var(--sgss-navy)]">Ksh {Number(c.total_claimed || 0).toLocaleString()}</td>
                                    <td className="px-6 py-4 text-center">
                                        <Link to={`/dashboard/committee/claims/${c.id}`} className="w-8 h-8 rounded-full bg-gray-50 hover:bg-[var(--sgss-gold)] hover:text-white transition-all inline-flex items-center justify-center text-gray-400 group-hover:bg-white group-hover:shadow-md">
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
        </div>

        {/* Meeting & Governance Mirror */}
        <div className="space-y-8">
            <div className="sgss-card bg-white p-6 md:p-8 border-none shadow-xl shadow-gray-200/50">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="font-black text-[var(--sgss-navy)] text-sm uppercase tracking-wider">Session Mirror</h3>
                    <Link to="/dashboard/committee/meetings" className="text-[10px] font-bold text-blue-600 uppercase">Archive</Link>
                </div>
                
                {loading ? <Skeleton className="h-40 w-full" /> : meetings.length === 0 ? <p className="text-xs text-gray-400 italic">No sessions recorded.</p> : (
                    <div className="space-y-4">
                        {meetings.slice(0, 3).map(m => (
                            <div key={m.id} className="p-4 rounded-2xl bg-gray-50 border border-gray-100 group hover:border-blue-200 hover:bg-white transition-all relative overflow-hidden">
                                <Link to={`/dashboard/committee/meetings/${m.id}`} className="block">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{new Date(m.date).toLocaleDateString()}</p>
                                            <p className="font-black text-[var(--sgss-navy)] mt-1 uppercase text-xs">{m.status} Session</p>
                                        </div>
                                        <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-white ${m.status === 'locked' ? 'bg-amber-500' : 'bg-blue-500'}`}>
                                            {m.status === 'locked' ? <LockOutlined className="text-sm" /> : <ClockIcon className="w-4 h-4" />}
                                        </div>
                                    </div>
                                    <div className="mt-4 flex gap-4">
                                        <div className="text-[10px] font-bold text-gray-500">
                                            AGENDA: <span className="text-[var(--sgss-navy)]">{m.claim_links?.length || 0} ITEMS</span>
                                        </div>
                                        <div className="text-[10px] font-bold text-gray-500 uppercase">
                                            TYPE: <span className="text-[var(--sgss-navy)]">{m.meeting_type}</span>
                                        </div>
                                    </div>
                                </Link>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <div className="bg-gradient-to-br from-[var(--sgss-gold)] to-[#b18b1a] rounded-3xl p-8 text-white relative overflow-hidden group">
                <div className="absolute -bottom-8 -right-8 opacity-20 group-hover:scale-110 transition-transform duration-700">
                    <ClipboardDocumentCheckIcon className="w-40 h-40" />
                </div>
                <h4 className="font-black text-lg leading-tight">Byelaw Integrity Check</h4>
                <p className="text-xs text-white/80 mt-2 leading-relaxed font-medium">
                    All decisions are logged to the Deep Audit Trail. Ensure you have no conflict of interest before adjudicating.
                </p>
                <div className="mt-6 flex gap-2">
                    <div className="w-2 h-2 rounded-full bg-white animate-pulse" />
                    <span className="text-[10px] font-black uppercase tracking-widest">System Online</span>
                </div>
            </div>
        </div>
      </div>
    </PageTransition>
  );
}
