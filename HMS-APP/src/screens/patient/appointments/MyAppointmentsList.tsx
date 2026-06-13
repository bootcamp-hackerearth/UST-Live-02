import { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, Alert } from 'react-native';

import {
  getMyAppointments,
  cancelAppointment,
} from '../../../services/appointment.service';

import { Appointment } from '../../../types/appointment.types';
import AppointmentCard from '../appointments/AppointmentCard';
import { styles } from '../../../styles/patient/appointments/myAppointmentsList.style';

export default function MyAppointmentsList() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  useEffect(() => {
    loadAppointments();
  }, []);

  const loadAppointments = async () => {
    try {
      setLoading(true);
      const data = await getMyAppointments();
      setAppointments(data || []);
    } catch (error) {
      console.log('My appointments loading error:', error);
      Alert.alert('Error', 'Unable to load appointments');
    } finally {
      setLoading(false);
    }
  };

  const cancelSelectedAppointment = async (appointmentId: string) => {
    try {
      setCancellingId(appointmentId);

      await cancelAppointment(appointmentId);

      Alert.alert('Success', 'Appointment cancelled successfully');

      await loadAppointments();
    } catch (error: any) {
      console.log('Cancel appointment error:', error?.response?.data || error);

      Alert.alert(
        'Error',
        error?.response?.data?.message || 'Unable to cancel appointment'
      );
    } finally {
      setCancellingId(null);
    }
  };

  const handleCancelAppointment = (appointmentId: string) => {
    Alert.alert(
      'Cancel Appointment',
      'Are you sure you want to cancel this appointment?',
      [
        {
          text: 'No',
          style: 'cancel',
        },
        {
          text: 'Yes, Cancel',
          style: 'destructive',
          onPress: () => {
            void cancelSelectedAppointment(appointmentId);
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <View style={styles.card}>
        <ActivityIndicator />
        <Text style={styles.loadingText}>Loading appointments...</Text>
      </View>
    );
  }

  return (
    <View>
      <View style={styles.listHeader}>
        <Text style={styles.listTitle}>My Appointments</Text>
        <Text style={styles.listCount}>{appointments.length} total</Text>
      </View>

      {appointments.length === 0 ? (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyTitle}>No appointments yet</Text>
          <Text style={styles.emptyText}>
            Book your first appointment from the Book Appointment section.
          </Text>
        </View>
      ) : (
        appointments.map((appointment) => (
          <AppointmentCard
            key={appointment._id || appointment.appointmentCode}
            appointment={appointment}
            onCancel={handleCancelAppointment}
            cancelling={cancellingId === appointment._id}
          />
        ))
      )}
    </View>
  );
}