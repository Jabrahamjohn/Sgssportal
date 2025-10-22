import { Button, Form, Input, InputPassword } from '~/components/controls';
import { useAuthContext } from '~/store/contexts';
import { useLoginMutation } from '~/store/queries/auth';
import type { FormRule } from '~/types';
import { handleAllErrors } from '~/utils/errors';

const defaultRules = [{ required: true, message: 'This field is required.' }];
const rules: Record<string, FormRule[]> = {
  email: [...defaultRules, { type: 'email', message: 'Email address is invalid.' }],
  password: [...defaultRules],
};

export default function Login() {
  const { login } = useAuthContext();

  const [form] = Form.useForm();

  const {
    mutate: onSubmit,
    error: loginError,
    isPending: loading,
  } = useLoginMutation({
    onSuccess(response) {
      login(response.data);
    },
  });

  return (
    <Form
      error={handleAllErrors(loginError)?.data}
      form={form}
      name="login-form"
      onFinish={(values) => (onSubmit ? onSubmit(values) : undefined)}
      className="space-y-3 p-4 max-w-md mx-auto pt-20"
      disabled={loading}
    >
      <h1>Login</h1>
      <Form.Item name="email" rules={rules.email}>
        <Input placeholder="Enter your email" size="large" />
      </Form.Item>

      <Form.Item name="password" rules={rules.password}>
        <InputPassword placeholder="Enter your password" size="large" />
      </Form.Item>

      <div className="pt-3">
        <Button block loading={loading} size="large" type="primary">
          {loading ? 'Signing in...' : 'Login'}
        </Button>
      </div>
    </Form>
  );
}
