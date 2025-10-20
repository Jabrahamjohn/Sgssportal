import React, { useState } from 'react'
import { supabase } from '../../services/supabaseClient'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { useNavigate } from 'react-router-dom'

export default function NewMemberForm() {
  const navigate = useNavigate()
  const [form, setForm] = useState({
    full_name: '',
    nhif_number: '',
    membership_type_id: '',
    valid_from: '',
    valid_to: ''
  })
  const [saving, setSaving] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    const { error } = await supabase.from('members').insert([form])
    setSaving(false)
    if (error) alert(error.message)
    else navigate('/members')
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-4">Add New Member</h1>
      <form onSubmit={handleSubmit} className="bg-white shadow rounded-2xl p-6 space-y-4 max-w-lg">
        <Input label="Full Name" name="full_name" value={form.full_name} onChange={handleChange} required />
        <Input label="NHIF Number" name="nhif_number" value={form.nhif_number} onChange={handleChange} />
        <Input label="Membership Type ID" name="membership_type_id" value={form.membership_type_id} onChange={handleChange} />
        <Input label="Valid From" type="date" name="valid_from" value={form.valid_from} onChange={handleChange} />
        <Input label="Valid To" type="date" name="valid_to" value={form.valid_to} onChange={handleChange} />

        <Button type="submit" disabled={saving}>
          {saving ? 'Saving...' : 'Save Member'}
        </Button>
      </form>
    </div>
  )
}
