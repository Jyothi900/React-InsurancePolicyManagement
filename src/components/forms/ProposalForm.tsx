import { useState } from 'react';
import { Box, TextField, Button, Typography } from '@mui/material';
import { Grid } from '@mui/material';
import { useDispatch } from 'react-redux';
import type { AppDispatch } from '../../store';
import { submitProposal } from '../../slices/proposalSlice';


interface ProposalFormProps {
  productId: string;
  onProposalCreated?: () => void;
}

export default function ProposalForm({ productId, onProposalCreated }: ProposalFormProps) {
  const dispatch = useDispatch<AppDispatch>();
  const [formData, setFormData] = useState({
    sumAssured: '',
    termYears: '',
    premiumAmount: '',
    premiumFrequency: 0, 
    height: '',
    weight: '',
    isSmoker: false,
    isDrinker: false,
    preExistingConditions: '',
    occupation: '',
    annualIncome: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const proposalData = {
        userId: 'current-user-id',
        productId,
        sumAssured: parseFloat(formData.sumAssured),
        termYears: parseInt(formData.termYears),
        premiumAmount: parseFloat(formData.premiumAmount),
        premiumFrequency: formData.premiumFrequency,
        height: parseFloat(formData.height),
        weight: parseFloat(formData.weight),
        isSmoker: formData.isSmoker,
        isDrinker: formData.isDrinker,
        preExistingConditions: formData.preExistingConditions,
        occupation: formData.occupation,
        annualIncome: parseFloat(formData.annualIncome)
      };
      await dispatch(submitProposal({ userId: 'current-user-id', proposalData }));
      onProposalCreated?.();
      onProposalCreated?.();
    } catch (error) {
      console.error('Proposal creation failed:', error);
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit}>
      <Typography variant="h6" gutterBottom>
        Insurance Proposal
      </Typography>
      
      <Grid container spacing={2}>
        <Grid size={{ xs: 12, sm: 6 }}>
          <TextField
            fullWidth
            label="Sum Assured"
            type="number"
            value={formData.sumAssured}
            onChange={(e) => setFormData({ ...formData, sumAssured: e.target.value })}
            required
          />
        </Grid>
        
        <Grid size={{ xs: 12, sm: 6 }}>
          <TextField
            fullWidth
            label="Term Years"
            type="number"
            value={formData.termYears}
            onChange={(e) => setFormData({ ...formData, termYears: e.target.value })}
            required
          />
        </Grid>
        
        <Grid size={{ xs: 12, sm: 6 }}>
          <TextField
            fullWidth
            label="Premium Amount"
            type="number"
            value={formData.premiumAmount}
            onChange={(e) => setFormData({ ...formData, premiumAmount: e.target.value })}
            required
          />
        </Grid>
        
        <Grid size={{ xs: 12, sm: 6 }}>
          <TextField
            fullWidth
            label="Height (cm)"
            type="number"
            value={formData.height}
            onChange={(e) => setFormData({ ...formData, height: e.target.value })}
            required
          />
        </Grid>
        
        <Grid size={{ xs: 12, sm: 6 }}>
          <TextField
            fullWidth
            label="Weight (kg)"
            type="number"
            value={formData.weight}
            onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
            required
          />
        </Grid>
        
        <Grid size={{ xs: 12, sm: 6 }}>
          <TextField
            fullWidth
            label="Occupation"
            value={formData.occupation}
            onChange={(e) => setFormData({ ...formData, occupation: e.target.value })}
            required
          />
        </Grid>
        
        <Grid size={{ xs: 12, sm: 6 }}>
          <TextField
            fullWidth
            label="Annual Income"
            type="number"
            value={formData.annualIncome}
            onChange={(e) => setFormData({ ...formData, annualIncome: e.target.value })}
            required
          />
        </Grid>
        
        <Grid size={{ xs: 12 }}>
          <TextField
            fullWidth
            multiline
            rows={3}
            label="Pre-existing Conditions"
            value={formData.preExistingConditions}
            onChange={(e) => setFormData({ ...formData, preExistingConditions: e.target.value })}
            placeholder="Please provide any pre-existing medical conditions"
          />
        </Grid>
      </Grid>
      
      <Box mt={3}>
        <Button type="submit" variant="contained" fullWidth>
          Submit Proposal
        </Button>
      </Box>
    </Box>
  );
}


