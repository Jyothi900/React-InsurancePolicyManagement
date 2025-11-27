import { Container, Typography, Box, TextField, Button, Card, CardContent } from '@mui/material';
import { Grid } from '@mui/material';
import { useState } from 'react';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Contact form submitted:', formData);
  };

  return (
    <Container maxWidth="lg">
      <Box py={8}>
        <Typography variant="h3" align="center" gutterBottom>
          Contact Us
        </Typography>
        
        <Grid container spacing={4}>
          <Grid size={{ xs: 12, md: 6 }}>
            <Card>
              <CardContent>
                <Typography variant="h5" gutterBottom>Get in Touch</Typography>
                <Box component="form" onSubmit={handleSubmit}>
                  <TextField
                    fullWidth
                    label="Name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    margin="normal"
                    required
                  />
                  <TextField
                    fullWidth
                    label="Email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    margin="normal"
                    required
                  />
                  <TextField
                    fullWidth
                    label="Subject"
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    margin="normal"
                    required
                  />
                  <TextField
                    fullWidth
                    label="Message"
                    multiline
                    rows={4}
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    margin="normal"
                    required
                  />
                  <Button type="submit" variant="contained" sx={{ mt: 2 }}>
                    Send Message
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid size={{ xs: 12, md: 6 }}>
            <Card>
              <CardContent>
                <Typography variant="h5" gutterBottom>Contact Information</Typography>
                {/* TODO: Consider fetching company contact info from API/config */}
                <Typography variant="body1" paragraph>
                  <strong>Phone:</strong> 1-800-SECURE-1
                </Typography>
                <Typography variant="body1" paragraph>
                  <strong>Email:</strong> support@securelife.com
                </Typography>
                <Typography variant="body1" paragraph>
                  <strong>Address:</strong><br />
                  123 Insurance Plaza<br />
                  New York, NY 10001
                </Typography>
                <Typography variant="body1">
                  <strong>Business Hours:</strong><br />
                  Monday - Friday: 8:00 AM - 6:00 PM<br />
                  Saturday: 9:00 AM - 4:00 PM
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>
    </Container>
  );
}


