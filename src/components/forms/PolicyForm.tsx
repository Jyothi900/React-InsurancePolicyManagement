import { useState } from 'react';
import { Box, TextField, Button, MenuItem, Typography, Grid } from '@mui/material';

import type { PolicyType, PremiumFrequency } from '../../types/Common';

interface PolicyFormProps {
  userId: string;
  onPolicyCreated?: () => void;
}

export default function PolicyForm({ userId, onPolicyCreated }: PolicyFormProps) {

  const [formData, setFormData] = useState({
    policyType: '0', 
    premiumAmount: '',
    sumAssured: '',
    termYears: '',
    premiumFrequency: '3' 
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const policyData = {
        ...formData,
        userId,
        policyType: Number(formData.policyType) as PolicyType,
        premiumFrequency: Number(formData.premiumFrequency) as PremiumFrequency,
        premiumAmount: parseFloat(formData.premiumAmount),
        sumAssured: parseFloat(formData.sumAssured),
        termYears: parseInt(formData.termYears)
      };
      console.log('Policy data:', policyData);
      onPolicyCreated?.();
    } catch (error) {
      console.error('Policy creation failed:', error);
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit}>
      <Typography variant="h6" gutterBottom>
        Policy Information
      </Typography>
      
      <Grid container spacing={2}>
        <Grid size={{ xs: 12, sm: 6 }}>
          <TextField
            select
            fullWidth
            label="Policy Type"
            value={formData.policyType}
            onChange={(e) => setFormData({ ...formData, policyType: e.target.value })}
            required
          >
            <MenuItem value="0">Term Life</MenuItem>
            <MenuItem value="1">Endowment</MenuItem>
            <MenuItem value="2">ULIP</MenuItem>
            <MenuItem value="3">Money Back</MenuItem>
            <MenuItem value="4">Pension</MenuItem>
            <MenuItem value="5">Child Plan</MenuItem>
            <MenuItem value="6">Personal Accident</MenuItem>
          </TextField>
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
            select
            fullWidth
            label="Premium Frequency"
            value={formData.premiumFrequency}
            onChange={(e) => setFormData({ ...formData, premiumFrequency: e.target.value })}
            required
          >
            <MenuItem value="0">Monthly</MenuItem>
            <MenuItem value="1">Quarterly</MenuItem>
            <MenuItem value="2">Half Yearly</MenuItem>
            <MenuItem value="3">Annual</MenuItem>
          </TextField>
        </Grid>
      </Grid>
      
      <Box mt={3}>
        <Button type="submit" variant="contained" fullWidth>
          Create Policy
        </Button>
      </Box>
    </Box>
  );
}


