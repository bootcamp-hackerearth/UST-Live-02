import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  TextInput,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import {
  PatientProfileFormData,
  ProfileValidationErrors,
} from '@/types/patient.types';

import {
  validateProfileForm,
  hasProfileValidationErrors,
} from '@/validations/profile.validation';

import {
  getPatientProfile,
  updatePatientProfile,
} from '@/services/patient.service';

import { logout } from '@/services/auth.service';
import { profileStyles as styles } from '@/styles/patient/profile.style';

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

export default function ProfileScreen() {
  const [profile, setProfile] = useState<any>(null);
  const [formData, setFormData] = useState<PatientProfileFormData>(initialFormData);
  const [errors, setErrors] = useState<ProfileValidationErrors>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const buildFormData = (data: any): PatientProfileFormData => ({
    firstName: data.firstName || '',
    lastName: data.lastName || '',
    phone: data.phone || '',
    gender: data.gender || '',
    dob: data.dob ? data.dob.split('T')[0] : '',
    bloodGroup: data.bloodGroup || '',
    address: {
      city: data.address?.city || '',
      state: data.address?.state || '',
      pincode: data.address?.pincode || '',
    },
    emergencyContactName: data.emergencyContactName || '',
    emergencyContactPhone: data.emergencyContactPhone || '',
  });

  const fetchProfile = async () => {
    try {
      setLoading(true);

      const data = await getPatientProfile();

      setProfile(data);
      setFormData(buildFormData(data));
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Unable to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (
    field: keyof Omit<PatientProfileFormData, 'address'>,
    value: string
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    setErrors((prev) => ({
      ...prev,
      [field]: undefined,
    }));
  };

  const handleAddressChange = (
    field: keyof PatientProfileFormData['address'],
    value: string
  ) => {
    setFormData((prev) => ({
      ...prev,
      address: {
        ...prev.address,
        [field]: value,
      },
    }));

    setErrors((prev) => ({
      ...prev,
      [field]: undefined,
    }));
  };

  const handleSaveProfile = async () => {
    const validationErrors = validateProfileForm(formData);
    setErrors(validationErrors);

    if (hasProfileValidationErrors(validationErrors)) {
      return;
    }

    try {
      setSaving(true);

      const updatedProfile = await updatePatientProfile(formData);

      setProfile(updatedProfile);
      setFormData(buildFormData(updatedProfile));
      setIsEditing(false);
      setErrors({});

      Alert.alert('Success', 'Profile updated successfully');
      await fetchProfile();
    } catch (error: any) {
      console.log('Update profile error:', error?.response?.data || error);

      Alert.alert(
        'Error',
        error?.response?.data?.message || 'Unable to update profile'
      );
    } finally {
      setSaving(false);
    }
  };

  const handleCancelEdit = () => {
    if (!profile) return;

    setFormData(buildFormData(profile));
    setErrors({});
    setIsEditing(false);
  };

  const handleLogout = async () => {
    await logout();
    router.replace('/');
  };

  const renderProfileActions = () => {
    if (isEditing) {
      return (
        <View style={styles.editActionRow}>
          <TouchableOpacity
            style={styles.cancelEditButton}
            onPress={handleCancelEdit}
            disabled={saving}
          >
            <Text style={styles.cancelEditButtonText}>Cancel</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.saveButton}
            onPress={handleSaveProfile}
            disabled={saving}
          >
            {saving ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Text style={styles.saveButtonText}>Save Changes</Text>
            )}
          </TouchableOpacity>
        </View>
      );
    }

    return (
      <TouchableOpacity
        style={styles.editButton}
        onPress={() => setIsEditing(true)}
      >
        <Text style={styles.editButtonText}>Edit Profile</Text>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#2563EB" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Ionicons name="person" size={50} color="#fff" />
        </View>

        {isEditing ? (
          <View style={styles.nameEditRow}>
            <View style={{ flex: 1 }}>
              <TextInput
                style={[
                  styles.nameInput,
                  errors.firstName && styles.editInputError,
                ]}
                value={formData.firstName}
                onChangeText={(value) => handleChange('firstName', value)}
                placeholder="First name"
              />
              {errors.firstName ? (
                <Text style={styles.errorText}>{errors.firstName}</Text>
              ) : null}
            </View>

            <View style={{ flex: 1 }}>
              <TextInput
                style={[
                  styles.nameInput,
                  errors.lastName && styles.editInputError,
                ]}
                value={formData.lastName}
                onChangeText={(value) => handleChange('lastName', value)}
                placeholder="Last name"
              />
              {errors.lastName ? (
                <Text style={styles.errorText}>{errors.lastName}</Text>
              ) : null}
            </View>
          </View>
        ) : (
          <Text style={styles.name}>
            {profile.firstName} {profile.lastName}
          </Text>
        )}

        <Text style={styles.uhid}>UHID: {profile.UHID}</Text>
      </View>

      <View style={styles.card}>
        <InfoRow icon="mail" label="Email" value={profile.email || 'N/A'} />

        {isEditing ? (
          <>
            <EditRow
              label="Phone"
              value={formData.phone}
              onChangeText={(value) => handleChange('phone', value)}
              keyboardType="phone-pad"
              error={errors.phone}
            />

            <EditRow
              label="Blood Group"
              value={formData.bloodGroup}
              onChangeText={(value) => handleChange('bloodGroup', value)}
              error={errors.bloodGroup}
            />

            <EditRow
              label="Gender"
              value={formData.gender}
              onChangeText={(value) => handleChange('gender', value)}
              error={errors.gender}
            />

            <EditRow
              label="DOB"
              value={formData.dob}
              onChangeText={(value) => handleChange('dob', value)}
              placeholder="YYYY-MM-DD"
              error={errors.dob}
            />
          </>
        ) : (
          <>
            <InfoRow icon="call" label="Phone" value={profile.phone || 'N/A'} />
            <InfoRow
              icon="water"
              label="Blood Group"
              value={profile.bloodGroup || 'N/A'}
            />
            <InfoRow icon="person" label="Gender" value={profile.gender || 'N/A'} />
            <InfoRow
              icon="calendar"
              label="DOB"
              value={profile.dob ? new Date(profile.dob).toDateString() : 'N/A'}
            />
          </>
        )}
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Address</Text>

        {isEditing ? (
          <>
            <EditRow
              label="City"
              value={formData.address.city}
              onChangeText={(value) => handleAddressChange('city', value)}
              error={errors.city}
            />

            <EditRow
              label="State"
              value={formData.address.state}
              onChangeText={(value) => handleAddressChange('state', value)}
              error={errors.state}
            />

            <EditRow
              label="Pincode"
              value={formData.address.pincode}
              onChangeText={(value) => handleAddressChange('pincode', value)}
              keyboardType="number-pad"
              error={errors.pincode}
            />
          </>
        ) : (
          <>
            <InfoRow
              icon="location"
              label="City"
              value={profile.address?.city || 'N/A'}
            />
            <InfoRow
              icon="map"
              label="State"
              value={profile.address?.state || 'N/A'}
            />
            <InfoRow
              icon="pin"
              label="Pincode"
              value={profile.address?.pincode || 'N/A'}
            />
          </>
        )}
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Emergency Contact</Text>

        {isEditing ? (
          <>
            <EditRow
              label="Name"
              value={formData.emergencyContactName}
              onChangeText={(value) =>
                handleChange('emergencyContactName', value)
              }
              error={errors.emergencyContactName}
            />

            <EditRow
              label="Phone"
              value={formData.emergencyContactPhone}
              onChangeText={(value) =>
                handleChange('emergencyContactPhone', value)
              }
              keyboardType="phone-pad"
              error={errors.emergencyContactPhone}
            />
          </>
        ) : (
          <>
            <InfoRow
              icon="person"
              label="Name"
              value={profile.emergencyContactName || 'N/A'}
            />
            <InfoRow
              icon="call"
              label="Phone"
              value={profile.emergencyContactPhone || 'N/A'}
            />
          </>
        )}
      </View>
      {renderProfileActions()}
      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutButtonText}>Logout</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const InfoRow = ({
  icon,
  label,
  value,
}: {
  icon: any;
  label: string;
  value: string;
}) => (
  <View style={styles.infoRow}>
    <Ionicons name={icon} size={18} color="#64748B" />
    <Text style={styles.infoLabel}>{label}</Text>
    <Text style={styles.infoValue}>{value || 'N/A'}</Text>
  </View>
);

const EditRow = ({
  label,
  value,
  onChangeText,
  placeholder,
  keyboardType = 'default',
  error,
}: {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  placeholder?: string;
  keyboardType?: 'default' | 'number-pad' | 'phone-pad';
  error?: string;
}) => (
  <View style={styles.editRow}>
    <Text style={styles.editLabel}>{label}</Text>

    <TextInput
      style={[styles.editInput, error && styles.editInputError]}
      value={value}
      onChangeText={onChangeText}
      placeholder={placeholder || label}
      keyboardType={keyboardType}
    />

    {error ? <Text style={styles.errorText}>{error}</Text> : null}
  </View>
);