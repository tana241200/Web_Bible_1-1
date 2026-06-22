'use client';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
    App,
    Avatar,
    Badge,
    Button,
    Input,
    Spin,
    Tag,
    Typography,
} from 'antd';
import { SearchOutlined, SendOutlined, UserOutlined } from '@ant-design/icons';
import { formatDateTime } from '@/utils/date';

const { Title, Text } = Typography;

interface MessageRecord {
    id: string;
    conversationId: string;
    senderId: string;
    senderName?: string;
    content: string;
    isRead: boolean;
    createdAt: string;
}

interface Contact {
    id: string;
    fullName: string;
    branchName: string | null;
    avatarUrl: string | null;
}

// Current user is taken from /api/auth/me
interface CurrentUser {
    id: string;
    fullName: string;
}

export default function MessagesPage() {
    const { message } = App.useApp();
    const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
    const [contacts, setContacts] = useState<Contact[]>([]);
    const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
    const [messages, setMessages] = useState<MessageRecord[]>([]);
    const [contactSearch, setContactSearch] = useState('');
    const [inputValue, setInputValue] = useState('');
    const [loadingContacts, setLoadingContacts] = useState(false);
    const [loadingMessages, setLoadingMessages] = useState(false);
    const [sending, setSending] = useState(false);
    const endRef = useRef<HTMLDivElement>(null);

    // Load current user
    useEffect(() => {
        void (async () => {
            try {
                const res = await fetch('/api/auth/me');
                if (!res.ok) return;
                const payload = await res.json();
                setCurrentUser({ id: payload.data.id, fullName: payload.data.fullName });
            } catch {
                // not authenticated
            }
        })();
    }, []);

    // Load all users as contacts
    useEffect(() => {
        void (async () => {
            setLoadingContacts(true);
            try {
                const res = await fetch('/api/users');
                if (!res.ok) throw new Error();
                const payload = await res.json();
                setContacts(
                    (payload.data ?? [])
                        .filter((u: any) => u.id !== currentUser?.id)
                        .map((u: any) => ({
                            id: u.id,
                            fullName: u.fullName,
                            branchName: u.branchName ?? null,
                            avatarUrl: u.avatarUrl ?? null,
                        })),
                );
            } catch {
                message.error('Failed to load contacts');
            } finally {
                setLoadingContacts(false);
            }
        })();
    }, [currentUser, message]);

    const loadMessages = useCallback(async (contact: Contact) => {
        if (!currentUser) return;
        setLoadingMessages(true);
        try {
            const res = await fetch(
                `/api/messages?userId=${currentUser.id}&otherId=${contact.id}`,
            );
            if (!res.ok) throw new Error();
            const payload = await res.json();
            setMessages(payload.data?.messages ?? []);
        } catch {
            message.error('Failed to load messages');
        } finally {
            setLoadingMessages(false);
        }
    }, [currentUser, message]);

    useEffect(() => {
        if (selectedContact) void loadMessages(selectedContact);
    }, [selectedContact, loadMessages]);

    useEffect(() => {
        endRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSend = async () => {
        if (!inputValue.trim() || !selectedContact || !currentUser) return;
        setSending(true);
        const content = inputValue.trim();
        setInputValue('');
        try {
            const res = await fetch('/api/messages', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ fromId: currentUser.id, toId: selectedContact.id, content }),
            });
            if (!res.ok) throw new Error();
            const payload = await res.json();
            setMessages((prev) => [...prev, payload.data]);
        } catch {
            message.error('Failed to send message');
            setInputValue(content);
        } finally {
            setSending(false);
        }
    };

    const filteredContacts = contacts.filter((c) =>
        c.fullName.toLowerCase().includes(contactSearch.toLowerCase()),
    );

    return (
        <div className="space-y-4">
            <div>
                <Title level={2} style={{ margin: 0, fontSize: 24, fontWeight: 600 }}>Messages</Title>
                <Text type="secondary">Direct messages with your team members</Text>
            </div>

            <div
                style={{
                    display: 'flex',
                    height: 'calc(100vh - 220px)',
                    minHeight: 480,
                    border: '1px solid #d0d7de',
                    borderRadius: 8,
                    overflow: 'hidden',
                    background: '#fff',
                }}
            >
                {/* Sidebar */}
                <div style={{ width: 260, borderRight: '1px solid #d0d7de', display: 'flex', flexDirection: 'column' }}>
                    <div style={{ padding: '12px 12px 8px' }}>
                        <Input
                            prefix={<SearchOutlined />}
                            placeholder="Search contacts..."
                            value={contactSearch}
                            onChange={(e) => setContactSearch(e.target.value)}
                            size="small"
                            allowClear
                        />
                    </div>
                    <div style={{ flex: 1, overflowY: 'auto' }}>
                        {loadingContacts ? (
                            <div style={{ padding: 20, textAlign: 'center' }}><Spin size="small" /></div>
                        ) : filteredContacts.length === 0 ? (
                            <div style={{ padding: 20, textAlign: 'center', color: '#656d76', fontSize: 13 }}>
                                No contacts found
                            </div>
                        ) : (
                            filteredContacts.map((contact) => (
                                <div
                                    key={contact.id}
                                    onClick={() => setSelectedContact(contact)}
                                    style={{
                                        padding: '10px 14px',
                                        cursor: 'pointer',
                                        background: selectedContact?.id === contact.id ? '#f0f6ff' : 'transparent',
                                        borderLeft: selectedContact?.id === contact.id ? '3px solid #1677ff' : '3px solid transparent',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 10,
                                    }}
                                >
                                    <Avatar size={36} icon={<UserOutlined />} style={{ background: '#7F77DD', flexShrink: 0 }}>
                                        {contact.fullName.charAt(0)}
                                    </Avatar>
                                    <div style={{ minWidth: 0 }}>
                                        <div style={{ fontWeight: 500, fontSize: 13, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                            {contact.fullName}
                                        </div>
                                        {contact.branchName && (
                                            <Tag color="purple" style={{ fontSize: 10, padding: '0 4px', marginTop: 2 }}>
                                                {contact.branchName}
                                            </Tag>
                                        )}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Chat area */}
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                    {!selectedContact ? (
                        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#656d76' }}>
                            <div style={{ textAlign: 'center' }}>
                                <div style={{ fontSize: 40, marginBottom: 8 }}>💬</div>
                                <div>Select a contact to start messaging</div>
                            </div>
                        </div>
                    ) : (
                        <>
                            {/* Header */}
                            <div style={{ padding: '12px 16px', borderBottom: '1px solid #d0d7de', display: 'flex', alignItems: 'center', gap: 10 }}>
                                <Avatar size={32} icon={<UserOutlined />} style={{ background: '#7F77DD' }}>
                                    {selectedContact.fullName.charAt(0)}
                                </Avatar>
                                <div>
                                    <div style={{ fontWeight: 600, fontSize: 14 }}>{selectedContact.fullName}</div>
                                    {selectedContact.branchName && (
                                        <Tag color="purple" style={{ fontSize: 10, padding: '0 4px' }}>
                                            {selectedContact.branchName}
                                        </Tag>
                                    )}
                                </div>
                            </div>

                            {/* Messages */}
                            <div style={{ flex: 1, overflowY: 'auto', padding: '16px' }}>
                                {loadingMessages ? (
                                    <div style={{ textAlign: 'center', padding: 40 }}><Spin /></div>
                                ) : messages.length === 0 ? (
                                    <div style={{ textAlign: 'center', color: '#656d76', paddingTop: 40 }}>
                                        No messages yet. Say hello!
                                    </div>
                                ) : (
                                    messages.map((msg) => {
                                        const isOwn = msg.senderId === currentUser?.id;
                                        return (
                                            <div
                                                key={msg.id}
                                                style={{
                                                    display: 'flex',
                                                    justifyContent: isOwn ? 'flex-end' : 'flex-start',
                                                    marginBottom: 12,
                                                }}
                                            >
                                                <div style={{ maxWidth: '70%' }}>
                                                    {!isOwn && (
                                                        <div style={{ fontSize: 11, color: '#656d76', marginBottom: 2 }}>
                                                            {msg.senderName ?? selectedContact.fullName}
                                                        </div>
                                                    )}
                                                    <div
                                                        style={{
                                                            padding: '8px 12px',
                                                            borderRadius: isOwn ? '12px 12px 4px 12px' : '12px 12px 12px 4px',
                                                            background: isOwn ? '#1677ff' : '#f1f3f5',
                                                            color: isOwn ? '#fff' : '#24292f',
                                                            fontSize: 14,
                                                        }}
                                                    >
                                                        {msg.content}
                                                    </div>
                                                    <div style={{ fontSize: 10, color: '#8c959f', marginTop: 2, textAlign: isOwn ? 'right' : 'left' }}>
                                                        {formatDateTime(msg.createdAt)}
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })
                                )}
                                <div ref={endRef} />
                            </div>

                            {/* Input */}
                            <div style={{ padding: '12px 16px', borderTop: '1px solid #d0d7de', display: 'flex', gap: 8 }}>
                                <Input
                                    value={inputValue}
                                    onChange={(e) => setInputValue(e.target.value)}
                                    onPressEnter={handleSend}
                                    placeholder="Type a message..."
                                    style={{ flex: 1 }}
                                />
                                <Button
                                    type="primary"
                                    icon={<SendOutlined />}
                                    onClick={handleSend}
                                    loading={sending}
                                    disabled={!inputValue.trim()}
                                >
                                    Send
                                </Button>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}