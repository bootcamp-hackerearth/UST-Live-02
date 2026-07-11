import { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  FlatList,
} from 'react-native';
import { router } from 'expo-router';

import { getPatientProfile } from '../../services/patient.service';
import { getDoctors, getDoctorSpecializations } from '../../services/doctor.service';
import { Doctor } from '../../types/doctor.types';
import { PatientProfile } from '../../types/patient.types';
import { styles } from '../../styles/patient/home.style';

const LIMIT = 1;

export default function HomeScreen() {
  const [profile, setProfile] = useState<PatientProfile | null>(null);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [selectedSpecialization, setSelectedSpecialization] = useState('All');
  const [specializations, setSpecializations] = useState<string[]>(['All']);
  const [searchText, setSearchText] = useState('');

  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const [page, setPage] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [totalRecords, setTotalRecords] = useState(0);

  useEffect(() => {
    loadHomeData();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      loadDoctorsBySearch();
    }, 400);

    return () => clearTimeout(timer);
  }, [searchText, selectedSpecialization]);
  const loadDoctorsBySearch = async () => {
    try {
      console.log('SEARCH PARAMS:', { searchText, selectedSpecialization });
      const doctorResponse = await getDoctors(
        1,
        LIMIT,
        searchText,
        selectedSpecialization
      );
       console.log('SEARCH RESULT:', JSON.stringify(doctorResponse.data, null, 2)); 

      setDoctors(doctorResponse.data || []);
      setPage(doctorResponse.pagination?.page || 1);
      setHasNextPage(
        doctorResponse.pagination?.hasNextPage || false
      );
      setTotalRecords(
        doctorResponse.pagination?.totalRecords || 0
      );
    } catch (error) {
      console.log('Doctor search error:', error);
    }
  };
  const loadHomeData = async () => {
    try {
      setLoading(true);

      const [profileData, doctorResponse, specializationData] = await Promise.all([
        getPatientProfile(),
        getDoctors(1, LIMIT, ''),//for showcase in the demo
        getDoctorSpecializations(),
      ]);

      console.log('SPECIALIZATION API RESPONSE:', specializationData);

      const cleanedSpecializations = specializationData
        .filter((item) => item.trim().toLowerCase() !== 'all')
        .map((item) => item.trim());
      setProfile(profileData);
      setDoctors(doctorResponse.data || []);

      setSpecializations([
        'All',
        ...Array.from(new Set(cleanedSpecializations)),
      ]);
      setPage(doctorResponse.pagination?.page || 1);
      setHasNextPage(
        doctorResponse.pagination?.hasNextPage || false
      );
      setTotalRecords(
        doctorResponse.pagination?.totalRecords || 0
      );
    } catch (error) {
      console.log('Home data loading error:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadMoreDoctors = async () => {
    if (loadingMore || !hasNextPage) {
      return;
    }

    try {
      setLoadingMore(true);

      const nextPage = page + 1;
      const doctorResponse = await getDoctors(nextPage, LIMIT, searchText,selectedSpecialization);

      const newDoctors = doctorResponse.data || [];

      setDoctors((previousDoctors) => {
        const existingDoctorIds = new Set(
          previousDoctors.map(
            (doctor) => doctor.doctorId || doctor._id
          )
        );

        const uniqueDoctors = newDoctors.filter(
          (doctor: Doctor) =>
            !existingDoctorIds.has(doctor.doctorId || doctor._id)
        );

        return [...previousDoctors, ...uniqueDoctors];
      });

      setPage(doctorResponse.pagination?.page || nextPage);
      setHasNextPage(
        doctorResponse.pagination?.hasNextPage || false
      );
      setTotalRecords(
        doctorResponse.pagination?.totalRecords || 0
      );
    } catch (error) {
      console.log('Load more doctors error:', error);
    } finally {
      setLoadingMore(false);
    }
  };

  const refreshDoctors = async () => {
    try {
      setRefreshing(true);

      const doctorResponse = await getDoctors(1, LIMIT);

      setDoctors(doctorResponse.data || []);
      setPage(doctorResponse.pagination?.page || 1);
      setHasNextPage(
        doctorResponse.pagination?.hasNextPage || false
      );
      setTotalRecords(
        doctorResponse.pagination?.totalRecords || 0
      );
    } catch (error) {
      console.log('Refresh doctors error:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const getDoctorName = (doctor: Doctor) => {
    if (doctor.name) {
      return doctor.name;
    }

    const fullName =
      `${doctor.firstName || ''} ${doctor.lastName || ''}`.trim();

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


  // Current local search:
  // It searches doctors loaded so far.


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

  const renderDoctor = ({ item: doctor }: { item: Doctor }) => {
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
      <View style={styles.doctorCard}>
        <View style={styles.doctorTopRow}>
          <View style={styles.doctorAvatar}>
            <Text style={styles.doctorAvatarText}>
              {getDoctorInitials(doctor)}
            </Text>
          </View>

          <View style={styles.doctorMainInfo}>
            <Text style={styles.doctorName}>
              {getDoctorName(doctor)}
            </Text>

            <Text style={styles.specialization}>
              {doctor.specialization || 'Not specified'}
            </Text>
          </View>
        </View>

        <View style={styles.doctorDetailsBox}>
          {doctor.qualification ? (
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Qualification</Text>
              <Text style={styles.detailValue}>
                {doctor.qualification}
              </Text>
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
          <Text style={styles.bookButtonText}>
            Book Appointment
          </Text>
        </TouchableOpacity>
      </View>
    );
  };

  const renderFooter = () => {
    if (loadingMore) {
      return (
        <View style={{ paddingVertical: 20, alignItems: 'center' }}>
          <ActivityIndicator size="small" />
          <Text style={{ marginTop: 8 }}>
            Loading more doctors...
          </Text>
        </View>
      );
    }

    if (doctors.length > 0 && !hasNextPage) {
      return (
        <View style={{ paddingVertical: 20, alignItems: 'center' }}>
          <Text>All doctors have been loaded</Text>
        </View>
      );
    }

    return null;
  };

  const patientName =
    `${profile?.firstName || ''} ${profile?.lastName || ''}`.trim();

  const patientUHID =
    profile?.UHID || profile?.uhid || 'Not available';

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
        <Text style={styles.loadingText}>Loading home...</Text>
      </View>
    );
  }

  return (
    <FlatList
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      data={doctors}
      keyExtractor={(doctor) =>
        String(doctor.doctorId || doctor._id)
      }
      renderItem={renderDoctor}
      showsVerticalScrollIndicator={false}
      onEndReached={loadMoreDoctors}
      onEndReachedThreshold={0.4}
      refreshing={refreshing}
      onRefresh={refreshDoctors}
      ListFooterComponent={renderFooter}
      ListEmptyComponent={
        <View style={styles.emptyCard}>
          <Text style={styles.emptyTitle}>No doctors found</Text>
          <Text style={styles.emptyText}>
            Try changing the specialization or search keyword.
          </Text>
        </View>
      }
      ListHeaderComponent={
        <>
          <View style={styles.topHeader}>
            <View>
              <Text style={styles.greetingText}>Good day,</Text>
              <Text style={styles.patientName}>
                {patientName || 'Patient'}
              </Text>
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
              <Text style={styles.quickActionSubtitle}>
                Appointment
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.quickActionCard}
              onPress={handleMyAppointments}
            >
              <Text style={styles.quickActionIcon}>📋</Text>
              <Text style={styles.quickActionTitle}>My</Text>
              <Text style={styles.quickActionSubtitle}>
                Appointments
              </Text>
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
              const isSelected =
                selectedSpecialization === specialization;

              return (
                <TouchableOpacity
                  key={specialization}
                  style={[
                    styles.chip,
                    isSelected && styles.activeChip,
                  ]}
                  onPress={() =>
                    setSelectedSpecialization(specialization)
                  }
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
            <Text style={styles.listCount}>
              {totalRecords} found
            </Text>
          </View>
        </>
      }
    />
  );
}