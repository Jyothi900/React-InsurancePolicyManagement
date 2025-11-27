export const formatCurrency = (amount: number): string => {
  return `₹${amount.toLocaleString('en-IN')}`;
};

export const formatDate = (date: string | Date): string => {
  return new Date(date).toLocaleDateString('en-IN');
};

export const formatDateTime = (date: string | Date): string => {
  return new Date(date).toLocaleString('en-IN');
};

export const formatPhoneNumber = (phone: string): string => {
  return phone.replace(/(\d{3})(\d{3})(\d{4})/, '$1-$2-$3');
};

export const capitalizeFirst = (str: string): string => {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};
