import { useEffect, useState } from 'react';
import { Container, Typography, Box, Button, Paper, Alert } from '@mui/material';
import { CheckCircle, Assignment } from '@mui/icons-material';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import type { RootState, AppDispatch } from '../../store';
import { fetchCustomerJourneyData } from '../../slices/productSlice';
import { paymentApi } from '../../api/payment.api';
import ProposalTable from '../../components/tables/ProposalTable';
import ProposalDetailsModal from '../../components/modals/ProposalDetailsModal';
import PaymentModal from '../../components/modals/PaymentModal';
import type { Proposal } from '../../types/Proposal';
import { toast } from 'react-toastify';

export default function MyProposals() {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { user } = useSelector((state: RootState) => state.auth);
  const { customerJourneyData, loading } = useSelector((state: RootState) => state.product);
  const myProposals = customerJourneyData?.userProposals || [];
  const statuses = customerJourneyData?.enums?.statuses || [];
  const paymentMethods = customerJourneyData?.enums?.paymentMethods || [];
  const [selectedProposal, setSelectedProposal] = useState<Proposal | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [paymentLoading, setPaymentLoading] = useState(false);

  const userId = user?.id || '';

  useEffect(() => {
    if (userId) {
      dispatch(fetchCustomerJourneyData({ userId }));
    }
  }, [dispatch, userId]);

  const handleView = (proposal: Proposal) => {
    setSelectedProposal(proposal);
    setModalOpen(true);
  };

  const handlePayNow = (proposal: Proposal) => {
    setSelectedProposal(proposal);
    setPaymentModalOpen(true);
  };

  const handlePayment = async (paymentMethod: string) => {
    if (!selectedProposal || !user?.id) return;

    setPaymentLoading(true);
    try {
      await paymentApi.payProposal(selectedProposal.proposalId, user.id, paymentMethod);
      toast.success('Payment successful! Your policy has been activated.');
      setPaymentModalOpen(false);
      // Refresh customer journey data
      dispatch(fetchCustomerJourneyData({ userId: user.id }));
      // Navigate to policies page
      setTimeout(() => navigate('/my-policies'), 2000);
    } catch (error) {
      toast.error('Payment failed. Please try again.');
      console.error('Payment error:', error);
    } finally {
      setPaymentLoading(false);
    }
  };

  // Get issued proposals that need payment (Status.Issued = 22)
  const issuedProposals = myProposals.filter(p => p.status === 22);
  const otherProposals = myProposals.filter(p => p.status !== 22);
  
  // Check if any proposals are ready for underwriter review
  const uploadedProposals = myProposals.filter(p => (p.status === 20 || p.status === 21) && issuedProposals.length === 0); // Status.Applied or UnderReview

  return (
    <Container maxWidth="lg">
      <Box py={4}>
        <Typography variant="h4" gutterBottom>
          My Proposals
        </Typography>
        <Typography variant="subtitle1" color="text.secondary" mb={4}>
          Track the status of your insurance proposals
        </Typography>
        
        {/* Payment Required Section */}
        {issuedProposals.length > 0 && (
          <Paper sx={{ p: 3, mb: 4, bgcolor: 'success.light' }}>
            <Box display="flex" alignItems="center" gap={1} mb={1}>
              <CheckCircle sx={{ color: 'success.contrastText' }} />
              <Typography variant="h6" color="success.contrastText">
                Congratulations! {issuedProposals.length} Proposal(s) Approved
              </Typography>
            </Box>
            <Typography variant="body2" mb={2} color="success.contrastText">
              Your proposals have been approved and are ready for payment. Complete payment to activate your insurance policy.
            </Typography>
            <ProposalTable 
              proposals={issuedProposals}
              loading={loading}
              showActions={true}
              onView={handleView}
              onPayNow={handlePayNow}
            />
          </Paper>
        )}
        
        {/* Waiting for Underwriter Review */}
        {uploadedProposals.length > 0 && issuedProposals.length === 0 && (
          <Paper sx={{ p: 3, mb: 4, bgcolor: 'info.light' }}>
            <Box display="flex" alignItems="center" gap={1} mb={1}>
              <Assignment sx={{ color: 'info.contrastText' }} />
              <Typography variant="h6" color="info.contrastText">
                Proposal Under Review
              </Typography>
            </Box>
            <Typography variant="body2" mb={2} color="info.contrastText">
              Your proposal is currently being reviewed by our underwriters. You'll be notified once it's approved and ready for payment.
            </Typography>
          </Paper>
        )}
        
        {/* Other Proposals */}
        {otherProposals.length > 0 && (
          <Box mb={4}>
            <Typography variant="h6" gutterBottom>
              All Proposals
            </Typography>
            <ProposalTable 
              proposals={otherProposals} 
              loading={loading}
              showActions={false}
              onView={handleView}
            />
          </Box>
        )}
        
        {myProposals.length === 0 && !loading && (
          <Alert severity="info">
            No proposals found. <Button onClick={() => navigate('/products')}>Browse Products</Button> to create your first proposal.
          </Alert>
        )}
        
        <ProposalDetailsModal
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          proposal={selectedProposal}
        />
        
        <PaymentModal
          open={paymentModalOpen}
          onClose={() => setPaymentModalOpen(false)}
          proposal={selectedProposal}
          paymentMethods={paymentMethods}
          loading={paymentLoading}
          onPayment={handlePayment}
        />
      </Box>
    </Container>
  );
}