import { useEffect } from 'react';
import { Container, Typography, Box, Card, CardContent, Paper, Button } from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { type RootState, type AppDispatch } from '../../store';
import { fetchAdminDashboard } from '../../slices/dashboardSlice';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { People, Policy, Assignment, TrendingUp, Refresh } from '@mui/icons-material';

export default function AdminDashboard() {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { adminData, loading, error } = useSelector((state: RootState) => state.dashboard);

 
  useEffect(() => {
    dispatch(fetchAdminDashboard());
  }, [dispatch]);

  const stats = [
    {
      title: 'Total Users',
      value: adminData?.totalUsers || 0,
      icon: <People sx={{ fontSize: { xs: 40, md: 50 } }} />,
      subtitle: 'System users',
      onClick: () => navigate('/admin/users')
    },
    {
      title: 'Total Policies',
      value: adminData?.totalPolicies || 0,
      icon: <Policy sx={{ fontSize: { xs: 40, md: 50 } }} />,
      subtitle: `${adminData?.activePolicies || 0} Active`,
      onClick: () => navigate('/admin/policies')
    },
    {
      title: 'Total Claims',
      value: adminData?.totalClaims || 0,
      icon: <Assignment sx={{ fontSize: { xs: 40, md: 50 } }} />,
      subtitle: `${adminData?.pendingClaims || 0} Pending`,
      onClick: () => navigate('/admin/claims')
    },
    {
      title: 'Total Revenue',
      value: `₹${(adminData?.totalRevenue || 0).toLocaleString()}`,
      icon: <TrendingUp sx={{ fontSize: { xs: 40, md: 50 } }} />,
      subtitle: 'From payments',
      onClick: () => navigate('/admin/reports')
    }
  ];

  if (loading) {
    return <LoadingSpinner message="Loading dashboard..." />;
  }

  if (error) {
    return (
      <Container maxWidth="lg">
        <Box py={4}>
          <Typography variant="h4" color="error">
            Error Loading Dashboard
          </Typography>
          <Typography variant="body1" color="text.secondary">
            {error}
          </Typography>
        </Box>
      </Container>
    );
  }

  const handleRefresh = () => {
    dispatch(fetchAdminDashboard());
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f5f5f5', p: { xs: 2, md: 3 } }}>
      <Container maxWidth={false} sx={{ maxWidth: '1400px' }}>
        {/* Header */}
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
          <Box>
            <Typography variant="h3" component="h1" gutterBottom sx={{ color: 'primary.main', fontWeight: 700 }}>
              Admin Dashboard
            </Typography>
            <Typography variant="h6" color="text.secondary">
              System overview and management console
            </Typography>
          </Box>
          <Button 
            variant="outlined" 
            startIcon={<Refresh />} 
            onClick={handleRefresh}
            sx={{ borderColor: 'primary.main', color: 'primary.main' }}
          >
            Refresh
          </Button>
        </Box>

        {/* Stats Cards */}
        <Box display="grid" gridTemplateColumns={{ xs: '1fr', sm: '1fr 1fr', lg: '1fr 1fr 1fr 1fr' }} gap={3} mb={4}>
          {stats.map((stat, index) => (
            <Box key={index}>
              <Card 
                sx={{ 
                  cursor: 'pointer',
                  transition: 'all 0.3s ease-in-out',
                  bgcolor: '#f0f0f0',
                  minHeight: { xs: 160, md: 180 },
                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: '0 8px 24px rgba(0,0,0,0.15)'
                  }
                }}
                onClick={stat.onClick}
              >
                <CardContent sx={{ 
                  textAlign: 'center', 
                  p: { xs: 2, md: 3 }, 
                  height: '100%', 
                  display: 'flex', 
                  flexDirection: 'column', 
                  justifyContent: 'center' 
                }}>
                  <Box mb={2} sx={{ color: '#FFD700' }}>{stat.icon}</Box>
                  <Typography 
                    variant="h3" 
                    component="div" 
                    gutterBottom 
                    sx={{ fontWeight: 600, color: 'text.primary', fontSize: { xs: '2rem', md: '2.5rem' } }}
                  >
                    {stat.value}
                  </Typography>
                  <Typography variant="h6" sx={{ color: 'text.primary', mb: 1 }}>
                    {stat.title}
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    {stat.subtitle}
                  </Typography>
                </CardContent>
              </Card>
            </Box>
          ))}
        </Box>

        {/* Quick Actions */}
        <Box display="flex" flexWrap="wrap" gap={2} mb={4} justifyContent="center">
          <Button 
            variant="contained" 
            size="large" 
            onClick={() => navigate('/admin/users')}
          >
            Manage Users
          </Button>
          <Button 
            variant="outlined" 
            size="large" 
            onClick={() => navigate('/admin/products')}
          >
            Manage Products
          </Button>
          <Button 
            variant="outlined" 
            size="large" 
            onClick={() => navigate('/admin/policies')}
          >
            View Policies
          </Button>
          <Button 
            variant="outlined" 
            size="large" 
            onClick={() => navigate('/admin/claims')}
          >
            Review Claims
          </Button>
          <Button 
            variant="outlined" 
            size="large" 
            onClick={() => navigate('/admin/reports')}
          >
            Reports
          </Button>
        </Box>

        {/* Additional Info */}
        <Box display="grid" gridTemplateColumns={{ xs: '1fr', lg: '1fr 1fr' }} gap={3}>
          <Box>
            <Paper sx={{ p: 3, bgcolor: '#f0f0f0' }}>
              <Typography variant="h5" gutterBottom sx={{ color: 'text.primary', fontWeight: 600, mb: 3 }}>
                System Overview
              </Typography>
              <Box>
                {[
                  { name: 'Active Policies', value: adminData?.activePolicies || 0 },
                  { name: 'Pending Claims', value: adminData?.pendingClaims || 0 },
                  { name: 'Approved Claims', value: adminData?.approvedClaims || 0 }
                ].map((item) => {
                  const total = (adminData?.totalPolicies || 0) + (adminData?.totalClaims || 0);
                  const percentage = total > 0 ? (item.value / total) * 100 : 0;
                  
                  return (
                    <Box key={item.name} mb={3}>
                      <Box display="flex" justifyContent="space-between" mb={1}>
                        <Typography variant="body1" sx={{ fontWeight: 500, color: 'text.primary' }}>{item.name}</Typography>
                        <Typography variant="h6" sx={{ fontWeight: 600, color: 'primary.main' }}>{item.value}</Typography>
                      </Box>
                      <Box 
                        sx={{ 
                          width: '100%', 
                          height: 8, 
                          bgcolor: 'grey.200', 
                          borderRadius: 4,
                          overflow: 'hidden'
                        }}
                      >
                        <Box 
                          sx={{ 
                            width: `${percentage}%`, 
                            height: '100%', 
                            bgcolor: 'primary.main', 
                            borderRadius: 4,
                            transition: 'width 0.5s ease-in-out'
                          }} 
                        />
                      </Box>
                    </Box>
                  );
                })}
              </Box>
            </Paper>
          </Box>

          <Box>
            <Paper sx={{ p: 3, bgcolor: '#f0f0f0' }}>
              <Typography variant="h5" gutterBottom sx={{ color: 'text.primary', fontWeight: 600, mb: 3 }}>
                Quick Stats
              </Typography>
              <Box>
                <Box display="flex" justifyContent="space-between" mb={2}>
                  <Typography variant="body1" sx={{ color: 'text.primary' }}>Total Revenue</Typography>
                  <Typography variant="h6" sx={{ color: 'primary.main', fontWeight: 600 }}>
                    ₹{(adminData?.totalRevenue || 0).toLocaleString()}
                  </Typography>
                </Box>
                <Box display="flex" justifyContent="space-between" mb={2}>
                  <Typography variant="body1" sx={{ color: 'text.primary' }}>Active Users</Typography>
                  <Typography variant="h6" sx={{ color: 'primary.main', fontWeight: 600 }}>
                    {adminData?.totalUsers || 0}
                  </Typography>
                </Box>
                <Box display="flex" justifyContent="space-between">
                  <Typography variant="body1" sx={{ color: 'text.primary' }}>Success Rate</Typography>
                  <Typography variant="h6" sx={{ color: 'primary.main', fontWeight: 600 }}>
                    {adminData?.totalClaims > 0 ? Math.round((adminData?.approvedClaims / adminData?.totalClaims) * 100) : 0}%
                  </Typography>
                </Box>
              </Box>
            </Paper>
          </Box>
        </Box>
      </Container>
    </Box>
  );
}