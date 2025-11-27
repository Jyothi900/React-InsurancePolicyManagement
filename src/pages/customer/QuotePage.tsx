import { useState, useEffect } from 'react';
import { Container, Typography, Box, Paper, Button, CircularProgress, Chip } from '@mui/material';
import { Calculate } from '@mui/icons-material';
import QuoteForm from '../../components/forms/QuoteForm';
import { useSelector, useDispatch } from 'react-redux';
import type { RootState, AppDispatch } from '../../store';
import { fetchAllProducts } from '../../slices/productSlice';
import type { PolicyProduct } from '../../types/Product';

export default function QuotePage() {
  const dispatch = useDispatch<AppDispatch>();
  const [quoteFormOpen, setQuoteFormOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<PolicyProduct | null>(null);
  const { products, loading } = useSelector((state: RootState) => state.product);

  useEffect(() => {
    if (products.length === 0) {
      dispatch(fetchAllProducts());
    }
  }, [dispatch, products.length]);

  const handleGetQuote = (product: PolicyProduct) => {
    setSelectedProduct(product);
    setQuoteFormOpen(true);
  };

  return (
    <Box sx={{ bgcolor: '#f8f9fa', minHeight: '100vh', py: 4 }}>
      <Container maxWidth="lg">
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Calculate sx={{ fontSize: 48, color: '#FFD700', mb: 2 }} />
          <Typography 
            variant="h4" 
            sx={{ 
              color: '#1B365D', 
              fontWeight: 700, 
              mb: 2 
            }}
          >
            Calculate Your Premium
          </Typography>
          <Typography 
            variant="h6" 
            sx={{ 
              color: '#666', 
              fontWeight: 400,
              maxWidth: '600px',
              mx: 'auto'
            }}
          >
            Get instant quotes for our insurance products and find the perfect coverage for your needs
          </Typography>
        </Box>
        
        <Paper 
          elevation={0} 
          sx={{ 
            p: 4, 
            borderRadius: '16px',
            boxShadow: '0 8px 32px rgba(27, 54, 93, 0.1)',
            border: '1px solid rgba(255, 215, 0, 0.2)'
          }}
        >
          <Typography 
            variant="h6" 
            sx={{ 
              color: '#1B365D', 
              fontWeight: 600, 
              mb: 3,
              textAlign: 'center'
            }}
          >
            Select a Product to Get Your Quote
          </Typography>
          
          {loading ? (
            <Box display="flex" justifyContent="center" py={6}>
              <CircularProgress sx={{ color: '#FFD700' }} size={48} />
            </Box>
          ) : products.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 6 }}>
              <Typography variant="h6" color="#666" gutterBottom>
                No products available
              </Typography>
              <Typography variant="body2" color="#999">
                Please contact our support team for assistance
              </Typography>
            </Box>
          ) : (
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3 }}>
              {products.map((product) => (
                  <Paper 
                    key={product.productId} 
                    sx={{ 
                      p: 3, 
                      borderRadius: '12px',
                      border: '2px solid transparent',
                      transition: 'all 0.3s ease',
                      cursor: 'pointer',
                      '&:hover': {
                        borderColor: '#FFD700',
                        transform: 'translateY(-4px)',
                        boxShadow: '0 8px 24px rgba(27, 54, 93, 0.15)'
                      }
                    }}
                  >
                    <Box sx={{ mb: 2 }}>
                      <Chip
                        label={product.insuranceType === 0 ? 'Life Insurance' : product.insuranceType === 1 ? 'Motor Insurance' : 'Property Insurance'}
                        sx={{ 
                          bgcolor: '#1B365D', 
                          color: '#FFD700', 
                          fontWeight: 600, 
                          mb: 2,
                          fontSize: '0.75rem'
                        }}
                      />
                    </Box>
                    
                    <Typography 
                      variant="h6" 
                      sx={{ 
                        color: '#1B365D', 
                        fontWeight: 700, 
                        mb: 2 
                      }}
                    >
                      {product.productName}
                    </Typography>
                    
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        color: '#666', 
                        mb: 3,
                        lineHeight: 1.6
                      }}
                    >
                      {product.description || 'Comprehensive insurance coverage tailored to your needs'}
                    </Typography>
                    
                    <Box sx={{ mb: 3 }}>
                      <Typography variant="body2" sx={{ color: '#999', mb: 1 }}>
                        Coverage Range
                      </Typography>
                      <Typography 
                        variant="body1" 
                        sx={{ 
                          color: '#1B365D', 
                          fontWeight: 600 
                        }}
                      >
                        {(() => {
                          try {
                            const min = (product.minSumAssured / 100000).toFixed(0);
                            const max = (product.maxSumAssured / 100000).toFixed(0);
                            return `₹${min}L - ₹${max}L`;
                          } catch (error) {
                            return 'Coverage details available';
                          }
                        })()}
                      </Typography>
                    </Box>
                    
                    <Button 
                      variant="contained"
                      fullWidth
                      onClick={() => handleGetQuote(product)}
                      sx={{
                        bgcolor: '#FFD700',
                        color: '#1B365D',
                        fontWeight: 600,
                        py: 1.5,
                        borderRadius: '8px',
                        '&:hover': { 
                          bgcolor: '#E6C200',
                          transform: 'translateY(-2px)'
                        }
                      }}
                    >
                      Get Instant Quote
                    </Button>
                  </Paper>
              ))}
            </Box>
          )}
        </Paper>
        
        <QuoteForm 
          open={quoteFormOpen}
          onClose={() => setQuoteFormOpen(false)}
          product={selectedProduct}
        />
      </Container>
    </Box>
  );
}