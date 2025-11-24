// Frontend/src/pages/dashboard/committee/claim.tsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "~/config/api";
import Skeleton from "~/components/loader/skeleton";
import Button from "~/components/controls/button";

type CommitteeClaimResponse = {
  id: string;
  member: {
    name: string;
    username: string;
    email: string;
    membership_type: string | null;
    nhif_number: string | null;
  };
  claim: {
    type: string;
    status: string;
    notes: string | null;
    date_of_first_visit: string | null;
    date_of_discharge: string | null;
    total_claimed: string;
    total_payable: string;
    member_payable: string;
    override_amount: string | null;
    submitted_at: string | null;
    created_at: string;
  };
  items: {
    id: string;
    category: string | null;
    description: string | null;
    amount: string;
    quantity: number;
    line_total: string;
  }[];
  attachments: {
    id: string;
    file: string | null;
    content_type: string | null;
    uploaded_at: string;
    uploaded_by: string | null;
  }[];
};

type AuditEntry = {
  id?: string;
  action?: string;
  note?: string | null;
  role?: string | null;
  created_at?: string;
  actor?: any;
  [key: string]: any;
};

export default function CommitteeClaimDetail() {
  const { id } = useParams();
  const nav = useNavigate();
  const [data, setData] = useState<CommitteeClaimResponse | null>(null);
  const [audit, setAudit] = useState<AuditEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [acting, setActing] = useState(false);

  const load = async () => {
    if (!id) return;
    try {
      const [claimRes, auditRes] = await Promise.all([
        api.get(`claims/committee/${id}/`),
        api.get(`claims/${id}/audit/`),
      ]);

      setData(claimRes.data);
      const auditList = auditRes.data?.results || auditRes.data || [];
      setAudit(auditList);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const shortId = (id || "").slice(0, 8);

  const formatDateTime = (d?: string | null) =>
    d ? new Date(d).toLocaleString() : "N/A";

  const formatMoney = (v?: string | number | null) => {
    const n = Number(v || 0);
    return `Ksh ${n.toLocaleString()}`;
  };

  const handleStatusChange = async (status: string, askNote = false) => {
    if (!id || !data) return;
    let note: string | undefined;

    if (askNote) {
      const input = window.prompt("Enter note / reason (optional):", "");
      if (input && input.trim().length > 0) {
        note = input.trim();
      }
    }

    setActing(true);
    try {
      await api.post(`claims/${id}/set_status/`, {
        status,
        ...(note ? { note } : {}),
      });
      await load(); // refresh claim + audit
    } catch (e) {
      console.error(e);
      alert("Failed to update status. Check console / backend logs.");
    } finally {
      setActing(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-6 w-40" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-40 w-full" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="p-6">
        <p className="text-sm text-red-600">Claim not found.</p>
        <button
          className="mt-3 text-sm text-[var(--sgss-navy)] underline"
          onClick={() => nav(-1)}
        >
          ← Back
        </button>
      </div>
    );
  }

  const { member, claim, items, attachments } = data;
  const currentStatus = (claim.status || "").toLowerCase();

  return (
    <div className="space-y-6">
      {/* Header + actions */}
      <div className="sgss-card">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold text-[var(--sgss-navy)]">
              Claim #{shortId}
            </h2>
            <p className="text-xs text-gray-500">
              Submitted: {formatDateTime(claim.submitted_at)} • Created:{" "}
              {formatDateTime(claim.created_at)}
            </p>
            <p className="mt-1 text-xs">
              <span className="font-medium">Member:</span> {member.name} •{" "}
              <span className="font-medium">Type:</span>{" "}
              {claim.type || "N/A"}
            </p>
          </div>

          <div className="flex flex-wrap gap-3 justify-end">
            <StatusBadge status={claim.status} />

            <Button
              variant="outline"
              disabled={acting}
              onClick={() => handleStatusChange("reviewed", true)}
            >
              Mark Reviewed
            </Button>
            <Button
              className="bg-emerald-600 hover:bg-emerald-700 text-white"
              disabled={acting || currentStatus === "approved"}
              onClick={() => handleStatusChange("approved", true)}
            >
              Approve
            </Button>
            <Button
              className="bg-red-600 hover:bg-red-700 text-white"
              disabled={acting || currentStatus === "rejected"}
              onClick={() => handleStatusChange("rejected", true)}
            >
              Reject
            </Button>
            <Button
              className="bg-[var(--sgss-navy)] hover:bg-[#04146a] text-white"
              disabled={acting || currentStatus === "paid"}
              onClick={() => handleStatusChange("paid", true)}
            >
              Mark Paid
            </Button>
          </div>
        </div>
      </div>

      {/* Member + claim summary */}
      <div className="grid md:grid-cols-2 gap-4">
        <div className="sgss-card text-sm space-y-1">
          <p className="small-label mb-1">Member</p>
          <p className="font-semibold text-[var(--sgss-navy)]">
            {member.name}
          </p>
          <p className="text-xs text-gray-500">{member.email}</p>
          <p>
            <span className="font-medium">Membership Type:</span>{" "}
            {member.membership_type || "Not set"}
          </p>
          <p>
            <span className="font-medium">NHIF No:</span>{" "}
            {member.nhif_number || "Not provided"}
          </p>
        </div>

        <div className="sgss-card text-sm space-y-1">
          <p className="small-label mb-1">Claim Summary</p>
          <p>
            <span className="font-medium">Status:</span>{" "}
            <StatusBadge status={claim.status} />
          </p>
          <p>
            <span className="font-medium">Total Claimed:</span>{" "}
            {formatMoney(claim.total_claimed)}
          </p>
          <p>
            <span className="font-medium">Fund Payable:</span>{" "}
            {formatMoney(claim.total_payable)}
          </p>
          <p>
            <span className="font-medium">Member Share:</span>{" "}
            {formatMoney(claim.member_payable)}
          </p>
          {claim.override_amount && (
            <p className="text-xs text-amber-700 mt-1">
              Override amount set: {formatMoney(claim.override_amount)}
            </p>
          )}
          {claim.notes && (
            <p className="text-xs text-gray-700 mt-2">
              <span className="font-medium">Notes:</span> {claim.notes}
            </p>
          )}
        </div>
      </div>

      {/* Items */}
      <div className="sgss-card">
        <p className="font-semibold text-[var(--sgss-navy)] mb-2">
          Items Breakdown
        </p>
        {items.length === 0 ? (
          <p className="text-sm text-gray-600">No line items recorded.</p>
        ) : (
          <div className="overflow-x-auto text-sm">
            <table className="min-w-full">
              <thead>
                <tr className="text-left text-xs uppercase text-gray-500 border-b">
                  <th className="py-2 pr-4">Category</th>
                  <th className="py-2 pr-4">Description</th>
                  <th className="py-2 pr-4">Amount</th>
                  <th className="py-2 pr-4">Qty</th>
                  <th className="py-2 pr-4">Line Total</th>
                </tr>
              </thead>
              <tbody>
                {items.map((i) => (
                  <tr key={i.id} className="border-b last:border-b-0">
                    <td className="py-2 pr-4">{i.category || "—"}</td>
                    <td className="py-2 pr-4">
                      {i.description || (
                        <span className="text-gray-400">—</span>
                      )}
                    </td>
                    <td className="py-2 pr-4">
                      {formatMoney(i.amount)}
                    </td>
                    <td className="py-2 pr-4">{i.quantity}</td>
                    <td className="py-2 pr-4 font-medium">
                      {formatMoney(i.line_total)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Attachments */}
      <div className="sgss-card">
        <p className="font-semibold text-[var(--sgss-navy)] mb-2">
          Attachments
        </p>
        {attachments.length === 0 ? (
          <p className="text-sm text-gray-600">No attachments uploaded.</p>
        ) : (
          <ul className="space-y-2 text-sm">
            {attachments.map((a) => (
              <li
                key={a.id}
                className="flex items-center justify-between border-b last:border-b-0 pb-2"
              >
                <div>
                  <p className="font-medium text-[var(--sgss-navy)]">
                    {a.content_type?.includes("pdf")
                      ? "Supporting Document (PDF)"
                      : a.content_type?.includes("image")
                      ? "Supporting Image"
                      : "Attachment"}
                  </p>
                  <p className="text-xs text-gray-500">
                    Type: {a.content_type || "N/A"} • Uploaded by{" "}
                    {a.uploaded_by || "—"} on {formatDateTime(a.uploaded_at)}
                  </p>
                </div>
                {a.file && (
                  <a
                    href={a.file}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs font-semibold text-[var(--sgss-navy)] hover:text-[var(--sgss-gold)]"
                  >
                    View
                  </a>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* 🔍 Audit Trail */}
      <div className="sgss-card">
        <p className="font-semibold text-[var(--sgss-navy)] mb-2">
          Audit Trail
        </p>

        {audit.length === 0 ? (
          <p className="text-sm text-gray-600">
            No audit entries recorded for this claim yet.
          </p>
        ) : (
          <ul className="space-y-2 text-sm">
            {audit.map((entry, idx) => {
              const when = entry.created_at
                ? new Date(entry.created_at).toLocaleString()
                : "Unknown time";
              const who =
                entry.actor_name ||
                entry.actor?.full_name ||
                entry.actor?.username ||
                "System";
              const role = entry.role || entry.actor?.role || "";

              return (
                <li
                  key={entry.id || idx}
                  className="flex items-start gap-3 border-b last:border-b-0 pb-2"
                >
                  <div className="mt-1 w-2 h-2 rounded-full bg-[var(--sgss-gold)]" />
                  <div className="flex-1">
                    <p className="font-medium text-[var(--sgss-navy)]">
                      {entry.action || "event"}{" "}
                      {role && (
                        <span className="text-xs text-gray-500">
                          ({role})
                        </span>
                      )}
                    </p>
                    {entry.note && (
                      <p className="text-xs text-gray-700">{entry.note}</p>
                    )}
                    <p className="text-[11px] text-gray-500 mt-0.5">
                      {who} • {when}
                    </p>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const s = (status || "").toLowerCase();
  let cls = "bg-gray-100 text-gray-700";

  if (s === "submitted") cls = "bg-yellow-100 text-yellow-800";
  else if (s === "approved") cls = "bg-emerald-100 text-emerald-800";
  else if (s === "paid") cls = "bg-blue-100 text-blue-800";
  else if (s === "rejected") cls = "bg-red-100 text-red-800";
  else if (s === "reviewed") cls = "bg-purple-100 text-purple-800";

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${cls}`}
    >
      {status}
    </span>
  );
}
