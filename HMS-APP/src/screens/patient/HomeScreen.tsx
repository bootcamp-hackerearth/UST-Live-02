import { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { router } from 'expo-router';

import { getPatientProfile } from '../../services/patient.service';
import { getDoctors } from '../../services/doctor.service';
import { Doctor } from '../../types/doctor.types';
import { PatientProfile } from '../../types/patient.types';
import { styles } from '../../styles/patient/home.style';

export default function HomeScreen() {
  const [profile, setProfile] = useState<PatientProfile | null>(null);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [selectedSpecialization, setSelectedSpecialization] = useState('All');
  const [searchText, setSearchText] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadHomeData();
  }, []);

  const loadHomeData = async () => {
    try {
      setLoading(true);

      const [profileData, doctorsData] = await Promise.all([
        getPatientProfile(),
        getDoctors(),
      ]);

      setProfile(profileData);
      setDoctors(doctorsData || []);
    } catch (error) {
      console.log('Home data loading error:', error);
    } finally {
      setLoading(false);
    }
  };

  const getDoctorName = (doctor: Doctor) => {
    if (doctor.name) return doctor.name;

    const fullName = `${doctor.firstName || ''} ${doctor.lastName || ''}`.trim();
    return fullName || 'Doctor';
  };

  const getDoctorInitials = (doctor: Doctor) => {
    const name = getDoctorName(doctor);
    return name
      .split(' ')
      .map((word) => word[0])
      .join('')
      .slice(0, 2)
      .toUpperCase();
  };

  const specializations = useMemo(() => {
    const values = doctors
      .map((doctor) => doctor.specialization)
      .filter(Boolean);

    return ['All', ...new Set(values)];
  }, [doctors]);

  const filteredDoctors = useMemo(() => {
    const search = searchText.toLowerCase().trim();

    return doctors.filter((doctor) => {
      const doctorName = getDoctorName(doctor).toLowerCase();
      const specialization = doctor.specialization?.toLowerCase() || '';

      const matchesSpecialization =
        selectedSpecialization === 'All' ||
        doctor.specialization === selectedSpecialization;

      const matchesSearch =
        search.length === 0 ||
        doctorName.includes(search) ||
        specialization.includes(search);

      return matchesSpecialization && matchesSearch;
    });
  }, [doctors, selectedSpecialization, searchText]);
  const handleBookAppointment = () => {
    router.push({
      pathname: '/(tabs)/appointments',
      params: {
        view: 'book',
        screenKey: Date.now().toString(),
      },
    });
  };

  const handleMyAppointments = () => {
    router.push({
      pathname: '/(tabs)/appointments',
      params: {
        view: 'my',
        screenKey: Date.now().toString(),
      },
    });
  };

  const handleDoctorBookAppointment = (doctor: Doctor) => {
    router.push({
      pathname: '/(tabs)/appointments',
      params: {
        view: 'book',
        doctorId: doctor._id || doctor.doctorId,
        screenKey: Date.now().toString(),
      },
    });
  };

  const patientName = `${profile?.firstName || ''} ${profile?.lastName || ''
    }`.trim();

  const patientUHID = profile?.UHID || profile?.uhid || 'Not available';


  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
        <Text style={styles.loadingText}>Loading home...</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.topHeader}>
        <View>
          <Text style={styles.greetingText}>Good day,</Text>
          <Text style={styles.patientName}>{patientName || 'Patient'}</Text>
        </View>

        <View style={styles.avatarCircle}>
          <Text style={styles.avatarText}>
            {(profile?.firstName?.[0] || 'P').toUpperCase()}
          </Text>
        </View>
      </View>

      <View style={styles.uhidCard}>
        <View>
          <Text style={styles.uhidLabel}>Patient UHID</Text>
          <Text style={styles.uhidValue}>{patientUHID}</Text>
        </View>

        <View style={styles.verifiedBadge}>
          <Text style={styles.verifiedText}>Active</Text>
        </View>
      </View>

      <View style={styles.quickActionRow}>
        <TouchableOpacity
          style={styles.quickActionCard}
          onPress={handleBookAppointment}
        >
          <Text style={styles.quickActionIcon}>＋</Text>
          <Text style={styles.quickActionTitle}>Book</Text>
          <Text style={styles.quickActionSubtitle}>Appointment</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.quickActionCard}
          onPress={handleMyAppointments}
        >
          <Text style={styles.quickActionIcon}>📋</Text>
          <Text style={styles.quickActionTitle}>My</Text>
          <Text style={styles.quickActionSubtitle}>Appointments</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.searchCard}>
        <Text style={styles.sectionTitle}>Find a Doctor</Text>
        <Text style={styles.sectionSubtitle}>
          Search by doctor name or specialization
        </Text>

        <TextInput
          style={styles.searchInput}
          placeholder="Search doctors, e.g. Cardiology"
          placeholderTextColor="#888780"
          value={searchText}
          onChangeText={setSearchText}
        />
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.chipScroll}
      >
        {specializations.map((specialization) => {
          const isSelected = selectedSpecialization === specialization;

          return (
            <TouchableOpacity
              key={specialization}
              style={[styles.chip, isSelected && styles.activeChip]}
              onPress={() => setSelectedSpecialization(specialization)}
            >
              <Text
                style={[
                  styles.chipText,
                  isSelected && styles.activeChipText,
                ]}
              >
                {specialization}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      <View style={styles.listHeader}>
        <Text style={styles.listTitle}>Available Doctors</Text>
        <Text style={styles.listCount}>{filteredDoctors.length} found</Text>
      </View>

      {filteredDoctors.length === 0 ? (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyTitle}>No doctors found</Text>
          <Text style={styles.emptyText}>
            Try changing the specialization or search keyword.
          </Text>
        </View>
      ) : (
        filteredDoctors.map((doctor) => {
          const doctorId = doctor.doctorId || doctor._id;

          const renderConsultationFee = () => {
            if (doctor.consultationFee === undefined) {
              return null;
            }

            return (
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Fee</Text>
                <Text style={styles.detailValue}>
                  ₹{doctor.consultationFee}
                </Text>
              </View>
            );
          };

          return (
            <View style={styles.doctorCard} key={doctorId}>
              <View style={styles.doctorTopRow}>
                <View style={styles.doctorAvatar}>
                  <Text style={styles.doctorAvatarText}>
                    {getDoctorInitials(doctor)}
                  </Text>
                </View>

                <View style={styles.doctorMainInfo}>
                  <Text style={styles.doctorName}>{getDoctorName(doctor)}</Text>
                  <Text style={styles.specialization}>
                    {doctor.specialization}
                  </Text>
                </View>
              </View>

              <View style={styles.doctorDetailsBox}>
                {doctor.qualification ? (
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Qualification</Text>
                    <Text style={styles.detailValue}>{doctor.qualification}</Text>
                  </View>
                ) : null}

                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Availability</Text>
                  <Text style={styles.detailValue}>
                    {doctor.availabilityStartTime || '--'} -{' '}
                    {doctor.availabilityEndTime || '--'}
                  </Text>
                </View>

                {renderConsultationFee()}
              </View>


              <TouchableOpacity
                style={styles.bookButton}
                onPress={() => handleDoctorBookAppointment(doctor)}
              >
                <Text style={styles.bookButtonText}>Book Appointment</Text>
              </TouchableOpacity>
            </View>
          );
        })
      )}
    </ScrollView>
  );
}