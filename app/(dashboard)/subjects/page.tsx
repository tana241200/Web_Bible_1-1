'use client';

import { useCallback, useEffect, useState } from 'react';
import {
    App,
    Button,
    Drawer,
    Input,
    Select,
    Space,
    Tag,
} from 'antd';
import {
    BookOutlined,
    CloseOutlined,
    DeleteOutlined,
    EditOutlined,
    PlusOutlined,
    SaveOutlined,
} from '@ant-design/icons';

import DataPage from '@/components/common/DataPage';
import type { CourseRecord } from '@/types/course.types';
import { ColumnsType } from 'antd/es/table';

type SubjectRecord = CourseRecord & {
    editing?: boolean;
    tempName?: string;
    createdDate: string;
};

type CreateCourseForm = {
    code: string;
    name: string;
    description: string;
    orderNo: number;
    isActive: boolean;
};

const DEFAULT_FORM: CreateCourseForm = {
    code: '',
    name: '',
    description: '',
    orderNo: 0,
    isActive: true,
};

export default function SubjectsPage() {
    const { message, modal } = App.useApp();
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState<SubjectRecord[]>([]);
    const [addingNew, setAddingNew] = useState(false);
    const [creating, setCreating] = useState(false);

    const [newCourse, setNewCourse] =
        useState<CreateCourseForm>(DEFAULT_FORM);
    
    const loadCourses = useCallback(async () => {
        const response = await fetch('/api/courses');

        if (!response.ok) {
            throw new Error('Failed to load courses');
        }

        const payload = await response.json();

     setData(
        (payload.data ?? []).map((course: CourseRecord) => ({
            ...course,
            createdDate: course.createdAt
                ? new Date(course.createdAt).toISOString().split('T')[0]
                : '',
        })),
    );
    }, []);

    useEffect(() => {
        void (async () => {
            try {
                setLoading(true);
                await loadCourses();
            } catch {
                message.error('Failed to load courses');
            } finally {
                setLoading(false);
            }
        })();
    }, [loadCourses, message]);

    const resetCreateForm = () => {
        setNewCourse(DEFAULT_FORM);
    };

    const closeDrawer = () => {
        setAddingNew(false);
        resetCreateForm();
    };

    const addSubject = async () => {
        if (!newCourse.code.trim()) {
            message.error('Course code is required');
            return;
        }

        if (!newCourse.name.trim()) {
            message.error('Course name is required');
            return;
        }

        try {
            setCreating(true);

            const response = await fetch('/api/courses', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    code: newCourse.code.trim(),
                    name: newCourse.name.trim(),
                    description:
                        newCourse.description.trim() || null,
                    orderNo: newCourse.orderNo,
                    isActive: newCourse.isActive,
                }),
            });

            const payload = await response.json();

            if (!response.ok) {
                throw new Error(
                    payload.message ?? 'Failed to create course',
                );
            }

            await loadCourses();

            closeDrawer();

            message.success('Course created successfully');
        } catch (error) {
            message.error(
                error instanceof Error
                    ? error.message
                    : 'Failed to create course',
            );
        } finally {
            setCreating(false);
        }
    };

    const startEdit = (id: string) => {
        setData((prev) =>
            prev.map((item) =>
                item.id === id
                    ? {
                          ...item,
                          editing: true,
                          tempName: item.name,
                      }
                    : item,
            ),
        );
    };

    const cancelEdit = (id: string) => {
        setData((prev) =>
            prev.map((item) =>
                item.id === id
                    ? {
                          ...item,
                          editing: false,
                          tempName: undefined,
                      }
                    : item,
            ),
        );
    };

    const saveEdit = async (id: string) => {
        const target = data.find((item) => item.id === id);

        if (!target?.tempName?.trim()) {
            message.error('Course name is required');
            return;
        }

        try {
            const response = await fetch(`/api/courses/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: target.tempName.trim() }),
            });

            if (!response.ok) throw new Error('Failed to update course');

            setData((prev) =>
                prev.map((item) =>
                    item.id === id
                        ? { ...item, name: item.tempName!.trim(), editing: false, tempName: undefined }
                        : item,
                ),
            );

            message.success('Course updated');
        } catch {
            message.error('Failed to update course');
        }
    };

    const deleteSubject = (id: string) => {
        modal.confirm({
            title: 'Delete course?',
            content: 'This action cannot be undone.',
            okButtonProps: { danger: true },
            async onOk() {
                try {
                    const response = await fetch(`/api/courses/${id}`, { method: 'DELETE' });
                    if (!response.ok) throw new Error('Failed to delete course');
                    setData((prev) => prev.filter((item) => item.id !== id));
                    message.success('Course deleted');
                } catch {
                    message.error('Failed to delete course');
                }
            },
        });
    };

   const columns : ColumnsType<SubjectRecord> = [
    {
        title: 'Code',
        dataIndex: 'code',
        width: 180,
        sorter: (a: SubjectRecord, b: SubjectRecord) =>
            a.code.localeCompare(b.code),
        render: (value: string) => (
            <span className="font-mono text-xs">
                {value}
            </span>
        ),
    },
    {
        title: 'Course Name',
        dataIndex: 'name',
        width: 260,
        render: (name: string, record: SubjectRecord) =>
            record.editing ? (
                <Input
                    autoFocus
                    value={record.tempName}
                    onPressEnter={() =>
                        saveEdit(record.id)
                    }
                    onChange={(event) =>
                        setData((prev) =>
                            prev.map((item) =>
                                item.id === record.id
                                    ? {
                                          ...item,
                                          tempName:
                                              event.target.value,
                                      }
                                    : item,
                            ),
                        )
                    }
                />
            ) : (
                <div className="flex items-center gap-2">
                    <BookOutlined />
                    <span className="font-medium">
                        {name}
                    </span>
                </div>
            ),
    },
    {
        title: 'Description',
        dataIndex: 'description',
        width: 320,
        ellipsis: true,
        render: (value?: string | null) =>
            value || '-',
    },
    {
        title: 'Order',
        dataIndex: 'orderNo',
        width: 100,
        align: 'center' as const,
        sorter: (
            a: SubjectRecord,
            b: SubjectRecord,
        ) => a.orderNo - b.orderNo,
    },
    {
        title: 'Status',
        dataIndex: 'isActive',
        width: 120,
        render: (value: boolean) => (
            <Tag color={value ? 'green' : 'default'}>
                {value ? 'Active' : 'Inactive'}
            </Tag>
        ),
        filters: [
            {
                text: 'Active',
                value: true,
            },
            {
                text: 'Inactive',
                value: false,
            },
        ],
        onFilter: (
            value: boolean | React.Key,
            record: SubjectRecord,
        ) => record.isActive === value,
    },
    {
        title: 'Trainings',
        dataIndex: 'totalTrainings',
        width: 120,
        align: 'center' as const,
        render: (value?: number) => (
            <Tag>
                {(value ?? 0).toLocaleString()}
            </Tag>
        ),
        sorter: (
            a: SubjectRecord,
            b: SubjectRecord,
        ) =>
            (a.totalTrainings ?? 0) -
            (b.totalTrainings ?? 0),
    },
    {
        title: 'Created',
        dataIndex: 'createdDate',
        width: 140,
        render: (value: string) => (
            <span className="text-[#656d76]">
                {value}
            </span>
        ),
        sorter: (
            a: SubjectRecord,
            b: SubjectRecord,
        ) =>
            new Date(a.createdDate).getTime() -
            new Date(b.createdDate).getTime(),
    },
    {
        title: 'Actions',
        width: 140,
        fixed: 'right',
        render: (
            _: unknown,
            record: SubjectRecord,
        ) =>
            record.editing ? (
                <Space size={4}>
                    <Button
                        size="small"
                        icon={<SaveOutlined />}
                        onClick={() =>
                            saveEdit(record.id)
                        }
                    />
                    <Button
                        size="small"
                        icon={<CloseOutlined />}
                        onClick={() =>
                            cancelEdit(record.id)
                        }
                    />
                </Space>
            ) : (
                <Space size={4}>
                    <Button
                        size="small"
                        icon={<EditOutlined />}
                        onClick={() =>
                            startEdit(record.id)
                        }
                    />
                    <Button
                        danger
                        size="small"
                        icon={<DeleteOutlined />}
                        onClick={() =>
                            deleteSubject(record.id)
                        }
                    />
                </Space>
            ),
    },
];

    return (
        <>
            <Drawer
                title="Create Course"
                open={addingNew}
                onClose={closeDrawer}
                destroyOnClose
                size="large"
                footer={
                    <div className="flex justify-end gap-2">
                        <Button onClick={closeDrawer}>
                            Cancel
                        </Button>

                        <Button
                            type="primary"
                            loading={creating}
                            onClick={addSubject}
                        >
                            Save
                        </Button>
                    </div>
                }
            >
                <div className="space-y-5">
    <div>
        <label className="mb-2 block text-sm font-medium">
            Course Code <span className="text-red-500">*</span>
        </label>
        <Input
            value={newCourse.code}
            onChange={(e) =>
                setNewCourse((prev) => ({
                    ...prev,
                    code: e.target.value,
                }))
            }
            placeholder="e.g. DISCIPLESHIP_101"
        />
    </div>

    <div>
        <label className="mb-2 block text-sm font-medium">
            Course Name <span className="text-red-500">*</span>
        </label>
        <Input
            value={newCourse.name}
            onChange={(e) =>
                setNewCourse((prev) => ({
                    ...prev,
                    name: e.target.value,
                }))
            }
            placeholder="Enter course name"
        />
    </div>

    <div>
        <label className="mb-2 block text-sm font-medium">
            Description
        </label>
        <Input.TextArea
            rows={4}
            value={newCourse.description}
            onChange={(e) =>
                setNewCourse((prev) => ({
                    ...prev,
                    description: e.target.value,
                }))
            }
            placeholder="Course description"
        />
    </div>

    <div>
        <label className="mb-2 block text-sm font-medium">
            Display Order
        </label>
        <Input
            type="number"
            value={newCourse.orderNo}
            onChange={(e) =>
                setNewCourse((prev) => ({
                    ...prev,
                    orderNo: Number(e.target.value) || 0,
                }))
            }
        />
    </div>

    <div>
        <label className="mb-2 block text-sm font-medium">
            Status
        </label>
        <Select
            className="w-full"
            value={newCourse.isActive}
            options={[
                {
                    label: 'Active',
                    value: true,
                },
                {
                    label: 'Inactive',
                    value: false,
                },
            ]}
            onChange={(value) =>
                setNewCourse((prev) => ({
                    ...prev,
                    isActive: value,
                }))
            }
        />
    </div>
</div>
            </Drawer>

            <DataPage<SubjectRecord>
                loading={loading}
                title="Subjects"
                subtitle="Manage course catalog"
                breadcrumbs={[
                    'Administration',
                    'Subjects',
                ]}
                columns={columns}
                dataSource={data}
                onSearch={() => {}}
                onRefresh={async () => {
                    try {
                        await loadCourses();
                        message.success('Refreshed');
                    } catch {
                        message.error(
                            'Failed to refresh',
                        );
                    }
                }}
                filters={
                    <Select
                        allowClear
                        placeholder="Course"
                        style={{ width: 180 }}
                        options={data.map((course) => ({
                            value: course.name,
                            label: course.name,
                        }))}
                    />
                }
                actions={
                    <>
                        <Button>Export</Button>

                        <Button
                            type="primary"
                            icon={<PlusOutlined />}
                            onClick={() =>
                                setAddingNew(true)
                            }
                        >
                            New Course
                        </Button>
                    </>
                }
            />
        </>
    );
}