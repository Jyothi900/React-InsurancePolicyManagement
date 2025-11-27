import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  Container,
  Typography,
  Box,
  Paper,
  Button,
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
import type { RootState, AppDispatch } from '../../store';
import { fetchUnderwriterDashboard } from '../../slices/dashboardSlice';
import { updateClaimStatus, approveClaim } from '../../slices/claimSlice';
import ClaimTable from '../../components/tables/ClaimTable';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import type { Claim } from '../../types/Claim';

export default function ClaimReview() {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useSelector((state: RootState) => state.auth);
  const { underwriterData, loading } = useSelector((state: RootState) => state.dashboard);

  // Convert cached claim data to Claim type
  const claims: Claim[] = underwriterData?.claims?.map((c: any) => ({
    claimId: c.claimId,
    claimNumber: c.claimNumber,
    policyId: c.policyId,
    userId: c.userId,
    agentId: c.agentId,
    underwriterId: c.underwriterId,
    claimType: c.claimType === 'Death' ? 0 : c.claimType === 'Maturity' ? 1 : c.claimType === 'Surrender' ? 2 : c.claimType === 'Disability' ? 3 : 0,
    claimAmount: c.claimAmount,
    incidentDate: c.incidentDate,
    status: c.status === 'Pending' ? 2 : c.status === 'Approved' ? 3 : c.status === 'Filed' ? 11 : c.status === 'Under Review' ? 21 : 2,
    filedDate: c.filedDate,
    processedDate: c.processedDate,
    approvedAmount: c.approvedAmount,
    causeOfDeath: c.causeOfDeath === 'Natural' ? 0 : c.causeOfDeath === 'Accidental' ? 1 : c.causeOfDeath === 'Suicide' ? 2 : c.causeOfDeath === 'Murder' ? 3 : 0,
    claimantName: c.claimantName,
    claimantRelation: c.claimantRelation === 'Self' ? 0 : c.claimantRelation === 'Spouse' ? 1 : c.claimantRelation === 'Child' ? 2 : c.claimantRelation === 'Parent' ? 3 : c.claimantRelation === 'Sibling' ? 4 : 0,
    claimantBankDetails: c.claimantBankDetails
  })) || [];
  
  const [selectedClaim, setSelectedClaim] = useState<Claim | null>(null);
  const [statusUpdateDialog, setStatusUpdateDialog] = useState(false);
  const [approvalDialog, setApprovalDialog] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  const [notes, setNotes] = useState('');
  const [approvedAmount, setApprovedAmount] = useState('');

  useEffect(() => {
    // Load underwriter data if not already loaded
    if (!underwriterData && user?.id) {
      dispatch(fetchUnderwriterDashboard(user.id));
    }
  }, [dispatch, underwriterData, user?.id]);

  const handleViewDetails = (claim: Claim) => {
    setSelectedClaim(claim);
    // Fetch additional details if needed
    // For now, just show the claim in a dialog or expanded view
    console.log('Viewing claim details:', claim);
  };

  const handleUpdateStatus = (claim: Claim) => {
    setSelectedClaim(claim);
    setNewStatus('');
    setNotes('');
    setStatusUpdateDialog(true);
  };

  const handleApprove = (claim: Claim) => {
    setSelectedClaim(claim);
    setApprovedAmount(claim.claimAmount.toString());
    setApprovalDialog(true);
  };

  const submitStatusUpdate = async () => {
    if (!selectedClaim || !newStatus) return;

    try {
      await dispatch(updateClaimStatus({
        claimId: selectedClaim.claimId,
        status: newStatus,
        notes: notes || undefined
      }));
      
      setStatusUpdateDialog(false);
      console.log('Status updated, refreshing claims');
      if (user?.id) {
        dispatch(fetchUnderwriterDashboard(user.id));
      }
    } catch (error) {
      console.error('Failed to update claim status:', error);
    }
  };

  const submitApproval = async () => {
    if (!selectedClaim || !approvedAmount) return;

    try {
      await dispatch(approveClaim({
        claimId: selectedClaim.claimId,
        approvedAmount: parseFloat(approvedAmount)
      }));
      
      setApprovalDialog(false);
      console.log('Claim approved, refreshing claims');
      if (user?.id) {
        dispatch(fetchUnderwriterDashboard(user.id));
      }
    } catch (error) {
      console.error('Failed to approve claim:', error);
    }
  };

  if (loading) {
    return <LoadingSpinner message="Loading claims..." />;
  }

  console.log('All claims from store:', claims);
  const pendingClaims = claims.filter(c => {
    console.log(`Claim ${c.claimNumber}: status=${c.status}, type=${typeof c.status}`);
    return c.status === 2 || c.status === 11 || c.status === 21; // Pending, Filed, Under Review
  });
  console.log('Filtered pending claims:', pendingClaims);

  return (
    <Container maxWidth="lg">
      <Box py={4}>
        <Typography variant="h4" gutterBottom>
          Claim Review
        </Typography>
        <Typography variant="subtitle1" color="text.secondary" mb={4}>
          Review and process insurance claims
        </Typography>

        {/* Show claim details if selected */}
        {selectedClaim && (
          <Paper sx={{ mb: 3, p: 3 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
              <Typography variant="h6">Claim Details - {selectedClaim.claimNumber}</Typography>
              <Button onClick={() => setSelectedClaim(null)}>Close Details</Button>
            </Box>
            
            <Box display="grid" gridTemplateColumns="1fr 1fr" gap={4}>
              {/* Claim Information */}
              <Box>
                <Typography variant="subtitle1" fontWeight="bold" mb={2}>Claim Information</Typography>
                <Box display="grid" gap={2}>
                  <Box>
                    <Typography variant="caption" color="text.secondary">Claim Type</Typography>
                    <Typography variant="body1">{selectedClaim.claimType === 0 ? 'Death' : selectedClaim.claimType === 3 ? 'Disability' : selectedClaim.claimType === 1 ? 'Maturity' : selectedClaim.claimType === 2 ? 'Surrender' : 'Other'}</Typography>
                  </Box>
                  <Box>
                    <Typography variant="caption" color="text.secondary">Claim Amount</Typography>
                    <Typography variant="h6" color="primary">₹{selectedClaim.claimAmount.toLocaleString()}</Typography>
                  </Box>
                  <Box>
                    <Typography variant="caption" color="text.secondary">Status</Typography>
                    <Chip label={selectedClaim.status === 2 ? 'Pending' : selectedClaim.status === 3 ? 'Approved' : selectedClaim.status === 11 ? 'Filed' : selectedClaim.status === 21 ? 'Under Review' : 'Other'} color={selectedClaim.status === 3 ? 'success' : selectedClaim.status === 2 ? 'warning' : 'default'} size="small" />
                  </Box>
                  <Box>
                    <Typography variant="caption" color="text.secondary">Filed Date</Typography>
                    <Typography variant="body1">{new Date(selectedClaim.filedDate).toLocaleDateString()}</Typography>
                  </Box>
                  {selectedClaim.approvedAmount && (
                    <Box>
                      <Typography variant="caption" color="text.secondary">Approved Amount</Typography>
                      <Typography variant="h6" color="success.main">₹{selectedClaim.approvedAmount.toLocaleString()}</Typography>
                    </Box>
                  )}
                  <Box>
                    <Typography variant="caption" color="text.secondary">Policy ID</Typography>
                    <Typography variant="body1">{selectedClaim.policyId}</Typography>
                  </Box>
                </Box>
              </Box>
              
              {/* Customer Information */}
              <Box>
                <Typography variant="subtitle1" fontWeight="bold" mb={2}>Customer Information</Typography>
                <Box display="grid" gap={2}>
                  <Box>
                    <Typography variant="caption" color="text.secondary">Customer ID</Typography>
                    <Typography variant="body1">{selectedClaim.userId}</Typography>
                  </Box>
                  <Box>
                    <Typography variant="caption" color="text.secondary">Claimant Name</Typography>
                    <Typography variant="body1">{selectedClaim.claimantName || 'N/A'}</Typography>
                  </Box>
                  <Box>
                    <Typography variant="caption" color="text.secondary">Claimant Relation</Typography>
                    <Typography variant="body1">{selectedClaim.claimantRelation === 0 ? 'Self' : selectedClaim.claimantRelation === 1 ? 'Spouse' : selectedClaim.claimantRelation === 2 ? 'Child' : selectedClaim.claimantRelation === 3 ? 'Parent' : selectedClaim.claimantRelation === 4 ? 'Sibling' : 'Other'}</Typography>
                  </Box>
                  <Box>
                    <Typography variant="caption" color="text.secondary">Bank Details</Typography>
                    <Typography variant="body2">{selectedClaim.claimantBankDetails || 'N/A'}</Typography>
                  </Box>
                  {selectedClaim.causeOfDeath !== undefined && (
                    <Box>
                      <Typography variant="caption" color="text.secondary">Cause of Death</Typography>
                      <Typography variant="body1">{selectedClaim.causeOfDeath === 0 ? 'Natural' : selectedClaim.causeOfDeath === 1 ? 'Accidental' : selectedClaim.causeOfDeath === 2 ? 'Suicide' : selectedClaim.causeOfDeath === 3 ? 'Murder' : 'Other'}</Typography>
                    </Box>
                  )}
                  <Box>
                    <Typography variant="caption" color="text.secondary">Incident Date</Typography>
                    <Typography variant="body1">{new Date(selectedClaim.incidentDate).toLocaleDateString()}</Typography>
                  </Box>
                </Box>
              </Box>
            </Box>
          </Paper>
        )}

        {/* Show all claims */}
        {claims.length > 0 ? (
          <Paper>
            <ClaimTable
              claims={claims}
              onViewDetails={handleViewDetails}
              onUpdateStatus={handleUpdateStatus}
              showActions={true}
            />
            
            {/* Add Approve buttons for claims that can be approved */}
            <Box sx={{ p: 2, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              {claims.map(claim => (
                (claim.status === 21 || claim.status === 11 || claim.status === 2) && ( // Under Review, Filed, or Pending status
                  <Button
                    key={claim.claimId}
                    variant="contained"
                    color="success"
                    onClick={() => handleApprove(claim)}
                  >
                    Approve {claim.claimNumber}
                  </Button>
                )
              ))}
            </Box>
          </Paper>
        ) : (
          <Box textAlign="center" py={8}>
            <Typography variant="h6" color="text.secondary">
              No claims found
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Total claims loaded: {claims.length}
            </Typography>
          </Box>
        )}

        {/* Status Update Dialog */}
        <Dialog open={statusUpdateDialog} onClose={() => setStatusUpdateDialog(false)} maxWidth="sm" fullWidth>
          <DialogTitle>Update Claim Status</DialogTitle>
          <DialogContent>
            <Box sx={{ pt: 2 }}>
              <FormControl fullWidth sx={{ mb: 3 }}>
                <InputLabel>New Status</InputLabel>
                <Select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  label="New Status"
                >
                  <MenuItem value="21">Under Review</MenuItem>
                  <MenuItem value="12">Under Investigation</MenuItem>
                  <MenuItem value="13">Surveyor Assigned</MenuItem>
                  <MenuItem value="3">Approved</MenuItem>
                  <MenuItem value="4">Rejected</MenuItem>
                </Select>
              </FormControl>
              
              <TextField
                fullWidth
                multiline
                rows={3}
                label="Notes (Optional)"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add any notes about the status update..."
              />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setStatusUpdateDialog(false)}>Cancel</Button>
            <Button 
              variant="contained" 
              onClick={submitStatusUpdate}
              disabled={!newStatus}
            >
              Update Status
            </Button>
          </DialogActions>
        </Dialog>

        {/* Approval Dialog */}
        <Dialog open={approvalDialog} onClose={() => setApprovalDialog(false)} maxWidth="sm" fullWidth>
          <DialogTitle>Approve Claim</DialogTitle>
          <DialogContent>
            <Alert severity="info" sx={{ mb: 3 }}>
              Approving claim for {selectedClaim?.claimNumber}
            </Alert>
            <TextField
              fullWidth
              type="number"
              label="Approved Amount"
              value={approvedAmount}
              onChange={(e) => setApprovedAmount(e.target.value)}
              InputProps={{
                startAdornment: '₹'
              }}
              helperText={`Original claim amount: ₹${selectedClaim?.claimAmount.toLocaleString()}`}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setApprovalDialog(false)}>Cancel</Button>
            <Button 
              variant="contained" 
              color="success"
              onClick={submitApproval}
              disabled={!approvedAmount}
            >
              Approve Claim
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Container>
  );
}