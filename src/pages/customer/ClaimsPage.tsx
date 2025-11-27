import { useEffect, useState } from 'react';
import { Container, Typography, Box, Button, Dialog, DialogTitle, DialogContent, Paper, Grid, Chip, Alert } from '@mui/material';
import { Timeline, TimelineItem, TimelineSeparator, TimelineConnector, TimelineContent, TimelineDot } from '@mui/lab';
import { ArrowBack, Upload } from '@mui/icons-material';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import type { RootState, AppDispatch } from '../../store';
import { fetchMyClaims, fetchRequiredDocuments, fetchClaimTimeline } from '../../slices/claimSlice';
import { fetchMyPolicies } from '../../slices/policySlice';
import { documentApi } from '../../api/document.api';
import ClaimTable from '../../components/tables/ClaimTable';
import ClaimForm from '../../components/forms/ClaimForm';
import DocumentUpload from '../../components/forms/DocumentUpload';
import DocumentTable from '../../components/tables/DocumentTable';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { type Claim } from '../../types/Claim';
import type { DocumentResponse } from '../../types/Document';

export default function ClaimsPage() {
  const { claimId } = useParams<{ claimId?: string }>();
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { user } = useSelector((state: RootState) => state.auth);
  const { myClaims, loading, requiredDocuments, claimTimeline } = useSelector((state: RootState) => state.claim);
  const { policies } = useSelector((state: RootState) => state.policy);
  const [claimFormOpen, setClaimFormOpen] = useState(false);
  const [selectedPolicyId, setSelectedPolicyId] = useState('');
  const [claimDocuments, setClaimDocuments] = useState<DocumentResponse[]>([]);
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [documentsLoading, setDocumentsLoading] = useState(false);

  const userId = user?.id || '';

  useEffect(() => {
    if (userId) {
      void dispatch(fetchMyClaims(userId));
      void dispatch(fetchMyPolicies(userId));
    }
  }, [dispatch, userId]);

  // Claims are already in the correct format from the slice
  const selectedClaim = claimId ? myClaims.find(c => c.claimId === claimId) : null;

  useEffect(() => {
    if (selectedClaim?.claimNumber) {
      console.log('Loading claim details for:', selectedClaim.claimNumber);
      dispatch(fetchRequiredDocuments(selectedClaim.claimNumber));
      dispatch(fetchClaimTimeline(selectedClaim.claimNumber));
      loadClaimDocuments();
    }
  }, [dispatch, selectedClaim?.claimNumber]);

  const handleViewDetails = (claim: Claim) => {
    navigate(`/claims/${claim.claimId}`);
  };

  const handleUploadDocuments = (claim: Claim) => {
    // Navigate to KYC page with claim context for document upload
    navigate('/kyc', {
      state: {
        claimContext: true,
        claimId: claim.claimId,
        claimNumber: claim.claimNumber,
        claimType: claim.claimType,
        claimAmount: claim.claimAmount
      }
    });
  };

  const loadClaimDocuments = async () => {
    if (!claimId) return;
    setDocumentsLoading(true);
    try {
      const docs = await documentApi.getDocumentsByClaim(claimId);
      setClaimDocuments(docs);
    } catch (error) {
      console.error('Failed to load claim documents:', error);
    } finally {
      setDocumentsLoading(false);
    }
  };

  const handleDocumentUpload = () => {
    setUploadDialogOpen(false);
    loadClaimDocuments();
  };

  const handleDownload = async (doc: DocumentResponse) => {
    try {
      const blob = await documentApi.downloadDocument(doc.documentId);
      const url = window.URL.createObjectURL(blob);
      const downloadLink = window.document.createElement('a');
      downloadLink.href = url;
      downloadLink.download = doc.fileName || 'document';
      window.document.body.appendChild(downloadLink);
      downloadLink.click();
      window.URL.revokeObjectURL(url);
      window.document.body.removeChild(downloadLink);
    } catch (error) {
      console.error('Download failed:', error);
    }
  };

  const getStatusColor = (status: number) => {
    switch (status) {
      case 3: return 'success';  // Approved
      case 4: return 'error';    // Rejected
      case 2: return 'warning';  // Pending
      case 11: return 'info';    // Filed
      case 21: return 'warning'; // UnderReview
      case 14: return 'success'; // Settled
      default: return 'default';
    }
  };

  const getStatusLabel = (status: number) => {
    const statusMap: Record<number, string> = {
      0: 'Active',
      1: 'Inactive', 
      2: 'Pending',
      3: 'Approved',
      4: 'Rejected',
      5: 'Cancelled',
      6: 'Expired',
      7: 'Lapsed',
      8: 'Surrendered',
      9: 'Matured',
      10: 'Claimed',
      11: 'Filed',
      12: 'UnderInvestigation',
      13: 'SurveyorAssigned',
      14: 'Settled'
    };
    return statusMap[status] ?? 'Unknown';
  };

  const handleFileNewClaim = () => {
    if (policies.length > 0) {
      setSelectedPolicyId(policies[0].policyId);
      setClaimFormOpen(true);
    }
  };

  const handleClaimFiled = () => {
    setClaimFormOpen(false);
    // Refresh claims list
    if (userId) {
      void dispatch(fetchMyClaims(userId));
    }
  };

  if (loading) {
    return <LoadingSpinner message="Loading claims..." />;
  }

  // Debug claim data
  console.log('ClaimId from params:', claimId);
  console.log('Selected claim:', selectedClaim);
  console.log('All claims:', myClaims);

  // Show claim details if claimId is provided
  if (claimId && selectedClaim) {
    return (
      <Container maxWidth="lg">
        <Box py={4}>
          <Box display="flex" alignItems="center" mb={3}>
            <Button
              startIcon={<ArrowBack />}
              onClick={() => navigate('/claims')}
              sx={{ mr: 2 }}
            >
              Back to Claims
            </Button>
            <Typography variant="h4">
              Claim Details
            </Typography>
          </Box>

          <Grid container spacing={3}>
            {/* Claim Information */}
            <Grid size={{ xs: 12, md: 8 }}>
              <Paper sx={{ p: 3, mb: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Claim Information
                </Typography>
                <Grid container spacing={2}>
                  <Grid size={6}>
                    <Typography variant="body2" color="text.secondary">
                      Claim Number
                    </Typography>
                    <Typography variant="body1" fontWeight="medium">
                      {selectedClaim.claimNumber}
                    </Typography>
                  </Grid>
                  <Grid size={6}>
                    <Typography variant="body2" color="text.secondary">
                      Status
                    </Typography>
                    <Chip 
                      label={getStatusLabel(selectedClaim.status)} 
                      color={getStatusColor(selectedClaim.status)} 
                      size="small"
                    />
                  </Grid>
                  <Grid size={6}>
                    <Typography variant="body2" color="text.secondary">
                      Claim Amount
                    </Typography>
                    <Typography variant="h6" color="primary.main">
                      ₹{selectedClaim.claimAmount.toLocaleString()}
                    </Typography>
                  </Grid>
                  <Grid size={6}>
                    <Typography variant="body2" color="text.secondary">
                      Filed Date
                    </Typography>
                    <Typography variant="body1">
                      {new Date(selectedClaim.filedDate).toLocaleDateString()}
                    </Typography>
                  </Grid>
                  {selectedClaim.approvedAmount && (
                    <Grid size={6}>
                      <Typography variant="body2" color="text.secondary">
                        Approved Amount
                      </Typography>
                      <Typography variant="h6" color="success.main">
                        ₹{selectedClaim.approvedAmount.toLocaleString()}
                      </Typography>
                    </Grid>
                  )}
                </Grid>
              </Paper>

              {/* Required Documents */}
              <Paper sx={{ p: 3, mb: 3 }}>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                  <Typography variant="h6">
                    Required Documents
                  </Typography>
                  <Button
                    variant="contained"
                    startIcon={<Upload />}
                    onClick={() => setUploadDialogOpen(true)}
                  >
                    Upload Documents
                  </Button>
                </Box>
                
                {requiredDocuments.length > 0 && (
                  <Alert severity="info" sx={{ mb: 2 }}>
                    Please upload the following documents: {requiredDocuments.join(', ')}
                  </Alert>
                )}

                {documentsLoading ? (
                  <LoadingSpinner message="Loading documents..." />
                ) : claimDocuments.length > 0 ? (
                  <DocumentTable
                    documents={claimDocuments}
                    onDownload={handleDownload}
                    showActions={true}
                    showVerifyActions={false}
                  />
                ) : (
                  <Box textAlign="center" py={4}>
                    <Typography variant="body2" color="text.secondary">
                      No documents uploaded yet
                    </Typography>
                  </Box>
                )}
              </Paper>
            </Grid>

            {/* Timeline */}
            <Grid size={{ xs: 12, md: 4 }}>
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Claim Timeline
                </Typography>
                {claimTimeline.length > 0 ? (
                  <Timeline>
                    {claimTimeline.map((item: any, index: number) => (
                      <TimelineItem key={index}>
                        <TimelineSeparator>
                          <TimelineDot color="primary" />
                          {index < claimTimeline.length - 1 && <TimelineConnector />}
                        </TimelineSeparator>
                        <TimelineContent>
                          <Typography variant="body2" fontWeight="medium">
                            {item.status}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {new Date(item.date).toLocaleDateString()}
                          </Typography>
                          {item.notes && (
                            <Typography variant="body2" color="text.secondary">
                              {item.notes}
                            </Typography>
                          )}
                        </TimelineContent>
                      </TimelineItem>
                    ))}
                  </Timeline>
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    No timeline available
                  </Typography>
                )}
              </Paper>
            </Grid>
          </Grid>

          {/* Document Upload Dialog */}
          <DocumentUpload
            open={uploadDialogOpen}
            onClose={() => setUploadDialogOpen(false)}
            onUpload={handleDocumentUpload}
            claimId={claimId}
            userId={user?.id || ''}
          />
        </Box>
      </Container>
    );
  }

  // Show claims list (default view)
  return (
    <Container maxWidth="lg">
      <Box py={4}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
          <Typography variant="h4" component="h1">
            My Claims
          </Typography>
          <Button 
            variant="contained" 
            onClick={handleFileNewClaim}
            disabled={policies.length === 0}
          >
            File New Claim
          </Button>
        </Box>

        {myClaims.length > 0 ? (
          <ClaimTable
            claims={myClaims}
            onViewDetails={handleViewDetails}
            onUploadDocuments={handleUploadDocuments}
          />
        ) : (
          <Box textAlign="center" py={8}>
            <Typography variant="h5" color="text.secondary" gutterBottom>
              No claims found
            </Typography>
            <Typography variant="body1" color="text.secondary" mb={3}>
              {policies.length === 0 
                ? 'You need an active policy to file a claim'
                : 'You haven\'t filed any claims yet'
              }
            </Typography>
            {policies.length > 0 ? (
              <Button 
                variant="contained" 
                size="large"
                onClick={handleFileNewClaim}
              >
                File Your First Claim
              </Button>
            ) : (
              <Button 
                variant="outlined" 
                size="large"
                onClick={() => window.location.href = '/products'}
              >
                Get Insurance First
              </Button>
            )}
          </Box>
        )}
      </Box>

      {/* Claim Form Dialog */}
      <Dialog 
        open={claimFormOpen} 
        onClose={() => setClaimFormOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>File Insurance Claim</DialogTitle>
        <DialogContent>
          <ClaimForm
            policyId={selectedPolicyId}
            onClaimFiled={handleClaimFiled}
          />
        </DialogContent>
      </Dialog>
    </Container>
  );
}
