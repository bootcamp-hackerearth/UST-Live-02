import { StyleSheet } from 'react-native';

export const registerStyles = StyleSheet.create({
  keyboardView: {
    flex: 1,
    backgroundColor: '#F4F7FB',
  },

  scrollContainer: {
    flexGrow: 1,
    padding: 20,
    justifyContent: 'center',
  },

  registerCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    padding: 24,
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 16,
    shadowOffset: {
      width: 0,
      height: 8,
    },
    elevation: 6,
  },

  logoCircle: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: '#0F172A',
    alignSelf: 'center',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 18,
  },

  logoText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '700',
  },

  title: {
    fontSize: 26,
    fontWeight: '700',
    color: '#0F172A',
    textAlign: 'center',
    marginBottom: 8,
  },

  subtitle: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
    marginBottom: 26,
    lineHeight: 20,
  },

  formContainer: {
    gap: 16,
  },

  row: {
    flexDirection: 'row',
    gap: 12,
  },

  halfInput: {
    flex: 1,
  },

  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
    marginTop: 8,
    marginBottom: -4,
  },

  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 8,
  },

  loginText: {
    fontSize: 14,
    color: '#64748B',
  },

  loginLink: {
    fontSize: 14,
    color: '#2563EB',
    fontWeight: '700',
  },
});

export const pickerStyles = StyleSheet.create({
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 4,
  },
  pickerWrapper: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    overflow: 'hidden',
    justifyContent: 'center',
  },
  pickerWrapperError: {
    borderColor: '#EF4444',
  },
  picker: {
    height: 48,
    color: '#111827',
  },
  errorText: {
    fontSize: 12,
    color: '#EF4444',
    marginTop: 4,
  },
  dobTrigger: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    height: 48,
    paddingHorizontal: 12,
  },
  dobValueText: {
    fontSize: 15,
    color: '#111827',
  },
  dobPlaceholderText: {
    fontSize: 15,
    color: '#9CA3AF',
  },
  calendarIcon: {
    fontSize: 18,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  iosPickerContainer: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingBottom: 24,
  },
  iosPickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E5E7EB',
  },
  iosPickerCancel: {
    fontSize: 16,
    color: '#6B7280',
  },
  iosPickerDone: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2563EB',
  },
});