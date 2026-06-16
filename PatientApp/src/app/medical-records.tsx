import Ionicons from "@expo/vector-icons/Ionicons";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { BottomTabInset } from "@/constants/theme";
import { showError } from "@/utils/alerts";
import { formatApptDate } from "@/utils/format";
import { getMyMedicalRecords } from "@/services/medicalRecordService";
import type { MedicalRecordListItem } from "@/services/types";

const TEAL = "#2e9466";
const PAGE_SIZE = 10;

export default function MedicalRecordsScreen() {
  const router = useRouter();
  const [items, setItems] = useState<MedicalRecordListItem[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const loadPage = useCallback(async (nextPage: number, replace: boolean) => {
    try {
      const data = await getMyMedicalRecords(nextPage, PAGE_SIZE);
      setTotalPages(data.totalPages || 1);
      setPage(data.page || nextPage);
      setItems((prev) =>
        replace ? data.medicalRecords : [...prev, ...data.medicalRecords],
      );
    } catch (err) {
      showError(err);
    }
  }, []);

  // Reload from the first page whenever the screen regains focus
  useFocusEffect(
    useCallback(() => {
      let active = true;
      setLoading(true);
      loadPage(1, true).finally(() => {
        if (active) setLoading(false);
      });
      return () => {
        active = false;
      };
    }, [loadPage]),
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadPage(1, true);
    setRefreshing(false);
  }, [loadPage]);

  const onEndReached = useCallback(async () => {
    if (loadingMore || loading || page >= totalPages) return;
    setLoadingMore(true);
    await loadPage(page + 1, false);
    setLoadingMore(false);
  }, [loadingMore, loading, page, totalPages, loadPage]);

  const openRecord = (item: MedicalRecordListItem) => {
    router.push({
      pathname: "/medical-record",
      params: { medicalRecordId: item.medicalRecordId },
    });
  };

  const renderItem = ({ item }: { item: MedicalRecordListItem }) => (
    <TouchableOpacity
      style={styles.card}
      activeOpacity={0.8}
      onPress={() => openRecord(item)}
    >
      <View style={styles.iconBox}>
        <Ionicons name="document-text" size={20} color={TEAL} />
      </View>
      <View style={styles.cardInfo}>
        <Text style={styles.cardTitle}>Dr. {item.doctorName}</Text>
        <Text style={styles.cardMeta}>{item.medicalRecordId}</Text>
        <Text style={styles.cardMeta}>
          Appointment {item.appointmentId}
          {item.created_at ? ` · ${formatApptDate(item.created_at)}` : ""}
        </Text>
      </View>
      <Ionicons name="chevron-forward" size={18} color="#d1d5db" />
    </TouchableOpacity>
  );

  return (
    <View style={styles.root}>
      <SafeAreaView edges={["top"]} style={styles.header}>
        <Text style={styles.screenTitle}>Medical Records</Text>
      </SafeAreaView>

      {loading ? (
        <ActivityIndicator color={TEAL} style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={items}
          keyExtractor={(item) => item.medicalRecordId}
          renderItem={renderItem}
          contentContainerStyle={[
            styles.listContent,
            { paddingBottom: BottomTabInset + 24 },
            items.length === 0 && styles.listEmpty,
          ]}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={TEAL} />
          }
          onEndReached={onEndReached}
          onEndReachedThreshold={0.4}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Ionicons name="document-text-outline" size={48} color="#d1d5db" />
              <Text style={styles.emptyText}>No medical records yet</Text>
            </View>
          }
          ListFooterComponent={
            loadingMore ? (
              <ActivityIndicator color={TEAL} style={{ marginVertical: 16 }} />
            ) : null
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#fff" },
  header: { paddingHorizontal: 20, backgroundColor: "#fff" },
  screenTitle: {
    fontSize: 26,
    fontWeight: "700",
    color: "#1f2937",
    paddingTop: 20,
    marginBottom: 12,
  },
  listContent: { paddingHorizontal: 20 },
  listEmpty: { flexGrow: 1, justifyContent: "center" },
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    padding: 14,
    marginBottom: 12,
  },
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#f0faf4",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  cardInfo: { flex: 1 },
  cardTitle: { fontSize: 15, fontWeight: "700", color: "#1f2937" },
  cardMeta: { fontSize: 13, color: "#6b7280", marginTop: 1 },
  emptyState: { alignItems: "center", gap: 12 },
  emptyText: { fontSize: 15, color: "#9ca3af" },
});
