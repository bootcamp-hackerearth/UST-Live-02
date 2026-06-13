import React from "react";
import { TouchableOpacity, View, Text, StyleSheet } from "react-native";

interface Props {
  doctor: any;
  selected: boolean;
  onPress: () => void;
}

export default function DoctorCard({ doctor, selected, onPress }: Props) {
  return (
    <TouchableOpacity
      style={[styles.card, selected && styles.selectedCard]}
      onPress={onPress}
    >
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>{doctor?.name?.charAt(0)}</Text>
      </View>

      <View style={styles.info}>
        <Text style={styles.name}>Dr. {doctor.name}</Text>

        <Text style={styles.specialization}>{doctor.specialization}</Text>

        <Text style={styles.department}>{doctor.department}</Text>

        <Text style={styles.fee}>₹ {doctor.consultationFee}</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",

    backgroundColor: "#FFFFFF",

    borderRadius: 22,

    padding: 16,

    marginBottom: 12,

    borderWidth: 1,

    borderColor: "#E2E8F0",
  },

  selectedCard: {
    borderColor: "#2563EB",

    backgroundColor: "#EEF4FF",
  },

  avatar: {
    width: 58,

    height: 58,

    borderRadius: 29,

    backgroundColor: "#2563EB",

    justifyContent: "center",

    alignItems: "center",

    marginRight: 14,
  },

  avatarText: {
    color: "#FFFFFF",

    fontWeight: "800",

    fontSize: 20,
  },

  info: {
    flex: 1,
  },

  name: {
    fontSize: 16,

    fontWeight: "700",

    color: "#0F172A",
  },

  specialization: {
    color: "#64748B",

    marginTop: 4,
  },

  department: {
    color: "#64748B",

    marginTop: 2,
  },

  fee: {
    color: "#2563EB",

    marginTop: 8,

    fontWeight: "700",
  },
});
