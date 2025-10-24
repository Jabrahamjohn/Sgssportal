export type Role = 'member' | 'committee' | 'admin';

export interface UserSession {
  id: string;
  email: string;
  full_name?: string;
  role: Role;
}
