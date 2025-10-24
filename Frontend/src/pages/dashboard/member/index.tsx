import React, { useEffect, useState } from 'react';
import { getMyMember } from '../../../server/services/member.service';
import type { Member } from '../../../types/member';
import { Link } from 'react-router-dom';

export default function MemberDashboard() {
  const [me, setMe] = useState<Member | null>(null);

  useEffect(() => {
    getMyMember().then(setMe).catch(() => setMe(null));
  }, []);

  const annual = (me as any)?.membership_type?.annual_limit ?? null;

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-semibold">Member Dashboard</h1>
      {me ? (
        <div className="grid gap-4 md:grid-cols-2">
          <div className="border rounded p-4">
            <div className="font-medium mb-2">Membership</div>
            <div>Email: {(me.user as any)?.email}</div>
            <div>Type: {(me as any)?.membership_type?.name || '-'}</div>
            <div>NHIF: {me.nhif_number || '-'}</div>
            <div>Valid: {me.valid_from || '-'} → {me.valid_to || '-'}</div>
            <div>Annual Limit: {annual ? `Ksh ${Number(annual).toLocaleString()}` : '-'}</div>
          </div>
          <div className="border rounded p-4 space-y-2">
            <div className="font-medium mb-2">Quick actions</div>
            <Link to="/dashboard/member/claims/new" className="underline">Submit a new claim</Link><br/>
            <Link to="/dashboard/member/claims" className="underline">View my claims</Link><br/>
            <Link to="/dashboard/member/chronic" className="underline">Chronic requests</Link>
          </div>
        </div>
      ) : (
        <div className="text-gray-600">Loading membership…</div>
      )}
    </div>
  );
}
