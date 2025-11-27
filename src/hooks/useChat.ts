import { useState, useEffect, useCallback } from 'react';
import { useSelector } from 'react-redux';
import type { RootState } from '../store';
import type { Chat, ChatMessage } from '../types/Chat';


const CHAT_STORAGE_KEY = 'insurance_chats';
const CHAT_EXPIRY_DAYS = 7;

export const useChat = () => {
  const [chats, setChats] = useState<Chat[]>([]);
  const [activeChat, setActiveChat] = useState<string | null>(null);
  const { user } = useSelector((state: RootState) => state.auth);


  useEffect(() => {
    const savedChats = localStorage.getItem(CHAT_STORAGE_KEY);
    if (savedChats) {
      const parsedChats: Chat[] = JSON.parse(savedChats);
      const validChats = parsedChats.filter(chat => {
        const daysSinceLastMessage = (Date.now() - chat.lastMessageTime) / (1000 * 60 * 60 * 24);
        return daysSinceLastMessage <= CHAT_EXPIRY_DAYS;
      });
      setChats(validChats);
    }
  }, []);


  const saveChats = useCallback((updatedChats: Chat[]) => {
    localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(updatedChats));
    setChats(updatedChats);
  }, []);


  const getCurrentUserChat = useCallback((): Chat | null => {
    if (!user) return null;
    
    const savedChats = localStorage.getItem(CHAT_STORAGE_KEY);
    let allChats = chats;
    
    if (savedChats && chats.length === 0) {

      const parsedChats: Chat[] = JSON.parse(savedChats);
      allChats = parsedChats.filter(chat => {
        const daysSinceLastMessage = (Date.now() - chat.lastMessageTime) / (1000 * 60 * 60 * 24);
        return daysSinceLastMessage <= CHAT_EXPIRY_DAYS;
      });
    }
    
    let existingChat = allChats.find(chat => chat.customerId === user.id);
    
    if (!existingChat) {
      const newChat: Chat = {
        id: `chat_${user.id}_${Date.now()}`,
        customerId: user.id,
        customerName: (user as any).fullName || user.email,
        messages: [],
        isActive: true,
        lastMessageTime: Date.now(),
        unreadCount: 0
      };
      
      const updatedChats = [...allChats, newChat];
      saveChats(updatedChats);
      existingChat = newChat;
    }
    
    return existingChat;
  }, [user, chats, saveChats]);


  const sendMessage = useCallback((message: string) => {
    if (!user || !message.trim()) return;

    const currentChat = getCurrentUserChat();
    if (!currentChat) return;
    const newMessage: ChatMessage = {
      id: `msg_${Date.now()}`,
      chatId: currentChat.id,
      senderId: user.id,
      senderName: (user as any).fullName || user.email,
      senderRole: 'customer',
      message: message.trim(),
      timestamp: Date.now()
    };

    const updatedMessages = [...currentChat.messages, newMessage];

    const updatedChat: Chat = {
      id: currentChat.id,
      customerId: currentChat.customerId,
      customerName: currentChat.customerName,
      messages: updatedMessages,
      lastMessageTime: Date.now(),
      isActive: true,
      unreadCount: currentChat.unreadCount || 0
    };

    const updatedChats = chats.map(chat => 
      chat.id === currentChat?.id ? updatedChat : chat
    );
    
    if (!chats.find(chat => chat.id === currentChat?.id)) {
      updatedChats.push(updatedChat);
    }

    saveChats(updatedChats);
    setActiveChat(currentChat.id);
  }, [user, chats, getCurrentUserChat, saveChats]);

  const sendAdminReply = useCallback((chatId: string, message: string, adminName: string) => {
    if (!message.trim()) return;

    const replyMessage: ChatMessage = {
      id: `msg_${Date.now()}`,
      chatId,
      senderId: 'admin',
      senderName: adminName,
      senderRole: 'admin',
      message: message.trim(),
      timestamp: Date.now()
    };

    const updatedChats = chats.map(chat => {
      if (chat.id === chatId) {
        return {
          ...chat,
          messages: [...chat.messages, replyMessage],
          lastMessageTime: Date.now()
        };
      }
      return chat;
    });

    saveChats(updatedChats);
  }, [chats, saveChats]);

  const markChatAsRead = useCallback((chatId: string) => {
    const updatedChats = chats.map(chat => 
      chat.id === chatId ? { ...chat, unreadCount: 0 } : chat
    );
    saveChats(updatedChats);
  }, [chats, saveChats]);

  const editMessage = useCallback((chatId: string, messageId: string, newMessage: string) => {
    if (!newMessage.trim()) return;

    const updatedChats = chats.map(chat => {
      if (chat.id === chatId) {
        return {
          ...chat,
          messages: chat.messages.map(msg => 
            msg.id === messageId ? { ...msg, message: newMessage.trim() } : msg
          )
        };
      }
      return chat;
    });

    saveChats(updatedChats);
  }, [chats, saveChats]);

  const deleteMessage = useCallback((chatId: string, messageId: string) => {
    const updatedChats = chats.map(chat => {
      if (chat.id === chatId) {
        return {
          ...chat,
          messages: chat.messages.filter(msg => msg.id !== messageId)
        };
      }
      return chat;
    });

    saveChats(updatedChats);
  }, [chats, saveChats]);

  return {
    chats,
    activeChat,
    setActiveChat,
    sendMessage,
    sendAdminReply,
    markChatAsRead,
    getCurrentUserChat,
    editMessage,
    deleteMessage
  };
};