import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Chip, IconButton, Button } from '@mui/material';
import { Visibility, CheckCircle, Cancel } from '@mui/icons-material';
import { type Proposal } from '../../types/Proposal';
import type { Status } from '../../types/Common';
import { useSelector } from 'react-redux';
import type { RootState } from '../../store';

interface ProposalTableProps {
  proposals: Proposal[];
  loading?: boolean;
  showActions?: boolean;
  onView?: (proposal: Proposal) => void;
  onApprove?: (proposalId: string) => void;
  onReject?: (proposalId: string) => void;
  onPayNow?: (proposal: Proposal) => void;
  statusEnums?: any[];
}

export default function ProposalTable({ proposals, showActions, onView, onApprove, onReject, onPayNow, statusEnums }: ProposalTableProps) {
  const { statuses } = useSelector((state: RootState) => state.enum);
  const enumsToUse = statusEnums || statuses;

  const getStatusColor = (status: Status) => {
    switch (status) {
      case 3: return 'success';  // Approved
      case 4: return 'error';    // Rejected
      case 2: return 'warning';  // Pending
      case 20: return 'info';    // Applied
      case 21: return 'info';    // UnderReview
      case 22: return 'success'; // Issued
      default: return 'default';
    }
  };

  const getStatusLabel = (status: Status) => {
    const statusEnum = enumsToUse.find((s: any) => s.value === status);
    return statusEnum?.name || 'Unknown';
  };

  return (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow sx={{ bgcolor: 'grey.100' }}>
            <TableCell sx={{ fontWeight: 'bold', color: 'text.primary' }}>Proposal ID</TableCell>
            <TableCell sx={{ fontWeight: 'bold', color: 'text.primary' }}>Product</TableCell>
            <TableCell sx={{ fontWeight: 'bold', color: 'text.primary' }}>Coverage</TableCell>
            <TableCell sx={{ fontWeight: 'bold', color: 'text.primary' }}>Premium</TableCell>
            <TableCell sx={{ fontWeight: 'bold', color: 'text.primary' }}>Status</TableCell>
            <TableCell sx={{ fontWeight: 'bold', color: 'text.primary' }}>Date</TableCell>
            <TableCell sx={{ fontWeight: 'bold', color: 'text.primary' }}>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {proposals.map((proposal) => (
            <TableRow key={proposal.proposalId} sx={{ '&:hover': { bgcolor: 'grey.50' } }}>
              <TableCell sx={{ color: 'text.secondary' }}>{proposal.proposalId}</TableCell>
              <TableCell sx={{ color: 'text.secondary' }}>{proposal.productId}</TableCell>
              <TableCell sx={{ color: 'text.secondary' }}>₹{proposal.sumAssured.toLocaleString('en-IN')}</TableCell>
              <TableCell sx={{ color: 'text.secondary' }}>₹{proposal.premiumAmount.toLocaleString('en-IN')}</TableCell>
              <TableCell>
                <Chip 
                  label={getStatusLabel(proposal.status)} 
                  color={getStatusColor(proposal.status)} 
                  size="small" 
                />
              </TableCell>
              <TableCell sx={{ color: 'text.secondary' }}>{new Date(proposal.appliedDate).toLocaleDateString()}</TableCell>
              <TableCell>
                <IconButton onClick={() => onView?.(proposal)} size="small" title="View Details">
                  <Visibility />
                </IconButton>
                {showActions && (
                  <>
                    {/* Underwriter Actions */}
                    {(proposal.status === 2 || proposal.status === 20 || proposal.status === 21) && onApprove && (
                      <>
                        <IconButton 
                          onClick={() => onApprove?.(proposal.proposalId)} 
                          size="small" 
                          color="success"
                          title="Approve Proposal"
                        >
                          <CheckCircle />
                        </IconButton>
                        <IconButton 
                          onClick={() => onReject?.(proposal.proposalId)} 
                          size="small" 
                          color="error"
                          title="Reject Proposal"
                        >
                          <Cancel />
                        </IconButton>
                      </>
                    )}
                    {/* Customer Payment Action */}
                    {proposal.status === 22 && onPayNow && (
                      <Button 
                        onClick={() => onPayNow(proposal)} 
                        size="small" 
                        variant="contained"
                        color="primary"
                        sx={{ ml: 1 }}
                      >
                        Pay Now
                      </Button>
                    )}
                  </>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
