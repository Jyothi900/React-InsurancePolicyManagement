import { useState } from 'react';
import { Box, TextField, Button, MenuItem, Typography, Stack } from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAllProducts } from '../../slices/productSlice';
import type { AppDispatch, RootState } from '../../store';
import type { PolicyType } from '../../types/Common';

interface ProductFormProps {
  onProductCreated?: () => void;
}

export default function ProductForm({ onProductCreated }: ProductFormProps) {
  const dispatch = useDispatch<AppDispatch>();
  const { policyTypes } = useSelector((state: RootState) => state.enum);
  const [formData, setFormData] = useState({
    productName: '',
    productType: '0', 
    description: '',
    basePremium: '',
    maxCoverage: '',
    minAge: '',
    maxAge: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const productData = {
        ...formData,
        productType: Number(formData.productType) as PolicyType,
        basePremium: parseFloat(formData.basePremium),
        maxCoverage: parseFloat(formData.maxCoverage),
        minAge: parseInt(formData.minAge),
        maxAge: parseInt(formData.maxAge),
        isActive: true
      };
      console.log('Product data:', productData);
      await void dispatch(fetchAllProducts());
      onProductCreated?.();
    } catch (error) {
      console.error('Product creation failed:', error);
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit}>
      <Typography variant="h6" gutterBottom>
        Product Information
      </Typography>
      
      <Stack spacing={2}>
        <TextField
          fullWidth
          label="Product Name"
          value={formData.productName}
          onChange={(e) => setFormData({ ...formData, productName: e.target.value })}
          required
        />
        
        <Box display="flex" gap={2}>
          <TextField
            select
            fullWidth
            label="Product Type"
            value={formData.productType}
            onChange={(e) => setFormData({ ...formData, productType: e.target.value })}
            required
          >
            {policyTypes.map((type) => (
              <MenuItem key={type.value} value={type.value.toString()}>
                {type.name}
              </MenuItem>
            ))}
          </TextField>
          
          <TextField
            fullWidth
            label="Base Premium"
            type="number"
            value={formData.basePremium}
            onChange={(e) => setFormData({ ...formData, basePremium: e.target.value })}
            required
          />
        </Box>
        
        <Box display="flex" gap={2}>
          <TextField
            fullWidth
            label="Maximum Coverage"
            type="number"
            value={formData.maxCoverage}
            onChange={(e) => setFormData({ ...formData, maxCoverage: e.target.value })}
            required
          />
          
          <TextField
            fullWidth
            label="Min Age"
            type="number"
            value={formData.minAge}
            onChange={(e) => setFormData({ ...formData, minAge: e.target.value })}
            required
          />
          
          <TextField
            fullWidth
            label="Max Age"
            type="number"
            value={formData.maxAge}
            onChange={(e) => setFormData({ ...formData, maxAge: e.target.value })}
            required
          />
        </Box>
        
        <TextField
          fullWidth
          multiline
          rows={3}
          label="Description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          required
        />
      </Stack>
      
      <Box mt={3}>
        <Button type="submit" variant="contained" fullWidth>
          Create Product
        </Button>
      </Box>
    </Box>
  );
}


