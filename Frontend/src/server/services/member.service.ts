import { api } from '../../config/api';
import type { Member } from '../../types/member';

export async function getMyMember(): Promise<Member> {
  const { data } = await api.get('members/me/');
  return data;
}
