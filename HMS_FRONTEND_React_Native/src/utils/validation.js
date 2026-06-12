const validateName = (value) => {
  const val = value?.trim() || "";

  if (!val) {
    return "Name is required";
  }

  return /^[A-Za-z ]+$/.test(val) ? "" : "Only alphabets allowed";
};

const validateEmail = (value) => {
  const val = value?.trim() || "";

  if (!val) {
    return "Email is required";
  }

  return /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(val)
    ? ""
    : "Invalid email";
};

const validatePassword = (value) => {
  const val = value?.trim() || "";

  if (!val) {
    return "Password is required";
  }

  return /^(?=.*\d).{8,}$/.test(val)
    ? ""
    : "Minimum 8 characters and 1 number required";
};

const validatePhone = (value, fieldName) => {
  if (!value) {
    return `${fieldName} is required`;
  }

  return /^[6-9]\d{9}$/.test(value)
    ? ""
    : `${fieldName} must be a valid Indian mobile number`;
};

const validateOptionalPhone = (value) => {
  const val = value?.trim() || "";

  if (!val) {
    return "";
  }

  return /^[6-9]\d{9}$/.test(val) ? "" : "Enter valid 10 digit number";
};

const validateCity = (value) => {
  const val = value?.trim() || "";

  if (!val) {
    return "City is required";
  }

  return /^[A-Za-z ]+$/.test(val) ? "" : "Only alphabets allowed";
};

const validateAddress = (value) => {
  const val = value?.trim() || "";

  if (!val) {
    return "Address is required";
  }

  return /^[A-Za-z0-9\s,.-]+$/.test(val) ? "" : "Invalid address";
};

const validatePostcode = (value) => {
  const val = value?.trim() || "";

  if (!val) {
    return "Postcode is required";
  }

  return /^\d{6}$/.test(val) ? "" : "Enter valid 6 digit postcode";
};

const validateDob = (value) => {
  if (!value) {
    return "Date of Birth is required";
  }

  const selectedDate = new Date(value);
  const today = new Date();

  return selectedDate <= today ? "" : "Future date not allowed";
};

export const validateField = (value, fieldName, type) => {
  const val = value?.trim() || "";

  switch (type) {
    case "required":
      return val ? "" : `${fieldName} is required`;

    case "name":
      return validateName(value);

    case "email":
      return validateEmail(value);

    case "password":
      return validatePassword(value);

    case "phone":
      return validatePhone(value, fieldName);

    case "optionalPhone":
      return validateOptionalPhone(value);

    case "city":
      return validateCity(value);

    case "address":
      return validateAddress(value);

    case "postcode":
      return validatePostcode(value);

    case "dob":
      return validateDob(value);

    default:
      return "";
  }
};
