import { useEffect, useState } from 'react';
import { useAuth } from '~/store/contexts/AuthContext';
import {
  Button,
  Input,
  Divider,
  InputPassword,
  Form,
} from '~/components/controls';
import { APP_NAME } from '~/config';
import api from '~/config/api';
import { Flex } from 'antd';
import { useAlertContext } from '~/store/contexts';
import { useNavigate } from '~/hooks';

export default function Login() {
  const { open } = useAlertContext();
  const [form] = Form.useForm();
  const [loggingIn, setLoggingIn] = useState(false);

  const { login, auth } = useAuth();
  const { navigate } = useNavigate();

  // 1️⃣ Fetch CSRF cookie on mount (required for Django session login)
  useEffect(() => {
    const getCsrfToken = async () => {
      try {
        await api.get('/auth/csrf/');
        console.log('✅ CSRF cookie set successfully');
      } catch (err) {
        console.error('❌ Failed to get CSRF cookie', err);
      }
    };
    getCsrfToken();
  }, []);

  // 2️⃣ Auto-redirect if already authenticated
  useEffect(() => {
    if (auth.isAuthenticated) {
      const role = auth.role || 'member';
      if (role === 'admin') navigate('/dashboard/admin');
      else if (role === 'committee') navigate('/dashboard/committee');
      else navigate('/dashboard/member');
    }
  }, [auth.isAuthenticated, auth.role, navigate]);

  // 4️⃣ Handle login
  const handleSubmit = async (values: {
    username: string;
    password: string;
  }) => {
    setLoggingIn(true);
    try {
      await login(values.username, values.password);
      const role = auth?.role || 'member';
      if (role === 'admin') navigate('/dashboard/admin');
      else if (role === 'committee') navigate('/dashboard/committee');
      else navigate('/dashboard/member');
      open({ message: 'Login Successful', type: 'success' });
    } catch (err: any) {
      const message =
        err.response?.data?.detail ||
        err.response?.data?.non_field_errors?.[0] ||
        'Invalid username or password.';
      open({ message, type: 'error' });
    } finally {
      setLoggingIn(false);
    }
  };

  // 5️⃣ UI
  return (
    <div className='min-h-screen flex items-center justify-center bg-gray-50 px-4'>
      <Flex vertical gap={7}>
        <div className='flex flex-col items-center'>
          {/* <AppImage
            src={LOGO_IMAGE}
            alt={APP_NAME}
            className='size-14 object-contain mb-2'
          /> */}
          <h1 className='text-2xl font-bold text-gray-800'>{APP_NAME}</h1>
        </div>
        <div className='w-full max-w-md bg-white shadow-md rounded-2xl p-8'>
          <Form
            name='login_form'
            form={form}
            onFinish={handleSubmit}
            className='space-y-4'
          >
            <h2 className='text-xl font-semibold mb-5 text-center'>
              Member Login
            </h2>
            <div className='mb-5'>
              <Divider />
            </div>

            <Form.Item
              name={'username'}
              rules={[
                { required: true, message: 'Please enter email or username' },
              ]}
            >
              <Input placeholder='e.g. john223' label='Email or Username' />
            </Form.Item>
            <Form.Item
              name={'password'}
              rules={[
                { required: true, message: 'Please enter your password' },
              ]}
            >
              <InputPassword placeholder='**********' label='Password' />
            </Form.Item>

            <Form.Item>
              <Button
                htmlType='submit'
                block
                type='primary'
                loading={loggingIn}
              >
                {loggingIn ? 'Processing...' : 'Login'}
              </Button>
            </Form.Item>
          </Form>

          <Divider />

          <p className='text-center text-sm text-gray-500'>
            Having trouble logging in? Contact{' '}
            <a
              href='mailto:support@sgssmedicalfund.org'
              className='text-primary-600 hover:underline'
            >
              support@sgssmedicalfund.org
            </a>
          </p>
        </div>
      </Flex>
    </div>
  );
}
