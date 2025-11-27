import { useEffect, useState } from 'react';
import { Container, Typography, Box, Alert, Dialog, DialogTitle, DialogContent, DialogActions, Button } from '@mui/material';
import { useLocation, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import DocumentTable from '../../components/tables/DocumentTable';
import { type PolicyProduct } from '../../types/Product';
import { documentApi } from '../../api/document.api';
import { policyApi } from '../../api/policy.api';

import { fetchUnderwriterDashboard, forceRefreshUnderwriterDashboard } from '../../slices/dashboardSlice';
import { fetchAllEnums } from '../../slices/enumSlice';
import type { RootState, AppDispatch } from '../../store';
import type { DocumentResponse, Document } from '../../types/Document';

export default function DocumentVerification() {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useSelector((state: RootState) => state.auth);
  const { underwriterData, loading } = useSelector((state: RootState) => state.dashboard);
  const [error] = useState('');
  const [policyIssuanceDialog, setPolicyIssuanceDialog] = useState(false);
  const [showOnlyPending, setShowOnlyPending] = useState(true);
  
  const proposalCreated = location.state?.proposalCreated as boolean | undefined;
  const selectedProduct = location.state?.selectedProduct as PolicyProduct | undefined;
  const proposalData = location.state?.proposalData;
  const specificUserId = location.state?.userId as string | undefined;
  const customerName = location.state?.customerName as string | undefined;

  // Convert cached document data to DocumentResponse type
  const documents: DocumentResponse[] = underwriterData?.documents?.map((d: any) => ({
    documentId: d.documentId,
    userId: d.userId,
    proposalId: d.proposalId,
    policyId: d.policyId,
    claimId: d.claimId,
    documentType: d.documentType,
    fileName: d.fileName,
    filePath: d.filePath,
    status: d.status,
    uploadedAt: d.uploadedDate,
    verifiedAt: d.verifiedDate,
    verificationNotes: d.notes,
    customerName: d.customerName,
    fullName: d.fullName
  })) || [];

  useEffect(() => {
    // Load enums first
    dispatch(fetchAllEnums());
    
    // Load underwriter data if not already loaded
    if (!underwriterData && user?.id) {
      dispatch(fetchUnderwriterDashboard(user.id));
    }
  }, [dispatch, underwriterData, user?.id]);
  
  // Filter documents based on context
  let relevantDocuments = documents;
  
  if (specificUserId) {
    // Show documents for specific user
    relevantDocuments = documents.filter(d => d.userId === specificUserId);
  } else if (proposalCreated && proposalData?.proposalId) {
    // Show documents for specific proposal
    relevantDocuments = documents.filter(d => d.proposalId === proposalData.proposalId);
  } else if (showOnlyPending) {
    // Show only pending documents (status 18 = Uploaded)
    relevantDocuments = documents.filter(d => Number(d.status) === 18);
  }

  const pendingCount = relevantDocuments.filter(d => Number(d.status) === 18).length;
  const totalCount = documents.length;

  const handleVerify = async (document: Document, status: string) => {
    try {
      await documentApi.verifyDocument({
        documentId: document.documentId,
        isVerified: status === 'Verified',
        verificationNotes: `Document ${status.toLowerCase()} by underwriter`
      });
      
      // Refresh cached data
      if (user?.id) {
        dispatch(fetchUnderwriterDashboard(user.id));
      }
      
      if (proposalCreated && selectedProduct && status === 'Verified') {
        setPolicyIssuanceDialog(true);
      }
    } catch (error) {
      console.error('Document verification failed:', error);
    }
  };

  const handleDownload = async (document: Document) => {
    try {
      const blob = await documentApi.downloadDocument(document.documentId);
      const url = window.URL.createObjectURL(blob);
      const link = window.document.createElement('a');
      link.href = url;
      link.download = document.fileName || 'document';
      window.document.body.appendChild(link);
      link.click();
      window.URL.revokeObjectURL(url);
      window.document.body.removeChild(link);
    } catch (error) {
      console.error('Download failed:', error);
    }
  };

  const handleRefresh = () => {
    if (user?.id) {
      dispatch(forceRefreshUnderwriterDashboard(user.id));
    }
  };


  
  const handleIssuePolicy = async () => {
    try {
      if (proposalData?.proposalId) {
        await policyApi.issueFromProposal(proposalData.proposalId);
        setPolicyIssuanceDialog(false);
        
        navigate('/policies', { 
          state: { 
            policyIssued: true, 
            productName: selectedProduct?.productName 
          } 
        });
      }
    } catch (error) {
      console.error('Policy issuance failed:', error);
    }
  };

  if (loading) {
    return <LoadingSpinner message="Loading documents..." />;
  }

  if (error) {
    return (
      <Container maxWidth="lg">
        <Box py={4}>
          <Alert severity="error">
            Error loading documents: {error}
          </Alert>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box py={4}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h4">
            {specificUserId ? `Documents for ${customerName}` : 'Document Verification'}
          </Typography>
          {!specificUserId && !proposalCreated && (
            <Box>
              <Button 
                onClick={handleRefresh}
                variant="outlined" 
                size="small"
                sx={{ mr: 1 }}
              >
                🔄 Refresh
              </Button>
              <Button 
                variant={showOnlyPending ? 'contained' : 'outlined'}
                onClick={() => {
                  setShowOnlyPending(!showOnlyPending);
                }}
                size="small"
              >
                {showOnlyPending ? 'Show All Documents' : 'Show Pending Only'}
              </Button>
            </Box>
          )}
        </Box>
        
        {proposalCreated && selectedProduct && (
          <Alert severity="info" sx={{ mb: 3 }}>
            New proposal created for <strong>{selectedProduct.productName}</strong>. 
            Verify all documents to proceed with policy issuance.
          </Alert>
        )}
        
        <Typography variant="subtitle1" color="text.secondary" mb={2}>
          {specificUserId 
            ? `${relevantDocuments.length} total documents (${pendingCount} pending verification)`
            : showOnlyPending 
              ? `${relevantDocuments.length} pending documents (${totalCount} total documents)`
              : `${relevantDocuments.length} total documents (${pendingCount} pending verification)`
          }
        </Typography>
        
        {relevantDocuments.length > 0 ? (
          <DocumentTable
            documents={relevantDocuments}
            onDownload={handleDownload}
            onDelete={undefined}
            onVerify={handleVerify}
            showActions={true}
            showVerifyActions={true}
          />
        ) : null}
        
        {relevantDocuments.length === 0 && !loading && (
          <Box textAlign="center" py={8}>
            <Typography variant="h6" color="text.secondary">
              No pending documents
            </Typography>
            {proposalCreated && (
              <Typography variant="body2" color="text.secondary" mt={1}>
                All documents for this proposal have been processed.
              </Typography>
            )}
          </Box>
        )}
      </Box>
      
      {/* Policy Issuance Dialog */}
      <Dialog open={policyIssuanceDialog} onClose={() => setPolicyIssuanceDialog(false)}>
        <DialogTitle>Issue Policy</DialogTitle>
        <DialogContent>
          <Alert severity="success" sx={{ mb: 2 }}>
            All documents have been verified successfully!
          </Alert>
          <Typography variant="body1">
            Ready to issue policy for <strong>{selectedProduct?.productName}</strong>?
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            This will create an active insurance policy for the customer.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPolicyIssuanceDialog(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleIssuePolicy}>Issue Policy</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}


