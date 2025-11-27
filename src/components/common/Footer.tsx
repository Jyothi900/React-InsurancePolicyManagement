import { Box, Container, Typography, Link } from '@mui/material';
import { Grid } from '@mui/material';

export default function Footer() {
  return (
    <Box component="footer" sx={{ bgcolor: 'primary.main', color: 'white', py: 4, mt: 'auto' }}>
      <Container maxWidth="lg">
        <Grid container spacing={4}>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Typography variant="h6" gutterBottom>
              SecureLife Insurance
            </Typography>
            <Typography variant="body2">
              Protecting what matters most since 1995
            </Typography>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Typography variant="h6" gutterBottom>
              Quick Links
            </Typography>
            <Link href="/products" color="inherit" display="block">Products</Link>
            <Link href="/about" color="inherit" display="block">About Us</Link>
            <Link href="/contact" color="inherit" display="block">Contact</Link>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Typography variant="h6" gutterBottom>
              Support
            </Typography>
            <Link href="/help" color="inherit" display="block">Help Center</Link>
            <Link href="/claims" color="inherit" display="block">File a Claim</Link>
            <Typography variant="body2">1-800-SECURE-1</Typography>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Typography variant="h6" gutterBottom>
              Legal
            </Typography>
            <Link href="/privacy" color="inherit" display="block">Privacy Policy</Link>
            <Link href="/terms" color="inherit" display="block">Terms of Service</Link>
          </Grid>
        </Grid>
        <Box textAlign="center" mt={4}>
          <Typography variant="body2">
            © 2024 SecureLife Insurance. All rights reserved.
          </Typography>
        </Box>
      </Container>
    </Box>
  );
}


