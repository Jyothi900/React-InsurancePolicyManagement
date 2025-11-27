import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Divider,
  Paper,
  Chip
} from '@mui/material';
import { useSelector } from 'react-redux';
import { useMemo, useCallback } from 'react';
import type { RootState } from '../../store';


interface QuoteModalProps {
  open: boolean;
  onClose: () => void;
  onProceedToProposal?: () => void;
}

const FREQUENCY_MAP: Record<number, string> = {
  0: 'Annual',        
  1: 'Semi-Annual',   
  2: 'Quarterly',     
  3: 'Monthly'        
};

const formatCurrency = (amount: number): string => {
  if (typeof amount !== 'number' || isNaN(amount) || amount < 0) {
    return '₹0';
  }
  return `₹${amount.toLocaleString()}`;
};

const formatDate = (dateString: string): string => {
  if (!dateString) return 'Invalid Date';
  const date = new Date(dateString);
  return isNaN(date.getTime()) ? 'Invalid Date' : date.toLocaleDateString('en-IN');
};

const getPremiumFrequencyLabel = (frequency: number): string => {
  return FREQUENCY_MAP[frequency] ?? 'Unknown';
};

export default function QuoteModal({ open, onClose, onProceedToProposal }: QuoteModalProps) {
  const { currentQuote, selectedProduct } = useSelector((state: RootState) => state.product);

  const handleClose = useCallback(() => {
    onClose();
  }, [onClose]);

  const handleProceedToProposal = useCallback(() => {
    onProceedToProposal?.();
  }, [onProceedToProposal]);

  const formattedData = useMemo(() => {
    if (!currentQuote) return null;
    
    return {
      productName: currentQuote.productName || 'Product',
      premiumAmount: formatCurrency(currentQuote.premiumAmount || 0),
      sumAssured: formatCurrency(currentQuote.sumAssured || 0),
      frequencyLabel: getPremiumFrequencyLabel(currentQuote.premiumFrequency ?? -1),
      validUntil: formatDate(currentQuote.validUntil || '')
    };
  }, [currentQuote]);

  if (!currentQuote || !selectedProduct || !formattedData) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth disableAutoFocus>
      <DialogTitle>
        <Typography variant="h6">Premium Quote</Typography>
        <Typography variant="body2" color="text.secondary">
          {formattedData.productName}
        </Typography>
      </DialogTitle>
      
      <DialogContent>
        <Paper sx={{ p: 2, mb: 2, bgcolor: 'primary.50' }}>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h6">Premium Amount</Typography>
            <Typography variant="h4" color="primary.main" fontWeight="bold">
              {formattedData.premiumAmount}
            </Typography>
          </Box>
          <Typography variant="body2" color="text.secondary">
            {formattedData.frequencyLabel}
          </Typography>
        </Paper>

        <Box display="flex" flexDirection="column" gap={2}>
          <Box display="flex" justifyContent="space-between">
            <Typography variant="body2">Sum Assured:</Typography>
            <Typography variant="body2" fontWeight="medium">
              {formattedData.sumAssured}
            </Typography>
          </Box>
          
          <Box display="flex" justifyContent="space-between">
            <Typography variant="body2">Premium Frequency:</Typography>
            <Typography variant="body2" fontWeight="medium">
              {formattedData.frequencyLabel}
            </Typography>
          </Box>

          <Divider />

          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="body2">Quote Valid Until:</Typography>
            <Chip 
              label={formattedData.validUntil} 
              size="small" 
              color="warning"
            />
          </Box>
        </Box>

        <Box mt={3} p={2} bgcolor="grey.50" borderRadius={1}>
          <Typography variant="caption" color="text.secondary">
            * This is an indicative quote. Final premium may vary based on medical examination and underwriting.
          </Typography>
        </Box>
      </DialogContent>
      
      <DialogActions sx={{ p: 3 }}>
        <Button onClick={handleClose}>
          Close
        </Button>
        {onProceedToProposal && (
          <Button 
            variant="contained" 
            onClick={handleProceedToProposal}
            size="large"
          >
            Proceed to Application
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
}
