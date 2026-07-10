import React, { useCallback, useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  RefreshControl,
} from "react-native";

import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import GlassCard from "../components/cards/GlassCard";
import StatCard from "../components/cards/StatCard";
import EmptyState from "../components/common/EmptyState";
import HealthRecordTabs, {
  HealthRecordTab,
} from "../components/health-records/HealthRecordTabs";
import { getFileUrl } from "../utils/fileUrl";
import CardSkeleton from "../components/loaders/CardSkeleton";
import OfflineBanner from "../components/common/OfflineBanner";
import OfflineSkeletonState from "../components/loaders/OfflineSkeletonState";
import TimelineCard from "../components/health-records/TimelineCard";
import PrescriptionCard from "../components/health-records/PrescriptionCard";
import LabReportCard from "../components/health-records/LabReportCard";
import MedicalDocumentCard from "../components/health-records/MedicalDocumentCard";
import { downloadPrescriptionPdf } from "../utils/downloadPrescriptionPdf";
import useHealthRecords from "../hooks/useHealthRecords";
import {
  Consultation,
  PrescriptionGroup,
  LabReport,
  MedicalDocument,
} from "../types/HealthRecord";

import { RootStackParamList } from "../types/navigation";
import { openPdf } from "../utils/openPdf";
import { downloadFile } from "../utils/downloadFile";
import { getMyHealthRecord } from "../services/healthRecord.service";
import { downloadHealthRecordPdf } from "../utils/downloadHealthRecordPdf";
import { showToast } from "../services/toast.service";
import useOfflineStatus from "../hooks/useOfflineStatus";
import { logger } from "../utils/logger";

type HealthRecordListItem =
  | { type: "TIMELINE"; id: string; value: Consultation }
  | { type: "PRESCRIPTIONS"; id: string; value: PrescriptionGroup }
  | { type: "REPORTS"; id: string; value: LabReport }
  | { type: "DOCUMENTS"; id: string; value: MedicalDocument };

const getTime = (value?: string) => {
  const timestamp = new Date(value ?? 0).getTime();

  return Number.isNaN(timestamp) ? 0 : timestamp;
};

const getRecordFileName = (title: string, url: string) => {
  const urlWithoutQuery = url.split("?")[0];
  const extension = urlWithoutQuery.match(/\.([a-z0-9]+)$/i)?.[1] ?? "pdf";
  const hasExtension = new RegExp(`\\.${extension}$`, "i").test(title);

  return hasExtension ? title : `${title}.${extension}`;
};

export default function HealthRecordScreen() {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const {
    healthRecord,
    loading,
    refreshing,
    loadingMore,
    loadHealthRecord,
    refresh,
  } = useHealthRecords();
  const offline = useOfflineStatus();
  const [activeTab, setActiveTab] = useState<HealthRecordTab>("TIMELINE");
  const [downloadingRecord, setDownloadingRecord] = useState(false);
  const prescriptions = useMemo(() => {
    return (
      healthRecord?.consultations
        .filter((consultation) => consultation.prescriptions?.length)
        .map((consultation) => ({
          consultationId: consultation._id,
          doctor: consultation.doctorEmployeeId?.name,
          department: consultation.doctorEmployeeId?.department,
          specialization: consultation.doctorEmployeeId?.specialization,
          date: consultation.createdAt,
          diagnosis: consultation.diagnosis,
          symptoms: consultation.symptoms,
          doctorNotes: consultation.doctorNotes,
          vitals: consultation.vitals,
          prescriptions: consultation.prescriptions,
        }))
        .sort((a, b) => getTime(b.date) - getTime(a.date)) ?? []
    );
  }, [healthRecord]);
  const consultations = useMemo(
    () =>
      [...(healthRecord?.consultations ?? [])].sort(
        (a, b) => getTime(b.createdAt) - getTime(a.createdAt),
      ),
    [healthRecord],
  );

  const reports = useMemo(
    () =>
      [...(healthRecord?.labReports ?? [])].sort(
        (a, b) => getTime(b.reportDate) - getTime(a.reportDate),
      ),
    [healthRecord],
  );

  const documents = useMemo(
    () =>
      [...(healthRecord?.medicalDocuments ?? [])].sort(
        (a, b) => getTime(b.recordDate) - getTime(a.recordDate),
      ),
    [healthRecord],
  );

  const activeRecords = useMemo<HealthRecordListItem[]>(() => {
    if (activeTab === "TIMELINE") {
      return consultations.map((consultation) => ({
        type: "TIMELINE",
        id: consultation._id,
        value: consultation,
      }));
    }

    if (activeTab === "PRESCRIPTIONS") {
      return prescriptions.map((prescription) => ({
        type: "PRESCRIPTIONS",
        id: prescription.consultationId,
        value: prescription,
      }));
    }

    if (activeTab === "REPORTS") {
      return reports.map((report) => ({
        type: "REPORTS",
        id: report._id,
        value: report,
      }));
    }

    return documents.map((document) => ({
      type: "DOCUMENTS",
      id: document._id,
      value: document,
    }));
  }, [activeTab, consultations, documents, prescriptions, reports]);

  const handleViewPrescription = useCallback(
    (prescription: PrescriptionGroup) => {
      navigation.navigate("PrescriptionDetails", {
        prescription,
      });
    },
    [navigation],
  );

  const handleDownloadPrescription = useCallback(
    async (prescription: PrescriptionGroup) => {
      await downloadPrescriptionPdf(prescription);
    },
    [],
  );
  const handleViewReport = useCallback(async (report: LabReport) => {
    const url = getFileUrl(report.documentUrl);

    if (!url) {
      return;
    }

    await openPdf(url, getRecordFileName(report.title, url));
  }, []);
  const handleDownloadReport = useCallback(async (report: LabReport) => {
    const url = getFileUrl(report.documentUrl);

    if (!url) {
      return;
    }

    await downloadFile(url, getRecordFileName(report.title, url));
  }, []);
  const handleViewDocument = useCallback(async (document: MedicalDocument) => {
    const url = getFileUrl(document.documentUrl);

    if (!url) {
      return;
    }

    await openPdf(url, getRecordFileName(document.title, url));
  }, []);
  const handleDownloadDocument = useCallback(
    async (document: MedicalDocument) => {
      const url = getFileUrl(document.documentUrl);

      if (!url) {
        return;
      }

      await downloadFile(url, getRecordFileName(document.title, url));
    },
    [],
  );
  const handleDownloadCompleteRecord = useCallback(async () => {
    if (downloadingRecord) {
      return;
    }

    try {
      setDownloadingRecord(true);

      const response = await getMyHealthRecord("", "", "", 10000);
      await downloadHealthRecordPdf(response.data.data);
      showToast("Complete health record is ready to save or share.", "success");
    } catch (error) {
      logger.error("Complete health record download failed", error);
      showToast("Unable to download complete health record.", "error");
    } finally {
      setDownloadingRecord(false);
    }
  }, [downloadingRecord]);
  const onRefresh = useCallback(() => {
    refresh();
  }, [refresh]);

  const loadMoreRecords = useCallback(() => {
    if (!healthRecord || loading || loadingMore) {
      return;
    }

    if (
      (activeTab === "TIMELINE" || activeTab === "PRESCRIPTIONS") &&
      healthRecord.meta.consultations.hasNextPage &&
      healthRecord.meta.consultations.nextCursor
    ) {
      loadHealthRecord(
        healthRecord.meta.consultations.nextCursor,
        "",
        "",
        false,
        "consultations",
      );
      return;
    }

    if (
      activeTab === "REPORTS" &&
      healthRecord.meta.labReports.hasNextPage &&
      healthRecord.meta.labReports.nextCursor
    ) {
      loadHealthRecord(
        "",
        healthRecord.meta.labReports.nextCursor,
        "",
        false,
        "labReports",
      );
      return;
    }

    if (
      activeTab === "DOCUMENTS" &&
      healthRecord.meta.medicalDocuments.hasNextPage &&
      healthRecord.meta.medicalDocuments.nextCursor
    ) {
      loadHealthRecord(
        "",
        "",
        healthRecord.meta.medicalDocuments.nextCursor,
        false,
        "medicalDocuments",
      );
    }
  }, [activeTab, healthRecord, loadHealthRecord, loading, loadingMore]);

  const keyExtractor = useCallback((item: HealthRecordListItem) => item.id, []);

  const emptyTitle = useMemo(() => {
    if (activeTab === "TIMELINE") {
      return "No consultations found";
    }

    if (activeTab === "PRESCRIPTIONS") {
      return "No prescriptions found";
    }

    if (activeTab === "REPORTS") {
      return "No reports found";
    }

    return "No documents found";
  }, [activeTab]);

  const renderHealthRecordItem = useCallback(
    ({ item }: { item: HealthRecordListItem }) => {
      if (item.type === "TIMELINE") {
        return (
          <View style={styles.listItem}>
            <TimelineCard consultation={item.value} />
          </View>
        );
      }

      if (item.type === "PRESCRIPTIONS") {
        return (
          <View style={styles.listItem}>
            <PrescriptionCard
              item={item.value}
              onView={handleViewPrescription}
              onDownload={handleDownloadPrescription}
            />
          </View>
        );
      }

      if (item.type === "REPORTS") {
        return (
          <View style={styles.listItem}>
            <LabReportCard
              report={item.value}
              onView={handleViewReport}
              onDownload={handleDownloadReport}
            />
          </View>
        );
      }

      return (
        <View style={styles.listItem}>
          <MedicalDocumentCard
            document={item.value}
            onView={handleViewDocument}
            onDownload={handleDownloadDocument}
          />
        </View>
      );
    },
    [
      handleDownloadDocument,
      handleDownloadPrescription,
      handleDownloadReport,
      handleViewDocument,
      handleViewPrescription,
      handleViewReport,
    ],
  );

  const listHeader = useMemo(
    () => (
      <>
        {offline ? <OfflineBanner /> : null}

        <View style={styles.header}>
          <View style={styles.headerRow}>
            <Text style={styles.heading}>Health Records</Text>

            <TouchableOpacity
              activeOpacity={0.85}
              onPress={handleDownloadCompleteRecord}
              disabled={downloadingRecord}
              style={[
                styles.downloadButton,
                downloadingRecord && styles.downloadButtonDisabled,
              ]}
            >
              <Text style={styles.downloadButtonText}>
                {downloadingRecord ? "..." : "PDF"}
              </Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.subtitle}>
            View consultations, prescriptions, reports and documents.
          </Text>
        </View>

        <View style={styles.statsContainer}>
          <View style={styles.statsRow}>
            <StatCard
              title="Visits"
              value={
                healthRecord?.meta.consultations.totalRecords ??
                healthRecord?.consultations.length ??
                0
              }
            />

            <StatCard
              title="Reports"
              value={
                healthRecord?.meta.labReports.totalRecords ??
                healthRecord?.labReports.length ??
                0
              }
            />

            <StatCard
              title="Documents"
              value={
                healthRecord?.meta.medicalDocuments.totalRecords ??
                healthRecord?.medicalDocuments.length ??
                0
              }
            />
          </View>
        </View>

        <View style={styles.tabsContainer}>
          <GlassCard>
            <HealthRecordTabs activeTab={activeTab} onChange={setActiveTab} />
          </GlassCard>
        </View>
      </>
    ),
    [
      activeTab,
      downloadingRecord,
      handleDownloadCompleteRecord,
      healthRecord,
      offline,
    ],
  );

  const listFooter = useMemo(
    () =>
      loadingMore ? (
        <View style={styles.loadingMoreContainer}>
          <ActivityIndicator color="#2563EB" />
        </View>
      ) : null,
    [loadingMore],
  );

  if ((loading || offline) && !healthRecord) {
    return (
      <View style={styles.container}>
        {offline ? (
          <OfflineSkeletonState message="Loading saved health records while offline." />
        ) : (
          <>
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
          </>
        )}
      </View>
    );
  }

  if (!healthRecord) {
    return (
      <View style={styles.loaderContainer}>
        <Text>No health records found</Text>
      </View>
    );
  }

  return (
    <FlatList
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      data={activeRecords}
      keyExtractor={keyExtractor}
      onEndReached={loadMoreRecords}
      onEndReachedThreshold={0.25}
      initialNumToRender={5}
      maxToRenderPerBatch={5}
      windowSize={7}
      removeClippedSubviews
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor="#2563EB"
        />
      }
      ListHeaderComponent={listHeader}
      ListEmptyComponent={
        loading ? null : (
          <EmptyState
            title={emptyTitle}
            message="New items will appear here as your care team updates your record."
          />
        )
      }
      renderItem={renderHealthRecordItem}
      ListFooterComponent={listFooter}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F4F7FC",
  },
  contentContainer: {
    paddingBottom: 120,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F4F7FC",
    padding: 20,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 70,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  heading: {
    fontSize: 30,
    fontWeight: "800",
    color: "#0F172A",
  },
  subtitle: {
    color: "#64748B",
    marginTop: 8,
    fontSize: 15,
    lineHeight: 22,
  },
  downloadButton: {
    minWidth: 54,
    height: 38,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 8,
    backgroundColor: "#2563EB",
  },
  downloadButtonDisabled: {
    opacity: 0.6,
  },
  downloadButtonText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "800",
  },
  statsContainer: {
    paddingHorizontal: 20,
    marginTop: 20,
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  tabsContainer: {
    marginHorizontal: 20,
    marginTop: 20,
  },
  listItem: {
    marginHorizontal: 20,
  },
  emptyText: {
    textAlign: "center",
    color: "#64748B",
    marginTop: 40,
    marginBottom: 20,
    fontSize: 16,
  },
  loadingMoreContainer: {
    paddingVertical: 18,
    alignItems: "center",
  },
});
