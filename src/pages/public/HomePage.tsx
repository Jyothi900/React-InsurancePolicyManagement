import { Container, Typography, Box, Button, Card, CardContent, Dialog, DialogContent, IconButton, Snackbar, Alert } from '@mui/material';
import { Grid } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { Security, Speed, Support, Close } from '@mui/icons-material';
import { useState } from 'react';
import { useSelector } from 'react-redux';
import type { RootState } from '../../store';
import Life3Image from '../../assets/Life3.jpeg';
import LoginForm from '../../components/forms/LoginForm';
import RegisterForm from '../../components/forms/RegisterForm';
import OtpModal from '../../components/modals/OtpModal';
import Footer from '../../components/common/Footer';
import { authApi } from '../../api/auth.api';

export default function HomePage() {
  const navigate = useNavigate();
  const [loginOpen, setLoginOpen] = useState(false);
  const [registerOpen, setRegisterOpen] = useState(false);
  const [otpOpen, setOtpOpen] = useState(false);
  const [otpEmail, setOtpEmail] = useState('');
  const [otpType, setOtpType] = useState<'verification' | 'password-reset'>('password-reset');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' as 'success' | 'error' | 'info' });

  const handleLoginSuccess = (role?: string) => {
    setLoginOpen(false);
    switch (role) {
      case 'Customer':
        navigate('/products');
        break;
      case 'Underwriter':
      case 'Admin':
        navigate('/dashboard');
        break;
      default:
        navigate('/products'); 
    }
  };

  const handleRegisterSuccess = (email: string) => {
    setRegisterOpen(false);
    setOtpEmail(email);
    setOtpType('verification');
    setOtpOpen(true); 
  };

  const handleForgotPassword = async (email: string) => {
    if (!email) {
      setSnackbar({ open: true, message: 'Please enter your email first', severity: 'error' });
      return;
    }
    try {
      await authApi.sendOtp(email);
      setOtpEmail(email);
      setOtpType('password-reset');
      setLoginOpen(false);
      setOtpOpen(true);
    } catch (error: any) {
      setSnackbar({ 
        open: true, 
        message: error.response?.data?.message || 'Failed to send OTP', 
        severity: 'error' 
      });
    }
  };

  const handleOtpVerified = () => {
    setOtpOpen(false);
    setLoginOpen(true);
    setSnackbar({ 
      open: true, 
      message: 'Email verified successfully! You can now sign in.', 
      severity: 'success' 
    });
  };

  const features = [
    {
      icon: <Security />,
      title: 'Secure & Trusted',
      description: 'Your data is protected with bank-level security and encryption'
    },
    {
      icon: <Speed />,
      title: 'Quick Processing',
      description: 'Fast claim processing and policy issuance within 24 hours'
    },
    {
      icon: <Support />,
      title: '24/7 Support',
      description: 'Round-the-clock customer support and assistance'
    }
  ];

  return (
    <Box 
      sx={{
        backgroundImage: `url(${Life3Image})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        backgroundAttachment: 'fixed',
        minHeight: '100vh',
        position: 'relative',
        '&::before': {
          content: '""',
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          zIndex: 1
        }
      }}
    >
      {/* Custom Header */}
      <Box 
        sx={{
          position: 'relative',
          zIndex: 3,
          py: 2
        }}
      >
        <Container maxWidth="xl">
          <Box 
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}
          >
            <Typography 
              variant="h4" 
              sx={{
                color: '#FFD700',
                fontWeight: 800,
                fontFamily: '"Inter", "Helvetica Neue", "Arial", sans-serif',
                textShadow: '2px 2px 4px rgba(0,0,0,0.8)',
                cursor: 'pointer'
              }}
              onClick={() => navigate('/')}
            >
              PolicyGuard
            </Typography>
            
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button 
                variant="outlined" 
                onClick={() => setLoginOpen(true)}
                sx={{
                  borderColor: 'white',
                  color: 'white',
                  px: 3,
                  py: 1,
                  fontWeight: 600,
                  textTransform: 'none',
                  '&:hover': {
                    backgroundColor: 'white',
                    color: '#000'
                  }
                }}
              >
                Sign In
              </Button>
              <Button 
                variant="contained" 
                onClick={() => setRegisterOpen(true)}
                sx={{
                  backgroundColor: '#FFD700',
                  color: '#000',
                  px: 3,
                  py: 1,
                  fontWeight: 600,
                  textTransform: 'none',
                  '&:hover': {
                    backgroundColor: '#FFC107'
                  }
                }}
              >
                Sign Up
              </Button>
            </Box>
          </Box>
        </Container>
      </Box>
      {/* Hero Section */}
      <Box 
        sx={{
          position: 'relative',
          py: { xs: 4, md: 6 },
          minHeight: '75vh',
          zIndex: 2
        }}
      >
        <Container maxWidth="xl">
          <Grid container justifyContent="center" alignItems="center" sx={{ minHeight: '70vh' }}>
            <Grid size={{ xs: 12, md: 10, lg: 12 }}>
              <Box 
                sx={{
                  py: { xs: 4, md: 8 },
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  textAlign: 'center',
                  maxWidth: '1000px',
                  mx: 'auto'
                }}
              >
                <Typography 
                  variant="h1" 
                  component="h1" 
                  sx={{ 
                    fontSize: { xs: '2.2rem', md: '3.5rem', lg: '4rem' },
                    fontWeight: 800,
                    color: 'white',
                    mb: 3,
                    fontFamily: '"Inter", "Helvetica Neue", "Arial", sans-serif',
                    lineHeight: 1.2,
                    textShadow: '3px 3px 6px rgba(0,0,0,0.8)',
                    letterSpacing: '-0.01em',
                    maxWidth: '900px',
                    mx: 'auto'
                  }}
                >
                  Build a Safer Tomorrow with{' '}
                  <Box component="span" sx={{ color: '#FFD700' }}>Smart Insurance Plans</Box>
                </Typography>
                
                <Typography 
                  variant="h4" 
                  sx={{ 
                    color: 'white',
                    mb: 4,
                    fontWeight: 500,
                    lineHeight: 1.5,
                    fontSize: { xs: '1.05rem', md: '1.55rem', lg: '1.75rem' },
                    fontFamily: '"Open Sans", "Segoe UI", "Roboto", sans-serif',
                    textShadow: '2px 2px 4px rgba(0,0,0,0.8)',
                    maxWidth: '700px',
                    mx: 'auto'
                  }}
                >
                  Protect what matters most with our comprehensive{' '}
                  <Box component="span" sx={{ fontWeight: 700, color: '#FFD700' }}>Life Insurance</Box>
                  {' '}and{' '}
                  <Box component="span" sx={{ fontWeight: 700, color: '#FFD700' }}>Motor Insurance</Box>
                  {' '}policies designed for modern families.
                </Typography>
                
                <Box sx={{ mb: 5 }}>
                  <Typography 
                    variant="h6" 
                    sx={{ 
                      color: 'white',
                      fontSize: { xs: '0.95rem', md: '1.15rem' },
                      fontFamily: '"Open Sans", "Segoe UI", "Roboto", sans-serif',
                      textShadow: '2px 2px 4px rgba(0,0,0,0.8)',
                      fontWeight: 500,
                      lineHeight: 1.8,
                      maxWidth: '600px',
                      mx: 'auto'
                    }}
                  >
                    ✓ Instant digital claims processing within 24 hours<br/>
                    ✓ 24/7 dedicated customer support & assistance<br/>
                    ✓ Competitive premium rates with flexible payment options<br/>
                    ✓ Comprehensive coverage for individuals and families<br/>
                    ✓ Easy online policy management and renewals
                  </Typography>
                </Box>
                
                <Box display="flex" gap={4} flexWrap="wrap" justifyContent="center">
                  <Button 
                    variant="contained" 
                    size="large" 
                    onClick={() => navigate('/products')}
                    sx={{
                      backgroundColor: '#FFD700',
                      color: '#000',
                      px: 6,
                      py: 2,
                      fontSize: { xs: '0.85rem', md: '1.05rem' },
                      fontWeight: 700,
                      borderRadius: 3,
                      textTransform: 'none',
                      boxShadow: '0 4px 15px rgba(255, 215, 0, 0.4)',
                      '&:hover': {
                        backgroundColor: '#FFC107',
                        transform: 'translateY(-2px)',
                        boxShadow: '0 6px 20px rgba(255, 215, 0, 0.6)'
                      }
                    }}
                  >
                    Get Your Quote Now
                  </Button>
                  <Button 
                    variant="outlined" 
                    size="large" 
                    onClick={() => setLoginOpen(true)}
                    sx={{
                      borderColor: 'white',
                      color: 'white',
                      borderWidth: 2,
                      px: 6,
                      py: 2,
                      fontSize: { xs: '0.85rem', md: '1.05rem' },
                      fontWeight: 600,
                      borderRadius: 3,
                      textTransform: 'none',
                      '&:hover': {
                        backgroundColor: 'white',
                        color: '#000',
                        transform: 'translateY(-2px)'
                      }
                    }}
                  >
                    Sign In
                  </Button>
                </Box>
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Features Section */}
      <Box 
        sx={{
          position: 'relative',
          zIndex: 2
        }}
      >
        <Container maxWidth="lg">
          <Box py={10}>
          <Typography 
            variant="h3" 
            textAlign="center" 
            mb={8} 
            fontWeight="600"
            sx={{ 
              color: 'white',
              fontFamily: '"Inter", "Helvetica Neue", "Arial", sans-serif',
              textShadow: '3px 3px 6px rgba(0,0,0,0.8)'
            }}
          >
            Why Choose Us?
          </Typography>
          <Grid container spacing={6}>
            {features.map((feature, index) => {
              const colors = ['#28A745', '#007BFF', '#6F42C1'];
              return (
                <Grid size={{ xs: 12, md: 4 }} key={index}>
                  <Card 
                    sx={{ 
                      height: '100%', 
                      textAlign: 'center', 
                      p: 4,
                      backgroundColor: 'rgba(255, 255, 255, 0.1)',
                      borderRadius: 3,
                      border: `2px solid rgba(255, 255, 255, 0.2)`,
                      backdropFilter: 'blur(10px)',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        backgroundColor: 'rgba(255, 255, 255, 0.15)',
                        boxShadow: '0 10px 25px rgba(0,0,0,0.3)'
                      }
                    }}
                  >
                    <CardContent>
                      <Box 
                        mb={3}
                        sx={{
                          '& svg': {
                            fontSize: 48,
                            color: colors[index]
                          }
                        }}
                      >
                        {feature.icon}
                      </Box>
                      <Typography 
                        variant="h5" 
                        gutterBottom
                        sx={{ 
                          color: '#FFD700', 
                          fontWeight: 600,
                          mb: 2,
                          fontFamily: '"Inter", "Helvetica Neue", "Arial", sans-serif',
                          textShadow: '2px 2px 4px rgba(0,0,0,0.8)'
                        }}
                      >
                        {feature.title}
                      </Typography>
                      <Typography 
                        variant="body1" 
                        sx={{ 
                          color: 'white',
                          lineHeight: 1.6,
                          fontFamily: '"Open Sans", "Segoe UI", "Roboto", sans-serif',
                          textShadow: '1px 1px 2px rgba(0,0,0,0.8)'
                        }}
                      >
                        {feature.description}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              );
            })}
          </Grid>
        </Box>

        {/* PolicyGuard About Section */}
        <Box 
          textAlign="center" 
          py={12} 
          sx={{
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
            borderRadius: 3,
            my: 8,
            border: '2px solid rgba(255, 215, 0, 0.3)',
            backdropFilter: 'blur(10px)'
          }}
        >
          <Typography 
            variant="h2" 
            gutterBottom
            sx={{ 
              fontWeight: '800',
              color: '#FFD700',
              mb: 2,
              fontFamily: '"Inter", "Helvetica Neue", "Arial", sans-serif',
              textShadow: '3px 3px 6px rgba(0,0,0,0.8)',
              fontSize: { xs: '2rem', md: '3rem' }
            }}
          >
            PolicyGuard
          </Typography>
          
          <Typography 
            variant="h4" 
            gutterBottom
            sx={{ 
              fontWeight: '600',
              color: 'white',
              mb: 4,
              fontFamily: '"Inter", "Helvetica Neue", "Arial", sans-serif',
              textShadow: '2px 2px 4px rgba(0,0,0,0.8)'
            }}
          >
            Where Protection Begins
          </Typography>
          
          <Typography 
            variant="h6" 
            sx={{ 
              color: 'white',
              maxWidth: '800px',
              mx: 'auto',
              lineHeight: 1.6,
              fontFamily: '"Open Sans", "Segoe UI", "Roboto", sans-serif',
              textShadow: '1px 1px 2px rgba(0,0,0,0.8)',
              mb: 5
            }}
          >
            PolicyGuard is India's leading digital insurance platform, transforming how millions protect their future with innovative, accessible, and reliable insurance solutions.
          </Typography>
          
          {/* Statistics */}
          <Grid container spacing={4} sx={{ mb: 6 }}>
            <Grid size={{ xs: 6, md: 3 }}>
              <Box textAlign="center">
                <Typography 
                  variant="h3" 
                  sx={{ 
                    color: '#FFD700',
                    fontWeight: 800,
                    fontFamily: '"Inter", "Helvetica Neue", "Arial", sans-serif',
                    textShadow: '2px 2px 4px rgba(0,0,0,0.8)'
                  }}
                >
                  2.5M+
                </Typography>
                <Typography 
                  variant="body1" 
                  sx={{ 
                    color: 'white',
                    fontWeight: 500,
                    textShadow: '1px 1px 2px rgba(0,0,0,0.8)'
                  }}
                >
                  Registered Consumers
                </Typography>
              </Box>
            </Grid>
            <Grid size={{ xs: 6, md: 3 }}>
              <Box textAlign="center">
                <Typography 
                  variant="h3" 
                  sx={{ 
                    color: '#FFD700',
                    fontWeight: 800,
                    fontFamily: '"Inter", "Helvetica Neue", "Arial", sans-serif',
                    textShadow: '2px 2px 4px rgba(0,0,0,0.8)'
                  }}
                >
                  150+
                </Typography>
                <Typography 
                  variant="body1" 
                  sx={{ 
                    color: 'white',
                    fontWeight: 500,
                    textShadow: '1px 1px 2px rgba(0,0,0,0.8)'
                  }}
                >
                  Insurance Partners
                </Typography>
              </Box>
            </Grid>
            <Grid size={{ xs: 6, md: 3 }}>
              <Box textAlign="center">
                <Typography 
                  variant="h3" 
                  sx={{ 
                    color: '#FFD700',
                    fontWeight: 800,
                    fontFamily: '"Inter", "Helvetica Neue", "Arial", sans-serif',
                    textShadow: '2px 2px 4px rgba(0,0,0,0.8)'
                  }}
                >
                  1.8M+
                </Typography>
                <Typography 
                  variant="body1" 
                  sx={{ 
                    color: 'white',
                    fontWeight: 500,
                    textShadow: '1px 1px 2px rgba(0,0,0,0.8)'
                  }}
                >
                  Policies Sold
                </Typography>
              </Box>
            </Grid>
            <Grid size={{ xs: 6, md: 3 }}>
              <Box textAlign="center">
                <Typography 
                  variant="h3" 
                  sx={{ 
                    color: '#FFD700',
                    fontWeight: 800,
                    fontFamily: '"Inter", "Helvetica Neue", "Arial", sans-serif',
                    textShadow: '2px 2px 4px rgba(0,0,0,0.8)'
                  }}
                >
                  ₹500Cr+
                </Typography>
                <Typography 
                  variant="body1" 
                  sx={{ 
                    color: 'white',
                    fontWeight: 500,
                    textShadow: '1px 1px 2px rgba(0,0,0,0.8)'
                  }}
                >
                  Claims Settled
                </Typography>
              </Box>
            </Grid>
          </Grid>
          
          <Button 
            variant="contained" 
            size="large" 
            onClick={() => setRegisterOpen(true)}
            sx={{
              backgroundColor: '#FFD700',
              color: '#000',
              px: 8,
              py: 3,
              fontSize: '1.3rem',
              fontWeight: '700',
              borderRadius: 3,
              textTransform: 'none',
              boxShadow: '0 8px 25px rgba(255, 215, 0, 0.4)',
              '&:hover': {
                backgroundColor: '#FFC107',
                transform: 'translateY(-2px)',
                boxShadow: '0 12px 35px rgba(255, 215, 0, 0.6)'
              }
            }}
          >
            Join PolicyGuard Today
          </Button>
        </Box>
        </Container>
      </Box>

      {/* Login Modal */}
      <Dialog 
        open={loginOpen} 
        onClose={() => setLoginOpen(false)}
        maxWidth="sm"
        fullWidth
        disableRestoreFocus
        disableEnforceFocus
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
            <Typography 
              variant="h4" 
              sx={{
                color: '#1a1a1a',
                fontWeight: 700,
                fontFamily: '"Inter", "Helvetica Neue", "Arial", sans-serif'
              }}
            >
              Sign In
            </Typography>
            <IconButton 
              onClick={() => setLoginOpen(false)}
              sx={{ color: '#1a1a1a' }}
            >
              <Close />
            </IconButton>
          </Box>
          
          <LoginForm onLoginSuccess={handleLoginSuccess} onForgotPassword={handleForgotPassword} />
          
          <Box textAlign="center" mt={3}>
            <Button
              variant="text"
              onClick={() => {
                setLoginOpen(false);
                setRegisterOpen(true);
              }}
              sx={{
                color: '#1a930fff',
                fontWeight: 600,
                textTransform: 'none',
                '&:hover': {
                  backgroundColor: 'rgba(26, 147, 15, 0.1)'
                }
              }}
            >
              Don't have an account? Sign Up
            </Button>
          </Box>
        </DialogContent>
      </Dialog>

      {/* Register Modal */}
      <Dialog 
        open={registerOpen} 
        onClose={() => setRegisterOpen(false)}
        maxWidth="sm"
        fullWidth
        disableRestoreFocus
        disableEnforceFocus
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
            <Typography 
              variant="h4" 
              sx={{
                color: '#1a1a1a',
                fontWeight: 700,
                fontFamily: '"Inter", "Helvetica Neue", "Arial", sans-serif'
              }}
            >
              Sign Up
            </Typography>
            <IconButton 
              onClick={() => setRegisterOpen(false)}
              sx={{ color: '#1a1a1a' }}
            >
              <Close />
            </IconButton>
          </Box>
          
          <RegisterForm onRegisterSuccess={handleRegisterSuccess} />
          
          <Box textAlign="center" mt={3}>
            <Button
              variant="text"
              onClick={() => {
                setRegisterOpen(false);
                setLoginOpen(true);
              }}
              sx={{
                color: '#1a930fff',
                fontWeight: 600,
                textTransform: 'none',
                '&:hover': {
                  backgroundColor: 'rgba(26, 147, 15, 0.1)'
                }
              }}
            >
              Already have an account? Sign In
            </Button>
          </Box>
        </DialogContent>
      </Dialog>

      {/* OTP Modal */}
      <OtpModal
        open={otpOpen}
        onClose={() => setOtpOpen(false)}
        email={otpEmail}
        onVerified={handleOtpVerified}
        type={otpType}
      />
      
      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={() => setSnackbar({ ...snackbar, open: false })} 
          severity={snackbar.severity} 
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
      
      {/* Footer */}
      <Footer />
    </Box>
  );
}

