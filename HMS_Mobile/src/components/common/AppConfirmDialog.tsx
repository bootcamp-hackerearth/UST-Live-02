import React, { useEffect, useState } from "react";
import {
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";

import {
  closeConfirm,
  ConfirmState,
  subscribeConfirm,
} from "../../services/confirm.service";

export default function AppConfirmDialog() {
  const [state, setState] = useState<ConfirmState | null>(null);

  useEffect(() => subscribeConfirm(setState), []);

  return (
    <Modal transparent visible={Boolean(state)} animationType="fade">
      <TouchableWithoutFeedback onPress={() => closeConfirm(state, false)}>
        <View style={styles.backdrop}>
          <TouchableWithoutFeedback>
            <View style={styles.card}>
              <View
                style={[
                  styles.icon,
                  state?.destructive ? styles.dangerIcon : styles.primaryIcon,
                ]}
              >
                <Text
                  style={[
                    styles.iconText,
                    state?.destructive ? styles.dangerText : styles.primaryText,
                  ]}
                >
                  {state?.destructive ? "!" : "?"}
                </Text>
              </View>

              <Text style={styles.title}>{state?.title}</Text>
              <Text style={styles.message}>{state?.message}</Text>

              <View style={styles.actions}>
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={() => closeConfirm(state, false)}
                >
                  <Text style={styles.cancelText}>{state?.cancelText}</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.confirmButton,
                    state?.destructive && styles.dangerButton,
                  ]}
                  onPress={() => closeConfirm(state, true)}
                >
                  <Text style={styles.confirmText}>{state?.confirmText}</Text>
                </TouchableOpacity>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    alignItems: "center",
    justifyContent: "flex-start",
    paddingHorizontal: 20,
    paddingTop: 96,
    backgroundColor: "rgba(15, 23, 42, 0.35)",
  },
  card: {
    width: "100%",
    borderRadius: 8,
    backgroundColor: "#FFFFFF",
    padding: 20,
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 14 },
    shadowOpacity: 0.22,
    shadowRadius: 28,
    elevation: 10,
  },
  icon: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
  },
  primaryIcon: {
    backgroundColor: "#DBEAFE",
  },
  dangerIcon: {
    backgroundColor: "#FEE2E2",
  },
  iconText: {
    fontSize: 22,
    fontWeight: "900",
  },
  primaryText: {
    color: "#2563EB",
  },
  dangerText: {
    color: "#DC2626",
  },
  title: {
    color: "#0F172A",
    fontSize: 20,
    fontWeight: "800",
  },
  message: {
    color: "#475569",
    fontSize: 14,
    lineHeight: 21,
    marginTop: 8,
  },
  actions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 10,
    marginTop: 18,
  },
  cancelButton: {
    minHeight: 42,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F1F5F9",
  },
  confirmButton: {
    minHeight: 42,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#2563EB",
  },
  dangerButton: {
    backgroundColor: "#DC2626",
  },
  cancelText: {
    color: "#334155",
    fontWeight: "800",
  },
  confirmText: {
    color: "#FFFFFF",
    fontWeight: "800",
  },
});
