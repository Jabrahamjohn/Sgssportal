import { api } from '../../config/api';
import type { Claim, ClaimItem, ClaimReviewPayload } from '../../types/claim';

export async function listClaims(params?: { status?: string }) {
  const { data } = await api.get<Claim[]>('claims/', { params });
  return data;
}

export async function getClaim(id: string) {
  const { data } = await api.get<Claim>(`claims/${id}/`);
  return data;
}

export async function createClaim(payload: Partial<Claim>) {
  const { data } = await api.post<Claim>('claims/', payload);
  return data;
}

export async function addItem(claimId: string, item: Omit<ClaimItem, 'id'>) {
  const { data } = await api.post<ClaimItem>('claim-items/', { claim: claimId, ...item });
  return data;
}

export async function reviewClaim(payload: ClaimReviewPayload) {
  const { data } = await api.post('claim-reviews/', payload);
  return data;
}

export async function uploadAttachment(claimId: string, file: File) {
  const fd = new FormData();
  fd.append('claim', claimId);
  fd.append('file', file);
  const { data } = await api.post('claim-attachments/', fd, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data;
}
