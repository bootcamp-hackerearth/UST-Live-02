import {
  PatientProfileFormData,
  ProfileValidationErrors,
} from '@/types/patient.types';

const nameRegex = /^[A-Za-z ]{2,30}$/;
const phoneRegex = /^[6-9]\d{9}$/;
const pincodeRegex = /^\d{6}$/;

const validateName = (
  value: string,
  requiredMessage: string,
  invalidMessage: string
) => {
  const trimmedValue = value.trim();

  if (!trimmedValue) {
    return requiredMessage;
  }

  if (!nameRegex.test(trimmedValue)) {
    return invalidMessage;
  }

  return '';
};

const validatePhone = (
  value: string,
  requiredMessage: string,
  invalidMessage: string
) => {
  const trimmedValue = value.trim();

  if (!trimmedValue) {
    return requiredMessage;
  }

  if (!phoneRegex.test(trimmedValue)) {
    return invalidMessage;
  }

  return '';
};

const validateRequired = (value: string, message: string) => {
  if (!value.trim()) {
    return message;
  }

  return '';
};

const validateDob = (dob: string) => {
  const trimmedDob = dob.trim();

  if (!trimmedDob) {
    return 'Date of birth is required';
  }

  const dobDate = new Date(trimmedDob);
  const today = new Date();

  if (Number.isNaN(dobDate.getTime()) || dobDate >= today) {
    return 'Enter a valid date of birth';
  }

  return '';
};

const validatePincode = (pincode: string) => {
  const trimmedPincode = pincode.trim();

  if (!trimmedPincode) {
    return 'Pincode is required';
  }

  if (!pincodeRegex.test(trimmedPincode)) {
    return 'Enter a valid 6-digit pincode';
  }

  return '';
};

const validateEmergencyPhoneDifferent = (
  phone: string,
  emergencyPhone: string
) => {
  const trimmedPhone = phone.trim();
  const trimmedEmergencyPhone = emergencyPhone.trim();

  if (
    trimmedPhone &&
    trimmedEmergencyPhone &&
    trimmedPhone === trimmedEmergencyPhone
  ) {
    return 'Emergency contact number should be different';
  }

  return '';
};

const addErrorIfExists = (
  errors: ProfileValidationErrors,
  field: keyof ProfileValidationErrors,
  errorMessage: string
) => {
  if (errorMessage) {
    errors[field] = errorMessage;
  }
};

export const validateProfileForm = (
  formData: PatientProfileFormData
): ProfileValidationErrors => {
  const errors: ProfileValidationErrors = {};

  addErrorIfExists(
    errors,
    'firstName',
    validateName(
      formData.firstName,
      'First name is required',
      'Enter a valid first name'
    )
  );

  addErrorIfExists(
    errors,
    'lastName',
    validateName(
      formData.lastName,
      'Last name is required',
      'Enter a valid last name'
    )
  );

  addErrorIfExists(
    errors,
    'phone',
    validatePhone(
      formData.phone,
      'Phone number is required',
      'Enter a valid 10-digit mobile number'
    )
  );

  addErrorIfExists(
    errors,
    'gender',
    validateRequired(formData.gender, 'Gender is required')
  );

  addErrorIfExists(errors, 'dob', validateDob(formData.dob));

  addErrorIfExists(
    errors,
    'bloodGroup',
    validateRequired(formData.bloodGroup, 'Blood group is required')
  );

  addErrorIfExists(
    errors,
    'city',
    validateRequired(formData.address.city, 'City is required')
  );

  addErrorIfExists(
    errors,
    'state',
    validateRequired(formData.address.state, 'State is required')
  );

  addErrorIfExists(
    errors,
    'pincode',
    validatePincode(formData.address.pincode)
  );

  addErrorIfExists(
    errors,
    'emergencyContactName',
    validateName(
      formData.emergencyContactName,
      'Emergency contact name is required',
      'Enter a valid emergency contact name'
    )
  );

  addErrorIfExists(
    errors,
    'emergencyContactPhone',
    validatePhone(
      formData.emergencyContactPhone,
      'Emergency contact phone is required',
      'Enter a valid emergency contact number'
    )
  );

  addErrorIfExists(
    errors,
    'emergencyContactPhone',
    validateEmergencyPhoneDifferent(
      formData.phone,
      formData.emergencyContactPhone
    )
  );

  return errors;
};

export const hasProfileValidationErrors = (
  errors: ProfileValidationErrors
): boolean => Object.keys(errors).length > 0;