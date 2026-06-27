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
import debounce from "lodash.debounce";

import AppointmentCard from "../../src/components/cards/AppointmentCard";
import EmptyState from "../components/common/EmptyState";
import CardSkeleton from "../components/loaders/CardSkeleton";
import { useAppointments } from "../hooks/useAppointments";

const APPOINTMENT_FILTERS = ["ALL", "PENDING", "BOOKED", "COMPLETED", "CANCELLED"];

function Appointments() {
  const navigation = useNavigation<any>();
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("ALL");

  const {
    appointments,
    errorMessage,
    loadAppointments,
    loadMore,
    loading,
    loadingMore,
    refresh,
    refreshing,
  } = useAppointments({
    selectedFilter,
    debouncedSearch,
  });

  const updateDebouncedSearch = useMemo(
    () =>
      debounce((value: string) => {
        setDebouncedSearch(value.trim());
      }, 350),
    [],
  );

  useEffect(() => {
    updateDebouncedSearch(search);

    return () => {
      updateDebouncedSearch.cancel();
    };
  }, [search, updateDebouncedSearch]);

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
        <View style={styles.skeletonList}>
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
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
            <RefreshControl refreshing={refreshing} onRefresh={refresh} />
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
          <RefreshControl refreshing={refreshing} onRefresh={refresh} />
        }
        data={appointments}
        keyExtractor={(item) => item._id}
        contentContainerStyle={{
          padding: 20,
        }}
        initialNumToRender={8}
        maxToRenderPerBatch={8}
        windowSize={5}
        onEndReached={loadMore}
        onEndReachedThreshold={0.4}
        ListFooterComponent={listFooter}
        ListEmptyComponent={
          <EmptyState
            title={errorMessage || "No Appointments Yet"}
            subtitle={
              errorMessage
                ? "Pull down to try again."
                : "Start your healthcare journey by booking your first consultation."
            }
          />
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

  skeletonList: {
    paddingTop: 24,
  },

  footerLoader: {
    paddingVertical: 18,
  },
});

export default React.memo(Appointments);
