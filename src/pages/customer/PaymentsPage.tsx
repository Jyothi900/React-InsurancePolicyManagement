import { useEffect, useState } from 'react';
import { Container, Typography, Box, Paper, Tabs, Tab, Alert, Button, FormControl, InputLabel, Select, MenuItem, Card, CardContent } from '@mui/material';
import { CheckCircle } from '@mui/icons-material';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useLocation } from 'react-router-dom';
import type { RootState, AppDispatch } from '../../store';
import { fetchDuePremiums, fetchPaymentHistory } from '../../slices/paymentSlice';
import { fetchMyProposals } from '../../slices/proposalSlice';
import { fetchMyPolicies } from '../../slices/policySlice';
import { fetchAllEnums } from '../../slices/enumSlice';
import { paymentApi } from '../../api/payment.api';
import PaymentTable from '../../components/tables/PaymentTable';
import PaymentModal from '../../components/modals/PaymentModal';

import LoadingSpinner from '../../components/common/LoadingSpinner';
import type { Proposal } from '../../types/Proposal';
import { toast } from 'react-toastify';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div role="tabpanel" hidden={value !== index} {...other}>
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

export default function PaymentsPage() {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { user } = useSelector((state: RootState) => state.auth);
  const { duePremiums, paymentHistory, loading } = useSelector((state: RootState) => state.payment);
  const { myProposals } = useSelector((state: RootState) => state.proposal);
  const { policies } = useSelector((state: RootState) => state.policy);
  const { paymentMethods } = useSelector((state: RootState) => state.enum);
  
  const [tabValue, setTabValue] = useState(0);
  const [selectedProposal, setSelectedProposal] = useState<Proposal | null>(null);
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [selectedPolicy, setSelectedPolicy] = useState('');
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('');
  
  const location = useLocation();
  // const statePolicy = location.state?.policy;
  const statePolicyId = location.state?.policyId;

  const userId = user?.id || '';

  useEffect(() => {
    if (paymentMethods.length === 0) {
      dispatch(fetchAllEnums());
    }
    
    if (userId) {
      dispatch(fetchDuePremiums(userId));
      dispatch(fetchPaymentHistory(userId));
      dispatch(fetchMyProposals(userId));
      dispatch(fetchMyPolicies(userId));
    }
    
    // If coming from My Policies page, set the policy and switch to Make Payment tab
    if (statePolicyId) {
      setSelectedPolicy(statePolicyId);
      setTabValue(2);
    }
  }, [dispatch, userId, paymentMethods.length, statePolicyId]);

  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handlePayNow = (proposal: Proposal) => {
    setSelectedProposal(proposal);
    setPaymentModalOpen(true);
  };

  const handlePayment = async (paymentMethod: string) => {
    if (!selectedProposal || !user?.id) return;

    setPaymentLoading(true);
    try {
      await paymentApi.payProposal(selectedProposal.proposalId, user.id, paymentMethod);
      toast.success('Payment successful! Your policy has been activated.');
      setPaymentModalOpen(false);
      // Refresh data
      dispatch(fetchDuePremiums(user.id));
      dispatch(fetchPaymentHistory(user.id));
      dispatch(fetchMyProposals(user.id));
    } catch (error) {
      toast.error('Payment failed. Please try again.');
      console.error('Payment error:', error);
    } finally {
      setPaymentLoading(false);
    }
  };

  const handleViewReceipt = async (payment: any) => {
    try {
      if (payment.transactionId) {
        const receipt = await paymentApi.getPaymentReceipt(payment.transactionId);
        const receiptContent = `
          <html>
            <head>
              <title>Payment Receipt</title>
              <style>
                body { font-family: Arial, sans-serif; margin: 20px; }
                .header { text-align: center; margin-bottom: 30px; }
                .content { margin: 20px 0; }
                .download-btn { background: #1B365D; color: white; padding: 10px 20px; border: none; cursor: pointer; margin: 10px; }
                @media print { .no-print { display: none; } }
              </style>
            </head>
            <body>
              <div class="header">
                <h2>Payment Receipt</h2>
              </div>
              <div class="content">
                <p><strong>Transaction ID:</strong> ${payment.transactionId}</p>
                <p><strong>Amount:</strong> ₹${payment.amount.toLocaleString()}</p>
                <p><strong>Date:</strong> ${new Date(payment.paymentDate).toLocaleDateString()}</p>
                <p><strong>Status:</strong> ${payment.status}</p>
                <p><strong>Method:</strong> ${payment.paymentMethod}</p>
              </div>
              <div class="no-print">
                <button class="download-btn" onclick="window.print()">Download PDF</button>
                <button class="download-btn" onclick="window.close()">Close</button>
              </div>
            </body>
          </html>
        `;
        
        const receiptWindow = window.open('', '_blank');
        if (receiptWindow) {
          receiptWindow.document.write(receiptContent);
          receiptWindow.document.close();
        }
      } else {
        toast.info('Receipt not available for this payment');
      }
    } catch (error) {
      toast.error('Failed to load receipt');
    }
  };

  const handleRetryPayment = (payment: any) => {
    toast.info('Redirecting to payment page...');
    setTabValue(2); // Switch to Make Payment tab
  };

  // Get issued proposals that need payment
  const issuedProposals = myProposals.filter(p => p.status === 22); // Status.Issued
  
  // Filter active policies and check if they need more payments
  const activePolicies = policies.filter(p => {
    if (p.status !== 0) return false; // Only active policies
    
    // Calculate if policy is fully paid
    const policyPayments = paymentHistory.filter(payment => 
      payment.policyId === p.policyId && 
      payment.paymentType === 'Premium' && 
      payment.status === 'Success'
    );
    
    let paymentsPerYear = 1;
    if (p.premiumFrequency === 0) paymentsPerYear = 12; // Monthly
    else if (p.premiumFrequency === 1) paymentsPerYear = 4; // Quarterly
    else if (p.premiumFrequency === 2) paymentsPerYear = 1; // Annual
    
    const totalExpectedPayments = p.termYears * paymentsPerYear;
    const paymentsMade = policyPayments.length;
    
    return paymentsMade < totalExpectedPayments; // Only show policies that need more payments
  });

  if (loading) {
    return <LoadingSpinner message="Loading payments..." />;
  }

  return (
    <Container maxWidth="lg">
      <Box py={4}>
        <Typography variant="h4" gutterBottom>
          Payments
        </Typography>
        <Typography variant="subtitle1" color="text.secondary" mb={4}>
          Manage your payments, view history, and pay pending amounts
        </Typography>

        <Paper sx={{ width: '100%' }}>
          <Tabs value={tabValue} onChange={handleTabChange} sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tab label={`Pending Payments (${issuedProposals.length + duePremiums.length})`} />
            <Tab label={`Payment History (${paymentHistory.length})`} />
            <Tab label="Make Payment" />
          </Tabs>

          <TabPanel value={tabValue} index={0}>
            {/* Pending Proposal Payments */}
            {issuedProposals.length > 0 && (
              <Box mb={4}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <CheckCircle color="success" />
                  <Typography variant="h6" color="success.main">
                    Approved Proposals - Payment Required
                  </Typography>
                </Box>
                <Typography variant="body2" color="text.secondary" mb={2}>
                  Complete payment to activate your insurance policies
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                  {issuedProposals.map((proposal) => (
                    <Paper key={proposal.proposalId} sx={{ p: 2, minWidth: 300 }}>
                      <Typography variant="subtitle1" fontWeight="bold">
                        {proposal.proposalId}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Premium: ₹{proposal.premiumAmount.toLocaleString()}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Coverage: ₹{proposal.sumAssured.toLocaleString()}
                      </Typography>
                      <Button 
                        variant="contained" 
                        color="primary" 
                        size="small" 
                        sx={{ mt: 1 }}
                        onClick={() => handlePayNow(proposal)}
                      >
                        Pay Now
                      </Button>
                    </Paper>
                  ))}
                </Box>
              </Box>
            )}

            {/* Due Premiums */}
            {duePremiums.length > 0 && (
              <Box mb={4}>
                <Typography variant="h6" gutterBottom color="error.main">
                  Premium Payments Due
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                  {duePremiums.map((premium: any) => (
                    <Paper key={premium.policyId} sx={{ p: 2, minWidth: 300 }}>
                      <Typography variant="subtitle1" fontWeight="bold">
                        {premium.policyNumber}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Amount: ₹{premium.amount.toLocaleString()}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Due Date: {new Date(premium.dueDate).toLocaleDateString()}
                      </Typography>
                      <Typography variant="body2" color={premium.daysOverdue > 0 ? "error.main" : "text.secondary"}>
                        {premium.daysOverdue > 0 ? `${premium.daysOverdue} days overdue` : 'Due soon'}
                      </Typography>
                      <Button 
                        variant="contained" 
                        color="error" 
                        size="small" 
                        sx={{ mt: 1 }}
                      >
                        Pay Premium
                      </Button>
                    </Paper>
                  ))}
                </Box>
              </Box>
            )}



            {issuedProposals.length === 0 && duePremiums.length === 0 && (
              <Alert severity="info">
                No pending payments found. All your payments are up to date!
              </Alert>
            )}
          </TabPanel>

          <TabPanel value={tabValue} index={1}>
            {paymentHistory.length > 0 ? (
              <PaymentTable 
                payments={paymentHistory} 
                onViewReceipt={handleViewReceipt}
                onRetryPayment={handleRetryPayment}
              />
            ) : (
              <Alert severity="info">
                No payment history found. <Button onClick={() => navigate('/products')}>Browse Products</Button> to get started.
              </Alert>
            )}
          </TabPanel>

          <TabPanel value={tabValue} index={2}>
            {activePolicies.length > 0 ? (
              <Box>
                <Typography variant="h6" gutterBottom>
                  Make Premium Payment
                </Typography>
                <Typography variant="body2" color="text.secondary" mb={3}>
                  Select a policy and choose your payment method
                </Typography>
                
                <Card>
                  <CardContent>
                    <Box sx={{ display: 'grid', gap: 3, maxWidth: 500 }}>
                      <FormControl fullWidth>
                        <InputLabel>Select Policy</InputLabel>
                        <Select
                          value={selectedPolicy}
                          label="Select Policy"
                          onChange={(e) => setSelectedPolicy(e.target.value)}
                        >
                          {activePolicies.map((policy) => (
                            <MenuItem key={policy.policyId} value={policy.policyId}>
                              {policy.policyNumber || policy.policyId} - Premium: ₹{(policy.premiumAmount || 0).toLocaleString()}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                      
                      <FormControl fullWidth>
                        <InputLabel>Payment Method</InputLabel>
                        <Select
                          value={selectedPaymentMethod}
                          label="Payment Method"
                          onChange={(e) => setSelectedPaymentMethod(e.target.value)}
                        >
                          <MenuItem value="CreditCard">Credit Card</MenuItem>
                          <MenuItem value="DebitCard">Debit Card</MenuItem>
                          <MenuItem value="NetBanking">Net Banking</MenuItem>
                          <MenuItem value="UPI">UPI</MenuItem>
                        </Select>
                      </FormControl>
                      
                      {selectedPolicy && (
                        <Box sx={{ p: 2, bgcolor: '#f5f5f5', borderRadius: 1 }}>
                          <Typography variant="subtitle2" gutterBottom>
                            Payment Summary:
                          </Typography>
                          {(() => {
                            const policy = activePolicies.find(p => p.policyId === selectedPolicy);
                            return policy ? (
                              <Box>
                                <Typography variant="body2">Policy: {policy.policyNumber || policy.policyId}</Typography>
                                <Typography variant="body2">Premium Amount: ₹{(policy.premiumAmount || 0).toLocaleString()}</Typography>
                                <Typography variant="body2">Coverage: ₹{(policy.sumAssured || 0).toLocaleString()}</Typography>
                              </Box>
                            ) : null;
                          })()}
                        </Box>
                      )}
                      
                      <Button 
                        variant="contained" 
                        size="large"
                        disabled={!selectedPolicy || !selectedPaymentMethod || paymentLoading}
                        onClick={async () => {
                          if (!selectedPolicy || !selectedPaymentMethod) return;
                          
                          // Double-check if policy is fully paid before payment
                          const selectedPolicyData = policies.find(p => p.policyId === selectedPolicy);
                          if (selectedPolicyData) {
                            const policyPayments = paymentHistory.filter(payment => 
                              payment.policyId === selectedPolicy && 
                              payment.paymentType === 'Premium' && 
                              payment.status === 'Success'
                            );
                            
                            let paymentsPerYear = 1;
                            if (selectedPolicyData.premiumFrequency === 0) paymentsPerYear = 12;
                            else if (selectedPolicyData.premiumFrequency === 1) paymentsPerYear = 4;
                            else if (selectedPolicyData.premiumFrequency === 2) paymentsPerYear = 1;
                            
                            const totalExpectedPayments = selectedPolicyData.termYears * paymentsPerYear;
                            const paymentsMade = policyPayments.length;
                            
                            if (paymentsMade >= totalExpectedPayments) {
                              toast.info('This policy is already fully paid!');
                              return;
                            }
                          }
                          
                          setPaymentLoading(true);
                          try {
                            await paymentApi.payPremium(selectedPolicy, userId, selectedPaymentMethod);
                            toast.success('Premium payment successful!');
                            dispatch(fetchPaymentHistory(userId));
                            dispatch(fetchDuePremiums(userId));
                            dispatch(fetchMyPolicies(userId)); // Refresh policies to update the list
                            setTabValue(1);
                            setSelectedPolicy('');
                            setSelectedPaymentMethod('');
                          } catch (error) {
                            console.error('Payment error:', error);
                            toast.error('Payment failed. Please try again.');
                          } finally {
                            setPaymentLoading(false);
                          }
                        }}
                        sx={{
                          bgcolor: '#1B365D',
                          '&:hover': { bgcolor: '#0F2A47' }
                        }}
                      >
                        {paymentLoading ? 'Processing Payment...' : 'Pay Premium'}
                      </Button>
                    </Box>
                  </CardContent>
                </Card>
              </Box>
            ) : (
              <Alert severity="info">
                No active policies found. <Button onClick={() => navigate('/products')}>Get Insurance</Button> to make payments.
              </Alert>
            )}
          </TabPanel>
        </Paper>

        <PaymentModal
          open={paymentModalOpen}
          onClose={() => setPaymentModalOpen(false)}
          proposal={selectedProposal}
          paymentMethods={paymentMethods}
          loading={paymentLoading}
          onPayment={handlePayment}
        />
      </Box>
    </Container>
  );
}