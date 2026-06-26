import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation, useRoute } from "@react-navigation/native";
import { WebView } from "react-native-webview";

export default function PdfViewerScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { title = "Document", url } = route.params || {};

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={navigation.goBack}>
          <Text style={styles.backButtonText}>Back</Text>
        </TouchableOpacity>

        <Text style={styles.title} numberOfLines={1}>
          {title}
        </Text>
      </View>

      {url ? (
        <WebView source={{ uri: url }} style={styles.viewer} />
      ) : (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Document unavailable</Text>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F4F7FC",
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },

  backButton: {
    borderRadius: 14,
    backgroundColor: "#DBEAFE",
    paddingHorizontal: 16,
    paddingVertical: 10,
  },

  backButtonText: {
    color: "#2563EB",
    fontWeight: "800",
  },

  title: {
    flex: 1,
    color: "#0F172A",
    fontSize: 18,
    fontWeight: "800",
  },

  viewer: {
    flex: 1,
  },

  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },

  emptyText: {
    color: "#64748B",
    fontWeight: "700",
  },
});
