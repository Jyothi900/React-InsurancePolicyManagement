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
  Typography,
  IconButton
} from '@mui/material';
import { Download, Visibility, Delete } from '@mui/icons-material';
import { useSelector } from 'react-redux';
import type { RootState } from '../../store';
import type { Document } from '../../types/Document';

interface DocumentTableProps {
  documents: Document[];
  onDownload?: (document: Document) => void;
  onView?: (document: Document) => void;
  onDelete?: (document: Document) => void;
  onVerify?: (document: Document, status: string) => void;
  onReupload?: (document: Document) => void;
  showActions?: boolean;
  showVerifyActions?: boolean;
}

export default function DocumentTable({ 
  documents, 
  onDownload, 
  onView, 
  onDelete, 
  onVerify,
  onReupload,
  showActions = true,
  showVerifyActions = false
}: DocumentTableProps) {
  const { statuses, documentTypes } = useSelector((state: RootState) => state.enum);
  
  const getEnumName = (value: any, enumArray: any[]) => {
    if (!enumArray || enumArray.length === 0) return String(value);
    const numValue = Number(value);
    const enumItem = enumArray.find(item => item.value === numValue);
    return enumItem?.name || String(value);
  };
  
  const getStatusColor = (status: any) => {
    const statusName = getEnumName(status, statuses).toLowerCase();
    switch (statusName) {
      case 'verified': return 'success';
      case 'rejected': return 'error';
      case 'uploaded': return 'info';
      case 'pending': return 'warning';
      default: return 'default';
    }
  };
  
  const getStatusByName = (name: string) => {
    return statuses.find(s => s.name.toLowerCase() === name.toLowerCase());
  };
  
  const canDelete = (status: any) => {
    const statusName = getEnumName(status, statuses).toLowerCase();
    return statusName === 'uploaded' || statusName === 'rejected';
  };
  
  const canVerify = (status: any) => {
    const numStatus = Number(status);
    return numStatus === 18; // 18 = Uploaded
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

  const getFileIcon = (fileName: string) => {
    try {
      if (!fileName) return '📎';
      const extension = fileName.split('.').pop()?.toLowerCase();
      switch (extension) {
        case 'pdf': return '📄';
        case 'jpg':
        case 'jpeg':
        case 'png': return '🖼️';
        case 'doc':
        case 'docx': return '📝';
        default: return '📎';
      }
    } catch {
      return '📎';
    }
  };

  if (documents.length === 0) {
    return (
      <Paper sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="h6" color="text.secondary">
          No documents found
        </Typography>
      </Paper>
    );
  }

  return (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell><strong>Customer</strong></TableCell>
            <TableCell><strong>Document</strong></TableCell>
            <TableCell><strong>Type</strong></TableCell>
            <TableCell><strong>Status</strong></TableCell>
            <TableCell><strong>Uploaded</strong></TableCell>
            {(showActions || showVerifyActions) && <TableCell><strong>Actions</strong></TableCell>}
          </TableRow>
        </TableHead>
        <TableBody>
          {documents.map((document) => (
            <TableRow key={document.documentId} hover>
              <TableCell>
                <Typography variant="body2" fontWeight="medium">
                  {(document as any).customerName || (document as any).fullName || document.userId}
                </Typography>
                <Typography variant="caption" color="text.secondary" display="block">
                  ID: {document.userId}
                </Typography>
              </TableCell>
              <TableCell>
                <Box display="flex" alignItems="center" gap={1}>
                  <span>{getFileIcon(document.fileName)}</span>
                  <Typography variant="body2" fontWeight="medium">
                    {document.fileName}
                  </Typography>
                </Box>
              </TableCell>
              <TableCell>{getEnumName(document.documentType, documentTypes)}</TableCell>
              <TableCell>
                <Chip 
                  label={getEnumName(document.status, statuses)} 
                  color={getStatusColor(document.status)} 
                  size="small" 
                />
                {document.verificationNotes && (
                  <Typography variant="caption" color="text.secondary" display="block">
                    {document.verificationNotes}
                  </Typography>
                )}
              </TableCell>
              <TableCell>
                <Typography variant="body2">
                  {formatDate(document.uploadedAt)}
                </Typography>
                {document.verifiedAt && (
                  <Typography variant="caption" color="text.secondary" display="block">
                    Verified: {formatDate(document.verifiedAt)}
                  </Typography>
                )}
              </TableCell>
              {(showActions || showVerifyActions) && (
                <TableCell>
                  <Box display="flex" gap={0.5}>
                    {showActions && (
                      <>
                        {onView && (
                          <IconButton 
                            size="small" 
                            onClick={() => {
                              try {
                                onView(document);
                              } catch (error) {
                                console.error('Error viewing document');
                              }
                            }}
                            title="View Document"
                          >
                            <Visibility />
                          </IconButton>
                        )}
                        {onDownload && (
                          <IconButton 
                            size="small" 
                            onClick={() => {
                              try {
                                onDownload(document);
                              } catch (error) {
                                console.error('Error downloading document');
                              }
                            }}
                            title="Download Document"
                          >
                            <Download />
                          </IconButton>
                        )}
                        {onReupload && canDelete(document.status) && (
                          <Button 
                            size="small" 
                            variant="outlined"
                            onClick={() => {
                              try {
                                onReupload(document);
                              } catch (error) {
                                console.error('Error reuploading document');
                              }
                            }}
                            title="Reupload Document"
                          >
                            Reupload
                          </Button>
                        )}
                        {onDelete && canDelete(document.status) && (
                          <IconButton 
                            size="small" 
                            onClick={() => {
                              try {
                                onDelete(document);
                              } catch (error) {
                                console.error('Error deleting document');
                              }
                            }}
                            color="error"
                            title="Delete Document"
                          >
                            <Delete />
                          </IconButton>
                        )}
                      </>
                    )}
                    {showVerifyActions && onVerify && canVerify(document.status) && (
                      <Box display="flex" gap={1}>
                        <Button 
                          size="small" 
                          variant="outlined"
                          color="success"
                          onClick={() => {
                            try {
                              const verifiedStatus = getStatusByName('Verified');
                              onVerify(document, verifiedStatus?.name || 'Verified');
                            } catch (error) {
                              console.error('Error approving document');
                            }
                          }}
                        >
                          Approve
                        </Button>
                        <Button 
                          size="small" 
                          variant="outlined"
                          color="error"
                          onClick={() => {
                            try {
                              const rejectedStatus = getStatusByName('Rejected');
                              onVerify(document, rejectedStatus?.name || 'Rejected');
                            } catch (error) {
                              console.error('Error rejecting document');
                            }
                          }}
                        >
                          Reject
                        </Button>
                      </Box>
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
