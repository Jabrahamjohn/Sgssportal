import type { TableProps } from 'antd';
import { BiCheckCircle, BiXCircle } from 'react-icons/bi';
import { LuFileCheck2 } from 'react-icons/lu';
import type { Claim } from '~/types/claim';
import { formatDate, formatPrice } from '~/utils';

export const claim_chart_data = [
  {
    amount: 70,
    date: 'Jan',
  },
  {
    amount: 100,
    date: 'Feb',
  },
  {
    amount: 160,
    date: 'Mar',
  },
  {
    amount: 150,
    date: 'Apr',
  },
  {
    amount: 180,
    date: 'May',
  },
  {
    amount: 100,
    date: 'Jun',
  },
  {
    amount: 150,
    date: 'Jul',
  },
  {
    amount: 200,
    date: 'Aug',
  },
  {
    amount: 250,
    date: 'Sept',
  },
  {
    amount: 255,
    date: 'Oct',
  },
  {
    amount: 230,
    date: 'Nov',
  },
  {
    amount: 270,
    date: 'Dec',
  },
];

export const all_claims_data: Claim[] = [
  {
    id: '1',
    claim_type: 'In Patient',
    created_at: 1761683452207,
    excluded: true,
    member_payable: 3000,
    status: 'approved',
    total_claimed: 4000,
    total_payable: 5000,
  },
  {
    id: '2',
    claim_type: 'Out Patient',
    created_at: 1761683452203,
    excluded: true,
    member_payable: 3500,
    status: 'draft',
    total_claimed: 2000,
    total_payable: 5000,
  },
  {
    id: '3',
    claim_type: 'Chronic',
    created_at: 1761683452407,
    excluded: true,
    member_payable: 2000,
    status: 'paid',
    total_claimed: 3500,
    total_payable: 4000,
  },
  {
    id: '4',
    claim_type: 'In Patient',
    created_at: 1761683452207,
    excluded: true,
    member_payable: 3000,
    status: 'rejected',
    total_claimed: 4000,
    total_payable: 5000,
  },
  {
    id: '5',
    claim_type: 'In Patient',
    created_at: 1761683452207,
    excluded: true,
    member_payable: 3000,
    status: 'submitted',
    total_claimed: 4000,
    total_payable: 5000,
  },
];

export const claims_columns: TableProps<any>['columns'] = [
  {
    title: 'ID',
    dataIndex: 'id',
    key: 'id',
    // render: (text) => <a>{text}</a>,
    width: 60,
  },
  {
    title: 'Type',
    dataIndex: 'type',
    key: 'type',
    width: 200,
  },
  {
    title: 'Total Claimed',
    dataIndex: 'total_claimed',
    key: 'total_claimed',
    width: 200,
  },
  {
    title: 'Payable',
    dataIndex: 'payable',
    key: 'payable',
    width: 200,
  },
  {
    title: 'Status',
    dataIndex: 'status',
    key: 'status',
    width: 180,
  },
  {
    title: 'Created',
    dataIndex: 'created',
    key: 'created',
    width: 165,
  },
];

export const claims_data: any[] = all_claims_data.map((t) => ({
  key: String(t.id),
  id: String(t.id),
  type: t.claim_type,
  total_claimed: formatPrice(t.total_claimed, {
    currency: 'KSH',
  }).value,
  payable: formatPrice(t.total_payable, { currency: 'KSH' }).value,
  status: (
    <p
      className={`py-1 px-4 text-xs rounded-full w-3/5 text-center ${
        t.status === 'submitted'
          ? 'bg-amber-200 text-amber-800'
          : t.status === 'rejected'
          ? 'bg-red-200 text-red-800'
          : t.status === 'draft'
          ? 'bg-orange-200 text-orange-800'
          : t.status === 'approved' ||
            t.status === 'paid' ||
            t.status === 'reviewed'
          ? 'bg-green-200 text-green-800'
          : 'bg-gray-200 text-gray-800'
      }`}
    >
      {t.status}
    </p>
  ),
  created: <p>{formatDate(t.created_at, 'DD/MM/YYYY h:mm A')}</p>,
}));
// .slice(0, 10);

export const claims_stats = [
  {
    id: 1,
    name: 'Claims Submitted',
    icon: <LuFileCheck2 size={26} className='text-green-500' />,
    number: 20,
  },
  {
    id: 2,
    name: 'Total Amount Paid',
    icon: <BiCheckCircle size={26} className='text-blue-500' />,
    number: formatPrice(50000, {
      currency: 'Ksh',
    }).value,
  },
  {
    id: 3,
    name: 'Total Amount Rejected',
    icon: <BiXCircle size={26} className='text-orange-500' />,
    number: formatPrice(10000, { currency: 'Ksh' }).value,
  },
];
