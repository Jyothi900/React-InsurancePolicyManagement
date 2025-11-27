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
  Typography
} from '@mui/material';
import { type Policy } from '../../types/Policy';
import type { Status } from '../../types/Common';
import { useSelector } from 'react-redux';
import type { RootState } from '../../store';

interface PolicyTableProps {
  policies: Policy[];
  onViewDetails: (policy: Policy) => void;
  onPayPremium?: (policy: Policy) => void;
  showActions?: boolean;
}

export default function PolicyTable({ 
  policies, 
  onViewDetails, 
  onPayPremium, 
  showActions = true 
}: PolicyTableProps) {
  const { statuses } = useSelector((state: RootState) => state.enum);
  
  const getStatusColor = (status: Status) => {
    switch (status) {
      case 0: return 'success';  // Active
      case 6: return 'error';    // Expired
      case 5: return 'default';  // Cancelled
      case 7: return 'warning';  // Lapsed
      case 8: return 'default';  // Surrendered
      case 9: return 'info';     // Matured
      default: return 'warning';
    }
  };

  const getStatusLabel = (status: Status) => {
    const statusEnum = statuses.find(s => s.value === status);
    return statusEnum?.name || 'Unknown';
  };

  const getPolicyTypeLabel = (policyType: number) => {
    const typeLabels = ['Term Life', 'Endowment', 'ULIP', 'Money Back', 'Pension', 'Child Plan', 'Personal Accident'];
    return typeLabels[policyType] || 'Unknown';
  };

  const getPremiumFrequencyLabel = (frequency: number) => {
    const frequencyLabels = ['Monthly', 'Quarterly', 'Half Yearly', 'Annual'];
    return frequencyLabels[frequency] || 'Unknown';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN');
  };

  const formatCurrency = (amount: number) => {
    return `₹${amount.toLocaleString()}`;
  };

  if (policies.length === 0) {
    return (
      <Paper sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="h6" color="text.secondary">
          No policies found
        </Typography>
      </Paper>
    );
  }

  return (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell><strong>Policy Number</strong></TableCell>
            <TableCell><strong>Type</strong></TableCell>
            <TableCell><strong>Sum Assured</strong></TableCell>
            <TableCell><strong>Premium</strong></TableCell>
            <TableCell><strong>Status</strong></TableCell>
            <TableCell><strong>Next Due</strong></TableCell>
            {showActions && <TableCell><strong>Actions</strong></TableCell>}
          </TableRow>
        </TableHead>
        <TableBody>
          {policies.map((policy) => {
            const isExpiringSoon = policy.nextPremiumDue && 
              new Date(policy.nextPremiumDue) <= new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
            
            return (
              <TableRow key={policy.policyId} hover>
                <TableCell>
                  <Typography variant="body2" fontWeight="medium">
                    {policy.policyNumber}
                  </Typography>
                </TableCell>
                <TableCell>{getPolicyTypeLabel(policy.policyType)}</TableCell>
                <TableCell>{formatCurrency(policy.sumAssured)}</TableCell>
                <TableCell>
                  {formatCurrency(policy.premiumAmount)}
                  <Typography variant="caption" display="block" color="text.secondary">
                    {getPremiumFrequencyLabel(policy.premiumFrequency)}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Chip 
                    label={getStatusLabel(policy.status)} 
                    color={getStatusColor(policy.status)} 
                    size="small" 
                  />
                </TableCell>
                <TableCell>
                  {policy.nextPremiumDue ? (
                    <Typography 
                      variant="body2" 
                      color={isExpiringSoon ? 'error.main' : 'text.primary'}
                    >
                      {formatDate(policy.nextPremiumDue)}
                      {isExpiringSoon && (
                        <Typography variant="caption" display="block" color="error.main">
                          Due Soon!
                        </Typography>
                      )}
                    </Typography>
                  ) : (
                    '-'
                  )}
                </TableCell>
                {showActions && (
                  <TableCell>
                    <Box display="flex" gap={1}>
                      <Button 
                        size="small" 
                        onClick={() => onViewDetails(policy)}
                      >
                        View
                      </Button>
                      {policy.status === 0 && onPayPremium && ( // Active status
                        <Button 
                          size="small" 
                          variant="outlined"
                          color={isExpiringSoon ? 'error' : 'primary'}
                          onClick={() => onPayPremium(policy)}
                        >
                          Pay Premium
                        </Button>
                      )}
                    </Box>
                  </TableCell>
                )}
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
