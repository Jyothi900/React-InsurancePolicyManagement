import { useState, useEffect, memo } from 'react';
import { Container, Typography, Box, Button, Paper, Alert, Tabs, Tab, Chip } from '@mui/material';
import { useLocation, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { Upload, Refresh } from '@mui/icons-material';
import type { RootState, AppDispatch } from '../../store';
import { fetchCustomerJourneyData } from '../../slices/productSlice';
import { documentApi } from '../../api/document.api';
import { type ProposalDto } from '../../api/proposal.api';
import KYCUploadForm from '../../components/forms/KYCUploadForm';
import DocumentTable from '../../components/tables/DocumentTable';
import DocumentReuploadForm from '../../components/forms/DocumentReuploadForm';
import DocumentUpload from '../../components/forms/DocumentUpload';
import { type PolicyProduct } from '../../types/Product';
import type { Document } from '../../types/Document';
import { toast } from 'react-toastify';




function KYCPage() {
  const location = useLocation();

  const dispatch = useDispatch<AppDispatch>();
  const { user } = useSelector((state: RootState) => state.auth);
  const { customerJourneyData } = useSelector((state: RootState) => state.product);
  const myDocuments = customerJourneyData?.userDocuments || [];

  const [tabValue, setTabValue] = useState(0);
  const [reuploadDoc, setReuploadDoc] = useState<Document | null>(null);
  const [approvedProposals, setApprovedProposals] = useState<ProposalDto[]>([]);
  const [selectedProposal, setSelectedProposal] = useState<ProposalDto | null>(null);
  
  const selectedProduct = location.state?.selectedProduct as PolicyProduct | undefined;
  const proposalCreated = location.state?.proposalCreated as boolean | undefined;
  const proposalId = location.state?.proposalId as string | undefined;
  const requiredDocuments = location.state?.requiredDocuments as string[] | undefined;
  
  // Claim context
  const claimContext = location.state?.claimContext as boolean | undefined;
  const claimId = location.state?.claimId as string | undefined;
  const claimNumber = location.state?.claimNumber as string | undefined;
  const claimType = location.state?.claimType as number | undefined;
  const claimAmount = location.state?.claimAmount as number | undefined;
  
  useEffect(() => {
    let isMounted = true;
    
    const loadData = async () => {
      if (!user?.id || !isMounted) return;
      
      try {
        await dispatch(fetchCustomerJourneyData({ userId: user.id }));
      } catch (error) {
        console.error('Error loading data:', error);
      }
    };
    
    loadData();
    
    return () => {
      isMounted = false;
    };
  }, [user?.id]); 
  useEffect(() => {
    if (customerJourneyData?.userProposals) {
      loadProposalsNeedingDocs();
    }
  }, [customerJourneyData?.userProposals, proposalId]);

  const loadProposalsNeedingDocs = () => {
    if (!customerJourneyData?.userProposals) return;
    
    const proposals = customerJourneyData.userProposals;
    console.log('All proposals for user:', proposals);
    
   
    const needingDocs = proposals.filter((p: any) => {
      const statusNum = typeof p.status === 'string' ? parseInt(p.status) : p.status;
      console.log('Proposal status:', statusNum, 'for proposal:', p.proposalId);
      return statusNum === 21 || statusNum === 22 || statusNum === 3; 
    });
    
    console.log('Proposals needing documents:', needingDocs);
    setApprovedProposals(needingDocs);
    
   
    if (proposalId) {
      const matchingProposal = needingDocs.find((p: any) => p.proposalId === proposalId);
      if (matchingProposal) {
        setSelectedProposal(matchingProposal);
      }
    } else if (needingDocs.length === 1) {
      setSelectedProposal(needingDocs[0]);
    }
  };

  const showProposalTab = proposalCreated || approvedProposals.length > 0;

  const getClaimTypeLabel = (claimType: number) => {
    const claimTypeMap: Record<number, string> = {
      0: 'Death',
      1: 'Maturity',
      2: 'Surrender',
      3: 'Disability',
      4: 'Own Damage',
      5: 'Third Party'
    };
    return claimTypeMap[claimType] ?? 'Unknown';
  };
  
  
  const getClaimRequiredDocuments = (claimType: number) => {
    switch (claimType) {
      case 0: 
        return ['Death Certificate', 'Medical Certificate', 'Police Report (if applicable)', 'Identity Proof of Nominee'];
      case 1: 
        return ['Policy Document', 'Identity Proof', 'Bank Account Details'];
      case 2: 
        return ['Policy Document', 'Surrender Form', 'Identity Proof', 'Bank Account Details'];
      case 3: 
        return ['Medical Certificate', 'Disability Certificate', 'Doctor Report', 'Identity Proof'];
      case 4: 
        return ['FIR Copy', 'Driving License', 'RC Copy', 'Repair Estimates', 'Photos of Damage'];
      case 5: 
        return ['FIR Copy', 'Driving License', 'RC Copy', 'Third Party Details', 'Court Documents'];
      default:
        return ['Supporting Documents'];
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

  const handleDelete = async (document: Document) => {
    if (!user?.id) return;
    try {
      await documentApi.deleteDocument(document.documentId, user.id);
      dispatch(fetchCustomerJourneyData({ userId: user.id }));
    } catch (error) {
      console.error('Delete failed:', error);
    }
  };

  const refreshDocuments = () => {
    if (user?.id) {
      dispatch(fetchCustomerJourneyData({ userId: user.id }));
    }
  };

  const handleReupload = (document: Document) => {
    setReuploadDoc(document);
  };

  return (
    <Container maxWidth="lg" sx={{ px: { xs: 1, sm: 2 } }}>
      <Box py={2}>
        <Typography variant="h4" gutterBottom>
          {claimContext ? 'Claim Document Upload' : 'KYC Verification'}
        </Typography>
        
        {claimContext && claimNumber && (
          <Alert severity="info" sx={{ mb: 2 }}>
            <Typography variant="h6" gutterBottom>
              Upload documents for Claim: <strong>{claimNumber}</strong>
            </Typography>
            <Typography variant="body2" gutterBottom>
              Claim Type: <strong>{getClaimTypeLabel(claimType || 0)}</strong> | 
              Amount: <strong>₹{claimAmount?.toLocaleString()}</strong>
            </Typography>
            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle2" gutterBottom>
                Required Documents for {getClaimTypeLabel(claimType || 0)} Claim:
              </Typography>
              <Box component="ul" sx={{ pl: 2, mb: 0 }}>
                {getClaimRequiredDocuments(claimType || 0).map((doc, index) => (
                  <Typography component="li" variant="body2" key={index}>
                    {doc}
                  </Typography>
                ))}
              </Box>
            </Box>
          </Alert>
        )}
        
        {proposalCreated && selectedProduct && (
          <Alert severity="success" sx={{ mb: 2 }}>
            <Typography variant="h6" gutterBottom>
              Proposal created for: <strong>{selectedProduct.productName}</strong>
            </Typography>
            <Typography variant="body2" gutterBottom>
              Proposal ID: <strong>{proposalId}</strong>
            </Typography>
            {requiredDocuments && requiredDocuments.length > 0 && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Required Documents for Your Proposal:
                </Typography>
                <Box component="ul" sx={{ pl: 2, mb: 0 }}>
                  {requiredDocuments.map((doc, index) => (
                    <Typography component="li" variant="body2" key={index}>
                      {doc}
                    </Typography>
                  ))}
                </Box>
              </Box>
            )}
          </Alert>
        )}
        
        {selectedProduct && !proposalCreated && (
          <Alert severity="info" sx={{ mb: 2 }}>
            Completing KYC for: <strong>{selectedProduct.productName}</strong>
            <br />After KYC verification by underwriter, you can create a proposal for this policy.
          </Alert>
        )}
        
        {!selectedProduct && !proposalCreated && approvedProposals.length === 0 && (
          <Alert severity="info" sx={{ mb: 2 }}>
            Upload your KYC documents for verification. Once verified, you can create proposals and purchase policies.
            <br /><br />
            <strong>Note:</strong> After creating proposals, return here to upload proposal-specific documents (medical reports, income proof, etc.) for underwriter review.
          </Alert>
        )}
        
        {approvedProposals.length > 0 && (
          <Alert severity="info" sx={{ mb: 2 }}>
            <Typography variant="h6" gutterBottom>
              You have {approvedProposals.length} proposal(s) requiring documents!
            </Typography>
            <Typography variant="body2">
              Please upload the required documents for your proposals in the "Proposal Documents" tab.
            </Typography>
          </Alert>
        )}
        
        <Paper elevation={2} sx={{ p: 1 }}>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
            <Tabs value={tabValue} onChange={(_, newValue) => setTabValue(newValue)}>
              {claimContext ? (
                [<Tab key="0" label="Claim Documents" />, <Tab key="1" label="My Documents" />]
              ) : (
                [
                  <Tab key="0" label={showProposalTab ? "KYC Documents" : "Upload Documents"} />,
                  ...(showProposalTab ? [<Tab key="1" label="Proposal Documents" />] : []),
                  <Tab key={showProposalTab ? "2" : "1"} label="My Documents" />
                ]
              )}
            </Tabs>
            <Button
              variant="outlined"
              startIcon={<Refresh />}
              onClick={refreshDocuments}
            >
              Refresh
            </Button>
          </Box>

          {tabValue === 0 && !claimContext && (
            <KYCUploadForm
              userId={user?.id || ''}
              onUploadComplete={() => {
                console.log('KYC documents uploaded - awaiting verification');
                refreshDocuments();
                setTabValue(proposalCreated ? 2 : 1); // Switch to documents tab
              }}
            />
          )}
          
          {tabValue === 0 && claimContext && (
            <Box>
              <Typography variant="h6" gutterBottom color="primary">
                Upload {getClaimTypeLabel(claimType || 0)} Claim Documents
              </Typography>
              
              <DocumentUpload
                userId={user?.id || ''}
                claimId={claimId}
                requiredDocuments={getClaimRequiredDocuments(claimType || 0)}
                documentTypes={customerJourneyData?.enums?.documentTypes || []}
                onUploadComplete={() => {
                  console.log('Claim documents uploaded');
                  refreshDocuments();
                  toast.success('Claim documents uploaded successfully!');
                  setTabValue(1); // Switch to documents tab
                }}
              />
            </Box>
          )}

          {tabValue === 1 && showProposalTab && (
            <Box>
              <Typography variant="h6" gutterBottom color="primary">
                Upload Proposal Documents
              </Typography>
              
              {/* Show proposals needing documents for selection */}
              {approvedProposals.length > 0 && (
                <Box sx={{ mb: 3 }}>
                  <Typography variant="subtitle1" gutterBottom>
                    Select Proposal for Document Upload:
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    {approvedProposals.map((proposal) => {
                      const statusName = customerJourneyData?.enums?.statuses?.find((s: any) => s.value === proposal.status)?.name || 'Unknown';
                      return (
                        <Chip
                          key={proposal.proposalId}
                          label={`${proposal.proposalId?.slice(-8)} - ${statusName} - ₹${proposal.sumAssured?.toLocaleString()}`}
                          icon={<Upload />}
                          color={selectedProposal?.proposalId === proposal.proposalId ? 'primary' : 'default'}
                          variant={selectedProposal?.proposalId === proposal.proposalId ? 'filled' : 'outlined'}
                          onClick={() => setSelectedProposal(proposal)}
                          sx={{ cursor: 'pointer' }}
                        />
                      );
                    })}
                  </Box>
                </Box>
              )}
              
              {selectedProposal && (
                <Alert severity="success" sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Uploading documents for: <strong>{selectedProposal.proposalId}</strong>
                  </Typography>
                  <Typography variant="body2">
                    Sum Assured: ₹{selectedProposal.sumAssured.toLocaleString()} | 
                    Premium: ₹{selectedProposal.premiumAmount.toLocaleString()}
                  </Typography>
                </Alert>
              )}

              <DocumentUpload
                userId={user?.id || ''}
                proposalId={selectedProposal?.proposalId || proposalId}
                requiredDocuments={requiredDocuments || ['Medical Certificate', 'Income Certificate', 'Identity Proof']}
                documentTypes={customerJourneyData?.enums?.documentTypes || []}
                onUploadComplete={() => {
                  console.log('Proposal documents uploaded');
                  refreshDocuments();
                  toast.success('Documents uploaded successfully!');
                  setTabValue(2); // Switch to documents tab
                }}
              />
            </Box>
          )}

          {tabValue === (claimContext ? 1 : showProposalTab ? 2 : 1) && (
            <Box>
              {myDocuments.length > 0 ? (
                <>
                  <Alert severity="info" sx={{ mb: 2 }}>
                    <strong>Document Status Information:</strong><br/>
                    • You can delete and re-upload documents with "Uploaded" or "Rejected" status<br/>
                    • Verified documents cannot be modified
                  </Alert>
                  <DocumentTable
                    documents={myDocuments}
                    onDownload={handleDownload}
                    onDelete={handleDelete}
                    onReupload={handleReupload}
                    showActions={true}
                  />
                </>
              ) : (
                <Alert severity="info">
                  No documents uploaded yet. Use the "Upload Documents" tab to add your KYC documents.
                </Alert>
              )}
            </Box>
          )}
        </Paper>
        
        <DocumentReuploadForm
          open={!!reuploadDoc}
          document={reuploadDoc}
          onClose={() => setReuploadDoc(null)}
          onSuccess={() => {
            refreshDocuments();
            setReuploadDoc(null);
          }}
        />
      </Box>
    </Container>
  );
}

export default memo(KYCPage);
