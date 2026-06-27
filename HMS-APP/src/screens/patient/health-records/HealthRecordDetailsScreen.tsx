import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';

import { getAppointmentDetails } from '../../../services/appointment.service';
import { HealthRecord } from '../../../types/health-record.types';
import { styles } from '../../../styles/patient/health-records/healthRecordDetailsScreen.style';

type AppointmentDetails = {
  _id: string;
  appointmentCode?: string;
  appointmentDate?: string;
  timeSlot?: string;
  reason?: string;
  status?: string;
  doctorId?: {
    employeeId?: {
      userId?: {
        firstName?: string;
        lastName?: string;
        email?: string;
      };
    };
  };
};

export default function HealthRecordDetailsScreen() {
  const { appointmentId } = useLocalSearchParams<{
    appointmentId?: string;
  }>();

  const [appointment, setAppointment] = useState<AppointmentDetails | null>(
    null
  );
  const [healthRecord, setHealthRecord] = useState<HealthRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  const loadHealthRecord = useCallback(async () => {
    if (!appointmentId) {
      setErrorMessage('Appointment ID is missing');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setErrorMessage('');

      const result = await getAppointmentDetails(appointmentId);

      setAppointment(result.appointment || null);
      setHealthRecord(result.healthRecord || null);
    } catch (error: any) {
      console.log(
        'Health record details error:',
        error?.response?.data || error
      );

      setAppointment(null);
      setHealthRecord(null);

      setErrorMessage(
        error?.response?.data?.message || 'Unable to load health record'
      );
    } finally {
      setLoading(false);
    }
  }, [appointmentId]);

  useEffect(() => {
    loadHealthRecord();
  }, [loadHealthRecord]);

  const formatDate = (dateValue?: string | null): string => {
    if (!dateValue) {
      return '-';
    }

    return new Date(dateValue).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  const getDoctorName = (): string => {
    const appointmentDoctorUser =
      appointment?.doctorId?.employeeId?.userId;

    const healthRecordDoctorUser =
      healthRecord?.doctorId?.employeeId?.userId;

    const user = appointmentDoctorUser || healthRecordDoctorUser;

    const fullName =
      `${user?.firstName || ''} ${user?.lastName || ''}`.trim();

    return fullName ? `Dr. ${fullName}` : 'Doctor details unavailable';
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2563EB" />
        <Text style={styles.loadingText}>Loading health record...</Text>
      </View>
    );
  }

  if (errorMessage || !healthRecord) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle-outline" size={42} color="#B42318" />

        <Text style={styles.errorTitle}>Unable to load record</Text>

        <Text style={styles.errorText}>
          {errorMessage || 'Health record is unavailable'}
        </Text>

        <TouchableOpacity
          style={styles.retryButton}
          onPress={loadHealthRecord}
        >
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.topRow}>
        <TouchableOpacity
          style={styles.iconButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={22} color="#2563EB" />
        </TouchableOpacity>

        <View style={styles.headerTextContainer}>
          <Text style={styles.pageTitle}>Health Record</Text>

          <Text style={styles.recordId}>
            {healthRecord.medicalRecordId || 'Health Record'}
          </Text>
        </View>
      </View>

      <View style={styles.statusCard}>
        <View style={styles.statusBadge}>
          <Ionicons name="checkmark-circle" size={17} color="#27500A" />
          <Text style={styles.statusText}>
            {healthRecord.status || 'FINALIZED'}
          </Text>
        </View>

        <Text style={styles.finalizedDate}>
          Finalized on {formatDate(healthRecord.finalizedAt)}
        </Text>
      </View>

      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>Appointment Details</Text>

        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Appointment Code</Text>
          <Text style={styles.detailValue}>
            {appointment?.appointmentCode || '-'}
          </Text>
        </View>

        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Doctor</Text>
          <Text style={styles.detailValue}>{getDoctorName()}</Text>
        </View>

        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Date</Text>
          <Text style={styles.detailValue}>
            {formatDate(appointment?.appointmentDate)}
          </Text>
        </View>

        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Time</Text>
          <Text style={styles.detailValue}>
            {appointment?.timeSlot || '-'}
          </Text>
        </View>
      </View>

      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>Symptoms / Reason</Text>

        <Text style={styles.bodyText}>
          {healthRecord.symptomsReason || appointment?.reason || '-'}
        </Text>
      </View>

      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>Diagnosis</Text>

        <Text style={styles.bodyText}>
          {healthRecord.diagnosis || '-'}
        </Text>
      </View>

      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>Prescription</Text>

        {(healthRecord.prescription?.length??0)===0 ? (
          <Text style={styles.mutedText}>No prescription added.</Text>
        ) : (
          healthRecord.prescription?.map((medicine, index) => (
            <View
              key={`${medicine.name}-${index}`}
              style={styles.medicineCard}
            >
              <Text style={styles.medicineName}>
                {medicine.name || 'Medicine'}
              </Text>

              <View style={styles.medicineDetailRow}>
                <Text style={styles.medicineLabel}>Dosage</Text>
                <Text style={styles.medicineValue}>
                  {medicine.dosage || '-'}
                </Text>
              </View>

              <View style={styles.medicineDetailRow}>
                <Text style={styles.medicineLabel}>Duration</Text>
                <Text style={styles.medicineValue}>
                  {medicine.duration || '-'}
                </Text>
              </View>

              {medicine.notes ? (
                <View style={styles.medicineNotesBox}>
                  <Text style={styles.medicineNotesLabel}>
                    Instructions
                  </Text>

                  <Text style={styles.medicineNotesText}>
                    {medicine.notes}
                  </Text>
                </View>
              ) : null}
            </View>
          ))
        )}
      </View>

      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>Doctor Notes</Text>

        <Text style={styles.bodyText}>
          {healthRecord.notes || 'No additional notes provided.'}
        </Text>
      </View>
    </ScrollView>
  );
}