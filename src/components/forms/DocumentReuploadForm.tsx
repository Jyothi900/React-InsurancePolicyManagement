import { useState } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography, Alert, Box } from '@mui/material';
import { documentApi } from '../../api/document.api';
import type { Document } from '../../types/Document';

interface DocumentReuploadFormProps {
  open: boolean;
  document: Document | null;
  onClose: () => void;
  onSuccess: () => void;
}

export default function DocumentReuploadForm({ open, document, onClose, onSuccess }: DocumentReuploadFormProps) {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    if (!file || !document) return;
    
    setLoading(true);
    setError('');

    try {
      const uploadRequest = {
        userId: document.userId,
        documentType: Number(document.documentType),
        file: file
      };

      await documentApi.uploadDocument(uploadRequest);
      onSuccess();
      onClose();
    } catch {
      setError('Upload failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Reupload Document</DialogTitle>
      <DialogContent>
        {document && (
          <Box mb={2}>
            <Typography variant="body2" color="text.secondary">
              Replacing: <strong>{document.fileName}</strong>
            </Typography>
            {document.verificationNotes && (
              <Alert severity="warning" sx={{ mt: 1 }}>
                Rejection reason: {document.verificationNotes}
              </Alert>
            )}
          </Box>
        )}
        
        <input
          type="file"
          accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
          style={{ marginBottom: '16px' }}
        />
        
        {error && <Alert severity="error">{error}</Alert>}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button 
          onClick={handleSubmit} 
          variant="contained" 
          disabled={!file || loading}
        >
          {loading ? 'Uploading...' : 'Upload'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}