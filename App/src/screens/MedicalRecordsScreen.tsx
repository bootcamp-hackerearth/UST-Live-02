import React, { useCallback, useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect, useNavigation } from "@react-navigation/native";

import EmptyState from "../components/common/EmptyState";
import CardSkeleton from "../components/loaders/CardSkeleton";
import DocumentRecordCard from "../components/medical-records/DocumentRecordCard";
import MedicalRecordTabs from "../components/medical-records/MedicalRecordTabs";
import PrescriptionRecordCard from "../components/medical-records/PrescriptionRecordCard";
import { useHealthRecords } from "../hooks/useHealthRecords";
import {
  DocumentRecord,
  MedicalRecordTab,
  PrescriptionRecord,
} from "../types/MedicalRecord";

export default function MedicalRecordsScreen() {
  const navigation = useNavigation<any>();

  const [activeTab, setActiveTab] =
    useState<MedicalRecordTab>("PRESCRIPTIONS");
  const {
    activeRecords,
    errorMessage,
    loadMore,
    loadRecords,
    loading,
    loadingMore,
    refresh,
    refreshing,
  } = useHealthRecords(activeTab);

  useFocusEffect(
    useCallback(() => {
      loadRecords(activeTab, 1);
    }, [activeTab, loadRecords]),
  );

  const changeTab = useCallback((tab: MedicalRecordTab) => {
    setActiveTab(tab);
  }, []);

  const openPrescription = useCallback(
    (item: PrescriptionRecord) => {
      navigation.navigate("PrescriptionDetail", { id: item._id });
    },
    [navigation],
  );

  const openDocument = useCallback(
    (item: DocumentRecord) => {
      navigation.navigate("HealthRecordDetail", { id: item._id });
    },
    [navigation],
  );

  const emptyText = useMemo(() => {
    if (errorMessage) {
      return errorMessage;
    }

    return activeTab === "PRESCRIPTIONS"
      ? "No prescriptions found"
      : activeTab === "HEALTH_RECORDS"
        ? "No health records found"
        : "No lab reports found";
  }, [activeTab, errorMessage]);

  const emptySubtitle = useMemo(() => {
    if (errorMessage) {
      return "Pull down to try again.";
    }

    return activeTab === "PRESCRIPTIONS"
      ? "Completed consultation prescriptions will appear here."
      : activeTab === "HEALTH_RECORDS"
        ? "Uploaded health records will appear here."
        : "Uploaded lab reports will appear here.";
  }, [activeTab, errorMessage]);

  const listFooter = useMemo(() => {
    if (!loadingMore) {
      return null;
    }

    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator color="#2563EB" />
      </View>
    );
  }, [loadingMore]);

  const renderActiveRecord = useCallback(
    ({ item }: { item: PrescriptionRecord | DocumentRecord }) => {
      if (activeTab === "PRESCRIPTIONS") {
        return (
          <PrescriptionRecordCard
            item={item as PrescriptionRecord}
            onPress={openPrescription}
          />
        );
      }

      return (
        <DocumentRecordCard item={item as DocumentRecord} onPress={openDocument} />
      );
    },
    [activeTab, openDocument, openPrescription],
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Medical Records</Text>

        <Text style={styles.subtitle}>
          View your prescriptions and health documents.
        </Text>
      </View>

      <MedicalRecordTabs activeTab={activeTab} onChange={changeTab} />

      {loading ? (
        <View style={styles.skeletonList}>
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
        </View>
      ) : (
        <FlatList
          data={activeRecords}
          keyExtractor={(item) => item._id}
          renderItem={renderActiveRecord}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={refresh} />
          }
          initialNumToRender={8}
          maxToRenderPerBatch={8}
          windowSize={5}
          onEndReached={loadMore}
          onEndReachedThreshold={0.4}
          ListFooterComponent={listFooter}
          ListEmptyComponent={
            <EmptyState title={emptyText} subtitle={emptySubtitle} />
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F4F7FC",
  },

  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },

  title: {
    fontSize: 30,
    fontWeight: "800",
    color: "#0F172A",
  },

  subtitle: {
    color: "#64748B",
    marginTop: 8,
    lineHeight: 22,
  },

  listContent: {
    padding: 20,
    paddingBottom: 120,
  },

  skeletonList: {
    paddingTop: 20,
  },

  footerLoader: {
    paddingVertical: 18,
  },
});
