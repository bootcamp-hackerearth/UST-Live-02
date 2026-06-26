import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { PatientProfile } from "../features/auth/types";
import { MaterialIcons } from "@expo/vector-icons";

interface Props {
  profile: PatientProfile | null;
}

function HealthSummaryCard({ profile }: Readonly<Props>) {
  return (
    <View style={styles.summaryCard}>
      <View style={styles.summaryHeader}>
        <MaterialIcons name="health-and-safety" size={24} color="blue" />
        <Text style={styles.cardTitle}> Health Summary</Text>
      </View>
      <Text style={styles.summaryText}>
        Blood Group :{" "}
        <Text style={styles.summaryValue}>{profile?.bloodGroup || "N/A"}</Text>
      </Text>
      <Text style={styles.summaryText}>
        Allergies :{" "}
        <Text style={styles.summaryValue}>
          {profile?.allergies && profile.allergies.length > 0
            ? profile.allergies.join(", ")
            : "None"}
        </Text>
      </Text>
      <Text style={styles.summaryText}>
        Emergency Contact :{" "}
        <Text style={styles.summaryValue}>
          {profile?.emergencyContact || "Not set"}
        </Text>
      </Text>
    </View>
  );
}

export default React.memo(HealthSummaryCard);

const styles = StyleSheet.create({
  summaryCard: {
    backgroundColor: "#e6e6fb",
    marginHorizontal: 20,
    padding: 20,
    borderRadius: 20,
    marginBottom: 28,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  cardTitle: {
    color: "#1E1E3F",
    fontSize: 18,
    fontFamily: "Lexend",
    marginBottom: 16,
  },
  summaryText: {
    color: "#6B7280",
    fontSize: 15,
    marginBottom: 12,
    fontFamily: "Lexend",
  },
  summaryValue: {
    color: "#4B5563",
    fontFamily: "Lexend",
  },
  summaryHeader: {
    flexDirection: "row",
    gap: 8,
  },
});
