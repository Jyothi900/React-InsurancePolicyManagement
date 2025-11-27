import { useState, useRef, useEffect } from 'react';
import { Box, Paper, Typography, TextField, IconButton, Avatar, List, ListItem, ListItemText, ListItemAvatar, Badge, Menu, MenuItem } from '@mui/material';
import { Send, Person, SupportAgent, Chat, Edit, Delete, Check, Cancel, MoreVert } from '@mui/icons-material';
import { useSelector } from 'react-redux';
import type { RootState } from '../../store';
import { useChat } from '../../hooks/useChat';

export default function AdminChatPanel() {
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
  const [replyMessage, setReplyMessage] = useState('');
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [editMessage, setEditMessage] = useState('');
  const [menuAnchor, setMenuAnchor] = useState<{ [key: string]: HTMLElement | null }>({});
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const markedAsReadRef = useRef<Set<string>>(new Set());
  const { user } = useSelector((state: RootState) => state.auth);
  const { chats, sendAdminReply, markChatAsRead, editMessage: updateMessage, deleteMessage } = useChat();

  const selectedChat = chats.find(chat => chat.id === selectedChatId);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (selectedChat) {
      scrollToBottom();
      
      if (!markedAsReadRef.current.has(selectedChat.id)) {
        markChatAsRead(selectedChat.id);
        markedAsReadRef.current.add(selectedChat.id);
      }
    }
  }, [selectedChat?.messages]);

  
  useEffect(() => {
    if (selectedChatId) {
      markedAsReadRef.current.clear();
    }
  }, [selectedChatId]);

  const handleSendReply = () => {
    if (replyMessage.trim() && selectedChatId && user) {
      sendAdminReply(selectedChatId, replyMessage, user.email || 'Admin');
      setReplyMessage('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendReply();
    }
  };

  const handleEditMessage = (messageId: string, currentMessage: string) => {
    setEditingMessageId(messageId);
    setEditMessage(currentMessage);
  };

  const handleSaveEdit = () => {
    if (editMessage.trim() && editingMessageId && selectedChatId) {
      updateMessage(selectedChatId, editingMessageId, editMessage);
      setEditingMessageId(null);
      setEditMessage('');
    }
  };

  const handleCancelEdit = () => {
    setEditingMessageId(null);
    setEditMessage('');
  };

  const handleDeleteMessage = (messageId: string) => {
    if (selectedChatId) {
      deleteMessage(selectedChatId, messageId);
    }
  };

  const handleMenuOpen = (messageId: string, event: React.MouseEvent<HTMLElement>) => {
    setMenuAnchor({ ...menuAnchor, [messageId]: event.currentTarget });
  };

  const handleMenuClose = (messageId: string) => {
    setMenuAnchor({ ...menuAnchor, [messageId]: null });
  };

  const handleEditFromMenu = (messageId: string, currentMessage: string) => {
    handleEditMessage(messageId, currentMessage);
    handleMenuClose(messageId);
  };

  const handleDeleteFromMenu = (messageId: string) => {
    handleDeleteMessage(messageId);
    handleMenuClose(messageId);
  };

  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString();
  };

  return (
    <Box sx={{ display: 'flex', height: '100%', bgcolor: '#f8f9fa', overflow: 'hidden' }}>
      {/* Chat List */}
      <Paper sx={{ width: 350, display: 'flex', flexDirection: 'column', borderRadius: 0 }}>
        <Box sx={{ p: 2, bgcolor: '#1B365D', color: 'white' }}>
          <Typography variant="h6" fontWeight={600}>
            Customer Chats
          </Typography>
          <Typography variant="caption">
            {chats.length} active conversations
          </Typography>
        </Box>
        
        <List sx={{ flex: 1, overflow: 'auto', p: 0 }}>
          {chats.length === 0 ? (
            <Box sx={{ p: 4, textAlign: 'center' }}>
              <Chat sx={{ fontSize: 48, color: '#ccc', mb: 2 }} />
              <Typography variant="h6" color="text.secondary" gutterBottom>
                No Customer Chats
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Customer messages will appear here
              </Typography>
            </Box>
          ) : (
            chats
              .sort((a, b) => b.lastMessageTime - a.lastMessageTime)
              .map((chat) => (
                <ListItem
                  key={chat.id}
                  onClick={() => setSelectedChatId(chat.id)}
                  sx={{
                    borderBottom: '1px solid #e0e0e0',
                    cursor: 'pointer',
                    bgcolor: selectedChatId === chat.id ? '#e3f2fd' : 'transparent',
                    '&:hover': { bgcolor: '#f5f5f5' }
                  }}
                >
                  <ListItemAvatar>
                    <Badge badgeContent={chat.unreadCount} color="error">
                      <Avatar sx={{ bgcolor: '#FFD700', color: '#1B365D' }}>
                        <Person />
                      </Avatar>
                    </Badge>
                  </ListItemAvatar>
                  <ListItemText
                    primary={chat.customerName}
                    secondary={
                      <>
                        <Typography variant="caption" display="block">
                          {chat.messages[chat.messages.length - 1]?.message.substring(0, 50)}...
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {formatDate(chat.lastMessageTime)}
                        </Typography>
                      </>
                    }
                  />
                </ListItem>
              ))
          )}
        </List>
      </Paper>

      {/* Chat Messages */}
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {selectedChat ? (
          <>
            {/* Chat Header */}
            <Box sx={{ p: 2, bgcolor: 'white', borderBottom: '1px solid #e0e0e0' }}>
              <Typography variant="h6" color="#1B365D">
                {selectedChat.customerName}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Customer ID: {selectedChat.customerId}
              </Typography>
            </Box>

            {/* Messages */}
            <Box sx={{ flex: 1, p: 2, overflowY: 'auto', bgcolor: '#f8f9fa' }}>
              {selectedChat.messages.map((msg) => (
                <Box
                  key={msg.id}
                  sx={{
                    display: 'flex',
                    justifyContent: msg.senderRole === 'admin' ? 'flex-end' : 'flex-start',
                    mb: 2
                  }}
                >
                  <Box
                    sx={{
                      maxWidth: '70%',
                      p: 2,
                      borderRadius: '12px',
                      bgcolor: msg.senderRole === 'admin' ? '#1B365D' : 'white',
                      color: msg.senderRole === 'admin' ? '#FFFFFF' : '#333',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <Avatar sx={{ width: 24, height: 24, bgcolor: msg.senderRole === 'admin' ? '#FFD700' : '#1B365D' }}>
                        {msg.senderRole === 'admin' ? <SupportAgent fontSize="small" /> : <Person fontSize="small" />}
                      </Avatar>
                      <Typography variant="caption" fontWeight={600}>
                        {msg.senderName}
                      </Typography>
                    </Box>

                    {editingMessageId === msg.id ? (
                      <Box>
                        <TextField
                          fullWidth
                          multiline
                          value={editMessage}
                          onChange={(e) => setEditMessage(e.target.value)}
                          size="small"
                          sx={{
                            mb: 1,
                            '& .MuiOutlinedInput-root': {
                              color: msg.senderRole === 'admin' ? '#FFFFFF' : '#333',
                              '& fieldset': { borderColor: 'rgba(255,255,255,0.3)' }
                            }
                          }}
                        />
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          <IconButton size="small" onClick={handleSaveEdit} sx={{ color: msg.senderRole === 'admin' ? '#FFFFFF' : '#333' }}>
                            <Check fontSize="small" />
                          </IconButton>
                          <IconButton size="small" onClick={handleCancelEdit} sx={{ color: msg.senderRole === 'admin' ? '#FFFFFF' : '#333' }}>
                            <Cancel fontSize="small" />
                          </IconButton>
                        </Box>
                      </Box>
                    ) : (
                      <>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                          <Typography variant="body2" sx={{ mb: 1, whiteSpace: 'pre-wrap', color: msg.senderRole === 'admin' ? '#FFFFFF' : '#333', fontWeight: 500, flex: 1 }}>
                            {msg.message.replace(/&#39;/g, "'").replace(/&quot;/g, '"').replace(/&amp;/g, '&')}
                          </Typography>
                          {msg.senderRole === 'admin' && (
                            <>
                              <IconButton 
                                size="small" 
                                onClick={(e) => handleMenuOpen(msg.id, e)}
                                sx={{ color: msg.senderRole === 'admin' ? '#FFFFFF' : '#333', ml: 1 }}
                              >
                                <MoreVert fontSize="small" />
                              </IconButton>
                              <Menu
                                anchorEl={menuAnchor[msg.id]}
                                open={Boolean(menuAnchor[msg.id])}
                                onClose={() => handleMenuClose(msg.id)}
                                PaperProps={{
                                  sx: { 
                                    bgcolor: '#1B365D', 
                                    color: '#FFFFFF',
                                    '& .MuiMenuItem-root': {
                                      color: '#FFFFFF',
                                      '&:hover': {
                                        bgcolor: 'rgba(255, 255, 255, 0.1)'
                                      }
                                    }
                                  }
                                }}
                              >
                                <MenuItem onClick={() => handleEditFromMenu(msg.id, msg.message)} sx={{ color: '#FFFFFF' }}>
                                  <Edit fontSize="small" sx={{ mr: 1, color: '#FFFFFF' }} /> Edit
                                </MenuItem>
                                <MenuItem onClick={() => handleDeleteFromMenu(msg.id)} sx={{ color: '#FFFFFF' }}>
                                  <Delete fontSize="small" sx={{ mr: 1, color: '#FFFFFF' }} /> Delete
                                </MenuItem>
                              </Menu>
                            </>
                          )}
                        </Box>
                        <Typography variant="caption" sx={{ opacity: 0.9, color: msg.senderRole === 'admin' ? '#FFFFFF' : '#666' }}>
                          {formatTime(msg.timestamp)}
                        </Typography>
                      </>
                    )}
                  </Box>
                </Box>
              ))}
              <div ref={messagesEndRef} />
            </Box>

            {/* Reply Input */}
            <Box sx={{ p: 2, bgcolor: 'white', borderTop: '1px solid #e0e0e0' }}>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <TextField
                  fullWidth
                  size="small"
                  placeholder="Type your reply..."
                  value={replyMessage}
                  onChange={(e) => setReplyMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  multiline
                  maxRows={3}
                />
                <IconButton
                  onClick={handleSendReply}
                  disabled={!replyMessage.trim()}
                  sx={{
                    bgcolor: '#1B365D',
                    color: 'white',
                    '&:hover': { bgcolor: '#0F2A47' },
                    '&:disabled': { bgcolor: '#ccc' }
                  }}
                >
                  <Send />
                </IconButton>
              </Box>
            </Box>
          </>
        ) : (
          <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: 'white' }}>
            <Box sx={{ textAlign: 'center', p: 4 }}>
              <SupportAgent sx={{ fontSize: 64, color: '#1B365D', mb: 2 }} />
              <Typography variant="h5" color="#1B365D" gutterBottom fontWeight={600}>
                Customer Support Chat
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Select a customer chat from the left panel to start conversation
              </Typography>
            </Box>
          </Box>
        )}
      </Box>
    </Box>
  );
}