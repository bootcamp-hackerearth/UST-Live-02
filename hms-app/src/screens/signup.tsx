const BgImage = require("../../assets/img/cover.jpg");
import { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ImageBackground,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { AuthInputText } from "../components/auth/auth-input-text";
import { AuthSubmitButton } from "../components/auth/auth-submit-button";
import { WelcomeTextContainer } from "../components/auth/welcome-text-container";
import { Picker } from "@react-native-picker/picker";
import DateTimePicker, {
  DateTimePickerEvent,
} from "@react-native-community/datetimepicker";
import { SignUpRequestModel } from "../types/auth.types";
import { signUp } from "../services/auth.service";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { NavigationModel } from "../types/navigation.types";
import Toast from "react-native-toast-message";

import {
  validateName,
  validateEmail,
  validatePassword,
  validateConfirmPassword,
  validatePhone,
  validateDob,
  validateRequired,
  maxDobLimit,
  minDobLimit,
} from "../utils/validators";

export default function SignUpScreen() {
  const navigator = useNavigation<NativeStackNavigationProp<NavigationModel>>();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [gender, setGender] = useState("");
  const [dob, setDob] = useState(new Date());
  const [isDobSet, setIsDobSet] = useState(false);
  const [address, setAddress] = useState("");
  const [bloodGroup, setBloodGroup] = useState("");
  const [allergies, setAllergies] = useState("");
  const [emergencyContact, setEmergencyContact] = useState("");
  const [status, setStatus] = useState("Active");

  const [show, setShow] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
    gender: "",
    address: "",
    bloodGroup: "",
    dob: "",
    emergencyContact: "",
  });

  const onDateChange = (event: DateTimePickerEvent, selectedDob?: any) => {
    setShow(false);
    setIsDobSet(true);
    if (selectedDob) setDob(selectedDob);
  };

  const validateSignUp = () => {
    let newErrors = {
      name: validateName(name),
      email: validateEmail(email),
      password: validatePassword(password),
      confirmPassword: validateConfirmPassword(confirmPassword, password),
      phone: validatePhone(phone),
      gender: validateRequired(gender, "Gender"),
      address: validateRequired(address, "Address"),
      bloodGroup: validateRequired(bloodGroup, "Blood group"),
      dob: validateDob(dob),
      emergencyContact: validatePhone(phone, emergencyContact),
    };

    setErrors(newErrors);

    const isValid = Object.values(newErrors).every((error) => error === "");
    return isValid;
  };

  const sendSignUp = async () => {
    const validForm = validateSignUp();
    if (validForm) {
      setStatus("Active");
      const payload: SignUpRequestModel = {
        name: name,
        email: email,
        role: "Patient",
        status: status,
        password: password,
        phone: phone,
        gender: gender,
        address: address,
        bloodGroup: bloodGroup,
        allergies: allergies,
        dob: dob,
        emergencyContact: emergencyContact,
      };

      try {
        setIsLoading(true);
        await signUp(payload);

        Toast.show({
          type: "success",
          text1: "Success.",
          text2: "Account created successfully.",
        });
        navigator.navigate("login");
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    } else {
      Toast.show({
        type: "error",
        text1: "Validation failed.",
        text2: "Please check your input and try again.",
      });
    }
  };

  return (
    <ImageBackground source={BgImage} resizeMode="cover" style={styles.wrapper}>
      <View style={styles.overlay}>
        <WelcomeTextContainer
          text1="New To,"
          text2="HMS?"
          text3="Create your account to get started."
          isHome={false}
        />
        <View style={styles.container}>
          <ScrollView
            style={{ width: "100%" }}
            contentContainerStyle={{ flexGrow: 1, alignItems: "center" }}
          >
            <AuthInputText
              innerText="Name"
              getData={(value: string) => setName(value)}
              iconName="person-outline"
            />
            {!!errors.name && (
              <Text style={styles.errorText}>{errors.name}</Text>
            )}
            <AuthInputText
              innerText="Email"
              getData={(value: string) => setEmail(value)}
              iconName="mail-outline"
            />
            {!!errors.email && (
              <Text style={styles.errorText}>{errors.email}</Text>
            )}
            <AuthInputText
              innerText="Password"
              isPassword={true}
              getData={(value: string) => setPassword(value)}
              iconName="key-outline"
            />
            {!!errors.password && (
              <Text style={styles.errorText}>{errors.password}</Text>
            )}
            <AuthInputText
              innerText="Confirm Password"
              isPassword={true}
              getData={(value: string) => setConfirmPassword(value)}
              iconName="lock-closed-outline"
            />
            {!!errors.confirmPassword && (
              <Text style={styles.errorText}>{errors.confirmPassword}</Text>
            )}
            <AuthInputText
              innerText="Phone"
              getData={(value: string) => setPhone(value)}
              iconName="call-outline"
            />
            {!!errors.phone && (
              <Text style={styles.errorText}>{errors.phone}</Text>
            )}
            <View style={styles.dropdownHolder}>
              <Picker
                selectedValue={gender}
                onValueChange={(value) => {
                  if (value != "") setGender(value);
                }}
                style={styles.picker}
                dropdownIconColor="#828282"
              >
                <Picker.Item label="Gender" value="" style={styles.picker} />
                <Picker.Item label="Male" value="Male" style={styles.picker} />
                <Picker.Item
                  label="Female"
                  value="Female"
                  style={styles.picker}
                />
              </Picker>
            </View>
            {!!errors.gender && (
              <Text style={styles.errorText}>{errors.gender}</Text>
            )}
            <AuthInputText
              innerText="Address"
              getData={(value: string) => setAddress(value)}
              iconName="location-outline"
            />
            {!!errors.address && (
              <Text style={styles.errorText}>{errors.address}</Text>
            )}
            <View style={styles.dropdownHolder}>
              <Picker
                selectedValue={bloodGroup}
                onValueChange={(value) => {
                  if (value != "") setBloodGroup(value);
                }}
                style={styles.picker}
                dropdownIconColor="#828282"
              >
                <Picker.Item
                  label="Blood Group"
                  value=""
                  style={styles.picker}
                />
                <Picker.Item label="A+" value="A+" style={styles.picker} />
                <Picker.Item label="A-" value="A-" style={styles.picker} />
                <Picker.Item label="B+" value="B+" style={styles.picker} />
                <Picker.Item label="B-" value="B-" style={styles.picker} />
                <Picker.Item label="AB+" value="AB+" style={styles.picker} />
                <Picker.Item label="AB-" value="AB-" style={styles.picker} />
                <Picker.Item label="O+" value="O+" style={styles.picker} />
                <Picker.Item label="O-" value="O-" style={styles.picker} />
              </Picker>
            </View>
            {!!errors.gender && (
              <Text style={styles.errorText}>{errors.bloodGroup}</Text>
            )}
            <AuthInputText
              innerText="Allergies"
              getData={(value: string) => setAllergies(value)}
              iconName="medkit-outline"
            />
            {!!errors.address && (
              <Text style={styles.errorText}>{errors.address}</Text>
            )}
            <TouchableOpacity
              onPress={() => setShow(true)}
              style={styles.dropdownHolder}
            >
              <Text style={styles.dobText}>
                {isDobSet ? dob.toDateString() : "DOB"}
              </Text>
              {show && (
                <DateTimePicker
                  value={dob}
                  mode="date"
                  minimumDate={minDobLimit()}
                  maximumDate={maxDobLimit()}
                  onChange={onDateChange}
                />
              )}
            </TouchableOpacity>
            {!!errors.dob && <Text style={styles.errorText}>{errors.dob}</Text>}
            <AuthInputText
              innerText="Emergency Contact"
              getData={(value: string) => setEmergencyContact(value)}
              iconName="call-outline"
            />
            {!!errors.emergencyContact && (
              <Text style={styles.errorText}>{errors.emergencyContact}</Text>
            )}
            <AuthSubmitButton
              titleText={isLoading ? "Signing In..." : "Signup"}
              onSubmit={sendSignUp}
            />
            <TouchableOpacity
              style={styles.signUpFooter}
              onPress={() => navigator.navigate("login")}
            >
              <Text style={styles.signUpFooterText}>
                Already have an account?
              </Text>
              <Text style={[styles.signUpFooterText, styles.login]}>
                {" "}
                Login
              </Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    justifyContent: "space-between",
    backgroundColor: "rgba(255, 255, 255, 0.8)",
  },

  welcomeTextContainer: {
    justifyContent: "flex-start",
    alignItems: "flex-start",
    marginVertical: 100,
    marginHorizontal: 20,
    padding: 10,
    height: "10%",
  },
  loginText: {
    fontFamily: "Sans",
    color: "white",
  },
  loginTextWelcome: {
    fontSize: 38,
    lineHeight: 38,
  },
  loginTextMain: {
    fontSize: 48,
    lineHeight: 48,
    color: "#4c1c77",
  },
  loginTextSub: {
    fontSize: 12,
    lineHeight: 12,
    marginVertical: 10,
    backgroundColor: "rgb(255, 255, 255,0.1)",
    padding: 10,
    borderRadius: 8,
  },
  container: {
    height: "60%",
    backgroundColor: "#f2f2f2",
    borderRadius: 30,
    margin: 20,
    paddingVertical: 40,
    elevation: 5,
  },
  errorText: {
    color: "#ef2121",
    fontSize: 13,
    width: "80%",
    borderLeftWidth: 4,
    borderColor: "#cd1717",
    borderRadius: 4,
    marginTop: 5,
    paddingHorizontal: 10,
  },
  dropdownHolder: {
    backgroundColor: "#ffffff",
    paddingHorizontal: 20,
    borderRadius: 15,
    borderColor: "rgba(0,0,0,0.2)",
    borderWidth: 1,
    width: "80%",
    height: 50,
    marginVertical: 10,
  },
  picker: {
    color: "#828282",
    fontFamily: "Sans",
    fontSize: 14,
  },
  dobText: {
    fontFamily: "Sans",
    fontSize: 12,
    color: "#828282",
    paddingHorizontal: 10,
    marginTop: 10,
  },
  signUpFooter: {
    marginTop: 40,
    marginBottom: 20,
    flexDirection: "row",
  },
  signUpFooterText: {
    color: "black",
    fontFamily: "Sans",
    fontSize: 14,
  },
  login: {
    color: "#4c1c77",
  },
});
