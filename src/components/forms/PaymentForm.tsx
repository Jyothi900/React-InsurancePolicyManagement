import { useState, useEffect } from 'react';
import { Box, TextField, Button, MenuItem, Typography, Stack, Alert } from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import { payPremium } from '../../slices/paymentSlice';
import type { PaymentMethod } from '../../types/Common';
import type { AppDispatch, RootState } from '../../store';

interface PaymentFormProps {
  policyId: string;
  amount?: number;
  onPaymentCreated?: () => void;
}

export default function PaymentForm({ policyId, amount, onPaymentCreated }: PaymentFormProps) {
  const dispatch = useDispatch<AppDispatch>();
  const { loading, error } = useSelector((state: RootState) => state.payment);
  const { user } = useSelector((state: RootState) => state.auth);
  const { paymentMethods } = useSelector((state: RootState) => state.enum);
  
  const [formData, setFormData] = useState<{
    amount: string;
    paymentMethod: PaymentMethod;
    cardNumber: string;
    expiryDate: string;
    cvv: string;
    cardHolderName: string;
  }>({
    amount: amount?.toString() || '',
    paymentMethod: paymentMethods[0]?.value || 0,
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    cardHolderName: ''
  });

  useEffect(() => {
    if (amount) {
      setFormData(prev => ({ ...prev, amount: amount.toString() }));
    }
  }, [amount]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user?.id) {
      console.error('User not authenticated');
      return;
    }
    
    try {
      const selectedPaymentMethod = paymentMethods.find(method => method.value === formData.paymentMethod);
      const paymentMethodName = selectedPaymentMethod?.name || paymentMethods[0]?.name;
      
      const result = await dispatch(payPremium({ 
        policyId, 
        userId: user.id, 
        paymentMethod: paymentMethodName
      }));
      
      if (result.type.endsWith('/fulfilled')) {
        onPaymentCreated?.();
      }
    } catch (error) {
      console.error('Payment processing failed');
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit}>
      <Typography variant="h6" gutterBottom>
        Payment Information
      </Typography>
      
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      
      <Stack spacing={2}>
        <Box display="flex" gap={2}>
          <TextField
            fullWidth
            label="Amount"
            type="number"
            value={formData.amount}
            onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
            disabled={!!amount}
            helperText={amount ? "Amount is pre-filled from policy premium" : ""}
            required
          />
          <TextField
            select
            fullWidth
            label="Payment Method"
            value={formData.paymentMethod}
            onChange={(e) => setFormData({ ...formData, paymentMethod: Number(e.target.value) as PaymentMethod })}
            required
          >
            {paymentMethods.map((method) => (
              <MenuItem key={method.value} value={method.value}>
                {method.name}
              </MenuItem>
            ))}
          </TextField>
        </Box>
        
        <TextField
          fullWidth
          label="Card Holder Name"
          value={formData.cardHolderName}
          onChange={(e) => setFormData({ ...formData, cardHolderName: e.target.value })}
          required
        />
        
        <TextField
          fullWidth
          label="Card Number"
          value={formData.cardNumber}
          onChange={(e) => setFormData({ ...formData, cardNumber: e.target.value })}
          placeholder="1234 5678 9012 3456"
          required
        />
        
        <Box display="flex" gap={2}>
          <TextField
            fullWidth
            label="Expiry Date"
            value={formData.expiryDate}
            onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
            placeholder="MM/YY"
            required
          />
          <TextField
            fullWidth
            label="CVV"
            value={formData.cvv}
            onChange={(e) => setFormData({ ...formData, cvv: e.target.value })}
            placeholder="123"
            required
          />
        </Box>
      </Stack>
      
      <Box mt={3}>
        <Button 
          type="submit" 
          variant="contained" 
          fullWidth
          disabled={loading || !user?.id}
        >
          {loading ? 'Processing...' : 'Process Payment'}
        </Button>
      </Box>
    </Box>
  );
}

