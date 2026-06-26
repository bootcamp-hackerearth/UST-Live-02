import { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, FlatList } from 'react-native'; // ← removed ScrollView
import { useLocalSearchParams } from 'expo-router';

import BookAppointmentForm from '../appointments/BookAppointmentForm';
import MyAppointmentsList from '../appointments/MyAppointmentsList';
import { styles } from '../../../styles/patient/appointments/appointmentScreen.style';

export default function AppointmentScreen() {
  const params = useLocalSearchParams();

  const viewParam = params.view ? String(params.view) : '';
  const doctorIdParam = params.doctorId ? String(params.doctorId) : '';
  const doctorNameParam = params.doctorName ? String(params.doctorName) : '';
  const screenKeyParam = params.screenKey ? String(params.screenKey) : '';

  const [activeTab, setActiveTab] = useState<'book' | 'view'>('view');

  useEffect(() => {
    if (viewParam === 'book') {
      setActiveTab('book');
      return;
    }

    if (viewParam === 'my' || viewParam === 'view') {
      setActiveTab('view');
      return;
    }

    if (doctorIdParam) {
      setActiveTab('book');
    }
  }, [viewParam, doctorIdParam, screenKeyParam]);

  const header = (
    <>
      <View style={styles.pageHeader}>
        <Text style={styles.pageTitle}>Appointments</Text>
        <Text style={styles.pageSubtitle}>
          Book and view your hospital appointments
        </Text>
      </View>

      <View style={styles.segmentContainer}>
        <TouchableOpacity
          style={[
            styles.segmentButton,
            activeTab === 'book' && styles.activeSegmentButton,
          ]}
          onPress={() => setActiveTab('book')}
        >
          <Text
            style={[
              styles.segmentText,
              activeTab === 'book' && styles.activeSegmentText,
            ]}
          >
            Book Appointment
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.segmentButton,
            activeTab === 'view' && styles.activeSegmentButton,
          ]}
          onPress={() => setActiveTab('view')}
        >
          <Text
            style={[
              styles.segmentText,
              activeTab === 'view' && styles.activeSegmentText,
            ]}
          >
            My Appointments
          </Text>
        </TouchableOpacity>
      </View>

      {activeTab === 'book' && (
        <BookAppointmentForm
          routeDoctorId={doctorIdParam}
          routeDoctorName={doctorNameParam}
          routeKey={screenKeyParam}
          onAppointmentCreated={() => setActiveTab('view')}
        />
      )}
    </>
  );

  if (activeTab === 'book') {
    return (
      <FlatList
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
        data={[]}
        renderItem={null}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={header}
      />
    );
  }

  return (
    <MyAppointmentsList header={header} />
  );
}