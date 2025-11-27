import { useEffect } from 'react';
import { Container, Typography, Box, Card, CardContent, Table, TableBody, TableCell, TableHead, TableRow } from '@mui/material';
import { Grid } from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState, AppDispatch } from '../../store';
import { fetchAllUsers } from '../../slices/userSlice';
import { fetchAllClaims } from '../../slices/claimSlice';


export default function SystemReports() {
  const dispatch = useDispatch<AppDispatch>();
  const { users } = useSelector((state: RootState) => state.user);
  const { claims } = useSelector((state: RootState) => state.claim);

  useEffect(() => {
    void dispatch(fetchAllUsers());
    void dispatch(fetchAllClaims());
  }, [dispatch]);

  const reportData = [
    { metric: 'Total Users', value: users.length.toString(), change: '+12%' },
    { metric: 'Active Policies', value: '0', change: '+8%' },
    { metric: 'Claims Processed', value: claims.filter((c) => c.status === 11).length.toString(), change: '+15%' }, // Settled
    { metric: 'Revenue (Monthly)', value: '$0', change: '+22%' }
  ];

  const recentActivity: Array<{ action: string; user: string; time: string }> = [
];

  return (
    <Container maxWidth="lg">
      <Box py={4}>
        <Typography variant="h4" gutterBottom>
          System Reports
        </Typography>
        
        <Grid container spacing={3} mb={4}>
          {reportData.map((item, index) => (
            <Grid size={{ xs: 12, sm: 6, md: 3 }} key={index}>
              <Card>
                <CardContent>
                  <Typography variant="h4" color="primary">
                    {item.value}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {item.metric}
                  </Typography>
                  <Typography variant="caption" color="success.main">
                    {item.change}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
        
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Recent System Activity
            </Typography>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Action</TableCell>
                  <TableCell>User</TableCell>
                  <TableCell>Time</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {recentActivity.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={3} align="center">
                      No recent activity data available. Please implement API endpoint.
                    </TableCell>
                  </TableRow>
                ) : (
                  recentActivity.map((activity, index: number) => (
                    <TableRow key={index}>
                      <TableCell>{activity.action}</TableCell>
                      <TableCell>{activity.user}</TableCell>
                      <TableCell>{activity.time}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </Box>
    </Container>
  );
}

