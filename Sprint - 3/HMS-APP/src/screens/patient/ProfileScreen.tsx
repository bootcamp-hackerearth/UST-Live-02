import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  TextInput,
  Modal,
  FlatList,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';

import {
  PatientProfileFormData,
  ProfileValidationErrors,
} from '@/types/patient.types';

import { profileStyles as styles } from '@/styles/patient/profile.style';
import { useProfileForm } from '../../hooks/useProfileForm';
import { useProfileDropdowns } from '../../hooks/useProfileDropdowns';

// ─── Constants ────────────────────────────────────────────────────────────────

const BLOOD_GROUPS = [
  'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-',
];

const GENDERS = ['MALE', 'FEMALE', 'OTHER'];

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

// ─── Date helpers ─────────────────────────────────────────────────────────────

const TODAY = new Date();
TODAY.setHours(0, 0, 0, 0);

const OLDEST_ALLOWED = new Date(TODAY);
OLDEST_ALLOWED.setFullYear(TODAY.getFullYear() - 120);

const formatDateToString = (date: Date): string => {
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
};

const parseDateString = (value: string): Date | null => {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const [year, month, day] = value.split('-').map(Number);
  const d = new Date(year, month - 1, day);
  if (
    d.getFullYear() !== year ||
    d.getMonth() !== month - 1 ||
    d.getDate() !== day
  )
    return null;
  return d;
};

// ─── DropdownModal ─────────────────────────────────────────────────────────────

interface DropdownModalProps {
  visible: boolean;
  title: string;
  options: string[];
  selectedValue: string;
  onSelect: (value: string) => void;
  onClose: () => void;
  searchable?: boolean;
}

const DropdownModal = ({
  visible,
  title,
  options,
  selectedValue,
  onSelect,
  onClose,
  searchable = false,
}: DropdownModalProps) => {
  const [searchQuery, setSearchQuery] = React.useState('');

  const filteredOptions = searchable
    ? options.filter((o) =>
        o.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : options;

  const handleClose = () => {
    setSearchQuery('');
    onClose();
  };

  const handleSelect = (value: string) => {
    setSearchQuery('');
    onSelect(value);
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={handleClose}
    >
      <TouchableOpacity
        style={styles.overlay}
        activeOpacity={1}
        onPress={handleClose}
      >
        <View
          style={styles.sheet}
          onStartShouldSetResponder={() => true}
        >
          <View style={styles.sheetHeader}>
            <Text style={styles.sheetTitle}>{title}</Text>
            <TouchableOpacity
              onPress={handleClose}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Ionicons name="close" size={22} color="#64748B" />
            </TouchableOpacity>
          </View>

          {searchable && (
            <View style={styles.searchContainer}>
              <Ionicons
                name="search"
                size={16}
                color="#94A3B8"
                style={{ marginRight: 8 }}
              />
              <TextInput
                style={styles.searchInput}
                placeholder="Search..."
                value={searchQuery}
                onChangeText={setSearchQuery}
                autoCorrect={false}
                clearButtonMode="while-editing"
              />
            </View>
          )}

          <FlatList
            data={filteredOptions}
            keyExtractor={(item) => item}
            style={styles.optionList}
            keyboardShouldPersistTaps="handled"
            renderItem={({ item }) => {
              const isSelected = item === selectedValue;
              return (
                <TouchableOpacity
                  style={[
                    styles.optionItem,
                    isSelected ? styles.optionItemSelected : undefined,
                  ]}
                  onPress={() => handleSelect(item)}
                >
                  <Text
                    style={[
                      styles.optionText,
                      isSelected ? styles.optionTextSelected : undefined,
                    ]}
                  >
                    {item}
                  </Text>
                  {isSelected && (
                    <Ionicons name="checkmark" size={18} color="#2563EB" />
                  )}
                </TouchableOpacity>
              );
            }}
            ListEmptyComponent={
              <Text style={styles.emptyText}>No results found</Text>
            }
          />
        </View>
      </TouchableOpacity>
    </Modal>
  );
};

// ─── DropdownRow ───────────────────────────────────────────────────────────────

interface DropdownRowProps {
  label: string;
  value: string;
  placeholder: string;
  onPress: () => void;
  error?: string;
}

const DropdownRow = ({
  label,
  value,
  placeholder,
  onPress,
  error,
}: DropdownRowProps) => (
  <View style={styles.editRow}>
    <Text style={styles.editLabel}>{label}</Text>
    <TouchableOpacity
      style={[
        styles.dropdownButton,
        error ? styles.dropdownButtonError : undefined,
      ]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Text
        style={
          value ? styles.dropdownValueText : styles.dropdownPlaceholderText
        }
      >
        {value || placeholder}
      </Text>
      <Ionicons name="chevron-down" size={16} color="#94A3B8" />
    </TouchableOpacity>
    {error ? <Text style={styles.errorText}>{error}</Text> : null}
  </View>
);

// ─── DatePickerRow ─────────────────────────────────────────────────────────────

interface DatePickerRowProps {
  label: string;
  value: string; // YYYY-MM-DD
  onChange: (dateString: string) => void;
  error?: string;
}

const DatePickerRow = ({
  label,
  value,
  onChange,
  error,
}: DatePickerRowProps) => {
  const [showPicker, setShowPicker] = React.useState(false);

  const selectedDate = parseDateString(value) ?? TODAY;

  const handleChange = (_: any, date?: Date) => {
    if (Platform.OS === 'android') setShowPicker(false);
    if (date) onChange(formatDateToString(date));
  };

  return (
    <View style={styles.editRow}>
      <Text style={styles.editLabel}>{label}</Text>
      <TouchableOpacity
        style={[
          styles.dropdownButton,
          error ? styles.dropdownButtonError : undefined,
        ]}
        onPress={() => setShowPicker(true)}
        activeOpacity={0.7}
      >
        <Text
          style={
            value ? styles.dropdownValueText : styles.dropdownPlaceholderText
          }
        >
          {value
            ? new Date(
                selectedDate.getFullYear(),
                selectedDate.getMonth(),
                selectedDate.getDate()
              ).toDateString()
            : 'Select date of birth'}
        </Text>
        <Ionicons name="calendar-outline" size={16} color="#94A3B8" />
      </TouchableOpacity>
      {error ? <Text style={styles.errorText}>{error}</Text> : null}

      {showPicker && (
        <>
          {Platform.OS === 'ios' ? (
            <Modal
              visible
              transparent
              animationType="slide"
              onRequestClose={() => setShowPicker(false)}
            >
              <TouchableOpacity
                style={styles.overlay}
                activeOpacity={1}
                onPress={() => setShowPicker(false)}
              >
                <View
                  style={styles.datePickerSheet}
                  onStartShouldSetResponder={() => true}
                >
                  <View style={styles.sheetHeader}>
                    <Text style={styles.sheetTitle}>Date of Birth</Text>
                    <TouchableOpacity onPress={() => setShowPicker(false)}>
                      <Text style={styles.sheetDoneText}>Done</Text>
                    </TouchableOpacity>
                  </View>
                  <DateTimePicker
                    value={selectedDate}
                    mode="date"
                    display="spinner"
                    maximumDate={TODAY}
                    minimumDate={OLDEST_ALLOWED}
                    onChange={handleChange}
                    style={{ width: '100%' }}
                  />
                </View>
              </TouchableOpacity>
            </Modal>
          ) : (
            <DateTimePicker
              value={selectedDate}
              mode="date"
              display="default"
              maximumDate={TODAY}
              minimumDate={OLDEST_ALLOWED}
              onChange={handleChange}
            />
          )}
        </>
      )}
    </View>
  );
};

// ─── InfoRow ───────────────────────────────────────────────────────────────────

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

// ─── EditRow ───────────────────────────────────────────────────────────────────

const EditRow = ({
  label,
  value,
  onChangeText,
  placeholder,
  keyboardType = 'default',
  autoCapitalize = 'sentences',
  maxLength,
  error,
}: {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  placeholder?: string;
  keyboardType?: 'default' | 'number-pad' | 'phone-pad';
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  maxLength?: number;
  error?: string;
}) => (
  <View style={styles.editRow}>
    <Text style={styles.editLabel}>{label}</Text>
    <TextInput
      style={[
        styles.editInput,
        error ? styles.editInputError : undefined,
      ]}
      value={value}
      onChangeText={onChangeText}
      placeholder={placeholder || label}
      keyboardType={keyboardType}
      autoCapitalize={autoCapitalize}
      autoCorrect={false}
      maxLength={maxLength}
    />
    {error ? <Text style={styles.errorText}>{error}</Text> : null}
  </View>
);

// ─── Screen ────────────────────────────────────────────────────────────────────

export default function ProfileScreen() {
  const {
    profile,
    formData,
    errors,
    loading,
    saving,
    isEditing,
    setIsEditing,
    handleChange,
    handleAddressChange,
    setFieldValue,
    setStateValue,
    handleSaveProfile,
    handleCancelEdit,
    handleLogout,
  } = useProfileForm();

  const {
    showBloodGroupPicker,
    showGenderPicker,
    showStatePicker,
    openBloodGroupPicker,
    openGenderPicker,
    openStatePicker,
    closeBloodGroupPicker,
    closeGenderPicker,
    closeStatePicker,
  } = useProfileDropdowns();

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#2563EB" />
      </View>
    );
  }

  if (!profile) {
    return (
      <View style={styles.centered}>
        <Text>Unable to display profile.</Text>
      </View>
    );
  }

  return (
    <>
      <ScrollView
        style={styles.container}
        keyboardShouldPersistTaps="handled"
      >
        {/* ── Header ── */}
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
                    errors.firstName ? styles.editInputError : undefined,
                  ]}
                  value={formData.firstName}
                  onChangeText={(v) => handleChange('firstName', v)}
                  placeholder="First name"
                  autoCapitalize="words"
                  autoCorrect={false}
                  maxLength={30}
                />
                {errors.firstName ? (
                  <Text style={styles.errorText}>{errors.firstName}</Text>
                ) : null}
              </View>

              <View style={{ flex: 1 }}>
                <TextInput
                  style={[
                    styles.nameInput,
                    errors.lastName ? styles.editInputError : undefined,
                  ]}
                  value={formData.lastName}
                  onChangeText={(v) => handleChange('lastName', v)}
                  placeholder="Last name"
                  autoCapitalize="words"
                  autoCorrect={false}
                  maxLength={30}
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

          <Text style={styles.uhid}>
            UHID: {profile.UHID || profile.uhid || 'N/A'}
          </Text>
        </View>

        {/* ── Personal Info Card ── */}
        <View style={styles.card}>
          <InfoRow icon="mail" label="Email" value={profile.email || 'N/A'} />

          {isEditing ? (
            <>
              <EditRow
                label="Phone"
                value={formData.phone}
                onChangeText={(v) => handleChange('phone', v)}
                keyboardType="phone-pad"
                maxLength={10}
                error={errors.phone}
              />

              <DropdownRow
                label="Blood Group"
                value={formData.bloodGroup}
                placeholder="Select blood group"
                onPress={openBloodGroupPicker}
                error={errors.bloodGroup}
              />

              <DropdownRow
                label="Gender"
                value={formData.gender}
                placeholder="Select gender"
                onPress={openGenderPicker}
                error={errors.gender}
              />

              <DatePickerRow
                label="Date of Birth"
                value={formData.dob}
                onChange={(v) => setFieldValue('dob', v)}
                error={errors.dob}
              />
            </>
          ) : (
            <>
              <InfoRow icon="call" label="Phone" value={profile.phone || 'N/A'} />
              <InfoRow icon="water" label="Blood Group" value={profile.bloodGroup || 'N/A'} />
              <InfoRow icon="person" label="Gender" value={profile.gender || 'N/A'} />
              <InfoRow
                icon="calendar"
                label="DOB"
                value={
                  profile.dob
                    ? new Date(profile.dob).toDateString()
                    : 'N/A'
                }
              />
            </>
          )}
        </View>

        {/* ── Address Card ── */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Address</Text>

          {isEditing ? (
            <>
              <EditRow
                label="City"
                value={formData.address.city}
                onChangeText={(v) => handleAddressChange('city', v)}
                autoCapitalize="words"
                maxLength={50}
                error={errors.city}
              />

              <DropdownRow
                label="State"
                value={formData.address.state}
                placeholder="Select state"
                onPress={openStatePicker}
                error={errors.state}
              />

              <EditRow
                label="Pincode"
                value={formData.address.pincode}
                onChangeText={(v) => handleAddressChange('pincode', v)}
                keyboardType="number-pad"
                maxLength={6}
                error={errors.pincode}
              />
            </>
          ) : (
            <>
              <InfoRow icon="location" label="City" value={profile.address?.city || 'N/A'} />
              <InfoRow icon="map" label="State" value={profile.address?.state || 'N/A'} />
              <InfoRow icon="pin" label="Pincode" value={profile.address?.pincode || 'N/A'} />
            </>
          )}
        </View>

        {/* ── Emergency Contact Card ── */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Emergency Contact</Text>

          {isEditing ? (
            <>
              <EditRow
                label="Name"
                value={formData.emergencyContactName}
                onChangeText={(v) =>
                  handleChange('emergencyContactName', v)
                }
                autoCapitalize="words"
                maxLength={50}
                error={errors.emergencyContactName}
              />
              <EditRow
                label="Phone"
                value={formData.emergencyContactPhone}
                onChangeText={(v) =>
                  handleChange('emergencyContactPhone', v)
                }
                keyboardType="phone-pad"
                maxLength={10}
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

        {/* ── Action Buttons ── */}
        {isEditing ? (
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
        ) : (
          <TouchableOpacity
            style={styles.editButton}
            onPress={() => setIsEditing(true)}
          >
            <Text style={styles.editButtonText}>Edit Profile</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity
          style={styles.logoutButton}
          onPress={handleLogout}
          disabled={saving}
        >
          <Text style={styles.logoutButtonText}>Logout</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* ── Modals (outside ScrollView to avoid clipping) ── */}

      <DropdownModal
        visible={showBloodGroupPicker}
        title="Select Blood Group"
        options={BLOOD_GROUPS}
        selectedValue={formData.bloodGroup}
        onSelect={(v) => {
          setFieldValue('bloodGroup', v);
          closeBloodGroupPicker();
        }}
        onClose={closeBloodGroupPicker}
      />

      <DropdownModal
        visible={showGenderPicker}
        title="Select Gender"
        options={GENDERS}
        selectedValue={formData.gender}
        onSelect={(v) => {
          setFieldValue('gender', v);
          closeGenderPicker();
        }}
        onClose={closeGenderPicker}
      />

      <DropdownModal
        visible={showStatePicker}
        title="Select State"
        options={INDIAN_STATES}
        selectedValue={formData.address.state}
        onSelect={(v) => {
          setStateValue(v);
          closeStatePicker();
        }}
        onClose={closeStatePicker}
        searchable
      />
    </>
  );
}