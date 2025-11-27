import { Card, CardContent, CardActions, Typography, Button, Chip, Box, Divider, LinearProgress } from '@mui/material';
import { type Claim } from '../../types/Claim';
import { useSelector } from 'react-redux';
import type { RootState } from '../../store';

interface ClaimCardProps {
  claim: Claim;
  onViewDetails: (claim: Claim) => void;
  onUploadDocuments?: (claim: Claim) => void;
}

export default function ClaimCard({ claim, onViewDetails, onUploadDocuments }: ClaimCardProps) {
  const { statuses } = useSelector((state: RootState) => state.enum);

  const getStatusColor = (status: number) => {
    switch (status) {
      case 3: return 'success'; 
      case 4: return 'error';  
      case 2: return 'warning'; 
      case 11: return 'info';   
      case 21: return 'warning'; 
      case 14: return 'success';
      default: return 'default';
    }
  };

  const getStatusLabel = (status: number) => {
    const statusEnum = statuses.find(s => s.value === status);
    return statusEnum?.name || 'Unknown';
  };

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

  const getRelationshipLabel = (relation: number) => {
    
    const relationMap: Record<number, string> = {
      0: 'Self',
      1: 'Spouse',
      2: 'Child',
      3: 'Parent',
      13: 'Nominee',
      14: 'Legal Heir'
    };
    return relationMap[relation] ?? 'Other';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN');
  };

  const formatCurrency = (amount: number) => {
    return `₹${amount.toLocaleString()}`;
  };

  const getProgressValue = () => {
    switch (claim.status) {
      case 11: return 25;  // Filed
      case 21: return 50;  // UnderReview
      case 12: return 75;  // UnderInvestigation
      case 3: return 100;  // Approved
      case 14: return 100; // Settled
      case 4: return 100;  // Rejected
      default: return 0;
    }
  };

  return (
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <CardContent sx={{ flexGrow: 1 }}>
        <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
          <Typography variant="h6" component="h3">
            {claim.claimNumber}
          </Typography>
          <Chip 
            label={getStatusLabel(claim.status)} 
            color={getStatusColor(claim.status)} 
            size="small" 
          />
        </Box>
        
        <Typography variant="body2" color="text.secondary" gutterBottom>
          {getClaimTypeLabel(claim.claimType)} Claim
        </Typography>
        
        <Box mt={2}>
          <Typography variant="body2">
            <strong>Claim Amount:</strong> {formatCurrency(claim.claimAmount)}
          </Typography>
          {claim.approvedAmount && (
            <Typography variant="body2" color="success.main">
              <strong>Approved Amount:</strong> {formatCurrency(claim.approvedAmount)}
            </Typography>
          )}
          <Typography variant="body2">
            <strong>Incident Date:</strong> {formatDate(claim.incidentDate)}
          </Typography>
          <Typography variant="body2">
            <strong>Filed Date:</strong> {formatDate(claim.filedDate)}
          </Typography>
        </Box>

        <Box mt={2}>
          <Typography variant="body2" gutterBottom>
            <strong>Claimant:</strong> {claim.claimantName} ({getRelationshipLabel(claim.claimantRelation ?? 0)})
          </Typography>
        </Box>

        <Divider sx={{ my: 2 }} />

        <Box>
          <Typography variant="body2" gutterBottom>
            Processing Progress
          </Typography>
          <LinearProgress 
            variant="determinate" 
            value={getProgressValue()} 
            sx={{ height: 8, borderRadius: 4 }}
          />
        </Box>

        {claim.requiresInvestigation && (
          <Chip 
            label="Under Investigation" 
            color="warning" 
            size="small" 
            sx={{ mt: 1 }}
          />
        )}
      </CardContent>
      
      <CardActions sx={{ justifyContent: 'space-between', p: 2 }}>
        <Button size="small" onClick={() => onViewDetails(claim)}>
          View Details
        </Button>
        {claim.status === 11 && onUploadDocuments && (
          <Button 
            variant="outlined" 
            size="small" 
            onClick={() => onUploadDocuments(claim)}
          >
            Upload Docs
          </Button>
        )}
      </CardActions>
    </Card>
  );
}
