import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation, useRoute } from "@react-navigation/native";

import GlassCard from "../components/cards/GlassCard";
import { getPrescriptionById } from "../services/medical-record.service";
import { getApiErrorMessage } from "../utils/api-error";
import { formatDate, formatInfoValue } from "../utils/format";

export default function PrescriptionDetailScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { id } = route.params;

  const [prescription, setPrescription] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const loadPrescription = useCallback(async () => {
    try {
      setLoading(true);
      const response = await getPrescriptionById(id);
      setPrescription(response.data.data);
    } catch (error) {
      Alert.alert(
        "Error",
        getApiErrorMessage(error, "Unable to load prescription"),
      );
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadPrescription();
  }, [loadPrescription]);

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator color="#2563EB" size="large" />
          <Text style={styles.loadingText}>Loading prescription...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!prescription) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyTitle}>Prescription not found</Text>
          <TouchableOpacity style={styles.backButton} onPress={navigation.goBack}>
            <Text style={styles.backButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        <TouchableOpacity style={styles.backButton} onPress={navigation.goBack}>
          <Text style={styles.backButtonText}>Back</Text>
        </TouchableOpacity>

        <Text style={styles.title}>Prescription</Text>
        <Text style={styles.subtitle}>
          {formatDate(prescription?.createdAt)}
        </Text>

        <GlassCard>
          <Text style={styles.sectionTitle}>Consultation Details</Text>

          <Info label="Diagnosis" value={prescription?.diagnosis} />
          <Info
            label="Doctor"
            value={`Dr. ${
              prescription?.doctorEmployeeId?.name || "Not available"
            }`}
          />
          <Info label="Symptoms" value={prescription?.symptoms} />
          <Info label="Vitals" value={prescription?.vitals} />
          <Info label="Doctor Notes" value={prescription?.doctorNotes} />
        </GlassCard>

        <GlassCard>
          <Text style={styles.sectionTitle}>Medicines</Text>

          {(prescription?.prescriptions || []).length ? (
            prescription.prescriptions.map((medicine: any) => (
              <View key={medicine._id} style={styles.medicineItem}>
                <Text style={styles.medicineName}>{medicine.medicineName}</Text>
                <Text style={styles.medicineMeta}>Dosage: {medicine.dosage}</Text>
                <Text style={styles.medicineMeta}>
                  Frequency: {medicine.frequency}
                </Text>
                <Text style={styles.medicineMeta}>
                  Duration: {medicine.duration}
                </Text>
                {medicine.instructions ? (
                  <Text style={styles.instructions}>
                    Instructions: {medicine.instructions}
                  </Text>
                ) : null}
              </View>
            ))
          ) : (
            <Text style={styles.mutedText}>No medicines added</Text>
          )}
        </GlassCard>
      </ScrollView>
    </SafeAreaView>
  );
}

function Info({ label, value }: { label: string; value?: unknown }) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{formatInfoValue(value)}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F4F7FC",
  },

  content: {
    padding: 20,
    paddingBottom: 120,
  },

  title: {
    color: "#0F172A",
    fontSize: 30,
    fontWeight: "800",
    marginTop: 20,
  },

  subtitle: {
    color: "#64748B",
    marginTop: 8,
    marginBottom: 18,
  },

  sectionTitle: {
    color: "#0F172A",
    fontSize: 18,
    fontWeight: "800",
    marginBottom: 12,
  },

  backButton: {
    alignSelf: "flex-start",
    borderRadius: 14,
    backgroundColor: "#DBEAFE",
    paddingHorizontal: 16,
    paddingVertical: 10,
  },

  backButtonText: {
    color: "#2563EB",
    fontWeight: "800",
  },

  infoRow: {
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
    paddingVertical: 12,
  },

  infoLabel: {
    color: "#64748B",
    fontWeight: "700",
    marginBottom: 6,
  },

  infoValue: {
    color: "#0F172A",
    fontWeight: "700",
    lineHeight: 22,
  },

  medicineItem: {
    borderRadius: 16,
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    padding: 14,
    marginTop: 12,
  },

  medicineName: {
    color: "#0F172A",
    fontSize: 16,
    fontWeight: "800",
    marginBottom: 8,
  },

  medicineMeta: {
    color: "#475569",
    marginTop: 4,
  },

  instructions: {
    color: "#2563EB",
    fontWeight: "700",
    marginTop: 8,
  },

  mutedText: {
    color: "#64748B",
    fontWeight: "700",
  },

  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
  },

  loadingText: {
    color: "#64748B",
    fontWeight: "700",
  },

  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },

  emptyTitle: {
    color: "#0F172A",
    fontSize: 20,
    fontWeight: "800",
    marginBottom: 18,
  },
});
