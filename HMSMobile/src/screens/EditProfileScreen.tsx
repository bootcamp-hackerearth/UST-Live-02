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

type ProfileErrors = Record<string, string>;

const removeEmptyErrors = (errors: ProfileErrors) =>
  Object.fromEntries(
    Object.entries(errors).filter(([, message]) => Boolean(message)),
  );

const getDateOfBirthError = (value: string) => {
  if (!value) {
    return "Date of birth is required";
  }

  return futureDate(value) ? "Date of birth cannot be in future" : "";
};

const getRequiredSelectionError = (value: string, message: string) =>
  value ? "" : message;

const getAddressError = (value: string) => {
  const trimmedValue = value.trim();

  if (!trimmedValue) {
    return "Address is required";
  }

  if (trimmedValue.length < 10) {
    return "Minimum 10 characters required";
  }

  return maxLength(trimmedValue, 200)
    ? ""
    : "Maximum 200 characters allowed";
};

const getLettersFieldError = (
  value: string,
  requiredMessage: string,
  maxLengthMessage: string,
) => {
  const trimmedValue = value.trim();

  if (!trimmedValue) {
    return requiredMessage;
  }

  if (!onlyLetters(value)) {
    return "Only letters allowed";
  }

  return maxLength(trimmedValue, 50) ? "" : maxLengthMessage;
};

const getPincodeError = (value: string) => {
  if (!value.trim()) {
    return "Pincode is required";
  }

  return isPincode(value) ? "" : "Enter valid 6 digit pincode";
};

const getEmergencyPhoneError = (value: string) => {
  if (!value.trim()) {
    return "Phone number is required";
  }

  return isPhone(value) ? "" : "Enter valid phone number";
};

const toCommaSeparatedList = (value: string) =>
  value ? value.split(",").map((item) => item.trim()) : [];

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
    const newErrors = removeEmptyErrors({
      dateOfBirth: getDateOfBirthError(dateOfBirth),
      gender: getRequiredSelectionError(gender, "Please select gender"),
      bloodGroup: getRequiredSelectionError(
        bloodGroup,
        "Please select blood group",
      ),
      maritalStatus: getRequiredSelectionError(
        maritalStatus,
        "Please select marital status",
      ),
      address: getAddressError(address),
      city: getLettersFieldError(
        city,
        "City is required",
        "Maximum 50 characters allowed",
      ),
      state: getLettersFieldError(
        state,
        "State is required",
        "Maximum 50 characters allowed",
      ),
      country: getLettersFieldError(
        country,
        "Country is required",
        "Maximum 50 characters allowed",
      ),
      pincode: getPincodeError(pincode),
      emergencyContactName: getLettersFieldError(
        emergencyContactName,
        "Contact name is required",
        "Maximum 50 characters allowed",
      ),
      emergencyContactPhone: getEmergencyPhoneError(emergencyContactPhone),
      relationship: getLettersFieldError(
        relationship,
        "Relationship is required",
        "Maximum 50 characters allowed",
      ),
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
        allergies: toCommaSeparatedList(allergies),
        chronicDiseases: toCommaSeparatedList(chronicDiseases),
        currentMedications: toCommaSeparatedList(currentMedications),
        pastSurgeries: toCommaSeparatedList(pastSurgeries),
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
