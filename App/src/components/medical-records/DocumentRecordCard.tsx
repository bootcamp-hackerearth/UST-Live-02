import React from "react";
import { StyleSheet, Text, TouchableOpacity } from "react-native";

import GlassCard from "../cards/GlassCard";
import { DocumentRecord } from "../../types/MedicalRecord";
import { formatDate, formatDocumentType } from "../../utils/format";

type Props = {
  item: DocumentRecord;
  onPress: (item: DocumentRecord) => void;
};

function DocumentRecordCard({ item, onPress }: Props) {
  return (
    <TouchableOpacity activeOpacity={0.86} onPress={() => onPress(item)}>
      <GlassCard>
        <Text style={styles.title}>{item.title || "Untitled record"}</Text>

        <Text style={styles.meta}>{formatDocumentType(item.documentType)}</Text>

        {!!item.originalFileName && (
          <Text style={styles.fileName}>{item.originalFileName}</Text>
        )}

        <Text style={styles.date}>
          {formatDate(item.documentDate || item.createdAt)}
        </Text>

        <Text style={styles.openHint}>View document details</Text>
      </GlassCard>
    </TouchableOpacity>
  );
}

export default React.memo(DocumentRecordCard);

const styles = StyleSheet.create({
  title: {
    color: "#0F172A",
    fontSize: 18,
    fontWeight: "800",
  },

  meta: {
    color: "#2563EB",
    fontWeight: "700",
    marginTop: 6,
  },

  fileName: {
    color: "#334155",
    marginTop: 10,
  },

  date: {
    color: "#64748B",
    marginTop: 8,
  },

  openHint: {
    color: "#2563EB",
    fontWeight: "800",
    marginTop: 18,
  },
});
