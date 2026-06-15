import {
  ScrollView,
  Text,
  TouchableOpacity,
  Alert,
  StyleSheet,
  View,
} from "react-native";
import { useEffect, useState } from "react";
import {
  isPhone,
  isPincode,
  onlyLetters,
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

// --- helpers extracted outside the component ---

type FieldRule = {
  required?: string;
  check?: (v: string) => boolean;
  message?: string;
};

/** Returns the first error message for a value, or undefined if valid. */
function validateField(value: string, rules: FieldRule[]): string | undefined {
  for (const rule of rules) {
    if (rule.required !== undefined && !value.trim()) return rule.required;
    if (rule.check && !rule.check(value)) return rule.message;
  }
  return undefined;
}

/** Splits a comma-separated string into a trimmed array. */
function splitCSV(value: string): string[] {
  return value ? value.split(",").map((s) => s.trim()) : [];
}

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

  useEffect(() => { loadProfile(); }, []);

  const loadProfile = async () => {
    try {
      const response = await getProfile();
      const profile = response.data.data;

      if (profile.dateOfBirth) setDateOfBirth(profile.dateOfBirth.split("T")[0]);
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
 

  const validateForm = (): boolean => {
  
    const fieldRules: [string, string, FieldRule[]][] = [
      ["dateOfBirth", dateOfBirth, [
        { required: "Date of birth is required" },
        { check: (v) => !futureDate(v), message: "Date of birth cannot be in future" },
      ]],
      ["gender",        gender,        [{ required: "Please select gender" }]],
      ["bloodGroup",    bloodGroup,    [{ required: "Please select blood group" }]],
      ["maritalStatus", maritalStatus, [{ required: "Please select marital status" }]],
      ["address",  address,  [
        { required: "Address is required" },
        { check: (v) => v.length >= 10, message: "Minimum 10 characters required" },
      ]],
      ["city",    city,    [{ required: "City is required" },    { check: onlyLetters, message: "Only letters allowed" }]],
      ["state",   state,   [{ required: "State is required" },   { check: onlyLetters, message: "Only letters allowed" }]],
      ["country", country, [{ required: "Country is required" }, { check: onlyLetters, message: "Only letters allowed" }]],
      ["pincode", pincode, [
        { required: "Pincode is required" },
        { check: isPincode, message: "Enter valid 6 digit pincode" },
      ]],
      ["emergencyContactName", emergencyContactName, [
        { required: "Contact name is required" },
        { check: onlyLetters, message: "Only letters allowed" },
      ]],
      ["emergencyContactPhone", emergencyContactPhone, [
        { required: "Phone number is required" },
        { check: isPhone, message: "Enter valid phone number" },
      ]],
      ["relationship", relationship, [{ required: "Relationship is required" }]],
    ];

    const newErrors: any = {};
    for (const [key, value, rules] of fieldRules) {
      const error = validateField(value, rules);
      if (error) newErrors[key] = error;
    }

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
        allergies:          splitCSV(allergies),
        chronicDiseases:    splitCSV(chronicDiseases),
        currentMedications: splitCSV(currentMedications),
        pastSurgeries:      splitCSV(pastSurgeries),
      });

      Alert.alert("Profile updated successfully");
      navigation.goBack();
    } catch {
      Alert.alert("Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  const clearError = (key: string) =>
    setErrors((prev: any) => ({ ...prev, [key]: "" }));

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 50 }}>
        <Text style={styles.title}>Edit Profile</Text>
        <Text style={styles.subtitle}>Complete your healthcare profile information.</Text>

        <GlassCard>
          <Text style={styles.section}>Personal Details</Text>
          <TouchableOpacity onPress={() => setShowDatePicker(true)} style={styles.dateButton}>
            <Text style={styles.dateText}>{dateOfBirth || "Select Date of Birth"}</Text>
          </TouchableOpacity>
          {errors.dateOfBirth && <Text style={styles.errorText}>{errors.dateOfBirth}</Text>}

          {showDatePicker && (
            <DateTimePicker
              mode="date"
              value={dateOfBirth ? new Date(dateOfBirth) : new Date()}
              maximumDate={new Date()}
              onChange={(_, selectedDate) => {
                setShowDatePicker(false);
                if (selectedDate) setDateOfBirth(selectedDate.toISOString().split("T")[0]);
              }}
            />
          )}

          <ChipSelector label="Gender" options={["MALE", "FEMALE", "OTHER"]} selectedValue={gender} onSelect={setGender} />
          {errors.gender && <Text style={styles.chipError}>{errors.gender}</Text>}

          <ChipSelector label="Blood Group" options={["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"]} selectedValue={bloodGroup} onSelect={setBloodGroup} />
          {errors.bloodGroup && <Text style={styles.chipError}>{errors.bloodGroup}</Text>}

          <ChipSelector label="Marital Status" options={["SINGLE", "MARRIED", "DIVORCED"]} selectedValue={maritalStatus} onSelect={setMaritalStatus} />
          {errors.maritalStatus && <Text style={styles.chipError}>{errors.maritalStatus}</Text>}
        </GlassCard>

        <GlassCard>
          <Text style={styles.section}>Address Details</Text>
          {(["address", "city", "state", "country"] as const).map((field) => (
            <AppInput
              key={field}
              label={field.charAt(0).toUpperCase() + field.slice(1)}
              value={{ address, city, state, country }[field]}
              onChangeText={(v) => {
                ({ address: setAddress, city: setCity, state: setState, country: setCountry }[field])(v);
                clearError(field);
              }}
              error={errors[field]}
            />
          ))}
          <AppInput
            label="Pincode"
            value={pincode}
            keyboardType="number-pad"
            onChangeText={(v) => { setPincode(v); clearError("pincode"); }}
            error={errors.pincode}
          />
        </GlassCard>

        <GlassCard>
          <Text style={styles.section}>Emergency Contact</Text>
          <AppInput label="Contact Name" value={emergencyContactName}
            onChangeText={(v) => { setEmergencyContactName(v); clearError("emergencyContactName"); }}
            error={errors.emergencyContactName} />
          <AppInput label="Phone Number" value={emergencyContactPhone} keyboardType="phone-pad"
            onChangeText={(v) => { setEmergencyContactPhone(v); clearError("emergencyContactPhone"); }}
            error={errors.emergencyContactPhone} />
          <AppInput label="Relationship" value={relationship}
            onChangeText={(v) => { setRelationship(v); clearError("relationship"); }}
            error={errors.relationship} />
        </GlassCard>

        <PrimaryButton title="Save Changes" loading={loading} onPress={handleSave} />
        <View style={{ height: 50 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container:   { flex: 1, backgroundColor: "#F4F7FC", paddingHorizontal: 20 },
  title:       { fontSize: 30, fontWeight: "800", color: "#0F172A", marginTop: 20 },
  subtitle:    { color: "#64748B", marginTop: 8, marginBottom: 25, lineHeight: 22 },
  section:     { fontSize: 18, fontWeight: "700", color: "#0F172A", marginBottom: 18 },
  dateButton:  { height: 56, justifyContent: "center", paddingHorizontal: 16, backgroundColor: "#FFFFFF", borderRadius: 16, borderWidth: 1, borderColor: "#E2E8F0", marginBottom: 20 },
  dateText:    { color: "#334155" },
  errorText:   { color: "#EF4444", fontSize: 12, marginTop: 6, marginBottom: 10 },
  chipError:   { color: "#EF4444", fontSize: 12, marginTop: -10, marginBottom: 12 },
});