import React, { useEffect, useState } from "react";
import { StyleSheet, Text, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { subscribeToast, ToastState } from "../../services/toast.service";

const colors: Record<
  ToastState["type"],
  { bg: string; border: string; text: string }
> = {
  success: { bg: "#DCFCE7", border: "#22C55E", text: "#14532D" },
  error: { bg: "#FEE2E2", border: "#EF4444", text: "#7F1D1D" },
  info: { bg: "#DBEAFE", border: "#2563EB", text: "#1E3A8A" },
};

export default function AppToast() {
  const [toast, setToast] = useState<ToastState | null>(null);

  useEffect(() => subscribeToast(setToast), []);

  if (!toast) {
    return null;
  }

  const palette = colors[toast.type];

  return (
    <SafeAreaView pointerEvents="box-none" style={styles.safeArea}>
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={() => setToast(null)}
        style={[
          styles.toast,
          { backgroundColor: palette.bg, borderLeftColor: palette.border },
        ]}
      >
        <Text style={[styles.text, { color: palette.text }]}>
          {toast.message}
        </Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 9999,
    alignItems: "center",
  },
  toast: {
    width: "92%",
    minHeight: 48,
    marginTop: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    borderLeftWidth: 4,
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.18,
    shadowRadius: 18,
    elevation: 8,
  },
  text: {
    fontSize: 14,
    fontWeight: "700",
    lineHeight: 20,
  },
});
