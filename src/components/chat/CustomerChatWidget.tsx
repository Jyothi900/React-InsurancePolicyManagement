import { useState, useRef, useEffect } from 'react';
import { Box, Fab, Paper, Typography, TextField, IconButton, Avatar , Menu, MenuItem } from '@mui/material';
import { Chat, Send, Close, SupportAgent, Edit, Check, Cancel, MoreVert } from '@mui/icons-material';
import { useSelector } from 'react-redux';
import type { RootState } from '../../store';
import { useChat } from '../../hooks/useChat';

export default function CustomerChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [editMessage, setEditMessage] = useState('');
  const [menuAnchor, setMenuAnchor] = useState<{ [key: string]: HTMLElement | null }>({});

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { user, isAuthenticated } = useSelector((state: RootState) => state.auth);
  const { sendMessage, getCurrentUserChat, editMessage: updateMessage } = useChat();

  const currentChat = getCurrentUserChat();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen && currentChat) {
      scrollToBottom();
    }
  }, [currentChat?.messages, isOpen]);

  if (!isAuthenticated || user?.role !== 'Customer' || !currentChat) {
    return null;
  }



  const handleSendMessage = () => {
    if (message.trim()) {
      sendMessage(message);
      setMessage('');
    }
  };

  const handleEditMessage = (messageId: string, currentMessage: string) => {
    setEditingMessageId(messageId);
    setEditMessage(currentMessage);
  };

  const handleSaveEdit = () => {
    if (editMessage.trim() && editingMessageId) {
      updateMessage(currentChat.id, editingMessageId, editMessage);
      setEditingMessageId(null);
      setEditMessage('');
    }
  };

  const handleCancelEdit = () => {
    setEditingMessageId(null);
    setEditMessage('');
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

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <>
      {/* Chat Window */}
      {isOpen && (
        <Paper
          elevation={8}
          sx={{
            position: 'fixed',
            bottom: 100,
            right: 20,
            width: 350,
            height: 500,
            zIndex: 1300,
            display: 'flex',
            flexDirection: 'column',
            borderRadius: '16px',
            overflow: 'hidden'
          }}
        >
          {/* Header */}
          <Box
            sx={{
              bgcolor: '#1B365D',
              color: 'white',
              p: 2,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Avatar sx={{ bgcolor: '#FFD700', color: '#1B365D', width: 32, height: 32 }}>
                <SupportAgent fontSize="small" />
              </Avatar>
              <Box>
                <Typography variant="subtitle2" fontWeight={600}>
                  Customer Support
                </Typography>
                <Typography variant="caption" sx={{ opacity: 0.8 }}>
                  We're here to help
                </Typography>
              </Box>
            </Box>
            <IconButton size="small" onClick={() => setIsOpen(false)} sx={{ color: 'white' }}>
              <Close />
            </IconButton>
          </Box>

          {/* Messages */}
          <Box
            sx={{
              flex: 1,
              p: 1,
              overflowY: 'auto',
              bgcolor: '#f8f9fa'
            }}
          >
            {currentChat.messages.map((msg) => (
              <Box
                key={msg.id}
                sx={{
                  display: 'flex',
                  justifyContent: msg.senderRole === 'customer' ? 'flex-end' : 'flex-start',
                  mb: 1
                }}
              >
                <Box
                  sx={{
                    maxWidth: '80%',
                    p: 1.5,
                    borderRadius: '12px',
                    bgcolor: msg.senderRole === 'customer' ? '#1B365D' : 'white',
                    color: msg.senderRole === 'customer' ? '#FFFFFF' : '#333',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                    position: 'relative'
                  }}
                >
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
                            color: msg.senderRole === 'customer' ? '#FFFFFF' : '#333',
                            '& fieldset': { borderColor: 'rgba(255,255,255,0.3)' }
                          }
                        }}
                      />
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <IconButton size="small" onClick={handleSaveEdit} sx={{ color: msg.senderRole === 'customer' ? '#FFFFFF' : '#333' }}>
                          <Check fontSize="small" />
                        </IconButton>
                        <IconButton size="small" onClick={handleCancelEdit} sx={{ color: msg.senderRole === 'customer' ? '#FFFFFF' : '#333' }}>
                          <Cancel fontSize="small" />
                        </IconButton>
                      </Box>
                    </Box>
                  ) : (
                    <>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <Typography variant="body2" sx={{ mb: 0.5, whiteSpace: 'pre-wrap', color: msg.senderRole === 'customer' ? '#FFFFFF' : '#333', fontWeight: 500, flex: 1 }}>
                          {msg.message.replace(/&#39;/g, "'").replace(/&quot;/g, '"').replace(/&amp;/g, '&')}
                        </Typography>
                        {msg.senderRole === 'customer' && (
                          <>
                            <IconButton 
                              size="small" 
                              onClick={(e) => handleMenuOpen(msg.id, e)}
                              sx={{ color: msg.senderRole === 'customer' ? '#FFFFFF' : '#333', ml: 1 }}
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
                            </Menu>
                          </>
                        )}
                      </Box>
                      <Typography variant="caption" sx={{ opacity: 0.9, fontSize: '10px', color: msg.senderRole === 'customer' ? '#FFFFFF' : '#666' }}>
                        {formatTime(msg.timestamp)}
                      </Typography>
                    </>
                  )}
                </Box>
              </Box>
            ))}
            <div ref={messagesEndRef} />
          </Box>

          {/* Input */}
          <Box sx={{ p: 2, bgcolor: 'white', borderTop: '1px solid #e0e0e0' }}>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <TextField
                fullWidth
                size="small"
                placeholder="Type your message..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                multiline
                maxRows={3}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '20px'
                  }
                }}
              />
              <IconButton
                onClick={handleSendMessage}
                disabled={!message.trim()}
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
        </Paper>
      )}

     
      <Fab
        color="primary"
        onClick={() => setIsOpen(!isOpen)}
        sx={{
          position: 'fixed',
          bottom: 20,
          right: 20,
          zIndex: 1300,
          bgcolor: '#1B365D',
          '&:hover': { bgcolor: '#0F2A47' }
        }}
      >
        <Chat />
      </Fab>
    </>
  );
}