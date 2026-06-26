import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";

interface ManageAppointmentCardProps {
  appointment: any;
  onEdit: () => void;
  onDelete: () => void;
}

function ManageAppointmentCard({
  appointment,
  onEdit,
  onDelete,
}: Readonly<ManageAppointmentCardProps>) {
  const isScheduled = appointment.status === "Scheduled";
  const isCancelled = appointment.status === "Cancelled";
  const isCompleted = appointment.status === "Completed";

  let badgeBackgroundColor;
  let badgeTextColor;
  let badgeText;

  if (isScheduled) {
    badgeBackgroundColor = "#c7c5ea";
    badgeTextColor = "blue";
    badgeText = "Booked";
  } else if (isCancelled) {
    badgeBackgroundColor = "#f3c7c7";
    badgeTextColor = "red";
    badgeText = appointment.status;
  } else if (isCompleted) {
    badgeBackgroundColor = "#bef0bf";
    badgeTextColor = "green";
    badgeText = appointment.status;
  } else {
    badgeBackgroundColor = "#f7d7a6";
    badgeTextColor = "#9e6002";
    badgeText = appointment.status;
  }

  return (
    <View style={styles.card}>
      <View style={styles.row}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {appointment.doctorName
              ? appointment.doctorName.substring(0, 2).toUpperCase()
              : "DR"}
          </Text>
        </View>

        <View style={styles.detailsContainer}>
          <Text style={styles.docName}>
            {appointment.doctorName || "Unknown Doctor"}
          </Text>
          <Text style={styles.deptText}>
            {appointment.doctorSpecialization ||
              appointment.doctorDept ||
              "General Medicine"}
          </Text>
          <Text style={styles.aptCode}>{appointment.appointmentCode}</Text>
        </View>

        <View
          style={[
            styles.badge,
            {
              backgroundColor: badgeBackgroundColor,
              borderRadius: 6,
            },
          ]}
        >
          <Text
            style={[
              styles.badgeText,
              {
                color: badgeTextColor,
              },
            ]}
          >
            {badgeText}
          </Text>
        </View>
      </View>

      <View style={styles.timeContainer}>
        <View style={styles.pill}>
          <Text style={styles.pillText}>
            {appointment.date ? new Date(appointment.date).toDateString() : ""}
          </Text>
        </View>

        <View style={styles.pill}>
          <Text style={styles.pillText}>{appointment.timeSlot}</Text>
        </View>
      </View>

      <View style={styles.actionRow}>
        <TouchableOpacity
          style={[
            styles.actionBtn,
            (isCancelled || isCompleted) && { opacity: 0.3 },
          ]}
          onPress={onEdit}
          disabled={isCancelled || isCompleted}
        >
          <View style={styles.actionButton}>
            <Feather name="edit-3" size={18} color="blue" />
            <Text style={[styles.actionText, { color: "blue" }]}> Edit</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.actionBtn,
            (isCancelled || isCompleted) && { opacity: 0.3 },
          ]}
          onPress={onDelete}
          disabled={isCancelled || isCompleted}
        >
          <View style={styles.actionButton}>
            <MaterialCommunityIcons name="cancel" size={18} color="red" />
            <Text style={[styles.actionText, { color: "#EF4444" }]}>
              Cancel
            </Text>
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
}

export default React.memo(ManageAppointmentCard);

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#FFF",
    padding: 20,
    borderRadius: 24,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 14,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#4B1D76",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  avatarText: { color: "#FFF", fontWeight: "bold", fontFamily: "Lexend" },
  detailsContainer: { flex: 1 },
  docName: {
    fontSize: 18,

    color: "#1E1E3F",
    fontFamily: "Lexend",
  },
  deptText: { fontSize: 14, color: "#9CA3AF", fontFamily: "Lexend" },
  aptCode: {
    fontSize: 14,
    color: "#7e4fed",
    fontFamily: "Lexend",
  },
  badge: { paddingVertical: 6, paddingHorizontal: 12, borderRadius: 8 },
  badgeText: {
    color: "#FFF",
    fontFamily: "Lexend",
    fontSize: 12,
  },
  timeText: {
    color: "#4B5563",
    fontSize: 14,
    fontFamily: "Lexend",
    backgroundColor: "#F9FAFB",
    padding: 12,
    borderRadius: 12,
    overflow: "hidden",
  },
  actionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 14,
  },
  actionBtn: {
    flex: 0.48,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    padding: 12,
    borderRadius: 12,
    alignItems: "center",
    backgroundColor: "#FAFAFA",
  },
  actionText: { fontFamily: "Lexend", color: "#4B5563" },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  timeContainer: {
    flexDirection: "row",
    gap: 8,
    alignItems: "center",
  },

  pill: {
    backgroundColor: "#E0E7FF",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },

  pillText: {
    color: "#1E1E3F",
    fontSize: 12,
    fontFamily: "Lexend",
  },
});
