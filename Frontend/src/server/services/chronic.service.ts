import { api } from '../../config/api';
import type { ChronicRequest } from '../../types/chronic';

export async function listChronic() {
  const { data } = await api.get<ChronicRequest[]>('chronic-requests/');
  return data;
}

export async function createChronic(payload: Partial<ChronicRequest>) {
  const { data } = await api.post<ChronicRequest>('chronic-requests/', payload);
  return data;
}
