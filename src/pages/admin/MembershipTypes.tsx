import React, { useEffect, useState } from 'react'
import { getMembershipTypes, updateMembershipTypes } from '../../services/adminService'
import { Button } from '../../components/ui/Button'
import { SettingsCard } from '../../components/admin/SettingsCard'

interface MembershipType {
  id: number
  label: string
  fee: number
  term_years: number
}

export default function MembershipTypes() {
  const [types, setTypes] = useState<MembershipType[]>([])
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      const data = await getMembershipTypes()
      if (data) setTypes(data)
    }
    fetchData()
  }, [])

  const handleChange = (index: number, field: keyof MembershipType, value: any) => {
    const updated = [...types]
    updated[index][field] = value
    setTypes(updated)
  }

  const handleSave = async () => {
    setSaving(true)
    const success = await updateMembershipTypes(types)
    setSaving(false)
    if (success) alert('Membership types updated successfully!')
    else alert('Failed to save changes.')
  }

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-semibold text-gray-800">Membership Types</h1>

      <SettingsCard title="Membership Categories">
        <table className="w-full border-collapse text-left">
          <thead>
            <tr className="border-b text-gray-600">
              <th className="py-2">Label</th>
              <th>Fee (Ksh)</th>
              <th>Term (Years)</th>
            </tr>
          </thead>
          <tbody>
            {types.map((t, i) => (
              <tr key={t.id} className="border-b">
                <td>{t.label}</td>
                <td>
                  <input
                    type="number"
                    className="w-24 border rounded px-2 py-1"
                    value={t.fee}
                    onChange={(e) => handleChange(i, 'fee', Number(e.target.value))}
                  />
                </td>
                <td>
                  <input
                    type="number"
                    className="w-16 border rounded px-2 py-1"
                    value={t.term_years}
                    onChange={(e) => handleChange(i, 'term_years', Number(e.target.value))}
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
