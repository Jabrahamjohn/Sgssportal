import React, { useEffect, useState } from 'react'
import { supabase } from '../../services/supabaseClient'
import { Link } from 'react-router-dom'
import { Button } from '../../components/ui/Button'

interface Member {
  id: string
  full_name: string
  nhif_number: string
  membership_type_id: number
  valid_from: string
  valid_to: string
}

export default function MembersList() {
  const [members, setMembers] = useState<Member[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchMembers = async () => {
      const { data, error } = await supabase.from('members_view').select('*')
      if (error) console.error(error)
      else setMembers(data)
      setLoading(false)
    }
    fetchMembers()
  }, [])

  if (loading) return <div className="p-6 text-gray-600">Loading members...</div>

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-gray-800">Members</h1>
        <Link to="/members/new">
          <Button>Add New Member</Button>
        </Link>
      </div>

      <div className="bg-white rounded-2xl shadow p-4">
        <table className="w-full border-collapse">
          <thead>
            <tr className="text-left border-b text-gray-600">
              <th className="py-2">Name</th>
              <th>NHIF No</th>
              <th>Type</th>
              <th>Valid From</th>
              <th>Valid To</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {members.map((m) => (
              <tr key={m.id} className="border-b hover:bg-gray-50">
                <td className="py-2">{m.full_name}</td>
                <td>{m.nhif_number}</td>
                <td>{m.membership_type_id}</td>
                <td>{m.valid_from}</td>
                <td>{m.valid_to}</td>
                <td>
                  <Link
                    to={`/members/${m.id}`}
                    className="text-blue-600 hover:underline"
                  >
                    View
                  </Link>
                </td>
              </tr>
            ))}
            {members.length === 0 && (
              <tr>
                <td colSpan={6} className="text-center py-4 text-gray-500">
                  No members found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
