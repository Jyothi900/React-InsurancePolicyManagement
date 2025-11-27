import { useEffect, useState } from 'react';
import { 
  Container, Typography, Box, Paper, Table, TableBody, TableCell, 
  TableContainer, TableHead, TableRow, Chip, Button, TextField,
  InputAdornment
} from '@mui/material';
import { Search, Refresh, Dashboard } from '@mui/icons-material';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { type RootState, type AppDispatch } from '../../store';
import { fetchAllClaims } from '../../slices/claimSlice';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import type { Claim } from '../../types/Claim';

export default function ClaimManagement() {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { claims, loading, error } = useSelector((state: RootState) => state.claim);
  const [filteredClaims, setFilteredClaims] = useState<Claim[]>([]);
  const [searchTerm, setSearchTerm] = useState('');


  useEffect(() => {
    dispatch(fetchAllClaims());
  }, [dispatch]);

  useEffect(() => {
    const filtered = claims.filter(claim =>
      claim.claimNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      claim.claimantName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      claim.policyId?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredClaims(filtered);
  }, [searchTerm, claims]);

  const getStatusColor = (status: number) => {
    switch (status) {
      case 2: return 'success'; 
      case 1: return 'warning';
      case 3: return 'error';   
      case 0: return 'info';    
      default: return 'default';
    }
  };

  const getStatusLabel = (status: number) => {
    switch (status) {
      case 0: return 'Filed';
      case 1: return 'Pending';
      case 2: return 'Approved';
      case 3: return 'Rejected';
      default: return 'Unknown';
    }
  };

  const handleRefresh = () => {
    dispatch(fetchAllClaims());
  };



  if (loading) {
    return <LoadingSpinner message="Loading claims..." />;
  }

  if (error) {
    return (
      <Container maxWidth="lg">
        <Box py={4}>
          <Typography variant="h4" color="error">
            Error Loading Claims
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
              Claim Management
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Manage all system claims - review, approve, and monitor claim status across all customers
            </Typography>
          </Box>
          <Box display="flex" gap={2}>
            <Button 
              variant="outlined" 
              startIcon={<Dashboard />}
              onClick={() => navigate('/admin/dashboard')}
              sx={{ height: 'fit-content' }}
            >
              Dashboard
            </Button>
            <Button
              variant="outlined"
              startIcon={<Refresh />}
              onClick={handleRefresh}
              sx={{ height: 'fit-content' }}
            >
              Refresh
            </Button>
          </Box>
        </Box>

        <Paper sx={{ p: 3, bgcolor: '#f0f0f0' }}>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
            <Typography variant="h6" sx={{ color: 'text.primary' }}>
              All Claims ({filteredClaims.length})
            </Typography>
            <TextField
              size="small"
              placeholder="Search claims..."
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
                  <TableCell><strong>Claim Number</strong></TableCell>
                  <TableCell><strong>Policy</strong></TableCell>
                  <TableCell><strong>Claimant</strong></TableCell>
                  <TableCell><strong>Claim Amount</strong></TableCell>
                  <TableCell><strong>Approved Amount</strong></TableCell>
                  <TableCell><strong>Status</strong></TableCell>
                  <TableCell><strong>Filed Date</strong></TableCell>

                </TableRow>
              </TableHead>
              <TableBody>
                {filteredClaims.map((claim) => (
                  <TableRow key={claim.claimId} hover>
                    <TableCell>{claim.claimNumber}</TableCell>
                    <TableCell>
                      <Box>
                        <Typography variant="body2" fontWeight={500}>
                          {claim.policyId || 'N/A'}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          User ID: {claim.userId || 'N/A'}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>{claim.claimantName || 'N/A'}</TableCell>
                    <TableCell>₹{claim.claimAmount?.toLocaleString()}</TableCell>
                    <TableCell>
                      {claim.approvedAmount ? `₹${claim.approvedAmount.toLocaleString()}` : '-'}
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={getStatusLabel(claim.status)} 
                        color={getStatusColor(claim.status) as any}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      {new Date(claim.filedDate).toLocaleDateString()}
                    </TableCell>

                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          {filteredClaims.length === 0 && (
            <Box textAlign="center" py={4}>
              <Typography variant="body1" color="text.secondary">
                No claims found
              </Typography>
            </Box>
          )}
        </Paper>


      </Box>
    </Container>
  );
}