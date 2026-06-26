import { useCallback, useState } from "react";

import {
  getMyHealthRecords,
  getMyLabReports,
  getMyPrescriptions,
} from "../services/medical-record.service";
import {
  DocumentRecord,
  MedicalRecordTab,
  PrescriptionRecord,
} from "../types/MedicalRecord";
import { getApiErrorMessage } from "../utils/api-error";

const PAGE_LIMIT = 10;

const createRecordState = () => ({
  PRESCRIPTIONS: [],
  HEALTH_RECORDS: [],
  LAB_REPORTS: [],
});

const createPageState = () => ({
  PRESCRIPTIONS: 1,
  HEALTH_RECORDS: 1,
  LAB_REPORTS: 1,
});

export const useHealthRecords = (activeTab: MedicalRecordTab) => {
  const [recordsByTab, setRecordsByTab] = useState<
    Record<MedicalRecordTab, (PrescriptionRecord | DocumentRecord)[]>
  >(createRecordState());
  const [pagesByTab, setPagesByTab] =
    useState<Record<MedicalRecordTab, number>>(createPageState());
  const [totalPagesByTab, setTotalPagesByTab] =
    useState<Record<MedicalRecordTab, number>>(createPageState());
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

        const response =
          tab === "PRESCRIPTIONS"
            ? await getMyPrescriptions(params)
            : tab === "HEALTH_RECORDS"
              ? await getMyHealthRecords(params)
              : await getMyLabReports(params);

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

  const refresh = useCallback(async () => {
    setRefreshing(true);
    await loadRecords(activeTab, 1, false, false);
    setRefreshing(false);
  }, [activeTab, loadRecords]);

  const loadMore = useCallback(() => {
    if (!hasMore || loading || loadingMore) {
      return;
    }

    loadRecords(activeTab, pagesByTab[activeTab] + 1, true, false);
  }, [activeTab, hasMore, loadRecords, loading, loadingMore, pagesByTab]);

  return {
    activeRecords,
    errorMessage,
    hasMore,
    loadMore,
    loadRecords,
    loading,
    loadingMore,
    pagesByTab,
    recordsByTab,
    refresh,
    refreshing,
    totalPagesByTab,
  };
};
