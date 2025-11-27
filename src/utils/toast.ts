import { toast } from 'react-toastify';
import type { ToastOptions } from 'react-toastify';

const defaultOptions: ToastOptions = {
  position: 'top-right',
  autoClose: 3000,
  hideProgressBar: false,
  closeOnClick: true,
  pauseOnHover: true,
  draggable: true,
};

export const showToast = {
  success: (message: string, options?: ToastOptions) => {
    toast.success(message, { ...defaultOptions, ...options });
  },
  
  error: (message: string, options?: ToastOptions) => {
    toast.error(message, { ...defaultOptions, ...options });
  },
  
  info: (message: string, options?: ToastOptions) => {
    toast.info(message, { ...defaultOptions, ...options });
  },
  
  warning: (message: string, options?: ToastOptions) => {
    toast.warning(message, { ...defaultOptions, ...options });
  },
  

  uploadSuccess: (fileName?: string) => {
    const message = fileName ? `${fileName} uploaded successfully!` : 'Upload completed successfully!';
    toast.success(message, defaultOptions);
  },
  
  uploadError: (fileName?: string) => {
    const message = fileName ? `Failed to upload ${fileName}` : 'Upload failed. Please try again.';
    toast.error(message, defaultOptions);
  },
  
  saveSuccess: (itemName?: string) => {
    const message = itemName ? `${itemName} saved successfully!` : 'Changes saved successfully!';
    toast.success(message, defaultOptions);
  },
  
  saveError: (itemName?: string) => {
    const message = itemName ? `Failed to save ${itemName}` : 'Failed to save changes. Please try again.';
    toast.error(message, defaultOptions);
  },
  
  deleteSuccess: (itemName?: string) => {
    const message = itemName ? `${itemName} deleted successfully!` : 'Item deleted successfully!';
    toast.success(message, defaultOptions);
  },
  
  deleteError: (itemName?: string) => {
    const message = itemName ? `Failed to delete ${itemName}` : 'Failed to delete item. Please try again.';
    toast.error(message, defaultOptions);
  },
  
  kycRequired: () => {
    toast.warning('KYC verification required to proceed', defaultOptions);
  },
  
  loginRequired: () => {
    toast.info('Please login to continue', defaultOptions);
  },
  
  permissionDenied: () => {
    toast.error('You do not have permission to perform this action', defaultOptions);
  }
};