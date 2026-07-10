import { useCallback, useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { HealthRecordDetails } from "../types/HealthRecord";
import { getMyHealthRecord } from "../services/healthRecord.service";
import { logger } from "../utils/logger";

type AppendSection = "consultations" | "labReports" | "medicalDocuments";

const healthRecordQueryKey = ["health-record", "me"] as const;

const appendUniqueById = <T extends { _id: string }>(
  current: T[],
  next: T[],
) => {
  const existingIds = new Set(current.map((item) => item._id));

  return [...current, ...next.filter((item) => !existingIds.has(item._id))];
};

export default function useHealthRecords() {
  const queryClient = useQueryClient();
  const [loadingMore, setLoadingMore] = useState(false);

  const query = useQuery({
    queryKey: healthRecordQueryKey,
    queryFn: async () => {
      const response = await getMyHealthRecord("", "", "");

      return response.data.data as HealthRecordDetails;
    },
  });

  const loadHealthRecord = useCallback(
    async (
      timelineCursor = "",
      labCursor = "",
      documentCursor = "",
      _isRefresh = false,
      appendSection?: AppendSection,
    ) => {
      try {
        if (!appendSection) {
          await query.refetch();
          return;
        }

        setLoadingMore(true);

        const response = await getMyHealthRecord(
          timelineCursor,
          labCursor,
          documentCursor,
        );
        const nextHealthRecord = response.data.data as HealthRecordDetails;

        queryClient.setQueryData<HealthRecordDetails>(
          healthRecordQueryKey,
          (current) => {
            if (!current) {
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
                  ? appendUniqueById(
                      current.labReports,
                      nextHealthRecord.labReports,
                    )
                  : current.labReports,
              medicalDocuments:
                appendSection === "medicalDocuments"
                  ? appendUniqueById(
                      current.medicalDocuments,
                      nextHealthRecord.medicalDocuments,
                    )
                  : current.medicalDocuments,
              meta: {
                consultations:
                  appendSection === "consultations"
                    ? nextHealthRecord.meta.consultations
                    : current.meta.consultations,
                labReports:
                  appendSection === "labReports"
                    ? nextHealthRecord.meta.labReports
                    : current.meta.labReports,
                medicalDocuments:
                  appendSection === "medicalDocuments"
                    ? nextHealthRecord.meta.medicalDocuments
                    : current.meta.medicalDocuments,
              },
            };
          },
        );
      } catch (error) {
        logger.error("Health record load failed", error);
      } finally {
        setLoadingMore(false);
      }
    },
    [query, queryClient],
  );

  const refresh = useCallback(async () => {
    try {
      await query.refetch();
    } catch (error) {
      logger.error("Health record refresh failed", error);
    }
  }, [query]);

  return useMemo(
    () => ({
      healthRecord: query.data ?? null,
      loading: query.isPending && !query.data,
      refreshing: query.isRefetching,
      loadingMore,
      loadHealthRecord,
      refresh,
    }),
    [
      loadHealthRecord,
      loadingMore,
      query.data,
      query.isPending,
      query.isRefetching,
      refresh,
    ],
  );
}
