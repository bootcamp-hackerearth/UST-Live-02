import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ImageBackground,
  StatusBar,
} from "react-native";
import { validateField } from "../utils/validation";
import { Ionicons } from "@expo/vector-icons";
import { Picker } from "@react-native-picker/picker";
import DateTimePicker from "@react-native-community/datetimepicker";
import { registerPatient } from "../services/patientApi";

import PropTypes from "prop-types";

const PRIMARY = "#5A1E96";

const SignupScreen = ({ navigation }) => {
  const [form, setForm] = useState({
    email: "",
    password: "",
    name: "",
    phone: "",
    gender: "",
    dob: "",
    bloodGroup: "",
    allergies: "",
    line1: "",
    city: "",
    postcode: "",
    emergencyContact: "",
  });

  const [errors, setErrors] = useState({});
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (key, value) => {
    setForm((prev) => ({
      ...prev,
      [key]: value,
    }));
  };
  const validateForm = () => {
    const newErrors = {
      name: validateField(form.name, "Name", "name"),
      email: validateField(form.email, "Email", "email"),
      password: validateField(form.password, "Password", "password"),
      phone: validateField(form.phone, "Phone", "phone"),
      gender: validateField(form.gender, "Gender", "required"),
      dob: validateField(form.dob, "Date of Birth", "dob"),
      bloodGroup: validateField(form.bloodGroup, "Blood Group", "required"),
      line1: validateField(form.line1, "Address", "address"),
      city: validateField(form.city, "City", "city"),
      postcode: validateField(form.postcode, "Postcode", "postcode"),
      emergencyContact: validateField(
        form.emergencyContact,
        "Emergency Contact",
        "optionalPhone",
      ),
    };

    setErrors(newErrors);

    return Object.values(newErrors).every((error) => error === "");
  };
  const showError = (field) => {
    return errors[field] ? (
      <Text style={styles.error}>{errors[field]}</Text>
    ) : null;
  };

  const handleSignup = async () => {
    if (!validateForm()) return;

    try {
      setLoading(true);

      const body = {
        email: form.email,
        password: form.password,
        name: form.name,
        phone: form.phone,
        gender: form.gender,
        date_of_birth: form.dob,
        bloodGroup: form.bloodGroup,
        allergies: form.allergies
          ? form.allergies.split(",").map((a) => a.trim())
          : [],
        address: {
          line1: form.line1,
          city: form.city,
          postcode: form.postcode,
        },
        emergencyContact: form.emergencyContact,
      };

      console.log("Request Body:", body);
      await registerPatient(body);
      alert("Account created successfully");
      navigation.navigate("Login");
    } catch (error) {
      console.log("Signup Error:", error);
      console.log("Response:", error?.response?.data);

    } finally {
      setLoading(false);
    }
  };

  const handlePhoneInput = (field, value) => {
    const number = value.replace(/\D/g, "");
    if (number.length === 1 && !/[6-9]/.test(number)) {
      return;
    }
    handleChange(field, number);
  };
  return (
    <ImageBackground
      source={require("../../assets/images/loginpng.png")}
      resizeMode="cover"
      imageStyle={{ opacity: 0.25 }}
      style={styles.background}
    >
      <StatusBar barStyle="dark-content" />

      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.header}>
          <Text style={styles.welcome}>New To,</Text>
          <Text style={styles.hms}>HMS?</Text>

          <View style={styles.tagBox}>
            <Text style={styles.tagText}>
              Create your account to get started.
            </Text>
          </View>
        </View>

        <View style={styles.card}>
          {/* NAME */}
          <View style={styles.inputBox}>
            <Ionicons name="person-outline" size={22} color="#777" />
            <TextInput
              placeholder="Full Name"
              style={styles.input}
              value={form.name}
              onChangeText={(v) => handleChange("name", v)}
              onBlur={() =>
                setErrors((prev) => ({
                  ...prev,
                  name: validateField(form.name, "Name", "name"),
                }))
              }
            />
          </View>
          {showError("name")}

          {/* EMAIL */}
          <View style={styles.inputBox}>
            <Ionicons name="mail-outline" size={22} color="#777" />
            <TextInput
              placeholder="Email"
              keyboardType="email-address"
              autoCapitalize="none"
              style={styles.input}
              value={form.email}
              onChangeText={(v) => handleChange("email", v)}
              onBlur={() =>
                setErrors((prev) => ({
                  ...prev,
                  email: validateField(form.email, "Email", "email"),
                }))
              }
            />
          </View>
          {showError("email")}

          {/* PASSWORD */}
          <View style={styles.inputBox}>
            <Ionicons name="lock-closed-outline" size={22} color="#777" />
            <TextInput
              placeholder="Password"
              secureTextEntry
              autoCapitalize="none"
              style={styles.input}
              value={form.password}
              onChangeText={(v) => handleChange("password", v)}
              onBlur={() =>
                setErrors((prev) => ({
                  ...prev,
                  password: validateField(
                    form.password,
                    "Password",
                    "password",
                  ),
                }))
              }
            />
          </View>
          {showError("password")}

          {/* PHONE */}
          <View style={styles.inputBox}>
            <Ionicons name="call-outline" size={22} color="#777" />
            <TextInput
              placeholder="Phone"
              keyboardType="phone-pad"
              maxLength={10}
              style={styles.input}
              value={form.phone}
              onChangeText={(v) => handlePhoneInput("phone", v)}
              onBlur={() =>
                setErrors((prev) => ({
                  ...prev,
                  phone: validateField(form.phone, "Phone", "phone"),
                }))
              }
            />
          </View>
          {showError("phone")}

          {/* GENDER */}
          <View style={styles.pickerBox}>
            <Picker
              selectedValue={form.gender}
              onValueChange={(v) => {
                handleChange("gender", v);

                setErrors((prev) => ({
                  ...prev,
                  gender: validateField(v, "Gender", "required"),
                }));
              }}
            >
              <Picker.Item label="Gender" value="" />
              <Picker.Item label="Male" value="Male" />
              <Picker.Item label="Female" value="Female" />
              <Picker.Item label="Other" value="Other" />
            </Picker>
          </View>
          {showError("gender")}

          {/* DOB */}
          <TouchableOpacity
            style={styles.inputBox}
            onPress={() => setShowDatePicker(true)}
          >
            <Ionicons name="calendar-outline" size={22} color="#777" />
            <Text style={styles.dateText}>{form.dob || "Date of Birth"}</Text>
          </TouchableOpacity>
          {showError("dob")}

          {showDatePicker && (
            <DateTimePicker
              mode="date"
              maximumDate={new Date()}
              value={new Date()}
              onChange={(e, date) => {
                setShowDatePicker(false);
                if (date) {
                  const value = date.toISOString().split("T")[0];
                  handleChange("dob", value);

                  setErrors((prev) => ({
                    ...prev,
                    dob: validateField(value, "Date of Birth", "dob"),
                  }));
                }
              }}
            />
          )}

          {/* BLOOD GROUP */}
          <View style={styles.pickerBox}>
            <Picker
              selectedValue={form.bloodGroup}
              onValueChange={(v) => {
                handleChange("bloodGroup", v);

                setErrors((prev) => ({
                  ...prev,
                  bloodGroup: validateField(v, "Blood Group", "required"),
                }));
              }}
            >
              <Picker.Item label="Blood Group" value="" />
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
          {showError("bloodGroup")}

          {/* ALLERGIES */}
          <View style={styles.inputBox}>
            <Ionicons name="medkit-outline" size={22} color="#777" />
            <TextInput
              placeholder="Allergies"
              value={form.allergies}
              style={styles.input}
              onChangeText={(v) =>
                handleChange("allergies", v.replace(/[^a-zA-Z\s]/g, ""))
              }
            />
          </View>

          {/* ADDRESS */}
          <View style={styles.inputBox}>
            <Ionicons name="location-outline" size={22} color="#777" />
            <TextInput
              placeholder="Address"
              style={styles.input}
              value={form.line1}
              onChangeText={(v) => handleChange("line1", v)}
              onBlur={() =>
                setErrors((prev) => ({
                  ...prev,
                  line1: validateField(form.line1, "Address", "address"),
                }))
              }
            />
          </View>
          {showError("line1")}

          <View style={styles.inputBox}>
            <TextInput
              placeholder="City"
              style={styles.input}
              value={form.city}
              onChangeText={(v) => handleChange("city", v)}
              onBlur={() =>
                setErrors((prev) => ({
                  ...prev,
                  city: validateField(form.city, "City", "city"),
                }))
              }
            />
          </View>
          {showError("city")}

          <View style={styles.inputBox}>
            <TextInput
              placeholder="Postcode"
              keyboardType="numeric"
              maxLength={6}
              style={styles.input}
              value={form.postcode}
              onChangeText={(v) =>
                handleChange("postcode", v.replaceAll(/\D/g, ""))
              }
              onBlur={() =>
                setErrors((prev) => ({
                  ...prev,
                  postcode: validateField(
                    form.postcode,
                    "Postcode",
                    "postcode",
                  ),
                }))
              }
            />
          </View>
          {showError("postcode")}

          {/* EMERGENCY */}
          <View style={styles.inputBox}>
            <Ionicons name="call-outline" size={22} color="#777" />
            <TextInput
              placeholder="Emergency Contact"
              keyboardType="phone-pad"
              maxLength={10}
              style={styles.input}
              value={form.emergencyContact}
              onChangeText={(v) => handlePhoneInput("emergencyContact", v)}
              onBlur={() =>
                setErrors((prev) => ({
                  ...prev,
                  emergencyContact: validateField(
                    form.emergencyContact,
                    "Emergency Contact",
                    "optionalPhone",
                  ),
                }))
              }
            />
          </View>
          {showError("emergencyContact")}

          {/* SIGNUP BUTTON */}
          <TouchableOpacity
            style={[
              styles.button,
              loading && {
                opacity: 0.5,
              },
            ]}
            disabled={loading}
            onPress={handleSignup}
          >
            <Text style={styles.buttonText}>
              {loading ? "Creating..." : "Signup"}
            </Text>
          </TouchableOpacity>

          <View style={styles.loginRow}>
            <Text style={styles.loginText}>Already have an account?</Text>
            <TouchableOpacity onPress={() => navigation.navigate("Login")}>
              <Text style={styles.loginLink}> Login</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </ImageBackground>
  );
};

SignupScreen.propTypes = {
  navigation: PropTypes.object.isRequired,
};

export default SignupScreen;

const styles = StyleSheet.create({
  background: { flex: 1 },
  container: { flexGrow: 1, paddingBottom: 40 },
  header: { paddingTop: 80, paddingHorizontal: 20 },
  welcome: { fontSize: 40, fontWeight: "800", color: "#222" },
  hms: { fontSize: 52, fontWeight: "900", color: PRIMARY },

  tagBox: {
    marginTop: 10,
    borderWidth: 1.5,
    borderColor: PRIMARY,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 6,
  },

  tagText: { fontSize: 14 },

  card: {
    marginTop: 160,
    marginHorizontal: 12,
    backgroundColor: "#EFEFEF",
    borderRadius: 40,
    padding: 25,
    elevation: 10,
  },

  inputBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F8F8F8",
    borderRadius: 20,
    paddingHorizontal: 15,
    height: 60,
    marginBottom: 10,
    elevation: 3,
  },

  input: { flex: 1, marginLeft: 10 },

  pickerBox: {
    backgroundColor: "#F8F8F8",
    borderRadius: 20,
    marginBottom: 10,
    elevation: 3,
  },

  dateText: { marginLeft: 10, color: "#777" },

  button: {
    backgroundColor: PRIMARY,
    height: 65,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 15,
  },

  buttonText: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "700",
  },

  loginRow: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 25,
  },

  loginText: { color: "#222" },

  loginLink: {
    color: PRIMARY,
    fontWeight: "700",
  },

  error: {
    color: "red",
    fontSize: 12,
    marginBottom: 8,
    marginLeft: 5,
  },
});
