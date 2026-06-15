import React, { memo } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from "react-native";

const AppointmentCard = ({
  item,
  getStatusColor,
  onCancel,
}) => {
  return (
    <View style={styles.appointmentCard}>
      <Text style={styles.doctorName}>
        Dr. {item.doctorName}
      </Text>

      <Text style={styles.specialization}>
        {item.specialization}
      </Text>

      <Text style={styles.detail}>
        Date: {new Date(item.date).toLocaleDateString()}
      </Text>

      <Text style={styles.detail}>
        Time: {item.timeSlot}
      </Text>

      <Text
        style={[
          styles.status,
          {
            color: getStatusColor(item.status),
          },
        ]}
      >
        {item.status}
      </Text>

      {item.status === "PENDING" && (
        <TouchableOpacity
          style={styles.cancelButton}
          onPress={() =>
            onCancel(item.appointmentId)
          }
        >
          <Text
            style={{
              color: "#fff",
              fontWeight: "700",
            }}
          >
            Cancel Appointment
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

export default memo(AppointmentCard);

const styles = StyleSheet.create({
  appointmentCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 18,
    marginBottom: 15,
    elevation: 3,
  },

  doctorName: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1C2143",
  },

  specialization: {
    color: "#6B46C1",
    marginBottom: 10,
  },

  detail: {
    color: "#374151",
    marginBottom: 4,
  },

  status: {
    fontWeight: "700",
    marginTop: 8,
    marginBottom: 10,
  },

  cancelButton: {
    backgroundColor: "#EF4444",
    padding: 10,
    borderRadius: 10,
    alignItems: "center",
  },
});