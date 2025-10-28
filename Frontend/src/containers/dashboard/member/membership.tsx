// import React, { useEffect, useState } from 'react';
// import { getMyMember } from '../../../server/services/member.service';
import DashboardTitle from '~/components/dashboard/title';
import type { Member } from '../../../types/member';

export default function MembershipContainer() {
  // const [me, setMe] = useState<Member | null>(null);

  // useEffect(() => {
  //   getMyMember().then(setMe).catch(() => setMe(null));
  // }, []);

  // const annual = (me as any)?.membership_type?.annual_limit ?? null;
  const me: Member = {
    id: '1',
    user: {
      id: '1',
      email: 'mahmud@mail.com',
      full_name: 'Mahmud Enesi',
    },
    membership_type: 'type one',
    nhif_number: 'HOKJIEKOIJ123O',
    valid_from: '2023/12/12',
    valid_to: '2028/04/18',
  };
  const annual = 2000000;

  return (
    <div className=''>
      <DashboardTitle title='My Membership' />{' '}
      {me ? (
        <div className='grid gap-4 md:grid-cols-2'>
          <div className='border rounded p-4'>
            <div className='font-medium mb-2'>Membership</div>
            <div>Email: {(me.user as any)?.email}</div>
            <div>Type: {(me as any)?.membership_type?.name || '-'}</div>
            <div>NHIF: {me.nhif_number || '-'}</div>
            <div>
              Valid: {me.valid_from || '-'} → {me.valid_to || '-'}
            </div>
            <div>
              Annual Limit:{' '}
              {annual ? `Ksh ${Number(annual).toLocaleString()}` : '-'}
            </div>
          </div>
          {/* <div className='border rounded p-4 space-y-2'>
            <div className='font-medium mb-2'>Quick actions</div>
            <Link to='/dashboard/member/claims/new' className='underline'>
              Submit a new claim
            </Link>
            <br />
            <Link to='/dashboard/member/claims' className='underline'>
              View my claims
            </Link>
            <br />
            <Link to='/dashboard/member/chronic' className='underline'>
              Chronic requests
            </Link>
          </div> */}
        </div>
      ) : (
        <div className='text-gray-600'>Loading membership…</div>
      )}
    </div>
  );
}
