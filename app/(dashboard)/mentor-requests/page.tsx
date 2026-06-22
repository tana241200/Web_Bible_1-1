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

/* =========================
   TYPE (MATCH API)
========================= */
interface MentorRequest {
    id: string;
    status: MentorRequestStatus;

    requester: {
        id: string;
        name: string;
        email: string;
    } | null;

    mentor: {
        id: string;
        name: string;
        email: string;
    } | null;

    course: {
        id: string;
        name: string;
        code: string;
    } | null;

    createdAt: string;
    updatedAt: string | null;
}

/* =========================
   STATUS COLORS
========================= */
const STATUS_COLORS: Record<MentorRequestStatus, string> = {
    pending: 'gold',
    approved: 'success',
    rejected: 'error',
};

/* =========================
   USER CELL
========================= */
function UserCell({ name }: { name: string | null }) {
    if (!name) return <Text type="secondary">—</Text>;

    return (
        <Space size={6}>
            <Avatar size={22} style={{ background: '#7F77DD' }}>
                {name.charAt(0).toUpperCase()}
            </Avatar>
            <span style={{ fontSize: 13, fontWeight: 500 }}>{name}</span>
        </Space>
    );
}

/* =========================
   PAGE
========================= */
export default function MentorRequestsPage() {
    const { message, modal } = App.useApp();

    const [data, setData] = useState<MentorRequest[]>([]);
    const [loading, setLoading] = useState(false);
    const [search, setSearch] = useState('');
    const [activeTab, setActiveTab] = useState('pending');

    const [viewRecord, setViewRecord] = useState<MentorRequest | null>(null);
    const [viewOpen, setViewOpen] = useState(false);

    /* =========================
       LOAD DATA
    ========================= */
    const loadData = useCallback(async () => {
        try {
            setLoading(true);

            const res = await fetch('/api/mentor-requests');
            if (!res.ok) throw new Error();

            const payload = await res.json();
            setData(payload.data ?? []);
        } catch {
            message.error('Failed to load mentor requests');
        } finally {
            setLoading(false);
        }
    }, [message]);

    useEffect(() => {
        void loadData();
    }, [loadData]);

    /* =========================
       FILTER
    ========================= */
    const filteredData = useMemo(() => {
        const source =
            activeTab === 'pending'
                ? data.filter((i) => i.status === 'pending')
                : data;

        const keyword = search.toLowerCase();

        return source.filter((item) => {
            return (
                item.mentor?.name?.toLowerCase().includes(keyword) ||
                item.requester?.name?.toLowerCase().includes(keyword) ||
                item.course?.name?.toLowerCase().includes(keyword)
            );
        });
    }, [data, search, activeTab]);

    /* =========================
       STATS
    ========================= */
    const stats = useMemo(() => {
        return {
            total: data.length,
            pending: data.filter((i) => i.status === 'pending').length,
            approved: data.filter((i) => i.status === 'approved').length,
            rejected: data.filter((i) => i.status === 'rejected').length,
        };
    }, [data]);

    /* =========================
       ACTIONS
    ========================= */
    const handleAction = (record: MentorRequest, action: 'approve' | 'reject') => {
        modal.confirm({
            title: action === 'approve' ? 'Approve Request' : 'Reject Request',
            content: `Are you sure you want to ${action} this request?`,
            okText: action === 'approve' ? 'Approve' : 'Reject',
            okButtonProps: action === 'reject' ? { danger: true } : undefined,

            onOk: async () => {
                try {
                    const res = await fetch(`/api/mentor-requests/${record.id}`, {
                        method: 'PATCH',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            action,
                            reviewedBy: 'SYSTEM_USER_ID',
                        }),
                    });

                    if (!res.ok) throw new Error();

                    message.success(`Request ${action}d`);
                    await loadData();
                } catch {
                    message.error('Action failed');
                }
            },
        });
    };

    /* =========================
       COLUMNS
    ========================= */
    const columns = [
        {
            title: 'Mentor',
            key: 'mentor',
            render: (_: unknown, record: MentorRequest) => (
                <div>
                    <div className="font-medium">{record.mentor?.name ?? '—'}</div>
                    <div className="text-xs text-gray-500">
                        {record.mentor?.email}
                    </div>
                </div>
            ),
        },
        {
            title: 'Requested By',
            key: 'requester',
            render: (_: unknown, record: MentorRequest) => (
                <UserCell name={record.requester?.name ?? null} />
            ),
        },
        {
            title: 'Course',
            key: 'course',
            render: (_: unknown, record: MentorRequest) => (
                <div>
                    <div className="font-medium">{record.course?.name}</div>
                    <div className="text-xs text-gray-500">
                        {record.course?.code}
                    </div>
                </div>
            ),
        },
        {
            title: 'Created',
            dataIndex: 'createdAt',
            render: (v: string) => (
                <span style={{ fontSize: 13 }}>{formatDate(v)}</span>
            ),
        },
        {
            title: 'Status',
            dataIndex: 'status',
            render: (v: MentorRequestStatus) => (
                <Tag color={STATUS_COLORS[v]}>{v.toUpperCase()}</Tag>
            ),
        },
        {
            title: '',
            key: 'actions',
            render: (_: unknown, record: MentorRequest) => (
                <Space>
                    <Button
                        icon={<EyeOutlined />}
                        onClick={() => {
                            setViewRecord(record);
                            setViewOpen(true);
                        }}
                    />

                    {record.status === 'pending' && (
                        <>
                            <Button
                                type="primary"
                                icon={<CheckOutlined />}
                                onClick={() => handleAction(record, 'approve')}
                            />
                            <Button
                                danger
                                icon={<CloseOutlined />}
                                onClick={() => handleAction(record, 'reject')}
                            />
                        </>
                    )}
                </Space>
            ),
        },
    ];

    /* =========================
       TABS
    ========================= */
    const tabItems = [
        {
            key: 'pending',
            label: (
                <span>
                    Pending <Tag color="gold">{stats.pending}</Tag>
                </span>
            ),
        },
        {
            key: 'all',
            label: `All (${stats.total})`,
        },
    ];

    /* =========================
       UI
    ========================= */
    return (
        <div className="space-y-4">
            <div className="flex justify-between">
                <div>
                    <Title level={3}>Mentor Requests</Title>
                    <Text type="secondary">
                        Manage mentor onboarding requests
                    </Text>
                </div>
            </div>

            {/* STATS */}
            <Row gutter={12}>
                <Col span={6}>
                    <Card>
                        <Statistic title="Total" value={stats.total} />
                    </Card>
                </Col>
                <Col span={6}>
                    <Card>
                        <Statistic title="Pending" value={stats.pending} />
                    </Card>
                </Col>
                <Col span={6}>
                    <Card>
                        <Statistic title="Approved" value={stats.approved} />
                    </Card>
                </Col>
                <Col span={6}>
                    <Card>
                        <Statistic title="Rejected" value={stats.rejected} />
                    </Card>
                </Col>
            </Row>

            {/* TABLE */}
            <Card>
                <Tabs
                    activeKey={activeTab}
                    onChange={setActiveTab}
                    items={tabItems}
                />

                <Input
                    prefix={<SearchOutlined />}
                    placeholder="Search mentor, requester, course..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    style={{ marginBottom: 12, maxWidth: 300 }}
                />

                <Table
                    rowKey="id"
                    loading={loading}
                    columns={columns}
                    dataSource={filteredData}
                    pagination={{ pageSize: 10 }}
                />
            </Card>

            {/* DRAWER */}
            <Drawer
                open={viewOpen}
                onClose={() => setViewOpen(false)}
                title="Request Detail"
                size="small"
            >
                {viewRecord && (
                    <Descriptions column={1} bordered size="small">
                        <Descriptions.Item label="Mentor">
                            {viewRecord.mentor?.name}
                        </Descriptions.Item>

                        <Descriptions.Item label="Requester">
                            {viewRecord.requester?.name}
                        </Descriptions.Item>

                        <Descriptions.Item label="Course">
                            {viewRecord.course?.name}
                        </Descriptions.Item>

                        <Descriptions.Item label="Status">
                            <Tag color={STATUS_COLORS[viewRecord.status]}>
                                {viewRecord.status.toUpperCase()}
                            </Tag>
                        </Descriptions.Item>

                        <Descriptions.Item label="Created">
                            {formatDate(viewRecord.createdAt)}
                        </Descriptions.Item>
                    </Descriptions>
                )}
            </Drawer>
        </div>
    );
}