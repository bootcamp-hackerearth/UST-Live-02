import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Feather } from "@expo/vector-icons";

export interface Appointment {
  _id: string;
  appointmentCode: string;
  date: string;
  timeSlot: string;
  status: string;
  doctorName: string;
  doctorDept: string;
  doctorSpecialization: string;
}

interface Props {
  appointment: Appointment;
}

const formatDate = (isoString: string) => {
  const dateObj = new Date(isoString);
  return dateObj.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

const formatSpecialization = (spec: string) => {
  if (!spec) return "N/A";
  return spec.charAt(0).toUpperCase() + spec.slice(1);
};

function AppointmentCard({ appointment }: Readonly<Props>) {
  return (
    <View style={styles.cardWrapper}>
      <View style={styles.card}>
        <Text style={styles.code}>{appointment.appointmentCode}</Text>
        <Text style={styles.doctorName}>{appointment.doctorName}</Text>
        <Text style={styles.specialization}>
          {formatSpecialization(appointment.doctorSpecialization)}
        </Text>

        <View style={styles.pillRow}>
          <View style={styles.pill}>
            <Feather name="calendar" size={14} color="#6C4EDB" />
            <Text style={styles.pillText}>{formatDate(appointment.date)}</Text>
          </View>

          <View style={styles.pill}>
            <Feather name="clock" size={14} color="#6C4EDB" />
            <Text style={styles.pillText}>{appointment.timeSlot}</Text>
          </View>
        </View>
      </View>
    </View>
  );
}

export default React.memo(AppointmentCard);

const styles = StyleSheet.create({
  cardWrapper: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  card: {
    backgroundColor: "#FFFFFF",
    padding: 20,
    borderRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  code: {
    color: "#6C4EDB",
    fontSize: 12,
    fontFamily: "Lexend",
    marginBottom: 6,
  },
  doctorName: {
    color: "#1E1E3F",
    fontSize: 20,
    fontFamily: "Lexend",
    marginBottom: 4,
  },
  specialization: {
    color: "#6C4EDB",
    fontSize: 14,
    fontFamily: "Lexend",
    marginBottom: 16,
  },
  pillRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 2,
  },
  pill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(108, 78, 219, 0.1)",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    marginRight: 10,
  },
  pillText: {
    color: "#6C4EDB",
    fontSize: 13,
    fontFamily: "Lexend",
    marginLeft: 6,
  },
});
