import { useEffect, useState } from 'react';
import { Alert } from 'react-native';
import { router } from 'expo-router';

import {
  PatientProfileFormData,
  ProfileValidationErrors,
} from '@/types/patient.types';

import {
  validateProfileForm,
  hasProfileValidationErrors,
  normalizeProfileFormData,
} from '@/validations/profile.validation';

import {
  getPatientProfile,
  updatePatientProfile,
} from '@/services/patient.service';

import { logout } from '@/services/auth.service';

// ─── Sanitizers ────────────────────────────────────────────────────────────────

export const sanitizeNumericInput = (
  value: string,
  maximumLength: number
): string => value.replace(/[^0-9]/g, '').slice(0, maximumLength);

export const sanitizeAlphabeticInput = (
  value: string,
  maximumLength: number
): string =>
  value
    .replace(/[^A-Za-z ]/g, '')
    .replace(/\s{2,}/g, ' ')
    .slice(0, maximumLength);

// ─── Initial form state ────────────────────────────────────────────────────────

const initialFormData: PatientProfileFormData = {
  firstName: '',
  lastName: '',
  phone: '',
  gender: '',
  dob: '',
  bloodGroup: '',
  address: {
    city: '',
    state: '',
    pincode: '',
  },
  emergencyContactName: '',
  emergencyContactPhone: '',
};

// ─── Hook ──────────────────────────────────────────────────────────────────────

export const useProfileForm = () => {
  const [profile, setProfile] = useState<any>(null);
  const [formData, setFormData] =
    useState<PatientProfileFormData>(initialFormData);
  const [errors, setErrors] =
    useState<ProfileValidationErrors>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    void fetchProfile();
  }, []);

  // ── Helpers ─────────────────────────────────────────────────────────────────

  const buildFormData = (
    data: any
  ): PatientProfileFormData => ({
    firstName: data?.firstName || '',
    lastName: data?.lastName || '',
    phone: data?.phone || '',
    gender: data?.gender || '',
    dob: data?.dob ? data.dob.split('T')[0] : '',
    bloodGroup: data?.bloodGroup || '',
    address: {
      city: data?.address?.city || '',
      state: data?.address?.state || '',
      pincode: data?.address?.pincode || '',
    },
    emergencyContactName: data?.emergencyContactName || '',
    emergencyContactPhone: data?.emergencyContactPhone || '',
  });

  // ── Fetch ────────────────────────────────────────────────────────────────────

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const data = await getPatientProfile();
      setProfile(data);
      setFormData(buildFormData(data));
    } catch (error: any) {
      Alert.alert(
        'Error',
        error?.response?.data?.message ||
          error?.message ||
          'Unable to load profile'
      );
    } finally {
      setLoading(false);
    }
  };

  // ── Field change handlers ────────────────────────────────────────────────────

  const handleChange = (
    field: keyof Omit<PatientProfileFormData, 'address'>,
    value: string
  ) => {
    let sanitized = value;

    switch (field) {
      case 'firstName':
      case 'lastName':
        sanitized = sanitizeAlphabeticInput(value, 30);
        break;
      case 'emergencyContactName':
        sanitized = sanitizeAlphabeticInput(value, 50);
        break;
      case 'phone':
      case 'emergencyContactPhone':
        sanitized = sanitizeNumericInput(value, 10);
        break;
      default:
        sanitized = value;
    }

    setFormData((prev) => ({ ...prev, [field]: sanitized }));

    setErrors((prev) => {
      const updated = { ...prev, [field]: undefined };
      // First and last name depend on each other so clear both together
      if (field === 'firstName' || field === 'lastName') {
        updated.firstName = undefined;
        updated.lastName = undefined;
      }
      return updated;
    });
  };

  const handleAddressChange = (
    field: keyof PatientProfileFormData['address'],
    value: string
  ) => {
    let sanitized = value;
    if (field === 'city') sanitized = sanitizeAlphabeticInput(value, 50);
    else if (field === 'pincode') sanitized = sanitizeNumericInput(value, 6);
    // state comes from dropdown — no sanitization needed

    setFormData((prev) => ({
      ...prev,
      address: { ...prev.address, [field]: sanitized },
    }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  // ── Dropdown / picker setters ────────────────────────────────────────────────

  const setFieldValue = (
    field: keyof Omit<PatientProfileFormData, 'address'>,
    value: string
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const setStateValue = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      address: { ...prev.address, state: value },
    }));
    setErrors((prev) => ({ ...prev, state: undefined }));
  };

  // ── Save ─────────────────────────────────────────────────────────────────────

  const handleSaveProfile = async () => {
    const normalizedFormData = normalizeProfileFormData(formData);
    const validationErrors = validateProfileForm(normalizedFormData);

    const normalizedFirst = normalizedFormData.firstName.toLowerCase();
    const normalizedLast = normalizedFormData.lastName.toLowerCase();

    if (
      normalizedFirst &&
      normalizedLast &&
      normalizedFirst === normalizedLast
    ) {
      validationErrors.lastName =
        'First name and last name cannot be the same';
    }

    setFormData(normalizedFormData);
    setErrors(validationErrors);

    if (hasProfileValidationErrors(validationErrors)) {
      return;
    }

    try {
      setSaving(true);
      const updatedProfile =
        await updatePatientProfile(normalizedFormData);
      setProfile(updatedProfile);
      setFormData(buildFormData(updatedProfile));
      setIsEditing(false);
      setErrors({});
      Alert.alert('Success', 'Profile updated successfully');
      await fetchProfile();
    } catch (error: any) {
      Alert.alert(
        'Error',
        error?.response?.data?.message || 'Unable to update profile'
      );
    } finally {
      setSaving(false);
    }
  };

  // ── Cancel ───────────────────────────────────────────────────────────────────

  const handleCancelEdit = () => {
    if (!profile) return;
    setFormData(buildFormData(profile));
    setErrors({});
    setIsEditing(false);
  };

  // ── Logout ───────────────────────────────────────────────────────────────────

  const handleLogout = async () => {
    await logout();
    router.replace('/');
  };

  return {
    // State
    profile,
    formData,
    errors,
    loading,
    saving,
    isEditing,
    setIsEditing,
    // Handlers
    handleChange,
    handleAddressChange,
    setFieldValue,
    setStateValue,
    handleSaveProfile,
    handleCancelEdit,
    handleLogout,
  };
};