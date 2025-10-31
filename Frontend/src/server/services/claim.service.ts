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

export const listCommitteeClaims = async (params?: {
  status?: string;
  type?: string;
  q?: string;
}) => {
  const res = await api.get("claims/committee/", { params });
  return res.data.results as CommitteeClaimRow[];
};

export const getCommitteeClaimDetail = async (id: string) => {
  const res = await api.get(`claims/committee/${id}/`);
  return res.data as {
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
    items: Array<{
      id: string;
      category: string | null;
      description: string | null;
      amount: string;
      quantity: number;
      line_total: string;
    }>;
    attachments: Array<{
      id: string;
      file: string | null;
      content_type: string | null;
      uploaded_at: string;
      uploaded_by: string | null;
    }>;
  };
};

export const setClaimStatus = async (
  id: string,
  status: "reviewed" | "approved" | "rejected" | "paid"
) => {
  const res = await api.post(`claims/${id}/set_status/`, { status });
  return res.data;
};
