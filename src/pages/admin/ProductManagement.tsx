import { useEffect, useState } from 'react';
import { 
  Container, Typography, Box, Button, Table, TableBody, TableCell, TableContainer, 
  TableHead, TableRow, Paper, Chip, Dialog, DialogTitle, DialogContent, 
  DialogActions, TextField, FormControl, InputLabel, Select, MenuItem, Alert
} from '@mui/material';
import { Add, Edit, Delete, Search, Dashboard } from '@mui/icons-material';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import type { RootState, AppDispatch } from '../../store';
import { fetchProducts } from '../../slices/productSlice';
import { fetchAllEnums } from '../../slices/enumSlice';
import { productApi } from '../../api/product.api';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import type { PolicyProduct } from '../../types/Product';

export default function ProductManagement() {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { products, loading } = useSelector((state: RootState) => state.product);
  const { policyTypes, insuranceTypes, loading: enumLoading } = useSelector((state: RootState) => state.enum);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<PolicyProduct | null>(null);
  const [formData, setFormData] = useState({
    productName: '', description: '', companyName: '', category: '', insuranceType: '',
    minAge: 0, maxAge: 0, minSumAssured: 0, maxSumAssured: 0,
    minTerm: 0, maxTerm: 0, baseRate: 0, riskLevel: 0, policyTerm: 0, premiumRate: 0,
    hasMaturityBenefit: false, hasDeathBenefit: false, isActive: true
  });
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    dispatch(fetchProducts());
    dispatch(fetchAllEnums());
  }, [dispatch]);

  const riskLevels = [{ value: 0, name: 'Low' }, { value: 1, name: 'Medium' }, { value: 2, name: 'High' }];
  const getRisk = (level: number) => {
    const colorMap = { 0: 'success', 1: 'warning', 2: 'error' };
    const risk = riskLevels.find(r => r.value === level);
    return { name: risk?.name || 'Unknown', color: colorMap[level as keyof typeof colorMap] || 'default' };
  };
  const getEnumName = (items: any[], value: number) => items.find(i => i.value === value)?.name || 'Unknown';

  const resetForm = () => {
    setFormData({ productName: '', description: '', companyName: '', category: '', insuranceType: '', minAge: 0, maxAge: 0, minSumAssured: 0, maxSumAssured: 0, minTerm: 0, maxTerm: 0, baseRate: 0, riskLevel: 0, policyTerm: 0, premiumRate: 0, hasMaturityBenefit: false, hasDeathBenefit: false, isActive: true });
    setError('');
  };

  const openDialog = (product?: PolicyProduct) => {
    if (product) {
      setSelectedProduct(product);
      setFormData({
        productName: product.productName || '', 
        description: product.description || '', 
        companyName: product.companyName || '',
        category: product.category ? String(product.category) : (product.policyType !== undefined ? String(product.policyType) : ''), 
        insuranceType: product.insuranceType !== undefined ? String(product.insuranceType) : '',
        minAge: product.minAge || 0, 
        maxAge: product.maxAge || 0, 
        minSumAssured: product.minSumAssured || 0,
        maxSumAssured: product.maxSumAssured || 0, 
        minTerm: product.minTerm || 0, 
        maxTerm: product.maxTerm || 0,
        baseRate: product.baseRate || product.premiumRate || 0, 
        riskLevel: product.riskLevel || 0,
        policyTerm: product.policyTerm || product.maxTerm || 0, 
        premiumRate: product.premiumRate || product.baseRate || 0,
        hasMaturityBenefit: product.hasMaturityBenefit || false, 
        hasDeathBenefit: product.hasDeathBenefit || false,
        isActive: product.isActive !== undefined ? product.isActive : true
      });
    } else {
      setSelectedProduct(null);
      resetForm();
    }
    setDialogOpen(true);
  };

  const handleSubmit = async () => {
    try {
      if (selectedProduct) {
        const changes: any = {};
        if (formData.productName && formData.productName !== selectedProduct.productName) changes.productName = formData.productName;
        if (formData.description !== selectedProduct.description) changes.description = formData.description;
        if (formData.companyName && formData.companyName !== selectedProduct.companyName) changes.companyName = formData.companyName;
        if (formData.category && Number(formData.category) !== selectedProduct.policyType) {
          changes.category = formData.category;
        }
        if (formData.insuranceType && Number(formData.insuranceType) !== selectedProduct.insuranceType) changes.insuranceType = Number(formData.insuranceType);
        if (formData.minAge > 0 && formData.minAge !== selectedProduct.minAge) changes.minAge = formData.minAge;
        if (formData.maxAge > 0 && formData.maxAge !== selectedProduct.maxAge) changes.maxAge = formData.maxAge;
        if (formData.minSumAssured > 0 && formData.minSumAssured !== selectedProduct.minSumAssured) changes.minSumAssured = formData.minSumAssured;
        if (formData.maxSumAssured > 0 && formData.maxSumAssured !== selectedProduct.maxSumAssured) changes.maxSumAssured = formData.maxSumAssured;
        if (formData.minTerm > 0 && formData.minTerm !== selectedProduct.minTerm) changes.minTerm = formData.minTerm;
        if (formData.maxTerm > 0 && formData.maxTerm !== selectedProduct.maxTerm) changes.maxTerm = formData.maxTerm;
        if (formData.baseRate > 0 && formData.baseRate !== selectedProduct.baseRate) changes.baseRate = formData.baseRate;
        if (formData.riskLevel !== selectedProduct.riskLevel) changes.riskLevel = formData.riskLevel;
        if (formData.hasMaturityBenefit !== selectedProduct.hasMaturityBenefit) changes.hasMaturityBenefit = formData.hasMaturityBenefit;
        if (formData.hasDeathBenefit !== selectedProduct.hasDeathBenefit) changes.hasDeathBenefit = formData.hasDeathBenefit;
        if (formData.isActive !== selectedProduct.isActive) changes.isActive = formData.isActive;
        await productApi.updateProduct(selectedProduct.productId, changes);
      } else {
        const payload = {
          productName: formData.productName,
          description: formData.description,
          companyName: formData.companyName || 'Default Company',
          policyType: Number(formData.category) as 0 | 1 | 2 | 3 | 4 | 5 | 6,
          insuranceType: Number(formData.insuranceType) as 0 | 1 | 2,
          minAge: formData.minAge,
          maxAge: formData.maxAge,
          minSumAssured: formData.minSumAssured,
          maxSumAssured: formData.maxSumAssured,
          policyTerm: Math.floor(formData.policyTerm),
          premiumRate: formData.premiumRate,
          riskLevel: formData.riskLevel as 0 | 1 | 2,
          category: getEnumName(policyTypes, Number(formData.category)),
          minTerm: formData.minTerm || 5,
          maxTerm: formData.maxTerm || 30,
          baseRate: formData.baseRate || formData.premiumRate,
          hasMaturityBenefit: formData.hasMaturityBenefit || false,
          hasDeathBenefit: formData.hasDeathBenefit || true
        };
        await productApi.createProduct(payload);
      }
      setDialogOpen(false);
      dispatch(fetchProducts());
    } catch (error: any) {
      setError(error.message || 'Operation failed');
    }
  };

  const handleDelete = async (productId: string) => {
    if (confirm('Delete this product?')) {
      try {
        await productApi.deleteProduct(productId);
        dispatch(fetchProducts());
      } catch (error: any) {
        setError(error.message || 'Delete failed');
      }
    }
  };

  if (loading || enumLoading) return <LoadingSpinner message="Loading..." />;

  return (
    <Container maxWidth={false} sx={{ px: 3 }}>
      <Box py={4}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
          <Typography variant="h4">Product Management</Typography>
          <Box display="flex" gap={2} alignItems="center">
            <Button 
              variant="outlined" 
              startIcon={<Dashboard />}
              onClick={() => navigate('/admin/dashboard')}
              sx={{ height: 'fit-content' }}
            >
              Dashboard
            </Button>
            <TextField
              placeholder="Search by product name, company, or type..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              InputProps={{
                startAdornment: <Search sx={{ mr: 1, color: 'text.secondary' }} />
              }}
              sx={{ width: 300 }}
              size="small"
            />
            <Button variant="contained" startIcon={<Add />} onClick={() => openDialog()}>
              Add Product
            </Button>
          </Box>
        </Box>

        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell><strong>Product Details</strong></TableCell>
                <TableCell><strong>Type</strong></TableCell>
                <TableCell><strong>Age Range</strong></TableCell>
                <TableCell><strong>Sum Assured</strong></TableCell>
                <TableCell><strong>Risk</strong></TableCell>
                <TableCell><strong>Status</strong></TableCell>
                <TableCell><strong>Actions</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {products.filter(product => {
                if (!searchQuery) return true;
                const query = searchQuery.toLowerCase();
                return (
                  product.productName.toLowerCase().includes(query) ||
                  product.companyName.toLowerCase().includes(query) ||
                  getEnumName(policyTypes, product.policyType !== undefined ? product.policyType : (typeof product.category === 'string' ? parseInt(product.category) : product.category || 0)).toLowerCase().includes(query) ||
                  getEnumName(insuranceTypes, product.insuranceType).toLowerCase().includes(query)
                );
              }).map((product) => (
                <TableRow key={product.productId} hover>
                  <TableCell>
                    <Box>
                      <Typography variant="body2" fontWeight="medium">
                        {product.productName}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {product.companyName}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box>
                      <Typography variant="caption" display="block">
                        {getEnumName(policyTypes, product.policyType !== undefined ? product.policyType : (typeof product.category === 'string' ? parseInt(product.category) : product.category || 0))}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {getEnumName(insuranceTypes, product.insuranceType)}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {product.minAge} - {product.maxAge} years
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Box>
                      <Typography variant="caption" display="block">
                        Min: ₹{product.minSumAssured.toLocaleString()}
                      </Typography>
                      <Typography variant="caption" display="block">
                        Max: ₹{product.maxSumAssured.toLocaleString()}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Chip 
                      label={getRisk(product.riskLevel).name} 
                      color={getRisk(product.riskLevel).color as any} 
                      size="small" 
                    />
                  </TableCell>
                  <TableCell>
                    <Chip 
                      label={product.isActive ? 'Active' : 'Inactive'} 
                      color={product.isActive ? 'success' : 'default'} 
                      size="small" 
                    />
                  </TableCell>
                  <TableCell>
                    <Box display="flex" gap={1}>
                      <Button 
                        size="small" 
                        variant="outlined" 
                        color="primary" 
                        startIcon={<Edit />}
                        onClick={() => openDialog(product)}
                        sx={{ fontSize: '0.75rem', minWidth: '70px' }}
                      >
                        Edit
                      </Button>
                      <Button 
                        size="small" 
                        variant="outlined" 
                        color="error" 
                        startIcon={<Delete />}
                        onClick={() => handleDelete(product.productId)}
                        sx={{ fontSize: '0.75rem', minWidth: '80px' }}
                      >
                        Delete
                      </Button>
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>{selectedProduct ? 'Edit Product' : 'Add Product'}</DialogTitle>
        <DialogContent>
          <Box display="flex" flexDirection="column" gap={2} mt={2}>
            {error && <Alert severity="error">{error}</Alert>}
            
            <TextField label="Product Name" value={formData.productName} 
              onChange={(e) => setFormData({...formData, productName: e.target.value})} fullWidth />
            
            <TextField label="Description" value={formData.description} 
              onChange={(e) => setFormData({...formData, description: e.target.value})} fullWidth />
            
            <TextField label="Company Name" value={formData.companyName} 
              onChange={(e) => setFormData({...formData, companyName: e.target.value})} fullWidth />
            
            <Box display="flex" gap={2}>
              <FormControl fullWidth>
                <InputLabel>Policy Type</InputLabel>
                <Select value={formData.category} label="Policy Type"
                  onChange={(e) => setFormData({...formData, category: e.target.value})}>
                  {policyTypes.map((type) => (
                    <MenuItem key={type.value} value={type.value.toString()}>{type.name}</MenuItem>
                  ))}
                </Select>
              </FormControl>
              
              <FormControl fullWidth>
                <InputLabel>Insurance Type</InputLabel>
                <Select value={formData.insuranceType} label="Insurance Type"
                  onChange={(e) => setFormData({...formData, insuranceType: e.target.value})}>
                  {insuranceTypes.map((type) => (
                    <MenuItem key={type.value} value={type.value.toString()}>{type.name}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
            
            <Box display="flex" gap={2}>
              <TextField label="Min Age" type="number" value={formData.minAge} 
                onChange={(e) => setFormData({...formData, minAge: Number(e.target.value) || 0})} />
              <TextField label="Max Age" type="number" value={formData.maxAge} 
                onChange={(e) => setFormData({...formData, maxAge: Number(e.target.value) || 0})} />
            </Box>
            
            <Box display="flex" gap={2}>
              <TextField label="Min Sum Assured" type="number" value={formData.minSumAssured} 
                onChange={(e) => setFormData({...formData, minSumAssured: Number(e.target.value) || 0})} />
              <TextField label="Max Sum Assured" type="number" value={formData.maxSumAssured} 
                onChange={(e) => setFormData({...formData, maxSumAssured: Number(e.target.value) || 0})} />
            </Box>
            
            <Box display="flex" gap={2}>
              <TextField label="Min Term" type="number" value={formData.minTerm} 
                onChange={(e) => setFormData({...formData, minTerm: Number(e.target.value) || 0})} />
              <TextField label="Max Term" type="number" value={formData.maxTerm} 
                onChange={(e) => setFormData({...formData, maxTerm: Number(e.target.value) || 0})} />
            </Box>
            
            <Box display="flex" gap={2}>
              <TextField label="Base Rate" type="number" inputProps={{ step: 0.1 }} value={formData.baseRate} 
                onChange={(e) => setFormData({...formData, baseRate: Number(e.target.value) || 0})} />
              <TextField label="Premium Rate" type="number" inputProps={{ step: 0.1 }} value={formData.premiumRate} 
                onChange={(e) => setFormData({...formData, premiumRate: Number(e.target.value) || 0})} />
            </Box>
            
            <TextField label="Policy Term" type="number" value={formData.policyTerm} 
              onChange={(e) => setFormData({...formData, policyTerm: Number(e.target.value) || 0})} />
            
            <Box display="flex" gap={2}>
              <FormControl fullWidth>
                <InputLabel>Risk Level</InputLabel>
                <Select value={formData.riskLevel.toString()} label="Risk Level"
                  onChange={(e) => setFormData({...formData, riskLevel: Number(e.target.value)})}>
                  {riskLevels.map((risk) => (
                    <MenuItem key={risk.value} value={risk.value.toString()}>{risk.name}</MenuItem>
                  ))}
                </Select>
              </FormControl>
              
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select value={formData.isActive.toString()} label="Status"
                  onChange={(e) => setFormData({...formData, isActive: e.target.value === 'true'})}>
                  <MenuItem value="true">Active</MenuItem>
                  <MenuItem value="false">Inactive</MenuItem>
                </Select>
              </FormControl>
            </Box>
            
            <Box display="flex" gap={2}>
              <FormControl fullWidth>
                <InputLabel>Maturity Benefit</InputLabel>
                <Select value={formData.hasMaturityBenefit.toString()} label="Maturity Benefit"
                  onChange={(e) => setFormData({...formData, hasMaturityBenefit: e.target.value === 'true'})}>
                  <MenuItem value="true">Yes</MenuItem>
                  <MenuItem value="false">No</MenuItem>
                </Select>
              </FormControl>
              
              <FormControl fullWidth>
                <InputLabel>Death Benefit</InputLabel>
                <Select value={formData.hasDeathBenefit.toString()} label="Death Benefit"
                  onChange={(e) => setFormData({...formData, hasDeathBenefit: e.target.value === 'true'})}>
                  <MenuItem value="true">Yes</MenuItem>
                  <MenuItem value="false">No</MenuItem>
                </Select>
              </FormControl>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSubmit}>
            {selectedProduct ? 'Update' : 'Add'} Product
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}