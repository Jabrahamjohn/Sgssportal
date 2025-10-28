// import { useEffect, useState } from 'react';
// import {
//   listChronic,
//   createChronic,
// } from '../../../server/services/chronic.service';
// import type { ChronicRequest } from '../../../types/chronic';

import { Button, Table } from 'antd';
import DashboardTitle from '~/components/dashboard/title';
import { chronic_columns, chronic_data } from '~/components/dummy_data/chronic';
import type { ChronicRequest } from '~/types/chronic';

export default function ChronicContainer() {
  // const [rows, setRows] = useState<ChronicRequest[]>([]);
  // const [busy, setBusy] = useState(false);

  // async function load() {
  //   const data = await listChronic();
  //   setRows(data);
  // }

  // useEffect(() => {
  //   load();
  // }, []);

  // async function createDemo() {
  //   setBusy(true);
  //   await createChronic({
  //     doctor_name: 'Dr. Patel',
  //     medicines: [
  //       {
  //         name: 'Metformin',
  //         strength: '500mg',
  //         dosage: '2x daily',
  //         duration: '30 days',
  //       },
  //     ],
  //     total_amount: 3000,
  //     member_payable: 1800,
  //     status: 'pending',
  //   } as any);
  //   await load();
  //   setBusy(false);
  // }

  return (
    <div>
      <div className='flex items-center justify-between'>
        <DashboardTitle title='Chronic Requests' />
        <Button
          type='primary'
          // disabled={busy}
          // onClick={createDemo}
          // className='px-3 py-1 rounded bg-black text-white'
        >
          Create New
        </Button>
      </div>
      <section className='bg-white rounded-lg mt-8 shadow-md'>
        <Table<ChronicRequest>
          virtual
          // columns={mergedColumns}
          scroll={{ x: 500, y: 400 }}
          columns={chronic_columns}
          dataSource={chronic_data}
          // pagination={false}
          className='rounded-lg'
        />
      </section>
    </div>
  );
}
