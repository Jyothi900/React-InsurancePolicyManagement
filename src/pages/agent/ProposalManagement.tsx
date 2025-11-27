import { useEffect } from 'react';
import { Container, Typography, Box, Chip } from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState, AppDispatch } from '../../store';
import { fetchAllProposals } from '../../slices/proposalSlice';
import { fetchAllEnums } from '../../slices/enumSlice';
import ProposalTable from '../../components/tables/ProposalTable';

export default function ProposalManagement() {
  const dispatch = useDispatch<AppDispatch>();
  const { allProposals, loading } = useSelector((state: RootState) => state.proposal);
  const { statuses } = useSelector((state: RootState) => state.enum);

  useEffect(() => {
    void dispatch(fetchAllProposals());
    void dispatch(fetchAllEnums());
  }, [dispatch]);


  const pendingStatusValues = statuses
    .filter(s => s.name.toLowerCase().includes('pending') || s.name.toLowerCase().includes('applied') || s.name.toLowerCase().includes('underreview'))
    .map(s => s.value);
  
  const pendingProposals = allProposals.filter(p => 
    pendingStatusValues.includes(p.status) || 
    p.status === 2 || // Pending
    p.status === 20 || // Applied 
    p.status === 21 // UnderReview
  );

  return (
    <Container maxWidth="lg">
      <Box py={4}>
        <Box display="flex" alignItems="center" gap={2} mb={4}>
          <Typography variant="h4">
            Proposal Management
          </Typography>
          <Chip 
            label={`${pendingProposals.length} Pending`} 
            color="warning" 
            size="small"
          />
        </Box>
        
        <ProposalTable proposals={allProposals} loading={loading} />
      </Box>
    </Container>
  );
}
