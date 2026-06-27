import {
  ScrollView,
  Text,
  TouchableOpacity,
  Alert,
  View,
  StyleSheet,
} from "react-native";

import { useEffect, useState } from "react";
import {
  isPhone,
  isPincode,
  onlyLetters,
  futureDate,
  maxLength,
} from "../../src/utils/validators";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useNavigation } from "@react-navigation/native";
import { getProfile, updateProfile } from "../../src/services/patient.service";
import { SafeAreaView } from "react-native-safe-area-context";

import GlassCard from "../../src/components/cards/GlassCard";
import PrimaryButton from "../../src/components/buttons/PrimaryButton";
import AppInput from "../../src/components/inputs/AppInput";

import ChipSelector from "../../src/components/selectors/ChipSelector";

// --- Field validators (extracted to keep validateForm's cognitive complexity low) ---

const validateDateOfBirth = (value: string): string | null => {
  if (!value) return "Date of birth is required";
  if (futureDate(value)) return "Date of birth cannot be in future";
  return null;
};

const validateRequiredSelection = (
  value: string,
  label: string
): string | null => {
  if (!value) return `Please select ${label}`;
  return null;
};

const validateAddress = (value: string): string | null => {
  const trimmed = value.trim();
  if (!trimmed) return "Address is required";
  if (trimmed.length < 10) return "Minimum 10 characters required";
  if (!maxLength(trimmed, 200)) return "Maximum 200 characters allowed";
  return null;
};

const validateLettersField = (
  value: string,
  label: string,
  max: number
): string | null => {
  const trimmed = value.trim();
  if (!trimmed) return `${label} is required`;
  if (!onlyLetters(value)) return "Only letters allowed";
  if (!maxLength(trimmed, max)) return `Maximum ${max} characters allowed`;
  return null;
};

const validatePincode = (value: string): string | null => {
  const trimmed = value.trim();
  if (!trimmed) return "Pincode is required";
  if (!isPincode(value)) return "Enter valid 6 digit pincode";
  return null;
};

const validatePhone = (value: string): string | null => {
  const trimmed = value.trim();
  if (!trimmed) return "Phone number is required";
  if (!isPhone(value)) return "Enter valid phone number";
  return null;
};

export default function EditProfile() {
  const navigation = useNavigation<any>();

  const [showDatePicker, setShowDatePicker] = useState(false);

  const [dateOfBirth, setDateOfBirth] = useState("");

  const [gender, setGender] = useState("");

  const [bloodGroup, setBloodGroup] = useState("");

  const [maritalStatus, setMaritalStatus] = useState("");

  const [address, setAddress] = useState("");

  const [city, setCity] = useState("");

  const [state, setState] = useState("");

  const [country, setCountry] = useState("");

  const [pincode, setPincode] = useState("");

  const [emergencyContactName, setEmergencyContactName] = useState("");

  const [emergencyContactPhone, setEmergencyContactPhone] = useState("");

  const [relationship, setRelationship] = useState("");
  const [allergies, setAllergies] = useState("");

  const [chronicDiseases, setChronicDiseases] = useState("");

  const [currentMedications, setCurrentMedications] = useState("");

  const [pastSurgeries, setPastSurgeries] = useState("");
  const [errors, setErrors] = useState<any>({});

  const [loading, setLoading] = useState(false);
  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const response = await getProfile();

      const profile = response.data.data;

      if (profile.dateOfBirth) {
        setDateOfBirth(profile.dateOfBirth.split("T")[0]);
      }

      setGender(profile.gender || "");

      setBloodGroup(profile.bloodGroup || "");

      setMaritalStatus(profile.maritalStatus || "");

      setAddress(profile.address || "");

      setCity(profile.city || "");

      setState(profile.state || "");

      setCountry(profile.country || "");

      setPincode(profile.pincode || "");

      setEmergencyContactName(profile.emergencyContactName || "");

      setEmergencyContactPhone(profile.emergencyContactPhone || "");

      setRelationship(profile.relationship || "");
      setAllergies(profile.allergies?.join(", ") || "");

      setChronicDiseases(profile.chronicDiseases?.join(", ") || "");

      setCurrentMedications(profile.currentMedications?.join(", ") || "");

      setPastSurgeries(profile.pastSurgeries?.join(", ") || "");
    } catch {
      Alert.alert("Failed to load profile");
    }
  };

  const validateForm = () => {
    const newErrors: any = {};

    const fieldChecks: Record<string, string | null> = {
      dateOfBirth: validateDateOfBirth(dateOfBirth),
      gender: validateRequiredSelection(gender, "gender"),
      bloodGroup: validateRequiredSelection(bloodGroup, "blood group"),
      maritalStatus: validateRequiredSelection(maritalStatus, "marital status"),
      address: validateAddress(address),
      city: validateLettersField(city, "City", 50),
      state: validateLettersField(state, "State", 50),
      country: validateLettersField(country, "Country", 50),
      pincode: validatePincode(pincode),
      emergencyContactName: validateLettersField(
        emergencyContactName,
        "Contact name",
        50
      ),
      emergencyContactPhone: validatePhone(emergencyContactPhone),
      relationship: validateLettersField(relationship, "Relationship", 50),
    };

    Object.entries(fieldChecks).forEach(([field, error]) => {
      if (error) {
        newErrors[field] = error;
      }
    });

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      await updateProfile({
        dateOfBirth,
        gender,
        bloodGroup,
        maritalStatus,
        address: address.trim(),
        city: city.trim(),
        state: state.trim(),
        country: country.trim(),
        pincode,
        emergencyContactName: emergencyContactName.trim(),
        emergencyContactPhone,
        relationship: relationship.trim(),
        allergies: allergies ? allergies.split(",").map((s) => s.trim()) : [],
        chronicDiseases: chronicDiseases
          ? chronicDiseases.split(",").map((s) => s.trim())
          : [],
        currentMedications: currentMedications
          ? currentMedications.split(",").map((s) => s.trim())
          : [],
        pastSurgeries: pastSurgeries
          ? pastSurgeries.split(",").map((s) => s.trim())
          : [],
      });

      Alert.alert("Profile updated successfully");
      navigation.goBack();
    } catch {
      Alert.alert("Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingBottom: 50,
        }}
      >
        <Text style={styles.title}>Edit Profile</Text>

        <Text style={styles.subtitle}>
          Complete your healthcare profile information.
        </Text>

        <GlassCard>
          <Text style={styles.section}>Personal Details</Text>

          <TouchableOpacity
            onPress={() => setShowDatePicker(true)}
            style={styles.dateButton}
          >
            <Text style={styles.dateText}>
              {dateOfBirth || "Select Date of Birth"}
            </Text>
          </TouchableOpacity>
          {errors.dateOfBirth && (
            <Text
              style={{
                color: "#EF4444",
                fontSize: 12,
                marginTop: 6,
                marginBottom: 10,
              }}
            >
              {errors.dateOfBirth}
            </Text>
          )}

          {showDatePicker && (
            <DateTimePicker
              mode="date"
              value={dateOfBirth ? new Date(dateOfBirth) : new Date()}
              maximumDate={new Date()}
              onChange={(event, selectedDate) => {
                setShowDatePicker(false);

                if (selectedDate) {
                  setDateOfBirth(selectedDate.toISOString().split("T")[0]);
                }
              }}
            />
          )}

          <ChipSelector
            label="Gender"
            options={["MALE", "FEMALE", "OTHER"]}
            selectedValue={gender}
            onSelect={setGender}
          />
          {errors.gender && (
            <Text
              style={{
                color: "#EF4444",
                fontSize: 12,
                marginTop: -10,
                marginBottom: 12,
              }}
            >
              {errors.gender}
            </Text>
          )}
          <ChipSelector
            label="Blood Group"
            options={["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"]}
            selectedValue={bloodGroup}
            onSelect={setBloodGroup}
          />
          {errors.bloodGroup && (
            <Text
              style={{
                color: "#EF4444",
                fontSize: 12,
                marginTop: -10,
                marginBottom: 12,
              }}
            >
              {errors.bloodGroup}
            </Text>
          )}

          <ChipSelector
            label="Marital Status"
            options={["SINGLE", "MARRIED", "DIVORCED"]}
            selectedValue={maritalStatus}
            onSelect={setMaritalStatus}
          />
          {errors.maritalStatus && (
            <Text
              style={{
                color: "#EF4444",
                fontSize: 12,
                marginTop: -10,
                marginBottom: 12,
              }}
            >
              {errors.maritalStatus}
            </Text>
          )}
        </GlassCard>
        <GlassCard>
          <Text style={styles.section}>Address Details</Text>

          <AppInput
            label="Address"
            value={address}
            maxLength={200}
            onChangeText={(value) => {
              setAddress(value);

              setErrors({
                ...errors,
                address: "",
              });
            }}
            error={errors.address}
          />

          <AppInput
            label="City"
            value={city}
            maxLength={50}
            onChangeText={(value) => {
              setCity(value.replace(/[^A-Za-z ]/g, ""));

              setErrors({
                ...errors,
                city: "",
              });
            }}
            error={errors.city}
          />

          <AppInput
            label="State"
            value={state}
            maxLength={50}
            onChangeText={(value) => {
              setState(value.replace(/[^A-Za-z ]/g, ""));

              setErrors({
                ...errors,
                state: "",
              });
            }}
            error={errors.state}
          />

          <AppInput
            label="Country"
            value={country}
            maxLength={50}
            onChangeText={(value) => {
              setCountry(value.replace(/[^A-Za-z ]/g, ""));

              setErrors({
                ...errors,
                country: "",
              });
            }}
            error={errors.country}
          />

          <AppInput
            label="Pincode"
            value={pincode}
            maxLength={6}
            keyboardType="number-pad"
            onChangeText={(value) => {
              setPincode(value.replace(/\D/g, "").slice(0, 6));

              setErrors({
                ...errors,
                pincode: "",
              });
            }}
            error={errors.pincode}
          />
        </GlassCard>

        <GlassCard>
          <Text style={styles.section}>Emergency Contact</Text>
          <AppInput
            label="Contact Name"
            value={emergencyContactName}
            maxLength={50}
            onChangeText={(value) => {
              setEmergencyContactName(value.replace(/[^A-Za-z ]/g, ""));

              setErrors({
                ...errors,
                emergencyContactName: "",
              });
            }}
            error={errors.emergencyContactName}
          />

          <AppInput
            label="Phone Number"
            value={emergencyContactPhone}
            maxLength={10}
            keyboardType="phone-pad"
            onChangeText={(value) => {
              setEmergencyContactPhone(value.replace(/\D/g, "").slice(0, 10));

              setErrors({
                ...errors,
                emergencyContactPhone: "",
              });
            }}
            error={errors.emergencyContactPhone}
          />

          <AppInput
            label="Relationship"
            value={relationship}
            maxLength={50}
            onChangeText={(value) => {
              setRelationship(value.replace(/[^A-Za-z ]/g, ""));

              setErrors({
                ...errors,
                relationship: "",
              });
            }}
            error={errors.relationship}
          />
        </GlassCard>
        <PrimaryButton
          title="Save Changes"
          loading={loading}
          onPress={handleSave}
        />

        <View
          style={{
            height: 50,
          }}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F4F7FC",
    paddingHorizontal: 20,
  },

  title: {
    fontSize: 30,
    fontWeight: "800",
    color: "#0F172A",
    marginTop: 20,
  },

  subtitle: {
    color: "#64748B",
    marginTop: 8,
    marginBottom: 25,
    lineHeight: 22,
  },

  section: {
    fontSize: 18,
    fontWeight: "700",
    color: "#0F172A",
    marginBottom: 18,
  },

  dateButton: {
    height: 56,
    justifyContent: "center",
    paddingHorizontal: 16,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    marginBottom: 20,
  },

  dateText: {
    color: "#334155",
  },
});