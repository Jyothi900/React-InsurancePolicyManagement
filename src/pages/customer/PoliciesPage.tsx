import { useEffect, useState } from 'react';
import { Container, Typography, Box, Tabs, Tab, Button, Alert } from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useLocation } from 'react-router-dom';
import type { RootState, AppDispatch } from '../../store';
import { fetchMyPolicies } from '../../slices/policySlice';
import PolicyTable from '../../components/tables/PolicyTable';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { type Policy } from '../../types/Policy';


export default function PoliciesPage() {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useSelector((state: RootState) => state.auth);
  const { policies, loading, error } = useSelector((state: RootState) => state.policy);
  const [selectedTab, setSelectedTab] = useState(0);
  
  const policyIssued = location.state?.policyIssued as boolean | undefined;
  const productName = location.state?.productName as string | undefined;

  const userId = user?.id || '';

  useEffect(() => {
    if (userId) {
      void dispatch(fetchMyPolicies(userId));
    }
  }, [dispatch, userId]);

  // Convert API policies to component policies format
  const convertedPolicies: Policy[] = policies.map((policy: Policy) => ({
    ...policy,
    policyType: 0, // Default to TermLife
    premiumFrequency: policy.premiumFrequency,
    status: policy.status,
    nextPremiumDue: undefined,
    maturityDate: policy.expiryDate
  }));

  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setSelectedTab(newValue);
  };

  const handleViewDetails = (policy: Policy) => {
    navigate('/coverage');
  };

  const handlePayPremium = (policy: Policy) => {
    navigate('/payments', { state: { policyId: policy.policyId, policy } });
  };

  if (loading) {
    return <LoadingSpinner message="Loading policies..." />;
  }

  if (error) {
    return (
      <Container maxWidth="lg">
        <Box py={4}>
          <Alert severity="error">
            Error loading policies: {error}
          </Alert>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box py={4}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
          <Typography variant="h4" component="h1">
            My Policies
          </Typography>
          <Button 
            variant="contained" 
            onClick={() => navigate('/products')}
          >
            Buy New Policy
          </Button>
        </Box>
        
        {policyIssued && productName && (
          <Alert severity="success" sx={{ mb: 3 }}>
            🎉 Congratulations! Your <strong>{productName}</strong> policy has been successfully issued!
          </Alert>
        )}

        {/* Policy Type Tabs */}
        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 4 }}>
          <Tabs value={selectedTab} onChange={handleTabChange}>
            <Tab label={`Life Insurance (${convertedPolicies.length})`} />
            <Tab label="Motor Insurance (0)" />
          </Tabs>
        </Box>

        {/* Policy Tables */}
        {selectedTab === 0 && (
          <PolicyTable
            policies={convertedPolicies}
            onViewDetails={handleViewDetails}
            onPayPremium={handlePayPremium}
          />
        )}

        {selectedTab === 1 && (
          <Box textAlign="center" py={4}>
            <Typography variant="h6" color="text.secondary" gutterBottom>
              No motor policies found
            </Typography>
            <Button 
              variant="outlined" 
              onClick={() => navigate('/products')}
            >
              Get Motor Insurance
            </Button>
          </Box>
        )}

        {convertedPolicies.length === 0 && (
          <Box textAlign="center" py={8}>
            <Typography variant="h5" color="text.secondary" gutterBottom>
              No policies found
            </Typography>
            <Typography variant="body1" color="text.secondary" mb={3}>
              Start your insurance journey today
            </Typography>
            <Button 
              variant="contained" 
              size="large"
              onClick={() => navigate('/products')}
            >
              Explore Products
            </Button>
          </Box>
        )}
      </Box>
    </Container>
  );
}
