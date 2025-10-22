import { Layout, Typography, Space } from 'antd';
import { WarningOutlined, RocketOutlined } from '@ant-design/icons';
import { APP_NAME } from '~/config/app';

const { Content } = Layout;
const { Title, Text } = Typography;

export default function SimpleComingSoonPage({ pageNotFound }: { pageNotFound?: boolean }) {
  return (
    <Layout style={{ minHeight: '100vh', background: '#f0f2f5' }}>
      <Content
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          padding: '2rem',
        }}
      >
        <Space direction="vertical" size="large" align="center">
          {pageNotFound ? (
            <WarningOutlined className="primary-text-color" style={{ fontSize: '64px' }} />
          ) : (
            <RocketOutlined className="primary-text-color" style={{ fontSize: '64px' }} />
          )}
          <Title level={1} style={{ marginBottom: 0 }}>
            {pageNotFound ? 'Oops, Page Not Found' : 'Coming Soon'}
          </Title>
          <Text style={{ fontSize: '18px', textAlign: 'center' }}>
            {pageNotFound
              ? "It seems what you're looking for is no longer available"
              : "We're launching something exciting. Stay tuned!"}
          </Text>
          <Text type="secondary">
            © {new Date().getFullYear()} {APP_NAME}. All rights reserved.
          </Text>
        </Space>
      </Content>
    </Layout>
  );
}
