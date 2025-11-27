import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography, Box } from '@mui/material';
import type { Document } from '../../types/Document';

interface DocumentModalProps {
  open: boolean;
  onClose: () => void;
  document: Document | null;
  onApprove?: (documentId: string) => void;
  onReject?: (documentId: string) => void;
}

export default function DocumentModal({ open, onClose, document, onApprove, onReject }: DocumentModalProps) {
  if (!document) return null;

  const handleApprove = () => {
    onApprove?.(document.documentId);
    onClose();
  };

  const handleReject = () => {
    onReject?.(document.documentId);
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth disableAutoFocus>
      <DialogTitle>
        Document Review: {document.documentType}
      </DialogTitle>
      
      <DialogContent>
        <Box mb={2}>
          <Typography variant="body1" gutterBottom>
            <strong>Document Type:</strong> {document.documentType}
          </Typography>
          <Typography variant="body1" gutterBottom>
            <strong>Upload Date:</strong> {new Date(document.uploadedAt).toLocaleDateString()}
          </Typography>
          <Typography variant="body1" gutterBottom>
            <strong>Status:</strong> {document.status}
          </Typography>
        </Box>
        
        <Box 
          sx={{ 
            border: '1px solid #ddd', 
            borderRadius: 1, 
            p: 2, 
            textAlign: 'center',
            minHeight: 300,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <Typography color="text.secondary">
            Document preview would appear here
          </Typography>
        </Box>
      </DialogContent>
      
      <DialogActions>
        <Button onClick={onClose}>
          Close
        </Button>
        {document.status === 'Pending' && (
          <>
            <Button onClick={handleReject} color="error">
              Reject
            </Button>
            <Button onClick={handleApprove} variant="contained" color="success">
              Approve
            </Button>
          </>
        )}
      </DialogActions>
    </Dialog>
  );
}
