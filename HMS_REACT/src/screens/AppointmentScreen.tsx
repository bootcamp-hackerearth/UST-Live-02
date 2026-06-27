import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useFocusEffect, useNavigation } from "@react-navigation/native";

import { getAppointments } from "../../src/services/appointment.service";
import { getApiErrorMessage } from "../../src/utils/api-error";

import AppointmentCard from "../../src/components/cards/AppointmentCard";

const APPOINTMENT_FILTERS = ["ALL", "PENDING", "BOOKED", "COMPLETED", "CANCELLED"];
const PAGE_LIMIT = 10;

export default function Appointments() {
  const navigation = useNavigation<any>();
  const [refreshing, setRefreshing] = useState(false);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("ALL");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const hasMore = page < totalPages;

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search.trim());
    }, 350);

    return () => clearTimeout(timer);
  }, [search]);

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

  const onRefresh = useCallback(async () => {
    setRefreshing(true);

    await loadAppointments(1, false, false);

    setRefreshing(false);
  }, [loadAppointments]);

  const loadMoreAppointments = useCallback(() => {
    if (!hasMore || loadingMore || loading) {
      return;
    }

    loadAppointments(page + 1, true, false);
  }, [hasMore, loadAppointments, loading, loadingMore, page]);

  useFocusEffect(
    useCallback(() => {
      loadAppointments(1);
    }, [loadAppointments]),
  );

  const renderAppointment = useCallback(
    ({ item }: { item: any }) => (
      <AppointmentCard
        item={item}
        onPress={() =>
          navigation.navigate("AppointmentDetail", {
            id: item._id,
          })
        }
      />
    ),
    [navigation],
  );

  const renderFilter = useCallback(
    ({ item }: { item: string }) => (
      <TouchableOpacity
        onPress={() => setSelectedFilter(item)}
        style={{
          paddingHorizontal: 16,
          paddingVertical: 10,
          borderRadius: 20,
          marginRight: 10,

          backgroundColor:
            selectedFilter === item ? "#2563EB" : "#FFFFFF",

          borderWidth: 1,
          borderColor: "#E2E8F0",
        }}
      >
        <Text
          style={{
            fontWeight: "700",

            color: selectedFilter === item ? "#FFFFFF" : "#334155",
          }}
        >
          {item}
        </Text>
      </TouchableOpacity>
    ),
    [selectedFilter],
  );

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

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View
          style={{
            padding: 20,
          }}
        >
          <Text>Loading Appointments...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>My Appointments</Text>

        <Text style={styles.subtitle}>Manage and track your appointments.</Text>
      </View>

      <TouchableOpacity
        style={styles.bookButton}
        onPress={() => navigation.navigate("BookAppointment")}
      >
        <Text style={styles.bookText}>+ Book Appointment</Text>
      </TouchableOpacity>
      <View
        style={{
          paddingHorizontal: 20,
          marginTop: 18,
        }}
      >
        <TextInput
          placeholder="Search doctor..."
          placeholderTextColor="#94A3B8"
          value={search}
          onChangeText={setSearch}
          style={{
            height: 52,
            backgroundColor: "#FFFFFF",
            borderRadius: 16,
            paddingHorizontal: 16,
            borderWidth: 1,
            borderColor: "#E2E8F0",
          }}
        />
        <FlatList
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          horizontal
          showsHorizontalScrollIndicator={false}
          data={APPOINTMENT_FILTERS}
          keyExtractor={(item) => item}
          contentContainerStyle={{
            paddingHorizontal: 20,
            paddingTop: 16,
          }}
          renderItem={renderFilter}
        />
      </View>

      <FlatList
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        data={appointments}
        keyExtractor={(item) => item._id}
        contentContainerStyle={{
          padding: 20,
        }}
        initialNumToRender={8}
        maxToRenderPerBatch={8}
        windowSize={5}
        onEndReached={loadMoreAppointments}
        onEndReachedThreshold={0.4}
        ListFooterComponent={listFooter}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyTitle}>
              {errorMessage || "No Appointments Yet"}
            </Text>

            <Text style={styles.emptyText}>
              {errorMessage
                ? "Pull down to try again."
                : "Start your healthcare journey by booking your first consultation."}
            </Text>
          </View>
        }
        renderItem={renderAppointment}
      />
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
  },

  bookButton: {
    marginHorizontal: 20,
    marginTop: 20,

    backgroundColor: "#2563EB",

    height: 56,

    borderRadius: 18,

    justifyContent: "center",

    alignItems: "center",
  },

  bookText: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 16,
  },

  emptyContainer: {
    alignItems: "center",
    marginTop: 100,
  },

  emptyTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#0F172A",
  },

  emptyText: {
    marginTop: 8,
    color: "#64748B",
    textAlign: "center",
  },

  footerLoader: {
    paddingVertical: 18,
  },
});
