import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Linking,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation, useRoute } from "@react-navigation/native";

import GlassCard from "../components/cards/GlassCard";
import { API_BASE_URL } from "../constants/api";
import { getHealthRecordById } from "../services/medical-record.service";
import { getApiErrorMessage } from "../utils/api-error";
import { formatDate, formatDocumentType, formatInfoValue } from "../utils/format";

export default function HealthRecordDetailScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { id } = route.params;

  const [record, setRecord] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const loadRecord = useCallback(async () => {
    try {
      setLoading(true);
      const response = await getHealthRecordById(id);
      setRecord(response.data.data);
    } catch (error) {
      Alert.alert(
        "Error",
        getApiErrorMessage(error, "Unable to load medical document"),
      );
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadRecord();
  }, [loadRecord]);

  const openDocument = async () => {
    const documentUrl = getDocumentUrl(record);

    if (!documentUrl) {
      Alert.alert("Document unavailable", "No document is attached.");
      return;
    }

    const canOpen = await Linking.canOpenURL(documentUrl);

    if (!canOpen) {
      Alert.alert("Unable to open", "This document cannot be opened.");
      return;
    }

    await Linking.openURL(documentUrl);
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator color="#2563EB" size="large" />
          <Text style={styles.loadingText}>Loading document...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!record) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyTitle}>Document not found</Text>
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

        <Text style={styles.title}>{record.title || "Medical Document"}</Text>
        <Text style={styles.subtitle}>
          {formatDocumentType(record.documentType)}
        </Text>

        <GlassCard>
          <Text style={styles.sectionTitle}>Document Details</Text>

          <Info label="Date" value={formatDate(record.documentDate || record.createdAt)} />
          <Info
            label="File"
            value={record.originalFileName || "Document attached"}
          />
          <Info label="Notes" value={record.notes} />

          <TouchableOpacity style={styles.openButton} onPress={openDocument}>
            <Text style={styles.openButtonText}>Open Document</Text>
          </TouchableOpacity>
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

function getDocumentUrl(record: any) {
  if (!record?.filePath) {
    return "";
  }

  return `${API_BASE_URL.replace("/api", "")}${record.filePath}`;
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
    fontSize: 28,
    fontWeight: "800",
    marginTop: 20,
  },

  subtitle: {
    color: "#2563EB",
    fontWeight: "800",
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

  openButton: {
    marginTop: 18,
    borderRadius: 16,
    backgroundColor: "#2563EB",
    paddingVertical: 14,
    alignItems: "center",
  },

  openButtonText: {
    color: "#FFFFFF",
    fontWeight: "800",
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
