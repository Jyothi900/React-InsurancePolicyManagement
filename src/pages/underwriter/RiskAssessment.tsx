import { useState } from 'react';
import { Container, Typography, Box, Card, CardContent, TextField, Button, Slider, Chip } from '@mui/material';
import { Grid } from '@mui/material';

export default function RiskAssessment() {
  const [riskScore, setRiskScore] = useState(50);
  const [assessment, setAssessment] = useState({
    age: '',
    occupation: '',
    medicalHistory: '',
    lifestyle: '',
    financialStatus: ''
  });

  const getRiskLevel = (score: number) => {
    if (score < 30) return { level: 'Low', color: 'success' as const };
    if (score < 70) return { level: 'Medium', color: 'warning' as const };
    return { level: 'High', color: 'error' as const };
  };

  const risk = getRiskLevel(riskScore);

  return (
    <Container maxWidth="lg">
      <Box py={4}>
        <Typography variant="h4" gutterBottom>
          Risk Assessment Tool
        </Typography>
        
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, md: 8 }}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Assessment Factors
                </Typography>
                
                <Grid container spacing={2}>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      fullWidth
                      label="Age"
                      value={assessment.age}
                      onChange={(e) => setAssessment({...assessment, age: e.target.value})}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      fullWidth
                      label="Occupation"
                      value={assessment.occupation}
                      onChange={(e) => setAssessment({...assessment, occupation: e.target.value})}
                    />
                  </Grid>
                  <Grid size={{ xs: 12 }}>
                    <TextField
                      fullWidth
                      multiline
                      rows={3}
                      label="Medical History"
                      value={assessment.medicalHistory}
                      onChange={(e) => setAssessment({...assessment, medicalHistory: e.target.value})}
                    />
                  </Grid>
                  <Grid size={{ xs: 12 }}>
                    <TextField
                      fullWidth
                      multiline
                      rows={2}
                      label="Lifestyle Factors"
                      value={assessment.lifestyle}
                      onChange={(e) => setAssessment({...assessment, lifestyle: e.target.value})}
                    />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid size={{ xs: 12, md: 4 }}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Risk Score
                </Typography>
                
                <Box mb={3}>
                  <Typography variant="h2" color={risk.color} align="center">
                    {riskScore}
                  </Typography>
                  <Box display="flex" justifyContent="center" mb={2}>
                    <Chip label={risk.level} color={risk.color} />
                  </Box>
                </Box>
                
                <Typography variant="body2" gutterBottom>
                  Adjust Risk Score:
                </Typography>
                <Slider
                  value={riskScore}
                  onChange={(_, value) => setRiskScore(value as number)}
                  min={0}
                  max={100}
                  marks={[
                    { value: 0, label: '0' },
                    { value: 30, label: '30' },
                    { value: 70, label: '70' },
                    { value: 100, label: '100' }
                  ]}
                />
                
                <Button 
                  variant="contained" 
                  fullWidth 
                  sx={{ mt: 2 }}
                  onClick={() => {
                    try {
                      // TODO: Implement save assessment API call
                    } catch (error) {
                      // Handle error
                    }
                  }}
                >
                  Save Assessment
                </Button>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>
    </Container>
  );
}


