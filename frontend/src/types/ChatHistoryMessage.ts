export interface ChatHistoryMessage {
  id: string;
  fromId: string;
  toId: string;
  message: string;
  timestamp: string;
}