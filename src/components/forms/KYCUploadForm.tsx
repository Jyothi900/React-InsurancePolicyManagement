import { useState } from 'react';
import { Button, TextField, Typography, Paper, Alert } from '@mui/material';
import { documentApi } from '../../api/document.api';
import { toast } from 'react-toastify';
import { validateFile, ALLOWED_EXTENSIONS } from '../../utils/fileValidation';
import FileValidationErrorModal from '../modals/FileValidationErrorModal';

interface KYCUploadFormProps {
  userId: string;
  onUploadComplete?: () => void;
}

export default function KYCUploadForm({ userId, onUploadComplete }: KYCUploadFormProps) {
  const [form, setForm] = useState({
    AadhaarNumber: '',
    PANNumber: '',
    BankName: '',
    AccountNumber: '',
    IFSCCode: '',
    AccountHolderName: '',
    AadhaarFile: null as File | null,
    PANFile: null as File | null
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [validationError, setValidationError] = useState<{ message: string; type: 'size' | 'type' | 'unknown' } | null>(null);

  const handleChange = (field: string, value: string | File | null) => {

    if (value instanceof File) {
      const validation = validateFile(value);
      if (!validation.isValid) {
        setValidationError({
          message: validation.error || 'Invalid file',
          type: validation.errorType || 'unknown'
        });
        return; // Don't set the file if validation fails
      }
    }
    
    if (typeof value === 'string') {
      switch (field) {
        case 'PANNumber':
          value = value.replace(/[^A-Z0-9]/g, '').toUpperCase();
          break;
        case 'BankName':
        case 'AccountHolderName':
          value = value.replace(/[^A-Za-z\s]/g, '');
          break;
        case 'AccountNumber':
          value = value.replace(/[^0-9]/g, '');
          break;
        case 'IFSCCode':
          value = value.replace(/[^A-Z0-9]/g, '').toUpperCase();
          break;
        case 'AadhaarNumber':
          value = value.replace(/[^0-9]/g, '');
          break;
      }
    }
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('UserId', userId);
      formData.append('AadhaarNumber', form.AadhaarNumber);
      formData.append('PANNumber', form.PANNumber);
      formData.append('BankName', form.BankName);
      formData.append('AccountNumber', form.AccountNumber);
      formData.append('IFSCCode', form.IFSCCode);
      formData.append('AccountHolderName', form.AccountHolderName);
      
      if (form.AadhaarFile) formData.append('AadhaarFile', form.AadhaarFile);
      if (form.PANFile) formData.append('PANFile', form.PANFile);

      await documentApi.uploadKYC(formData);
      toast.success('KYC documents uploaded successfully!');
      onUploadComplete?.();
    } catch (error) {
      console.error('KYC upload failed:', error);
      setError('Upload failed. Please try again.');
      toast.error('Failed to upload KYC documents. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>KYC Verification</Typography>
      
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <TextField
          label="Aadhaar Number"
          value={form.AadhaarNumber}
          onChange={(e) => handleChange('AadhaarNumber', e.target.value)}
          inputProps={{ maxLength: 12 }}
          helperText="12-digit number only"
        />
        
        <input
          type="file"
          accept={ALLOWED_EXTENSIONS.join(',')}
          onChange={(e) => handleChange('AadhaarFile', e.target.files?.[0] || null)}
        />
        
        <TextField
          label="PAN Number"
          value={form.PANNumber}
          onChange={(e) => handleChange('PANNumber', e.target.value)}
          inputProps={{ maxLength: 10 }}
          helperText="Format: ABCDE1234F (letters and numbers only)"
        />
        
        <input
          type="file"
          accept={ALLOWED_EXTENSIONS.join(',')}
          onChange={(e) => handleChange('PANFile', e.target.files?.[0] || null)}
        />
        
        <TextField
          label="Bank Name"
          value={form.BankName}
          onChange={(e) => handleChange('BankName', e.target.value)}
          helperText="Letters and spaces only"
        />
        
        <TextField
          label="Account Number"
          value={form.AccountNumber}
          onChange={(e) => handleChange('AccountNumber', e.target.value)}
          helperText="Numbers only"
        />
        
        <TextField
          label="IFSC Code"
          value={form.IFSCCode}
          onChange={(e) => handleChange('IFSCCode', e.target.value)}
          inputProps={{ maxLength: 11 }}
          helperText="Format: ABCD0123456 (letters and numbers only)"
        />
        
        <TextField
          label="Account Holder Name"
          value={form.AccountHolderName}
          onChange={(e) => handleChange('AccountHolderName', e.target.value)}
          helperText="Letters and spaces only"
        />
        
        {error && <Alert severity="error">{error}</Alert>}
        
        <Button type="submit" variant="contained" disabled={loading}>
          {loading ? 'Uploading...' : 'Submit KYC'}
        </Button>
      </form>
      
      <FileValidationErrorModal
        open={!!validationError}
        onClose={() => setValidationError(null)}
        errorMessage={validationError?.message || ''}
        errorType={validationError?.type || 'unknown'}
      />
    </Paper>
  );
}