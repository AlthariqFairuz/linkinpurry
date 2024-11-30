export interface ChatMessage {
    id: string;
    fromId?: string;
    toId?: string;
    sender: string;
    content: string;
    timestamp: string;
    isMe: boolean;
    read: boolean;
    readAt: Date | null;
  }