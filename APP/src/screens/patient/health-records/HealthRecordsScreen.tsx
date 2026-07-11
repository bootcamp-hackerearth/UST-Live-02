import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import HealthRecordCard from './HealthRecordCard';
import { getMyHealthRecords } from '../../../services/health-record.service';
import { HealthRecord } from '../../../types/health-record.types';
import { styles } from '../../../styles/patient/health-records/HealthRecordsScreen.style';

export default function HealthRecordsScreen() {
  const [healthRecords, setHealthRecords] = useState<HealthRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const loadHealthRecords = useCallback(async () => {
    try {
      setErrorMessage('');

      const response = await getMyHealthRecords();

      setHealthRecords(response.data || []);
    } catch (error: any) {
      console.log(
        'Health records loading error:',
        error?.response?.data || error
      );

      setHealthRecords([]);

      setErrorMessage(
        error?.response?.data?.message || 'Unable to load health records'
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadHealthRecords();
  }, [loadHealthRecords]);

  const handleRefresh = (): void => {
    setRefreshing(true);
    loadHealthRecords();
  };

  const handleRetry = (): void => {
    setLoading(true);
    loadHealthRecords();
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2563EB" />
        <Text style={styles.loadingText}>Loading health records...</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={handleRefresh}
          tintColor="#2563EB"
        />
      }
    >
      <View style={styles.header}>
        <Text style={styles.pageTitle}>Health Records</Text>

        <Text style={styles.pageSubtitle}>
          View your finalized consultation records.
        </Text>
      </View>

      {errorMessage ? (
        <View style={styles.errorCard}>
          <Ionicons
            name="alert-circle-outline"
            size={24}
            color="#B42318"
          />

          <Text style={styles.errorText}>{errorMessage}</Text>

          <TouchableOpacity
            style={styles.retryButton}
            onPress={handleRetry}
          >
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : null}

      {!errorMessage && healthRecords.length === 0 ? (
        <View style={styles.emptyCard}>
          <Ionicons
            name="document-text-outline"
            size={46}
            color="#9CA3AF"
          />

          <Text style={styles.emptyTitle}>No health records found</Text>

          <Text style={styles.emptyText}>
            Finalized health records will appear here after your consultation.
          </Text>
        </View>
      ) : null}

      {!errorMessage &&
        healthRecords.map((record) => (
          <HealthRecordCard
            key={record._id}
            record={record}
          />
        ))}
    </ScrollView>
  );
}