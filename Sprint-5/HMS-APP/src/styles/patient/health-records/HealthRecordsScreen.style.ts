import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },

  contentContainer: {
    padding: 16,
    paddingBottom: 32,
  },

  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F8FAFC',
  },

  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#6B7280',
  },

  header: {
    marginBottom: 8,
  },

  pageTitle: {
    fontSize: 25,
    fontWeight: '700',
    color: '#111827',
  },

  pageSubtitle: {
    marginTop: 5,
    fontSize: 14,
    color: '#6B7280',
  },

  recordCard: {
    marginTop: 14,
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 14,
  },

  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },

  recordId: {
    fontSize: 13,
    fontWeight: '700',
    color: '#2563EB',
  },

  doctorName: {
    marginTop: 7,
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },

  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 13,
    gap: 7,
  },

  infoText: {
    flex: 1,
    fontSize: 13,
    color: '#6B7280',
  },

  diagnosisSection: {
    marginTop: 15,
    paddingTop: 13,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },

  diagnosisLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#6B7280',
    textTransform: 'uppercase',
  },

  diagnosisText: {
    marginTop: 6,
    fontSize: 14,
    lineHeight: 20,
    color: '#374151',
  },

  cardFooter: {
    marginTop: 15,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  finalizedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 9,
    paddingVertical: 5,
    backgroundColor: '#EAF3DE',
    borderRadius: 16,
  },

  finalizedText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#27500A',
  },

  viewRecordText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#2563EB',
  },

  emptyCard: {
    marginTop: 28,
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 32,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 14,
  },

  emptyTitle: {
    marginTop: 14,
    fontSize: 16,
    fontWeight: '700',
    color: '#374151',
  },

  emptyText: {
    marginTop: 7,
    textAlign: 'center',
    fontSize: 14,
    lineHeight: 20,
    color: '#6B7280',
  },

  errorCard: {
    marginTop: 20,
    alignItems: 'center',
    padding: 18,
    backgroundColor: '#FEE4E2',
    borderRadius: 12,
  },

  errorText: {
    marginTop: 8,
    textAlign: 'center',
    fontSize: 14,
    color: '#B42318',
  },

  retryButton: {
    marginTop: 14,
    paddingHorizontal: 18,
    paddingVertical: 9,
    backgroundColor: '#B42318',
    borderRadius: 8,
  },

  retryButtonText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});