import { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
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

  console.log('Appointment params:', params);
console.log('viewParam:', viewParam);
console.log('doctorIdParam:', doctorIdParam);

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
  }, [viewParam, doctorIdParam,screenKeyParam] );

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.pageHeader}>
        <Text style={styles.pageTitle}>Appointments</Text>
        <Text style={styles.pageSubtitle}>
          Book and view your hospital appointmets
        </Text>
      </View>

<View style={{ backgroundColor: '#FFF3CD', padding: 10, marginTop: 10 }}>
  <Text>DEBUG VIEW: {viewParam}</Text>
  <Text>ACTIVE TAB: {activeTab}</Text>
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

      {activeTab === 'book' ? (
        <BookAppointmentForm
          routeDoctorId={doctorIdParam}
          routeDoctorName={doctorNameParam}
           routeKey={screenKeyParam}
          onAppointmentCreated={() => setActiveTab('view')}
        />
      ) : (
        <MyAppointmentsList />
      )}
    </ScrollView>
  );
}