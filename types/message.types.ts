// types/message.types.ts

export interface MessageRecord {
    id: string;
    conversationId: string;
    senderId: string;
    senderName?: string;
    content: string;
    /** is_read flag (migration v2 replaced email_sent with is_read) */
    isRead: boolean;
    createdAt: string;
}

export interface MessageInput {
    fromId: string;
    toId: string;
    content: string;
    // courseId was removed when migration v2 dropped course_id from conversations
}

export interface ConversationThreadResponse {
    conversationId: string | null;
    messages: MessageRecord[];
}
