'use client';

import { useEffect, useState } from 'react';
import { Button, Input, Space, Tag, App, Select, Drawer } from 'antd';
import {
    PlusOutlined,
    EditOutlined,
    DeleteOutlined,
    SaveOutlined,
    CloseOutlined,
    BookOutlined,
} from '@ant-design/icons';
import DataPage from '@/components/common/DataPage';
import type { CourseRecord } from '@/types/course.types';

type SubjectRecord = CourseRecord & {
    editing?: boolean;
    tempName?: string;
    createdDate: string;
};

export default function SubjectsPage() {
    const { message, modal } = App.useApp();
    const [data, setData] = useState<SubjectRecord[]>([]);
    const [addingNew, setAddingNew] = useState(false);
    const [newSubjectName, setNewSubjectName] = useState('');

    useEffect(() => {
        void (async () => {
            try {
                const response = await fetch('/api/courses');
                const payload = await response.json();
                setData((payload.data ?? []).map((course: CourseRecord) => ({
                    ...course,
                    createdDate: course.createdAt,
                })));
            } catch {
                message.error('Failed to load courses');
            }
        })();
    }, [message]);

    const startEdit = (id: string) => {
        setData((prev) => prev.map((item) => item.id === id ? { ...item, editing: true, tempName: item.name } : item));
    };

    const cancelEdit = (id: string) => {
        setData((prev) => prev.map((item) => item.id === id ? { ...item, editing: false, tempName: undefined } : item));
    };

    const saveEdit = (id: string) => {
        const target = data.find((item) => item.id === id);
        if (!target?.tempName?.trim()) {
            message.error('Course name is required');
            return;
        }
        setData((prev) => prev.map((item) => item.id === id ? { ...item, name: item.tempName!.trim(), editing: false, tempName: undefined } : item));
        message.success('Course updated');
    };

    const addSubject = () => {
        if (!newSubjectName.trim()) {
            message.error('Course name is required');
            return;
        }
        setData((prev) => [{
            id: String(Date.now()),
            code: `NEW-${Date.now()}`,
            name: newSubjectName.trim(),
            description: null,
            orderNo: 0,
            isActive: true,
            totalTrainings: 0,
            createdAt: new Date().toISOString(),
            createdDate: new Date().toISOString().split('T')[0],
        }, ...prev]);
        setAddingNew(false);
        setNewSubjectName('');
        message.success('Course created');
    };

    const deleteSubject = (id: string) => {
        modal.confirm({
            title: 'Delete course?',
            content: 'This action cannot be undone.',
            okButtonProps: { danger: true },
            onOk() {
                setData((prev) => prev.filter((item) => item.id !== id));
                message.success('Course deleted');
            },
        });
    };

    const columns = [
        {
            title: 'Course',
            dataIndex: 'name',
            width: 420,
            render: (name: string, record: SubjectRecord) => (
                record.editing ? (
                    <Input
                        autoFocus
                        value={record.tempName}
                        onPressEnter={() => saveEdit(record.id)}
                        onChange={(event) => setData((prev) => prev.map((item) => item.id === record.id ? { ...item, tempName: event.target.value } : item))}
                    />
                ) : (
                    <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center">
                            <BookOutlined />
                        </div>
                        <div>
                            <div className="font-medium text-[#24292f]">{name}</div>
                            <div className="text-xs text-[#656d76]">{record.code}</div>
                        </div>
                    </div>
                )
            ),
        },
        {
            title: 'Trainings',
            dataIndex: 'totalTrainings',
            width: 180,
            render: (value: number) => <Tag variant="outlined">{value.toLocaleString()}</Tag>,
            sorter: (a: SubjectRecord, b: SubjectRecord) => a.totalTrainings - b.totalTrainings,
        },
        {
            title: 'Created',
            dataIndex: 'createdDate',
            width: 160,
            render: (value: string) => <span className="text-[#656d76]">{value}</span>,
        },
        {
            title: '',
            width: 140,
            align: 'right' as const,
            render: (_: unknown, record: SubjectRecord) => (
                record.editing ? (
                    <Space size={4}>
                        <Button size="small" icon={<SaveOutlined />} onClick={() => saveEdit(record.id)} />
                        <Button size="small" icon={<CloseOutlined />} onClick={() => cancelEdit(record.id)} />
                    </Space>
                ) : (
                    <Space size={4}>
                        <Button size="small" icon={<EditOutlined />} onClick={() => startEdit(record.id)} />
                        <Button danger size="small" icon={<DeleteOutlined />} onClick={() => deleteSubject(record.id)} />
                    </Space>
                )
            ),
        },
    ];

    return (
        <div className="space-y-4">
            {addingNew && (
                <Drawer
                    title="Add new course"
                    open={addingNew}
                    onClose={() => {
                        setAddingNew(false);
                        setNewSubjectName('');
                    }}
                    destroyOnClose
                    width={420}
                    footer={
                        <div className="flex justify-end gap-2">
                            <Button onClick={() => { setAddingNew(false); setNewSubjectName(''); }}>Cancel</Button>
                            <Button type="primary" onClick={addSubject}>Save</Button>
                        </div>
                    }
                >
                    <div className="flex flex-col gap-3">
                        <Input autoFocus value={newSubjectName} placeholder="Course name..." onPressEnter={addSubject} onChange={(event) => setNewSubjectName(event.target.value)} />
                    </div>
                </Drawer>
            )}
            <DataPage<SubjectRecord>
                title="Subjects"
                subtitle="Manage course catalog"
                breadcrumbs={['Administration', 'Subjects']}
                columns={columns}
                dataSource={data}
                onSearch={() => { }}
                onRefresh={() => message.success('Refreshed')}
                filters={
                    <Select
                        allowClear
                        placeholder="Course"
                        style={{ width: 180 }}
                        options={data.map((course) => ({ value: course.name, label: course.name }))}
                    />
                }
                actions={
                    <>
                        <Button>Export</Button>
                        <Button type="primary" icon={<PlusOutlined />} onClick={() => setAddingNew((prev) => !prev)}>New Course</Button>
                    </>
                }
            />
        </div>
    );
}