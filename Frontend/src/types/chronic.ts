export interface ChronicRequest {
  id: string;
  member: string;
  doctor_name: string;
  medicines: Array<{ name: string; strength: string; dosage: string; duration: string }>;
  total_amount: number;
  member_payable: number;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
}
