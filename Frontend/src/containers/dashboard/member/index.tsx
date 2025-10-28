import { Flex, Table, Typography } from 'antd';
import Chart from '~/components/dashboard/chart';
import DashboardTitle from '~/components/dashboard/title';
import {
  claim_chart_data,
  claims_columns,
  claims_data,
} from '~/components/dummy_data/members';
import type { Claim } from '~/types/claim';

const { Title } = Typography;

const MembersContainer = () => {
  return (
    <div>
      <Flex vertical>
        <DashboardTitle title='Member Dashboard' />

        <section className='mt-5 p-3 h-80 bg-white rounded-lg shadow-md'>
          <Title level={5} className='mb-3 px-3'>
            Claims Report
          </Title>
          <hr className='mx-3 border-t-0' />
          <Chart chartData={claim_chart_data} />
        </section>

        <section className='mt-8 bg-white rounded-lg shadow-md'>
          <Title level={5} className='pt-4 px-6'>
            Recent Claims
          </Title>
          <hr className='mx-3 border-t-0 mt-3' />
          <Table<Claim>
            virtual
            // columns={mergedColumns}
            scroll={{ x: 500, y: 400 }}
            columns={claims_columns}
            dataSource={claims_data}
            pagination={false}
            className='rounded-lg pt-4'
            // loading
          />
        </section>
      </Flex>
    </div>
  );
};
export default MembersContainer;
