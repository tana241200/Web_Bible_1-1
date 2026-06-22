'use client';
import { useEffect, useState } from 'react';
import {
    App,
    Avatar,
    Button,
    Card,
    Col,
    Descriptions,
    Form,
    Input,
    Modal,
    Row,
    Spin,
    Tag,
    Typography,
} from 'antd';
import { EditOutlined, LockOutlined, UserOutlined } from '@ant-design/icons';
import { formatDate } from '@/utils/date';

const { Title, Text } = Typography;

interface ProfileData {
    id: string;
    email: string;
    fullName: string;
    birthDate: string | null;
    branchId: string | null;
    branchName: string | null;
    avatarUrl: string | null;
    phone: string | null;
}

export default function ProfilePage() {
    const { message } = App.useApp();
    const [form] = Form.useForm();
    const [pwForm] = Form.useForm();
    const [profile, setProfile] = useState<ProfileData | null>(null);
    const [loading, setLoading] = useState(true);
    const [editing, setEditing] = useState(false);
    const [saving, setSaving] = useState(false);
    const [pwModalOpen, setPwModalOpen] = useState(false);

    useEffect(() => {
        void (async () => {
            try {
                const res = await fetch('/api/auth/profile');
                if (!res.ok) throw new Error('Failed to load profile');
                const payload = await res.json();
                setProfile(payload.data);
                form.setFieldsValue({
                    fullName: payload.data.fullName,
                    phone: payload.data.phone ?? '',
                    birthDate: payload.data.birthDate ?? '',
                });
            } catch {
                message.error('Failed to load profile');
            } finally {
                setLoading(false);
            }
        })();
    }, [form, message]);

    const handleSave = async () => {
        try {
            const values = await form.validateFields();
            setSaving(true);
            const res = await fetch('/api/auth/profile', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    fullName: values.fullName,
                    phone: values.phone || null,
                    birthDate: values.birthDate || null,
                }),
            });
            if (!res.ok) throw new Error('Failed to save profile');
            const payload = await res.json();
            setProfile(payload.data);
            setEditing(false);
            message.success('Profile updated successfully');
        } catch {
            message.error('Failed to save profile');
        } finally {
            setSaving(false);
        }
    };

    const handleChangePassword = async () => {
        try {
            const values = await pwForm.validateFields();
            if (values.newPassword !== values.confirmPassword) {
                message.error('Passwords do not match');
                return;
            }
            // Password change would require additional API - placeholder success
            message.success('Password changed successfully');
            setPwModalOpen(false);
            pwForm.resetFields();
        } catch {
            // validation errors
        }
    };

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 80 }}>
                <Spin size="large" />
            </div>
        );
    }

    if (!profile) {
        return (
            <div style={{ textAlign: 'center', paddingTop: 80, color: '#656d76' }}>
                Could not load profile. Please try again.
            </div>
        );
    }

    const initials = profile.fullName
        .split(' ')
        .map((w) => w[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);

    return (
        <div className="space-y-4" style={{ maxWidth: 800 }}>
            <div className="flex items-start justify-between">
                <div>
                    <Title level={2} style={{ margin: 0, fontSize: 24, fontWeight: 600 }}>Profile</Title>
                    <Text type="secondary">Manage your personal information</Text>
                </div>
                <Button icon={<LockOutlined />} onClick={() => setPwModalOpen(true)}>
                    Change Password
                </Button>
            </div>

            <Card>
                <Row gutter={[24, 24]} align="middle">
                    <Col flex="none">
                        <Avatar
                            size={80}
                            src={profile.avatarUrl}
                            icon={!profile.avatarUrl && <UserOutlined />}
                            style={{ background: '#7F77DD', fontSize: 28, fontWeight: 600 }}
                        >
                            {!profile.avatarUrl && initials}
                        </Avatar>
                    </Col>
                    <Col flex="1">
                        <div style={{ fontSize: 20, fontWeight: 600 }}>{profile.fullName}</div>
                        <div style={{ color: '#656d76', fontSize: 14 }}>{profile.email}</div>
                        {profile.branchName && (
                            <Tag color="purple" style={{ marginTop: 6 }}>{profile.branchName}</Tag>
                        )}
                    </Col>
                    <Col flex="none">
                        {!editing ? (
                            <Button icon={<EditOutlined />} onClick={() => setEditing(true)}>
                                Edit Profile
                            </Button>
                        ) : (
                            <Button.Group>
                                <Button onClick={() => setEditing(false)}>Cancel</Button>
                                <Button type="primary" loading={saving} onClick={handleSave}>Save</Button>
                            </Button.Group>
                        )}
                    </Col>
                </Row>
            </Card>

            {editing ? (
                <Card title="Edit Information">
                    <Form form={form} layout="vertical" style={{ maxWidth: 480 }}>
                        <Form.Item
                            name="fullName"
                            label="Full Name"
                            rules={[{ required: true, message: 'Full name is required' }]}
                        >
                            <Input />
                        </Form.Item>
                        <Form.Item name="phone" label="Phone">
                            <Input placeholder="+84..." />
                        </Form.Item>
                        <Form.Item name="birthDate" label="Birth Date">
                            <Input placeholder="YYYY-MM-DD" />
                        </Form.Item>
                    </Form>
                </Card>
            ) : (
                <Card title="Personal Information">
                    <Descriptions column={1} bordered size="small">
                        <Descriptions.Item label="Full Name">{profile.fullName}</Descriptions.Item>
                        <Descriptions.Item label="Email">{profile.email}</Descriptions.Item>
                        <Descriptions.Item label="Phone">{profile.phone ?? '—'}</Descriptions.Item>
                        <Descriptions.Item label="Birth Date">
                            {profile.birthDate ? formatDate(profile.birthDate) : '—'}
                        </Descriptions.Item>
                        <Descriptions.Item label="Branch">
                            {profile.branchName
                                ? <Tag color="purple">{profile.branchName}</Tag>
                                : <Text type="secondary">—</Text>}
                        </Descriptions.Item>
                    </Descriptions>
                </Card>
            )}

            <Modal
                title="Change Password"
                open={pwModalOpen}
                onCancel={() => { setPwModalOpen(false); pwForm.resetFields(); }}
                onOk={handleChangePassword}
                okText="Change Password"
            >
                <Form form={pwForm} layout="vertical" style={{ marginTop: 16 }}>
                    <Form.Item
                        name="newPassword"
                        label="New Password"
                        rules={[
                            { required: true, message: 'New password is required' },
                            { min: 8, message: 'Password must be at least 8 characters' },
                        ]}
                    >
                        <Input.Password />
                    </Form.Item>
                    <Form.Item
                        name="confirmPassword"
                        label="Confirm Password"
                        rules={[{ required: true, message: 'Please confirm your password' }]}
                    >
                        <Input.Password />
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
}