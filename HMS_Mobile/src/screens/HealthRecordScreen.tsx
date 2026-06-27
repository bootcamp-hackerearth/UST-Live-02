import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
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

type HealthRecordListItem =
  | { type: "TIMELINE"; id: string; value: Consultation }
  | { type: "PRESCRIPTIONS"; id: string; value: PrescriptionGroup }
  | { type: "REPORTS"; id: string; value: LabReport }
  | { type: "DOCUMENTS"; id: string; value: MedicalDocument };

export default function HealthRecordScreen() {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const { healthRecord, loading, refreshing, loadingMore, loadHealthRecord, refresh } =
    useHealthRecords();
  const [timelinePage, setTimelinePage] = useState(1);

  const [labPage, setLabPage] = useState(1);

  const [documentPage, setDocumentPage] = useState(1);

  const [activeTab, setActiveTab] = useState<HealthRecordTab>("TIMELINE");
  useEffect(() => {
    loadHealthRecord(1, 1, 1);
  }, [loadHealthRecord]);
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
        })) ?? []
    );
  }, [healthRecord]);
  const consultations = useMemo(
    () => healthRecord?.consultations ?? [],
    [healthRecord],
  );

  const reports = useMemo(() => healthRecord?.labReports ?? [], [healthRecord]);

  const documents = useMemo(
    () => healthRecord?.medicalDocuments ?? [],
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

    await openPdf(url, `${report.title}.pdf`);
  }, []);
  const handleDownloadReport = useCallback(async (report: LabReport) => {
    const url = getFileUrl(report.documentUrl);

    if (!url) {
      return;
    }

    await downloadFile(url, `${report.title}.pdf`);
  }, []);
  const handleViewDocument = useCallback(async (document: MedicalDocument) => {
    const url = getFileUrl(document.documentUrl);

    if (!url) {
      return;
    }

    await openPdf(url, `${document.title}.pdf`);
  }, []);
  const handleDownloadDocument = useCallback(
    async (document: MedicalDocument) => {
      const url = getFileUrl(document.documentUrl);

      if (!url) {
        return;
      }

      await downloadFile(url, `${document.title}.pdf`);
    },
    [],
  );
  const onRefresh = useCallback(() => {
    setTimelinePage(1);
    setLabPage(1);
    setDocumentPage(1);
    refresh(1, 1, 1);
  }, [refresh]);

  const loadMoreRecords = useCallback(() => {
    if (!healthRecord || loading || loadingMore) {
      return;
    }

    if (
      (activeTab === "TIMELINE" || activeTab === "PRESCRIPTIONS") &&
      timelinePage < healthRecord.meta.consultations.totalPages
    ) {
      const nextPage = timelinePage + 1;

      setTimelinePage(nextPage);
      loadHealthRecord(nextPage, labPage, documentPage, false, "consultations");
      return;
    }

    if (
      activeTab === "REPORTS" &&
      labPage < healthRecord.meta.labReports.totalPages
    ) {
      const nextPage = labPage + 1;

      setLabPage(nextPage);
      loadHealthRecord(timelinePage, nextPage, documentPage, false, "labReports");
      return;
    }

    if (
      activeTab === "DOCUMENTS" &&
      documentPage < healthRecord.meta.medicalDocuments.totalPages
    ) {
      const nextPage = documentPage + 1;

      setDocumentPage(nextPage);
      loadHealthRecord(
        timelinePage,
        labPage,
        nextPage,
        false,
        "medicalDocuments",
      );
    }
  }, [
    activeTab,
    documentPage,
    healthRecord,
    labPage,
    loadHealthRecord,
    loading,
    loadingMore,
    timelinePage,
  ]);

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
        <View style={styles.header}>
          <Text style={styles.heading}>Health Records</Text>

          <Text style={styles.subtitle}>
            View consultations, prescriptions, reports and documents.
          </Text>
        </View>

        <View style={styles.statsContainer}>
          <View style={styles.statsRow}>
            <StatCard
              title="Visits"
              value={healthRecord?.meta.consultations.totalRecords ?? 0}
            />

            <StatCard
              title="Reports"
              value={healthRecord?.meta.labReports.totalRecords ?? 0}
            />

            <StatCard
              title="Documents"
              value={healthRecord?.meta.medicalDocuments.totalRecords ?? 0}
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
    [activeTab, healthRecord],
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

  if (loading && !healthRecord) {
    return (
      <View style={styles.container}>
        <CardSkeleton />
        <CardSkeleton />
        <CardSkeleton />
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
      ListEmptyComponent={!loading ? <EmptyState title={emptyTitle} /> : null}
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
