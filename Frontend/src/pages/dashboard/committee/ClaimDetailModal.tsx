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
  setClaimStatus,
} from "~/server/services/claim.service";
import { format } from "date-fns";
import  Button  from "~/components/controls/button";
import Badge from "~/components/controls/badge";
import { motion, AnimatePresence } from "framer-motion";

interface Props {
  claimId: string | null;
  onClose: () => void;
}

export default function ClaimDetailModal({ claimId, onClose }: Props) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!claimId) return;
    setLoading(true);
    getCommitteeClaimDetail(claimId)
      .then(setData)
      .catch(() => setError("Failed to fetch claim details."))
      .finally(() => setLoading(false));
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
                  <section>
                    <h3 className="text-base font-semibold mb-2 text-gray-800 flex items-center gap-2">
                      <Paperclip className="w-4 h-4 text-blue-600" />
                      Attachments
                    </h3>
                    <ul className="list-disc list-inside text-sm text-gray-600">
                      {data.attachments.map((f: any) => (
                        <li key={f.id}>
                          <a
                            href={f.file}
                            target="_blank"
                            rel="noreferrer"
                            className="text-blue-600 hover:underline"
                          >
                            {f.file?.split("/").pop()}
                          </a>
                        </li>
                      ))}
                    </ul>
                  </section>
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
                </section>
              </div>
            )
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
