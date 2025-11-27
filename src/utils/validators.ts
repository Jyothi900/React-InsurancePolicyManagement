export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePhone = (phone: string): boolean => {
  const phoneRegex = /^[6-9]\d{9}$/;
  return phoneRegex.test(phone);
};

export const validatePAN = (pan: string): boolean => {
  const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
  return panRegex.test(pan);
};

export const validateAadhaar = (aadhaar: string): boolean => {
  const aadhaarRegex = /^\d{12}$/;
  return aadhaarRegex.test(aadhaar);
};

export const validateAge = (dateOfBirth: string, minAge: number = 18, maxAge: number = 100): boolean => {
  const today = new Date();
  const birthDate = new Date(dateOfBirth);

  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  
  return age >= minAge && age <= maxAge;
};

export const getMaxBirthDate = (): string => {
  const today = new Date();
  const maxDate = new Date(today.getFullYear() - 18, today.getMonth(), today.getDate());
  return maxDate.toISOString().split('T')[0];
};

export const validatePassword = (password: string): { isValid: boolean; message?: string } => {
  if (!password) {
    return { isValid: false, message: 'Password is required' };
  }
  if (password.length < 6) {
    return { isValid: false, message: 'Password must be at least 6 characters' };
  }
  if (!/(?=.*[A-Z])/.test(password)) {
    return { isValid: false, message: 'Password must contain at least one uppercase letter' };
  }
  if (!/(?=.*\d)/.test(password)) {
    return { isValid: false, message: 'Password must contain at least one number' };
  }
  if (!/(?=.*[@$!%*?&])/.test(password)) {
    return { isValid: false, message: 'Password must contain at least one special character (@$!%*?&)' };
  }
  return { isValid: true };
};

export const validateFullName = (name: string): { isValid: boolean; message?: string } => {
  if (!name) {
    return { isValid: false, message: 'Full name is required' };
  }
  if (name.length < 2 || name.length > 100) {
    return { isValid: false, message: 'Full name must be between 2-100 characters' };
  }
  if (!/^[a-zA-Z\s]+$/.test(name)) {
    return { isValid: false, message: 'Full name can only contain letters and spaces' };
  }
  return { isValid: true };
};

export const validateMobile = (mobile: string): { isValid: boolean; message?: string } => {
  if (!mobile) {
    return { isValid: false, message: 'Mobile number is required' };
  }
  if (!/^[6-9][0-9]{9}$/.test(mobile)) {
    return { isValid: false, message: 'Mobile number must be exactly 10 digits starting with 6-9' };
  }
  return { isValid: true };
};
