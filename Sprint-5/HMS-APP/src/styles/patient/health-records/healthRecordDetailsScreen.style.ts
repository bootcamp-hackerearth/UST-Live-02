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

  errorContainer: {
    flex: 1,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F8FAFC',
  },

  errorTitle: {
    marginTop: 14,
    fontSize: 18,
    fontWeight: '700',
    color: '#374151',
  },

  errorText: {
    marginTop: 8,
    textAlign: 'center',
    color: '#B42318',
    fontSize: 14,
  },

  retryButton: {
    marginTop: 18,
    paddingHorizontal: 22,
    paddingVertical: 11,
    backgroundColor: '#2563EB',
    borderRadius: 8,
  },

  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },

  backButton: {
    marginTop: 12,
    paddingHorizontal: 18,
    paddingVertical: 10,
  },

  backButtonText: {
    color: '#2563EB',
    fontSize: 14,
    fontWeight: '600',
  },

  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 18,
  },

  iconButton: {
    width: 42,
    height: 42,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },

  headerTextContainer: {
    marginLeft: 12,
  },

  pageTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#111827',
  },

  recordId: {
    marginTop: 3,
    fontSize: 13,
    fontWeight: '600',
    color: '#2563EB',
  },

  statusCard: {
    padding: 14,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    marginBottom: 14,
  },

  statusBadge: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 5,
    backgroundColor: '#EAF3DE',
    borderRadius: 16,
  },

  statusText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#27500A',
  },

  finalizedDate: {
    marginTop: 10,
    fontSize: 13,
    color: '#6B7280',
  },

  sectionCard: {
    marginTop: 14,
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
  },

  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 12,
  },

  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 16,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },

  detailLabel: {
    flex: 1,
    fontSize: 13,
    color: '#6B7280',
  },

  detailValue: {
    flex: 1,
    textAlign: 'right',
    fontSize: 13,
    fontWeight: '600',
    color: '#374151',
  },

  bodyText: {
    fontSize: 14,
    lineHeight: 21,
    color: '#374151',
  },

  mutedText: {
    fontSize: 14,
    color: '#6B7280',
  },

  medicineCard: {
    marginTop: 10,
    padding: 13,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 10,
  },

  medicineName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#2563EB',
    marginBottom: 8,
  },

  medicineDetailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 5,
  },

  medicineLabel: {
    fontSize: 13,
    color: '#6B7280',
  },

  medicineValue: {
    fontSize: 13,
    fontWeight: '600',
    color: '#374151',
  },

  medicineNotesBox: {
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },

  medicineNotesLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#6B7280',
    textTransform: 'uppercase',
  },

  medicineNotesText: {
    marginTop: 4,
    fontSize: 13,
    lineHeight: 19,
    color: '#374151',
  },
});