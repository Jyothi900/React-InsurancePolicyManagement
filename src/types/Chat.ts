export interface ChatMessage {
  id: string;
  chatId: string;
  senderId: string;
  senderName: string;
  senderRole: 'customer' | 'admin';
  message: string;
  timestamp: number;
}

export interface Chat {
  id: string;
  customerId: string;
  customerName: string;
  messages: ChatMessage[];
  isActive: boolean;
  lastMessageTime: number;
  unreadCount: number;
}

export interface ChatState {
  chats: Chat[];
  activeChat: string | null;
}