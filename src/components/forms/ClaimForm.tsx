import { useState, useEffect } from 'react';
import { 
  Box, 
  TextField, 
  Button, 
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem, 
  Typography,
  Paper,
  Divider
} from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState, AppDispatch } from '../../store';
import { fileClaim } from '../../slices/claimSlice';
import { fetchAllEnums } from '../../slices/enumSlice';
import type { ClaimCreateRequest } from '../../types/Claim';

interface ClaimFormProps {
  policyId: string;
  onClaimFiled?: () => void;
}

export default function ClaimForm({ policyId, onClaimFiled }: ClaimFormProps) {
  const dispatch = useDispatch<AppDispatch>();
  const { loading } = useSelector((state: RootState) => state.claim);
  const { user } = useSelector((state: RootState) => state.auth);
  
  const [formData, setFormData] = useState({
    claimType: 0, 
    incidentDate: '',
    causeOfDeath: 0, 
    claimantName: '',
    claimantRelation: 1, 
    claimantBankDetails: ''
  });

  useEffect(() => {
    dispatch(fetchAllEnums());
  }, [dispatch]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const claimRequest: ClaimCreateRequest = {
        policyId,
        claimType: formData.claimType,
        incidentDate: formData.incidentDate,
        causeOfDeath: formData.causeOfDeath,
        claimantName: formData.claimantName,
        claimantRelation: formData.claimantRelation,
        claimantBankDetails: formData.claimantBankDetails
      };

      const userId = user?.id;
      
      if (!userId) {
        throw new Error('User not authenticated');
      }
      
      const result = await dispatch(fileClaim({ userId, claimData: claimRequest }));
      
      if (result.type.endsWith('/fulfilled')) {
        onClaimFiled?.();
      } else {
        throw new Error('Failed to file claim');
      }
    } catch (error) {
      console.error('Error filing claim');
    }
  };

  const handleChange = (field: string) => (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [field]: event.target.value
    }));
  };

  const handleSelectChange = (field: string) => (event: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: event.target.value
    }));
  };

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>
        File Insurance Claim
      </Typography>
      
      <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
        <Box display="flex" flexDirection="column" gap={3}>
          <FormControl fullWidth required>
            <InputLabel>Claim Type</InputLabel>
            <Select
              value={formData.claimType}
              onChange={handleSelectChange('claimType')}
              label="Claim Type"
            >
              <MenuItem value={0}>Death Claim</MenuItem>
              <MenuItem value={1}>Maturity Claim</MenuItem>
              <MenuItem value={2}>Surrender</MenuItem>
              <MenuItem value={3}>Disability</MenuItem>
            </Select>
          </FormControl>

          <TextField
            label="Incident Date"
            type="date"
            value={formData.incidentDate}
            onChange={handleChange('incidentDate')}
            InputLabelProps={{ shrink: true }}
            required
            fullWidth
          />

          {formData.claimType === 0 && (
            <FormControl fullWidth>
              <InputLabel>Cause of Death</InputLabel>
              <Select
                value={formData.causeOfDeath}
                onChange={handleSelectChange('causeOfDeath')}
                label="Cause of Death"
              >
                <MenuItem value={0}>Natural</MenuItem>
                <MenuItem value={1}>Accidental</MenuItem>
                <MenuItem value={2}>Suicide</MenuItem>
                <MenuItem value={3}>Murder</MenuItem>
                <MenuItem value={4}>Unknown</MenuItem>
              </Select>
            </FormControl>
          )}

          <Divider />
          
          <Typography variant="subtitle1" fontWeight="medium">
            Claimant Information
          </Typography>

          <TextField
            label="Claimant Full Name"
            value={formData.claimantName}
            onChange={handleChange('claimantName')}
            required
            fullWidth
          />

          <FormControl fullWidth required>
            <InputLabel>Relationship to Insured</InputLabel>
            <Select
              value={formData.claimantRelation}
              onChange={handleSelectChange('claimantRelation')}
              label="Relationship to Insured"
            >
              <MenuItem value={0}>Self</MenuItem>
              <MenuItem value={1}>Spouse</MenuItem>
              <MenuItem value={2}>Child</MenuItem>
              <MenuItem value={3}>Parent</MenuItem>
              <MenuItem value={4}>Sibling</MenuItem>
              <MenuItem value={5}>Grandparent</MenuItem>
              <MenuItem value={6}>Grandchild</MenuItem>
              <MenuItem value={13}>Nominee</MenuItem>
              <MenuItem value={14}>Legal Heir</MenuItem>
              <MenuItem value={15}>Other</MenuItem>
            </Select>
          </FormControl>

          <TextField
            label="Bank Account Details"
            value={formData.claimantBankDetails}
            onChange={handleChange('claimantBankDetails')}
            placeholder="Bank Name, Account Number, IFSC Code"
            multiline
            rows={3}
            required
            fullWidth
          />

          <Box mt={2} p={2} bgcolor="warning.50" borderRadius={1}>
            <Typography variant="body2" color="warning.dark">
              <strong>Note:</strong> After filing the claim, you will need to upload supporting documents 
              such as death certificate, medical reports, and identity proofs.
            </Typography>
          </Box>

          <Button
            type="submit"
            variant="contained"
            size="large"
            disabled={loading}
            sx={{ mt: 2 }}
          >
            {loading ? 'Filing Claim...' : 'File Claim'}
          </Button>
        </Box>
      </Box>
    </Paper>
  );
}
