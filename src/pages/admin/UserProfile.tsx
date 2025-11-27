import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Paper,
  Avatar,
  Chip,
  Button,
  Divider
} from '@mui/material';
import { ArrowBack } from '@mui/icons-material';
import { userApi, type User } from '../../api/user.api';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import defaultMaleProfile from '../../assets/default-male-user-profile-icon.jpg';
import defaultFemaleProfile from '../../assets/default-female-user-profile-icon.jpg';

export default function UserProfile() {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (userId) {
      loadUserDetails();
    }
  }, [userId]);

  const loadUserDetails = async () => {
    try {
      setLoading(true);
      const userData = await userApi.getUserById(userId!);
      setUser(userData);
    } catch (error: any) {
      setError('Failed to load user details');
    } finally {
      setLoading(false);
    }
  };

  const getProfileImage = (user: User) => {
    if (user.profileImagePath) {
      return user.profileImagePath;
    }
    return user.gender === 1 ? defaultFemaleProfile : defaultMaleProfile;
  };

  const getRoleName = (role: number) => {
    switch (role) {
      case 0: return 'Customer';
      case 1: return 'Agent';
      case 2: return 'Admin';
      case 3: return 'Underwriter';
      default: return 'Unknown';
    }
  };

  const getGenderName = (gender: number) => {
    switch (gender) {
      case 0: return 'Male';
      case 1: return 'Female';
      case 2: return 'Other';
      default: return 'Unknown';
    }
  };

  const getKYCStatusName = (status: number) => {
    switch (status) {
      case 0: return 'Pending';
      case 1: return 'Verified';
      case 2: return 'Rejected';
      default: return 'Unknown';
    }
  };

  const getStatusColor = (status: number) => {
    switch (status) {
      case 1: return 'success';
      case 2: return 'error';
      case 0: return 'warning';
      default: return 'default';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN');
  };

  if (loading) {
    return <LoadingSpinner message="Loading user profile..." />;
  }

  if (error || !user) {
    return (
      <Container maxWidth="lg">
        <Box py={4}>
          <Typography variant="h4" color="error">
            {error || 'User not found'}
          </Typography>
          <Button 
            variant="contained" 
            startIcon={<ArrowBack />}
            onClick={() => navigate('/admin/users')}
            sx={{ mt: 2 }}
          >
            Back to Users
          </Button>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box py={4}>
        <Box display="flex" justifyContent="flex-start" alignItems="center" mb={4}>
          <Button 
            variant="outlined" 
            startIcon={<ArrowBack />}
            onClick={() => navigate('/admin/users')}
          >
            Back to Users
          </Button>
        </Box>

        <Paper sx={{ p: 4 }}>
          <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 4 }}>
            <Box sx={{ flex: { md: '0 0 33%' } }}>
              <Box textAlign="center">
                <Avatar
                  src={getProfileImage(user)}
                  sx={{ width: 150, height: 150, mx: 'auto', mb: 2 }}
                />
                <Typography variant="h4" gutterBottom>
                  {user.fullName}
                </Typography>
                <Chip 
                  label={getRoleName(user.role)} 
                  color="primary" 
                  sx={{ mb: 1 }}
                />
                <Box sx={{ mt: 2 }}>
                  <Chip 
                    label={getKYCStatusName(user.kycStatus)} 
                    color={getStatusColor(user.kycStatus) as any}
                    sx={{ mr: 1 }}
                  />
                  <Chip 
                    label={user.isActive ? 'Active' : 'Inactive'} 
                    color={user.isActive ? 'success' : 'default'} 
                  />
                </Box>
              </Box>
            </Box>

            <Box sx={{ flex: 1 }}>
              <Typography variant="h5" gutterBottom>
                Personal Information
              </Typography>
              <Divider sx={{ mb: 3 }} />

              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 3 }}>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    User ID
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    {user.userId}
                  </Typography>
                </Box>

                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    Email Address
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    {user.email}
                  </Typography>
                </Box>

                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    Mobile Number
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    {user.mobile}
                  </Typography>
                </Box>

                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    Date of Birth
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    {formatDate(user.dateOfBirth)}
                  </Typography>
                </Box>

                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    Gender
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    {getGenderName(user.gender)}
                  </Typography>
                </Box>

                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    Created At
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    {formatDate(user.createdAt)}
                  </Typography>
                </Box>

                {user.aadhaarNumber && (
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary">
                      Aadhaar Number
                    </Typography>
                    <Typography variant="body1" gutterBottom>
                      {user.aadhaarNumber}
                    </Typography>
                  </Box>
                )}

                {user.panNumber && (
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary">
                      PAN Number
                    </Typography>
                    <Typography variant="body1" gutterBottom>
                      {user.panNumber}
                    </Typography>
                  </Box>
                )}

                <Box sx={{ gridColumn: '1 / -1' }}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Address
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    {user.address || 'Not provided'}
                  </Typography>
                </Box>

                {user.assignedAgentId && (
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary">
                      Assigned Agent ID
                    </Typography>
                    <Typography variant="body1" gutterBottom>
                      {user.assignedAgentId}
                    </Typography>
                  </Box>
                )}

                {user.assignedUnderwriterId && (
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary">
                      Assigned Underwriter ID
                    </Typography>
                    <Typography variant="body1" gutterBottom>
                      {user.assignedUnderwriterId}
                    </Typography>
                  </Box>
                )}
              </Box>
            </Box>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
}