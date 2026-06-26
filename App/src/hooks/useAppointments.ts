import { useCallback, useState } from "react";

import { getAppointments } from "../services/appointment.service";
import { AppointmentRecord } from "../types/Appointment";
import { getApiErrorMessage } from "../utils/api-error";

const PAGE_LIMIT = 10;

export const useAppointments = ({
  selectedFilter,
  debouncedSearch,
}: {
  selectedFilter: string;
  debouncedSearch: string;
}) => {
  const [appointments, setAppointments] = useState<AppointmentRecord[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const hasMore = page < totalPages;

  const loadAppointments = useCallback(
    async (nextPage = 1, append = false, showLoader = true) => {
      try {
        if (append) {
          setLoadingMore(true);
        } else if (showLoader) {
          setLoading(true);
        }

        setErrorMessage("");

        const response = await getAppointments({
          page: nextPage,
          limit: PAGE_LIMIT,
          status: selectedFilter === "ALL" ? undefined : selectedFilter,
          search: debouncedSearch || undefined,
        });

        const records = response.data.data || [];
        const meta = response.data.pagination || {};

        setAppointments((currentAppointments) =>
          append ? [...currentAppointments, ...records] : records,
        );
        setPage(meta.page || nextPage);
        setTotalPages(meta.totalPages || 1);
      } catch (error) {
        setErrorMessage(
          getApiErrorMessage(error, "Unable to load appointments"),
        );
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [debouncedSearch, selectedFilter],
  );

  const refresh = useCallback(async () => {
    setRefreshing(true);
    await loadAppointments(1, false, false);
    setRefreshing(false);
  }, [loadAppointments]);

  const loadMore = useCallback(() => {
    if (!hasMore || loadingMore || loading) {
      return;
    }

    loadAppointments(page + 1, true, false);
  }, [hasMore, loadAppointments, loading, loadingMore, page]);

  return {
    appointments,
    errorMessage,
    hasMore,
    loadAppointments,
    loadMore,
    loading,
    loadingMore,
    page,
    refresh,
    refreshing,
    totalPages,
  };
};
