import { Container, Typography, Box, Card, CardContent } from '@mui/material';
import { Grid } from '@mui/material';

export default function AboutPage() {
  return (
    <Container maxWidth="lg">
      <Box py={8}>
        <Typography variant="h3" align="center" gutterBottom>
          About SecureLife Insurance
        </Typography>
        <Typography variant="h6" align="center" color="text.secondary" mb={6}>
          Protecting what matters most since 1995
        </Typography>
        
        <Grid container spacing={4}>
          <Grid size={{ xs: 12, md: 4 }}>
            <Card>
              <CardContent>
                <Typography variant="h5" gutterBottom>Our Mission</Typography>
                <Typography>
                  To provide comprehensive insurance solutions that protect families and businesses.
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <Card>
              <CardContent>
                <Typography variant="h5" gutterBottom>Our Values</Typography>
                <Typography>
                  Trust, integrity, and customer-first approach in everything we do.
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <Card>
              <CardContent>
                <Typography variant="h5" gutterBottom>Our Promise</Typography>
                <Typography>
                  Fast claims processing and 24/7 customer support when you need us most.
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>
    </Container>
  );
}


