// Frontend/src/pages/dashboard/committee/ClaimDetailModal.tsx
import React, { useEffect, useState } from "react";
import {
  X,
  FileText,
  Paperclip,
  Check,
  XCircle,
  DollarSign,
  User,
  Hospital,
} from "lucide-react";
import {
  getCommitteeClaimDetail,
  setClaimStatus, getClaimAudit,
} from "~/server/services/claim.service";
import { format } from "date-fns";
import  Button  from "~/components/controls/button";
import Badge from "~/components/controls/badge";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "~/store/contexts/AuthContext";

interface Props {
  claimId: string | null;
  onClose: () => void;
}

export default function ClaimDetailModal({ claimId, onClose }: Props) {
  const { auth } = useAuth();
  const isCommittee = ["committee", "admin"].includes(auth.role || "member");

  const timeline = (data.reviews || []).filter((r: any) =>
  ["submitted", "reviewed", "approved", "rejected", "paid"].includes(r.action)
  );


  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
  let cancel = false;
  (async () => {
    if (!claimId) return;
    setLoading(true);
    setError("");
    try {
      const detail = await getCommitteeClaimDetail(claimId);
      let reviews = detail.reviews || [];
      // If backend doesn’t include reviews, fetch from /audit/
      if (!Array.isArray(reviews) || !reviews.length) {
        reviews = await getClaimAudit(claimId);
      }
      if (!cancel) setData({ ...detail, reviews });
    } catch (e) {
      if (!cancel) setError("Failed to fetch claim details.");
    } finally {
      if (!cancel) setLoading(false);
    }
  })();
  return () => {
    cancel = true;
  };
}, [claimId]);


  const handleAction = async (status: "approved" | "rejected" | "paid") => {
    if (!claimId) return;
    setActionLoading(true);
    try {
      await setClaimStatus(claimId, status);
      onClose();
    } catch {
      setError("Failed to update claim status.");
    } finally {
      setActionLoading(false);
    }
  };

  if (!claimId) return null;

  const statusColor = (status: string) => {
    switch (status) {
      case "approved":
        return "success";
      case "rejected":
        return "danger";
      case "paid":
        return "primary";
      case "reviewed":
        return "info";
      default:
        return "warning";
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        key={claimId}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
      >
        <motion.div
          initial={{ scale: 0.9, y: 20, opacity: 0 }}
          animate={{ scale: 1, y: 0, opacity: 1 }}
          exit={{ scale: 0.9, y: 20, opacity: 0 }}
          transition={{ type: "spring", duration: 0.4 }}
          className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl overflow-hidden"
        >
          {/* Header */}
          <div className="flex justify-between items-center px-6 py-4 border-b bg-gradient-to-r from-blue-50 to-white">
            <div className="flex items-center gap-3">
              <FileText className="w-5 h-5 text-blue-600" />
              <div>
                <h2 className="text-lg font-semibold text-gray-800">
                  Claim Details
                </h2>
                <p className="text-xs text-gray-500">
                  ID: {data.claim.id?.slice(0, 8)} — Submitted {format(new Date(data.claim.created_at), "dd MMM yyyy")}
                </p>

                {data && (
                  <Badge variant={statusColor(data.claim.status)}>
                    {data.claim.status.toUpperCase()}
                  </Badge>
                )}
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-gray-100 transition"
            >
              <X className="w-5 h-5 text-gray-600" />
            </button>
          </div>

          {/* Body */}
          {loading ? (
            <div className="p-8 text-center text-gray-500">Loading details…</div>
          ) : error ? (
            <div className="p-8 text-center text-red-500">{error}</div>
          ) : (
            data && (
              <div className="p-6 space-y-8 overflow-y-auto max-h-[75vh]">
                {/* 🔹 Member Info */}
                <section className="grid md:grid-cols-3 gap-4 bg-gray-50 rounded-xl p-4 border">
                  <div className="flex items-center gap-3">
                    <User className="w-5 h-5 text-blue-600" />
                    <div>
                      <p className="text-sm text-gray-500">Member</p>
                      <p className="font-medium text-gray-800">
                        {data.member.name}
                      </p>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Membership Type</p>
                    <p className="font-medium text-gray-800">
                      {data.member.membership_type || "—"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">NHIF Number</p>
                    <p className="font-medium text-gray-800">
                      {data.member.nhif_number || "—"}
                    </p>
                  </div>
                </section>

                {/* 🔹 Claim Info */}
                <section className="grid md:grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Claim Type</p>
                    <p className="font-medium capitalize text-gray-800">
                      {data.claim.type}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Date of Visit</p>
                    <p className="font-medium text-gray-800">
                      {data.claim.date_of_first_visit
                        ? format(
                            new Date(data.claim.date_of_first_visit),
                            "dd MMM yyyy"
                          )
                        : "—"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Created</p>
                    <p className="font-medium text-gray-800">
                      {format(new Date(data.claim.created_at), "dd MMM yyyy")}
                    </p>
                  </div>
                </section>

                {/* 🔹 Itemized Charges */}
                <section>
                  <h3 className="text-base font-semibold mb-2 text-gray-800 flex items-center gap-2">
                    <Hospital className="w-4 h-4 text-blue-600" />
                    Itemized Charges
                  </h3>
                  <div className="overflow-x-auto rounded-lg border">
                    <table className="min-w-full text-sm">
                      <thead className="bg-blue-50 text-gray-700">
                        <tr>
                          <th className="text-left p-2">Category</th>
                          <th className="text-left p-2">Description</th>
                          <th className="text-right p-2">Amount</th>
                          <th className="text-right p-2">Qty</th>
                          <th className="text-right p-2">Total</th>
                        </tr>
                      </thead>
                      <tbody>
                        {data.items.map((it: any) => (
                          <tr
                            key={it.id}
                            className="border-t hover:bg-gray-50 transition"
                          >
                            <td className="p-2">{it.category || "—"}</td>
                            <td className="p-2">{it.description || "—"}</td>
                            <td className="p-2 text-right">
                              Ksh {Number(it.amount).toLocaleString()}
                            </td>
                            <td className="p-2 text-right">{it.quantity}</td>
                            <td className="p-2 text-right font-medium">
                              Ksh {Number(it.line_total || it.amount).toLocaleString()}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </section>

                {/* 🔹 Attachments */}
                {data.attachments?.length > 0 && (
                <div className="mt-4">
                  <h4 className="font-semibold mb-2">Attachments</h4>
                  <ul className="space-y-1">
                    {data.attachments.map((a: any) => (
                      <li key={a.id} className="flex justify-between items-center border-b pb-1">
                        <span className="text-sm text-gray-700 truncate">{a.file?.split("/").pop()}</span>
                        {a.content_type === "application/pdf" ? (
                          <a
                            href={a.file}
                            target="_blank"
                            rel="noreferrer"
                            className="text-blue-600 hover:underline"
                          >
                            View PDF
                          </a>
                        ) : (
                          <a
                            href={a.file}
                            target="_blank"
                            rel="noreferrer"
                            className="text-blue-600 hover:underline"
                          >
                            Download
                          </a>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
                )}



                {/* 🔹 Totals */}
                <section className="grid md:grid-cols-3 gap-4 text-sm border-t pt-4">
                  <div>
                    <p className="text-sm text-gray-500">Total Claimed</p>
                    <p className="font-semibold text-gray-800">
                      Ksh {Number(data.claim.total_claimed).toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Fund Payable</p>
                    <p className="font-semibold text-green-700">
                      Ksh {Number(data.claim.total_payable).toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Member Payable</p>
                    <p className="font-semibold text-red-600">
                      Ksh {Number(data.claim.member_payable).toLocaleString()}
                    </p>
                  </div>
                </section>

                {/* 🔹 Action Buttons */}
                <section className="flex flex-wrap gap-3 pt-4 border-t">
                {isCommittee ? (
                    <>
                    <Button
                        disabled={actionLoading}
                        onClick={() => handleAction("approved")}
                        className="bg-green-600 text-white hover:bg-green-700 flex items-center gap-2"
                    >
                        <Check className="w-4 h-4" /> Approve
                    </Button>
                    <Button
                        disabled={actionLoading}
                        onClick={() => handleAction("rejected")}
                        className="bg-red-600 text-white hover:bg-red-700 flex items-center gap-2"
                    >
                        <XCircle className="w-4 h-4" /> Reject
                    </Button>
                    <Button
                        disabled={actionLoading}
                        onClick={() => handleAction("paid")}
                        className="bg-blue-600 text-white hover:bg-blue-700 flex items-center gap-2"
                    >
                        <DollarSign className="w-4 h-4" /> Mark Paid
                    </Button>
                    </>
                ) : (
                    <Button
                    onClick={onClose}
                    className="bg-gray-700 text-white hover:bg-gray-800 ml-auto"
                    >
                    Close
                    </Button>
                )}
                </section>

                {/* 🔹 Status Timeline (Full Audit Log) */}
<section className="mt-8 border-t pt-6">
  <h3 className="text-base font-semibold mb-4 text-gray-800">
    Claim Progress & Review History
  </h3>
  <div className="relative border-l-2 border-blue-200 pl-6 space-y-5">
    {Array.isArray(data.reviews) && data.reviews.length ? (
      data.reviews.map((rev: any, idx: number) => {
        const actionColor =
          rev.action === "approved"
            ? "bg-green-600"
            : rev.action === "rejected"
            ? "bg-red-600"
            : rev.action === "paid"
            ? "bg-blue-600"
            : "bg-gray-400";
        const icon =
          rev.action === "approved"
            ? "✅"
            : rev.action === "rejected"
            ? "❌"
            : rev.action === "paid"
            ? "💰"
            : "📝";

        return (
          <div key={idx} className="flex items-start gap-3">
            <div
              className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-white ${actionColor}`}
            >
              {icon}
            </div>
            <div>
              <p className="font-semibold text-gray-800 capitalize">
                {rev.action}{" "}
                <span className="text-sm text-gray-500">
                  {rev.role && `by ${rev.role}`}
                </span>
              </p>
              {rev.reviewer && (
                <p className="text-sm text-gray-600">
                  Reviewer: {rev.reviewer.username || rev.reviewer.name}
                </p>
              )}
              {rev.note && (
                <p className="text-sm italic text-gray-500 mt-1">
                  “{rev.note}”
                </p>
              )}
              <p className="text-xs text-gray-400 mt-1">
                {format(new Date(rev.created_at), "dd MMM yyyy, hh:mm a")}
              </p>
            </div>
          </div>
        );
      })
    ) : (
      <p className="text-sm text-gray-500 italic">
        No reviews recorded yet for this claim.
      </p>
    )}
  </div>
</section>


              </div>
            )
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
