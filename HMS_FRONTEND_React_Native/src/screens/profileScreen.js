import { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
} from "react-native";

import { Ionicons } from "@expo/vector-icons";

import {
  getPatient,
  getToken,
  getUser,
  saveLoginData,
} from "../storage/authStorage";

import { updatePatientProfile } from "../services/patientApi";

const ProfileScreen = () => {
  const [patient, setPatient] = useState(null);

  const [isEditing, setIsEditing] = useState(false);

  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    name: "",
    phone: "",
    bloodGroup: "",
    allergies: "",
    emergencyContact: "",
    line1: "",
    city: "",
    postcode: "",
  });

  useEffect(() => {
    loadPatient();
  }, []);

  const loadPatient = async () => {
    const data = await getPatient();

    if (data) {
      setPatient(data);
      setForm({
        name: data.name || "",
        phone: data.phone || "",
        bloodGroup: data.bloodGroup || "",
        allergies: data.allergies?.join(", ") || "",
        emergencyContact: data.emergencyContact || "",
        line1: data.address?.line1 || "",
        city: data.address?.city || "",
        postcode: data.address?.postcode || "",
      });
    }
  };

  const handleUpdate = async () => {
    try {
      setLoading(true);

      const token = await getToken();

      const requestBody = {
        name: form.name,
        phone: form.phone,
        bloodGroup: form.bloodGroup,
        allergies: form.allergies
          ? form.allergies.split(",").map((a) => a.trim())
          : [],
        emergencyContact: form.emergencyContact,
        address: {
          line1: form.line1,
          city: form.city,
          postcode: form.postcode,
        },
      };

      const response = await updatePatientProfile(requestBody);
      const user = await getUser();
      await saveLoginData(token, user, response.patient);
      setPatient(response.patient);
      setIsEditing(false);

      Alert.alert("Success", "Profile Updated Successfully");
    } catch (error) {
      console.log(error);

    } finally {
      setLoading(false);
    }
  };

  if (!patient) {
    return (
      <View style={styles.center}>
        <Text>Loading Profile...</Text>
      </View>
    );
  }

  const renderField = (label, value, fieldName) => (
    <View style={styles.row}>
      <Text style={styles.label}>{label}</Text>

      {isEditing && fieldName ? (
        <TextInput
          style={styles.input}
          value={form[fieldName]}
          onChangeText={(text) =>
            setForm({
              ...form,
              [fieldName]: text,
            })
          }
        />
      ) : (
        <Text style={styles.value}>{value || "-"}</Text>
      )}
    </View>
  );

  let buttonText = "Edit Profile";

  if (loading) {
    buttonText = "Saving...";
  } else if (isEditing) {
    buttonText = "Save Changes";
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.avatarContainer}>
        <Ionicons name="person-circle" size={130} color="#6B46C1" />
      </View>

      <Text style={styles.name}>{patient?.name || "Patient Profile"}</Text>

      <TouchableOpacity
        style={styles.editButton}
        onPress={() => {
          if (isEditing) {
            handleUpdate();
          } else {
            setIsEditing(true);
          }
        }}
      >
        <Text style={styles.editButtonText}>{buttonText}</Text>
      </TouchableOpacity>

      {isEditing && (
        <TouchableOpacity
          style={styles.cancelButton}
          onPress={() => {
            setIsEditing(false);
            loadPatient();
          }}
        >
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>
      )}

      <View style={styles.card}>
        {renderField("UHID", patient.UHID)}

        {renderField("Email", patient.email)}

        {renderField("Name", patient.name, "name")}

        {renderField("Phone", patient.phone, "phone")}

        {renderField("Gender", patient.gender)}

        {renderField(
          "Date of Birth",
          patient.date_of_birth ? patient.date_of_birth.split("T")[0] : "-",
        )}

        {renderField("Blood Group", patient.bloodGroup, "bloodGroup")}

        {renderField(
          "Emergency Contact",
          patient.emergencyContact,
          "emergencyContact",
        )}

        {renderField(
          "Allergies",
          patient.allergies?.length ? patient.allergies.join(", ") : "None",
          "allergies",
        )}

        {renderField("Address", patient.address?.line1, "line1")}

        {renderField("City", patient.address?.city, "city")}

        {renderField("Postcode", patient.address?.postcode, "postcode")}
      </View>
    </ScrollView>
  );
};

export default ProfileScreen;
const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: "#F4F4F7",
    paddingTop: 40,
    paddingHorizontal: 20,
    paddingBottom: 40,
  },

  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F4F4F7",
  },

  avatarContainer: {
    alignItems: "center",
    marginTop: 20,
  },

  name: {
    textAlign: "center",
    fontSize: 28,
    fontWeight: "800",
    color: "#1C2143",
    marginTop: 10,
    marginBottom: 20,
  },

  editButton: {
    backgroundColor: "#6B46C1",
    height: 58,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },

  editButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },

  cancelButton: {
    backgroundColor: "#D1D5DB",
    height: 58,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },

  cancelButtonText: {
    color: "#1C2143",
    fontSize: 16,
    fontWeight: "700",
  },

  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 30,
    padding: 25,

    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 4,
  },

  row: {
    marginBottom: 18,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F1F1",
  },

  label: {
    color: "#8B8B8B",
    fontSize: 13,
    marginBottom: 6,
    textTransform: "uppercase",
    letterSpacing: 1,
  },

  value: {
    color: "#1C2143",
    fontSize: 16,
    fontWeight: "600",
  },

  input: {
    backgroundColor: "#F7F8FC",
    borderRadius: 15,
    paddingHorizontal: 15,
    height: 55,
    color: "#1C2143",
    fontSize: 16,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
});
