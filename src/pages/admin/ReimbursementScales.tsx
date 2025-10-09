import React, { useEffect, useState } from 'react'
import { supabase } from '../../services/supabaseClient'
import { Button } from '../../components/ui/Button'

interface Scale {
  id: string
  category: string
  fund_share: number
  member_share: number
  ceiling: number
}

export default function ReimbursementScales() {
  const [scales, setScales] = useState<Scale[]>([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState<string | null>(null)

  // 🧠 Fetch data
  async function fetchScales() {
    const { data, error } = await supabase
      .from('reimbursement_scales')
      .select('*')
      .order('category', { ascending: true })

    if (error) {
      console.error(error)
      return
    }
    setScales(data)
    setLoading(false)
  }

  useEffect(() => {
    fetchScales()
  }, [])

  // 💾 Save updates
  async function saveScale(id: string, updated: Partial<Scale>) {
    const { error } = await supabase
      .from('reimbursement_scales')
      .update(updated)
      .eq('id', id)

    if (error) {
      alert('Error saving changes: ' + error.message)
      return
    }

    setEditing(null)
    fetchScales()
  }

  if (loading) return <p>Loading reimbursement scales...</p>

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <h1 className="text-2xl font-semibold text-gray-800">Reimbursement Scales</h1>
      <p className="text-gray-600 mb-4">
        Adjust the fund and member shares for each claim category below.
      </p>

      <table className="w-full border-collapse text-sm bg-white shadow rounded-lg overflow-hidden">
        <thead>
          <tr className="bg-gray-100 text-gray-700">
            <th className="p-3 text-left">Category</th>
            <th className="p-3 text-left">Fund Share (%)</th>
            <th className="p-3 text-left">Member Share (%)</th>
            <th className="p-3 text-left">Ceiling (KES)</th>
            <th className="p-3 text-center">Actions</th>
          </tr>
        </thead>
        <tbody>
          {scales.map((scale) => (
            <tr key={scale.id} className="border-b last:border-none">
              <td className="p-3">{scale.category}</td>

              {editing === scale.id ? (
                <>
                  <td className="p-3">
                    <input
                      type="number"
                      defaultValue={scale.fund_share}
                      className="border rounded px-2 py-1 w-20"
                      onChange={(e) =>
                        (scale.fund_share = Number(e.target.value))
                      }
                    />
                  </td>
                  <td className="p-3">
                    <input
                      type="number"
                      defaultValue={scale.member_share}
                      className="border rounded px-2 py-1 w-20"
                      onChange={(e) =>
                        (scale.member_share = Number(e.target.value))
                      }
                    />
                  </td>
                  <td className="p-3">
                    <input
                      type="number"
                      defaultValue={scale.ceiling}
                      className="border rounded px-2 py-1 w-28"
                      onChange={(e) =>
                        (scale.ceiling = Number(e.target.value))
                      }
                    />
                  </td>
                  <td className="p-3 text-center">
                    <Button
                      className="mr-2"
                      onClick={() => saveScale(scale.id, scale)}
                    >
                      Save
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setEditing(null)}
                    >
                      Cancel
                    </Button>
                  </td>
                </>
              ) : (
                <>
                  <td className="p-3">{scale.fund_share}%</td>
                  <td className="p-3">{scale.member_share}%</td>
                  <td className="p-3">KES {scale.ceiling.toLocaleString()}</td>
                  <td className="p-3 text-center">
                    <Button onClick={() => setEditing(scale.id)}>Edit</Button>
                  </td>
                </>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
