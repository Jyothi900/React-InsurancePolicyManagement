import { useState } from 'react';
import { Container, Paper, TextField, Button, Typography, Box, Link } from '@mui/material';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Password reset requested for:', email);
    setSubmitted(true);
  };

  return (
    <Container maxWidth="sm">
      <Box py={8}>
        <Paper elevation={3} sx={{ p: 4 }}>
          <Typography variant="h4" align="center" gutterBottom>
            Reset Password
          </Typography>
          
          {!submitted ? (
            <>
              <Typography variant="body1" align="center" color="text.secondary" mb={3}>
                Enter your email address and we'll send you a link to reset your password.
              </Typography>
              
              <form onSubmit={handleSubmit}>
                <TextField
                  fullWidth
                  label="Email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  margin="normal"
                  required
                />
                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  sx={{ mt: 3, mb: 2 }}
                >
                  Send Reset Link
                </Button>
              </form>
            </>
          ) : (
            <Box textAlign="center">
              <Typography variant="h6" color="success.main" gutterBottom>
                Reset Link Sent!
              </Typography>
              <Typography variant="body1" color="text.secondary" mb={3}>
                Check your email for password reset instructions.
              </Typography>
            </Box>
          )}
          
          <Box textAlign="center">
            <Link href="/login" underline="hover">
              Back to Sign In
            </Link>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
}
