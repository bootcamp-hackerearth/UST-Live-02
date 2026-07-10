/**
 * @file MedicalRecordsScreen.tsx
 * @overview Screen to view a list of the patient's medical records.
 * @description This screen fetches and displays a paginated list of the patient's medical records.
 * It includes pull-to-refresh and infinite scroll (load more) functionalities. It also integrates the
 * `MedicalRecordFilter` component to allow users to search and filter their records.
 * @routes This screen is a main tab in the `MainTabNavigator`.
 * @connections
 * - On focus/refresh -> `fetchRecords()` -> `recordService.getMyRecords()` -> Fetches paginated records.
 * - `handleFilterChange` (callback from `MedicalRecordFilter`) -> `fetchRecords(1, newFilters)` -> Re-fetches records with new filter criteria.
 * - `FlatList` scrolls to end -> `handleLoadMore()` -> `fetchRecords(page + 1, ...)` -> Fetches next page of data.
 * - Renders `MedicalRecordCard` for each item in the `records` state array.
 */

import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  ImageBackground,
  RefreshControl,
  ListRenderItemInfo,
} from "react-native";
import { BottomTabNavigationProp } from "@react-navigation/bottom-tabs";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import Toast from "react-native-toast-message";

import { recordService } from "../services/recordService";
import MedicalRecordCard from "../components/MedicalRecordCard";
import MedicalRecordFilter, {
  RecordFilters,
} from "../components/MedicalRecordFilter";
import { MedicalRecord } from "../features/auth/types";
import { appointmentService } from "../services/appointmentService";
import { Doctor } from "../components/DoctorCarousel";

const EMPTY_ARRAY: MedicalRecord[] = [];
const EMPTY_DOCTORS_ARRAY: Doctor[] = [];

export default function MedicalRecordsScreen() {
  const backgroundImage = require("../../assets/images/hospital3.jpg");
  const navigation = useNavigation<BottomTabNavigationProp<any>>();
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [records, setRecords] = useState<MedicalRecord[]>([]);

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [isLoadingMore, setIsLoadingMore] = useState<boolean>(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [filters, setFilters] = useState<RecordFilters>({
    appointmentId: "",
    doctorId: null,
    date: null,
  });
  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  const fetchRecords = useCallback(
    async (loadPage: number, appliedFilters: RecordFilters) => {
      const isInitialLoad = loadPage === 1;

      if (isInitialLoad) {
        setIsLoading(true);
        setRecords(EMPTY_ARRAY);
        // Always fetch doctors on initial load/refresh to ensure filter is populated
        appointmentService.getDoctors().then((docs) => {
          if (isMounted.current) setDoctors(docs);
        });
      } else {
        setIsLoadingMore(true);
      }

      try {
        const response = await recordService.getMyRecords(
          loadPage,
          5,
          appliedFilters,
        );
        const { data, pagination } = response;

        if (isMounted.current) {
          setRecords((prevRecords) =>
            isInitialLoad ? data : [...prevRecords, ...data],
          );
          setHasMore(loadPage < pagination.pages);
          setPage(loadPage);
        }
      } catch (err: any) {
        console.error("Fetch Records Failed:", err);
        Toast.show({
          type: "error",
          text1: "Fetch Failed",
          text2:
            err.response?.data?.message || "Could not load medical records.",
        });
      } finally {
        if (isMounted.current) {
          setIsLoading(false);
          setRefreshing(false);
          setIsLoadingMore(false);
        }
      }
    },
    [],
  );

  const handleFilterChange = useCallback(
    (newFilters: RecordFilters) => {
      setFilters(newFilters);
      fetchRecords(1, newFilters);
    },
    [fetchRecords],
  );

  useFocusEffect(
    useCallback(() => {
      // Reset state and fetch the first page
      fetchRecords(1, filters);
    }, [fetchRecords]),
  );

  useEffect(() => {
    const unsubscribe = navigation.addListener("tabPress", () => {
      if (navigation.isFocused()) {
        setRefreshing(true);
        fetchRecords(1, filters);
      }
    });
    return unsubscribe;
  }, [navigation, fetchRecords]);

  const onRefresh = useCallback(() => {
    const clearedFilters = { appointmentId: "", doctorId: null, date: null };
    setFilters(clearedFilters);
    setDoctors(EMPTY_DOCTORS_ARRAY);
    setRefreshing(true);
    fetchRecords(1, clearedFilters);
  }, [fetchRecords]);

  const handleLoadMore = useCallback(() => {
    if (!isLoadingMore && hasMore) {
      fetchRecords(page + 1, filters);
    }
  }, [isLoadingMore, hasMore, page, fetchRecords]);

  const keyExtractor = useCallback(
    (item: MedicalRecord) => item._id || item.recordCode,
    [],
  );

  const renderRecordItem = useCallback(
    ({ item }: ListRenderItemInfo<MedicalRecord>) => (
      <MedicalRecordCard record={item} />
    ),
    [],
  );

  const renderListHeader = useCallback(
    () => (
      <View style={styles.headerContainer}>
        <Text style={styles.mainTitle}>My</Text>
        <Text style={styles.boldTitle}>Medical Records</Text>
        <Text style={styles.subtitle}>Records from your visits.</Text>
        <View style={{ marginTop: 20 }}>
          <MedicalRecordFilter
            doctors={doctors}
            initialFilters={filters}
            onFilterChange={handleFilterChange}
          />
        </View>
      </View>
    ),
    [doctors, filters, handleFilterChange],
  );

  const renderListFooter = useCallback(() => {
    if (!isLoadingMore) return null;
    return (
      <View style={{ paddingVertical: 20 }}>
        <ActivityIndicator size="large" color="#6C4EDB" />
      </View>
    );
  }, [isLoadingMore]);

  const renderEmptyList = useCallback(
    () => (
      <View style={styles.emptyListCard}>
        <Text style={styles.emptyListText}>No medical records found.</Text>
      </View>
    ),
    [],
  );

  return (
    <ImageBackground
      source={backgroundImage}
      style={styles.backgroundImage}
      imageStyle={{ opacity: 0.3 }}
    >
      <SafeAreaView style={styles.safe} edges={["top", "left", "right"]}>
        {isLoading ? (
          <View style={styles.center}>
            <ActivityIndicator size="large" color="#6C4EDB" />
            <Text style={styles.loadingText}>Loading records...</Text>
          </View>
        ) : (
          <FlatList
            data={records.length > 0 ? records : EMPTY_ARRAY}
            keyExtractor={keyExtractor}
            renderItem={renderRecordItem}
            ListHeaderComponent={renderListHeader}
            showsVerticalScrollIndicator={true}
            contentContainerStyle={styles.listContent}
            initialNumToRender={5}
            maxToRenderPerBatch={5}
            windowSize={10}
            removeClippedSubviews={true}
            onEndReached={handleLoadMore}
            onEndReachedThreshold={0.5}
            ListFooterComponent={renderListFooter}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                colors={["#4B1D76"]}
                tintColor="#4B1D76"
              />
            }
            ListEmptyComponent={renderEmptyList}
          />
        )}
      </SafeAreaView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
    backgroundColor: "#F5F6FA",
  },
  safe: {
    flex: 1,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    color: "#6B7280",
    marginTop: 12,
    fontSize: 16,
    fontFamily: "Lexend",
  },
  headerContainer: {
    paddingHorizontal: 24,
    paddingTop: 24,
    marginBottom: 20,
  },
  mainTitle: {
    fontSize: 36,
    fontWeight: "300",
    color: "#1E1E3F",
    fontFamily: "Montserrat",
  },
  boldTitle: {
    fontSize: 36,
    fontFamily: "Lexend",
    color: "#6C4EDB",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    fontFamily: "Lexend",
    color: "#6B7280",
    lineHeight: 22,
  },
  listContent: {
    paddingBottom: 24,
  },
  emptyListCard: {
    padding: 40,
    alignItems: "center",
  },
  emptyListText: {
    color: "#9CA3AF",
    fontStyle: "italic",
    fontFamily: "Lexend",
  },
});
