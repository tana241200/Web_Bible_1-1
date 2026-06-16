'use client';
import { useEffect, useMemo, useState } from 'react';
import { Typography, Button, Space, Tag, Modal, Form, Input, App } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, BankOutlined } from '@ant-design/icons';
import DataPage from '@/components/common/DataPage';
import type { BranchRecord, ColumnsType } from '@/types/branch.types';
const { Title, Text } = Typography;
type BranchTableRecord = BranchRecord & { status: 'active' | 'inactive' };
export default function BranchesPage() {
    const { message, modal } = App.useApp();
    const [data, setData] = useState<BranchTableRecord[]>([]);
    const [search, setSearch] = useState('');
    const [modalOpen, setModalOpen] = useState(false);
    const [editingRecord, setEditingRecord] = useState<BranchTableRecord | null>(null);
    const [form] = Form.useForm();

    useEffect(() => {
        void (async () => {
            try {
                const response = await fetch('/api/branches');
                const payload = await response.json();
                setData((payload.data ?? []).map((branch: BranchRecord) => ({
                    ...branch,
                    status: branch.isActive ? 'active' : 'inactive',
                })));
            } catch {
                message.error('Failed to load branches');
            }
        })();
    }, [message]);

    const filteredData = useMemo(() => {
        return data.filter(branch =>
            !search ||
            branch.name.toLowerCase().includes(search.toLowerCase()) ||
            branch.status.toLowerCase().includes(search.toLowerCase())
        );
    }, [data, search]);
    const stats = useMemo(() => {
        return {
            totalBranches: data.length,
            activeBranches: data.filter(i => i.status === 'active').length,
            totalMembers: data.reduce((sum, i) => sum + (i.members ?? 0), 0),
            totalTrainings: data.reduce((sum, i) => sum + (i.trainings ?? 0), 0),
        };
    }, [data]);
    const openCreate = () => {
        setEditingRecord(null);
        form.resetFields();
        setModalOpen(true);
    };
    const openEdit = (record: BranchTableRecord) => {
        setEditingRecord(record);
        form.setFieldsValue(record);
        setModalOpen(true);
    };
    const handleDelete = (id: string) => {
        modal.confirm({
            title: 'Delete Branch',
            content: 'This action cannot be undone.',
            okText: 'Delete',
            cancelText: 'Cancel',
            okButtonProps: {
                danger: true,
            },
            onOk: async () => {
    try {
        await fetch(
            `/api/branches/${id}`,
            {
                method: 'DELETE',
            },
        );

        await loadBranches();

        message.success(
            'Branch deleted',
        );
    } catch {
        message.error(
            'Failed to delete branch',
        );
    }
},
        });
    };
   const handleSave = async () => {
    try {
        const values =
            await form.validateFields();

        if (editingRecord) {
            await fetch(
                `/api/branches/${editingRecord.id}`,
                {
                    method: 'PATCH',
                    headers: {
                        'Content-Type':
                            'application/json',
                    },
                    body: JSON.stringify({
                        name: values.name,
                        city: values.city,
                        isActive:
                            editingRecord.isActive,
                    }),
                },
            );

            message.success(
                'Branch updated',
            );
        } else {
            await fetch('/api/branches', {
                method: 'POST',
                headers: {
                    'Content-Type':
                        'application/json',
                },
                body: JSON.stringify({
                    name: values.name,
                    city: values.city,
                    isActive: true,
                }),
            });

            message.success(
                'Branch created',
            );
        }

        setModalOpen(false);

        await loadBranches();
    } catch {
        message.error(
            'Failed to save branch',
        );
    }
};

const loadBranches = async () => {
  try {
    const response = await fetch('/api/branches');
    const payload = await response.json();

    setData(
      (payload.data ?? []).map((branch: BranchRecord) => ({
        ...branch,
        status: branch.isActive ? 'active' : 'inactive',
      })),
    );
  } catch {
    message.error('Failed to load branches');
  }
};
    const columns: ColumnsType<BranchTableRecord> = [
        {
            title: 'Branch',
            dataIndex: 'name',
            key: 'name',
            render: (value: string) => (
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-md border border-[#d0d7de] bg-[#f6f8fa] flex items-center justify-center">
                        <BankOutlined className="text-[#656d76]" />
                    </div>
                    <div>
                        <div className="font-medium text-[#24292f]">
                            {value}
                        </div>
                    </div>
                </div>
            ),
        },
        {
            title: 'City',
            dataIndex: 'city',
            key: 'city',
            width: 160,
        },
        {
            title: 'Members',
            dataIndex: 'members',
            key: 'members',
            width: 120,
            sorter: (a: BranchRecord, b: BranchRecord) =>
                (a.members ?? 0) - (b.members ?? 0),
            render: (value: number | undefined) => (
                <span className="font-medium">{(value ?? 0).toLocaleString()}</span>
            ),
        },
        {
            title: 'Mentors',
            dataIndex: 'mentors',
            key: 'mentors',
            width: 120,
            render: (value: number | undefined) => (
                <Tag variant="filled" color="blue">
                    {value ?? 0}
                </Tag>
            ),
        },
        {
            title: 'Trainings',
            dataIndex: 'trainings',
            key: 'trainings',
            width: 140,
            render: (value: number | undefined) => (
                <Tag variant="filled" color="green">
                    {(value ?? 0).toLocaleString()}
                </Tag>
            ),
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            width: 140,
            render: (value: string) => (
                <Tag
                    variant="filled"
                    color={value === 'active' ? 'success' : 'default'}
                >
                    {value === 'active' ? 'Active' : 'Inactive'}
                </Tag>
            ),
        },
        {
            title: '',
            key: 'actions',
            width: 120,
            align: 'right' as const,
                render: (_: unknown, record: BranchTableRecord) => (
                <Space size={4}>
                    <Button
                        size="small"
                        icon={<EditOutlined />}
                        onClick={() => openEdit(record)}
                    />
                    <Button
                        size="small"
                        danger
                        icon={<DeleteOutlined />}
                        onClick={() => handleDelete(record.id)}
                    />
                </Space>
            ),
        },
    ];
        return (
        <div className="space-y-4">
            {/* Header */}
{/* Stats */}
            {/* Filters */}
            {/* Table */}
            <DataPage<BranchTableRecord>
                title="Branches"
                subtitle="Manage church branches and training centers"
                breadcrumbs={[
                    'Administration',
                    'Branches',
                ]}
                columns={columns}
                dataSource={filteredData}
                onSearch={setSearch}
                onRefresh={() =>
                    message.success('Refreshed')
                }
                filters={<>
                    <div></div>
                </>}
                actions={
                    <>
                        <Button>
                            Export
                        </Button>
                        <Button
                            type="primary"
                            icon={<PlusOutlined />}
                            onClick={openCreate}
                        >
                            New Branch
                        </Button>
                    </>
                }
            />
            {/* Modal */}
            <Modal
                title={editingRecord ? 'Edit Branch' : 'Create Branch'}
                open={modalOpen}
                onCancel={() => setModalOpen(false)}
                onOk={handleSave}
                okText="Save"
                width={560}
            >
                <Form
                    form={form}
                    layout="vertical"
                    className="mt-4"
                >
                    <Form.Item
                        name="name"
                        label="Branch Name"
                        rules={[
                            {
                                required: true,
                                message: 'Branch name is required',
                            },
                        ]}
                    >
                        <Input placeholder="Chi nhánh Hà Nội" />
                    </Form.Item>
                    <Form.Item
                        name="city"
                        label="City"
                    >
                        <Input placeholder="Hà Nội" />
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
}