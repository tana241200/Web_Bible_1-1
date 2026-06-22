'use client';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
    App,
    Avatar,
    Button,
    Card,
    Col,
    Descriptions,
    Drawer,
    Input,
    Row,
    Space,
    Statistic,
    Table,
    Tag,
    Tabs,
    Typography,
} from 'antd';
import {
    CheckOutlined,
    CloseOutlined,
    EyeOutlined,
    UserAddOutlined,
    SearchOutlined,
    ClockCircleOutlined,
    CheckCircleOutlined,
    StopOutlined,
} from '@ant-design/icons';
import { formatDate } from '@/utils/date';
import type { MentorRequestStatus } from '@/types/database.types';

const { Title, Text } = Typography;

interface MentorRequest {
    id: string;
    mentorName: string;
    mentorBranch: string;
    mentorBirthDate: string | null;
    contactInfo: string;
    reason: string;
    status: MentorRequestStatus;
    requesterId: string | null;
    requesterName: string | null;
    reviewedById: string | null;
    reviewedByName: string | null;
    reviewedAt: string | null;
    createdAt: string;
    updatedAt: string;
}

const STATUS_COLORS: Record<MentorRequestStatus, string> = {
    pending: 'gold',
    approved: 'success',
    rejected: 'error',
};

function UserCell({ name }: { name: string | null }) {
    if (!name) return <Text type="secondary">—</Text>;
    return (
        <Space size={6}>
            <Avatar size={22} style={{ background: '#7F77DD', fontSize: 11 }}>
                {name.charAt(0).toUpperCase()}
            </Avatar>
            <span style={{ fontSize: 13, fontWeight: 500 }}>{name}</span>
        </Space>
    );
}

export default function MentorRequestsPage() {
    const { message, modal } = App.useApp();
    const [data, setData] = useState<MentorRequest[]>([]);
    const [loading, setLoading] = useState(false);
    const [search, setSearch] = useState('');
    const [activeTab, setActiveTab] = useState('task-pending');
    const [viewRecord, setViewRecord] = useState<MentorRequest | null>(null);
    const [viewOpen, setViewOpen] = useState(false);

    const loadData = useCallback(async () => {
        try {
            setLoading(true);
            const res = await fetch('/api/mentor-requests');
            if (!res.ok) throw new Error('Failed to load');
            const payload = await res.json();
            setData(payload.data ?? []);
        } catch {
            message.error('Failed to load mentor requests');
        } finally {
            setLoading(false);
        }
    }, [message]);

    // eslint-disable-next-line react-hooks/set-state-in-effect
    useEffect(() => { void loadData(); }, [loadData]);

    const filteredData = useMemo(() => {
        const source = activeTab === 'task-pending'
            ? data.filter((i) => i.status === 'pending')
            : data;

        return source.filter(
            (item) =>
                !search ||
                item.mentorName.toLowerCase().includes(search.toLowerCase()) ||
                item.mentorBranch.toLowerCase().includes(search.toLowerCase()) ||
                item.contactInfo.toLowerCase().includes(search.toLowerCase()),
        );
    }, [data, search, activeTab]);

    const stats = useMemo(() => ({
        total: data.length,
        pending: data.filter((i) => i.status === 'pending').length,
        approved: data.filter((i) => i.status === 'approved').length,
        rejected: data.filter((i) => i.status === 'rejected').length,
    }), [data]);

    const handleApprove = (record: MentorRequest) => {
        modal.confirm({
            title: 'Approve Mentor Request',
            content: (
                <div>
                    <div className="font-medium mb-2">{record.mentorName}</div>
                    <div className="text-gray-500 text-sm">Are you sure you want to approve this mentor request?</div>
                </div>
            ),
            okText: 'Approve',
            onOk: async () => {
                try {
                    const res = await fetch(`/api/mentor-requests/${record.id}`, {
                        method: 'PATCH',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ action: 'approve' }),
                    });
                    if (!res.ok) throw new Error();
                    message.success('Mentor request approved');
                    await loadData();
                } catch {
                    message.error('Failed to approve request');
                }
            },
        });
    };

    const handleReject = (record: MentorRequest) => {
        modal.confirm({
            title: 'Reject Mentor Request',
            content: `Reject request from ${record.mentorName}?`,
            okText: 'Reject',
            okButtonProps: { danger: true },
            onOk: async () => {
                try {
                    const res = await fetch(`/api/mentor-requests/${record.id}`, {
                        method: 'PATCH',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ action: 'reject' }),
                    });
                    if (!res.ok) throw new Error();
                    message.success('Request rejected');
                    await loadData();
                } catch {
                    message.error('Failed to reject request');
                }
            },
        });
    };

    const columns = [
        {
            title: 'Applicant',
            dataIndex: 'mentorName',
            key: 'mentorName',
            render: (_: string, record: MentorRequest) => (
                <div>
                    <div className="font-medium text-[#24292f]">{record.mentorName}</div>
                    <div className="text-xs text-[#656d76]">{record.contactInfo}</div>
                </div>
            ),
        },
        {
            title: 'Requested By',
            key: 'requestedBy',
            width: 180,
            render: (_: unknown, record: MentorRequest) => <UserCell name={record.requesterName} />,
        },
        {
            title: 'Branch',
            dataIndex: 'mentorBranch',
            key: 'branch',
            width: 140,
            render: (value: string) => <Tag color="purple">{value}</Tag>,
        },
        {
            title: 'Submit On',
            dataIndex: 'createdAt',
            key: 'createdAt',
            width: 120,
            render: (value: string) => (
                <span style={{ fontSize: 13, color: '#656d76' }}>{formatDate(value)}</span>
            ),
        },
        ...(activeTab !== 'task-pending' ? [{
            title: 'Reviewed By',
            key: 'reviewedBy',
            width: 180,
            render: (_: unknown, record: MentorRequest) => <UserCell name={record.reviewedByName} />,
        }] : []),
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            width: 120,
            render: (value: MentorRequestStatus) => (
                <Tag color={STATUS_COLORS[value]}>{value.toUpperCase()}</Tag>
            ),
        },
        {
            title: '',
            key: 'actions',
            width: 120,
            align: 'right' as const,
            render: (_: unknown, record: MentorRequest) => (
                <Space size={4}>
                    <Button
                        size="small"
                        icon={<EyeOutlined />}
                        onClick={() => { setViewRecord(record); setViewOpen(true); }}
                    />
                    {record.status === 'pending' && (
                        <>
                            <Button size="small" type="primary" icon={<CheckOutlined />} onClick={() => handleApprove(record)} />
                            <Button size="small" danger icon={<CloseOutlined />} onClick={() => handleReject(record)} />
                        </>
                    )}
                </Space>
            ),
        },
    ];

    const tabItems = [
        {
            key: 'task-pending',
            label: (
                <span>
                    Task Pending
                    <Tag style={{ marginLeft: 6 }} color="gold">{stats.pending}</Tag>
                </span>
            ),
        },
        { key: 'all-requests', label: `All Requests (${stats.total})` },
    ];

    return (
        <div className="space-y-4">
            <div className="flex items-start justify-between gap-4 flex-wrap">
                <div>
                    <Title level={2} style={{ margin: 0, fontSize: 24, fontWeight: 600 }}>
                        Mentor Requests
                    </Title>
                    <Text type="secondary">Review and approve mentor registration requests</Text>
                </div>
                <Tag color="gold" style={{ paddingInline: 10, height: 28, lineHeight: '26px' }}>
                    {stats.pending} Pending
                </Tag>
            </div>

            <Row gutter={[12, 12]}>
                <Col xs={24} sm={12} lg={6}>
                    <Card size="small"><Statistic title="Total" value={stats.total} prefix={<UserAddOutlined />} /></Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <Card size="small"><Statistic title="Pending" value={stats.pending} prefix={<ClockCircleOutlined />} /></Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <Card size="small"><Statistic title="Approved" value={stats.approved} prefix={<CheckCircleOutlined />} /></Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <Card size="small"><Statistic title="Rejected" value={stats.rejected} prefix={<StopOutlined />} /></Card>
                </Col>
            </Row>

            <Card size="small" styles={{ body: { padding: 0 } }}>
                <div style={{ padding: '0 12px' }}>
                    <Tabs activeKey={activeTab} onChange={setActiveTab} items={tabItems} />
                </div>
                <div style={{ padding: '0 12px 12px' }}>
                    <Input
                        allowClear
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        prefix={<SearchOutlined />}
                        placeholder="Search name, branch or contact..."
                        style={{ maxWidth: 320 }}
                    />
                </div>
                <Table
                    rowKey="id"
                    loading={loading}
                    columns={columns}
                    dataSource={filteredData}
                    scroll={{ x: 'max-content' }}
                    pagination={{ pageSize: 10, showSizeChanger: false }}
                />
            </Card>

            <Drawer
                open={viewOpen}
                size="large"
                onClose={() => setViewOpen(false)}
                title="Mentor Request Detail"
                footer={
                    <Space style={{ width: '100%', justifyContent: 'end' }}>
                        <Button onClick={() => setViewOpen(false)}>Close</Button>
                        {viewRecord?.status === 'pending' && (
                            <>
                                <Button danger onClick={() => { setViewOpen(false); handleReject(viewRecord); }}>Reject</Button>
                                <Button type="primary" onClick={() => { setViewOpen(false); handleApprove(viewRecord); }}>Approve</Button>
                            </>
                        )}
                    </Space>
                }
            >
                {viewRecord && (
                    <Descriptions bordered size="small" column={1}>
                        <Descriptions.Item label="Mentor Name">{viewRecord.mentorName}</Descriptions.Item>
                        <Descriptions.Item label="Branch">
                            <Tag color="purple">{viewRecord.mentorBranch}</Tag>
                        </Descriptions.Item>
                        <Descriptions.Item label="Birth Date">
                            {viewRecord.mentorBirthDate ? formatDate(viewRecord.mentorBirthDate) : '—'}
                        </Descriptions.Item>
                        <Descriptions.Item label="Contact">{viewRecord.contactInfo}</Descriptions.Item>
                        <Descriptions.Item label="Reason">{viewRecord.reason}</Descriptions.Item>
                        <Descriptions.Item label="Requested By">
                            <UserCell name={viewRecord.requesterName} />
                        </Descriptions.Item>
                        <Descriptions.Item label="Submit On">{formatDate(viewRecord.createdAt)}</Descriptions.Item>
                        <Descriptions.Item label="Reviewed By">
                            <UserCell name={viewRecord.reviewedByName} />
                        </Descriptions.Item>
                        {viewRecord.reviewedAt && (
                            <Descriptions.Item label="Reviewed At">
                                {formatDate(viewRecord.reviewedAt)}
                            </Descriptions.Item>
                        )}
                        <Descriptions.Item label="Status">
                            <Tag color={STATUS_COLORS[viewRecord.status]}>
                                {viewRecord.status.toUpperCase()}
                            </Tag>
                        </Descriptions.Item>
                    </Descriptions>
                )}
            </Drawer>
        </div>
    );
}