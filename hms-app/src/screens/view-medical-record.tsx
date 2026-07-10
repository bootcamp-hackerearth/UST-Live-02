const BgImage = require("../../assets/img/cover.jpg");
import {
  ImageBackground,
  View,
  StyleSheet,
  Text,
  FlatList,
  ListRenderItem,
  TouchableOpacity,
} from "react-native";
import { WelcomeTextContainer } from "../components/auth/welcome-text-container";
import { FormHeader } from "../components/appointment/form-header.component";
import { useCallback, useEffect, useState, memo } from "react";
import { Ionicons } from "@expo/vector-icons";
import { MedicalRecordModel } from "../types/medical-record.types";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getMedicalRecords } from "../services/medical-record.service";

const formatDate = (iso: string) => new Date(iso).toDateString();

const formatDateTime = (iso: string) => {
  const d = new Date(iso);
  return d.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const ClinicalRow = ({
  icon,
  label,
  value,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value?: string;
}) => (
  <View style={styles.clinicalRow}>
    <View style={styles.clinicalLabelRow}>
      <Ionicons name={icon} size={13} style={styles.appointmentIcon} />
      <Text style={[styles.text, styles.clinicalLabel]}>{label}</Text>
    </View>
    <Text style={[styles.text, styles.clinicalValue]}>{value || "—"}</Text>
  </View>
);

const RecordDetails = ({ record }: { record: MedicalRecordModel }) => (
  <View>
    <View style={styles.divider} />
    <View style={styles.metaRow}>
      <View style={styles.metaItem}>
        <Ionicons
          name="barcode-outline"
          size={18}
          style={styles.appointmentIcon}
        />
        <Text style={[styles.text, styles.footerText]} numberOfLines={1}>
          {record.medicalRecordId}
        </Text>
      </View>
      <View style={styles.metaItem}>
        <Ionicons
          name="calendar-outline"
          size={18}
          style={styles.appointmentIcon}
        />
        <Text style={[styles.text, styles.footerText]}>
          {formatDate(record.created_at.toString())}
        </Text>
      </View>
    </View>

    <View style={styles.divider} />
    <View style={styles.peopleRow}>
      <View style={styles.personBlock}>
        <Text style={[styles.text, styles.sectionLabel]}>Doctor</Text>
        <View style={styles.personInner}>
          <View style={[styles.avatarIcon, styles.avatarCyan]}>
            <Text style={[styles.text, styles.avatarText]}>
              {record.doctorId.slice(0, 3).toUpperCase()}
            </Text>
          </View>
          <View style={styles.personTextHolder}>
            <Text style={[styles.text, styles.doctorText]} numberOfLines={1}>
              {record.doctorId}
            </Text>
            <Text
              style={[styles.text, styles.doctorSubTitle]}
              numberOfLines={1}
            >
              {record.doctorId}
            </Text>
          </View>
        </View>
      </View>
    </View>

    <View style={styles.divider} />

    <View style={styles.clinicalSection}>
      <ClinicalRow
        icon="chatbubble-outline"
        label="Complaint"
        value={record.complaint}
      />
      <ClinicalRow
        icon="pulse-outline"
        label="Symptoms"
        value={record.symptoms}
      />
      <ClinicalRow
        icon="document-text-outline"
        label="Diagnosis"
        value={record.diagnosis}
      />
    </View>

    {record.medications.length > 0 && (
      <>
        <View style={styles.divider} />
        <View style={styles.tableLabelRow}>
          <Ionicons
            name="medkit-outline"
            size={13}
            style={styles.appointmentIcon}
          />
          <Text style={[styles.text, styles.sectionLabel]}>
            Medications ({record.medications.length})
          </Text>
        </View>
        <View style={styles.tableHeader}>
          <Text style={[styles.text, styles.tableHeaderCell, { flex: 2 }]}>
            Name
          </Text>
          <Text style={[styles.text, styles.tableHeaderCell, { flex: 1 }]}>
            Dosage
          </Text>
          <Text style={[styles.text, styles.tableHeaderCell, { flex: 1.5 }]}>
            Freq.
          </Text>
          <Text style={[styles.text, styles.tableHeaderCell, { flex: 1 }]}>
            Dur.
          </Text>
        </View>
        {record.medications.map((med, i) => (
          <View
            key={`${med.name} ${med.dosage}`}
            style={[styles.tableRow, i % 2 === 0 && styles.tableRowAlt]}
          >
            <View style={{ flex: 2 }}>
              <Text style={styles.pillPurple}>{med.name}</Text>
            </View>
            <Text style={[styles.text, styles.tableCell, { flex: 1 }]}>
              {med.dosage}
            </Text>
            <Text style={[styles.text, styles.tableCell, { flex: 1.5 }]}>
              {med.frequency}
            </Text>
            <Text style={[styles.text, styles.tableCell, { flex: 1 }]}>
              {med.duration}
            </Text>
          </View>
        ))}
      </>
    )}

    {record.medicalObservations.length > 0 && (
      <>
        <View style={styles.divider} />
        <View style={styles.tableLabelRow}>
          <Ionicons
            name="stats-chart-outline"
            size={13}
            style={styles.appointmentIcon}
          />
          <Text style={[styles.text, styles.sectionLabel]}>
            Observations ({record.medicalObservations.length})
          </Text>
        </View>
        <View style={styles.tableHeader}>
          <Text style={[styles.text, styles.tableHeaderCell, { flex: 2 }]}>
            Metric
          </Text>
          <Text style={[styles.text, styles.tableHeaderCell, { flex: 1.5 }]}>
            Value
          </Text>
          <Text style={[styles.text, styles.tableHeaderCell, { flex: 2 }]}>
            Recorded At
          </Text>
        </View>
        {record.medicalObservations.map((obs, i) => (
          <View
            key={`${obs.metricName} ${obs.recordedTime}`}
            style={[styles.tableRow, i % 2 === 0 && styles.tableRowAlt]}
          >
            <Text style={[styles.text, styles.tableCell, { flex: 2 }]}>
              {obs.metricName}
            </Text>
            <View style={{ flex: 1.5 }}>
              <Text style={styles.pillBlue}>{obs.metricValue}</Text>
            </View>
            <Text style={[styles.text, styles.tableCell, { flex: 2 }]}>
              {formatDateTime(obs.recordedTime.toString())}
            </Text>
          </View>
        ))}
      </>
    )}

    {!!record.notes && (
      <>
        <View style={styles.divider} />
        <View style={styles.tableLabelRow}>
          <Ionicons
            name="document-outline"
            size={13}
            style={styles.appointmentIcon}
          />
          <Text style={[styles.text, styles.sectionLabel]}>Notes</Text>
        </View>
        <Text style={[styles.text, styles.notesText]}>{record.notes}</Text>
      </>
    )}

    <View style={styles.divider} />
    <View style={styles.createdBar}>
      <Ionicons
        name="person-outline"
        size={13}
        style={styles.appointmentIcon}
      />
      <Text style={[styles.text, styles.footerText]}>
        Created by <Text style={styles.createdByName}>{record.createdBy}</Text>
      </Text>
    </View>
  </View>
);

const MedicalRecordCardComponent = ({
  record,
  isExpanded,
  onToggle,
}: {
  record: MedicalRecordModel;
  isExpanded: boolean;
  onToggle: () => void;
}) => (
  <View style={styles.appointmentContainer}>
    <TouchableOpacity
      style={styles.appointmentHeader}
      onPress={onToggle}
      activeOpacity={0.75}
    >
      <View style={styles.appointmentIconAndText}>
        <View style={styles.avatarIcon}>
          <Text style={[styles.avatarText, styles.text]}>
            {record.diagnosis.slice(0, 2).toUpperCase()}
          </Text>
        </View>
        <View style={styles.appointmentTextHolder}>
          <Text
            style={[styles.text, styles.doctorText]}
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            {record.diagnosis}
          </Text>
          <Text
            style={[styles.text, styles.doctorSubTitle]}
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            {formatDate(record.created_at.toString())}
          </Text>
        </View>
      </View>

      <View style={styles.headerRight}>
        <Ionicons
          name={isExpanded ? "chevron-up-outline" : "chevron-down-outline"}
          size={18}
          color="rgb(101, 26, 114)"
          style={{ marginTop: 6, alignSelf: "center" }}
        />
      </View>
    </TouchableOpacity>

    {isExpanded && (
      <View>
        <RecordDetails record={record} />
      </View>
    )}
  </View>
);

const MedicalRecordCard = memo(MedicalRecordCardComponent);

export default function ViewMedicalRecordScreen() {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const [records, setRecords] = useState<MedicalRecordModel[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchMedicalRecords();
  }, []);

  const fetchMedicalRecords = async () => {
    if (loading || page > totalPages) return;

    setLoading(true);

    const patientId = await AsyncStorage.getItem("patientId");
    const response = await getMedicalRecords(page, patientId ?? "");

    setRecords((prev) => [...prev, ...response.data.data]);
    setTotalPages(response.data.totalPages);
    setPage((prev) => prev + 1);

    setLoading(false);
  };

  const handleToggle = useCallback((id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
  }, []);

  const renderItem: ListRenderItem<MedicalRecordModel> = useCallback(
    ({ item }) => (
      <MedicalRecordCard
        record={item}
        isExpanded={expandedId === item.medicalRecordId}
        onToggle={() => handleToggle(item.medicalRecordId)}
      />
    ),
    [expandedId, handleToggle],
  );

  return (
    <ImageBackground source={BgImage} resizeMode="cover" style={styles.wrapper}>
      <View style={styles.overlay}>
        <WelcomeTextContainer
          text1="View your,"
          text2="MEDICAL"
          text3="records here."
          isHome={true}
        />
        <View style={styles.container}>
          <FormHeader title="HISTORY" value="Your Medical Records" />
          {records.length === 0 && (
            <Text style={[styles.noRecordsText, styles.text]}>
              No records found.
            </Text>
          )}
          <FlatList
            data={records}
            keyExtractor={(item) => item.medicalRecordId}
            renderItem={renderItem}
            initialNumToRender={3}
            maxToRenderPerBatch={5}
            windowSize={5}
            onEndReached={fetchMedicalRecords}
            onEndReachedThreshold={0.5}
            ListFooterComponent={
              loading ? (
                <Text style={{ textAlign: "center" }}>Loading...</Text>
              ) : null
            }
          />
        </View>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  wrapper: { flex: 1 },
  overlay: { flex: 1, backgroundColor: "rgba(255, 255, 255, 0.8)" },
  container: {
    flex: 1,
    borderTopLeftRadius: 35,
    borderTopRightRadius:35,
    marginTop:30,
    borderColor: "rgba(207, 75, 255, 0.2)",
    backgroundColor: "#f2f2f2",
    borderWidth: 1,
    paddingBottom: 20,
  },
  appointmentContainer: {
    margin: 20,
    backgroundColor: "rgba(210, 210, 210, 0.3)",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "rgba(127, 27, 131, 0.2)",
    padding: 20,
  },
  appointmentHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  appointmentIconAndText: { flexDirection: "row", flex: 1 },
  appointmentTextHolder: {
    flexDirection: "column",
    marginLeft: 10,
    justifyContent: "center",
    flex: 1,
  },
  headerRight: { alignItems: "center" },
  avatarIcon: {
    backgroundColor: "rgb(108, 19, 109)",
    borderRadius: 100,
    height: 50,
    width: 50,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(194, 80, 247, 0.4)",
  },
  avatarPurple: {
    backgroundColor: "rgb(108, 19, 109)",
    borderColor: "rgba(194, 80, 247, 0.4)",
  },
  avatarCyan: {
    backgroundColor: "rgb(6, 120, 130)",
    borderColor: "rgba(80, 220, 247, 0.4)",
  },
  avatarText: {
    color: "rgba(205, 148, 255, 0.8)",
    fontSize: 14,
    lineHeight: 14,
  },
  doctorText: { color: "#232323", fontSize: 16, lineHeight: 16 },
  doctorSubTitle: {
    color: "#7b7b7b",
    fontSize: 12,
    lineHeight: 12,
    marginTop: 4,
  },
  appointmentStatus: {
    height: 40,
    borderRadius: 10,
    borderWidth: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 10,
  },
  completed: {
    backgroundColor: "rgb(33, 18, 107)",
    borderColor: "rgba(168, 168, 255, 0.6)",
  },
  draft: {
    backgroundColor: "rgb(117, 69, 14)",
    borderColor: "rgba(254, 255, 168, 0.6)",
  },
  deleted: {
    backgroundColor: "rgb(112, 14, 14)",
    borderColor: "rgba(255, 215, 186, 0.6)",
  },
  appointmentStatusText: { color: "#f5f5f5", fontSize: 12, lineHeight: 12 },
  divider: {
    height: 5,
    marginVertical: 10,
  },
  appointmentIcon: { color: "rgb(101, 26, 114)", marginRight: 4 },
  footerText: { fontSize: 12, color: "rgb(46, 46, 46)", lineHeight: 12 },
  text: { fontFamily: "Sans" },
  metaRow: { flexDirection: "row", gap: 12 },
  metaItem: { flexDirection: "row", alignItems: "center", flex: 1 },
  peopleRow: { flexDirection: "row", gap: 10 },
  personBlock: { flex: 1 },
  personInner: { flexDirection: "row", alignItems: "center", marginTop: 6 },
  peopleDivider: {
    width: 1,
    backgroundColor: "rgb(212, 212, 212)",
    marginHorizontal: 4,
  },
  personTextHolder: { flexDirection: "column", marginLeft: 8, flex: 1 },
  sectionLabel: {
    fontSize: 10,
    color: "#7b7b7b",
    lineHeight: 10,
    textTransform: "uppercase",
    letterSpacing: 0.4,
  },
  clinicalSection: { gap: 6 },
  clinicalRow: {
    backgroundColor: "rgba(127, 27, 131, 0.05)",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "rgba(127, 27, 131, 0.1)",
    padding: 10,
    marginVertical: 5,
  },
  clinicalLabelRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  clinicalLabel: {
    fontSize: 10,
    color: "#7b7b7b",
    textTransform: "uppercase",
    letterSpacing: 0.4,
  },
  clinicalValue: { fontSize: 13, color: "#232323", lineHeight: 18 },
  tableLabelRow: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 10,
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "rgba(127, 27, 131, 0.1)",
    borderRadius: 6,
    paddingVertical: 5,
    paddingHorizontal: 8,
  },
  tableHeaderCell: {
    fontSize: 10,
    fontWeight: "700",
    color: "rgb(76, 28, 119)",
    textTransform: "uppercase",
    letterSpacing: 0.3,
  },
  tableRow: {
    flexDirection: "row",
    paddingVertical: 6,
    paddingHorizontal: 8,
    marginVertical: 5,
    borderRadius: 4,
    alignItems: "center",
  },
  tableRowAlt: { backgroundColor: "rgba(127, 27, 131, 0.04)" },
  tableCell: { fontSize: 11, color: "rgb(46, 46, 46)", lineHeight: 16 },
  pillPurple: {
    fontSize: 11,
    lineHeight: 11,
    color: "rgb(76, 28, 119)",
    backgroundColor: "rgba(127, 27, 131, 0.12)",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 20,
    fontFamily: "Sans",
    alignSelf: "flex-start",
  },
  pillBlue: {
    fontSize: 11,
    lineHeight: 11,
    marginRight: 10,
    color: "rgb(12, 68, 124)",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 20,
    fontFamily: "Sans",
    alignSelf: "flex-start",
  },
  notesText: {
    fontSize: 12,
    color: "rgb(46, 46, 46)",
    lineHeight: 18,
    backgroundColor: "rgba(127, 27, 131, 0.05)",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "rgba(127, 27, 131, 0.1)",
    padding: 10,
  },
  noRecordsText: {
    color: "white",
    fontSize: 12,
    lineHeight: 12,
    textAlign: "center",
    backgroundColor: "rgb(75, 12, 67)",
    padding: 10,
  },
  createdBar: { flexDirection: "row", alignItems: "center" },
  createdByName: { fontWeight: "700", color: "#232323", fontFamily: "Sans" },
  actionsRow: { alignSelf: "flex-end" },
});
