import { useEffect } from 'react';
import { Container, Typography, Box, Button, Card, CardContent, Stack } from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import type { RootState, AppDispatch } from '../../store';
import { fetchCustomerDashboard } from '../../slices/dashboardSlice';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { 
  Shield, Policy, Assignment, Payment, 
  TrendingUp, ArrowForward, CheckCircle, Warning
} from '@mui/icons-material';

export default function CustomerDashboard() {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useSelector((state: RootState) => state.auth);
  const { customerData: dashboardData, loading: dashboardLoading } = useSelector((state: RootState) => state.dashboard);
  
  
  const policies = dashboardData?.policies || [];
  const myClaims = dashboardData?.claims || [];
  const duePremiums = dashboardData?.duePremiums || [];

  const userId = user?.id || '';

  useEffect(() => {
    if (userId && isAuthenticated) {
      // Single API call for all dashboard data
      dispatch(fetchCustomerDashboard(userId));
    }
  }, [dispatch, userId, isAuthenticated]);

  const activePolicies = policies.filter(p => p.status === 0);
  const pendingClaims = myClaims.filter(c => c.status === 8 || c.status === 9);
  const totalCoverage = activePolicies.reduce((sum, p) => sum + (p.sumAssured || 0), 0);

  if (dashboardLoading) {
    return <LoadingSpinner message="Loading your dashboard..." />;
  }

  return (
    <Box sx={{ bgcolor: 'background.default', minHeight: '100vh' }}>
      <Container maxWidth="xl" sx={{ py: 4, px: { xs: 2, sm: 3, md: 4 } }}>
        {/* Welcome Header */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" fontWeight={700} color="text.primary" gutterBottom>
            Welcome back!
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Here's your insurance portfolio overview
          </Typography>
        </Box>

        {/* Alert for Pending Actions */}
        {(duePremiums.length > 0 || pendingClaims.length > 0) && (
          <Card sx={{ mb: 4, border: '1px solid #fbbf24', bgcolor: '#fffbeb' }}>
            <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Warning sx={{ color: '#f59e0b', fontSize: 28 }} />
              <Box sx={{ flex: 1 }}>
                <Typography variant="h6" color="warning.dark" fontWeight={600}>
                  Action Required
                </Typography>
                <Typography variant="body2" color="warning.dark">
                  {duePremiums.length > 0 && `${duePremiums.length} premium payment(s) due`}
                  {duePremiums.length > 0 && pendingClaims.length > 0 && ' • '}
                  {pendingClaims.length > 0 && `${pendingClaims.length} claim(s) pending`}
                </Typography>
              </Box>
              <Button 
                variant="contained" 
                color="warning"
                onClick={() => navigate(duePremiums.length > 0 ? '/payments' : '/claims')}
              >
                Take Action
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Key Metrics */}
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', lg: '1fr 1fr 1fr 1fr' }, gap: 3, mb: 4 }}>
          {[
            {
              title: 'Total Coverage',
              value: totalCoverage > 0 ? `₹${totalCoverage.toLocaleString()}` : '₹0',
              subtitle: `${activePolicies.length} active policies`,
              icon: <Shield sx={{ fontSize: 32, color: 'success.main' }} />,
              color: 'success.main',
              bgColor: 'success.light'
            },
            {
              title: 'Active Policies',
              value: activePolicies.length,
              subtitle: activePolicies.length > 0 ? 'Policies active' : 'No active policies',
              icon: <Policy sx={{ fontSize: 32, color: 'info.main' }} />,
              color: 'info.main',
              bgColor: 'info.light'
            },
            {
              title: 'Pending Claims',
              value: pendingClaims.length,
              subtitle: pendingClaims.length > 0 ? 'Claims in process' : 'No pending claims',
              icon: <Assignment sx={{ fontSize: 32, color: 'warning.main' }} />,
              color: 'warning.main',
              bgColor: 'warning.light'
            },
            {
              title: 'Due Payments',
              value: duePremiums.length,
              subtitle: duePremiums.length > 0 ? 'Payments pending' : 'All payments up to date',
              icon: <Payment sx={{ fontSize: 32, color: 'error.main' }} />,
              color: 'error.main',
              bgColor: 'error.light'
            }
          ].map((metric, index) => {
            const handleCardClick = () => {
              switch (index) {
                case 0: // Total Coverage
                  navigate('/coverage');
                  break;
                case 1: // Active Policies
                  navigate('/policies');
                  break;
                case 2: // Pending Claims
                  navigate('/claims');
                  break;
                case 3: // Due Payments
                  navigate('/payments');
                  break;
              }
            };
            
            return (
              <Card 
                key={index} 
                onClick={handleCardClick}
                sx={{ 
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  '&:hover': { 
                    transform: 'translateY(-4px)',
                    boxShadow: '0 8px 25px rgba(0,0,0,0.1)'
                  }
                }}
              >
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                  <Box sx={{ 
                    p: 1.5, 
                    borderRadius: 2, 
                    bgcolor: metric.bgColor
                  }}>
                    {metric.icon}
                  </Box>
                </Box>
                <Typography variant="h5" fontWeight={700} color="text.primary" gutterBottom>
                  {metric.value}
                </Typography>
                <Typography variant="body1" fontWeight={600} color="text.primary" gutterBottom>
                  {metric.title}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {metric.subtitle}
                </Typography>
              </CardContent>
            </Card>
            );
          })}
        </Box>

        {/* Quick Actions */}
        <Card sx={{ mb: 4 }}>
          <CardContent sx={{ p: 3 }}>
            <Typography variant="h6" fontWeight={600} color="#000" gutterBottom>
              Quick Actions
            </Typography>
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: '1fr 1fr 1fr' }, gap: 2 }}>
              {[
                { title: 'Buy Insurance', icon: <Shield />, route: '/products', color: '#10b981' },
                { title: 'View Policies', icon: <Policy />, route: '/policies', color: '#3b82f6' },
                { title: 'File Claim', icon: <Assignment />, route: '/claims', color: '#f59e0b' },
                { title: 'Make Payment', icon: <Payment />, route: '/payments', color: '#ef4444' },
                { title: 'Update Profile', icon: <CheckCircle />, route: '/customer/profile', color: '#8b5cf6' },
                { title: 'View Claims', icon: <TrendingUp />, route: '/claims', color: '#06b6d4' }
              ].map((action, index) => (
                <Button
                  key={index}
                  fullWidth
                  variant="outlined"
                  startIcon={action.icon}
                  endIcon={<ArrowForward sx={{ fontSize: 18 }} />}
                  onClick={() => navigate(action.route)}
                  sx={{
                    p: 2,
                    borderColor: action.color,
                    color: action.color,
                    '&:hover': {
                      bgcolor: action.color,
                      color: 'white',
                      transform: 'translateY(-2px)',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                    },
                    transition: 'all 0.2s ease'
                  }}
                >
                  {action.title}
                </Button>
              ))}
            </Box>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3 }}>
          <Card>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h6" fontWeight={600} color="#000">
                  Recent Policies
                </Typography>
                <Button 
                  size="small" 
                  endIcon={<ArrowForward />}
                  onClick={() => navigate('/policies')}
                  sx={{ color: '#3b82f6' }}
                >
                  View All
                </Button>
              </Box>
              <Stack spacing={2}>
                {activePolicies.slice(0, 3).map((policy) => (
                  <Box key={policy.policyId} sx={{ 
                    p: 2, 
                    bgcolor: '#f8fafc', 
                    borderRadius: 2,
                    border: '1px solid #e2e8f0'
                  }}>
                    <Typography variant="body1" fontWeight={600} color="#000">
                      {policy.policyNumber || 'Policy'}
                    </Typography>
                    <Typography variant="body2" color="#000">
                      Coverage: ₹{(policy.sumAssured || 0).toLocaleString()}
                    </Typography>
                  </Box>
                ))}
                {activePolicies.length === 0 && (
                  <Box sx={{ textAlign: 'center', py: 4 }}>
                    <Typography variant="body1" color="#000" gutterBottom>
                      No active policies yet
                    </Typography>
                    <Button 
                      variant="contained" 
                      onClick={() => navigate('/products')}
                      sx={{ mt: 1 }}
                    >
                      Browse Products
                    </Button>
                  </Box>
                )}
              </Stack>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h6" fontWeight={600} color="#000">
                  Recent Claims
                </Typography>
                <Button 
                  size="small" 
                  endIcon={<ArrowForward />}
                  onClick={() => navigate('/claims')}
                  sx={{ color: '#3b82f6' }}
                >
                  View All
                </Button>
              </Box>
              <Stack spacing={2}>
                {myClaims.slice(0, 3).map((claim) => (
                  <Box key={claim.claimId} sx={{ 
                    p: 2, 
                    bgcolor: '#f8fafc', 
                    borderRadius: 2,
                    border: '1px solid #e2e8f0'
                  }}>
                    <Typography variant="body1" fontWeight={600} color="#000">
                      {claim.claimNumber || 'Claim'}
                    </Typography>
                    <Typography variant="body2" color="#000">
                      Amount: ₹{(claim.claimAmount || 0).toLocaleString()}
                    </Typography>
                  </Box>
                ))}
                {myClaims.length === 0 && (
                  <Box sx={{ textAlign: 'center', py: 4 }}>
                    <Typography variant="body1" color="#000" gutterBottom>
                      No claims filed yet
                    </Typography>
                    <Button 
                      variant="outlined" 
                      onClick={() => navigate('/claims')}
                      sx={{ mt: 1 }}
                    >
                      File a Claim
                    </Button>
                  </Box>
                )}
              </Stack>
            </CardContent>
          </Card>
        </Box>
      </Container>
    </Box>
  );
}