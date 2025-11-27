import { useState } from 'react';
import { 
  Box, 
  Button, 
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem, 
  Typography,
  Paper,
  Alert,
  LinearProgress,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent
} from '@mui/material';
import { CloudUpload, AttachFile, Delete } from '@mui/icons-material';
import type { DocumentType } from '../../types/Common';
import { documentApi } from '../../api/document.api';
import type { DocumentResponse } from '../../types/Document';
import { toast } from 'react-toastify';
import { useSelector } from 'react-redux';
import { useEffect } from 'react';
import type { RootState } from '../../store';
import { validateFile, formatFileSize, ALLOWED_EXTENSIONS } from '../../utils/fileValidation';
import FileValidationErrorModal from '../modals/FileValidationErrorModal';
interface DocumentUploadProps {
  userId: string;
  proposalId?: string;
  policyId?: string;
  claimId?: string;
  requiredDocuments?: string[];
  documentTypes?: Array<{ value: number; name: string }>;
  onUploadComplete?: (documents: DocumentResponse[]) => void;
  open?: boolean;
  onClose?: () => void;
  onUpload?: () => void;
}

export default function DocumentUpload({ 
  userId, 
  proposalId, 
  policyId, 
  claimId, 
  requiredDocuments,
  documentTypes: propDocumentTypes,
  onUploadComplete,
  open,
  onClose,
  onUpload
}: DocumentUploadProps) {
  
  const { documentTypes: stateDocumentTypes, loading: enumLoading } = useSelector((state: RootState) => state.enum);
  const documentTypes = propDocumentTypes || stateDocumentTypes;
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [documentType, setDocumentType] = useState<DocumentType>(0);
  const [validationError, setValidationError] = useState<{ message: string; type: 'size' | 'type' | 'unknown' } | null>(null);

  useEffect(() => {
    if (documentTypes.length > 0 && documentType === 0) {
      setDocumentType(documentTypes[0].value);
    }
  }, [documentTypes, documentType]);
 
  if (enumLoading) {
    return (
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Upload Documents
        </Typography>
        <Alert severity="info">
          Loading document types...
        </Alert>
      </Paper>
    );
  }
  

  if (documentTypes.length === 0) {
    return (
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Upload Documents
        </Typography>
        <Alert severity="warning">
          No document types available. Please check if the backend enum API is working.
        </Alert>
      </Paper>
    );
  }

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    const validFiles: File[] = [];
    
    for (const file of files) {
      const validation = validateFile(file);
      
      if (!validation.isValid) {
        setValidationError({
          message: validation.error || 'Invalid file',
          type: validation.errorType || 'unknown'
        });
        event.target.value = '';
        return;
      }
      
      validFiles.push(file);
    }
    
    setSelectedFiles(prev => [...prev, ...validFiles]);
    event.target.value = '';
  };

  const handleRemoveFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0) return;

    setUploading(true);
    setUploadProgress(0);

    try {
      const uploadedDocs = [];
      
      for (let i = 0; i < selectedFiles.length; i++) {
        const file = selectedFiles[i];
        
        try {
          const validation = validateFile(file);
          if (!validation.isValid) {
            toast.error(`${file.name}: ${validation.error}`);
            continue;
          }

          const uploadData = {
            userId,
            documentType,
            file,
            ...(proposalId && { proposalId }),
            ...(policyId && { policyId }),
            ...(claimId && { claimId })
          };
          
          console.log('Uploading document:', {
            fileName: file.name,
            documentType,
            userId,
            proposalId,
            fileSize: file.size
          });
          
          const response = await documentApi.uploadDocument(uploadData);
          console.log('Upload response:', response);
          uploadedDocs.push(response);
          
        } catch (fileError) {
          console.error(`Failed to upload ${file.name}:`, fileError);
          toast.error(`Failed to upload ${file.name}`);
          continue; 
        }

        setUploadProgress(((i + 1) / selectedFiles.length) * 100);
      }

      if (uploadedDocs.length > 0) {
        setSelectedFiles([]);
        toast.success(`Successfully uploaded ${uploadedDocs.length} document(s)`);
        onUploadComplete?.(uploadedDocs);
        onUpload?.();
      } else {
        toast.error('No documents were uploaded successfully');
      }
      
    } catch (error) {
      toast.error('Upload process failed. Please try again.');
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const getFileSize = formatFileSize;

  const content = (
    <Box sx={{ p: open ? 0 : 3 }}>
      <Typography variant="h6" gutterBottom>
        Upload Documents
      </Typography>
      
      <Box display="flex" flexDirection="column" gap={3}>
        <FormControl fullWidth>
          <InputLabel>Document Type</InputLabel>
          <Select
            value={documentTypes.length > 0 ? documentType : ''}
            onChange={(e) => setDocumentType(e.target.value as DocumentType)}
            label="Document Type"
            disabled={documentTypes.length === 0}
          >
            {documentTypes.map((docType) => (
              <MenuItem key={docType.value} value={docType.value}>
                {docType.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <Box>
          <input
            accept={ALLOWED_EXTENSIONS.join(',')}
            style={{ display: 'none' }}
            id="file-upload"
            multiple
            type="file"
            onChange={handleFileSelect}
          />
          <label htmlFor="file-upload">
            <Button
              variant="outlined"
              component="span"
              startIcon={<CloudUpload />}
              fullWidth
              sx={{ py: 2 }}
            >
              Select Files to Upload
            </Button>
          </label>
        </Box>

        {selectedFiles.length > 0 && (
          <Box>
            <Typography variant="subtitle2" gutterBottom>
              Selected Files ({selectedFiles.length})
            </Typography>
            <List dense>
              {selectedFiles.map((file, index) => (
                <ListItem key={index} sx={{ bgcolor: 'grey.50', mb: 1, borderRadius: 1 }}>
                  <ListItemIcon>
                    <AttachFile />
                  </ListItemIcon>
                  <ListItemText
                    primary={file.name}
                    secondary={getFileSize(file.size)}
                  />
                  <IconButton 
                    edge="end" 
                    onClick={() => handleRemoveFile(index)}
                    size="small"
                  >
                    <Delete />
                  </IconButton>
                </ListItem>
              ))}
            </List>
          </Box>
        )}

        {uploading && (
          <Box>
            <Typography variant="body2" gutterBottom>
              Uploading... {Math.round(uploadProgress)}%
            </Typography>
            <LinearProgress variant="determinate" value={uploadProgress} />
          </Box>
        )}

        <Alert severity="info">
          <Box>
            <Typography variant="body2" gutterBottom>
              Supported formats: PDF, JPG, PNG, DOC, DOCX. Maximum file size: 20MB per file.
              {claimId && ' For claims: Upload death certificates, medical reports, or photos.'}
              {policyId && ' For policies: Upload policy documents.'}
            </Typography>
            {proposalId && requiredDocuments && requiredDocuments.length > 0 && (
              <Box sx={{ mt: 1 }}>
                <Typography variant="body2" component="div" gutterBottom>
                  <strong>Required for your proposal:</strong>
                </Typography>
                <Box component="ul" sx={{ pl: 2, mb: 0 }}>
                  {requiredDocuments.map((doc, index) => (
                    <Typography component="li" variant="body2" key={index}>
                      {doc}
                    </Typography>
                  ))}
                </Box>
              </Box>
            )}
          </Box>
        </Alert>

        <Button
          variant="contained"
          onClick={handleUpload}
          disabled={selectedFiles.length === 0 || uploading}
          startIcon={<CloudUpload />}
          size="large"
        >
          {uploading ? 'Uploading...' : `Upload ${selectedFiles.length} File(s)`}
        </Button>
      </Box>
      
      <FileValidationErrorModal
        open={!!validationError}
        onClose={() => setValidationError(null)}
        errorMessage={validationError?.message || ''}
        errorType={validationError?.type || 'unknown'}
      />
    </Box>
  );

  if (open) {
    return (
      <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
        <DialogTitle>Upload Documents</DialogTitle>
        <DialogContent>
          {content}
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Paper sx={{ p: 3 }}>
      {content}
    </Paper>
  );
}
