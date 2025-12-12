// Frontend/src/pages/dashboard/member/chronic.tsx
import React, { useEffect, useState } from 'react';
import api from "~/config/api";
import { Link } from 'react-router-dom';
import PageTransition from '~/components/animations/PageTransition';
import Button from '~/components/controls/button';
import Badge from '~/components/controls/badge';
import Skeleton from '~/components/loader/skeleton';
import { 
    ClockIcon, 
    PlusIcon, 
    ArrowRightIcon,
    BeakerIcon
} from '@heroicons/react/24/outline';

interface ChronicRequest {
    id: number;
    doctor_name: string;
    medicines: { name: string; strength: string }[];
    total_amount: number;
    member_payable: number;
    status: string;
    created_at: string;
}

export default function ChronicPage() {
  const [rows, setRows] = useState<ChronicRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
        try {
            // Using the correct endpoint, fallback to empty array if fails
            const res = await api.get('chronic/requests/').catch(() => ({ data: [] }));
            setRows(Array.isArray(res.data) ? res.data : (res.data?.results || []));
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    }
    load();
  }, []);

  const statusColor = (status: string) => {
    const s = String(status).toLowerCase();
    if (s === 'approved') return 'success';
    if (s === 'rejected') return 'danger';
    return 'warning'; // pending
  }

  return (
    <PageTransition className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
            <h1 className="text-2xl font-bold text-[var(--sgss-navy)] flex items-center gap-2">
                <BeakerIcon className="w-6 h-6 text-[var(--sgss-gold)]" />
                Chronic Medication Requests
            </h1>
            <p className="text-sm text-gray-500 mt-1">Manage your recurring medication approvals and checking statuses.</p>
        </div>
        <Link to="/dashboard/member/claims/new">
             <Button className="bg-[var(--sgss-navy)] hover:bg-blue-900 text-white shadow-lg shadow-blue-900/20">
                <PlusIcon className="w-4 h-4 mr-2" />
                New Request
            </Button>
        </Link>
       
      </div>

      <div className="sgss-card bg-white p-0 overflow-hidden">
        {loading ? (
             <div className="p-6 space-y-4">
                 <Skeleton className="h-12 w-full" />
                 <Skeleton className="h-12 w-full" />
                 <Skeleton className="h-12 w-full" />
             </div>
        ) : (
             <div className="overflow-x-auto min-h-[300px]">
                <table className="w-full text-sm text-left">
                <thead className="bg-gray-50/50 text-xs uppercase text-gray-500 font-semibold border-b border-gray-100">
                    <tr>
                    <th className="px-6 py-4">Request Date</th>
                    <th className="px-6 py-4">Doctor</th>
                    <th className="px-6 py-4">Medicines</th>
                    <th className="px-6 py-4 text-right">Total Cost</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4 text-center">Action</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                    {rows.length === 0 ? (
                        <tr>
                            <td colSpan={6} className="p-12 text-center text-gray-400">
                                <ClockIcon className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                                <p>No chronic medication requests found.</p>
                            </td>
                        </tr>
                    ) : rows.map((r) => (
                    <tr key={r.id} className="hover:bg-blue-50/30 transition-colors group">
                        <td className="px-6 py-4 text-gray-500">
                             {r.created_at ? new Date(r.created_at).toLocaleDateString() : "N/A"}
                        </td>
                        <td className="px-6 py-4 font-medium text-[var(--sgss-navy)]">
                            {r.doctor_name || "Unknown"}
                        </td>
                        <td className="px-6 py-4">
                             <div className="flex flex-wrap gap-1">
                                {(r.medicines || []).slice(0, 2).map((m, i) => (
                                    <span key={i} className="inline-block px-2 py-0.5 rounded bg-gray-100 text-xs text-gray-600 border border-gray-200">
                                        {m.name || "Med"}
                                    </span>
                                ))}
                                {(r.medicines || []).length > 2 && (
                                    <span className="text-xs text-gray-400 pt-0.5">+{r.medicines.length - 2} more</span>
                                )}
                             </div>
                        </td>
                        <td className="px-6 py-4 text-right font-mono text-[var(--sgss-navy)]">
                            Ksh {Number(r.total_amount).toLocaleString()}
                        </td>
                        <td className="px-6 py-4">
                             <Badge variant={statusColor(r.status)}>{r.status}</Badge>
                        </td>
                        <td className="px-6 py-4 text-center">
                             <Link to={`/dashboard/member/claims/${r.id}`} className="p-2 rounded-lg text-gray-400 hover:text-[var(--sgss-navy)] hover:bg-gray-100 transition-colors inline-flex">
                                 <ArrowRightIcon className="w-4 h-4" />
                             </Link>
                        </td>
                    </tr>
                    ))}
                </tbody>
                </table>
             </div>
        )}
      </div>
    </PageTransition>
  );
}
