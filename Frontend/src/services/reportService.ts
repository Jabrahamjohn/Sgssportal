import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import Papa from 'papaparse'
import { supabase } from '../services/supabaseClient'

export async function fetchApprovedClaims() {
  const { data, error } = await supabase
    .from('claims')
    .select('id, claim_type, total_claimed, status, approved_at, members(full_name)')
    .in('status', ['approved', 'paid'])
    .order('approved_at', { ascending: false })
  if (error) throw error
  return data
}

export async function exportClaimsToCSV() {
  const claims = await fetchApprovedClaims()
  const csv = Papa.unparse(claims)
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  link.href = URL.createObjectURL(blob)
  link.download = 'SGSS_Payment_Report.csv'
  link.click()
}

export async function exportClaimsToPDF() {
  const claims = await fetchApprovedClaims()
  const doc = new jsPDF()
  doc.text('SGSS Medical Fund - Payment Report', 14, 15)

  autoTable(doc, {
    head: [['Member', 'Claim Type', 'Total Claimed (Ksh)', 'Status', 'Approved Date']],
    body: claims.map((c: any) => [
      c.members?.full_name || 'N/A',
      c.claim_type,
      c.total_claimed.toLocaleString(),
      c.status,
      new Date(c.approved_at).toLocaleDateString(),
    ]),
  })

  doc.save('SGSS_Payment_Report.pdf')
}
