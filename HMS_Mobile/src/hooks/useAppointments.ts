import { useCallback, useMemo } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import { Appointment, AppointmentResponse } from "../types/Appointment";
import { getAppointments } from "../services/appointment.service";
import { logger } from "../utils/logger";

const emptyMeta = {
  limit: 5,
  nextCursor: null,
  hasNextPage: false,
};

export default function useAppointments(search = "", status = "ALL") {
  const query = useInfiniteQuery({
    queryKey: ["appointments", search, status],
    initialPageParam: "",
    queryFn: async ({ pageParam }) => {
      const response = await getAppointments(pageParam, search, status);

      return {
        data: response.data.data ?? [],
        meta: response.data.meta ?? emptyMeta,
      } as AppointmentResponse;
    },
    getNextPageParam: (lastPage) =>
      lastPage.meta.hasNextPage ? lastPage.meta.nextCursor : undefined,
  });

  const appointments = useMemo<AppointmentResponse | null>(() => {
    if (!query.data?.pages.length) {
      return null;
    }

    const seenIds = new Set<string>();
    const data = query.data.pages.flatMap((page) =>
      page.data.filter((item: Appointment) => {
        if (seenIds.has(item._id)) {
          return false;
        }

        seenIds.add(item._id);
        return true;
      }),
    );
    const lastPage = query.data.pages[query.data.pages.length - 1];

    return {
      data,
      meta: lastPage.meta,
    };
  }, [query.data]);

  const loadAppointments = useCallback(
    async (
      cursor = "",
      nextSearch = search,
      nextStatus = status,
      _isRefresh = false,
      append = false,
    ) => {
      try {
        if (append || cursor) {
          await query.fetchNextPage();
          return;
        }

        if (nextSearch === search && nextStatus === status) {
          await query.refetch();
        }
      } catch (error) {
        logger.error("Appointment list load failed", error);
      }
    },
    [query, search, status],
  );

  const refresh = useCallback(async () => {
    try {
      await query.refetch();
    } catch (error) {
      logger.error("Appointment refresh failed", error);
    }
  }, [query]);

  return useMemo(
    () => ({
      appointments,
      loading: query.isPending && !appointments,
      refreshing: query.isRefetching && !query.isFetchingNextPage,
      loadingMore: query.isFetchingNextPage,
      loadAppointments,
      refresh,
    }),
    [
      appointments,
      loadAppointments,
      query.isFetchingNextPage,
      query.isPending,
      query.isRefetching,
      refresh,
    ],
  );
}
