import {
  ScrollView,
  Text,
  TouchableOpacity,
  View,
  StyleSheet,
} from "react-native";

import { useEffect, useState } from "react";
import {
  isPhone,
  isPincode,
  onlyLetters,
  isValidName,
  futureDate,
} from "../../src/utils/validators";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useNavigation } from "@react-navigation/native";
import { getProfile, updateProfile } from "../../src/services/patient.service";
import { SafeAreaView } from "react-native-safe-area-context";
import GlassCard from "../../src/components/cards/GlassCard";
import PrimaryButton from "../../src/components/buttons/PrimaryButton";
import AppInput from "../../src/components/inputs/AppInput";
import ChipSelector from "../../src/components/selectors/ChipSelector";
import { showToast } from "../services/toast.service";

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
      showToast("Failed to load profile", "error");
    }
  };

  const validateDateOfBirth = () => {
    const errors: any = {};
    if (!dateOfBirth) {
      errors.dateOfBirth = "Date of birth is required";
    } else if (futureDate(dateOfBirth)) {
      errors.dateOfBirth = "Date of birth cannot be in future";
    }
    return errors;
  };

  const validateBasicFields = () => {
    const errors: any = {};
    if (!gender) errors.gender = "Please select gender";
    if (!bloodGroup) errors.bloodGroup = "Please select blood group";
    if (!maritalStatus) errors.maritalStatus = "Please select marital status";
    return errors;
  };

  const validateAddressDetails = () => {
    const errors: any = {};
    if (!address.trim()) {
      errors.address = "Address is required";
    } else if (address.length < 10) {
      errors.address = "Minimum 10 characters required";
    }
    if (!city.trim()) {
      errors.city = "City is required";
    } else if (!onlyLetters(city)) {
      errors.city = "Only letters allowed";
    }
    if (!state.trim()) {
      errors.state = "State is required";
    } else if (!onlyLetters(state)) {
      errors.state = "Only letters allowed";
    }
    if (!country.trim()) {
      errors.country = "Country is required";
    } else if (!onlyLetters(country)) {
      errors.country = "Only letters allowed";
    }
    if (!pincode.trim()) {
      errors.pincode = "Pincode is required";
    } else if (!isPincode(pincode)) {
      errors.pincode = "Enter valid 6 digit pincode";
    }
    return errors;
  };

  const validateEmergencyContact = () => {
    const errors: any = {};
    if (!emergencyContactName.trim()) {
      errors.emergencyContactName = "Contact name is required";
    } else if (!isValidName(emergencyContactName)) {
      errors.emergencyContactName =
        "Use 2-50 letters, spaces, apostrophes or hyphens";
    }
    if (!emergencyContactPhone.trim()) {
      errors.emergencyContactPhone = "Phone number is required";
    } else if (!isPhone(emergencyContactPhone)) {
      errors.emergencyContactPhone = "Enter valid phone number";
    }
    if (!relationship.trim()) {
      errors.relationship = "Relationship is required";
    }
    return errors;
  };

  const validateForm = () => {
    const newErrors = {
      ...validateDateOfBirth(),
      ...validateBasicFields(),
      ...validateAddressDetails(),
      ...validateEmergencyContact(),
    };

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
        address,
        city,
        state,
        country,
        pincode,
        emergencyContactName,
        emergencyContactPhone,
        relationship,
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

      showToast("Profile updated successfully", "success");
      navigation.goBack();
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to update profile";
      showToast(message, "error");
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
            onChangeText={(value) => {
              setCity(value);

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
            onChangeText={(value) => {
              setState(value);

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
            onChangeText={(value) => {
              setCountry(value);

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
            keyboardType="number-pad"
            onChangeText={(value) => {
              setPincode(value);

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
            onChangeText={(value) => {
              setEmergencyContactName(value);

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
            keyboardType="phone-pad"
            onChangeText={(value) => {
              setEmergencyContactPhone(value);

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
            onChangeText={(value) => {
              setRelationship(value);

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
