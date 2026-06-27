import { useCallback, useState, useMemo } from "react";

import { AppointmentResponse } from "../types/Appointment";

import { getAppointments } from "../services/appointment.service";

export default function useAppointments() {
  const [appointments, setAppointments] = useState<AppointmentResponse | null>(
    null,
  );

  const [loading, setLoading] = useState(false);

  const [refreshing, setRefreshing] = useState(false);

  const [loadingMore, setLoadingMore] = useState(false);

  const loadAppointments = useCallback(
    async (
      page = 1,
      search = "",
      status = "ALL",
      isRefresh = false,
      append = false,
    ) => {
      try {
        if (isRefresh) {
          setRefreshing(true);
        } else if (append) {
          setLoadingMore(true);
        } else {
          setLoading(true);
        }

        const response = await getAppointments(page, search, status);
        const nextData = response.data.data ?? [];
        const nextMeta = response.data.meta ?? {
          page: 1,
          limit: 5,
          totalRecords: 0,
          totalPages: 1,
        };

        setAppointments((current) => {
          if (!append || !current || isRefresh) {
            return {
              data: nextData,
              meta: nextMeta,
            };
          }

          const existingIds = new Set(current.data.map((item) => item._id));

          return {
            data: [
              ...current.data,
              ...nextData.filter((item: any) => !existingIds.has(item._id)),
            ],
            meta: nextMeta,
          };
        });
      } catch (error: any) {
        console.log("Appointment Error", error?.response?.data ?? error);
      } finally {
        setLoading(false);

        setRefreshing(false);

        setLoadingMore(false);
      }
    },
    [],
  );

  const refresh = useCallback(
    (page = 1, search = "", status = "ALL") => {
      loadAppointments(page, search, status, true);
    },
    [loadAppointments],
  );

  return useMemo(
    () => ({
      appointments,
      loading,
      refreshing,
      loadingMore,
      loadAppointments,
      refresh,
    }),
    [appointments, loading, refreshing, loadingMore, loadAppointments, refresh],
  );
}
