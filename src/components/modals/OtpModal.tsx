import { useState } from 'react';
import { Dialog, DialogContent, Box, Typography, TextField, Button, IconButton } from '@mui/material';
import { Close } from '@mui/icons-material';
import { authApi } from '../../api/auth.api';
import { toast } from 'react-toastify';

interface OtpModalProps {
  open: boolean;
  onClose: () => void;
  email: string;
  onVerified: () => void;
  type?: 'verification' | 'password-reset';
}

export default function OtpModal({ open, onClose, email, onVerified, type = 'password-reset' }: OtpModalProps) {
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleVerify = async () => {
    if (otp.length !== 6) {
      setError('Please enter 6-digit OTP');
      return;
    }

    setLoading(true);
    setError('');
    try {
      await authApi.verifyOtp(email, otp);
      const message = type === 'verification' ? 'Email verified successfully! You can now sign in.' : 'OTP verified successfully!';
      toast.success(message);
      onVerified();
      onClose();
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || 'Invalid OTP';
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setLoading(true);
    setError('');
    try {
      await authApi.resendOtp(email);
      toast.success('OTP resent successfully!');
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || 'Failed to resend OTP';
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      maxWidth="xs"
      fullWidth
      disableRestoreFocus
      disableEnforceFocus
      disableAutoFocus
      PaperProps={{
        sx: {
          backgroundColor: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(15px)',
          border: '2px solid rgba(255, 215, 0, 0.8)',
          borderRadius: 3,
          boxShadow: '0 20px 40px rgba(0,0,0,0.3)'
        }
      }}
    >
      <DialogContent sx={{ p: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h5" sx={{ color: '#1a1a1a', fontWeight: 700 }}>
            Verify OTP
          </Typography>
          <IconButton onClick={onClose} sx={{ color: '#1a1a1a' }}>
            <Close />
          </IconButton>
        </Box>

        <Typography variant="body2" sx={{ color: '#666', mb: 3 }}>
          {type === 'verification' 
            ? `Please verify your email by entering the 6-digit OTP sent to ${email}`
            : `Enter the 6-digit OTP sent to ${email}`
          }
        </Typography>



        <TextField
          fullWidth
          label="Enter OTP"
          value={otp}
          onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
          inputProps={{ maxLength: 6, style: { textAlign: 'center', fontSize: '1.5rem', letterSpacing: '0.5rem' } }}
          sx={{
            mb: 3,
            '& .MuiOutlinedInput-root': {
              borderRadius: 2,
              '&:hover fieldset': { borderColor: '#FFD700' },
              '&.Mui-focused fieldset': { borderColor: '#FFD700' }
            },
            '& .MuiInputLabel-root.Mui-focused': { color: '#FFD700' }
          }}
        />

        <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
          <Button
            fullWidth
            variant="contained"
            onClick={handleVerify}
            disabled={loading || otp.length !== 6}
            sx={{
              backgroundColor: '#FFD700',
              color: '#000',
              fontWeight: 600,
              borderRadius: 2,
              textTransform: 'none',
              py: 1.5,
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
            {loading ? 'Verifying...' : 'Verify OTP'}
          </Button>
        </Box>

        <Button
          fullWidth
          variant="text"
          onClick={handleResend}
          disabled={loading}
          sx={{
            color: '#1a930fff',
            fontWeight: 600,
            '&:hover': { backgroundColor: 'rgba(26, 147, 15, 0.1)' }
          }}
        >
          Resend OTP
        </Button>
      </DialogContent>
    </Dialog>
  );
}