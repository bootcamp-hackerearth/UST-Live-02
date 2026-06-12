import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from "react-native";


import { getAllDoctors, getPatientAppointments  } from "../services/patientApi";
import { getPatient, clearStorage  } from "../storage/authStorage";
import { useFocusEffect } from "@react-navigation/native";
import { useCallback,useState } from "react";
import PropTypes from "prop-types";


const HomeScreen = ({ navigation }) => {
  const [patient, setPatient] = useState(null);
  const [doctors, setDoctors] = useState([]);
  const [appointments, setAppointments] = useState([]);

  useFocusEffect(
    useCallback(() => {
      loadPatient();
      loadDoctors();
      loadAppointments();
    }, []),
  );

  const loadPatient = async () => {
    const patientData = await getPatient();
    setPatient(patientData);
  };
  const loadDoctors = async () => {
    const response = await getAllDoctors();
    setDoctors(response.doctors);
  };
  const handleLogout = async () => {
    await clearStorage();
    navigation.navigate("Login");
  };
  const loadAppointments = async () => {
    try {
      const response = await getPatientAppointments();
      console.log("APPOINTMENTS RESPONSE:", response);
      setAppointments(response.data || []);
    } catch (error) {
      console.log("APPOINTMENT ERROR:", error.response?.data);
      setAppointments([]);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "BOOKED":
        return "#10B981"; // Green

      case "PENDING":
        return "#F59E0B"; // Orange

      case "CANCELLED":
        return "#EF4444"; // Red

      case "COMPLETED":
        return "#3B82F6"; // Blue

      default:
        return "#6B7280";
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Header */}

      <View style={styles.header}>
        <Text style={styles.welcome}>Welcome Back 👋</Text>

        <Text style={styles.name}>{patient?.name || "Patient"}</Text>

        <Text style={styles.uhid}>{patient?.UHID || "UHID Not Available"}</Text>
      </View>

      {/* Health Summary */}

      <View style={styles.glassCard}>
        <Text style={styles.sectionTitle}>🩺 Health Summary</Text>

        <Text style={styles.info}>
          Blood Group : {patient?.bloodGroup || "N/A"}
        </Text>

        <Text style={styles.info}>
          Allergies :{" "}
          {patient?.allergies?.length ? patient.allergies.join(", ") : "None"}
        </Text>

        <Text style={styles.info}>
          Emergency Contact : {patient?.emergencyContact || "N/A"}
        </Text>
      </View>

      {/* Upcoming Appointment */}

      <Text style={styles.sectionHeading}>📅 My Appointments</Text>

      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {appointments.length > 0 ? (
          appointments.map((appointment) => (
            <View
              key={appointment._id}
              style={[styles.glassCard, { width: 280, marginRight: 15 }]}
            >
              <Text style={styles.specialization}>
                {appointment.appointmentId}
              </Text>
              <Text style={styles.doctorName}>
                Dr. {appointment.doctorName}
              </Text>

              <Text style={styles.specialization}>
                {appointment.specialization}
              </Text>

              <Text style={styles.appointmentDate}>
                {new Date(appointment.date).toLocaleDateString("en-GB", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                })}
                {" | "}
                {appointment.timeSlot}
              </Text>
              <View
                style={[
                  styles.statusBadge,
                  {
                    backgroundColor: getStatusColor(appointment.status),
                  },
                ]}
              >
                <Text style={styles.statusText}>{appointment.status}</Text>
              </View>
            </View>
          ))
        ) : (
          <View style={[styles.glassCard, { width: 280 }]}>
            <Text style={styles.info}>No appointments found.</Text>
          </View>
        )}
      </ScrollView>

      {/* Top Doctors */}

      <Text style={styles.sectionHeading}>👨‍⚕️ Our Top Doctors</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={true}>
        {doctors.map((doctor) => (
          <View key={doctor._id} style={styles.doctorCard}>
            <Text style={styles.doctorCardName}>Dr. {doctor.name}</Text>
            <Text style={styles.doctorCardSpec}>{doctor.specialization}</Text>
          </View>
        ))}
      </ScrollView>

      {/* Logout */}

      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

HomeScreen.propTypes = {
  navigation: PropTypes.shape({
    navigate: PropTypes.func.isRequired,
  }).isRequired,
};


export default HomeScreen;

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: "#F4F4F7",
    padding: 20,
    paddingBottom: 40,
  },

  header: {
    backgroundColor: "#FFFFFF",
    borderRadius: 30,
    padding: 25,
    marginTop: 20,
    marginBottom: 20,
  },

  welcome: {
    fontSize: 16,
    color: "#888",
  },

  name: {
    fontSize: 32,
    fontWeight: "800",
    color: "#1C2143",
    marginTop: 8,
  },

  uhid: {
    fontSize: 15,
    color: "#6B46C1",
    marginTop: 5,
    fontWeight: "600",
  },

  glassCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 25,
    padding: 20,
    marginBottom: 20,

    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1C2143",
    marginBottom: 15,
  },

  info: {
    fontSize: 15,
    color: "#666",
    marginBottom: 10,
  },

  sectionHeading: {
    fontSize: 22,
    fontWeight: "800",
    color: "#1C2143",
    marginBottom: 15,
    marginTop: 10,
  },

  doctorName: {
    fontSize: 20,
    fontWeight: "800",
    color: "#1C2143",
  },

  specialization: {
    fontSize: 14,
    color: "#6B46C1",
    marginTop: 6,
    fontWeight: "600",
  },

  appointmentDate: {
    fontSize: 14,
    color: "#666",
    marginTop: 15,
  },

  doctorCard: {
    backgroundColor: "#FFFFFF",
    width: 220,
    padding: 20,
    borderRadius: 25,
    marginRight: 15,

    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },

  doctorCardName: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1C2143",
  },

  doctorCardSpec: {
    marginTop: 10,
    color: "#6B46C1",
    fontWeight: "600",
  },

  logoutButton: {
    backgroundColor: "#6B46C1",
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 25,
  },

  logoutText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "700",
  },
  statusBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
    marginTop: 10,
  },

  statusText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 12,
  },
});
