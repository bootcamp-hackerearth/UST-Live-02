import { validateLoginEmail } from './auth.validation';

export const validateRequiredField = (value: string, fieldName: string) => {
  if (!value.trim()) {
    return `${fieldName} is required`;
  }

  return '';
};

export const validateNameField = (value: string, fieldName: string) => {
  const trimmed = value.trim();

  if (!trimmed) {
    return `${fieldName} is required`;
  }

  if (!/^[A-Za-z\s'-]+$/.test(trimmed)) {
    return `${fieldName} must contain letters only`;
  }

  return '';
};

export const validateRegisterEmail = (email: string) => {
  return validateLoginEmail(email);
};

export const validatePhoneNumber = (phone: string, fieldName: string) => {
  const trimmedPhone = phone.trim();

  if (!trimmedPhone) {
    return `${fieldName} is required`;
  }

  if (!/^\d{10}$/.test(trimmedPhone)) {
    return `${fieldName} must be 10 digits`;
  }

  return '';
};

export const validatePincode = (pincode: string) => {
  const trimmedPincode = pincode.trim();

  if (!trimmedPincode) {
    return 'Pincode is required';
  }

  if (!/^\d{6}$/.test(trimmedPincode)) {
    return 'Pincode must be 6 digits';
  }

  return '';
};

export const validateGender = (gender: string) => {
  const value = gender.trim().toUpperCase();

  if (!value) {
    return 'Gender is required';
  }

  if (!['MALE', 'FEMALE', 'OTHER'].includes(value)) {
    return 'Gender must be MALE, FEMALE, or OTHER';
  }

  return '';
};

export const validateBloodGroup = (bloodGroup: string) => {
  const value = bloodGroup.trim().toUpperCase();

  if (!value) {
    return 'Blood group is required';
  }

  const allowedBloodGroups = [
    'A+',
    'A-',
    'B+',
    'B-',
    'AB+',
    'AB-',
    'O+',
    'O-',
  ];

  if (!allowedBloodGroups.includes(value)) {
    return 'Enter a valid blood group';
  }

  return '';
};

export const validateDateOfBirth = (dob: string) => {
  const trimmedDob = dob.trim();

  if (!trimmedDob) {
    return 'Date of birth is required';
  }

  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;

  if (!dateRegex.test(trimmedDob)) {
    return 'Date of birth must be in YYYY-MM-DD format';
  }

  const [year, month, day] = trimmedDob.split('-').map(Number);

  const date = new Date(year, month - 1, day);

  const isValidDate =
    date.getFullYear() === year &&
    date.getMonth() === month - 1 &&
    date.getDate() === day;

  if (!isValidDate) {
    return 'Enter a valid date of birth';
  }

  const today = new Date();

  if (date > today) {
    return 'Date of birth cannot be in the future';
  }

  return '';
};

export const validateRegisterPassword = (password: string) => {
  if (!password.trim()) {
    return 'Password is required';
  }

  if (password.length < 8) {
    return 'Password must be at least 8 characters';
  }

  if (!/[A-Z]/.test(password)) {
    return 'Password must contain at least one uppercase letter';
  }

  if (!/[a-z]/.test(password)) {
    return 'Password must contain at least one lowercase letter';
  }

  if (!/\d/.test(password)) {
    return 'Password must contain at least one number';
  }

  if (!/[!@#$%^&*]/.test(password)) {
    return 'Password must contain at least one special character';
  }

  return '';
};

export const validateConfirmPassword = (
  password: string,
  confirmPassword: string
) => {
  if (!confirmPassword.trim()) {
    return 'Confirm password is required';
  }

  if (password !== confirmPassword) {
    return 'Passwords do not match';
  }

  return '';
};