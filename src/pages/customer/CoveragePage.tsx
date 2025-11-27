import { useEffect } from 'react';
import { Container, Typography, Box, Paper, Grid, Card, CardContent, LinearProgress } from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import type { RootState, AppDispatch } from '../../store';
import { fetchMyPolicies } from '../../slices/policySlice';
import { fetchPaymentHistory } from '../../slices/paymentSlice';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { Shield, TrendingUp, CalendarToday, AccountBalance } from '@mui/icons-material';

export default function CoveragePage() {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { user } = useSelector((state: RootState) => state.auth);
  const { policies, loading } = useSelector((state: RootState) => state.policy);
  const { paymentHistory } = useSelector((state: RootState) => state.payment);

  const userId = user?.id || '';

  useEffect(() => {
    if (userId && !policies.length) { 
      dispatch(fetchMyPolicies(userId));
      dispatch(fetchPaymentHistory(userId));
    }
  }, [dispatch, userId, policies.length]);

  const activePolicies = policies.filter(p => p.status === 0); 
  const totalCoverage = activePolicies.reduce((sum, p) => sum + p.sumAssured, 0);
  const totalPremiums = activePolicies.reduce((sum, p) => sum + p.premiumAmount, 0);

  
  const coverageDetails = activePolicies.map(policy => {
    
    
    const totalYears = policy.termYears;
    
    const policyPayments = paymentHistory.filter(payment => 
      payment.policyId === policy.policyId && 
      payment.paymentType === 'Premium' && 
      payment.status === 'Success'
    );
 
    let paymentsPerYear = 1;
    if (policy.premiumFrequency === 0) paymentsPerYear = 12; 
    else if (policy.premiumFrequency === 1) paymentsPerYear = 4; 
    else if (policy.premiumFrequency === 2) paymentsPerYear = 1; 
    
    const totalExpectedPayments = totalYears * paymentsPerYear;
    const paymentsMade = Math.min(policyPayments.length, totalExpectedPayments); // Cap at expected payments
    const remainingPayments = Math.max(0, totalExpectedPayments - paymentsMade);
    const totalRemainingAmount = remainingPayments * policy.premiumAmount;
    
    const yearsPaid = Math.floor(paymentsMade / paymentsPerYear);
    const remainingYears = Math.max(0, totalYears - yearsPaid);
    
    const progress = totalExpectedPayments > 0 ? Math.min((paymentsMade / totalExpectedPayments) * 100, 100) : 0; // Cap at 100%

    return {
      ...policy,
      remainingYears,
      remainingPayments,
      totalRemainingAmount,
      progress,
      elapsedYears: yearsPaid,
      paymentsMade
    };
  });

  if (loading) {
    return <LoadingSpinner message="Loading coverage details..." />;
  }

  return (
    <Container maxWidth="lg">
      <Box py={4}>
        <Typography variant="h4" gutterBottom>
          Total Coverage Overview
        </Typography>
        <Typography variant="subtitle1" color="text.secondary" mb={4}>
          Comprehensive view of your insurance coverage and remaining payments
        </Typography>

        <Grid container spacing={3} mb={4}>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <Shield sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
                <Typography variant="h5" component="div">
                  ₹{totalCoverage.toLocaleString()}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Total Coverage
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <AccountBalance sx={{ fontSize: 40, color: 'success.main', mb: 1 }} />
                <Typography variant="h5" component="div">
                  ₹{totalPremiums.toLocaleString()}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Annual Premiums
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <TrendingUp sx={{ fontSize: 40, color: 'info.main', mb: 1 }} />
                <Typography variant="h5" component="div">
                  {activePolicies.length}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Active Policies
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <CalendarToday sx={{ fontSize: 40, color: 'warning.main', mb: 1 }} />
                <Typography variant="h5" component="div">
                  {coverageDetails.reduce((sum, p) => sum + p.remainingYears, 0)}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Total Remaining Years
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Policy Details */}
        <Typography variant="h5" gutterBottom>
          Policy-wise Coverage Details
        </Typography>
        
        {coverageDetails.length > 0 ? (
          <Grid container spacing={3}>
            {coverageDetails.map((policy) => (
              <Grid size={{ xs: 12, md: 6 }} key={policy.policyId}>
                <Paper sx={{ p: 3 }}>
                  <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                    <Typography variant="h6" fontWeight="bold">
                      {policy.policyNumber}
                    </Typography>
                    <Typography variant="body2" color="success.main" fontWeight="bold">
                      Active
                    </Typography>
                  </Box>
                  
                  <Box mb={2}>
                    <Typography variant="body2" color="text.secondary">
                      Coverage Amount
                    </Typography>
                    <Typography variant="h5" color="primary.main">
                      ₹{policy.sumAssured.toLocaleString()}
                    </Typography>
                  </Box>
                  
                  <Box mb={2}>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Payment Progress ({Math.min(policy.paymentsMade, policy.termYears * (policy.premiumFrequency === 0 ? 12 : policy.premiumFrequency === 1 ? 4 : 1))} of {policy.termYears * (policy.premiumFrequency === 0 ? 12 : policy.premiumFrequency === 1 ? 4 : 1)} payments made)
                    </Typography>
                    <LinearProgress 
                      variant="determinate" 
                      value={policy.progress} 
                      sx={{ height: 8, borderRadius: 4 }}
                    />
                    <Typography variant="caption" color="text.secondary">
                      {policy.progress.toFixed(1)}% completed
                    </Typography>
                  </Box>
                  
                  <Grid container spacing={2}>
                    <Grid size={{ xs: 6 }}>
                      <Typography variant="body2" color="text.secondary">
                        Remaining Years
                      </Typography>
                      <Typography variant="h6">
                        {policy.remainingYears} years
                      </Typography>
                    </Grid>
                    <Grid size={{ xs: 6 }}>
                      <Typography variant="body2" color="text.secondary">
                        Remaining Payments
                      </Typography>
                      <Typography variant="h6">
                        {policy.remainingPayments}
                      </Typography>
                    </Grid>
                    <Grid size={{ xs: 12 }}>
                      <Typography variant="body2" color="text.secondary">
                        Total Remaining Amount
                      </Typography>
                      <Typography variant="h6" color="warning.main">
                        ₹{policy.totalRemainingAmount.toLocaleString()}
                      </Typography>
                    </Grid>
                  </Grid>
                  
                  <Box mt={2} pt={2} borderTop="1px solid #eee">
                    <Typography variant="body2" color="text.secondary">
                      Premium: ₹{policy.premiumAmount.toLocaleString()} 
                      {policy.premiumFrequency === 0 ? ' (Monthly)' : 
                       policy.premiumFrequency === 1 ? ' (Quarterly)' : ' (Annual)'}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Expiry: {new Date(policy.expiryDate || new Date()).toLocaleDateString()}
                    </Typography>
                  </Box>
                </Paper>
              </Grid>
            ))}
          </Grid>
        ) : (
          <Paper sx={{ p: 4, textAlign: 'center' }}>
            <Typography variant="h6" color="text.secondary" gutterBottom>
              No active policies found
            </Typography>
            <Typography variant="body2" color="text.secondary" mb={3}>
              Start building your insurance portfolio today
            </Typography>
            <button 
              onClick={() => navigate('/products')}
              style={{
                padding: '12px 24px',
                backgroundColor: '#1976d2',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '16px'
              }}
            >
              Explore Products
            </button>
          </Paper>
        )}
      </Box>
    </Container>
  );
}