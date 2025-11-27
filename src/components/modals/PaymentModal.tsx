import { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Divider,
  Alert
} from '@mui/material';
import { Payment as PaymentIcon } from '@mui/icons-material';
import type { Proposal } from '../../types/Proposal';

interface PaymentModalProps {
  open: boolean;
  onClose: () => void;
  proposal: Proposal | null;
  paymentMethods: Array<{ value: number; name: string }>;
  loading: boolean;
  onPayment: (paymentMethod: string) => void;
}

export default function PaymentModal({
  open,
  onClose,
  proposal,
  paymentMethods,
  loading,
  onPayment
}: PaymentModalProps) {
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('');

  const handlePayment = () => {
    if (selectedPaymentMethod) {
      onPayment(selectedPaymentMethod);
    }
  };

  const handleClose = () => {
    setSelectedPaymentMethod('');
    onClose();
  };

  if (!proposal) return null;

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth disableAutoFocus>
      <DialogTitle>
        <Box display="flex" alignItems="center" gap={1}>
          <PaymentIcon color="primary" />
          <Typography variant="h6">Complete Payment</Typography>
        </Box>
      </DialogTitle>
      
      <DialogContent>
        <Alert severity="success" sx={{ mb: 3 }}>
          🎉 Congratulations! Your proposal has been approved and is ready for payment.
        </Alert>
        
        <Box mb={3}>
          <Typography variant="h6" gutterBottom>
            Proposal Details
          </Typography>
          <Box display="flex" justifyContent="space-between" mb={1}>
            <Typography variant="body2" color="text.secondary">
              Proposal ID:
            </Typography>
            <Typography variant="body2" fontWeight="medium">
              {proposal.proposalId}
            </Typography>
          </Box>
          <Box display="flex" justifyContent="space-between" mb={1}>
            <Typography variant="body2" color="text.secondary">
              Coverage Amount:
            </Typography>
            <Typography variant="body2" fontWeight="medium">
              ₹{proposal.sumAssured.toLocaleString('en-IN')}
            </Typography>
          </Box>
          <Box display="flex" justifyContent="space-between" mb={1}>
            <Typography variant="body2" color="text.secondary">
              Term:
            </Typography>
            <Typography variant="body2" fontWeight="medium">
              {proposal.termYears} years
            </Typography>
          </Box>
        </Box>
        
        <Divider sx={{ my: 2 }} />
        
        <Box mb={3}>
          <Typography variant="h6" gutterBottom>
            Payment Information
          </Typography>
          <Box display="flex" justifyContent="space-between" mb={2}>
            <Typography variant="body1" color="text.secondary">
              Premium Amount:
            </Typography>
            <Typography variant="h5" color="primary" fontWeight="bold">
              ₹{proposal.premiumAmount.toLocaleString('en-IN')}
            </Typography>
          </Box>
        </Box>
        
        <FormControl fullWidth sx={{ mb: 3 }}>
          <InputLabel>Payment Method</InputLabel>
          <Select
            value={selectedPaymentMethod}
            onChange={(e) => setSelectedPaymentMethod(e.target.value)}
            label="Payment Method"
          >
            {paymentMethods.map((method) => (
              <MenuItem key={method.value} value={method.name}>
                {method.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        
        <Alert severity="info">
          After successful payment, your insurance policy will be activated immediately.
        </Alert>
      </DialogContent>
      
      <DialogActions>
        <Button onClick={handleClose} disabled={loading}>
          Cancel
        </Button>
        <Button
          onClick={handlePayment}
          variant="contained"
          disabled={!selectedPaymentMethod || loading}
          startIcon={<PaymentIcon />}
        >
          {loading ? 'Processing...' : `Pay ₹${proposal.premiumAmount.toLocaleString('en-IN')}`}
        </Button>
      </DialogActions>
    </Dialog>
  );
}