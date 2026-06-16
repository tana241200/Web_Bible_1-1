export interface MessageRecord {
    id: string;
    conversationId: string;
    senderId: string;
    senderName?: string;
    content: string;
    emailSent: boolean;
    createdAt: string;
}

export interface MessageInput {
    courseId: string;
    fromId: string;
    toId: string;
    content: string;
}

export interface ConversationThreadResponse {
    conversationId: string | null;
    messages: MessageRecord[];
}