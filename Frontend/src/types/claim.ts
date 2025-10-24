export interface ClaimItem {
  id: string;
  category?: string | null;
  description?: string | null;
  amount: number;
  quantity: number;
}

export type ClaimStatus = 'draft' | 'submitted' | 'reviewed' | 'approved' | 'rejected' | 'paid';

export interface Claim {
  id: string;
  claim_type: string; // outpatient | inpatient | chronic
  date_of_first_visit?: string | null;
  date_of_discharge?: string | null;
  total_claimed: number;
  total_payable: number;
  member_payable: number;
  status: ClaimStatus;
  notes?: string | null;
  excluded: boolean;
  created_at: string;
  items?: ClaimItem[];
}

export interface ClaimReviewPayload {
  claim: string;
  action: 'reviewed' | 'approved' | 'rejected' | 'override' | 'paid';
  note?: string;
  override_amount?: number;
}
