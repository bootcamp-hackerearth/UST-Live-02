import React from "react";

import { ScrollView, StyleSheet, Text, View } from "react-native";

import { PrescriptionGroup } from "../types/HealthRecord";

export default function PrescriptionDetailsScreen({ route }: any) {
  const {
    prescription,
  }: {
    prescription: PrescriptionGroup;
  } = route.params;

  return (
    <ScrollView
      contentContainerStyle={styles.container}
      showsVerticalScrollIndicator={false}
    >
      <Text style={styles.title}>Prescription</Text>

      <Text style={styles.date}>
        {new Date(prescription.date).toLocaleDateString()}
      </Text>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Consultation Details</Text>

        {!!prescription.diagnosis && (
          <>
            <Text style={styles.label}>Diagnosis</Text>

            <Text style={styles.value}>{prescription.diagnosis}</Text>

            <View style={styles.divider} />
          </>
        )}

        {!!prescription.doctor && (
          <>
            <Text style={styles.label}>Doctor</Text>

            <Text style={styles.value}>Dr. {prescription.doctor}</Text>

            <View style={styles.divider} />
          </>
        )}

        {!!prescription.symptoms?.length && (
          <>
            <Text style={styles.label}>Symptoms</Text>

            <Text style={styles.value}>{prescription.symptoms.join(", ")}</Text>

            <View style={styles.divider} />
          </>
        )}

        {!!prescription.vitals && (
          <>
            <Text style={styles.label}>Vitals</Text>

            <Text style={styles.vital}>
              Blood Pressure: {prescription.vitals?.bloodPressure}
            </Text>

            <Text style={styles.vital}>
              Pulse Rate: {prescription.vitals?.pulseRate}
            </Text>

            <Text style={styles.vital}>
              Oxygen Level: {prescription.vitals?.oxygenLevel}
            </Text>

            <Text style={styles.vital}>
              Temperature: {prescription.vitals?.temperature}
            </Text>

            <Text style={styles.vital}>
              Weight: {prescription.vitals?.weight}
            </Text>

            <View style={styles.divider} />
          </>
        )}

        {!!prescription.doctorNotes && (
          <>
            <Text style={styles.label}>Doctor Notes</Text>

            <Text style={styles.value}>{prescription.doctorNotes}</Text>
          </>
        )}
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Medicines</Text>

        {prescription.prescriptions.map((medicine, index) => (
          <View key={index} style={styles.medicineCard}>
            <Text style={styles.medicineName}>{medicine.medicineName}</Text>

            <Text style={styles.medicineText}>Dosage: {medicine.dosage}</Text>

            <Text style={styles.medicineText}>
              Frequency: {medicine.frequency}
            </Text>

            <Text style={styles.medicineText}>
              Duration: {medicine.duration}
            </Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    paddingBottom: 40,
    backgroundColor: "#F8FAFC",
  },

  title: {
    fontSize: 36,
    fontWeight: "800",
    color: "#0F172A",
    marginBottom: 6,
  },

  date: {
    color: "#64748B",
    fontSize: 14,
    marginBottom: 18,
  },

  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 28,
    padding: 20,
    marginBottom: 18,

    shadowColor: "#2563EB",

    shadowOpacity: 0.08,

    shadowRadius: 18,

    shadowOffset: {
      width: 0,
      height: 8,
    },

    elevation: 4,

    borderWidth: 1,

    borderColor: "#E2E8F0",
  },

  cardTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#0F172A",
    marginBottom: 22,
  },

  label: {
    fontSize: 13,
    fontWeight: "600",
    color: "#64748B",
    marginBottom: 8,
  },

  value: {
    fontSize: 16,
    fontWeight: "600",
    color: "#0F172A",
    marginBottom: 16,
  },

  vital: {
    fontSize: 15,
    fontWeight: "600",
    color: "#0F172A",
    marginBottom: 4,
  },

  divider: {
    height: 1,
    backgroundColor: "#E2E8F0",
    marginVertical: 18,
  },

  medicineCard: {
    backgroundColor: "#F8FAFC",
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    marginBottom: 14,
  },

  medicineName: {
    fontSize: 18,
    fontWeight: "700",
    color: "#0F172A",
    marginBottom: 14,
  },

  medicineText: {
    fontSize: 15,
    color: "#475569",
    marginBottom: 6,
  },
});
