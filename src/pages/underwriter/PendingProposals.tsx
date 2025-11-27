import { useEffect, useState } from 'react';
import { Container, Typography, Box } from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState, AppDispatch } from '../../store';

import { fetchUnderwriterDashboard } from '../../slices/dashboardSlice';
import ProposalTable from '../../components/tables/ProposalTable';
import ProposalDetailsModal from '../../components/modals/ProposalDetailsModal';
import { underwriterApi } from '../../api/underwriter.api';
import type { Proposal } from '../../types/Proposal';
import type { Status, PremiumFrequency } from '../../types/Common';
import { toast } from 'react-toastify';

export default function PendingProposals() {
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useSelector((state: RootState) => state.auth);
  const { underwriterData, loading } = useSelector((state: RootState) => state.dashboard);

  const [selectedProposal, setSelectedProposal] = useState<Proposal | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  // Convert cached proposal data to Proposal type
  const allProposals: Proposal[] = underwriterData?.proposals?.map((p: any) => ({
    proposalId: p.proposalId,
    userId: p.userId,
    productId: p.productId,
    sumAssured: p.sumAssured,
    termYears: p.termYears,
    premiumAmount: p.premiumAmount,
    premiumFrequency: p.premiumFrequency as PremiumFrequency,
    height: p.height,
    weight: p.weight,
    isSmoker: p.isSmoker,
    isDrinker: p.isDrinker,
    preExistingConditions: p.preExistingConditions,
    occupation: p.occupation,
    annualIncome: p.annualIncome,
    status: p.status as Status,
    appliedDate: p.appliedDate,
    reviewedDate: p.reviewedDate
  })) || [];

  // Get statuses from cached enums
  const statuses = underwriterData?.enums?.statuses || [];

  useEffect(() => {
    // Load underwriter data if not already loaded
    if (!underwriterData && user?.id) {
      dispatch(fetchUnderwriterDashboard(user.id));
    }
  }, [dispatch, underwriterData, user?.id]);

  const handleView = (proposal: Proposal) => {
    setSelectedProposal(proposal);
    setModalOpen(true);
  };

  const handleApprove = async (proposalId: string) => {
    try {
      // Find approved status from database enum
      const approvedStatus = statuses.find((s: any) => s.value === 3);
      if (!approvedStatus) {
        toast.error('Status configuration not found');
        return;
      }
      
      console.log('Updating proposal:', proposalId, 'to status:', approvedStatus.name);
      await underwriterApi.updateProposalStatus(proposalId, approvedStatus.name);
      toast.success('Proposal approved successfully');
      
      // Refresh cached data after successful update
      if (user?.id) {
        dispatch(fetchUnderwriterDashboard(user.id));
      }
    } catch (error) {
      console.error('Failed to approve proposal:', error);
      toast.error('Failed to approve proposal');
      // Refresh data from server on error
      if (user?.id) {
        dispatch(fetchUnderwriterDashboard(user.id));
      }
    }
  };

  const handleReject = async (proposalId: string) => {
    try {
      // Find rejected status from database enum
      const rejectedStatus = statuses.find((s: any) => s.value === 4);
      if (!rejectedStatus) {
        toast.error('Status configuration not found');
        return;
      }
      
      console.log('Updating proposal:', proposalId, 'to status:', rejectedStatus.name);
      await underwriterApi.updateProposalStatus(proposalId, rejectedStatus.name);
      toast.error('Proposal rejected successfully');
      
      // Refresh cached data after successful update
      if (user?.id) {
        dispatch(fetchUnderwriterDashboard(user.id));
      }
    } catch (error) {
      console.error('Failed to reject proposal:', error);
      toast.error('Failed to reject proposal');
      // Refresh data from server on error
      if (user?.id) {
        dispatch(fetchUnderwriterDashboard(user.id));
      }
    }
  };

  return (
    <Container maxWidth="lg">
      <Box py={4}>
        <Typography variant="h4" gutterBottom>
          Proposal Management
        </Typography>
        <Typography variant="subtitle1" color="text.secondary" mb={4}>
          {allProposals.length} total proposals | {allProposals.filter(p => p.status === 2 || p.status === 20 || p.status === 21).length} pending review
        </Typography>
        
        {allProposals.length === 0 && (
          <Box textAlign="center" py={8}>
            <Typography variant="h6" color="text.secondary">
              No proposals found
            </Typography>
            <Typography variant="body2" color="text.secondary">
              No proposals are currently assigned to you for review.
            </Typography>
          </Box>
        )}
        
        <ProposalTable 
          proposals={allProposals} 
          loading={loading}
          showActions={true}
          onView={handleView}
          onApprove={handleApprove}
          onReject={handleReject}
          statusEnums={statuses}
        />
        
        <ProposalDetailsModal
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          proposal={selectedProposal}
        />
      </Box>
    </Container>
  );
}
