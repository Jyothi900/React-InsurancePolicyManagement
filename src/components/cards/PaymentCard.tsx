import { Card, CardContent, CardActions, Typography, Button, Chip, Box, Divider } from '@mui/material';
import { type Payment } from '../../types/Payment';


interface PaymentCardProps {
  payment: Payment;
  onViewReceipt?: (payment: Payment) => void;
  onRetryPayment?: (payment: Payment) => void;
}

export default function PaymentCard({ payment, onViewReceipt, onRetryPayment }: PaymentCardProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Success': return 'success';
      case 'Failed': return 'error';
      case 'Pending': return 'warning';
      case 'Cancelled': return 'default';
      default: return 'default';
    }
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

  return (
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <CardContent sx={{ flexGrow: 1 }}>
        <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
          <Typography variant="h6" component="h3">
            {formatCurrency(payment.amount)}
          </Typography>
          <Chip 
            label={payment.status} 
            color={getStatusColor(payment.status)} 
            size="small" 
          />
        </Box>
        
        <Typography variant="body2" color="text.secondary" gutterBottom>
          {payment.paymentType} Payment
        </Typography>
        
        <Box mt={2}>
          <Typography variant="body2">
            <strong>Payment Method:</strong> {payment.paymentMethod}
          </Typography>
          {payment.paymentGateway && (
            <Typography variant="body2">
              <strong>Gateway:</strong> {payment.paymentGateway}
            </Typography>
          )}
          <Typography variant="body2">
            <strong>Payment Date:</strong> {formatDate(payment.paymentDate)}
          </Typography>
          {payment.processedDate && (
            <Typography variant="body2">
              <strong>Processed:</strong> {formatDate(payment.processedDate)}
            </Typography>
          )}
        </Box>

        {payment.transactionId && (
          <Box mt={2}>
            <Typography variant="body2">
              <strong>Transaction ID:</strong> 
            </Typography>
            <Typography variant="caption" sx={{ wordBreak: 'break-all' }}>
              {payment.transactionId}
            </Typography>
          </Box>
        )}

        <Divider sx={{ my: 2 }} />

        {payment.dueDate && (
          <Typography variant="body2">
            <strong>Due Date:</strong> {formatDate(payment.dueDate)}
          </Typography>
        )}
        
        {payment.nextDueDate && (
          <Typography variant="body2">
            <strong>Next Due:</strong> {formatDate(payment.nextDueDate)}
          </Typography>
        )}

        {payment.failureReason && (
          <Box mt={2} p={1} bgcolor="error.50" borderRadius={1}>
            <Typography variant="body2" color="error.main">
              <strong>Failure Reason:</strong> {payment.failureReason}
            </Typography>
          </Box>
        )}
      </CardContent>
      
      <CardActions sx={{ justifyContent: 'space-between', p: 2 }}>
        {payment.status === 'Success' && onViewReceipt && (
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
            View Receipt
          </Button>
        )}
        {payment.status === 'Failed' && onRetryPayment && (
          <Button 
            variant="outlined" 
            size="small" 
            color="error"
            onClick={() => {
              try {
                onRetryPayment(payment);
              } catch (error) {
                console.error('Error retrying payment');
              }
            }}
          >
            Retry Payment
          </Button>
        )}
      </CardActions>
    </Card>
  );
}
