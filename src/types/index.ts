export type Role = 'member' | 'claims_officer' | 'approver' | 'trustee' | 'admin'


export interface User {
id: string
email: string
fullName?: string
role: Role
}


export interface ClaimItem { id?: string; description: string; amount: number }