import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Button,
  Box,
  Typography,
  LinearProgress
} from '@mui/material';
import { type Claim } from '../../types/Claim';



interface ClaimTableProps {
  claims: Claim[];
  onViewDetails: (claim: Claim) => void;
  onUpdateStatus?: (claim: Claim) => void;
  onUploadDocuments?: (claim: Claim) => void;
  showActions?: boolean;
}

export default function ClaimTable({ 
  claims, 
  onViewDetails, 
  onUpdateStatus,
  onUploadDocuments, 
  showActions = true 
}: ClaimTableProps) {

  
  const getStatusColor = (status: any) => {
    const stat = typeof status === 'string' ? status : status?.toString();
    
    if (stat?.includes('Approved') || stat === '3' || stat === '14') return 'success';
    if (stat?.includes('Rejected') || stat === '4') return 'error';
    if (stat?.includes('Pending') || stat === '2' || stat?.includes('Review') || stat === '21') return 'warning';
    if (stat?.includes('Filed') || stat === '11' || stat?.includes('Investigation') || stat === '12' || stat?.includes('Surveyor') || stat === '13') return 'info';
    
    return 'default';
  };

  const getStatusLabel = (status: any, claimObj?: any) => {
    const stat = status ?? (claimObj as any)?.Status ?? claimObj?.status;
    
    if (stat === undefined || stat === null) {
      return 'Unknown';
    }
    
    // Handle string status values directly
    if (typeof stat === 'string') {
      const stringStatusMap: Record<string, string> = {
        'Pending': 'Pending',
        'Approved': 'Approved', 
        'Rejected': 'Rejected',
        'Filed': 'Filed',
        'UnderReview': 'Under Review',
        'UnderInvestigation': 'Under Investigation',
        'SurveyorAssigned': 'Surveyor Assigned',
        'Settled': 'Settled',
        'Active': 'Active',
        'Inactive': 'Inactive'
      };
      return stringStatusMap[stat] ?? stat;
    }
    
    // Handle numeric status values
    const statusMap: Record<number, string> = {
      0: 'Active', 1: 'Inactive', 2: 'Pending', 3: 'Approved', 4: 'Rejected',
      5: 'Cancelled', 6: 'Expired', 7: 'Lapsed', 8: 'Surrendered', 9: 'Matured',
      10: 'Claimed', 11: 'Filed', 12: 'Under Investigation', 13: 'Surveyor Assigned',
      14: 'Settled', 21: 'Under Review'
    };
    
    return statusMap[stat] ?? `Status-${stat}`;
  };

  const getClaimTypeLabel = (claimType: any) => {
    if (claimType === undefined || claimType === null) return 'Unknown';
    
    const claimTypeMap: Record<number, string> = {
      0: 'Death', 1: 'Maturity', 2: 'Surrender', 3: 'Disability',
      4: 'Own Damage', 5: 'Third Party'
    };
    
    return claimTypeMap[claimType] ?? 'Unknown';
  };

  const formatDate = (dateString: string) => {
    try {
      if (!dateString) return 'Invalid Date';
      const date = new Date(dateString);
      return isNaN(date.getTime()) ? 'Invalid Date' : date.toLocaleDateString('en-IN');
    } catch {
      return 'Invalid Date';
    }
  };

  const formatCurrency = (amount: any) => {
    if (!amount || amount <= 0) return '₹0';
    return `₹${amount.toLocaleString()}`;
  };

  const getProgressValue = (status: any) => {
    const stat = typeof status === 'string' ? status : status?.toString();
    
    if (stat?.includes('Pending') || stat === '2') return 10;
    if (stat?.includes('Filed') || stat === '11') return 25;
    if (stat?.includes('Review') || stat === '21') return 50;
    if (stat?.includes('Investigation') || stat === '12') return 65;
    if (stat?.includes('Surveyor') || stat === '13') return 80;
    if (stat?.includes('Approved') || stat === '3' || stat?.includes('Settled') || stat === '14' || stat?.includes('Rejected') || stat === '4') return 100;
    
    return 0;
  };

  if (claims.length === 0) {
    return (
      <Paper sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="h6" color="text.secondary">
          No claims found
        </Typography>
      </Paper>
    );
  }

  return (
    <TableContainer component={Paper} sx={{ borderRadius: 3, overflow: 'hidden', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}>
      <Table>
        <TableHead>
          <TableRow sx={{ background: 'linear-gradient(135deg, #006064 0%, #4DB6AC 100%)' }}>
            <TableCell sx={{ color: 'white', fontWeight: 600 }}>Claim Number</TableCell>
            <TableCell sx={{ color: 'white', fontWeight: 600 }}>Type</TableCell>
            <TableCell sx={{ color: 'white', fontWeight: 600 }}>Amount</TableCell>
            <TableCell sx={{ color: 'white', fontWeight: 600 }}>Status</TableCell>
            <TableCell sx={{ color: 'white', fontWeight: 600 }}>Progress</TableCell>
            <TableCell sx={{ color: 'white', fontWeight: 600 }}>Filed Date</TableCell>
            {showActions && <TableCell sx={{ color: 'white', fontWeight: 600 }}>Actions</TableCell>}
          </TableRow>
        </TableHead>
        <TableBody>
          {claims.map((claim) => (
            <TableRow key={claim.claimId} hover sx={{ '&:hover': { backgroundColor: '#F1F5F9' }, '&:nth-of-type(even)': { backgroundColor: '#F8FAFC' } }}>
              <TableCell>
                <Typography variant="body2" fontWeight="medium">
                  {claim.claimNumber}
                </Typography>
                {claim.requiresInvestigation && (
                  <Chip 
                    label="Investigation" 
                    size="small" 
                    color="warning" 
                    sx={{ mt: 0.5 }}
                  />
                )}
              </TableCell>
              <TableCell>
                {getClaimTypeLabel(claim.claimType)}
              </TableCell>
              <TableCell>
                <Typography variant="body2">
                  {formatCurrency(claim.claimAmount)}
                </Typography>
                {claim.approvedAmount && (
                  <Typography variant="caption" color="success.main" display="block">
                    Approved: {formatCurrency(claim.approvedAmount)}
                  </Typography>
                )}
              </TableCell>
              <TableCell>
                <Chip 
                  label={getStatusLabel(claim.status, claim)} 
                  color={getStatusColor(claim.status)} 
                  size="small" 
                />
              </TableCell>
              <TableCell>
                <Box sx={{ width: 100 }}>
                  <LinearProgress 
                    variant="determinate" 
                    value={getProgressValue(claim.status)} 
                    sx={{ height: 6, borderRadius: 3 }}
                  />
                </Box>
              </TableCell>
              <TableCell>
                <Typography variant="body2">
                  {formatDate(claim.filedDate)}
                </Typography>
                {claim.processedDate && (
                  <Typography variant="caption" color="text.secondary" display="block">
                    Processed: {formatDate(claim.processedDate)}
                  </Typography>
                )}
              </TableCell>
              {showActions && (
                <TableCell>
                  <Box display="flex" gap={1} flexWrap="wrap">
                    <Button 
                      size="small" 
                      variant="outlined"
                      onClick={() => onViewDetails(claim)}
                      sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 500 }}
                    >
                      View Details
                    </Button>
                    {onUploadDocuments && (claim.status === 11 || claim.status === 2 || claim.status === 21) && ( // Filed, Pending, or Under Review status
                      <Button 
                        size="small" 
                        variant="contained"
                        color="primary"
                        onClick={() => onUploadDocuments(claim)}
                      >
                        Upload Documents
                      </Button>
                    )}
                    {onUpdateStatus && claim.status === 11 && ( // Filed status
                      <Button 
                        size="small" 
                        variant="outlined"
                        onClick={() => onUpdateStatus(claim)}
                      >
                        Update
                      </Button>
                    )}
                  </Box>
                </TableCell>
              )}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
