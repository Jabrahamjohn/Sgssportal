import { Link } from 'react-router-dom';
import { Button, Card, Flex, Table, Typography } from 'antd';
import DashboardTitle from '~/components/dashboard/title';
import { pageRoutes } from '~/config/routes';
import {
  claims_columns,
  claims_data,
  claims_stats,
} from '~/components/dummy_data/members';
import type { Claim } from '~/types/claim';
import { InputSearch } from '~/components/controls';

export default function ClaimsListContainer() {
  // const [data, setData] = useState<Claim[]>([]);
  // const [loading, setLoading] = useState(true);

  // useEffect(() => {
  //   listClaims()
  //     .then(setData)
  //     .finally(() => setLoading(false));
  // }, []);

  // if (loading) return <div className='p-6'>Loading…</div>;

  return (
    <div>
      <Flex justify='space-between' align='center'>
        <DashboardTitle title='My Claims' />
        <Link to={pageRoutes.MEMBERS_CLAIMS_NEW}>
          <Button type='primary'>New Claim</Button>
        </Link>
      </Flex>

      <div className='mt-8 flex flex-col gap-2 md:flex-row md:gap-4'>
        {claims_stats.map((stat) => {
          return (
            <Card key={stat.id} className='shadow w-full'>
              <Flex vertical gap={14}>
                <Flex justify='space-between' align='center'>
                  <Typography.Text className='text-base'>
                    {stat.name}
                  </Typography.Text>
                  {stat.icon}
                </Flex>
                <Typography.Text className='text-xl font-medium'>
                  {stat.number}
                </Typography.Text>
              </Flex>
            </Card>
          );
        })}
      </div>

      <section className='mt-8 bg-white rounded-lg shadow-md'>
        <Flex className='flex-col gap-3 md:flex-row md:justify-between md:items-center py-4 px-6'>
          <Typography.Title level={5} className=''>
            All Claims
          </Typography.Title>

          <div>
            <InputSearch placeholder='Search by status' />
          </div>
        </Flex>
        <hr className='mx-3 border-t-0' />
        <Table<Claim>
          virtual
          // columns={mergedColumns}
          scroll={{ x: 500, y: 400 }}
          columns={claims_columns}
          dataSource={claims_data}
          // pagination={false}
          className='rounded-lg pt-4'
          // loading
        />
      </section>
    </div>
  );
}
