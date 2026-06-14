'use client';

import {
  Card,
  Form,
  Input,
  Button,
  Checkbox,
  Typography,
  Flex,
} from 'antd';

import {
  MailOutlined,
  LockOutlined,
} from '@ant-design/icons';

import { useRouter } from 'next/navigation';
import { message } from 'antd';


const { Title, Text, Link } = Typography;

export default function LoginPage() {
  const [form] = Form.useForm();

  const router = useRouter();

const onFinish = async (values: any) => {
  try {
    const response = await fetch(
      '/api/auth/login',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(values),
      }
    );

    const result = await response.json();

    if (!response.ok) {
      message.error(result.message);
      return;
    }

    message.success('Login successful');

    router.push('/dashboard');
  } catch {
    message.error('Login failed');
  }
};

  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#F5F7FA',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 24,
      }}
    >
      <Card
        style={{
          width: 420,
          borderRadius: 16,
        }}
      >
        <Flex vertical align="center" gap={8}>
          <div
            style={{
              width: 64,
              height: 64,
              borderRadius: 16,
              background: '#1677ff',
              color: '#fff',
              fontSize: 28,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            ✝
          </div>

          <Title level={3} style={{ margin: 0 }}>
            Bible Discipleship
          </Title>

          <Text type="secondary">
            Sign in to your account
          </Text>
        </Flex>

        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          style={{ marginTop: 32 }}
        >
          <Form.Item
            label="Email"
            name="email"
            rules={[
              { required: true },
              { type: 'email' },
            ]}
          >
            <Input
              prefix={<MailOutlined />}
              placeholder="your@email.com"
            />
          </Form.Item>

          <Form.Item
            label="Password"
            name="password"
            rules={[{ required: true }]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="••••••••"
            />
          </Form.Item>

          <Flex justify="space-between">
            <Checkbox>Remember me</Checkbox>

            <Link href="/forgot-password">
              Forgot password?
            </Link>
          </Flex>

          <Button
            htmlType="submit"
            type="primary"
            block
            size="large"
            style={{ marginTop: 24 }}
          >
            Login
          </Button>

          <div
            style={{
              textAlign: 'center',
              marginTop: 24,
            }}
          >
            <Text type="secondary">
              Don't have account?
            </Text>

            <Link href="/register">
              {' '}Register
            </Link>
          </div>
        </Form>
      </Card>
    </div>
  );
}