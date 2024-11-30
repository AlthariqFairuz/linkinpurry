export interface ChatMessage {
    fromId: string;
    toId: string;
    message: string;
    timestamp?: Date;  // timestamp msut be optional since it's set server-side
    read: boolean;
}