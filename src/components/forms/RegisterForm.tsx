import { useState } from 'react';
import { TextField, Button, Box, FormControl, InputLabel, Select, MenuItem, IconButton, InputAdornment, Alert } from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { useDispatch, useSelector } from 'react-redux';
import { useEffect } from 'react';
import type { AppDispatch, RootState } from '../../store';
import { registerUser } from '../../slices/userSlice';
import { fetchAllEnums } from '../../slices/enumSlice';
import { type Gender, type UserRole } from '../../types/User';
import { validateEmail, validateAge, validatePassword, validateFullName, validateMobile, getMaxBirthDate } from '../../utils/validators';
import { authApi } from '../../api/auth.api';

interface RegisterFormProps {
  onRegisterSuccess?: (email: string) => void;
}

export default function RegisterForm({ onRegisterSuccess }: RegisterFormProps) {
  const dispatch = useDispatch<AppDispatch>();
  const { genders, lastFetched } = useSelector((state: RootState) => state.enum);

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    mobile: '',
    dateOfBirth: '',
    gender: '' as any, 
    address: '',
    role: 0 as UserRole 
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<{[key: string]: string}>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const now = Date.now();
    const fiveMinutes = 5 * 60 * 1000;
    if (!lastFetched || (now - lastFetched) > fiveMinutes) {
      dispatch(fetchAllEnums());
    }
  }, [dispatch, lastFetched]);

  useEffect(() => {
    if (genders && genders.length > 0 && formData.gender === '') {
      setFormData(prev => ({ ...prev, gender: genders[0].value }));
    }
  }, [genders, formData.gender]);

  const validateForm = () => {
    const newErrors: {[key: string]: string} = {};

    const nameValidation = validateFullName(formData.fullName);
    if (!nameValidation.isValid) {
      newErrors.fullName = nameValidation.message!;
    }
    
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!validateEmail(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    const passwordValidation = validatePassword(formData.password);
    if (!passwordValidation.isValid) {
      newErrors.password = passwordValidation.message!;
    }
    
    const mobileValidation = validateMobile(formData.mobile);
    if (!mobileValidation.isValid) {
      newErrors.mobile = mobileValidation.message!;
    }

    if (!formData.dateOfBirth) {
      newErrors.dateOfBirth = 'Date of birth is required';
    } else if (!validateAge(formData.dateOfBirth, 18, 100)) {
      newErrors.dateOfBirth = 'Age must be between 18-100 years';
    }

    if (!formData.address) {
      newErrors.address = 'Address is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setLoading(true);
    setErrors({});
    
    try {
      const result = await dispatch(registerUser({
        ...formData,
        gender: formData.gender,
        role: 0 as UserRole 
      }));
      if (result.type === 'user/register/fulfilled') {
        try {
          await authApi.sendOtp(formData.email);
          onRegisterSuccess?.(formData.email);
        } catch (error: any) {
          setErrors({ general: 'Registration successful but failed to send verification email. Please try login.' });
        }
      } else {
        setErrors({ general: 'Registration failed. Email may already exist.' });
      }
    } catch (error) {
      setErrors({ general: 'Registration failed. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit}>
      {errors.general && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {errors.general}
        </Alert>
      )}
      
      <TextField
        fullWidth
        label="Full Name"
        value={formData.fullName}
        onChange={(e) => {
          const value = e.target.value.replace(/[^a-zA-Z\s]/g, ''); 
          setFormData({ ...formData, fullName: value });
          if (errors.fullName) setErrors({ ...errors, fullName: '' });
        }}
        error={!!errors.fullName}
        helperText={errors.fullName}
        margin="dense"
        required
        sx={{
          '& .MuiOutlinedInput-root': {
            borderRadius: 2,
            '&:hover fieldset': { borderColor: '#FFD700' },
            '&.Mui-focused fieldset': { borderColor: '#FFD700' }
          },
          '& .MuiInputLabel-root.Mui-focused': { color: '#FFD700' }
        }}
      />
      
      <TextField
        fullWidth
        label="Email"
        type="email"
        value={formData.email}
        onChange={(e) => {
          setFormData({ ...formData, email: e.target.value });
          if (errors.email) setErrors({ ...errors, email: '' });
        }}
        error={!!errors.email}
        helperText={errors.email}
        margin="dense"
        required
        sx={{
          '& .MuiOutlinedInput-root': {
            borderRadius: 2,
            '&:hover fieldset': { borderColor: '#FFD700' },
            '&.Mui-focused fieldset': { borderColor: '#FFD700' }
          },
          '& .MuiInputLabel-root.Mui-focused': { color: '#FFD700' }
        }}
      />
      
      <Box sx={{ display: 'flex', gap: 2 }}>
        <TextField
          fullWidth
          label="Mobile Number"
          value={formData.mobile}
          onChange={(e) => {
            const value = e.target.value.replace(/\D/g, '').slice(0, 10); // Only digits, max 10
            setFormData({ ...formData, mobile: value });
            if (errors.mobile) setErrors({ ...errors, mobile: '' });
          }}
          error={!!errors.mobile}
          helperText={errors.mobile}
          inputProps={{ maxLength: 10 }}
          margin="dense"
          required
          sx={{
            '& .MuiOutlinedInput-root': {
              borderRadius: 2,
              '&:hover fieldset': { borderColor: '#FFD700' },
              '&.Mui-focused fieldset': { borderColor: '#FFD700' }
            },
            '& .MuiInputLabel-root.Mui-focused': { color: '#FFD700' }
          }}
        />
        <TextField
          fullWidth
          label="Date of Birth"
          type="date"
          value={formData.dateOfBirth}
          onChange={(e) => {
            setFormData({ ...formData, dateOfBirth: e.target.value });
            if (errors.dateOfBirth) setErrors({ ...errors, dateOfBirth: '' });
          }}
          error={!!errors.dateOfBirth}
          helperText={errors.dateOfBirth || 'Must be 18+ years old'}
          InputLabelProps={{ shrink: true }}
          inputProps={{ max: getMaxBirthDate() }}
          margin="dense"
          required
          sx={{
            '& .MuiOutlinedInput-root': {
              borderRadius: 2,
              '&:hover fieldset': { borderColor: '#FFD700' },
              '&.Mui-focused fieldset': { borderColor: '#FFD700' }
            },
            '& .MuiInputLabel-root.Mui-focused': { color: '#FFD700' }
          }}
        />
      </Box>
      

      
      <FormControl fullWidth margin="dense" required sx={{
        '& .MuiOutlinedInput-root': {
          borderRadius: 2,
          '&:hover fieldset': { borderColor: '#FFD700' },
          '&.Mui-focused fieldset': { borderColor: '#FFD700' }
        },
        '& .MuiInputLabel-root.Mui-focused': { color: '#FFD700' }
      }}>
        <InputLabel>Gender</InputLabel>
        <Select
          value={formData.gender}
          onChange={(e) => setFormData({ ...formData, gender: e.target.value as Gender })}
          label="Gender"
          displayEmpty
        >
          {genders && genders.length > 0 ? (
            genders.map((gender) => (
              <MenuItem key={gender.value} value={gender.value}>
                {gender.name}
              </MenuItem>
            ))
          ) : (
            // Fallback options
            [
              <MenuItem key={0} value={0}>Male</MenuItem>,
              <MenuItem key={1} value={1}>Female</MenuItem>,
              <MenuItem key={2} value={2}>Other</MenuItem>
            ]
          )}
        </Select>
      </FormControl>
      
      <TextField
        fullWidth
        label="Address"
        value={formData.address}
        onChange={(e) => {
          setFormData({ ...formData, address: e.target.value });
          if (errors.address) setErrors({ ...errors, address: '' });
        }}
        error={!!errors.address}
        helperText={errors.address}
        margin="dense"
        multiline
        rows={2}
        required
        sx={{
          '& .MuiOutlinedInput-root': {
            borderRadius: 2,
            '&:hover fieldset': { borderColor: '#FFD700' },
            '&.Mui-focused fieldset': { borderColor: '#FFD700' }
          },
          '& .MuiInputLabel-root.Mui-focused': { color: '#FFD700' }
        }}
      />
      
      <TextField
        fullWidth
        label="Password"
        type={showPassword ? 'text' : 'password'}
        value={formData.password}
        onChange={(e) => {
          setFormData({ ...formData, password: e.target.value });
          if (errors.password) setErrors({ ...errors, password: '' });
        }}
        error={!!errors.password}
        helperText={errors.password}
        margin="dense"
        required
        sx={{
          '& .MuiOutlinedInput-root': {
            borderRadius: 2,
            '&:hover fieldset': { borderColor: '#FFD700' },
            '&.Mui-focused fieldset': { borderColor: '#FFD700' }
          },
          '& .MuiInputLabel-root.Mui-focused': { color: '#FFD700' }
        }}
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              <IconButton
                onClick={() => setShowPassword(!showPassword)}
                edge="end"
              >
                {showPassword ? <VisibilityOff /> : <Visibility />}
              </IconButton>
            </InputAdornment>
          )
        }}
      />
      
      <Button
        type="submit"
        fullWidth
        variant="contained"
        disabled={loading}
        sx={{
          mt: 3,
          py: 1.5,
          backgroundColor: '#FFD700',
          color: '#000',
          fontWeight: 600,
          borderRadius: 2,
          textTransform: 'none',
          fontSize: '1rem',
          '&:hover': {
            backgroundColor: '#FFC107',
            transform: 'translateY(-1px)',
            boxShadow: '0 4px 12px rgba(255, 215, 0, 0.4)'
          },
          '&:disabled': {
            backgroundColor: '#ccc',
            color: '#666'
          }
        }}
      >
        {loading ? 'Creating Account...' : 'Sign Up'}
      </Button>
    </Box>
  );
}


