import { useState, useEffect } from 'react';
import { TextField, Button, Box, IconButton, InputAdornment, Alert } from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { useDispatch } from 'react-redux';
import type { AppDispatch } from '../../store';
import { loginUser } from '../../slices/authslice';
import { validateEmail } from '../../utils/validators';
import { tokenstore } from '../../auth/tokenstore';

interface LoginFormProps {
  onLoginSuccess?: (role?: string) => void;
  onForgotPassword?: (email: string) => void;
}

export default function LoginForm({ onLoginSuccess, onForgotPassword }: LoginFormProps) {
  const dispatch = useDispatch<AppDispatch>();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<{[key: string]: string}>({});
  const [loading, setLoading] = useState(false);
  

  useEffect(() => {
 
    const timer = setTimeout(() => {
      setFormData({ email: '', password: '' });
      setErrors({});
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  const validateForm = () => {
    const newErrors: {[key: string]: string} = {};

    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!validateEmail(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
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
      const result = await dispatch(loginUser(formData));
      
      if (result.type === 'auth/login/fulfilled') {
        const userRole = (result.payload as { role?: string })?.role;
        onLoginSuccess?.(userRole);
      } else if (result.type === 'auth/login/rejected') {
        setErrors({ general: 'Invalid email or password' });
      }
    } catch (error) {
      setErrors({ general: 'Login failed. Please try again.' });
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
        label="Email"
        type="email"
        value={formData.email}
        onChange={(e) => {
          setFormData({ ...formData, email: e.target.value });
          if (errors.email) setErrors({ ...errors, email: '' });
        }}
        error={!!errors.email}
        helperText={errors.email}
        margin="normal"
        required
        autoComplete="new-email"
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
        margin="normal"
        required
        autoComplete="new-password"
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
          mb: 2,
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
        {loading ? 'Signing In...' : 'Sign In'}
      </Button>
      
      <Button
        fullWidth
        variant="text"
        onClick={() => onForgotPassword?.(formData.email)}
        sx={{
          color: '#1a930fff',
          fontWeight: 600,
          textTransform: 'none',
          '&:hover': { backgroundColor: 'rgba(26, 147, 15, 0.1)' }
        }}
      >
        Forgot Password?
      </Button>
    </Box>
  );
}
