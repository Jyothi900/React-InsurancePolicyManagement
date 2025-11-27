import { AppBar, Toolbar, Typography, Button, Box, Avatar, Menu, MenuItem, IconButton, Divider } from '@mui/material';
import { Menu as MenuIcon, Chat, Close, Logout, LightMode, DarkMode } from '@mui/icons-material';
import { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import type { RootState, AppDispatch } from '../../store';
import { logout } from '../../slices/authslice';
import { tokenstore } from '../../auth/tokenstore';
import Sidebar from './Sidebar';
import AdminChatPanel from '../chat/AdminChatPanel';
import { useTheme } from '../../contexts/ThemeContext';

export default function Header() {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const { isAuthenticated, email, role } = useSelector((state: RootState) => state.auth);
  const { currentUser } = useSelector((state: RootState) => state.user);
  const { mode, toggleTheme } = useTheme();
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };
  
  const handleMenuItemClick = (callback: () => void) => {
    callback();
    handleMenuClose();
  };

  const handleLogout = () => {
    dispatch(logout());
    tokenstore.clear();
    navigate('/');
  };

  const handleProfile = () => {
    // Role-based profile navigation
    switch (role) {
      case 'Customer':
        navigate('/customer/profile');
        break;
      case 'Agent':
        navigate('/agent/profile');
        break;
      case 'Underwriter':
        navigate('/underwriter/profile');
        break;
      case 'Admin':
        navigate('/admin/profile');
        break;
      default:
        navigate('/profile');
    }
  };

  const handleOpenChat = () => {
    setShowChat(true);
  };

  return (
    <>
      <AppBar position="static" sx={{ 
        backgroundColor: '#0D1B2A',
        boxShadow: '0 4px 20px rgba(13, 27, 42, 0.3)'
      }}>
        <Toolbar>
          {isAuthenticated && role === 'Customer' && (
            <IconButton
              edge="start"
              color="inherit"
              onClick={() => setSidebarOpen(true)}
              sx={{ mr: 2 }}
            >
              <MenuIcon />
            </IconButton>
          )}
          <Typography 
            variant="h6" 
            component="div" 
            sx={{ 
              flexGrow: 1, 
              cursor: 'pointer',
              color: '#FFD700',
              fontWeight: 700,
              letterSpacing: '1px',
              textShadow: '0 2px 4px rgba(0,0,0,0.3)'
            }} 
            onClick={() => navigate('/')}
          >
            Policy Guard
          </Typography>
        
        <IconButton
          onClick={toggleTheme}
          sx={{ color: 'white', mr: 1 }}
        >
          {mode === 'light' ? <DarkMode /> : <LightMode />}
        </IconButton>
        
        {isAuthenticated ? (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Typography variant="body2" sx={{ color: '#FFFFFF', fontWeight: 500 }}>{currentUser?.fullName || email}</Typography>
            <Avatar 
              id="user-menu-button"
              aria-controls={Boolean(anchorEl) ? 'user-menu' : undefined}
              aria-haspopup="menu"
              aria-expanded={Boolean(anchorEl) ? 'true' : undefined}
              src={currentUser?.profileImagePath ? `https://localhost:7128${currentUser.profileImagePath}` : undefined}
              sx={{ cursor: 'pointer', bgcolor: 'secondary.main' }}
              onClick={handleMenuOpen}
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  handleMenuOpen(e);
                }
              }}
            >
              {(currentUser?.fullName || email)?.charAt(0).toUpperCase()}
            </Avatar>
            <Menu
              id="user-menu"
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleMenuClose}
              disableAutoFocusItem
              disableRestoreFocus
              autoFocus={false}
              keepMounted={false}
              disablePortal
              hideBackdrop
              anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'right',
              }}
              transformOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
              MenuListProps={{
                'aria-labelledby': 'user-menu-button',
                role: 'menu',
                autoFocusItem: false,
                disablePadding: false
              }}
              PaperProps={{
                sx: {
                  bgcolor: '#1B365D',
                  color: '#FFFFFF',
                  border: '1px solid #FFD700',
                  borderRadius: 2,
                  boxShadow: '0 8px 32px rgba(27, 54, 93, 0.4)',
                  minWidth: 180,
                  mt: 1,
                  '& .MuiMenuItem-root': {
                    color: '#FFFFFF',
                    fontSize: '14px',
                    py: 1.5,
                    px: 2,
                    display: 'flex',
                    alignItems: 'center',
                    '&:hover': {
                      bgcolor: '#FFD700',
                      color: '#1B365D',
                      '& .MuiSvgIcon-root': {
                        color: '#1B365D'
                      }
                    },
                    '&:focus': {
                      bgcolor: '#FFD700',
                      color: '#1B365D',
                      outline: 'none'
                    }
                  }
                },
                onKeyDown: (e: React.KeyboardEvent) => {
                  if (e.key === 'Escape') {
                    handleMenuClose();
                  }
                }
              }}
            >
              {role === 'Admin' ? [
                // Admin menu - only Customer Support and Logout
                <MenuItem key="support" onClick={() => handleMenuItemClick(handleOpenChat)} role="menuitem">
                  <Chat sx={{ mr: 1.5, fontSize: '18px' }} /> Customer Support
                </MenuItem>,
                <MenuItem key="logout" onClick={() => handleMenuItemClick(handleLogout)} role="menuitem">
                  <Logout sx={{ mr: 1.5, fontSize: '18px' }} /> Logout
                </MenuItem>
              ] : [
                // Customer/Other roles menu - Profile, Dashboard, Logout
                <MenuItem key="profile" onClick={() => handleMenuItemClick(handleProfile)} role="menuitem">
                  Profile
                </MenuItem>,
                <MenuItem key="dashboard" onClick={() => handleMenuItemClick(() => navigate('/dashboard'))} role="menuitem">
                  Dashboard
                </MenuItem>,
                <MenuItem key="logout" onClick={() => handleMenuItemClick(handleLogout)} role="menuitem">
                  <Logout sx={{ mr: 1.5, fontSize: '18px' }} /> Logout
                </MenuItem>
              ]}
            </Menu>
          </Box>
        ) : (
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button color="inherit" onClick={() => navigate('/login')}>
              Login
            </Button>
            <Button color="inherit" onClick={() => navigate('/register')}>
              Register
            </Button>
          </Box>
        )}
        </Toolbar>
      </AppBar>
      
      {role === 'Customer' && (
        <Sidebar 
          open={sidebarOpen} 
          onClose={() => setSidebarOpen(false)} 
        />
      )}

      {/* Admin Chat Modal */}
      {showChat && role === 'Admin' && (
        <Box
          sx={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            bgcolor: 'rgba(0,0,0,0.5)',
            zIndex: 1300,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <Box
            sx={{
              width: '90%',
              maxWidth: '1200px',
              height: '80%',
              bgcolor: 'white',
              borderRadius: 2,
              position: 'relative',
              overflow: 'hidden'
            }}
          >
            {/* Chat Header */}
            <Box
              sx={{
                bgcolor: '#0D1B2A',
                color: 'white',
                p: 2,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
              }}
            >
              <Typography variant="h6" fontWeight={600}>
                Customer Support Chat
              </Typography>
              <IconButton
                onClick={() => setShowChat(false)}
                sx={{ color: 'white' }}
              >
                <Close />
              </IconButton>
            </Box>
            
            {/* Chat Panel */}
            <Box sx={{ height: 'calc(100% - 64px)' }}>
              <AdminChatPanel />
            </Box>
          </Box>
        </Box>
      )}
    </>
  );
}
