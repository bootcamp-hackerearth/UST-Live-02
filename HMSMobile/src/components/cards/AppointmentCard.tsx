import React from "react";
import { TouchableOpacity, View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import StatusBadge from "../badges/StatusBadge";

interface Props {
  readonly item: any;
  readonly onPress: () => void;
}
function AppointmentCard({ item, onPress }: Props) {
  const doctorName = item?.doctorEmployeeId?.name || "Doctor";

  const doctorInitial = doctorName.charAt(0);

  const appointmentDate = item?.appointmentDate?.split("T")[0];

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.9} style={styles.card}>
      <View style={styles.header}>
        <View style={styles.leftSection}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{doctorInitial}</Text>
          </View>

          <View>
            <Text style={styles.doctorName}>Dr. {doctorName}</Text>

            <Text style={styles.speciality}>Healthcare Specialist</Text>
          </View>
        </View>

        <StatusBadge status={item.status} />
      </View>

      <View style={styles.divider} />

      <View style={styles.infoRow}>
        <View style={styles.infoItem}>
          <Ionicons name="calendar-outline" size={18} color="#2563EB" />

          <Text style={styles.infoText}>{appointmentDate}</Text>
        </View>

        <View style={styles.infoItem}>
          <Ionicons name="time-outline" size={18} color="#2563EB" />

          <Text style={styles.infoText}>{item.timeSlot}</Text>
        </View>
      </View>

      <View style={styles.footer}>
        <Text style={styles.viewDetails}>View Details</Text>

        <Ionicons name="chevron-forward" size={18} color="#2563EB" />
      </View>
    </TouchableOpacity>
  );
}
export default React.memo(AppointmentCard);
const styles = StyleSheet.create({
  card: {
    backgroundColor: "rgba(255,255,255,0.92)",
    borderRadius: 24,
    padding: 18,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    shadowColor: "#2563EB",
    shadowOpacity: 0.08,
    shadowRadius: 18,
    shadowOffset: {
      width: 0,
      height: 8,
    },
    elevation: 6,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  leftSection: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: "#2563EB",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  avatarText: {
    color: "#FFFFFF",
    fontSize: 22,
    fontWeight: "800",
  },
  doctorName: {
    fontSize: 17,
    fontWeight: "700",
    color: "#0F172A",
  },
  speciality: {
    fontSize: 13,
    color: "#64748B",
    marginTop: 4,
  },
  divider: {
    height: 1,
    backgroundColor: "#EEF2FF",
    marginVertical: 16,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  infoItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  infoText: {
    marginLeft: 6,
    fontSize: 14,
    fontWeight: "600",
    color: "#334155",
  },
  footer: {
    marginTop: 18,
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
  },
  viewDetails: {
    fontSize: 14,
    fontWeight: "700",
    color: "#2563EB",
    marginRight: 4,
  },
});
