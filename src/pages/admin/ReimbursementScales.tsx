import React, { useEffect, useState } from 'react'
import { getReimbursementScales, updateReimbursementScales } from '../../services/adminService'
import { Button } from '../../components/ui/Button'
import { SettingsCard } from '../../components/admin/SettingsCard'

interface ScaleItem {
  category: string
  fund_share: number
  member_share: number
  ceiling: number
}

export default function ReimbursementScales() {
  const [scales, setScales] = useState<ScaleItem[]>([])
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      const data = await getReimbursementScales()
      if (data) setScales(data)
    }
    fetchData()
  }, [])

  const handleChange = (index: number, field: keyof ScaleItem, value: any) => {
    const updated = [...scales]
    updated[index][field] = value
    setScales(updated)
  }

  const handleSave = async () => {
    setSaving(true)
    const success = await updateReimbursementScales(scales)
    setSaving(false)
    if (success) alert('Reimbursement scales updated successfully!')
    else alert('Failed to save changes.')
  }

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-semibold text-gray-800">Reimbursement Scales</h1>

      <SettingsCard title="Fund Reimbursement Rules">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b text-gray-600">
              <th className="py-2">Category</th>
              <th>Fund Share (%)</th>
              <th>Member Share (%)</th>
              <th>Ceiling (Ksh)</th>
            </tr>
          </thead>
          <tbody>
            {scales.map((s, i) => (
              <tr key={i} className="border-b">
                <td className="py-2">{s.category}</td>
                <td>
                  <input
                    type="number"
                    className="w-20 border rounded px-2 py-1"
                    value={s.fund_share}
                    onChange={(e) => handleChange(i, 'fund_share', Number(e.target.value))}
                  />
                </td>
                <td>
                  <input
                    type="number"
                    className="w-20 border rounded px-2 py-1"
                    value={s.member_share}
                    onChange={(e) => handleChange(i, 'member_share', Number(e.target.value))}
                  />
                </td>
                <td>
                  <input
                    type="number"
                    className="w-28 border rounded px-2 py-1"
                    value={s.ceiling}
                    onChange={(e) => handleChange(i, 'ceiling', Number(e.target.value))}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="mt-6 flex justify-end">
          <Button onClick={handleSave} disabled={saving}>
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </SettingsCard>
    </div>
  )
}
