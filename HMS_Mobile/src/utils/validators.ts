export const isEmail = (value: string): boolean => {
  const email = value.trim();
  const atIndex = email.indexOf("@");
  const lastAtIndex = email.lastIndexOf("@");
  const domainStart = atIndex + 1;
  const dotAfterAt = email.indexOf(".", domainStart);

  return (
    email.length <= 254 &&
    atIndex > 0 &&
    atIndex === lastAtIndex &&
    dotAfterAt > domainStart &&
    dotAfterAt < email.length - 1 &&
    !email.includes(" ")
  );
};

export const isPhone = (value: string): boolean => {
  return /^[6-9]\d{9}$/.test(value.trim());
};

export const isPincode = (value: string): boolean => {
  return /^\d{6}$/.test(value.trim());
};

export const onlyLetters = (value: string): boolean => {
  return /^[A-Za-z\s'-]+$/.test(value.trim());
};

export const strongPassword = (value: string): boolean => {
  return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/.test(value);
};

export const futureDate = (date: string): boolean => {
  return new Date(date) > new Date();
};

export const maxLength = (value: string, length: number): boolean => {
  return value.length <= length;
};

export const minLength = (value: string, length: number): boolean => {
  return value.length >= length;
};

export const isRequired = (value: string): boolean => {
  return value.trim().length > 0;
};

export const isValidName = (value: string): boolean => {
  return /^[A-Za-z\s'-]{2,50}$/.test(value.trim());
};

export const isValidAddress = (value: string): boolean => {
  return value.trim().length >= 5;
};

export const isValidAge = (date: string): boolean => {
  const dob = new Date(date);

  const today = new Date();

  let age = today.getFullYear() - dob.getFullYear();

  const month = today.getMonth() - dob.getMonth();

  if (month < 0 || (month === 0 && today.getDate() < dob.getDate())) {
    age--;
  }

  return age >= 0;
};

export const isEmptyArray = (value: any[]): boolean => {
  return value.length === 0;
};
