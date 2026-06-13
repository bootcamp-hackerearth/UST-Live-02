import {
  PatientProfileFormData,
  ProfileValidationErrors,
} from '@/types/patient.types';

const alphabetOnlyRegex = /^[A-Za-z]+(?: [A-Za-z]+)*$/;
const phoneRegex = /^[6-9][0-9]{9}$/;
const pincodeRegex = /^[1-9][0-9]{5}$/;
const dateRegex = /^\d{4}-\d{2}-\d{2}$/;

const validGenders = ['MALE', 'FEMALE', 'OTHER'];

const validBloodGroups = [
  'A+',
  'A-',
  'B+',
  'B-',
  'AB+',
  'AB-',
  'O+',
  'O-',
];

const INDIAN_STATES = [
  'Andhra Pradesh',
  'Arunachal Pradesh',
  'Assam',
  'Bihar',
  'Chhattisgarh',
  'Goa',
  'Gujarat',
  'Haryana',
  'Himachal Pradesh',
  'Jharkhand',
  'Karnataka',
  'Kerala',
  'Madhya Pradesh',
  'Maharashtra',
  'Manipur',
  'Meghalaya',
  'Mizoram',
  'Nagaland',
  'Odisha',
  'Punjab',
  'Rajasthan',
  'Sikkim',
  'Tamil Nadu',
  'Telangana',
  'Tripura',
  'Uttar Pradesh',
  'Uttarakhand',
  'West Bengal',
  'Andaman and Nicobar Islands',
  'Chandigarh',
  'Dadra and Nagar Haveli and Daman and Diu',
  'Delhi',
  'Jammu and Kashmir',
  'Ladakh',
  'Lakshadweep',
  'Puducherry',
];

const cleanAlphabeticText = (value: string): string =>
  value.trim().replace(/\s+/g, ' ');

export const normalizeProfileFormData = (
  formData: PatientProfileFormData
): PatientProfileFormData => ({
  firstName: cleanAlphabeticText(formData.firstName),
  lastName: cleanAlphabeticText(formData.lastName),
  phone: formData.phone.trim(),
  gender: formData.gender.trim().toUpperCase(),
  dob: formData.dob.trim(),
  bloodGroup: formData.bloodGroup.trim().toUpperCase(),

  address: {
    city: cleanAlphabeticText(formData.address.city),
    // State comes from dropdown — preserve casing, just trim whitespace
    state: formData.address.state.trim(),
    pincode: formData.address.pincode.trim(),
  },

  emergencyContactName: cleanAlphabeticText(
    formData.emergencyContactName
  ),

  emergencyContactPhone:
    formData.emergencyContactPhone.trim(),
});

const validateAlphabeticField = (
  value: string,
  fieldName: string,
  minimumLength: number,
  maximumLength: number
): string | undefined => {
  if (!value) {
    return `${fieldName} is required`;
  }

  if (!alphabetOnlyRegex.test(value)) {
    return `${fieldName} must contain alphabets and spaces only`;
  }

  if (
    value.length < minimumLength ||
    value.length > maximumLength
  ) {
    return `${fieldName} must be between ${minimumLength} and ${maximumLength} characters`;
  }

  return undefined;
};

const isValidDateOfBirth = (dob: string): boolean => {
  if (!dateRegex.test(dob)) {
    return false;
  }

  const [year, month, day] = dob.split('-').map(Number);
  const dobDate = new Date(year, month - 1, day);

  return (
    dobDate.getFullYear() === year &&
    dobDate.getMonth() === month - 1 &&
    dobDate.getDate() === day
  );
};

export const validateProfileForm = (
  originalFormData: PatientProfileFormData
): ProfileValidationErrors => {
  const errors: ProfileValidationErrors = {};

  const formData = normalizeProfileFormData(originalFormData);

  // ── First name ──────────────────────────────────────────────────────────────

  const firstNameError = validateAlphabeticField(
    formData.firstName,
    'First name',
    2,
    30
  );

  if (firstNameError) {
    errors.firstName = firstNameError;
  }

  // ── Last name ───────────────────────────────────────────────────────────────

  const lastNameError = validateAlphabeticField(
    formData.lastName,
    'Last name',
    2,
    30
  );

  if (lastNameError) {
    errors.lastName = lastNameError;
  }

  /*
   * Compare the normalized names only when both names
   * have passed their individual validations.
   */
  if (
    !errors.firstName &&
    !errors.lastName &&
    formData.firstName.toLowerCase() ===
      formData.lastName.toLowerCase()
  ) {
    errors.lastName =
      'First name and last name cannot be the same';
  }

  // ── Phone ───────────────────────────────────────────────────────────────────

  if (!formData.phone) {
    errors.phone = 'Phone number is required';
  } else if (!phoneRegex.test(formData.phone)) {
    errors.phone =
      'Phone number must contain 10 digits and start with 6, 7, 8 or 9';
  }

  // ── Gender (from dropdown — must be one of the valid values) ────────────────

  if (!formData.gender) {
    errors.gender = 'Please select a gender';
  } else if (!validGenders.includes(formData.gender)) {
    errors.gender = 'Please select a valid gender';
  }

  // ── DOB (from date picker — future dates blocked at picker level too) ────────

  if (!formData.dob) {
    errors.dob = 'Date of birth is required';
  } else if (!isValidDateOfBirth(formData.dob)) {
    errors.dob = 'Date must use the YYYY-MM-DD format';
  } else {
    const [year, month, day] =
      formData.dob.split('-').map(Number);

    const dobDate = new Date(year, month - 1, day);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const oldestAllowedDate = new Date(today);
    oldestAllowedDate.setFullYear(today.getFullYear() - 120);

    if (dobDate > today) {
      errors.dob = 'Date of birth cannot be in the future';
    } else if (dobDate < oldestAllowedDate) {
      errors.dob = 'Age cannot be more than 120 years';
    }
  }

  // ── Blood group (from dropdown) ─────────────────────────────────────────────

  if (!formData.bloodGroup) {
    errors.bloodGroup = 'Please select a blood group';
  } else if (!validBloodGroups.includes(formData.bloodGroup)) {
    errors.bloodGroup = 'Please select a valid blood group';
  }

  // ── City ────────────────────────────────────────────────────────────────────

  const cityError = validateAlphabeticField(
    formData.address.city,
    'City',
    2,
    50
  );

  if (cityError) {
    errors.city = cityError;
  }

  // ── State (from dropdown — must be a recognised Indian state/UT) ────────────

  if (!formData.address.state) {
    errors.state = 'Please select a state';
  } else if (!INDIAN_STATES.includes(formData.address.state)) {
    errors.state = 'Please select a valid Indian state or UT';
  }

  // ── Pincode ─────────────────────────────────────────────────────────────────

  if (!formData.address.pincode) {
    errors.pincode = 'Pincode is required';
  } else if (!pincodeRegex.test(formData.address.pincode)) {
    errors.pincode =
      'Pincode must contain exactly 6 digits and cannot start with 0';
  }

  // ── Emergency contact name ──────────────────────────────────────────────────

  const emergencyNameError = validateAlphabeticField(
    formData.emergencyContactName,
    'Emergency contact name',
    2,
    50
  );

  if (emergencyNameError) {
    errors.emergencyContactName = emergencyNameError;
  }

  // ── Emergency contact phone ─────────────────────────────────────────────────

  if (!formData.emergencyContactPhone) {
    errors.emergencyContactPhone =
      'Emergency contact phone is required';
  } else if (!phoneRegex.test(formData.emergencyContactPhone)) {
    errors.emergencyContactPhone =
      'Emergency contact number must contain 10 digits and start with 6, 7, 8 or 9';
  }

  if (
    phoneRegex.test(formData.phone) &&
    phoneRegex.test(formData.emergencyContactPhone) &&
    formData.phone === formData.emergencyContactPhone
  ) {
    errors.emergencyContactPhone =
      'Emergency contact number must be different from the patient phone number';
  }

  return errors;
};

export const hasProfileValidationErrors = (
  errors: ProfileValidationErrors
): boolean => Object.keys(errors).length > 0;