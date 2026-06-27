import { useCallback, useState, useMemo } from "react";

import { HealthRecordDetails } from "../types/HealthRecord";

import { getMyHealthRecord } from "../services/healthRecord.service";

type AppendSection = "consultations" | "labReports" | "medicalDocuments";

const appendUniqueById = <T extends { _id: string }>(current: T[], next: T[]) => {
  const existingIds = new Set(current.map((item) => item._id));

  return [...current, ...next.filter((item) => !existingIds.has(item._id))];
};

export default function useHealthRecords() {
  const [healthRecord, setHealthRecord] = useState<HealthRecordDetails | null>(
    null,
  );

  const [loading, setLoading] = useState(false);

  const [refreshing, setRefreshing] = useState(false);

  const [loadingMore, setLoadingMore] = useState(false);

  const loadHealthRecord = useCallback(
    async (
      timelinePage = 1,
      labPage = 1,
      documentPage = 1,
      isRefresh = false,
      appendSection?: AppendSection,
    ) => {
      try {
        if (isRefresh) {
          setRefreshing(true);
        } else if (appendSection) {
          setLoadingMore(true);
        } else {
          setLoading(true);
        }

        const response = await getMyHealthRecord(
          timelinePage,
          labPage,
          documentPage,
        );

        const nextHealthRecord = response.data.data as HealthRecordDetails;

        setHealthRecord((current) => {
          if (!appendSection || !current || isRefresh) {
            return nextHealthRecord;
          }

          return {
            ...nextHealthRecord,
            consultations:
              appendSection === "consultations"
                ? appendUniqueById(
                    current.consultations,
                    nextHealthRecord.consultations,
                  )
                : current.consultations,
            labReports:
              appendSection === "labReports"
                ? appendUniqueById(current.labReports, nextHealthRecord.labReports)
                : current.labReports,
            medicalDocuments:
              appendSection === "medicalDocuments"
                ? appendUniqueById(
                    current.medicalDocuments,
                    nextHealthRecord.medicalDocuments,
                  )
                : current.medicalDocuments,
          };
        });
      } catch (error: any) {
        console.log("Health Record Error", error?.response?.data ?? error);
      } finally {
        setLoading(false);

        setRefreshing(false);

        setLoadingMore(false);
      }
    },
    [],
  );

  const refresh = useCallback(
    (timelinePage = 1, labPage = 1, documentPage = 1) => {
      loadHealthRecord(timelinePage, labPage, documentPage, true);
    },
    [loadHealthRecord],
  );

  return useMemo(
    () => ({
      healthRecord,
      loading,
      refreshing,
      loadingMore,
      loadHealthRecord,
      refresh,
    }),
    [healthRecord, loading, refreshing, loadingMore, loadHealthRecord, refresh],
  );
}
