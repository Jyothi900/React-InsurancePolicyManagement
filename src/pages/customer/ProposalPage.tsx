import { useEffect, useState } from 'react';
import { Container, Typography, Box, Card, CardContent, Button, Alert, Dialog, DialogTitle, DialogContent, DialogActions, TextField, FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import { Grid } from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import { useLocation, useNavigate } from 'react-router-dom';
import type { RootState, AppDispatch } from '../../store';
import { fetchCustomerJourneyData } from '../../slices/productSlice';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { type PolicyProduct } from '../../types/Product';
import { proposalApi, type ProposalCreateDto } from '../../api/proposal.api';
import { toast } from 'react-toastify';

export default function ProposalPage() {
  const dispatch = useDispatch<AppDispatch>();
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useSelector((state: RootState) => state.auth);
  const { customerJourneyData, loading, error } = useSelector((state: RootState) => state.product);
  const myProposals = customerJourneyData?.userProposals || [];
  const myDocuments = customerJourneyData?.userDocuments || [];
  const userData = customerJourneyData?.userData;
  const premiumFrequencies = customerJourneyData?.enums?.premiumFrequencies || [];
  
  const [createProposalOpen, setCreateProposalOpen] = useState(false);
  const [proposalData, setProposalData] = useState({
    sumAssured: 1000000,
    termYears: 10,
    premiumFrequency: 3,
    height: 170,
    weight: 70,
    isSmoker: false,
    isDrinker: false,
    preExistingConditions: 'None',
    occupation: 'Professional',
    annualIncome: 500000
  });
  const [userKycStatus, setUserKycStatus] = useState<number | null>(null);

  
  const selectedProduct = location.state?.selectedProduct as PolicyProduct | undefined;

  useEffect(() => {
    if (user?.id && !customerJourneyData) {
      dispatch(fetchCustomerJourneyData({ userId: user.id }));
    }
  }, [dispatch, user?.id, customerJourneyData]);
  
  useEffect(() => {
    if (userData) {
      console.log('User KYC Status:', userData.kycStatus);
      console.log('KYC Statuses enum:', customerJourneyData?.enums?.kycStatuses);
      setUserKycStatus(userData.kycStatus);
    }
  }, [userData, customerJourneyData?.enums?.kycStatuses]);
  
  useEffect(() => {
    // Check if KYC is verified - could be status 1 or 2 depending on enum values
    const isKycVerified = userKycStatus === 1 || userKycStatus === 2;
    if (selectedProduct && isKycVerified) {
      setCreateProposalOpen(true);
      setProposalData(prev => ({
        ...prev,
        sumAssured: selectedProduct.minSumAssured || 1000000
      }));
    }
  }, [selectedProduct, userKycStatus]);
  
  const handleCreateProposal = async () => {
    const isKycVerified = userKycStatus === 1 || userKycStatus === 2;
    if (!selectedProduct || !user?.id || !isKycVerified) {
      toast.error('KYC verification required to create proposals');
      return;
    }
    
    try {
      const proposalRequest: ProposalCreateDto = {
        productId: selectedProduct.productId,
        sumAssured: proposalData.sumAssured,
        premiumFrequency: proposalData.premiumFrequency,
        isSmoker: proposalData.isSmoker,
        termYears: proposalData.termYears,
        height: proposalData.height,
        weight: proposalData.weight,
        isDrinker: proposalData.isDrinker,
        preExistingConditions: proposalData.preExistingConditions,
        occupation: proposalData.occupation,
        annualIncome: proposalData.annualIncome
      };
      
      const createdProposal = await proposalApi.submitProposal(user.id, proposalRequest);
      setCreateProposalOpen(false);
      
      const requiredDocs = ['Medical Certificate', 'Income Certificate', 'Identity Proof'];
      
      toast.success(`Proposal created successfully! ID: ${createdProposal.proposalId}`, { autoClose: 3000 });
      
      navigate('/kyc', { 
        state: { 
          proposalCreated: true,
          proposalId: createdProposal.proposalId,
          selectedProduct,
          requiredDocuments: requiredDocs
        } 
      });
    } catch (error) {
      console.error('Proposal creation failed:', error);
      toast.error('Failed to create proposal. Please try again.');
    }
  };

  if (loading) {
    return <LoadingSpinner message="Loading proposals..." />;
  }

  if (error) {
    return (
      <Container maxWidth="lg">
        <Box py={4}>
          <Alert severity="error">
            Error loading proposals: {error}
          </Alert>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box py={4}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography variant="h4">
            My Proposals
          </Typography>
          {(userKycStatus === 1 || userKycStatus === 2) && (
            <Button 
              variant="contained" 
              onClick={() => navigate('/products')}
            >
              Create New Proposal
            </Button>
          )}
        </Box>
        
        {/* KYC Status Check */}
        {userKycStatus !== null && (
          <Box mb={3}>
            {(userKycStatus === 1 || userKycStatus === 2) ? (
              selectedProduct && (
                <Alert severity="success">
                  KYC verification completed! Create a proposal for <strong>{selectedProduct.productName}</strong>
                </Alert>
              )
            ) : (
              <Alert severity="warning">
                <strong>KYC Verification Required</strong><br/>
                Your KYC status: <strong>{customerJourneyData?.enums?.kycStatuses?.find((s: any) => s.value === userKycStatus)?.name || 'Unknown'}</strong><br/>
                Complete KYC verification to create proposals.
                <Button 
                  variant="outlined" 
                  size="small" 
                  sx={{ ml: 2 }}
                  onClick={() => navigate('/kyc')}
                >
                  Go to KYC
                </Button>
              </Alert>
            )}
          </Box>
        )}
        
        <Grid container spacing={3}>
          {myProposals.map((proposal: any) => (
            <Grid size={{ xs: 12, md: 6 }} key={proposal.proposalId}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Proposal #{proposal.proposalId?.slice(-8) || 'N/A'}
                  </Typography>
                  <Typography color="text.secondary" gutterBottom>
                    Status: {customerJourneyData?.enums?.statuses?.find((s: any) => s.value === proposal.status)?.name || proposal.status || 'Unknown'}
                  </Typography>
                  <Typography variant="body2" mb={2}>
                    Premium: ₹{proposal.premiumAmount?.toLocaleString() || 'N/A'}
                  </Typography>
                  
                  {/* Show documents for this proposal */}
                  {myDocuments.filter((doc: any) => doc.proposalId === proposal.proposalId).length > 0 && (
                    <Box mb={2}>
                      <Typography variant="caption" color="text.secondary">
                        Documents: {myDocuments.filter((doc: any) => doc.proposalId === proposal.proposalId).length} uploaded
                      </Typography>
                    </Box>
                  )}
                  
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button 
                      variant="outlined" 
                      size="small"
                      onClick={() => navigate(`/proposal-details/${proposal.proposalId}`)}
                    >
                      View Details
                    </Button>
                    <Button 
                      variant="contained" 
                      size="small"
                      onClick={() => navigate('/kyc', { state: { proposalId: proposal.proposalId } })}
                    >
                      Upload Docs
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
        
        {myProposals.length === 0 && !loading && (
          <Box textAlign="center" py={8}>
            <Typography variant="h6" color="text.secondary">
              No proposals found
            </Typography>
            <Typography variant="body2" color="text.secondary" mt={1}>
              Create your first proposal to get started
            </Typography>
            {(userKycStatus === 1 || userKycStatus === 2) && (
              <Button 
                variant="contained" 
                sx={{ mt: 2 }}
                onClick={() => navigate('/products')}
              >
                Browse Products
              </Button>
            )}
          </Box>
        )}
      </Box>
      
      {/* Create Proposal Dialog */}
      <Dialog open={createProposalOpen} onClose={() => setCreateProposalOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle sx={{ pb: 2 }}>
          <Typography variant="h5" component="div">
            Create Proposal - {selectedProduct?.productName}
          </Typography>
        </DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <Grid container spacing={3} sx={{ mt: 1 }}>
            {/* Left Column */}
            <Grid size={{ xs: 12, md: 6 }}>
              <Typography variant="h6" gutterBottom color="primary">
                Policy Details
              </Typography>
              
              <TextField
                fullWidth
                label="Sum Assured (₹)"
                type="number"
                value={proposalData.sumAssured}
                onChange={(e) => setProposalData(prev => ({ ...prev, sumAssured: parseInt(e.target.value) }))}
                sx={{ mb: 2 }}
                InputProps={{ inputProps: { min: 50000, max: 10000000 } }}
              />
              
              <TextField
                fullWidth
                label="Term Years"
                type="number"
                value={proposalData.termYears}
                onChange={(e) => setProposalData(prev => ({ ...prev, termYears: parseInt(e.target.value) }))}
                sx={{ mb: 2 }}
                InputProps={{ inputProps: { min: 1, max: 100 } }}
              />
              
              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>Premium Frequency</InputLabel>
                <Select
                  value={proposalData.premiumFrequency}
                  onChange={(e) => setProposalData(prev => ({ ...prev, premiumFrequency: e.target.value as number }))}
                  label="Premium Frequency"
                >
                  {premiumFrequencies.map((freq: any) => (
                    <MenuItem key={freq.value} value={freq.value}>
                      {freq.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              
              <TextField
                fullWidth
                label="Annual Income (₹)"
                type="number"
                value={proposalData.annualIncome}
                onChange={(e) => setProposalData(prev => ({ ...prev, annualIncome: parseInt(e.target.value) }))}
                sx={{ mb: 2 }}
                InputProps={{ inputProps: { min: 100000, max: 10000000 } }}
              />
              
              <TextField
                fullWidth
                label="Occupation"
                value={proposalData.occupation}
                onChange={(e) => setProposalData(prev => ({ ...prev, occupation: e.target.value }))}
                sx={{ mb: 2 }}
              />
            </Grid>
            
            {/* Right Column */}
            <Grid size={{ xs: 12, md: 6 }}>
              <Typography variant="h6" gutterBottom color="primary">
                Personal Information
              </Typography>
              
              <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                <TextField
                  label="Height (cm)"
                  type="number"
                  value={proposalData.height}
                  onChange={(e) => setProposalData(prev => ({ ...prev, height: parseInt(e.target.value) }))}
                  InputProps={{ inputProps: { min: 50, max: 250 } }}
                  sx={{ flex: 1 }}
                />
                <TextField
                  label="Weight (kg)"
                  type="number"
                  value={proposalData.weight}
                  onChange={(e) => setProposalData(prev => ({ ...prev, weight: parseInt(e.target.value) }))}
                  InputProps={{ inputProps: { min: 20, max: 300 } }}
                  sx={{ flex: 1 }}
                />
              </Box>
              
              <TextField
                fullWidth
                label="Pre-existing Conditions"
                value={proposalData.preExistingConditions}
                onChange={(e) => setProposalData(prev => ({ ...prev, preExistingConditions: e.target.value }))}
                placeholder="Enter 'None' if no conditions"
                multiline
                rows={2}
                sx={{ mb: 2 }}
              />
              
              <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                <FormControl sx={{ flex: 1 }}>
                  <InputLabel>Smoker?</InputLabel>
                  <Select
                    value={proposalData.isSmoker ? 'true' : 'false'}
                    onChange={(e) => setProposalData(prev => ({ ...prev, isSmoker: e.target.value === 'true' }))}
                    label="Smoker?"
                  >
                    <MenuItem value="false">No</MenuItem>
                    <MenuItem value="true">Yes</MenuItem>
                  </Select>
                </FormControl>
                
                <FormControl sx={{ flex: 1 }}>
                  <InputLabel>Drinker?</InputLabel>
                  <Select
                    value={proposalData.isDrinker ? 'true' : 'false'}
                    onChange={(e) => setProposalData(prev => ({ ...prev, isDrinker: e.target.value === 'true' }))}
                    label="Drinker?"
                  >
                    <MenuItem value="false">No</MenuItem>
                    <MenuItem value="true">Yes</MenuItem>
                  </Select>
                </FormControl>
              </Box>
            </Grid>
            
            {/* Full Width Alert */}
            <Grid size={{ xs: 12 }}>
              <Alert severity="info" sx={{ mt: 2 }}>
                <Typography variant="body2">
                  After creating the proposal, you'll need to upload proposal-specific documents (income proof, medical reports, etc.) for underwriter review.
                </Typography>
              </Alert>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 2 }}>
          <Button onClick={() => setCreateProposalOpen(false)} size="large">
            Cancel
          </Button>
          <Button variant="contained" onClick={handleCreateProposal} size="large">
            Create Proposal
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}


