export interface MembershipType {
  id: number | string;
  key: string;
  name: string;
  annual_limit: number;
}

export interface Member {
  id: string;
  user: string | { id: string; email: string; full_name?: string };
  membership_type?: MembershipType | string | null;
  shif_number?: string | null;
  valid_from?: string | null;
  valid_to?: string | null;
}
