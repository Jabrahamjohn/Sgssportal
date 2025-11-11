// frontend/src/pages/dashboard/member/claims-new.tsx
import React, { useState } from 'react';
import { createClaim, addItem, uploadAttachment } from '../../../server/services/claim.service';
import type { ClaimItem } from '../../../types/claim';
import { useNavigate } from 'react-router-dom';

export default function NewClaim() {
  const nav = useNavigate();
  const [claimType, setClaimType] = useState('outpatient');
  const [firstVisit, setFirstVisit] = useState('');
  const [notes, setNotes] = useState('');
  const [items, setItems] = useState<Array<Omit<ClaimItem, 'id'>>>(
    [{ category: 'consultation', description: '', amount: 0, quantity: 1 }]
  );
  const [files, setFiles] = useState<File[]>([]);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');

  const setItem = (i: number, patch: Partial<Omit<ClaimItem, 'id'>>) =>
    setItems((prev) => prev.map((it, idx) => (idx === i ? { ...it, ...patch } : it)));

  async function submit() {
    setBusy(true);
    setErr('');
    try {
      const claim = await createClaim({
        claim_type: claimType,
        date_of_first_visit: firstVisit || undefined,
        notes,
        status: 'submitted',
      } as any);

      for (const it of items) {
        if (!it.amount || !it.quantity) continue;
        await addItem(claim.id, it);
      }

      for (const f of files) {
        await uploadAttachment(claim.id, f);
      }

      nav('/dashboard/member/claims');
    } catch (e: any) {
      setErr(e?.response?.data?.detail || 'Could not submit claim');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="p-6 space-y-6">
      <h2 className="text-xl font-semibold">New Claim</h2>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="border rounded p-4 space-y-3">
          <div>
            <label className="block text-sm mb-1">Claim type</label>
            <select className="border rounded px-2 py-2 w-full"
              value={claimType} onChange={(e) => setClaimType(e.target.value)}>
              <option value="outpatient">Outpatient</option>
              <option value="inpatient">Inpatient</option>
              <option value="chronic">Chronic</option>
            </select>
          </div>
          <div>
            <label className="block text-sm mb-1">Date of first visit</label>
            <input className="border rounded px-2 py-2 w-full" type="date"
              value={firstVisit} onChange={(e) => setFirstVisit(e.target.value)} />
          </div>
          <div>
            <label className="block text-sm mb-1">Notes</label>
            <textarea className="border rounded px-2 py-2 w-full" rows={3}
              value={notes} onChange={(e) => setNotes(e.target.value)} />
          </div>
        </div>

        <div className="border rounded p-4 space-y-3">
          <div className="font-medium">Items</div>
          {items.map((it, i) => (
            <div key={i} className="grid grid-cols-5 gap-2">
              <input placeholder="Category" className="border rounded px-2 py-2 col-span-1"
                value={it.category || ''} onChange={(e) => setItem(i, { category: e.target.value })} />
              <input placeholder="Description" className="border rounded px-2 py-2 col-span-2"
                value={it.description || ''} onChange={(e) => setItem(i, { description: e.target.value })} />
              <input type="number" placeholder="Amount" className="border rounded px-2 py-2 col-span-1"
                value={it.amount} onChange={(e) => setItem(i, { amount: Number(e.target.value) })} />
              <input type="number" placeholder="Qty" className="border rounded px-2 py-2 col-span-1"
                value={it.quantity} onChange={(e) => setItem(i, { quantity: Number(e.target.value) })} />
            </div>
          ))}
          <button
            className="text-sm underline"
            onClick={() => setItems((p) => [...p, { category: '', description: '', amount: 0, quantity: 1 }])}
          >
            + Add item
          </button>
        </div>
      </div>

      <div className="border rounded p-4">
        <div className="font-medium mb-2">Attachments</div>
        <input type="file" multiple onChange={(e) => setFiles(Array.from(e.target.files || []))} />
      </div>

      {err && <div className="text-red-600">{err}</div>}

      <div className="flex gap-3">
        <button className="px-4 py-2 rounded bg-gray-200" onClick={() => history.back()}>Cancel</button>
        <button
          disabled={busy}
          className="px-4 py-2 rounded bg-black text-white disabled:opacity-50"
          onClick={submit}
        >
          {busy ? 'Submitting…' : 'Submit claim'}
        </button>
      </div>
    </div>
  );
}
