import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Button,
  Box,
  Typography
} from '@mui/material';
import { useSelector } from 'react-redux';
import { type Payment } from '../../types/Payment';
import type { RootState } from '../../store';


interface PaymentTableProps {
  payments: Payment[];
  onViewReceipt?: (payment: Payment) => void;
  onRetryPayment?: (payment: Payment) => void;
  showActions?: boolean;
}

export default function PaymentTable({ 
  payments, 
  onViewReceipt, 
  onRetryPayment, 
  showActions = true 
}: PaymentTableProps) {
  const { statuses } = useSelector((state: RootState) => state.enum);
  
  const getStatusColor = (status: string) => {
    // Get status enum values dynamically
    const successStatusNames = ['Success', 'Completed', 'Paid', 'Active', 'Verified', 'Approved'];
    const errorStatusNames = ['Failed', 'Rejected', 'Cancelled', 'Declined'];
    const warningStatusNames = ['Pending', 'Processing', 'UnderReview', 'Uploaded'];
    
    // Find matching status from enum
    const statusEnum = statuses.find(s => s.name === status);
    if (!statusEnum) return 'default';
    
    if (successStatusNames.includes(statusEnum.name)) return 'success';
    if (errorStatusNames.includes(statusEnum.name)) return 'error';
    if (warningStatusNames.includes(statusEnum.name)) return 'warning';
    return 'default';
  };

  const formatDate = (dateString: string) => {
    try {
      if (!dateString) return 'Invalid Date';
      const date = new Date(dateString);
      return isNaN(date.getTime()) ? 'Invalid Date' : date.toLocaleDateString('en-IN');
    } catch {
      return 'Invalid Date';
    }
  };

  const formatCurrency = (amount: number) => {
    try {
      if (typeof amount !== 'number' || isNaN(amount) || amount < 0) {
        return '₹0';
      }
      return `₹${amount.toLocaleString()}`;
    } catch {
      return '₹0';
    }
  };

  if (payments.length === 0) {
    return (
      <Paper sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="h6" color="text.secondary">
          No payment history found
        </Typography>
      </Paper>
    );
  }

  return (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell><strong>Amount</strong></TableCell>
            <TableCell><strong>Type</strong></TableCell>
            <TableCell><strong>Method</strong></TableCell>
            <TableCell><strong>Status</strong></TableCell>
            <TableCell><strong>Date</strong></TableCell>
            <TableCell><strong>Transaction ID</strong></TableCell>
            {showActions && <TableCell><strong>Actions</strong></TableCell>}
          </TableRow>
        </TableHead>
        <TableBody>
          {payments.map((payment) => (
            <TableRow key={payment.paymentId} hover>
              <TableCell>
                <Typography variant="body2" fontWeight="medium">
                  {formatCurrency(payment.amount)}
                </Typography>
              </TableCell>
              <TableCell>{payment.paymentType}</TableCell>
              <TableCell>
                <Typography variant="body2">
                  {payment.paymentMethod}
                </Typography>
                {payment.paymentGateway && (
                  <Typography variant="caption" color="text.secondary" display="block">
                    via {payment.paymentGateway}
                  </Typography>
                )}
              </TableCell>
              <TableCell>
                <Chip 
                  label={payment.status} 
                  color={getStatusColor(payment.status)} 
                  size="small" 
                />
                {payment.failureReason && (
                  <Typography variant="caption" color="error.main" display="block">
                    {payment.failureReason}
                  </Typography>
                )}
              </TableCell>
              <TableCell>
                <Typography variant="body2">
                  {formatDate(payment.paymentDate)}
                </Typography>
                {payment.processedDate && (
                  <Typography variant="caption" color="text.secondary" display="block">
                    Processed: {formatDate(payment.processedDate)}
                  </Typography>
                )}
              </TableCell>
              <TableCell>
                {payment.transactionId ? (
                  <Typography variant="caption" sx={{ wordBreak: 'break-all' }}>
                    {payment.transactionId}
                  </Typography>
                ) : (
                  '-'
                )}
              </TableCell>
              {showActions && (
                <TableCell>
                  <Box display="flex" gap={1}>
                    {(() => {
                      const successStatusNames = ['Success', 'Completed', 'Paid'];
                      const statusEnum = statuses.find(s => s.name === payment.status);
                      return statusEnum && successStatusNames.includes(statusEnum.name);
                    })() && onViewReceipt && (
                      <Button 
                        size="small" 
                        onClick={() => {
                          try {
                            onViewReceipt(payment);
                          } catch (error) {
                            console.error('Error viewing receipt');
                          }
                        }}
                      >
                        Receipt
                      </Button>
                    )}
                    {(() => {
                      const errorStatusNames = ['Failed', 'Rejected', 'Cancelled'];
                      const statusEnum = statuses.find(s => s.name === payment.status);
                      return statusEnum && errorStatusNames.includes(statusEnum.name);
                    })() && onRetryPayment && (
                      <Button 
                        size="small" 
                        variant="outlined"
                        color="error"
                        onClick={() => {
                          try {
                            onRetryPayment(payment);
                          } catch (error) {
                            console.error('Error retrying payment');
                          }
                        }}
                      >
                        Retry
                      </Button>
                    )}
                  </Box>
                </TableCell>
              )}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
