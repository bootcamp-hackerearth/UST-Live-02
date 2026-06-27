import React, { useCallback, useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect, useNavigation } from "@react-navigation/native";

import GlassCard from "../components/cards/GlassCard";
import {
  getMyLabReports,
  getMyHealthRecords,
  getMyPrescriptions,
} from "../services/medical-record.service";
import { getApiErrorMessage } from "../utils/api-error";
import { formatDate, formatDocumentType } from "../utils/format";

type RecordTab = "PRESCRIPTIONS" | "HEALTH_RECORDS" | "LAB_REPORTS";

const PAGE_LIMIT = 10;

// --- Tab-keyed lookups (extracted to avoid nested ternaries) ---

const EMPTY_TITLE_BY_TAB: Record<RecordTab, string> = {
  PRESCRIPTIONS: "No prescriptions found",
  HEALTH_RECORDS: "No health records found",
  LAB_REPORTS: "No lab reports found",
};

const EMPTY_SUBTITLE_BY_TAB: Record<RecordTab, string> = {
  PRESCRIPTIONS: "Completed consultation prescriptions will appear here.",
  HEALTH_RECORDS: "Uploaded health records will appear here.",
  LAB_REPORTS: "Uploaded lab reports will appear here.",
};

const fetchRecordsForTab = (tab: RecordTab, params: any) => {
  if (tab === "PRESCRIPTIONS") return getMyPrescriptions(params);
  if (tab === "HEALTH_RECORDS") return getMyHealthRecords(params);
  return getMyLabReports(params);
};

export default function MedicalRecordsScreen() {
  const navigation = useNavigation<any>();

  const [activeTab, setActiveTab] = useState<RecordTab>("PRESCRIPTIONS");
  const [recordsByTab, setRecordsByTab] = useState<Record<RecordTab, any[]>>({
    PRESCRIPTIONS: [],
    HEALTH_RECORDS: [],
    LAB_REPORTS: [],
  });
  const [pagesByTab, setPagesByTab] = useState<Record<RecordTab, number>>({
    PRESCRIPTIONS: 1,
    HEALTH_RECORDS: 1,
    LAB_REPORTS: 1,
  });
  const [totalPagesByTab, setTotalPagesByTab] = useState<
    Record<RecordTab, number>
  >({
    PRESCRIPTIONS: 1,
    HEALTH_RECORDS: 1,
    LAB_REPORTS: 1,
  });
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const activeRecords = recordsByTab[activeTab];
  const hasMore = pagesByTab[activeTab] < totalPagesByTab[activeTab];

  const loadRecords = useCallback(
    async (tab = activeTab, nextPage = 1, append = false, showLoader = true) => {
      try {
        if (append) {
          setLoadingMore(true);
        } else if (showLoader) {
          setLoading(true);
        }

        setErrorMessage("");

        const params = {
          page: nextPage,
          limit: PAGE_LIMIT,
        };

        const response = await fetchRecordsForTab(tab, params);

        const records = response.data.data || [];
        const meta = response.data.pagination || {};

        setRecordsByTab((currentRecords) => ({
          ...currentRecords,
          [tab]: append ? [...currentRecords[tab], ...records] : records,
        }));
        setPagesByTab((currentPages) => ({
          ...currentPages,
          [tab]: meta.page || nextPage,
        }));
        setTotalPagesByTab((currentTotalPages) => ({
          ...currentTotalPages,
          [tab]: meta.totalPages || 1,
        }));
      } catch (error) {
        setErrorMessage(
          getApiErrorMessage(error, "Unable to load medical records"),
        );
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [activeTab],
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadRecords(activeTab, 1, false, false);
    setRefreshing(false);
  }, [activeTab, loadRecords]);

  const loadMoreRecords = useCallback(() => {
    if (!hasMore || loading || loadingMore) {
      return;
    }

    loadRecords(activeTab, pagesByTab[activeTab] + 1, true, false);
  }, [activeTab, hasMore, loadRecords, loading, loadingMore, pagesByTab]);

  useFocusEffect(
    useCallback(() => {
      loadRecords(activeTab, 1);
    }, [activeTab, loadRecords]),
  );

  const changeTab = useCallback((tab: RecordTab) => {
    setActiveTab(tab);
  }, []);

  const renderPrescription = useCallback(
    ({ item }: { item: any }) => (
      <TouchableOpacity
        activeOpacity={0.86}
        onPress={() =>
          navigation.navigate("PrescriptionDetail", { id: item._id })
        }
      >
        <GlassCard>
          <Text style={styles.cardTitle}>
            Dr. {item?.doctorEmployeeId?.name || "Not available"}
          </Text>

          <Text style={styles.departmentText}>
            {item?.doctorEmployeeId?.department || "Department not available"}
          </Text>

          <Text style={styles.cardDate}>{formatDate(item?.createdAt)}</Text>

          <Text style={styles.openHint}>View full prescription</Text>
        </GlassCard>
      </TouchableOpacity>
    ),
    [navigation],
  );

  const renderDocumentRecord = useCallback(
    ({ item }: { item: any }) => (
      <TouchableOpacity
        activeOpacity={0.86}
        onPress={() =>
          navigation.navigate("HealthRecordDetail", { id: item._id })
        }
      >
        <GlassCard>
          <Text style={styles.cardTitle}>{item?.title || "Untitled record"}</Text>

          <Text style={styles.departmentText}>
            {formatDocumentType(item?.documentType)}
          </Text>

          <Text style={styles.cardDate}>
            {formatDate(item?.documentDate || item?.createdAt)}
          </Text>

          <Text style={styles.openHint}>View document details</Text>
        </GlassCard>
      </TouchableOpacity>
    ),
    [navigation],
  );

  const emptyText = useMemo(() => {
    if (errorMessage) {
      return errorMessage;
    }

    return EMPTY_TITLE_BY_TAB[activeTab];
  }, [activeTab, errorMessage]);

  const emptySubtitle = useMemo(() => {
    if (errorMessage) {
      return "Pull down to try again.";
    }

    return EMPTY_SUBTITLE_BY_TAB[activeTab];
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

  const renderActiveRecord =
    activeTab === "PRESCRIPTIONS"
      ? renderPrescription
      : renderDocumentRecord;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Medical Records</Text>

        <Text style={styles.subtitle}>
          View your prescriptions and health documents.
        </Text>
      </View>

      <View style={styles.tabs}>
        <TouchableOpacity
          style={[
            styles.tabButton,
            activeTab === "PRESCRIPTIONS" && styles.activeTab,
          ]}
          onPress={() => changeTab("PRESCRIPTIONS")}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === "PRESCRIPTIONS" && styles.activeTabText,
            ]}
          >
            Prescriptions
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.tabButton,
            activeTab === "HEALTH_RECORDS" && styles.activeTab,
          ]}
          onPress={() => changeTab("HEALTH_RECORDS")}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === "HEALTH_RECORDS" && styles.activeTabText,
            ]}
          >
            Health Records
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.tabButton,
            activeTab === "LAB_REPORTS" && styles.activeTab,
          ]}
          onPress={() => changeTab("LAB_REPORTS")}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === "LAB_REPORTS" && styles.activeTabText,
            ]}
          >
            Lab Reports
          </Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator color="#2563EB" size="large" />

          <Text style={styles.loadingText}>Loading medical records...</Text>
        </View>
      ) : (
        <FlatList
          data={activeRecords}
          keyExtractor={(item) => item._id}
          renderItem={renderActiveRecord}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          initialNumToRender={8}
          maxToRenderPerBatch={8}
          windowSize={5}
          onEndReached={loadMoreRecords}
          onEndReachedThreshold={0.4}
          ListFooterComponent={listFooter}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyTitle}>{emptyText}</Text>

              <Text style={styles.emptySubtitle}>{emptySubtitle}</Text>
            </View>
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

  tabs: {
    flexDirection: "row",
    marginHorizontal: 20,
    marginTop: 20,
    padding: 6,
    borderRadius: 18,
    backgroundColor: "#EAF1FF",
  },

  tabButton: {
    flex: 1,
    height: 46,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },

  activeTab: {
    backgroundColor: "#2563EB",
  },

  tabText: {
    color: "#475569",
    fontWeight: "700",
    fontSize: 12,
    textAlign: "center",
  },

  activeTabText: {
    color: "#FFFFFF",
  },

  listContent: {
    padding: 20,
    paddingBottom: 120,
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

  cardTitle: {
    color: "#0F172A",
    fontSize: 18,
    fontWeight: "800",
  },

  cardDate: {
    color: "#64748B",
    marginTop: 8,
  },

  departmentText: {
    color: "#2563EB",
    fontWeight: "700",
    marginTop: 6,
  },

  openHint: {
    color: "#2563EB",
    fontWeight: "800",
    marginTop: 18,
  },

  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    padding: 40,
    marginTop: 80,
  },

  emptyTitle: {
    color: "#0F172A",
    fontSize: 20,
    fontWeight: "800",
  },

  emptySubtitle: {
    color: "#64748B",
    marginTop: 8,
    textAlign: "center",
    lineHeight: 22,
  },

  footerLoader: {
    paddingVertical: 18,
  },
});