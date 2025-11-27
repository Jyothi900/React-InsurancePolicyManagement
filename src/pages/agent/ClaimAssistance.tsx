import { useEffect, useMemo } from 'react';
import { Container, Typography, Box, Chip } from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState, AppDispatch } from '../../store';
import { fetchAllClaims } from '../../slices/claimSlice';
import type { Claim } from '../../types/Claim';

import ClaimTable from '../../components/tables/ClaimTable';
import LoadingSpinner from '../../components/common/LoadingSpinner';

export default function ClaimAssistance() {
  const dispatch = useDispatch<AppDispatch>();
  const { claims, loading, error } = useSelector((state: RootState) => state.claim) as { claims: Claim[], loading: boolean, error: string | null };

  useEffect(() => {
    void dispatch(fetchAllClaims());
  }, [dispatch]);

  const pendingClaims = useMemo(() => 
    claims.filter((c: Claim) => c.status === 9), // Pending
    [claims]
  );

  const handleViewDetails = () => {
    try {
      console.log('Viewing claim details');
    } catch (error) {
      console.error('Error viewing claim details');
    }
  };

  if (loading) {
    return <LoadingSpinner message="Loading claims..." />;
  }

  if (error) {
    return (
      <Container maxWidth="lg">
        <Box py={4}>
          <Typography variant="h6" color="error">
            Error loading claims: {error}
          </Typography>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box py={4}>
        <Box display="flex" alignItems="center" gap={2} mb={4}>
          <Typography variant="h4">
            Claim Assistance
          </Typography>
          <Chip 
            label={`${pendingClaims.length} Pending Review`} 
            color="error" 
            size="small"
          />
        </Box>
        
        <ClaimTable 
          claims={claims} 
          onViewDetails={handleViewDetails}
        />
      </Box>
    </Container>
  );
}
