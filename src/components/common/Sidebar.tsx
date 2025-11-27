import { Drawer, List, ListItem, ListItemIcon, ListItemText } from '@mui/material';
import { Dashboard, Policy, Assignment, Payment, People } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import type { RootState } from '../../store';


interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

export default function Sidebar({ open, onClose }: SidebarProps) {
  const navigate = useNavigate();
  const { user } = useSelector((state: RootState) => state.auth);

  const customerMenuItems = [
    { text: 'Dashboard', icon: <Dashboard />, path: '/dashboard' },
    { text: 'Proposals', icon: <Assignment />, path: '/proposals' },
    { text: 'My Policies', icon: <Policy />, path: '/policies' },
    { text: 'Claims', icon: <Assignment />, path: '/claims' },
    { text: 'Payments', icon: <Payment />, path: '/payments' }
  ];

  const adminMenuItems = [
    { text: 'Dashboard', icon: <Dashboard />, path: '/admin' },
    { text: 'Users', icon: <People />, path: '/admin/users' },
    { text: 'Products', icon: <Policy />, path: '/admin/products' }
  ];

  const menuItems = user?.role === 'Admin' ? adminMenuItems : customerMenuItems;

  const handleNavigation = (path: string) => {
    navigate(path);
    onClose();
  };

  return (
    <Drawer 
      anchor="left" 
      open={open} 
      onClose={onClose}
      ModalProps={{
        keepMounted: false,
        disableAutoFocus: false,
        disableRestoreFocus: false
      }}
      PaperProps={{
        sx: {
          bgcolor: '#1B365D',
          color: 'white'
        }
      }}
    >
      <List sx={{ width: 250, pt: 2 }} role="navigation" aria-label="Main navigation">
        {menuItems.map((item) => (
          <ListItem 
            component="button" 
            key={item.text} 
            onClick={() => handleNavigation(item.path)} 
            sx={{ 
              cursor: 'pointer',
              border: 'none',
              background: 'none',
              width: '100%',
              textAlign: 'left',
              color: 'white',
              mx: 1,
              borderRadius: 1,
              '&:hover': {
                bgcolor: '#FFD700',
                color: '#1B365D',
                '& .MuiListItemIcon-root': {
                  color: '#1B365D'
                }
              }
            }}
            role="menuitem"
            tabIndex={0}
          >
            <ListItemIcon sx={{ color: 'white', minWidth: 40 }}>{item.icon}</ListItemIcon>
            <ListItemText primary={item.text} sx={{ '& .MuiTypography-root': { fontWeight: 500 } }} />
          </ListItem>
        ))}
      </List>
    </Drawer>
  );
}
