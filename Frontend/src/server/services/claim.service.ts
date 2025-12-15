import api from "~/config/api";

export type CommitteeClaimRow = {
  id: string;
  status: string;
  created_at: string;
  member: {
    full_name: string;
    membership_number: string;
  };
  amount: number;
  [key: string]: any;
};

export const listCommitteeClaims = async (
  params?: any
): Promise<CommitteeClaimRow[]> => {
  const { data } = await api.get("claims/committee/", { params });
  return Array.isArray(data) ? data : data.results || [];
};
