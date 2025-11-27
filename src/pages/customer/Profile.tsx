import { Container, Typography, Box, Paper, Alert, Snackbar, CircularProgress } from '@mui/material';
import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState, AppDispatch } from '../../store';
import { fetchUserById } from '../../slices/userSlice';
import UserProfileForm from '../../components/forms/UserProfileForm';

export default function Profile() {
  const dispatch = useDispatch<AppDispatch>();
  const { user: authUser } = useSelector((state: RootState) => state.auth);
  const { currentUser, loading } = useSelector((state: RootState) => state.user);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    if (authUser?.id && !currentUser) {
      dispatch(fetchUserById(authUser.id));
    }
  }, [dispatch, authUser?.id, currentUser]);

  const handleProfileUpdated = () => {
    setShowSuccess(true);
    // Refresh user data to get updated profile image
    if (authUser?.id) {
      dispatch(fetchUserById(authUser.id));
    }
  };

  if (loading) {
    return (
      <Container maxWidth="lg">
        <Box py={4} display="flex" justifyContent="center">
          <CircularProgress sx={{ color: '#2E7D32' }} />
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box py={4}>
        <Typography 
          variant="h4" 
          gutterBottom 
          color="#000" 
          fontWeight="700"
          sx={{ mb: 4 }}
        >
          My Profile
        </Typography>
        
        <Paper 
          elevation={3} 
          sx={{ 
            p: 4, 
            borderRadius: 3,
            border: '1px solid #e0e0e0'
          }}
        >
          <UserProfileForm onProfileUpdated={handleProfileUpdated} />
        </Paper>
      </Box>

      <Snackbar
        open={showSuccess}
        autoHideDuration={4000}
        onClose={() => setShowSuccess(false)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert 
          onClose={() => setShowSuccess(false)} 
          severity="success" 
          sx={{ width: '100%' }}
        >
          Profile updated successfully!
        </Alert>
      </Snackbar>
    </Container>
  );
}
