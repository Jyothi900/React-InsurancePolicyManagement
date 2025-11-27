import { Container, Typography, Box, Card, CardContent, Avatar, Chip, Button } from '@mui/material';
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import type { RootState, AppDispatch } from '../../store';
import { fetchAgentDashboard } from '../../slices/dashboardSlice';
import defaultMaleProfile from '../../assets/default-male-user-profile-icon.jpg';
import defaultFemaleProfile from '../../assets/default-female-user-profile-icon.jpg';

export default function AgentDashboard() {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { user } = useSelector((state: RootState) => state.auth);
  const { agentData, loading } = useSelector((state: RootState) => state.dashboard);

  useEffect(() => {
    if (user?.id) {
      dispatch(fetchAgentDashboard(user.id));
    }
  }, [dispatch, user?.id]);

  const getProfileImage = (customer: any) => {
    if (customer.profileImagePath && customer.profileImagePath.trim() !== '') {
      const cleanPath = customer.profileImagePath.startsWith('/') ? customer.profileImagePath.substring(1) : customer.profileImagePath;
      return `https://localhost:7128/${cleanPath}`;
    }
    return customer.gender === 1 ? defaultFemaleProfile : defaultMaleProfile;
  };

  const getKYCStatusName = (status: number) => {
    switch (status) {
      case 0: return 'Pending';
      case 1: return 'Verified';
      case 2: return 'Rejected';
      default: return 'Unknown';
    }
  };

  const getStatusColor = (status: number) => {
    switch (status) {
      case 1: return 'success';
      case 2: return 'error';
      case 0: return 'warning';
      default: return 'default';
    }
  };

  if (loading) {
    return (
      <Container maxWidth="lg">
        <Box py={4}>
          <Typography>Loading dashboard...</Typography>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box py={4}>
        <Typography variant="h4" gutterBottom>
          Agent Dashboard
        </Typography>
        <Typography variant="subtitle1" color="text.secondary" mb={4}>
          Welcome back, {user?.email || 'Agent'}
        </Typography>
        
        <Typography variant="h6" gutterBottom>
          Assigned Customers ({agentData?.assignedCustomers?.length || 0})
        </Typography>
        
        <Box sx={{ 
          display: 'grid', 
          gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: '1fr 1fr', lg: 'repeat(4, 1fr)' }, 
          gap: 2, 
          mt: 2 
        }}>
          {agentData?.assignedCustomers && agentData.assignedCustomers.length > 0 ? (
            agentData.assignedCustomers.map((customer: any) => (
              <Card key={customer.userId} sx={{ minHeight: '160px', display: 'flex', flexDirection: 'column' }}>
                <CardContent sx={{ flexGrow: 1, p: 2 }}>
                  <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start', justifyContent: 'space-between' }}>
                    <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start', flex: 1 }}>
                      <Avatar
                        src={getProfileImage(customer)}
                        sx={{ width: 50, height: 50, flexShrink: 0 }}
                      />
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography variant="h6" gutterBottom sx={{ fontSize: '1rem' }}>
                          {customer.fullName}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" gutterBottom sx={{ fontSize: '0.8rem' }}>
                          {customer.email}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" gutterBottom sx={{ fontSize: '0.8rem' }}>
                          {customer.mobile}
                        </Typography>
                        
                        <Box sx={{ mt: 1, mb: 1 }}>
                          <Chip 
                            label={getKYCStatusName(customer.kycStatus)} 
                            color={getStatusColor(customer.kycStatus)} 
                            size="small" 
                            sx={{ mr: 0.5, fontSize: '0.7rem', height: '20px' }}
                          />
                          <Chip 
                            label={customer.isActive ? 'Active' : 'Inactive'} 
                            color={customer.isActive ? 'success' : 'default'} 
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
                        onClick={() => navigate(`/agent/customer/${customer.userId}`)}
                        sx={{ fontSize: '0.7rem', minWidth: '60px', py: 0.5 }}
                      >
                        View
                      </Button>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            ))
          ) : (
            <Box sx={{ gridColumn: '1 / -1', textAlign: 'center', py: 4 }}>
              <Typography variant="body1" color="text.secondary">
                No customers assigned yet
              </Typography>
            </Box>
          )}
        </Box>
      </Box>
    </Container>
  );
}