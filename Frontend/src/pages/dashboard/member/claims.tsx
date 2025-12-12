// Frontend/src/pages/dashboard/member/claims.tsx
import React, { useEffect, useState } from "react";
import api from "~/config/api";
import Button from "~/components/controls/button";
import Badge from "~/components/controls/badge";
import { useNavigate, Link } from "react-router-dom";
import PageTransition from "~/components/animations/PageTransition";
import {
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  CurrencyDollarIcon,
  EyeIcon,
  PlusIcon,
  MagnifyingGlassIcon
} from "@heroicons/react/24/outline";

type Claim = {
  id: string;
  claim_type: string;
  status: string;
  total_claimed: number;
  total_payable: number;
  member_payable: number;
  submitted_at: string | null;
};

export default function MemberClaimsList() {
  const [claims, setClaims] = useState<Claim[]>([]);
  const [filteredClaims, setFilteredClaims] = useState<Claim[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const nav = useNavigate();

  useEffect(() => {
    api
      .get("claims/")
      .then((res) => {
        const data = res.data || [];
        setClaims(data);
        setFilteredClaims(data);
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!search.trim()) {
      setFilteredClaims(claims);
    } else {
      const s = search.toLowerCase();
      setFilteredClaims(claims.filter(c => 
        String(c.id).toLowerCase().includes(s) || 
        c.claim_type.toLowerCase().includes(s) ||
        c.status.toLowerCase().includes(s)
      ));
    }
  }, [search, claims]);

  const statusColor = (status: string) => {
    const s = status.toLowerCase();
    if (s === "approved" || s === "paid") return "success";
    if (s === "rejected") return "danger";
    if (s === "reviewed") return "warning";
    return "info";
  };

  if (loading) {
    return (
      <div className="space-y-4 p-4">
        <div className="flex justify-between items-center mb-8">
           <div className="h-8 w-48 bg-gray-200 rounded-lg animate-pulse" />
           <div className="h-10 w-32 bg-gray-200 rounded-lg animate-pulse" />
        </div>
        <div className="space-y-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-20 bg-gray-100 rounded-xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <PageTransition className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-[var(--sgss-navy)] tracking-tight">
            My Claims
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Manage and track all your medical claim submissions.
          </p>
        </div>
        <div className="flex items-center gap-3">
           <div className="relative group">
              <MagnifyingGlassIcon className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[var(--sgss-gold)] transition-colors" />
              <input 
                 type="text" 
                 placeholder="Search claims..." 
                 value={search}
                 onChange={(e) => setSearch(e.target.value)}
                 className="pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 focus:border-[var(--sgss-gold)] focus:ring-2 focus:ring-[var(--sgss-gold)]/20 outline-none w-full md:w-64 transition-all text-sm"
              />
           </div>
           <Button
             onClick={() => nav("/dashboard/member/claims/new")}
             className="bg-[var(--sgss-navy)] hover:bg-[var(--sgss-gold)] text-white shadow-lg shadow-blue-900/10 flex items-center gap-2 rounded-xl py-2.5">
             <PlusIcon className="w-5 h-5" />
             <span>New Claim</span>
           </Button>
        </div>
      </div>

      {/* Desktop TABLE view */}
      <div className="hidden md:block bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-sm text-left">
          <thead className="bg-gray-50/80 border-b border-gray-100 text-xs uppercase tracking-wider text-gray-500 font-semibold">
            <tr>
              <th className="px-6 py-4">Claim ID</th>
              <th className="px-6 py-4">Type</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4 text-right">Fund Payable</th>
              <th className="px-6 py-4 text-right">Member Share</th>
              <th className="px-6 py-4 text-right">Total</th>
              <th className="px-6 py-4">Submitted</th>
              <th className="px-6 py-4 text-center">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {filteredClaims.map((c) => (
              <tr
                key={c.id}
                className="hover:bg-blue-50/30 transition-colors group"
              >
                <td className="px-6 py-4 font-mono text-xs text-gray-500 group-hover:text-[var(--sgss-navy)]">
                  #{String(c.id).slice(0, 8)}
                </td>
                <td className="px-6 py-4 capitalize font-medium text-[var(--sgss-navy)]">{c.claim_type}</td>
                <td className="px-6 py-4">
                  <Badge variant={statusColor(c.status)}>{c.status}</Badge>
                </td>
                <td className="px-6 py-4 text-right text-emerald-700 font-medium">
                  Ksh {Number(c.total_payable || 0).toLocaleString()}
                </td>
                <td className="px-6 py-4 text-right text-red-600 font-medium">
                  Ksh {Number(c.member_payable || 0).toLocaleString()}
                </td>
                <td className="px-6 py-4 text-right font-bold text-[var(--sgss-navy)]">
                  Ksh {Number(c.total_claimed || 0).toLocaleString()}
                </td>
                <td className="px-6 py-4 text-xs text-gray-500">
                  {c.submitted_at
                    ? new Date(c.submitted_at).toLocaleDateString()
                    : "Pending"}
                </td>
                <td className="px-6 py-4 text-center">
                  <Link
                    to={`/dashboard/member/claims/${c.id}`}
                    className="p-2 inline-flex rounded-lg hover:bg-[var(--sgss-bg)] text-gray-400 hover:text-[var(--sgss-navy)] transition-colors"
                  >
                    <EyeIcon className="w-5 h-5" />
                  </Link>
                </td>
              </tr>
            ))}

            {!filteredClaims.length && (
              <tr>
                <td
                  colSpan={8}
                  className="px-6 py-12 text-center text-gray-500"
                >
                  <div className="flex flex-col items-center justify-center gap-2">
                     <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mb-2">
                        <MagnifyingGlassIcon className="w-6 h-6 text-gray-300" />
                     </div>
                     <p>No claims found matching your criteria.</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile CARDS view */}
      <div className="md:hidden space-y-4">
        {filteredClaims.map((c) => (
          <div
            key={c.id}
            className="sgss-card p-5 active:scale-[0.99] transition-transform"
            onClick={() => nav(`/dashboard/member/claims/${c.id}`)}
          >
            <div className="flex justify-between items-start mb-3">
              <div>
                <span className="text-[10px] font-mono text-gray-400 uppercase tracking-widest">#{String(c.id).slice(0, 8)}</span>
                <h3 className="font-bold text-[var(--sgss-navy)] capitalize">
                  {c.claim_type} Claim
                </h3>
              </div>
              <Badge variant={statusColor(c.status)}>{c.status}</Badge>
            </div>

            <div className="flex items-center justify-between py-3 border-t border-b border-gray-50 my-3">
               <div>
                  <span className="text-xs text-gray-400 block mb-0.5">Total</span>
                  <span className="font-bold text-[var(--sgss-navy)]">Ksh {Number(c.total_claimed || 0).toLocaleString()}</span>
               </div>
               <div className="text-right">
                  <span className="text-xs text-gray-400 block mb-0.5">Fund Pays</span>
                  <span className="font-bold text-emerald-600">Ksh {Number(c.total_payable || 0).toLocaleString()}</span>
               </div>
            </div>

            <div className="flex justify-between items-center text-xs text-gray-400 mt-2">
               <div className="flex items-center gap-1.5">
                  <ClockIcon className="w-3.5 h-3.5" />
                  <span>{c.submitted_at ? new Date(c.submitted_at).toLocaleDateString() : "Draft"}</span>
               </div>
               <span className="text-[var(--sgss-gold)] font-medium">View Details &rarr;</span>
            </div>
          </div>
        ))}

        {!filteredClaims.length && (
          <div className="text-center py-10 bg-white rounded-xl border border-dashed border-gray-200">
             <p className="text-sm text-gray-500">
                No claims found.
             </p>
          </div>
        )}
      </div>
    </PageTransition>
  );
}
