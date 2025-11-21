// Frontend/src/pages/dashboard/committee/ClaimDetailModal.tsx
import React, { useEffect, useState } from "react";
import Modal from "~/components/controls/modal";
import Badge from "~/components/controls/badge";
import Button from "~/components/controls/button";
import {
  getClaimDetail,
  getClaimAudit,
  setClaimStatus,
} from "~/server/services/claim.service";

type Props = {
  claimId: string;
  onClose: () => void;
};

export default function ClaimDetailModal({ claimId, onClose }: Props) {
  const [claim, setClaim] = useState<any>(null);
  const [audit, setAudit] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setErr("");
      try {
        const [c, a] = await Promise.all([
          getCommitteeClaimDetail(claimId),
          getClaimAudit(claimId),
        ]);
        if (!cancelled) {
          setClaim(c);
          setAudit(a);
        }
      } catch (e: any) {
        console.error(e);
        if (!cancelled) setErr("Failed to load claim detail.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [claimId]);

  const statusColor = (s: string) => {
    switch (s) {
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

  const changeStatus = async (
    status: "reviewed" | "approved" | "rejected" | "paid"
  ) => {
    setBusy(true);
    setErr("");
    try {
      const updated = await setClaimStatus(claimId, status);
      setClaim(updated);
    } catch (e: any) {
      console.error(e);
      setErr("Failed to update claim status.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <Modal open onClose={onClose} title="Claim Detail (Committee View)">
      {loading && <div className="p-4">Loading…</div>}
      {!loading && !claim && (
        <div className="p-4 text-red-600">Claim not found.</div>
      )}

      {!loading && claim && (
        <div className="space-y-4">
          {/* Header --------------------------------------------------- */}
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm text-gray-500">
                Claim ID:{" "}
                <span className="font-mono">
                  {String(claim.id).slice(0, 8)}…
                </span>
              </p>
              <p className="text-sm text-gray-500">
                Member:{" "}
                <strong>{claim.member_name || claim.member_user_email}</strong>
              </p>
              {claim.membership_type && (
                <p className="text-xs text-gray-500">
                  Membership: {claim.membership_type}
                </p>
              )}
            </div>
            <Badge variant={statusColor(claim.status)}>{claim.status}</Badge>
          </div>

          {/* Financial summary ---------------------------------------- */}
          <div className="grid md:grid-cols-3 gap-3">
            <SummaryBox
              label="Total Claimed"
              value={claim.total_claimed}
              emphasis="normal"
            />
            <SummaryBox
              label="Fund Payable"
              value={claim.total_payable}
              emphasis="fund"
            />
            <SummaryBox
              label="Member Share"
              value={claim.member_payable}
              emphasis="member"
            />
          </div>

          {/* Dates + basic info --------------------------------------- */}
          <div className="grid md:grid-cols-2 gap-3 text-sm">
            <InfoRow label="Claim Type" value={claim.claim_type} />
            <InfoRow
              label="Submitted At"
              value={
                claim.submitted_at
                  ? new Date(claim.submitted_at).toLocaleString()
                  : "—"
              }
            />
            <InfoRow
              label="Created At"
              value={new Date(claim.created_at).toLocaleString()}
            />
            {claim.claim_type === "outpatient" && (
              <InfoRow
                label="Date of First Visit"
                value={claim.date_of_first_visit || "—"}
              />
            )}
            {claim.claim_type === "inpatient" && (
              <InfoRow
                label="Date of Discharge"
                value={claim.date_of_discharge || "—"}
              />
            )}
          </div>

          {/* Attachments ---------------------------------------------- */}
          <div>
            <h4 className="font-semibold mb-1">Attachments</h4>
            {!claim.attachments?.length && (
              <p className="text-xs text-gray-500">No attachments.</p>
            )}
            <div className="space-y-1">
              {claim.attachments?.map((att: any) => (
                <div
                  key={att.id}
                  className="flex justify-between items-center text-xs border rounded p-2 bg-gray-50"
                >
                  <div>
                    <p className="font-medium">
                      {att.file?.split("/").pop() || "File"}
                    </p>
                    <p className="text-gray-500">
                      Uploaded:{" "}
                      {new Date(att.uploaded_at).toLocaleString()} by{" "}
                      {att.uploaded_by_email || "member"}
                    </p>
                  </div>
                  <a
                    href={att.file}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 underline"
                  >
                    View / Download
                  </a>
                </div>
              ))}
            </div>
          </div>

          {/* Notes / diagnosis ---------------------------------------- */}
          {claim.notes && (
            <div>
              <h4 className="font-semibold mb-1">Notes / Diagnosis</h4>
              <p className="text-sm whitespace-pre-wrap bg-gray-50 p-2 rounded border">
                {claim.notes}
              </p>
            </div>
          )}

          {/* Audit trail ---------------------------------------------- */}
          <div>
            <h4 className="font-semibold mb-1">Audit Trail</h4>
            {!audit.length && (
              <p className="text-xs text-gray-500">No audit events yet.</p>
            )}
            <div className="max-h-40 overflow-y-auto border rounded">
              {audit.map((log) => (
                <div
                  key={log.id}
                  className="text-xs flex justify-between border-b px-2 py-1"
                >
                  <div>
                    <p className="font-medium">{log.action}</p>
                    {log.reviewer && (
                      <p className="text-gray-500">
                        By {log.reviewer.name || log.reviewer.username} (
                        {log.role || "member"})
                      </p>
                    )}
                  </div>
                  <span className="text-gray-400">
                    {new Date(log.created_at).toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Error message -------------------------------------------- */}
          {err && (
            <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded px-2 py-1">
              {err}
            </p>
          )}

          {/* Actions -------------------------------------------------- */}
          <div className="flex justify-between items-center pt-2">
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
            <div className="flex gap-2">
              <Button
                variant="outline"
                disabled={busy}
                onClick={() => changeStatus("reviewed")}
              >
                Mark Reviewed
              </Button>
              <Button
                variant="success"
                disabled={busy}
                onClick={() => changeStatus("approved")}
              >
                Approve
              </Button>
              <Button
                variant="danger"
                disabled={busy}
                onClick={() => changeStatus("rejected")}
              >
                Reject
              </Button>
              <Button
                variant="primary"
                disabled={busy}
                onClick={() => changeStatus("paid")}
              >
                Mark Paid
              </Button>
            </div>
          </div>
        </div>
      )}
    </Modal>
  );
}

/* ---------------------------------------------- */
/* Small presentational helpers                   */
/* ---------------------------------------------- */

function SummaryBox({
  label,
  value,
  emphasis,
}: {
  label: string;
  value: number | string;
  emphasis?: "fund" | "member" | "normal";
}) {
  const cls =
    emphasis === "fund"
      ? "text-green-700"
      : emphasis === "member"
      ? "text-red-700"
      : "text-gray-900";

  return (
    <div className="border rounded bg-gray-50 p-3">
      <p className="text-xs text-gray-500">{label}</p>
      <p className={`text-lg font-bold ${cls}`}>
        Ksh {Number(value || 0).toLocaleString()}
      </p>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between border rounded px-2 py-1 bg-gray-50">
      <span className="text-gray-600 text-xs">{label}</span>
      <span className="text-xs font-medium">{value || "—"}</span>
    </div>
  );
}
