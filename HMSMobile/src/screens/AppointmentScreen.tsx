import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  ListRenderItem,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import AppointmentCard from "../../src/components/cards/AppointmentCard";
import useAppointments from "../../src/hooks/useAppointments";
import CardSkeleton from "../../src/components/loaders/CardSkeleton";
import OfflineBanner from "../../src/components/common/OfflineBanner";
import OfflineSkeletonState from "../../src/components/loaders/OfflineSkeletonState";
import useOfflineStatus from "../../src/hooks/useOfflineStatus";

type AppointmentListItem = {
  _id: string;
  [key: string]: any;
};

export default function Appointments() {
  const navigation = useNavigation<any>();
  const offline = useOfflineStatus();

  const [search, setSearch] = useState("");

  const [debouncedSearch, setDebouncedSearch] = useState("");

  const [selectedFilter, setSelectedFilter] = useState("ALL");

  const {
    appointments,
    loading,
    refreshing,
    loadingMore,
    loadAppointments,
    refresh,
  } = useAppointments(debouncedSearch, selectedFilter);

  const filters = useMemo(
    () => ["ALL", "PENDING", "BOOKED", "COMPLETED", "REJECTED", "CANCELLED"],
    [],
  );

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 500);

    return () => clearTimeout(timer);
  }, [search]);

  const onRefresh = useCallback(() => {
    refresh();
  }, [refresh]);

  const loadMoreAppointments = useCallback(() => {
    if (!appointments || loading || loadingMore) {
      return;
    }

    if (!appointments.meta.hasNextPage || !appointments.meta.nextCursor) {
      return;
    }

    loadAppointments(
      appointments.meta.nextCursor,
      debouncedSearch,
      selectedFilter,
      false,
      true,
    );
  }, [
    appointments,
    debouncedSearch,
    loadAppointments,
    loading,
    loadingMore,
    selectedFilter,
  ]);
  const goToBookAppointment = useCallback(() => {
    navigation.navigate("BookAppointment");
  }, [navigation]);
  const appointmentData = useMemo(
    () => appointments?.data ?? [],
    [appointments],
  );
  const keyExtractor = useCallback((appointment: AppointmentListItem) => appointment._id, []);
  const renderAppointment = useCallback<ListRenderItem<AppointmentListItem>>(
    ({ item }) => (
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
  if ((loading || offline) && !appointments) {
    return (
      <SafeAreaView style={styles.container}>
        {offline ? (
          <OfflineSkeletonState message="Loading saved appointments while offline." />
        ) : (
          <>
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
          </>
        )}
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        initialNumToRender={5}
        maxToRenderPerBatch={5}
        windowSize={7}
        removeClippedSubviews
        keyboardShouldPersistTaps="handled"
        data={appointmentData}
        keyExtractor={keyExtractor}
        onEndReached={loadMoreAppointments}
        onEndReachedThreshold={0.25}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        contentContainerStyle={{
          paddingBottom: 120,
        }}
        ListHeaderComponent={
          <>
            {offline ? <OfflineBanner /> : null}

            <View style={styles.header}>
              <Text style={styles.title}>My Appointments</Text>

              <Text style={styles.subtitle}>
                Manage and track your appointments.
              </Text>
            </View>

            <TouchableOpacity
              style={styles.bookButton}
              onPress={goToBookAppointment}
            >
              <Text style={styles.bookText}>+ Book Appointment</Text>
            </TouchableOpacity>

            <View style={styles.searchContainer}>
              <TextInput
                placeholder="Search doctor..."
                placeholderTextColor="#94A3B8"
                value={search}
                onChangeText={(text) => {
                  setSearch(text);
                }}
                style={styles.search}
              />

              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {filters.map((item) => (
                  <TouchableOpacity
                    key={item}
                    onPress={() => {
                      setSelectedFilter(item);
                    }}
                    style={[
                      styles.filterChip,
                      selectedFilter === item && styles.activeChip,
                    ]}
                  >
                    <Text
                      style={[
                        styles.filterText,
                        selectedFilter === item && styles.activeFilterText,
                      ]}
                    >
                      {item.replaceAll("_", " ")}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </>
        }
        ListEmptyComponent={
          loading ? null : (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyTitle}>📅 No Appointments</Text>
            </View>
          )
        }
        renderItem={renderAppointment}
        ListFooterComponent={
          loadingMore ? (
            <View style={styles.loadingMoreContainer}>
              <ActivityIndicator color="#2563EB" />
            </View>
          ) : null
        }
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
  searchContainer: {
    paddingHorizontal: 20,
    marginTop: 18,
  },
  search: {
    height: 52,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    marginBottom: 16,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    marginRight: 10,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  activeChip: {
    backgroundColor: "#2563EB",
  },
  filterText: {
    fontWeight: "700",
    color: "#334155",
  },
  activeFilterText: {
    color: "#FFFFFF",
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
  loadingMoreContainer: {
    paddingVertical: 18,
    alignItems: "center",
  },
});
