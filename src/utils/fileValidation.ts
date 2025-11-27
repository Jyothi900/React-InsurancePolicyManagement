export interface FileValidationResult {
  isValid: boolean;
  error?: string;
  errorType?: 'size' | 'type' | 'unknown';
}

export const ALLOWED_DOCUMENT_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'image/jpeg',
  'image/jpg', 
  'image/png'
];

export const ALLOWED_EXTENSIONS = ['.pdf', '.doc', '.docx', '.jpg', '.jpeg', '.png'];

export const BLOCKED_TYPES = [
  'video/',
  'audio/',
  'application/x-msvideo', 
  'video/mp4',
  'video/mpeg',
  'video/quicktime',
  'audio/mpeg',
  'audio/wav',
  'audio/mp3'
];

export const MAX_FILE_SIZE = 20 * 1024 * 1024; 

export function validateFile(file: File): FileValidationResult {
  if (file.size > MAX_FILE_SIZE) {
    return {
      isValid: false,
      error: `File size exceeds 20MB limit. Current size: ${formatFileSize(file.size)}`,
      errorType: 'size'
    };
  }

  const isBlockedType = BLOCKED_TYPES.some(blockedType => 
    file.type.startsWith(blockedType) || file.type.includes(blockedType)
  );

  if (isBlockedType) {
    return {
      isValid: false,
      error: 'Video and audio files are not allowed. Please upload documents only (PDF, Word, Images).',
      errorType: 'type'
    };
  }
  const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
  const hasValidExtension = ALLOWED_EXTENSIONS.includes(fileExtension);

  const hasValidMimeType = ALLOWED_DOCUMENT_TYPES.includes(file.type);

  if (!hasValidExtension && !hasValidMimeType) {
    return {
      isValid: false,
      error: `File type not supported. Allowed types: PDF, Word documents (DOC, DOCX), Images (JPG, PNG)`,
      errorType: 'type'
    };
  }

  return { isValid: true };
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}