const nameRegex = /^[a-z]+( [a-z]+)*$/i;
const emailRegex = /^[a-z0-9_.]+@[a-z0-9]+\.[a-z]{2,}$/i;
const phoneRegex = /^(\+91[\s-]?)?[6789]\d{9}$/;
const passwordRegex = /^(?=.*[A-Z])(?=.*\d).+$/;
const addressRegex = /^[\w\s.,#/-]{2,200}$/;

export const validateName = (name: string): string => {
  if (!name.trim()) return "Name is required.";
  if (!nameRegex.test(name)) return "Only characters are allowed.";
  if (name.length < 2) return "Minimum 2 characters are required.";
  return "";
};

export const validateEmail = (email: string): string => {
  if (!email) return "Email is required.";
  if (!emailRegex.test(email)) return "Email is invalid.";
  return "";
};

export const validatePassword = (password: string): string => {
  if (!password) return "Password is required.";
  if (password.length < 8) return "Minimum 8 characters are required.";
  if (!passwordRegex.test(password))
    return "At least one digit and one capital letter is required.";
  return "";
};

export const validateConfirmPassword = (
  confirmPassword: string,
  password: string,
): string => {
  if (!confirmPassword) return "Confirm Password is required.";
  if (confirmPassword !== password) return "Passwords don't match.";
  return "";
};

export const validatePhone = (value: string, primaryPhone?: string): string => {
  const isEmergency = primaryPhone !== undefined;
  if (isEmergency && !value) return "";
  if (!value) return "Phone is required.";
  if (!phoneRegex.test(value)) return "Invalid phone format.";
  if (isEmergency && value === primaryPhone)
    return "Emergency contact must be different from the primary contact number.";
  return "";
};

export const validateDob = (dob: Date): string => {
  const inputDate = new Date(dob);
  const today = new Date();
  inputDate.setHours(0, 0, 0, 0);
  today.setHours(0, 0, 0, 0);
  if (inputDate.getTime() === today.getTime()) return "DOB is required.";
  if (inputDate > today) return "Future dates are not allowed.";
  return "";
};

export const validateAddress = (value: string): string => {
  if (!value) return "Address is required.";
  if (!addressRegex.test(value)) return "Address field is invalid.";
  return "";
};

export const validateRequired = (value: string, fieldName: string): string => {
  if (!value) return `${fieldName} is required.`;
  return "";
};


export const maxDobLimit = (): Date => new Date();

export const minDobLimit = (): Date => {
  const d = new Date();
  d.setFullYear(d.getFullYear() - 100);
  return d;
};
