/**
 * @file PatientForm.tsx
 * @overview A comprehensive form for patient registration and profile updates.
 * @description This component uses `react-hook-form` and `yup` for robust form management and validation.
 * It can be configured for both registration (create mode) and profile editing (edit mode),
 * conditionally showing/hiding fields like passwords.
 * - PATIENTFORM.TSX -> RegisterScreen.tsx
 * @connections
 * - Parent Screen (`RegisterScreen` or `ProfileScreen`) -> Renders `PATIENTFORM.TSX` with `initialValues`, `onSubmit` callback, and `isEditMode` flag.
 * - `PATIENTFORM.TSX` -> `useForm` hook with `yupResolver` -> `getPatientValidationSchema()` from `patientValidations.ts` to get validation rules.
 * - User fills form -> State is managed by `react-hook-form` via `FormInput` and other controlled components.
 * - User Submits -> `handleSubmit(onSubmit)` -> `react-hook-form` validates data -> If valid, calls the `onSubmit` prop provided by the parent screen.
 */
import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
} from "react-native";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import PhoneInput from "react-native-phone-number-input";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Picker } from "@react-native-picker/picker";
import { Feather } from "@expo/vector-icons";

import FormInput from "../components/FormInput";
import { getPatientValidationSchema } from "../validations/patientValidations";

interface PatientFormProps {
  initialValues: any;
  onSubmit: (data: any) => void | Promise<void>;
  isLoading: boolean;
  buttonText: string;
  isEditMode?: boolean;
}

function PatientForm(props: Readonly<PatientFormProps>) {
  const {
    initialValues,
    onSubmit,
    isLoading,
    buttonText,
    isEditMode = false,
  } = props;
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(getPatientValidationSchema(isEditMode)),
    defaultValues: initialValues,
  });

  return (
    <View style={styles.formContainer}>
      <FormInput
        name="name"
        placeholder="Full Name"
        control={control}
        error={errors.name}
        isDisabled={isEditMode}
      />
      <FormInput
        name="email"
        placeholder="Email Address"
        control={control}
        error={errors.email}
        isDisabled={isEditMode}
        keyboardType="email-address"
        autoCapitalize="none"
      />

      {/* Phone Field */}
      <Controller
        control={control}
        name="phone"
        render={({ field: { onChange, value } }) => (
          <View
            style={[styles.phoneWrapper, errors.phone && styles.inputError]}
          >
            <PhoneInput
              defaultCode="IN"
              layout="first"
              onChangeFormattedText={onChange}
              value={value ? value.replace(/^\+?91/, "").trim() : ""}
              containerStyle={styles.phoneContainer}
              textContainerStyle={styles.phoneTextContainer}
              disableArrowIcon
              countryPickerProps={{ countryCodes: ["IN"], withFilter: false }}
              textInputProps={{ keyboardType: "number-pad", maxLength: 10 }}
            />
          </View>
        )}
      />
      {errors.phone && (
        <Text style={styles.errorText}>{errors.phone.message as string}</Text>
      )}

      {/* Creation Mode Only Fields */}
      {!isEditMode && (
        <>
          <Controller
            control={control}
            name="password"
            render={({ field: { onChange, onBlur, value } }) => (
              <View
                style={[
                  styles.passwordWrapper,
                  errors.password && styles.inputError,
                ]}
              >
                <TextInput
                  style={styles.passwordInput}
                  placeholder="Password"
                  placeholderTextColor="#9CA3AF"
                  secureTextEntry={!showPassword}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  value={value}
                  autoCapitalize="none"
                />
                <TouchableOpacity
                  style={styles.eyeIcon}
                  onPress={() => setShowPassword(!showPassword)}
                >
                  <Feather
                    name={showPassword ? "eye" : "eye-off"}
                    size={20}
                    color="#9CA3AF"
                  />
                </TouchableOpacity>
              </View>
            )}
          />
          {errors.password && (
            <Text style={styles.errorText}>
              {errors.password.message as string}
            </Text>
          )}
          <Controller
            control={control}
            name="confirmPassword"
            render={({ field: { onChange, onBlur, value } }) => (
              <View
                style={[
                  styles.passwordWrapper,
                  errors.confirmPassword && styles.inputError,
                ]}
              >
                <TextInput
                  style={styles.passwordInput}
                  placeholder="Confirm Password"
                  placeholderTextColor="#9CA3AF"
                  secureTextEntry={!showConfirmPassword}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  value={value}
                  autoCapitalize="none"
                />
                <TouchableOpacity
                  style={styles.eyeIcon}
                  onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  <Feather
                    name={showConfirmPassword ? "eye" : "eye-off"}
                    size={20}
                    color="#9CA3AF"
                  />
                </TouchableOpacity>
              </View>
            )}
          />
          {errors.confirmPassword && (
            <Text style={styles.errorText}>
              {errors.confirmPassword.message as string}
            </Text>
          )}
        </>
      )}

      {/* Gender Picker */}
      <Controller
        control={control}
        name="gender"
        render={({ field: { onChange, value } }) => (
          <View style={styles.pickerWrapper}>
            <Picker
              selectedValue={value}
              onValueChange={onChange}
              style={styles.picker}
            >
              <Picker.Item label="Gender" color="#9CA3AF" />
              <Picker.Item label="Male" value="Male" />
              <Picker.Item label="Female" value="Female" />
              <Picker.Item label="Other" value="Other" />
            </Picker>
          </View>
        )}
      />
      {errors.gender && (
        <Text style={styles.errorText}>{errors.gender.message as string}</Text>
      )}

      {/* Date of Birth Picker */}
      <Controller
        control={control}
        name="dob"
        render={({ field: { onChange, value } }) => (
          <>
            <TouchableOpacity
              style={[
                styles.input,
                errors.dob && styles.inputError,
                styles.dateInput,
              ]}
              onPress={() => setIsDatePickerOpen(true)}
            >
              <Text style={value ? styles.dateText : styles.placeholderText}>
                {value ? new Date(value).toDateString() : "DOB"}
              </Text>
            </TouchableOpacity>
            {isDatePickerOpen && (
              <DateTimePicker
                value={value ? new Date(value) : new Date(2000, 0, 1)}
                mode="date"
                display="default"
                minimumDate={new Date("1926-01-01")}
                maximumDate={new Date()}
                onChange={(event, date) => {
                  setIsDatePickerOpen(false);
                  if (event.type === "set" && date) onChange(date);
                }}
              />
            )}
          </>
        )}
      />
      {errors.dob && (
        <Text style={styles.errorText}>{errors.dob.message as string}</Text>
      )}

      {/* Blood Group Picker */}
      <Controller
        control={control}
        name="bloodGroup"
        render={({ field: { onChange, value } }) => (
          <View style={styles.pickerWrapper}>
            <Picker
              selectedValue={value}
              onValueChange={onChange}
              style={styles.picker}
            >
              <Picker.Item label="Blood Group (Optional)" color="#9CA3AF" />
              <Picker.Item label="A+" value="A+" />
              <Picker.Item label="A-" value="A-" />
              <Picker.Item label="B+" value="B+" />
              <Picker.Item label="B-" value="B-" />
              <Picker.Item label="AB+" value="AB+" />
              <Picker.Item label="AB-" value="AB-" />
              <Picker.Item label="O+" value="O+" />
              <Picker.Item label="O-" value="O-" />
            </Picker>
          </View>
        )}
      />

      <FormInput
        name="allergies"
        placeholder="Allergies (comma separated)"
        control={control}
        error={errors.allergies}
      />

      {/* Emergency Contact Field */}
      <Controller
        control={control}
        name="emergencyContact"
        render={({ field: { onChange, value } }) => (
          <View
            style={[
              styles.phoneWrapper,
              errors.emergencyContact && styles.inputError,
            ]}
          >
            <PhoneInput
              defaultCode="IN"
              layout="first"
              onChangeFormattedText={onChange}
              value={value ? value.replace(/^\+?91/, "").trim() : ""}
              containerStyle={styles.phoneContainer}
              textContainerStyle={styles.phoneTextContainer}
              disableArrowIcon
              countryPickerProps={{ countryCodes: ["IN"], withFilter: false }}
              textInputProps={{
                keyboardType: "number-pad",
                maxLength: 10,
                placeholder: "Emergency Contact",
                placeholderTextColor: "#9CA3AF",
              }}
            />
          </View>
        )}
      />
      {errors.emergencyContact && (
        <Text style={styles.errorText}>
          {errors.emergencyContact.message as string}
        </Text>
      )}

      {/* Address Block */}
      <FormInput
        name="line1"
        placeholder="Address Line 1"
        control={control}
        error={errors.line1}
      />
      <FormInput
        name="line2"
        placeholder="Address Line 2 (Optional)"
        control={control}
        error={errors.line2}
      />
      <FormInput
        name="state"
        placeholder="State"
        control={control}
        error={errors.state}
      />
      <FormInput
        name="pincode"
        placeholder="Pincode (6 digits)"
        control={control}
        error={errors.pincode}
        keyboardType="number-pad"
        maxLength={6}
      />

      {/* Submit Button */}
      <TouchableOpacity
        style={[styles.button, isLoading && styles.buttonDisabled]}
        onPress={handleSubmit((validatedData) => onSubmit(validatedData))}
        disabled={isLoading}
      >
        {isLoading ? (
          <ActivityIndicator color="#ffffff" />
        ) : (
          <Text style={styles.buttonText}>{buttonText}</Text>
        )}
      </TouchableOpacity>
    </View>
  );
}

export default React.memo(PatientForm);

const styles = StyleSheet.create({
  formContainer: { width: "100%" },
  input: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    fontSize: 16,
    color: "#1E1E3F",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },

  passwordWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  passwordInput: {
    flex: 1,
    padding: 16,
    fontSize: 16,
    color: "#1E1E3F",
  },
  eyeIcon: {
    padding: 16,
  },

  inputError: { borderColor: "#ef4444", borderWidth: 1 },
  errorText: {
    color: "#ef4444",
    fontSize: 12,
    marginBottom: 12,
    marginTop: -10,
    marginLeft: 8,
  },
  phoneWrapper: {
    marginBottom: 16,
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  phoneContainer: { width: "100%", backgroundColor: "#ffffff", height: 55 },
  phoneTextContainer: {
    backgroundColor: "#ffffff",
    paddingVertical: 0,
    borderLeftWidth: 1,
    borderColor: "#F3F4F6",
  },
  pickerWrapper: {
    borderRadius: 16,
    marginBottom: 16,
    backgroundColor: "#ffffff",
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  picker: { height: 55, width: "100%", color: "#1E1E3F" },
  dateInput: { justifyContent: "center" },
  dateText: { fontSize: 16, color: "#1E1E3F", fontFamily: "Lexend" },
  placeholderText: { fontSize: 16, color: "#9CA3AF", fontFamily: "Lexend" },
  button: {
    backgroundColor: "#4B1D76",
    padding: 18,
    borderRadius: 30,
    alignItems: "center",
    marginTop: 10,
    shadowColor: "#4B1D76",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  buttonDisabled: { backgroundColor: "#8b5cf6" },
  buttonText: { color: "#ffffff", fontSize: 16, fontWeight: "bold" },
  TextInput: { fontFamily: "Lexend" },
});
