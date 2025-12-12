// Frontend/src/pages/dashboard/admin/settings/membership-types.tsx
import React, { useEffect, useState } from "react";
import api from "~/config/api";
import Button from "~/components/controls/button";
import Input from "~/components/controls/input";
import PageTransition from "~/components/animations/PageTransition";
import Badge from "~/components/controls/badge";
import { 
    CreditCardIcon, 
    PencilSquareIcon, 
    PlusIcon, 
    BanknotesIcon,
    UsersIcon,
    XMarkIcon
} from "@heroicons/react/24/outline";

interface MembershipType {
  id: string;
  name: string;
  annual_limit: string;
  fund_share_percent: string;
  entry_fee?: string;
  term_years?: number | null;
  notes?: string;
}

const emptyType: MembershipType = {
  id: "",
  name: "",
  annual_limit: "",
  fund_share_percent: "80",
  entry_fee: "",
  term_years: 1,
  notes: "",
};

export default function AdminMembershipTypes() {
  const [items, setItems] = useState<MembershipType[]>([]);
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState<MembershipType | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const fetchItems = async () => {
    setLoading(true);
    try {
      const res = await api.get("memberships/");
      setItems(Array.isArray(res.data) ? res.data : (res.data?.results || []));
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const openNew = () => {
    setEditing({ ...emptyType });
    setModalOpen(true);
  };

  const openEdit = (m: MembershipType) => {
    setEditing({ ...m });
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditing(null);
  };

  const save = async () => {
    if (!editing) return;

    const payload: any = {
      name: editing.name,
      annual_limit: editing.annual_limit,
      fund_share_percent: editing.fund_share_percent,
      entry_fee: editing.entry_fee,
      term_years: editing.term_years,
      notes: editing.notes,
    };

    try {
      if (editing.id) {
        const res = await api.patch(`memberships/${editing.id}/`, payload);
        const updated: MembershipType = res.data;
        setItems((prev) =>
          prev.map((m) => (m.id === updated.id ? updated : m))
        );
      } else {
        const res = await api.post("memberships/", payload);
        const created: MembershipType = res.data;
        setItems((prev) => [...prev, created]);
      }
      closeModal();
    } catch (e) {
      console.error(e);
      alert("Failed to save. Please check your inputs.");
    }
  };

  return (
    <PageTransition className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
           <h2 className="text-xl font-bold text-[var(--sgss-navy)] flex items-center gap-2">
               <CreditCardIcon className="w-6 h-6 text-[var(--sgss-gold)]" />
               Membership Schemes/Types
           </h2>
           <p className="text-sm text-gray-500 mt-1">Configure limits and share percentages for different member categories.</p>
        </div>
        <Button onClick={openNew} className="bg-[var(--sgss-navy)] hover:bg-blue-900 text-white shadow-lg shadow-blue-900/20">
            <PlusIcon className="w-4 h-4 mr-2" />
            New Scheme
        </Button>
      </div>

      <div className="sgss-card p-0 overflow-hidden bg-white">
        {loading ? (
          <div className="p-8 text-center text-gray-400">Loading...</div>
        ) : items.length === 0 ? (
          <div className="p-12 text-center text-gray-400">
             <CreditCardIcon className="w-12 h-12 mx-auto mb-2 opacity-50" />
             <p>No membership types defined.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
             <table className="w-full text-sm text-left">
                <thead className="bg-gray-50 text-xs uppercase text-gray-500 font-semibold border-b border-gray-100">
                    <tr>
                        <th className="px-6 py-4">Scheme Name</th>
                        <th className="px-6 py-4">Annual Limit</th>
                        <th className="px-6 py-4">Fund Share</th>
                        <th className="px-6 py-4">Entry Fee</th>
                        <th className="px-6 py-4">Term</th>
                        <th className="px-6 py-4 text-center">Action</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                    {items.map((m) => (
                        <tr key={m.id} className="hover:bg-blue-50/30 transition-colors group">
                           <td className="px-6 py-4">
                               <span className="font-bold text-[var(--sgss-navy)]">{m.name}</span>
                               {m.notes && <p className="text-xs text-gray-400 mt-0.5">{m.notes}</p>}
                           </td>
                           <td className="px-6 py-4 font-mono">
                               Ksh {Number(m.annual_limit).toLocaleString()}
                           </td>
                           <td className="px-6 py-4">
                               <Badge variant={Number(m.fund_share_percent) >= 80 ? 'success' : 'warning'}>
                                   {m.fund_share_percent}%
                               </Badge>
                           </td>
                           <td className="px-6 py-4 font-mono text-gray-600">
                               {m.entry_fee ? `Ksh ${Number(m.entry_fee).toLocaleString()}` : "Free"}
                           </td>
                           <td className="px-6 py-4 text-gray-600">
                               {m.term_years ? `${m.term_years} Year(s)` : "Indefinite"}
                           </td>
                           <td className="px-6 py-4 text-center">
                               <button 
                                   onClick={() => openEdit(m)}
                                   className="p-2 rounded-lg text-gray-400 hover:text-[var(--sgss-navy)] hover:bg-gray-100 transition-colors"
                               >
                                   <PencilSquareIcon className="w-5 h-5" />
                               </button>
                           </td>
                        </tr>
                    ))}
                </tbody>
             </table>
          </div>
        )}
      </div>

      {/* Modal */}
      {modalOpen && editing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={closeModal} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">
             
             {/* Modal Header */}
             <div className="bg-[var(--sgss-navy)] px-6 py-4 flex justify-between items-center text-white">
                 <h3 className="font-bold text-lg flex items-center gap-2">
                     {editing.id ? <PencilSquareIcon className="w-5 h-5" /> : <PlusIcon className="w-5 h-5" />}
                     {editing.id ? "Edit Scheme" : "New Scheme"}
                 </h3>
                 <button onClick={closeModal} className="text-white/70 hover:text-white transition-colors">
                     <XMarkIcon className="w-6 h-6" />
                 </button>
             </div>

             <div className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
                 <div className="space-y-4">
                     <div>
                         <label className="block text-xs font-bold text-gray-700 mb-1">Scheme Name</label>
                         <Input 
                             value={editing.name} 
                             onChange={(e) => setEditing({...editing, name: e.target.value})} 
                             placeholder="e.g. Standard Member"
                         />
                     </div>
                     <div className="grid grid-cols-2 gap-4">
                         <div>
                            <label className="block text-xs font-bold text-gray-700 mb-1">Annual Limit (Ksh)</label>
                            <Input 
                                type="number"
                                icon={<BanknotesIcon className="w-4 h-4" />}
                                value={editing.annual_limit} 
                                onChange={(e) => setEditing({...editing, annual_limit: e.target.value})} 
                            />
                         </div>
                         <div>
                            <label className="block text-xs font-bold text-gray-700 mb-1">Fund Share (%)</label>
                            <Input 
                                type="number"
                                value={editing.fund_share_percent} 
                                onChange={(e) => setEditing({...editing, fund_share_percent: e.target.value})} 
                            />
                         </div>
                     </div>
                     <div className="grid grid-cols-2 gap-4">
                         <div>
                            <label className="block text-xs font-bold text-gray-700 mb-1">Entry Fee (Ksh)</label>
                            <Input 
                                type="number"
                                value={editing.entry_fee || ""} 
                                onChange={(e) => setEditing({...editing, entry_fee: e.target.value})} 
                                placeholder="0"
                            />
                         </div>
                         <div>
                            <label className="block text-xs font-bold text-gray-700 mb-1">Term (Years)</label>
                            <Input 
                                type="number"
                                value={editing.term_years ?? ""} 
                                onChange={(e) => setEditing({...editing, term_years: e.target.value ? Number(e.target.value) : null})} 
                                placeholder="Indefinite"
                            />
                         </div>
                     </div>
                     <div>
                         <label className="block text-xs font-bold text-gray-700 mb-1">Notes</label>
                         <textarea 
                             className="w-full rounded-xl border-gray-200 focus:border-[var(--sgss-gold)] focus:ring-[var(--sgss-gold)]/20 text-sm"
                             rows={3}
                             value={editing.notes || ""}
                             onChange={(e) => setEditing({...editing, notes: e.target.value})}
                         />
                     </div>
                 </div>
             </div>

             <div className="p-6 pt-2 bg-gray-50 flex justify-end gap-3 rounded-b-2xl">
                 <Button variant="ghost" onClick={closeModal}>Cancel</Button>
                 <Button onClick={save} className="bg-[var(--sgss-navy)] text-white">Save Changes</Button>
             </div>
          </div>
        </div>
      )}
    </PageTransition>
  );
}
