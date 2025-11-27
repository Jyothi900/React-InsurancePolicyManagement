import { useEffect, useState } from 'react';
import { 
  Container, 
  Typography, 
  Box, 
  Button, 
  Card,
  CardContent,
  Avatar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Chip
} from '@mui/material';

import {  PersonAdd,  Search, Dashboard, Assignment } from '@mui/icons-material';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import type { RootState, AppDispatch } from '../../store';
import { fetchAllUsers, registerUser } from '../../slices/userSlice';
import { fetchAllEnums } from '../../slices/enumSlice';
import { userApi } from '../../api/user.api';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import UserTabs from '../../components/admin/UserTabs';
import { type User, type Gender, type UserRole } from '../../types/User';
import defaultMaleProfile from '../../assets/default-male-user-profile-icon.jpg';
import defaultFemaleProfile from '../../assets/default-female-user-profile-icon.jpg';

export default function UserManagement() {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { users, loading } = useSelector((state: RootState) => state.user);
  const { userRoles, genders, kycStatuses, loading: enumLoading } = useSelector((state: RootState) => state.enum);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    mobile: '',
    dateOfBirth: '',
    gender: 0 as Gender,
    address: '',
    role: 0 as UserRole
  });
  const [error, setError] = useState('');
  const [roleFilter, setRoleFilter] = useState<string | null>('Customer');
  const [searchQuery, setSearchQuery] = useState('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [deleteError, setDeleteError] = useState('');
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [userToAssign, setUserToAssign] = useState<User | null>(null);
  const [agents, setAgents] = useState<User[]>([]);
  const [underwriters, setUnderwriters] = useState<User[]>([]);
  const [selectedAgentId, setSelectedAgentId] = useState('');
  const [selectedUnderwriterId, setSelectedUnderwriterId] = useState('');
  const [assignError, setAssignError] = useState('');

  useEffect(() => {
    void dispatch(fetchAllUsers());
    void dispatch(fetchAllEnums());
  }, [dispatch]);

  const getProfileImage = (user: User) => {
    if (user.profileImagePath && user.profileImagePath.trim() !== '') {
      const cleanPath = user.profileImagePath.startsWith('/') ? user.profileImagePath.substring(1) : user.profileImagePath;
      return `https://localhost:7128/${cleanPath}`;
    }
    return user.gender === 1 ? defaultFemaleProfile : defaultMaleProfile;
  };

  const getRoleName = (role: number) => {
    const roleEnum = userRoles.find(r => r.value === role);
    return roleEnum?.name || 'Unknown';
  };

  const getKYCStatusName = (status: number) => {
    const statusEnum = kycStatuses.find(s => s.value === status);
    return statusEnum?.name || 'Unknown';
  };

  const getStatusColor = (status: number) => {
    switch (status) {
      case 1: return 'success'; // Verified
      case 2: return 'error'; // Rejected
      case 0: return 'warning'; // Pending
      default: return 'default';
    }
  };

  const handleViewProfile = (user: User) => {
    navigate(`/admin/user-profile/${user.userId}`);
  };

  const handleDeleteUser = (user: User) => {
    setUserToDelete(user);
    setDeleteDialogOpen(true);
  };

  const handleAssignUser = async (user: User) => {
    setUserToAssign(user);
    setSelectedAgentId(user.assignedAgentId || '');
    setSelectedUnderwriterId(user.assignedUnderwriterId || '');
    setAssignError('');
    
    try {
      const [agentsData, underwritersData] = await Promise.all([
        userApi.getAgents(),
        userApi.getUnderwriters()
      ]);
      setAgents(agentsData);
      setUnderwriters(underwritersData);
      setAssignDialogOpen(true);
    } catch (error: any) {
      setAssignError('Failed to load agents and underwriters');
    }
  };

  const handleAssignSubmit = async () => {
    if (!userToAssign || !selectedAgentId) {
      setAssignError('Please select an agent');
      return;
    }
    
    try {
      await userApi.assignAgent(userToAssign.userId, selectedAgentId, selectedUnderwriterId || undefined);
      await dispatch(fetchAllUsers());
      setAssignDialogOpen(false);
      setUserToAssign(null);
      setSelectedAgentId('');
      setSelectedUnderwriterId('');
      setAssignError('');
    } catch (error: any) {
      setAssignError('Failed to assign: ' + (error.message || 'Unknown error'));
    }
  };

  const confirmDeleteUser = async () => {
    if (!userToDelete) return;
    
    try {
      await userApi.deleteUser(userToDelete.userId);
      await dispatch(fetchAllUsers());
      setDeleteDialogOpen(false);
      setUserToDelete(null);
      setDeleteError('');
    } catch (error: any) {
      setDeleteError('Failed to delete user: ' + (error.message || 'Unknown error'));
    }
  };

  const handleAddUser = () => {
    setFormData({
      fullName: '',
      email: '',
      password: '',
      mobile: '',
      dateOfBirth: '',
      gender: 0 as Gender,
      address: '',
      role: 0 as UserRole
    });
    setError('');
    setAddDialogOpen(true);
  };

  const handleAddSubmit = async () => {
    try {
      setError('');
      await dispatch(registerUser({
        fullName: formData.fullName,
        email: formData.email,
        password: formData.password,
        mobile: formData.mobile,
        dateOfBirth: formData.dateOfBirth,
        gender: formData.gender,
        address: formData.address,
        role: formData.role
      }));
      
      await dispatch(fetchAllUsers());
      setAddDialogOpen(false);
    } catch (error: any) {
      setError(error.message || 'Failed to create user');
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesRole = roleFilter ? getRoleName(user.role) === roleFilter : true;
    const matchesSearch = searchQuery ? 
      user.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.mobile.includes(searchQuery) ||
      user.userId.toLowerCase().includes(searchQuery.toLowerCase())
      : true;
    return matchesRole && matchesSearch;
  });

  if (loading || enumLoading) {
    return <LoadingSpinner message="Loading users..." />;
  }

  return (
    <Container maxWidth={false} sx={{ px: 3 }}>
      <Box py={4}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
          <Typography variant="h4" component="h1">
            User Management
          </Typography>
          <Box display="flex" gap={2} alignItems="center">
            <Button 
              variant="outlined" 
              startIcon={<Dashboard />}
              onClick={() => navigate('/admin/dashboard')}
              sx={{ height: 'fit-content' }}
            >
              Dashboard
            </Button>
            <TextField
              placeholder="Search by name, email, mobile, or user ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              InputProps={{
                startAdornment: <Search sx={{ mr: 1, color: 'text.secondary' }} />
              }}
              sx={{ width: 300 }}
              size="small"
            />
            <Button 
              variant="contained" 
              startIcon={<PersonAdd />}
              onClick={handleAddUser}
            >
              Add User
            </Button>
          </Box>
        </Box>

        <UserTabs users={users} onFilterChange={setRoleFilter} getRoleName={getRoleName} />

        <Box sx={{ 
          display: 'grid', 
          gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: '1fr 1fr', lg: 'repeat(4, 1fr)' }, 
          gap: 2, 
          mt: 2 
        }}>
          {filteredUsers.map((user) => (
            <Card key={user.userId} sx={{ minHeight: '160px', display: 'flex', flexDirection: 'column' }}>
              <CardContent sx={{ flexGrow: 1, p: 2 }}>
                <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start', justifyContent: 'space-between' }}>
                  <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start', flex: 1 }}>
                    <Avatar
                      src={getProfileImage(user)}
                      sx={{ width: 50, height: 50, flexShrink: 0 }}
                    />
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography variant="h6" gutterBottom sx={{ fontSize: '1rem' }}>
                        {user.fullName}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" gutterBottom sx={{ fontSize: '0.8rem' }}>
                        {user.email}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" gutterBottom sx={{ fontSize: '0.8rem' }}>
                        {user.mobile}
                      </Typography>
                      
                      <Box sx={{ mt: 1, mb: 1 }}>
                        <Chip 
                          label={getKYCStatusName(user.kycStatus)} 
                          color={getStatusColor(user.kycStatus)} 
                          size="small" 
                          sx={{ mr: 0.5, fontSize: '0.7rem', height: '20px' }}
                        />
                        <Chip 
                          label={user.isActive ? 'Active' : 'Inactive'} 
                          color={user.isActive ? 'success' : 'default'} 
                          size="small" 
                          sx={{ fontSize: '0.7rem', height: '20px' }}
                        />
                      </Box>
                    </Box>
                  </Box>
                  
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, alignItems: 'flex-end' }}>
                    <Button 
                      size="small" 
                      variant="outlined"
                      color="primary"
                      onClick={() => handleViewProfile(user)}
                      sx={{ fontSize: '0.7rem', minWidth: '60px', py: 0.5 }}
                    >
                      View
                    </Button>
                    {getRoleName(user.role) === 'Customer' && (
                      <Button 
                        size="small" 
                        variant="outlined"
                        color="secondary"
                        onClick={() => handleAssignUser(user)}
                        sx={{ fontSize: '0.7rem', minWidth: '60px', py: 0.5 }}
                      >
                        Assign
                      </Button>
                    )}
                    <Button 
                      size="small" 
                      variant="outlined"
                      color="error"
                      onClick={() => handleDeleteUser(user)}
                      sx={{ fontSize: '0.7rem', minWidth: '60px', py: 0.5 }}
                    >
                      Delete
                    </Button>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          ))}
        </Box>
      </Box>

      {/* Add User Dialog */}
      <Dialog open={addDialogOpen} onClose={() => setAddDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add New User</DialogTitle>
        <DialogContent>
          <Box display="flex" flexDirection="column" gap={2} mt={2}>
            {error && <Alert severity="error">{error}</Alert>}
            
            <TextField
              fullWidth
              label="Full Name"
              value={formData.fullName}
              onChange={(e) => setFormData({...formData, fullName: e.target.value})}
            />
            
            <TextField
              fullWidth
              label="Email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
            />
            
            <TextField
              fullWidth
              label="Password"
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({...formData, password: e.target.value})}
            />
            
            <TextField
              fullWidth
              label="Mobile"
              value={formData.mobile}
              onChange={(e) => setFormData({...formData, mobile: e.target.value})}
            />
            
            <TextField
              fullWidth
              label="Date of Birth"
              type="date"
              value={formData.dateOfBirth}
              onChange={(e) => setFormData({...formData, dateOfBirth: e.target.value})}
              InputLabelProps={{ shrink: true }}
            />
            
            <FormControl fullWidth>
              <InputLabel>Gender</InputLabel>
              <Select
                value={formData.gender}
                onChange={(e) => setFormData({...formData, gender: e.target.value as Gender})}
                label="Gender"
              >
                {genders.map((gender) => (
                  <MenuItem key={gender.value} value={gender.value}>
                    {gender.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            
            <TextField
              fullWidth
              label="Address"
              multiline
              rows={2}
              value={formData.address}
              onChange={(e) => setFormData({...formData, address: e.target.value})}
            />
            
            <FormControl fullWidth>
              <InputLabel>Role</InputLabel>
              <Select
                value={formData.role}
                onChange={(e) => setFormData({...formData, role: e.target.value as UserRole})}
                label="Role"
              >
                {userRoles.map((role) => (
                  <MenuItem key={role.value} value={role.value}>
                    {role.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAddDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleAddSubmit}>Add User</Button>
        </DialogActions>
      </Dialog>

      {/* Assignment Dialog */}
      <Dialog open={assignDialogOpen} onClose={() => setAssignDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Assignment />
          Assign Agent & Underwriter
        </DialogTitle>
        <DialogContent>
          <Box display="flex" flexDirection="column" gap={2} mt={2}>
            {assignError && <Alert severity="error">{assignError}</Alert>}
            
            <Typography variant="body2" color="text.secondary">
              Assigning for: <strong>{userToAssign?.fullName}</strong>
            </Typography>
            
            <FormControl fullWidth required>
              <InputLabel>Select Agent</InputLabel>
              <Select
                value={selectedAgentId}
                onChange={(e) => setSelectedAgentId(e.target.value)}
                label="Select Agent"
              >
                {agents.map((agent) => (
                  <MenuItem key={agent.userId} value={agent.userId}>
                    {agent.fullName} ({agent.email})
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            
            <FormControl fullWidth>
              <InputLabel>Select Underwriter (Optional)</InputLabel>
              <Select
                value={selectedUnderwriterId}
                onChange={(e) => setSelectedUnderwriterId(e.target.value)}
                label="Select Underwriter (Optional)"
              >
                <MenuItem value="">
                  <em>None</em>
                </MenuItem>
                {underwriters.map((underwriter) => (
                  <MenuItem key={underwriter.userId} value={underwriter.userId}>
                    {underwriter.fullName} ({underwriter.email})
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            
            {userToAssign?.assignedAgentId && (
              <Alert severity="info">
                Current assignments will be updated.
              </Alert>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => {
            setAssignDialogOpen(false);
            setUserToAssign(null);
            setSelectedAgentId('');
            setSelectedUnderwriterId('');
            setAssignError('');
          }}>Cancel</Button>
          <Button variant="contained" onClick={handleAssignSubmit}>
            Assign
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          {deleteError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {deleteError}
            </Alert>
          )}
          <Typography>
            Are you sure you want to delete user <strong>{userToDelete?.fullName}</strong>?
            This action will deactivate the user account.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => {
            setDeleteDialogOpen(false);
            setUserToDelete(null);
            setDeleteError('');
          }}>Cancel</Button>
          <Button 
            variant="contained" 
            color="error" 
            onClick={confirmDeleteUser}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}