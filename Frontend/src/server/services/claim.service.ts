// frontend/src/server/services/claim.service.ts
import { Files } from "lucide-react";
import api from "~/config/api";

export type CommitteeClaimRow = {
  id: string;
  member_name: string;
  membership_type: string | null;
  claim_type: "inpatient" | "outpatient" | string;
  status: string;
  total_claimed: string;
  total_payable: string;
  member_payable: string;
  created_at: string;
  submitted_at?: string | null;
};

// --------------------------------------------------
// COMMITTEE LIST
// --------------------------------------------------
export const listCommitteeClaims = async (params?: {
  status?: string;
  type?: string;
  q?: string;
}) => {
  const res = await api.get("claims/committee/", { params });
  return res.data.results as CommitteeClaimRow[];
};

// --------------------------------------------------
// MEMBER: LIST MY CLAIMS
// --------------------------------------------------
export const listClaims = async () => {
  const res = await api.get("claims/");
  return res.data.results || res.data;
};

// --------------------------------------------------
// COMMITTEE: CLAIM DETAIL
// --------------------------------------------------
export const getCommitteeClaimDetail = async (id: string) => {
  const res = await api.get(`claims/committee/${id}/`);
  return res.data;
};

// --------------------------------------------------
// COMMITTEE: CHANGE STATUS
// --------------------------------------------------
export const setClaimStatus = async (
  id: string,
  status: "reviewed" | "approved" | "rejected" | "paid"
) => {
  const res = await api.post(`claims/${id}/set_status/`, { status });
  return res.data;
};

// --------------------------------------------------
// CREATE CLAIM (MEMBER)
// --------------------------------------------------
export const createClaim = async (payload: any) => {
  // ALWAYS refresh CSRF cookie before POST
  await api.get("auth/csrf/");   

  const res = await api.post("claims/", payload, {
    headers: {
      "Content-Type": "application/json",
    },
  });

  return res.data;
};

// --------------------------------------------------
// ADD ITEM TO CLAIM
// --------------------------------------------------
export const addItem = async (
  claimId: string,
  item: {
    category?: string;
    description?: string;
    amount: number;
    quantity: number;
  }
) => {
  const res = await api.post("claim-items/", { claim: claimId, ...item });
  return res.data;
};

// --------------------------------------------------
// UPLOAD ATTACHMENT
// --------------------------------------------------
export const uploadAttachment = async (claimId: string, files: File[]) => {
  for (const f of files) {
  const fd = new FormData();
  fd.append("file", f);
  fd.append("claim", claimId);  // Required field for backend

  await api.post("claim-attachments/", fd, {
    headers: { "Content-Type": "multipart/form-data" },
  });
}

};


// --------------------------------------------------
// CLAIM AUDIT LOG
// --------------------------------------------------
export const getClaimAudit = async (id: string) => {
  const res = await api.get(`claims/${id}/audit/`);

  return (
    res.data?.results ?? []
  ) as Array<{
    id: string;
    action: string;
    meta?: any;
    created_at: string;
    reviewer?: { id: number; username: string; email: string; name?: string };
    role?: string;
  }>;
};
