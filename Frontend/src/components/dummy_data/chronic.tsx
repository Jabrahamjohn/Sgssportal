import { Button, type TableProps } from 'antd';
import { formatPrice } from '~/utils';

export const all_chronic_data = [
  {
    id: '1',
    doctor_name: 'Dr. Patel',
    medicines: [
      {
        name: 'Metformin',
        strength: '500mg',
        dosage: '2x daily',
        duration: '30 days',
      },
    ],
    total_amount: 3000,
    member_payable: 1800,
    status: 'pending',
  },
];

export const chronic_columns: TableProps<any>['columns'] = [
  {
    title: 'Doctor',
    dataIndex: 'doctor',
    key: 'doctor',
    // render: (text) => <a>{text}</a>,
    width: 160,
  },
  //   {
  //     title: 'Medicines',
  //     dataIndex: 'medicines',
  //     key: 'medicines',
  //     width: 200,
  //   },
  {
    title: 'Total',
    dataIndex: 'total',
    key: 'total',
    width: 200,
  },
  {
    title: 'Member Payable',
    dataIndex: 'member_payable',
    key: 'member_payable',
    width: 200,
  },
  {
    title: 'Status',
    dataIndex: 'status',
    key: 'status',
    width: 180,
  },
  {
    title: 'Action',
    dataIndex: 'action',
    key: 'action',
    width: 80,
  },
];

export const chronic_data: any[] = all_chronic_data.map((t) => ({
  key: String(t.id),
  doctor: t.doctor_name,
  //   medicines:t.medicines.map((m)=>(<><span>{m.name}</span></>)),
  total: formatPrice(t.total_amount, {
    currency: 'KSH',
  }).value,
  member_payable: formatPrice(t.member_payable, { currency: 'KSH' }).value,
  status: (
    <p
      className={`py-1 px-4 text-xs rounded-full w-1/2 text-center ${
        t.status === 'pending'
          ? 'bg-amber-200 text-amber-800'
          : t.status === 'rejected'
          ? 'bg-red-200 text-red-800'
          : t.status === 'approved'
          ? 'bg-green-200 text-green-800'
          : 'bg-gray-200 text-gray-800'
      }`}
    >
      {t.status}
    </p>
  ),
  action: <Button>View</Button>,
  //   created: <p>{formatDate(t.created_at, 'DD/MM/YYYY h:mm A')}</p>,
}));
