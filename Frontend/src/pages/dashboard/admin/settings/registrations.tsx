// Frontend/src/pages/dashboard/admin/settings/registrations.tsx
import React, { useEffect, useState } from "react";
import api from "~/config/api";
import Button from "~/components/controls/button";
import Alert from "~/components/controls/alert";
import PageTransition from "~/components/animations/PageTransition";
import Badge from "~/components/controls/badge";
import { 
    UserPlusIcon, 
    CheckCircleIcon, 
    XCircleIcon,
    EnvelopeIcon,
    PhoneIcon,
    IdentificationIcon
} from "@heroicons/react/24/outline";

type MemberType = {
  id: string;
  user: {
    id?: string | number;
    username?: string;
    email?: string;
    first_name?: string;
    last_name?: string;
    full_name?: string;
  };
  membership_type?: { id: string; name: string; key: string } | null;
  status: string;
  nhif_number?: string | null;
  mailing_address?: string | null;
  phone_mobile?: string | null;
};

export default function RegistrationQueue() {
  const [members, setMembers] = useState<MemberType[]>([]);
  const [loading, setLoading] = useState(true);

  const [actingId, setActingId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const reset = () => {
    setError("");
    setSuccess("");
  };

  const load = async () => {
    reset();
    setLoading(true);

    try {
      const res = await api.get("members/");
      const rows: MemberType[] = Array.isArray(res.data) ? res.data : (res.data?.results || []);
      setMembers(rows.filter((m) => m.status === "pending"));
    } catch (err) {
      console.error("Error loading registrations:", err);
      setError("Unable to load registrations.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const getFullName = (u: MemberType["user"]) => {
    return (
      u?.full_name ||
      `${u?.first_name || ""} ${u?.last_name || ""}`.trim() ||
      u?.username ||
      "Unknown User"
    );
  };

  const approve = async (id: string) => {
    reset();
    setActingId(id);

    try {
      await api.post(`members/${id}/approve/`);
      setSuccess("Account approved successfully.");
      await load();
    } catch (err: any) {
      console.error("Approve error:", err);
      setError(err.response?.data?.detail || "Approval failed.");
    } finally {
      setActingId(null);
    }
  };

  const reject = async (id: string) => {
    reset();
    setActingId(id);

    try {
      await api.patch(`members/${id}/`, { status: "inactive" });
      setSuccess("Account rejected (marked inactive).");
      await load();
    } catch (err: any) {
      console.error("Reject error:", err);
      setError(err.response?.data?.detail || "Rejection failed.");
    } finally {
      setActingId(null);
    }
  };

  return (
    <PageTransition className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
           <h2 className="text-xl font-bold text-[var(--sgss-navy)] flex items-center gap-2">
               <UserPlusIcon className="w-6 h-6 text-[var(--sgss-gold)]" />
               Pending Approvals
           </h2>
           <p className="text-sm text-gray-500 mt-1">Review and approve new member registration requests.</p>
        </div>
      </div>

      {error && <Alert type="error" message={error} />}
      {success && <Alert type="success" message={success} />}

      <div className="sgss-card p-0 overflow-hidden bg-white">
        {loading ? (
             <div className="p-8 text-center text-gray-400">Loading requests...</div>
        ) : members.length === 0 ? (
             <div className="p-16 text-center text-gray-400">
                 <CheckCircleIcon className="w-16 h-16 mx-auto mb-3 text-emerald-100" />
                 <h3 className="text-lg font-medium text-gray-700">All caught up!</h3>
                 <p className="text-sm">No new registration requests pending approval.</p>
             </div>
        ) : (
             <div className="overflow-x-auto">
                 <table className="w-full text-sm text-left">
                     <thead className="bg-gray-50/50 text-xs uppercase text-gray-500 font-semibold border-b border-gray-100">
                         <tr>
                             <th className="px-6 py-4">Applicant</th>
                             <th className="px-6 py-4">Contact Info</th>
                             <th className="px-6 py-4">Docs & Details</th>
                             <th className="px-6 py-4 text-right">Actions</th>
                         </tr>
                     </thead>
                     <tbody className="divide-y divide-gray-50">
                         {members.map((m) => {
                             const isActing = actingId === m.id;
                             return (
                                 <tr key={m.id} className="hover:bg-blue-50/20 transition-colors">
                                     <td className="px-6 py-4 px-6">
                                         <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-[var(--sgss-navy)] text-white flex items-center justify-center font-bold text-xs">
                                                {getFullName(m.user).slice(0,2).toUpperCase()}
                                            </div>
                                            <div>
                                                <p className="font-bold text-[var(--sgss-navy)]">{getFullName(m.user)}</p>
                                                <Badge variant="warning">Pending</Badge>
                                            </div>
                                         </div>
                                     </td>
                                     <td className="px-6 py-4">
                                         <div className="space-y-1">
                                             <div className="flex items-center gap-2 text-gray-600 text-xs">
                                                 <EnvelopeIcon className="w-3.5 h-3.5" />
                                                 {m.user?.email || "No Email"}
                                             </div>
                                             <div className="flex items-center gap-2 text-gray-600 text-xs">
                                                 <PhoneIcon className="w-3.5 h-3.5" />
                                                 {m.phone_mobile || "No Phone"}
                                             </div>
                                         </div>
                                     </td>
                                     <td className="px-6 py-4">
                                         <div className="space-y-1 text-xs">
                                             <div className="flex items-center gap-2 text-gray-700 font-medium">
                                                 <IdentificationIcon className="w-3.5 h-3.5 text-gray-400" />
                                                 NHIF: {m.nhif_number || "N/A"}
                                             </div>
                                             <div className="px-2 py-0.5 rounded bg-gray-100 w-fit text-gray-600">
                                                 {m.membership_type?.name || "Standard Membership"}
                                             </div>
                                         </div>
                                     </td>
                                     <td className="px-6 py-4 text-right">
                                         <div className="flex gap-2 justify-end">
                                             <Button 
                                                 size="sm" 
                                                 onClick={() => approve(m.id)}
                                                 disabled={isActing}
                                                 className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-200"
                                             >
                                                 {isActing ? "..." : <><CheckCircleIcon className="w-4 h-4 mr-1.5" /> Approve</>}
                                             </Button>
                                             <Button 
                                                 size="sm" 
                                                 variant="outline"
                                                 onClick={() => reject(m.id)}
                                                 disabled={isActing}
                                                 className="border-red-200 text-red-600 hover:bg-red-50"
                                             >
                                                 {isActing ? "..." : <><XCircleIcon className="w-4 h-4 mr-1.5" /> Reject</>}
                                             </Button>
                                         </div>
                                     </td>
                                 </tr>
                             )
                         })}
                     </tbody>
                 </table>
             </div>
        )}
      </div>
    </PageTransition>
  );
}
