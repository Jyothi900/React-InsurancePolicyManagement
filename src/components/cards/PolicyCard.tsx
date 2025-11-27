import { Card, CardContent, CardActions, Typography, Button, Chip, Box, Divider } from '@mui/material';
import { type Policy } from '../../types/Policy';
import type { Status } from '../../types/Common';
import { useSelector } from 'react-redux';
import type { RootState } from '../../store';

interface PolicyCardProps {
  policy: Policy;
  onViewDetails: (policy: Policy) => void;
  onPayPremium?: (policy: Policy) => void;
  onFileClaim?: (policy: Policy) => void;
}

export default function PolicyCard({ policy, onViewDetails, onPayPremium, onFileClaim }: PolicyCardProps) {
  const { statuses } = useSelector((state: RootState) => state.enum);

  const getStatusColor = (status: Status) => {
    switch (status) {
      case 0: return 'success';  // Active
      case 6: return 'error';    // Expired
      case 5: return 'default';  // Cancelled
      default: return 'warning';
    }
  };

  const getStatusLabel = (status: number) => {
    const statusEnum = statuses.find(s => s.value === status);
    return statusEnum?.name || 'Unknown';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN');
  };

  const isActive = policy.status === 0; // Active status
  const isExpiringSoon = policy.nextPremiumDue && 
    new Date(policy.nextPremiumDue) <= new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

  return (
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <CardContent sx={{ flexGrow: 1 }}>
        <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
          <Typography variant="h6" component="h3">
            {policy.policyNumber}
          </Typography>
          <Chip 
            label={getStatusLabel(policy.status)} 
            color={getStatusColor(policy.status)} 
            size="small" 
          />
        </Box>
        
        <Typography variant="body2" color="text.secondary" gutterBottom>
          {policy.policyType}
        </Typography>
        
        <Box mt={2}>
          <Typography variant="body2">
            <strong>Sum Assured:</strong> ₹{policy.sumAssured.toLocaleString()}
          </Typography>
          <Typography variant="body2">
            <strong>Premium:</strong> ₹{policy.premiumAmount.toLocaleString()} ({policy.premiumFrequency})
          </Typography>
          <Typography variant="body2">
            <strong>Term:</strong> {policy.termYears} years
          </Typography>
        </Box>

        <Divider sx={{ my: 2 }} />

        <Box>
          <Typography variant="body2">
            <strong>Start Date:</strong> {formatDate(policy.startDate)}
          </Typography>
          {policy.expiryDate && (
            <Typography variant="body2">
              <strong>Expiry Date:</strong> {formatDate(policy.expiryDate)}
            </Typography>
          )}
          {policy.nextPremiumDue && (
            <Typography 
              variant="body2" 
              color={isExpiringSoon ? 'error.main' : 'text.primary'}
            >
              <strong>Next Premium Due:</strong> {formatDate(policy.nextPremiumDue)}
              {isExpiringSoon && ' (Due Soon!)'}
            </Typography>
          )}
        </Box>
      </CardContent>
      
      <CardActions sx={{ justifyContent: 'space-between', p: 2, flexWrap: 'wrap', gap: 1 }}>
        <Button size="small" onClick={() => onViewDetails(policy)}>
          View Details
        </Button>
        <Box display="flex" gap={1}>
          {isActive && onPayPremium && (
            <Button 
              variant="outlined" 
              size="small" 
              onClick={() => onPayPremium(policy)}
              color={isExpiringSoon ? 'error' : 'primary'}
            >
              Pay Premium
            </Button>
          )}
          {isActive && onFileClaim && (
            <Button 
              variant="contained" 
              size="small" 
              onClick={() => onFileClaim(policy)}
            >
              File Claim
            </Button>
          )}
        </Box>
      </CardActions>
    </Card>
  );
}
