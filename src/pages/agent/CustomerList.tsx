import { useEffect } from 'react';
import { Container, Typography, Box } from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState, AppDispatch } from '../../store';
import { fetchUsers } from '../../slices/userSlice';
import UserTable from '../../components/tables/UserTable';

export default function CustomerList() {
  const dispatch = useDispatch<AppDispatch>();
  const { users, loading } = useSelector((state: RootState) => state.user);

  useEffect(() => {
    void dispatch(fetchUsers());
  }, [dispatch]);

  return (
    <Container maxWidth="lg">
      <Box py={4}>
        <Typography variant="h4" gutterBottom>
          Customer Management
        </Typography>
        
        <UserTable 
          users={users.filter(user => user.role === 0)} 
          loading={loading}
        />
      </Box>
    </Container>
  );
}
