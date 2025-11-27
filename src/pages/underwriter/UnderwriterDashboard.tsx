import { Container, Typography, Box, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Chip, Button } from '@mui/material';
import { Grid } from '@mui/material';
import { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import type { RootState, AppDispatch } from '../../store';
import { fetchUnderwriterDashboard, forceRefreshUnderwriterDashboard } from '../../slices/dashboardSlice';

export default function UnderwriterDashboard() {
  const { user } = useSelector((state: RootState) => state.auth);
  const { underwriterData, loading } = useSelector((state: RootState) => state.dashboard);
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  useEffect(() => {
    if (user?.id) {
      dispatch(fetchUnderwriterDashboard(user.id));
    }
  }, [dispatch, user?.id]);

  if (loading) {
    return (
      <Container maxWidth="lg">
        <Box py={4}>
          <Typography>Loading dashboard...</Typography>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box py={4}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Box>
            <Typography variant="h4" gutterBottom>
              Underwriter Dashboard
            </Typography>
            <Typography variant="subtitle1" color="text.secondary">
              Welcome back, {user?.email || 'Underwriter'}
            </Typography>
          </Box>
          <Button 
            variant="outlined" 
            onClick={() => user?.id && dispatch(forceRefreshUnderwriterDashboard(user.id))}
            disabled={loading}
          >
            {loading ? 'Refreshing...' : 'Refresh'}
          </Button>
        </Box>
        


        {/* Quick Actions */}
        <Box mb={4}>
          <Typography variant="h6" gutterBottom>
            Quick Actions
          </Typography>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 4 }}>
              <Button 
                variant="outlined" 
                fullWidth 
                onClick={() => navigate('/underwriter/proposals')}
              >
                Review Proposals
              </Button>
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <Button 
                variant="outlined" 
                fullWidth 
                onClick={() => navigate('/underwriter/documents')}
              >
                Verify Documents
              </Button>
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <Button 
                variant="outlined" 
                fullWidth 
                onClick={() => navigate('/underwriter/claims')}
              >
                Review Claims
              </Button>
            </Grid>
          </Grid>
        </Box>

        {/* Assigned Customers Table */}
        <Paper>
          <Box p={3}>
            <Typography variant="h6" gutterBottom>
              Assigned Customers
            </Typography>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Customer Name</TableCell>
                    <TableCell>Email</TableCell>
                    <TableCell>KYC Status</TableCell>
                    <TableCell>Assigned Date</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {underwriterData?.assignedCustomers && underwriterData.assignedCustomers.length > 0 ? (
                    underwriterData.assignedCustomers.map((customer: any) => (
                      <TableRow key={customer.customerId}>
                        <TableCell>{customer.customerName}</TableCell>
                        <TableCell>{customer.customerEmail}</TableCell>
                        <TableCell>
                          <Chip 
                            label={customer.kycStatus === 0 ? 'Pending' : customer.kycStatus === 1 ? 'Verified' : 'Rejected'} 
                            color={customer.kycStatus === 0 ? 'warning' : customer.kycStatus === 1 ? 'success' : 'error'} 
                            size="small" 
                          />
                        </TableCell>

                        <TableCell>{customer.assignedDate}</TableCell>
                        <TableCell>
                          <Button 
                            size="small" 
                            variant="outlined" 
                            onClick={() => navigate(`/underwriter/customer/${customer.customerId}`)}
                          >
                            Review
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} align="center">
                        <Typography variant="body2" color="text.secondary">
                          No customers assigned yet
                        </Typography>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>

          </Box>
        </Paper>
      </Box>
    </Container>
  );


}


