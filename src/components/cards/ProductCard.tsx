import { Card, Typography, Button, Chip, Box, CardMedia } from '@mui/material';
import { useSelector } from 'react-redux';
import type { RootState } from '../../store';
import { type PolicyProduct } from '../../types/Product';
import Life2 from '../../assets/Life2.avif';
import Life3 from '../../assets/Life3.jpeg';
import Life4 from '../../assets/Life4.jpg';
import Life6 from '../../assets/Life6.jpg';
import Life7 from '../../assets/Life7.jpg';

const lifeImages = [Life2, Life3, Life4, Life6, Life6, Life7];

interface ProductCardProps {
  product: PolicyProduct;
  onGetQuote: (product: PolicyProduct) => void;
  onBuyPolicy: (product: PolicyProduct) => void;
  index?: number;
}

export default function ProductCard({ product, onGetQuote, onBuyPolicy, index = 0 }: ProductCardProps) {
  const { insuranceTypes } = useSelector((state: RootState) => state.enum);

  const getRiskColor = (riskLevel: number) => {
    switch (riskLevel) {
      case 0: return 'success';
      case 1: return 'warning';
      case 2: return 'error';
      default: return 'default';
    }
  };

  const getRiskLabel = (riskLevel: number) => {
    switch (riskLevel) {
      case 0: return 'Low Risk';
      case 1: return 'Medium Risk';
      case 2: return 'High Risk';
      default: return 'Unknown';
    }
  };

  const getEnumName = (items: any[], value: number) => {
    if (!items || items.length === 0) return 'Loading...';
    const found = items.find(i => i.value === value);
    return found?.name || `Value: ${value}`;
  };

  const getProductImage = (productId: string, cardIndex: number) => {
    const imageIndex = cardIndex % lifeImages.length;
    console.log(`Product ${productId} using image index ${imageIndex}`);
    return lifeImages[imageIndex];
  };

  const cardRef = (el: HTMLDivElement | null) => {
    if (el) {
      console.log(`Card ${product.productName} dimensions: ${el.offsetWidth}x${el.offsetHeight}`);
    }
  };

  return (
    <Card 
      ref={cardRef}
      sx={{ 
        display: 'flex', 
        flexDirection: 'row',
        border: '1px solid #e0e0e0',
        borderRadius: 2,
        width: 716,
        height: 312,
        '&:hover': {
          boxShadow: 3,
          transform: 'translateY(-2px)',
          transition: 'all 0.2s ease-in-out'
        }
      }}
    >
      <CardMedia
        component="img"
        sx={{ 
          width: 'auto',
          height: 'auto',
          maxWidth: 400,
          display: 'block'
        }}
        image={getProductImage(product.productId, index)}
        alt={product.productName}
        onError={() => {
          console.log('Image failed to load for product:', product.productId);
        }}
      />
      
      
      <Box sx={{ display: 'flex', flexDirection: 'column', flex: 1, p: 2 }}> 
        <Box sx={{ mb: 2 }}>
          <Typography variant="h5" fontWeight="700" color="#000000" gutterBottom>
            {product.productName}
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
            <Typography variant="body1" color="#37474F" fontWeight="500">
              {getEnumName(insuranceTypes, product.insuranceType)}
            </Typography>
            <Chip 
              label={getRiskLabel(product.riskLevel)} 
              color={getRiskColor(product.riskLevel)} 
              size="small"
              sx={{ fontWeight: 600 }}
            />
          </Box>
        </Box>

        <Box sx={{ mb: 2, '& > *': { mb: 1 } }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="body1" color="#424242" fontWeight="500">
              Age Range:
            </Typography>
            <Typography variant="body1" color="#1565C0" fontWeight="600">
              {product.minAge} - {product.maxAge} years
            </Typography>
          </Box>
          
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="body1" color="#424242" fontWeight="500">
              Coverage:
            </Typography>
            <Typography variant="body1" color="#2E7D32" fontWeight="600">
              ₹{(product.minSumAssured / 100000).toFixed(0)}L - ₹{(product.maxSumAssured / 100000).toFixed(0)}L
            </Typography>
          </Box>
          
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="body1" color="#424242" fontWeight="500">
              Premium Rate:
            </Typography>
            <Typography variant="h6" color="#F57C00" fontWeight="700">
              {product.premiumRate}%
            </Typography>
          </Box>
        </Box>

        <Box sx={{ display: 'flex', gap: 1.5, mt: 'auto' }}>
          <Button 
            variant="outlined"
            onClick={() => onBuyPolicy(product)}
            sx={{ 
              flex: 1, 
              py: 1,
              borderColor: '#2E7D32',
              color: '#2E7D32',
              fontWeight: 600,
              '&:hover': {
                borderColor: '#1B5E20',
                color: '#1B5E20',
                bgcolor: '#E8F5E8'
              }
            }}
          >
            Buy Policy
          </Button>
          <Button 
            variant="contained"
            onClick={() => onGetQuote(product)}
            sx={{ 
              flex: 1,
              py: 1,
              bgcolor: '#2E7D32',
              fontWeight: 600,
              '&:hover': {
                bgcolor: '#1B5E20'
              }
            }}
          >
            Get Quote
          </Button>
        </Box>
      </Box>
    </Card>
  );
}
