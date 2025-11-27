import { useState, useEffect } from 'react';
import { Box, TextField, Button, Typography, FormControl, InputLabel, Select, MenuItem, Avatar, IconButton, Card, CardContent } from '@mui/material';
import { Grid } from '@mui/material';
import { PhotoCamera } from '@mui/icons-material';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState, AppDispatch } from '../../store';
import { updateUser, uploadProfileImage, fetchUserById } from '../../slices/userSlice';
import type { Gender } from '../../types/User';

interface UserProfileFormProps {
  onProfileUpdated?: () => void;
}

export default function UserProfileForm({ onProfileUpdated }: UserProfileFormProps) {
  const dispatch = useDispatch<AppDispatch>();
  const { currentUser } = useSelector((state: RootState) => state.user);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    mobile: '',
    address: '',
    dateOfBirth: '',
    gender: 0 as Gender
  });
  const [profileImage, setProfileImage] = useState<string | null>(null);

  useEffect(() => {
    if (currentUser) {
      setFormData({
        fullName: currentUser.fullName || '',
        email: currentUser.email || '',
        mobile: currentUser.mobile || '',
        address: currentUser.address || '',
        dateOfBirth: currentUser.dateOfBirth || '',
        gender: currentUser.gender || 0
      });
      const imageUrl = currentUser.profileImagePath 
        ? `https://localhost:7128${currentUser.profileImagePath}` 
        : null;
      setProfileImage(imageUrl);
    }
  }, [currentUser]);

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && currentUser?.userId) {
      try {
        const result = await dispatch(uploadProfileImage({ userId: currentUser.userId, imageFile: file }));
        
        if (result.meta.requestStatus === 'fulfilled') {
          await dispatch(fetchUserById(currentUser.userId));
          onProfileUpdated?.(); 
        }
      } catch (error) {
        console.error('Upload failed:', error);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (currentUser?.userId) {
        const updateData = {
          fullName: formData.fullName,
          email: formData.email,
          role: currentUser.role,
          mobile: formData.mobile,
          dateOfBirth: formData.dateOfBirth,
          gender: formData.gender,
          address: formData.address,
          kycStatus: currentUser.kycStatus
        };
        await dispatch(updateUser({ userId: currentUser.userId, updates: updateData }));
        onProfileUpdated?.();
      }
    } catch (error) {
      console.error('Profile update failed:', error);
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit}>
      {/* Profile Image Section */}
      <Card sx={{ mb: 3, bgcolor: '#f8f9fa' }}>
        <CardContent sx={{ textAlign: 'center', py: 3 }}>
          <Box sx={{ position: 'relative', display: 'inline-block' }}>
            <Avatar
              src={profileImage || undefined}
              sx={{ width: 120, height: 120, mb: 2, mx: 'auto', bgcolor: '#2E7D32' }}
            >
              {formData.fullName.charAt(0).toUpperCase()}
            </Avatar>
            <IconButton
              component="label"
              sx={{
                position: 'absolute',
                bottom: 16,
                right: -8,
                bgcolor: '#2E7D32',
                color: 'white',
                '&:hover': { bgcolor: '#1B5E20' }
              }}
            >
              <PhotoCamera />
              <input
                type="file"
                hidden
                accept="image/*"
                onChange={handleImageUpload}
              />
            </IconButton>
          </Box>
          <Typography variant="h6" color="#2E7D32" fontWeight="600">
            {formData.fullName || 'User Name'}
          </Typography>
        </CardContent>
      </Card>

      <Typography variant="h6" gutterBottom color="#000" fontWeight="600">
        Personal Information
      </Typography>
      
      <Grid container spacing={3}>
        <Grid size={{ xs: 12 }}>
          <TextField
            fullWidth
            label="Full Name"
            value={formData.fullName}
            onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
            required
          />
        </Grid>
        
        <Grid size={{ xs: 12, sm: 6 }}>
          <TextField
            fullWidth
            label="Email"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            required
            disabled
            helperText="Email cannot be changed"
          />
        </Grid>
        
        <Grid size={{ xs: 12, sm: 6 }}>
          <TextField
            fullWidth
            label="Mobile Number"
            value={formData.mobile}
            onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
            required
          />
        </Grid>
        
        <Grid size={{ xs: 12, sm: 6 }}>
          <TextField
            fullWidth
            label="Date of Birth"
            type="date"
            value={formData.dateOfBirth}
            onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
            InputLabelProps={{ shrink: true }}
            required
          />
        </Grid>
        
        <Grid size={{ xs: 12, sm: 6 }}>
          <FormControl fullWidth required>
            <InputLabel>Gender</InputLabel>
            <Select
              value={formData.gender}
              label="Gender"
              onChange={(e) => setFormData({ ...formData, gender: e.target.value as Gender })}
            >
              <MenuItem value={0}>Male</MenuItem>
              <MenuItem value={1}>Female</MenuItem>
              <MenuItem value={2}>Other</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        
        <Grid size={{ xs: 12 }}>
          <TextField
            fullWidth
            label="Address"
            multiline
            rows={3}
            value={formData.address}
            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
          />
        </Grid>

      </Grid>
      
      <Box mt={4}>
        <Button 
          type="submit" 
          variant="contained" 
          fullWidth
          sx={{
            py: 1.5,
            bgcolor: '#2E7D32',
            fontWeight: 600,
            '&:hover': { bgcolor: '#1B5E20' }
          }}
        >
          Update Profile
        </Button>
      </Box>
    </Box>
  );
}