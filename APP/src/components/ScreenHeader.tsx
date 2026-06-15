import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { colors, spacing } from "../theme";

type ScreenHeaderProps = Readonly<{
  title: string;
  onBack?: () => void;
  actionLabel?: string;
  onAction?: () => void;
}>;

export default function ScreenHeader({
  title,
  onBack,
  actionLabel,
  onAction,
}: ScreenHeaderProps) {
  return (
    <View style={styles.header}>
      <TouchableOpacity
        onPress={onBack}
        disabled={!onBack}
        style={styles.side}
        activeOpacity={0.75}
      >
        {onBack ? <Text style={styles.backText}>Back</Text> : null}
      </TouchableOpacity>
      <Text style={styles.title}>{title}</Text>
      <TouchableOpacity
        onPress={onAction}
        disabled={!onAction}
        style={[styles.side, styles.actionSide]}
        activeOpacity={0.75}
      >
        {actionLabel ? <Text style={styles.actionText}>{actionLabel}</Text> : null}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    alignItems: "center",
    backgroundColor: colors.surface,
    borderBottomColor: colors.border,
    borderBottomWidth: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: spacing.md,
    paddingVertical: 14,
  },
  side: {
    minWidth: 72,
  },
  actionSide: {
    alignItems: "flex-end",
  },
  title: {
    color: colors.text,
    flex: 1,
    fontSize: 18,
    fontWeight: "800",
    textAlign: "center",
  },
  backText: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: "800",
  },
  actionText: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: "800",
  },
});
