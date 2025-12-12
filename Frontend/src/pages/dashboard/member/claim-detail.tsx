// Frontend/src/pages/dashboard/member/claim-detail.tsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "~/config/api";
import Button from "~/components/controls/button";
import PageTransition from "~/components/animations/PageTransition";
import Badge from "~/components/controls/badge";
import Skeleton from "~/components/loader/skeleton";
import { 
    ArrowLeftIcon, 
    CalendarIcon, 
    CloudArrowDownIcon,
    DocumentTextIcon, 
    BanknotesIcon,
    PaperClipIcon,
    BuildingOffice2Icon
} from "@heroicons/react/24/outline";

export default function MemberClaimDetail() {
  const { id } = useParams();
  const nav = useNavigate();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get(`claims/${id}/`)
      .then((res) => setData(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return (
      <PageTransition className="space-y-6 p-6">
           <Skeleton className="h-8 w-32" />
           <div className="grid md:grid-cols-3 gap-6">
                <Skeleton className="h-64 col-span-2" />
                <Skeleton className="h-64" />
           </div>
      </PageTransition>
  );

  if (!data) return (
     <div className="p-12 text-center text-gray-500">
         <DocumentTextIcon className="w-16 h-16 mx-auto text-gray-300 mb-4" />
         <h2 className="text-lg font-semibold">Claim Not Found</h2>
         <Button variant="outline" onClick={() => nav(-1)} className="mt-4">Go Back</Button>
     </div>
  );

  const details = data.details || {};
  const diagnosis = details.diagnosis || data.notes || "N/A";
  const shortId = (id || "").slice(0, 8);
  const submittedAt = data.submitted_at ? new Date(data.submitted_at).toLocaleDateString() : "Pending";

  const totalClaimed = Number(data.total_claimed || 0);
  const fundShare = Number(data.total_payable || 0);
  const memberShare = Number(data.member_payable || 0);

  const statusColor = (status: string) => {
      const s = String(status).toLowerCase();
      if (s === 'approved' || s === 'paid') return 'success';
      if (s === 'rejected') return 'danger';
      if (s === 'reviewed') return 'warning';
      return 'info';
  }

  const getAttachmentLabel = (a: any) => {
    const filename = (a.file || "").split("/").pop() || "";
    if (filename.includes("claim_summary")) return "Claim Summary PDF";
    return filename;
  };

  return (
    <PageTransition className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
          <div className="flex items-center gap-4">
              <Button variant="ghost" className="!p-2 rounded-full hover:bg-white/50" onClick={() => nav(-1)}>
                  <ArrowLeftIcon className="w-5 h-5 text-gray-600" />
              </Button>
              <div>
                  <h1 className="text-2xl font-bold text-[var(--sgss-navy)] flex items-center gap-3">
                      Claim #{shortId}
                      <Badge variant={statusColor(data.status)} className="text-xs">{data.status}</Badge>
                  </h1>
                  <div className="flex items-center gap-4 text-sm text-gray-500 mt-1">
                      <span className="flex items-center gap-1">
                          <DocumentTextIcon className="w-4 h-4" />
                          <span className="capitalize">{data.claim_type} Claim</span>
                      </span>
                      <span className="flex items-center gap-1">
                          <CalendarIcon className="w-4 h-4" />
                          Submitted {submittedAt}
                      </span>
                  </div>
              </div>
          </div>
          
           {data.status === 'submitted' && (
              <div className="bg-blue-50 text-blue-800 text-xs px-4 py-2 rounded-lg border border-blue-100 flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                  Processing in progress
              </div>
           )}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        
        {/* Main Details Column */}
        <div className="lg:col-span-2 space-y-6">
            
            {/* Financial Summary */}
            <div className="sgss-card bg-white p-6 relative overflow-hidden">
                 <div className="absolute top-0 right-0 p-6 opacity-5 pointer-events-none">
                     <BanknotesIcon className="w-32 h-32 text-[var(--sgss-navy)]" />
                 </div>
                 <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">Financial Overview</h3>
                 
                 <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10">
                     <div>
                         <p className="text-xs text-gray-500 mb-1">Total Claimed Amount</p>
                         <p className="text-2xl font-bold text-[var(--sgss-navy)]">Ksh {totalClaimed.toLocaleString()}</p>
                     </div>
                     <div className="md:border-l border-gray-100 md:pl-6">
                         <p className="text-xs text-gray-500 mb-1">Fund Payable (80%)</p>
                         <p className="text-2xl font-bold text-emerald-600">Ksh {fundShare.toLocaleString()}</p>
                     </div>
                     <div className="md:border-l border-gray-100 md:pl-6">
                         <p className="text-xs text-gray-500 mb-1">Member Payable (20%)</p>
                         <p className="text-2xl font-bold text-orange-600">Ksh {memberShare.toLocaleString()}</p>
                     </div>
                 </div>
            </div>

            {/* Type Specific Details */}
            <div className="sgss-card bg-white">
                <div className="p-4 border-b border-gray-100 bg-gray-50/50">
                    <h3 className="font-bold text-[var(--sgss-navy)]">Claim Details & Diagnosis</h3>
                </div>
                <div className="p-6 space-y-4">
                    <div className="bg-yellow-50/50 p-4 rounded-xl border border-yellow-100">
                        <p className="text-xs text-yellow-700 font-bold uppercase tracking-wider mb-1">Diagnosis / Notes</p>
                        <p className="text-gray-800 font-medium">{diagnosis}</p>
                    </div>

                    {data.claim_type === "outpatient" && <OutpatientDetails details={details} />}
                    {data.claim_type === "inpatient" && <InpatientDetails details={details} />}
                    {data.claim_type === "chronic" && <ChronicDetails details={details} />}
                </div>
            </div>

        </div>

        {/* Sidebar Column */}
        <div className="space-y-6">
            
            {/* Attachments */}
            <div className="sgss-card bg-white h-fit">
                <div className="p-4 border-b border-gray-100 flex justify-between items-center">
                    <h3 className="font-bold text-[var(--sgss-navy)] flex items-center gap-2">
                        <PaperClipIcon className="w-4 h-4" />
                        Attachments
                    </h3>
                    <span className="bg-gray-100 text-gray-600 text-xs px-2 py-0.5 rounded-full font-medium">
                        {data.attachments?.length || 0}
                    </span>
                </div>
                <div className="divide-y divide-gray-50">
                    {!data.attachments?.length ? (
                        <div className="p-6 text-center text-gray-400 text-sm italic">No documents attached.</div>
                    ) : (
                        data.attachments.map((a: any) => (
                            <div key={a.id} className="p-4 flex items-start gap-3 hover:bg-gray-50 transition-colors group">
                                <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                                    <DocumentTextIcon className="w-5 h-5" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-gray-700 truncate">{getAttachmentLabel(a)}</p>
                                    <p className="text-[10px] text-gray-400 uppercase mt-0.5">{a.content_type?.split('/')[1] || 'FILE'}</p>
                                </div>
                                <a 
                                    href={a.file}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="p-2 text-gray-400 hover:text-[var(--sgss-navy)] transition-colors"
                                    title="Download"
                                >
                                    <CloudArrowDownIcon className="w-5 h-5" />
                                </a>
                            </div>
                        ))
                    )}
                </div>
            </div>

             {/* Support Info */}
             <div className="bg-[var(--sgss-navy)] text-white/90 rounded-2xl p-6 text-center space-y-3 shadow-lg shadow-blue-900/20">
                 <BuildingOffice2Icon className="w-10 h-10 mx-auto text-white/50" />
                 <h4 className="font-bold">Need Help?</h4>
                 <p className="text-xs text-white/70 leading-relaxed">
                     If you have questions about this claim or believe there is an error, please contact the secretariat immediately.
                 </p>
                 <Button variant="outline" className="w-full text-white border-white/20 hover:bg-white/10 mt-2 text-xs">
                     Contact Support
                 </Button>
             </div>

        </div>
      </div>
    </PageTransition>
  );
}

// Sub-components for detail views
function DetailRow({ label, value, isCurrency = false }: { label: string, value: any, isCurrency?: boolean }) {
    if (value === null || value === undefined) return null;
    return (
        <div className="flex justify-between items-center py-2 border-b border-gray-50 last:border-0 text-sm">
            <span className="text-gray-500">{label}</span>
            <span className="font-medium text-gray-900">
                {isCurrency ? `Ksh ${Number(value).toLocaleString()}` : value}
            </span>
        </div>
    )
}

function OutpatientDetails({ details }: { details: any }) {
  return (
    <div className="space-y-1">
       <DetailRow label="Date of First Visit" value={details.date_of_first_visit} />
       <DetailRow label="Consultations" value={details.consultations_count} />
       <DetailRow label="Consultation Fees" value={details.consultation_fee} isCurrency />
       <DetailRow label="House Visit Cost" value={details.house_visit_cost} isCurrency />
       <DetailRow label="Medicines / Injections" value={details.medicine_cost} isCurrency />
       <DetailRow label="Lab & Investigations" value={details.investigation_cost} isCurrency />
       <DetailRow label="Procedures" value={details.procedure_cost} isCurrency />
    </div>
  );
}

function InpatientDetails({ details }: { details: any }) {
  return (
    <div className="space-y-1">
      <DetailRow label="Hospital Name" value={details.hospital_name} />
      <DetailRow label="Admission Date" value={details.date_of_admission} />
      <DetailRow label="Discharge Date" value={details.date_of_discharge} />
      <DetailRow label="Length of Stay" value={`${details.stay_days || 0} days`} />
      <div className="my-4 h-px bg-gray-100" />
      <DetailRow label="Daily Bed Charge" value={details.bed_charge_per_day} isCurrency />
      <DetailRow label="NHIF Rebate" value={details.nhif_total} isCurrency />
      <DetailRow label="Inpatient Charges" value={details.inpatient_total} isCurrency />
      <DetailRow label="Doctor Fees" value={details.doctor_total} isCurrency />
      <DetailRow label="Other Claimable" value={details.claimable_total} isCurrency />
      <DetailRow label="Less Discounts" value={details.discounts_total} isCurrency />
    </div>
  );
}

function ChronicDetails({ details }: { details: any }) {
  const meds = details.medicines || [];
  return (
    <div className="space-y-4">
      <h4 className="font-bold text-sm text-[var(--sgss-navy)] border-b border-gray-100 pb-2">Medication Schedule</h4>
      {!meds.length && <p className="text-sm text-gray-400 italic">No medicines listed.</p>}
      
      {meds.map((m: any, idx: number) => (
        <div key={idx} className="bg-gray-50 rounded-lg p-3 text-sm grid grid-cols-2 gap-2">
            <div>
                <span className="text-xs text-gray-500 block">Name</span>
                <span className="font-bold text-gray-800">{m.name || "-"}</span>
            </div>
            <div>
                <span className="text-xs text-gray-500 block">Cost</span>
                <span className="font-bold text-gray-800">Ksh {(m.cost || 0).toLocaleString()}</span>
            </div>
             <div>
                <span className="text-xs text-gray-500 block">Dosage</span>
                <span className="font-medium text-gray-700">{m.dosage || "-"}</span>
            </div>
             <div>
                <span className="text-xs text-gray-500 block">Duration</span>
                <span className="font-medium text-gray-700">{m.duration || "-"}</span>
            </div>
        </div>
      ))}
    </div>
  );
}
