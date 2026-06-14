'use client';

import {
  Card,
  Form,
  Input,
  Button,
  DatePicker,
  Select,
  Typography,
  Flex,
  message,
} from 'antd';

import {
  MailOutlined,
  LockOutlined,
  UserOutlined,
  PhoneOutlined,
  ApartmentOutlined,
} from '@ant-design/icons';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

const { Title, Text } = Typography;
export default function RegisterPage() {
  const router = useRouter();
  const [form] = Form.useForm();
  const [branches, setBranches] = useState([]);

useEffect(() => {
  loadBranches();
}, []);

const loadBranches = async () => {
  const response = await fetch('/api/branches');
  console.log('Branches response:', response);
  const result = await response.json();

  if (result.success) {
    setBranches(
      result.data.map((branch: any) => ({
        label: branch.name,
        value: branch.id,
      }))
    );
  }
};
const onFinish = async (values: any) => {
  try {
    const payload = {
      ...values,
      birthDate: values.birthDate?.format('YYYY-MM-DD'),
    };

    const response = await fetch(
      '/api/auth/register',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      }
    );

    const result = await response.json();

    if (!response.ok) {
      message.error(
        result.error?.message ||
        result.message ||
        'Register failed'
      );
      return;
    }

    message.success(
      'Account created successfully. Waiting for admin approval.'
    );

    router.push('/login');
  } catch (error) {
    console.error(error);

    message.error('Register failed');
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
          width: 520,
          borderRadius: 16,
        }}
      >
        <Flex vertical align="center">
          <div
            style={{
              width: 64,
              height: 64,
              borderRadius: 16,
              background: '#1677ff',
              color: '#fff',
              fontSize: 28,
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            ✝
          </div>

          <Title level={3}>
            Create Account
          </Title>

          <Text type="secondary">
            Join Bible Discipleship Community
          </Text>
        </Flex>

        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          style={{ marginTop: 32 }}
        >
          <Form.Item
            name="fullName"
            label="Full Name"
            rules={[{ required: true }]}
          >
            <Input
              prefix={<UserOutlined />}
            />
          </Form.Item>

          <Form.Item
            name="email"
            label="Email"
            rules={[
              { required: true },
              { type: 'email' },
            ]}
          >
            <Input
              prefix={<MailOutlined />}
            />
          </Form.Item>

          <Form.Item
            name="birthDate"
            label="Birth Date"
            rules={[{ required: true }]}
          >
            <DatePicker
              style={{ width: '100%' }}
            />
          </Form.Item>

          <Form.Item
            name="branchId"
            label="Branch"
            rules={[{ required: true }]}
          >
            <Select
              placeholder="Select branch"
              options={branches}
              suffixIcon={<ApartmentOutlined />}
            />
          </Form.Item>

          <Form.Item
            name="phone"
            label="Phone"
          >
            <Input
              prefix={<PhoneOutlined />}
            />
          </Form.Item>

          <Form.Item
            name="password"
            label="Password"
            rules={[{ required: true }]}
          >
            <Input.Password
              prefix={<LockOutlined />}
            />
          </Form.Item>

          <Form.Item
            name="confirmPassword"
            label="Confirm Password"
            dependencies={['password']}
            rules={[
              { required: true },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (
                    !value ||
                    value === getFieldValue('password')
                  ) {
                    return Promise.resolve();
                  }

                  return Promise.reject(
                    new Error(
                      'Passwords do not match'
                    )
                  );
                },
              }),
            ]}
          >
            <Input.Password
              prefix={<LockOutlined />}
            />
          </Form.Item>

          <Button
            htmlType="submit"
            type="primary"
            block
            size="large"
          >
            Create Account
          </Button>
        </Form>
      </Card>
    </div>
  );
}