import { Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

import { HealthRecord } from '../../../types/health-record.types';
import { styles } from '../../../styles/patient/health-records/HealthRecordsScreen.style';

type HealthRecordCardProps =Readonly< {
  record: HealthRecord;
}>;

export default function HealthRecordCard({
  record,
}: HealthRecordCardProps) {
  const getDoctorName = (): string => {
    const user = record.doctorId?.employeeId?.userId;

    const fullName =
      `${user?.firstName || ''} ${user?.lastName || ''}`.trim();

    return fullName ? `Dr. ${fullName}` : 'Doctor details unavailable';
  };

  const getAppointmentDate = (): string => {
    const appointmentDate = record.appointmentId?.appointmentDate;

    if (!appointmentDate) {
      return 'Appointment date unavailable';
    }

    return new Date(appointmentDate).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  const getAppointmentId = (): string => {
    if (!record.appointmentId) {
      return '';
    }

    if (typeof record.appointmentId === 'string') {
      return record.appointmentId;
    }

    return record.appointmentId._id || '';
  };

  const handleOpenRecord = (): void => {
    const appointmentId = getAppointmentId();

    if (!appointmentId) {
      console.log('Appointment ID is missing for this health record');
      return;
    }

    router.push({
      pathname: '/health-record-details',
      params: {
        appointmentId,
      },
    });
  };

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      style={styles.recordCard}
      onPress={handleOpenRecord}
    >
      <View style={styles.cardHeader}>
        <View>
          <Text style={styles.recordId}>
            {record.medicalRecordId || 'Health Record'}
          </Text>

          <Text style={styles.doctorName}>
            {getDoctorName()}
          </Text>
        </View>

        <Ionicons name="chevron-forward" size={21} color="#9CA3AF" />
      </View>

      <View style={styles.infoRow}>
        <Ionicons name="calendar-outline" size={16} color="#6B7280" />

        <Text style={styles.infoText}>
          {getAppointmentDate()}
          {record.appointmentId?.timeSlot
            ? ` • ${record.appointmentId.timeSlot}`
            : ''}
        </Text>
      </View>

      <View style={styles.diagnosisSection}>
        <Text style={styles.diagnosisLabel}>Diagnosis</Text>

        <Text numberOfLines={2} style={styles.diagnosisText}>
          {record.diagnosis || 'Diagnosis not available'}
        </Text>
      </View>

      <View style={styles.cardFooter}>
        <View style={styles.finalizedBadge}>
          <Ionicons name="checkmark-circle" size={14} color="#27500A" />

          <Text style={styles.finalizedText}>FINALIZED</Text>
        </View>

        <Text style={styles.viewRecordText}>View record</Text>
      </View>
    </TouchableOpacity>
  );
}