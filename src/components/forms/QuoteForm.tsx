import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Checkbox,
  Box,
  Typography,
  Paper,
  Alert,
  Snackbar
} from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import { calculatePremiumWithContext } from '../../slices/productSlice';
import type { RootState, AppDispatch } from '../../store';
import type { PolicyProduct, QuoteRequest, PremiumFrequency, Gender, QuoteResponse } from '../../types/Product';

interface QuoteFormProps {
  open: boolean;
  onClose: () => void;
  product: PolicyProduct | null;
}

export default function QuoteForm({ open, onClose, product }: QuoteFormProps) {
  const dispatch = useDispatch<AppDispatch>();
  const auth = useSelector((state: RootState) => state.auth);
  const user = auth?.user;
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<'form' | 'results'>('form');
  const [quote, setQuote] = useState<QuoteResponse | null>(null);
  const [error, setError] = useState('');
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  
  const [formData, setFormData] = useState({
    age: 30,
    gender: 0,
    isSmoker: false,
    sumAssured: 1000000,
    termYears: 10,
    premiumFrequency: 0
  });

  useEffect(() => {
    if (product && open) {
      // Set defaults based on product's backend data with proper validation
      const defaultAge = Math.max(product.minAge || 18, Math.min(product.maxAge || 65, 30));
      const defaultSumAssured = Math.max(product.minSumAssured || 100000, 500000);
      // Ensure term years is within product limits
      const minTerm = product.minTerm || 5;
      const maxTerm = product.maxTerm || product.policyTerm || 30;
      const defaultTermYears = Math.max(minTerm, Math.min(maxTerm, 10));
      
      console.log(`Product ${product.productId} validation:`, {
        ageRange: `${product.minAge}-${product.maxAge}`,
        sumAssuredRange: `${product.minSumAssured}-${product.maxSumAssured}`,
        termRange: `${minTerm}-${maxTerm}`,
        defaults: { defaultAge, defaultSumAssured, defaultTermYears }
      });
      
      setFormData({
        age: defaultAge,
        gender: 0,
        isSmoker: false,
        sumAssured: defaultSumAssured,
        termYears: defaultTermYears,
        premiumFrequency: 0
      });
      setStep('form');
      setQuote(null);
    }
  }, [product, open]);

  const validateFormData = () => {
    const errors = [];
    
    if (formData.age < (product?.minAge || 18) || formData.age > (product?.maxAge || 65)) {
      errors.push(`Age must be between ${product?.minAge || 18} and ${product?.maxAge || 65}`);
    }
    
    if (formData.sumAssured < (product?.minSumAssured || 0) || formData.sumAssured > (product?.maxSumAssured || 0)) {
      errors.push(`Sum assured must be between ₹${(product?.minSumAssured || 0).toLocaleString()} and ₹${(product?.maxSumAssured || 0).toLocaleString()}`);
    }
    
    const minTerm = product?.minTerm || 5;
    const maxTerm = product?.maxTerm || product?.policyTerm || 30;
    if (formData.termYears < minTerm || formData.termYears > maxTerm) {
      errors.push(`Policy term must be between ${minTerm} and ${maxTerm} years`);
    }
    
    return errors;
  };

  const handleCalculate = async () => {
    if (!product) return;
    
    // Validate form data before sending request
    const errors = validateFormData();
    if (errors.length > 0) {
      setValidationErrors(errors);
      return;
    }
    
    setLoading(true);
    
    const quoteRequest: QuoteRequest = {
      productId: product.productId,
      sumAssured: formData.sumAssured,
      age: formData.age,
      premiumFrequency: formData.premiumFrequency as PremiumFrequency,
      termYears: formData.termYears,
      isSmoker: formData.isSmoker,
      gender: formData.gender as Gender
    };

    console.log('Sending validated quote request:', quoteRequest);

    try {
      const result = await dispatch(calculatePremiumWithContext({
        userId: user?.id,
        quoteRequest
      })).unwrap();
      
      // Extract premium quote from consolidated response
      if (result.premiumQuote) {
        setQuote(result.premiumQuote);
        setStep('results');
      } else {
        throw new Error('Premium calculation failed');
      }
    } catch (error: any) {
      const errorMessage = error.userMessage || error.message || 'Failed to calculate premium. Please check your inputs and try again.';
      setError(errorMessage);
      console.error('Premium calculation error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setStep('form');
    setQuote(null);
    setError('');
    setValidationErrors([]);
    onClose();
  };

  const handleCalculateAgain = () => {
    setStep('form');
    setQuote(null);
    setError('');
    setValidationErrors([]);
  };

  if (!product) return null;

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ bgcolor: '#1B365D', color: '#FFD700', textAlign: 'center', fontWeight: 600 }}>
        Get Quote - {product.productName}
      </DialogTitle>
      
      <DialogContent sx={{ p: 3 }}>
        {validationErrors.length > 0 && (
          <Alert severity="error" sx={{ mb: 2 }}>
            <Typography variant="body2" fontWeight={600} gutterBottom>
              Please fix the following errors:
            </Typography>
            <Box component="ul" sx={{ m: 0, pl: 2 }}>
              {validationErrors.map((error, index) => (
                <Typography key={index} component="li" variant="body2">
                  {error}
                </Typography>
              ))}
            </Box>
          </Alert>
        )}
        
        {step === 'form' ? (
          <Box sx={{ mt: 2 }}>
            <Typography variant="h6" sx={{ mb: 3, color: '#1B365D' }}>
              Enter Your Details
            </Typography>
            
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <TextField
                  label="Age"
                  type="number"
                  value={formData.age}
                  onChange={(e) => setFormData(prev => ({ ...prev, age: parseInt(e.target.value) }))}
                  inputProps={{ 
                    min: product?.minAge || 18, 
                    max: product?.maxAge || 65 
                  }}
                  sx={{ flex: 1 }}
                />
                
                <FormControl sx={{ flex: 1 }}>
                  <InputLabel>Gender</InputLabel>
                  <Select
                    value={formData.gender}
                    onChange={(e) => setFormData(prev => ({ ...prev, gender: e.target.value as number }))}
                  >
                    <MenuItem value={0}>Male</MenuItem>
                    <MenuItem value={1}>Female</MenuItem>
                    <MenuItem value={2}>Other</MenuItem>
                  </Select>
                </FormControl>
              </Box>

              <FormControlLabel
                control={
                  <Checkbox
                    checked={formData.isSmoker}
                    onChange={(e) => setFormData(prev => ({ ...prev, isSmoker: e.target.checked }))}
                    sx={{ color: '#1B365D', '&.Mui-checked': { color: '#FFD700' } }}
                  />
                }
                label="Do you smoke?"
              />

              <Box sx={{ display: 'flex', gap: 2 }}>
                <TextField
                  label="Sum Assured (₹)"
                  type="number"
                  value={formData.sumAssured}
                  onChange={(e) => setFormData(prev => ({ ...prev, sumAssured: parseInt(e.target.value) }))}
                  inputProps={{ 
                    min: product?.minSumAssured || 100000, 
                    max: product?.maxSumAssured || 10000000, 
                    step: 100000 
                  }}
                  sx={{ flex: 1 }}
                />

                <TextField
                  label="Policy Term (Years)"
                  type="number"
                  value={formData.termYears}
                  onChange={(e) => {
                    const value = parseInt(e.target.value);
                    const minTerm = product?.minTerm || 5;
                    const maxTerm = product?.maxTerm || product?.policyTerm || 30;
                    if (value >= minTerm && value <= maxTerm) {
                      setFormData(prev => ({ ...prev, termYears: value }));
                    }
                  }}
                  inputProps={{ 
                    min: product?.minTerm || 5, 
                    max: product?.maxTerm || product?.policyTerm || 30
                  }}
                  helperText={`Range: ${product?.minTerm || 5} - ${product?.maxTerm || product?.policyTerm || 30} years`}
                  sx={{ flex: 1 }}
                />
              </Box>

              <Box sx={{ display: 'flex', gap: 2 }}>
                <FormControl sx={{ flex: 1 }}>
                  <InputLabel>Premium Frequency</InputLabel>
                  <Select
                    value={formData.premiumFrequency}
                    label="Premium Frequency"
                    onChange={(e) => setFormData(prev => ({ ...prev, premiumFrequency: e.target.value as number }))}
                  >
                    <MenuItem value={0}>Annual</MenuItem>
                    <MenuItem value={1}>Semi-Annual</MenuItem>
                    <MenuItem value={2}>Quarterly</MenuItem>
                    <MenuItem value={3}>Monthly</MenuItem>
                  </Select>
                </FormControl>
                <Box sx={{ flex: 1 }} />
              </Box>
            </Box>
          </Box>
        ) : quote ? (
          <Paper sx={{ p: 3, mt: 2, bgcolor: '#f8f9fa', border: '2px solid #FFD700' }}>
            <Typography variant="h5" sx={{ color: '#1B365D', fontWeight: 700, mb: 2, textAlign: 'center' }}>
              Your Premium Quote
            </Typography>
            
            <Box sx={{ mb: 3 }}>
              <Typography variant="body2" color="#666">Product: {quote.productName}</Typography>
              <Typography variant="body2" color="#666">Sum Assured: ₹{quote.sumAssured.toLocaleString()}</Typography>
              <Typography variant="body2" color="#666">
                Frequency: {['Annual', 'Semi-Annual', 'Quarterly', 'Monthly'][quote.premiumFrequency]}
              </Typography>
            </Box>
            
            <Box sx={{ p: 2, bgcolor: '#1B365D', borderRadius: 2, textAlign: 'center' }}>
              <Typography variant="body1" sx={{ color: 'white' }}>Premium Amount</Typography>
              <Typography variant="h4" sx={{ color: '#FFD700', fontWeight: 700 }}>
                ₹{quote.premiumAmount.toLocaleString()}
              </Typography>
            </Box>
            
            <Typography variant="caption" sx={{ display: 'block', textAlign: 'center', mt: 2, color: '#666' }}>
              Valid until: {new Date(quote.validUntil).toLocaleDateString()}
            </Typography>
          </Paper>
        ) : null}
      </DialogContent>

      <DialogActions sx={{ p: 3, gap: 2 }}>
        <Button onClick={handleClose} sx={{ color: '#666' }}>
          {step === 'results' ? 'Close' : 'Cancel'}
        </Button>
        
        {step === 'form' ? (
          <Button 
            variant="contained" 
            onClick={handleCalculate}
            disabled={loading}
            sx={{
              bgcolor: '#FFD700',
              color: '#1B365D',
              fontWeight: 600,
              '&:hover': { bgcolor: '#E6C200' }
            }}
          >
            {loading ? 'Calculating...' : 'Calculate Premium'}
          </Button>
        ) : (
          <Button 
            variant="contained" 
            onClick={handleCalculateAgain}
            sx={{
              bgcolor: '#1B365D',
              color: 'white',
              fontWeight: 600,
              '&:hover': { bgcolor: '#0F2A47' }
            }}
          >
            Calculate Again
          </Button>
        )}
      </DialogActions>
      
      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        onClose={() => setError('')}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={() => setError('')} severity="error" sx={{ width: '100%' }}>
          {error}
        </Alert>
      </Snackbar>
    </Dialog>
  );
}