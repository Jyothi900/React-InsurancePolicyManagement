import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography, Box, Alert } from '@mui/material';
import { Error, Block } from '@mui/icons-material';

interface FileValidationErrorModalProps {
  open: boolean;
  onClose: () => void;
  errorMessage: string;
  errorType: 'size' | 'type' | 'unknown';
}

export default function FileValidationErrorModal({ open, onClose, errorMessage, errorType }: FileValidationErrorModalProps) {
  const getIcon = () => {
    switch (errorType) {
      case 'type':
        return <Block sx={{ fontSize: 48, color: 'error.main' }} />;
      case 'size':
        return <Error sx={{ fontSize: 48, color: 'warning.main' }} />;
      default:
        return <Error sx={{ fontSize: 48, color: 'error.main' }} />;
    }
  };

  const getTitle = () => {
    switch (errorType) {
      case 'type':
        return 'Invalid File Type';
      case 'size':
        return 'File Size Limit Exceeded';
      default:
        return 'Upload Error';
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth disableAutoFocus>
      <DialogTitle sx={{ textAlign: 'center', pb: 1 }}>
        <Box display="flex" flexDirection="column" alignItems="center" gap={1}>
          {getIcon()}
          <Typography variant="h6" component="div">
            {getTitle()}
          </Typography>
        </Box>
      </DialogTitle>
      
      <DialogContent sx={{ textAlign: 'center' }}>
        <Alert severity={errorType === 'size' ? 'warning' : 'error'} sx={{ mb: 2 }}>
          {errorMessage}
        </Alert>
        
        <Box sx={{ mt: 2 }}>
          <Typography variant="body2" color="text.secondary">
            <strong>Allowed file types:</strong> PDF, Word documents (DOC, DOCX), Images (JPG, PNG)
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            <strong>Maximum file size:</strong> 20MB per file
          </Typography>
        </Box>
      </DialogContent>
      
      <DialogActions sx={{ justifyContent: 'center', pb: 3 }}>
        <Button onClick={onClose} variant="contained" color="primary">
          OK, I Understand
        </Button>
      </DialogActions>
    </Dialog>
  );
}