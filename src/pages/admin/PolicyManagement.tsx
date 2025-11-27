import { useEffect, useState } from 'react';
import { 
  Container, Typography, Box, Paper, Table, TableBody, TableCell, 
  TableContainer, TableHead, TableRow, Chip, Button, TextField,
  InputAdornment
} from '@mui/material';
import { Search, Refresh } from '@mui/icons-material';
import { useDispatch, useSelector } from 'react-redux';
import { type RootState, type AppDispatch } from '../../store';
import { fetchAllPoliciesForAdmin } from '../../slices/policySlice';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import type { Policy } from '../../types/Policy';

export default function PolicyManagement() {
  const dispatch = useDispatch<AppDispatch>();
  const { policies, loading, error } = useSelector((state: RootState) => state.policy);
  const [filteredPolicies, setFilteredPolicies] = useState<Policy[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    dispatch(fetchAllPoliciesForAdmin());
  }, [dispatch]);

  useEffect(() => {
    const filtered = policies.filter(policy =>
      policy.policyNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      policy.userId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      policy.productId?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredPolicies(filtered);
  }, [searchTerm, policies]);

  const getStatusColor = (status: number) => {
    switch (status) {
      case 1: return 'success';  
      case 0: return 'warning';  
      case 2: return 'error';    
      case 3: return 'default';  
      default: return 'info';
    }
  };

  const getStatusLabel = (status: number) => {
    switch (status) {
      case 0: return 'Pending';
      case 1: return 'Active';
      case 2: return 'Expired';
      case 3: return 'Cancelled';
      default: return 'Unknown';
    }
  };

  const handleRefresh = () => {
    dispatch(fetchAllPoliciesForAdmin());
  };

  if (loading) {
    return <LoadingSpinner message="Loading policies..." />;
  }

  if (error) {
    return (
      <Container maxWidth="lg">
        <Box py={4}>
          <Typography variant="h4" color="error">
            Error Loading Policies
          </Typography>
          <Typography variant="body1" color="text.secondary">
            {error}
          </Typography>
          <Button variant="contained" onClick={handleRefresh} sx={{ mt: 2 }}>
            Retry
          </Button>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl">
      <Box py={4}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
          <Box>
            <Typography variant="h4" gutterBottom sx={{ color: 'primary.main', fontWeight: 600 }}>
              Policy Management
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Manage all system policies - view, edit, and monitor policy status across all customers
            </Typography>
          </Box>
          <Button
            variant="outlined"
            startIcon={<Refresh />}
            onClick={handleRefresh}
            sx={{ height: 'fit-content' }}
          >
            Refresh
          </Button>
        </Box>

        <Paper sx={{ p: 3, bgcolor: '#f0f0f0' }}>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
            <Typography variant="h6" sx={{ color: 'text.primary' }}>
              All Policies ({filteredPolicies.length})
            </Typography>
            <TextField
              size="small"
              placeholder="Search policies..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search />
                  </InputAdornment>
                ),
              }}
              sx={{ minWidth: 300 }}
            />
          </Box>

          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell><strong>Policy Number</strong></TableCell>
                  <TableCell><strong>Customer</strong></TableCell>
                  <TableCell><strong>Product</strong></TableCell>
                  <TableCell><strong>Sum Assured</strong></TableCell>
                  <TableCell><strong>Premium</strong></TableCell>
                  <TableCell><strong>Status</strong></TableCell>
                  <TableCell><strong>Issued Date</strong></TableCell>

                </TableRow>
              </TableHead>
              <TableBody>
                {filteredPolicies.map((policy) => (
                  <TableRow key={policy.policyId} hover>
                    <TableCell>{policy.policyNumber}</TableCell>
                    <TableCell>
                      <Box>
                        <Typography variant="body2" fontWeight={500}>
                          User ID: {policy.userId || 'N/A'}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Agent: {policy.agentId || 'N/A'}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>{policy.productId || 'N/A'}</TableCell>
                    <TableCell>₹{policy.sumAssured?.toLocaleString()}</TableCell>
                    <TableCell>₹{policy.premiumAmount?.toLocaleString()}</TableCell>
                    <TableCell>
                      <Chip 
                        label={getStatusLabel(policy.status)} 
                        color={getStatusColor(policy.status) as any}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      {new Date(policy.issuedDate).toLocaleDateString()}
                    </TableCell>

                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          {filteredPolicies.length === 0 && (
            <Box textAlign="center" py={4}>
              <Typography variant="body1" color="text.secondary">
                No policies found
              </Typography>
            </Box>
          )}
        </Paper>
      </Box>
    </Container>
  );
}