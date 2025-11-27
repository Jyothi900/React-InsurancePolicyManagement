import { useEffect, useState } from 'react';
import { Container, Typography, Box, Tabs, Tab, Dialog, DialogTitle, DialogContent, DialogActions, Button, Alert, Chip } from '@mui/material';
import { Shield, Star } from '@mui/icons-material';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import type { RootState, AppDispatch } from '../../store';
import { fetchAllProducts, fetchInsuranceTypes, setSelectedProduct } from '../../slices/productSlice';
import { fetchAllEnums } from '../../slices/enumSlice';
import QuoteForm from '../../components/forms/QuoteForm';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { type PolicyProduct } from '../../types/Product';
import { toast } from 'react-toastify';

import Life2 from '../../assets/Life2.avif';
import Life3 from '../../assets/Life3.jpeg';
import Life4 from '../../assets/Life4.jpg';
import Life5 from '../../assets/Life5.jpg';
import Life6 from '../../assets/Life6.jpg';
import Life7 from '../../assets/Life7.jpg';

export default function ProductsPage() {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { products, insuranceTypes, loading, error } = useSelector((state: RootState) => state.product);
  const { isAuthenticated, user } = useSelector((state: RootState) => state.auth);
  const { lastFetched: enumLastFetched } = useSelector((state: RootState) => state.enum);
  
  const [selectedTab, setSelectedTab] = useState(0);
  const [quoteFormOpen, setQuoteFormOpen] = useState(false);
  const [selectedProductForQuote, setSelectedProductForQuote] = useState<PolicyProduct | null>(null);
  const [loginPromptOpen, setLoginPromptOpen] = useState(false);
  const [productDetailsOpen, setProductDetailsOpen] = useState(false);
  const [selectedProductForDetails, setSelectedProductForDetails] = useState<PolicyProduct | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        
        await dispatch(fetchAllProducts());
        await dispatch(fetchInsuranceTypes());
        
        const now = Date.now();
        const fiveMinutes = 5 * 60 * 1000;
        if (!enumLastFetched || (now - enumLastFetched) > fiveMinutes) {
          await dispatch(fetchAllEnums());
        }
      } catch (error) {
        console.error('Error loading products data:', error);
      }
    };
    
    loadData();
  }, [dispatch, enumLastFetched]);



  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setSelectedTab(newValue);
  };

  const handleGetQuote = (product: PolicyProduct) => {
    setSelectedProductForQuote(product);
    dispatch(setSelectedProduct(product));
    setQuoteFormOpen(true);
  };

  const handleViewDetails = (product: PolicyProduct) => {
    setSelectedProductForDetails(product);
    setProductDetailsOpen(true);
  };

  const handleBuyPolicy = async (product: PolicyProduct) => {
    if (!isAuthenticated) {
      setLoginPromptOpen(true);
      return;
    }
    
    if (user?.role !== 'Customer') {
      toast.error('Only customers can purchase policies');
      return;
    }
    
    dispatch(setSelectedProduct(product));
    
    try {
      // Step 1: Check user's KYC status
      const { userApi } = await import('../../api/user.api');
      const userData = await userApi.getUserById(user.id);
      
      if (userData.kycStatus !== 1) {
        // KYC not verified - redirect to KYC page
        toast.info('Please complete KYC verification first');
        navigate('/kyc', { state: { selectedProduct: product } });
        return;
      }
      
      // Step 2: Check for existing proposals for this product
      const { proposalApi } = await import('../../api/proposal.api');
      const userProposals = await proposalApi.getProposalsByUserId(user.id);
      const existingProposal = userProposals.find(p => p.productId === product.productId);
      
      if (existingProposal) {
        // Existing proposal found - check status
        // Status enum: Pending=2, Approved=3, Rejected=4, Applied=20, UnderReview=21, Issued=22
        switch (Number(existingProposal.status)) {
          case 2: // Pending
          case 20: // Applied  
          case 21: // UnderReview
            toast.info('Your proposal is under review by underwriter');
            navigate('/my-proposals');
            break;
            
          case 3: // Approved - check documents
            const { documentApi } = await import('../../api/document.api');
            const userDocs = await documentApi.getMyDocuments(user.id);
            const proposalDocs = userDocs.filter(d => d.proposalId === existingProposal.proposalId);
            
            if (proposalDocs.length === 0) {
              // No documents uploaded yet
              toast.info('Proposal approved! Please upload required documents');
              navigate('/kyc', { 
                state: { 
                  selectedProduct: product,
                  proposalCreated: true,
                  proposalId: existingProposal.proposalId,
                  requiredDocuments: ['Medical Certificate', 'Income Certificate', 'Identity Proof']
                }
              });
            } else if (proposalDocs.some(d => Number(d.status) === 18 || Number(d.status) === 2)) {
              // Some documents pending verification (Uploaded=18, Pending=2)
              toast.info('Documents uploaded, awaiting verification');
              navigate('/kyc');
            } else if (proposalDocs.every(d => Number(d.status) === 19)) {
              // All documents verified (Verified=19)
              toast.success('All documents verified! Proposal ready for issuance');
              navigate('/kyc');
            } else {
              // Mixed status - show documents page
              navigate('/kyc');
            }
            break;
            
          case 22: // Issued - ready for payment
            toast.success('Proposal issued! Proceed to payment');
            navigate('/payment', { state: { proposalId: existingProposal.proposalId } });
            break;
            
          case 4: // Rejected
            toast.error('Previous proposal was rejected. You can create a new one.');
            // Navigate to appropriate proposal page based on insurance type
            const proposalRoute = product.insuranceType === 1 ? '/motor-proposals' : '/proposals';
            navigate(proposalRoute, { state: { selectedProduct: product } });
            break;
            
          default:
            navigate('/my-proposals');
        }
      } else {
        // No existing proposal - create new one
        // Navigate to appropriate proposal page based on insurance type
        const proposalRoute = product.insuranceType === 1 ? '/motor-proposals' : '/proposals';
        navigate(proposalRoute, { state: { selectedProduct: product } });
      }
      
    } catch (error) {
      console.error('Error checking user status:', error);
      toast.error('Error checking your status. Please try again.');
    }
  };

  const getInsuranceTypeValue = (typeName: string) => {
    switch (typeName) {
      case 'Life': return 0;
      case 'Motor': return 1;
      case 'Property': return 2;
      default: return -1;
    }
  };

  const filteredProducts = selectedTab === 0 
    ? products 
    : products.filter(p => p.insuranceType === getInsuranceTypeValue(insuranceTypes[selectedTab - 1]));

  if (loading) {
    return <LoadingSpinner message="Loading products..." />;
  }

  if (error) {
    return (
      <Container maxWidth="lg">
        <Box py={4} textAlign="center">
          <Typography variant="h6" color="error" gutterBottom>
            Error loading products
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {error}
          </Typography>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ px: { xs: 2, sm: 3 } }}>
      <Box py={1}>
        <Typography 
          variant="h5" 
          component="h1" 
          gutterBottom 
          textAlign="left"
          sx={{
            color: '#FFD700',
            fontWeight: 700
          }}
        >
          Insurance Products
        </Typography>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography 
            variant="body1" 
            sx={{
              color: '#000000',
              fontWeight: 400,
              fontSize: '0.95rem',
              width: '70%'
            }}
          >
            Protect what matters most with our tailored insurance solutions. From life and health coverage to motor and property protection, we offer competitive rates and comprehensive benefits designed for your peace of mind.
          </Typography>
          
          {/* Calculate Premium Button with Rotating Border */}
          <Box 
            sx={{
              position: 'relative',
              '&::before': {
                content: '""',
                position: 'absolute',
                top: '-2px',
                left: '-2px',
                right: '-2px',
                bottom: '-2px',
                borderRadius: '30px',
                background: 'conic-gradient(from 0deg, transparent 70%, #1B365D 75%, transparent 80%)',
                animation: 'rotateSnake 2s linear infinite',
                zIndex: -1
              },
              '@keyframes rotateSnake': {
                '0%': { transform: 'rotate(0deg)' },
                '100%': { transform: 'rotate(360deg)' }
              }
            }}
          >
            <Button
              variant="contained"
              size="large"
              onClick={() => navigate('/quote')}
              sx={{
                bgcolor: '#FFD700',
                color: '#1B365D',
                px: 4,
                py: 1.5,
                fontWeight: 600,
                fontSize: '16px',
                borderRadius: '25px',
                position: 'relative',
                zIndex: 1,
                '&:hover': { 
                  bgcolor: '#E6C200',
                  transform: 'scale(1.05)'
                },
                transition: 'all 0.3s ease'
              }}
            >
              Calculate Premium
            </Button>
          </Box>
        </Box>

        {/* Insurance Type Tabs */}
        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
          <Tabs value={selectedTab} onChange={handleTabChange} centered>
            <Tab label="All Products" />
            {insuranceTypes.map((type) => (
              <Tab key={type} label={type} />
            ))}
          </Tabs>
        </Box>

        {/* Products Section - Website Style */}
        <Box>
          {filteredProducts.length > 0 ? (
            filteredProducts.map((product, index) => {
              const isEven = index % 2 === 0;
              const getProductImage = () => {
                const images = [Life2, Life3, Life4, Life5, Life6, Life7];
                return images[index % images.length];
              };
              
              return (
                <Box
                  key={product.productId || index}
                  sx={{
                    display: 'flex',
                    flexDirection: { xs: 'column', md: isEven ? 'row' : 'row-reverse' },
                    alignItems: 'center',
                    minHeight: '400px',
                    mb: 0,
                    bgcolor: index % 2 === 0 ? '#ffffff' : '#f8f9fa'
                  }}
                >
                  {/* Image Section */}
                  <Box
                    sx={{
                      flex: '1',
                      p: { xs: 2, md: 3 },
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    <Box
                      sx={{
                        width: '100%',
                        maxWidth: '600px',
                        height: { xs: '250px', md: '320px' },
                        backgroundImage: `url(${getProductImage()})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        backgroundRepeat: 'no-repeat',
                        borderRadius: '16px',
                        boxShadow: '0 8px 32px rgba(27, 54, 93, 0.15)',
                        border: '1px solid rgba(255, 215, 0, 0.2)',
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          transform: 'translateY(-4px)',
                          boxShadow: '0 12px 40px rgba(27, 54, 93, 0.25)'
                        }
                      }}
                    />
                  </Box>

                  {/* Content Section */}
                  <Box
                    sx={{
                      flex: '1',
                      p: { xs: 3, md: 5 },
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'center'
                    }}
                  >
                    <Box sx={{ mb: 2 }}>
                      <Chip
                        label={product.insuranceType === 0 ? 'Life Insurance' : product.insuranceType === 1 ? 'Motor Insurance' : 'Property Insurance'}
                        sx={{ bgcolor: '#1B365D', color: '#FFD700', fontWeight: 600, mb: 2, border: '1px solid #FFD700' }}
                      />
                    </Box>

                    <Typography variant="h4" fontWeight={700} color="#1B365D" gutterBottom>
                      {product.productName}
                    </Typography>

                    <Typography variant="body1" color="#2C3E50" sx={{ mb: 3, lineHeight: 1.6 }}>
                      {product.description || `Secure your future with comprehensive coverage starting from age ${product.minAge}. Get coverage up to ₹${((product.maxSumAssured) / 100000).toFixed(0)} lakhs with competitive premium rates at ${product.premiumRate}%.`}
                    </Typography>

                    <Box sx={{ display: 'flex', gap: 3, mb: 4 }}>
                      <Box>
                        <Typography variant="body2" color="#6B7280" fontWeight={600}>
                          Age Range
                        </Typography>
                        <Typography variant="body1" color="#1B365D" fontWeight={700}>
                          {product.minAge} - {product.maxAge} years
                        </Typography>
                      </Box>
                      <Box>
                        <Typography variant="body2" color="#6B7280" fontWeight={600}>
                          Coverage
                        </Typography>
                        <Typography variant="body1" color="#1B365D" fontWeight={700}>
                          ₹{(product.minSumAssured / 100000).toFixed(0)}L - ₹{(product.maxSumAssured / 100000).toFixed(0)}L
                        </Typography>
                      </Box>
                      <Box>
                        <Typography variant="body2" color="#6B7280" fontWeight={600}>
                          Premium Rate
                        </Typography>
                        <Typography variant="body1" color="#1B365D" fontWeight={700}>
                          {product.premiumRate}%
                        </Typography>
                      </Box>
                    </Box>

                    <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                      <Button
                        variant="contained"
                        size="large"
                        onClick={() => handleBuyPolicy(product)}
                        sx={{
                          bgcolor: '#1B365D',
                          px: 3,
                          py: 1.5,
                          fontWeight: 600,
                          fontSize: '14px',
                          '&:hover': { bgcolor: '#0F2A47' }
                        }}
                      >
                        Get Started
                      </Button>
                      <Button
                        variant="outlined"
                        size="large"
                        onClick={() => handleViewDetails(product)}
                        sx={{
                          borderColor: '#1B365D',
                          color: '#1B365D',
                          px: 3,
                          py: 1.5,
                          fontWeight: 600,
                          fontSize: '14px',
                          '&:hover': { bgcolor: '#1B365D', color: 'white' }
                        }}
                      >
                        Learn More
                      </Button>
                      <Button
                        variant="contained"
                        size="large"
                        onClick={() => handleGetQuote(product)}
                        sx={{
                          bgcolor: '#FFD700',
                          color: '#1B365D',
                          px: 3,
                          py: 1.5,
                          fontWeight: 600,
                          fontSize: '14px',
                          '&:hover': { bgcolor: '#E6C200', color: '#1B365D' }
                        }}
                      >
                        Calculate Premium
                      </Button>
                    </Box>
                  </Box>
                </Box>
              );
            })
          ) : (
            <Box sx={{ textAlign: 'center', py: 8 }}>
              <Typography variant="h4" color="#000" gutterBottom>
                No Insurance Products Available
              </Typography>
              <Typography variant="h6" color="#666">
                Please check back later or contact our support team.
              </Typography>
            </Box>
          )}
        </Box>

        {!loading && filteredProducts.length === 0 && (
          <Box textAlign="center" py={4} sx={{ px: 2 }}>
            <Typography variant="h6" color="text.secondary" mb={2}>
              No products available
            </Typography>
            <Typography variant="body2" color="text.secondary" mb={2}>
              Please contact administrator to add products to the system.
            </Typography>
          </Box>
        )}
      </Box>

      <QuoteForm
        open={quoteFormOpen}
        onClose={() => {
          setQuoteFormOpen(false);
          setSelectedProductForQuote(null);
        }}
        product={selectedProductForQuote}
      />
      
      {/* Product Details Dialog */}
      <Dialog 
        open={productDetailsOpen} 
        onClose={() => setProductDetailsOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle sx={{ bgcolor: '#1B365D', color: 'white', display: 'flex', alignItems: 'center', gap: 1 }}>
          <Shield />
          {selectedProductForDetails?.productName} - Details
        </DialogTitle>
        <DialogContent sx={{ p: 3 }}>
          {selectedProductForDetails && (
            <Box>
              <Box sx={{ mb: 3 }}>
                <Chip
                  label={selectedProductForDetails.insuranceType === 0 ? 'Life Insurance' : selectedProductForDetails.insuranceType === 1 ? 'Motor Insurance' : 'Property Insurance'}
                  sx={{ bgcolor: '#FFD700', color: '#1B365D', fontWeight: 600, mb: 2 }}
                />
              </Box>
              
              <Typography variant="body1" sx={{ mb: 3, lineHeight: 1.6, color: '#2C3E50' }}>
                {selectedProductForDetails.description || 'Comprehensive insurance coverage designed to protect what matters most to you and your family.'}
              </Typography>

              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 3, mb: 3 }}>
                <Box sx={{ p: 2, bgcolor: '#f8f9fa', borderRadius: 2, border: '1px solid #e9ecef' }}>
                  <Typography variant="h6" color="#1B365D" fontWeight={600} gutterBottom>
                    Age Eligibility
                  </Typography>
                  <Typography variant="body1" color="#2C3E50">
                    {selectedProductForDetails.minAge} - {selectedProductForDetails.maxAge} years
                  </Typography>
                </Box>
                
                <Box sx={{ p: 2, bgcolor: '#f8f9fa', borderRadius: 2, border: '1px solid #e9ecef' }}>
                  <Typography variant="h6" color="#1B365D" fontWeight={600} gutterBottom>
                    Coverage Amount
                  </Typography>
                  <Typography variant="body1" color="#2C3E50">
                    ₹{(selectedProductForDetails.minSumAssured / 100000).toFixed(0)} - ₹{(selectedProductForDetails.maxSumAssured / 100000).toFixed(0)} Lakhs
                  </Typography>
                </Box>
                
                <Box sx={{ p: 2, bgcolor: '#f8f9fa', borderRadius: 2, border: '1px solid #e9ecef' }}>
                  <Typography variant="h6" color="#1B365D" fontWeight={600} gutterBottom>
                    Premium Rate
                  </Typography>
                  <Typography variant="body1" color="#2C3E50">
                    {selectedProductForDetails.premiumRate}% per annum
                  </Typography>
                </Box>
                
                <Box sx={{ p: 2, bgcolor: '#f8f9fa', borderRadius: 2, border: '1px solid #e9ecef' }}>
                  <Typography variant="h6" color="#1B365D" fontWeight={600} gutterBottom>
                    Product ID
                  </Typography>
                  <Typography variant="body1" color="#2C3E50">
                    {selectedProductForDetails.productId}
                  </Typography>
                </Box>
              </Box>

              <Box sx={{ p: 3, bgcolor: '#e8f4fd', borderRadius: 2, border: '1px solid #b3d9ff' }}>
                <Typography variant="h6" color="#1B365D" fontWeight={600} gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Star sx={{ color: '#FFD700' }} />
                  Key Benefits
                </Typography>
                <Box component="ul" sx={{ m: 0, pl: 2 }}>
                  <Typography component="li" variant="body2" sx={{ mb: 1, color: '#2C3E50' }}>
                    Comprehensive coverage with flexible sum assured options
                  </Typography>
                  <Typography component="li" variant="body2" sx={{ mb: 1, color: '#2C3E50' }}>
                    Competitive premium rates starting from {selectedProductForDetails.premiumRate}%
                  </Typography>
                  <Typography component="li" variant="body2" sx={{ mb: 1, color: '#2C3E50' }}>
                    Wide age eligibility from {selectedProductForDetails.minAge} to {selectedProductForDetails.maxAge} years
                  </Typography>
                  <Typography component="li" variant="body2" sx={{ color: '#2C3E50' }}>
                    Quick claim processing and 24/7 customer support
                  </Typography>
                </Box>
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 3, gap: 1 }}>
          <Button 
            onClick={() => setProductDetailsOpen(false)}
            sx={{ color: '#6B7280' }}
          >
            Close
          </Button>
          <Button 
            variant="outlined"
            onClick={() => {
              setProductDetailsOpen(false);
              if (selectedProductForDetails) {
                handleGetQuote(selectedProductForDetails);
              }
            }}
            sx={{ borderColor: '#FFD700', color: '#1B365D', '&:hover': { bgcolor: '#FFD700', color: '#1B365D' } }}
          >
            Get Quote
          </Button>
          <Button 
            variant="contained"
            onClick={() => {
              setProductDetailsOpen(false);
              if (selectedProductForDetails) {
                handleBuyPolicy(selectedProductForDetails);
              }
            }}
            sx={{ bgcolor: '#1B365D', '&:hover': { bgcolor: '#0F2A47' } }}
          >
            Get Started
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Login Prompt Dialog */}
      <Dialog open={loginPromptOpen} onClose={() => setLoginPromptOpen(false)}>
        <DialogTitle>Login Required</DialogTitle>
        <DialogContent>
          <Alert severity="info">
            Please login to purchase a policy. You'll need to complete KYC verification before proceeding.
          </Alert>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setLoginPromptOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={() => navigate('/login')}>Login</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}