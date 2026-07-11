import { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, Alert, FlatList } from 'react-native';

import {
  getMyAppointments,
  cancelAppointment,
} from '../../../services/appointment.service';

import { Appointment } from '../../../types/appointment.types';
import AppointmentCard from '../appointments/AppointmentCard';
import { styles } from '../../../styles/patient/appointments/myAppointmentsList.style';

const LIMIT = 5;

interface MyAppointmentsListProps {
 readonly header: React.ReactElement;
}

export default function MyAppointmentsList({ header }: MyAppointmentsListProps) {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [totalRecords, setTotalRecords] = useState(0);

  useEffect(() => {
    loadAppointments();
  }, []);

  const loadAppointments = async () => {
    try {
      setLoading(true);
      const response = await getMyAppointments(1, LIMIT);
      setAppointments(response.data || []);
      setPage(response.pagination?.page || 1);
      setHasNextPage(response.pagination?.hasNextPage || false);
      setTotalRecords(response.pagination?.totalRecords || 0);
    } catch (error) {
      console.log('My appointments loading error:', error);
      Alert.alert('Error', 'Unable to load appointments');
    } finally {
      setLoading(false);
    }
  };

  const loadMoreAppointments = async () => {
    if (loadingMore || !hasNextPage) return;

    try {
      setLoadingMore(true);
      const nextPage = page + 1;
      const response = await getMyAppointments(nextPage, LIMIT);
      const newAppointments = response.data || [];

      setAppointments((prev) => {
        const existingIds = new Set(prev.map((a) => a._id || a.appointmentCode));
        const unique = newAppointments.filter(
          (a: Appointment) => !existingIds.has(a._id || a.appointmentCode)
        );
        return [...prev, ...unique];
      });

      setPage(response.pagination?.page || nextPage);
      setHasNextPage(response.pagination?.hasNextPage || false);
      setTotalRecords(response.pagination?.totalRecords || 0);
    } catch (error) {
      console.log('Load more appointments error:', error);
    } finally {
      setLoadingMore(false);
    }
  };

  const refreshAppointments = async () => {
    try {
      setRefreshing(true);
      const response = await getMyAppointments(1, LIMIT);
      setAppointments(response.data || []);
      setPage(response.pagination?.page || 1);
      setHasNextPage(response.pagination?.hasNextPage || false);
      setTotalRecords(response.pagination?.totalRecords || 0);
    } catch (error) {
      console.log('Refresh appointments error:', error);
    } finally {
      setRefreshing(false);
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
        { text: 'No', style: 'cancel' },
        {
          text: 'Yes, Cancel',
          style: 'destructive',
          onPress: () => void cancelSelectedAppointment(appointmentId),
        },
      ]
    );
  };

  const renderFooter = () => {
    if (loadingMore) {
      return (
        <View style={{ paddingVertical: 20, alignItems: 'center' }}>
          <ActivityIndicator size="small" />
          <Text style={{ marginTop: 8 }}>Loading more...</Text>
        </View>
      );
    }
    if (appointments.length > 0 && !hasNextPage) {
      return (
        <View style={{ paddingVertical: 20, alignItems: 'center' }}>
          <Text>All appointments loaded</Text>
        </View>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <FlatList
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
        data={[]}
        renderItem={null}
        ListHeaderComponent={
          <>
            {header}
            <View style={styles.card}>
              <ActivityIndicator />
              <Text style={styles.loadingText}>Loading appointments...</Text>
            </View>
          </>
        }
      />
    );
  }

  return (
    <FlatList
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      data={appointments}
      keyExtractor={(item) => String(item._id || item.appointmentCode)}
      renderItem={({ item }) => (
        <AppointmentCard
          appointment={item}
          onCancel={handleCancelAppointment}
          cancelling={cancellingId === item._id}
        />
      )}
      onEndReached={loadMoreAppointments}
      onEndReachedThreshold={0.4}
      refreshing={refreshing}
      onRefresh={refreshAppointments}
      ListFooterComponent={renderFooter}
      ListHeaderComponent={
        <>
          {header}
          <View style={styles.listHeader}>
            <Text style={styles.listTitle}>My Appointments</Text>
            <Text style={styles.listCount}>{totalRecords} total</Text>
          </View>
        </>
      }
      ListEmptyComponent={
        <View style={styles.emptyCard}>
          <Text style={styles.emptyTitle}>No appointments yet</Text>
          <Text style={styles.emptyText}>
            Book your first appointment from the Book Appointment section.
          </Text>
        </View>
      }
      showsVerticalScrollIndicator={false}
    />
  );
}