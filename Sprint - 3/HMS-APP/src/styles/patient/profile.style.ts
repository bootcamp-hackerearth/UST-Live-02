import { StyleSheet } from 'react-native';

export const profileStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F4F7FB',
  },

  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F4F7FB',
  },

  header: {
    alignItems: 'center',
    backgroundColor: '#0F172A',
    paddingVertical: 36,
    paddingHorizontal: 20,
  },

  avatar: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: '#1E293B',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },

  name: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '700',
    textAlign: 'center',
  },

  uhid: {
    color: '#94A3B8',
    fontSize: 13,
    marginTop: 4,
  },

  nameEditRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 12,
    paddingHorizontal: 16,
    width: '100%',
  },

  nameInput: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: '#0F172A',
  },

  card: {
    backgroundColor: '#FFFFFF',
    margin: 12,
    borderRadius: 22,
    padding: 20,
    shadowColor: '#000000',
    shadowOpacity: 0.12,
    shadowRadius: 16,
    shadowOffset: {
      width: 0,
      height: 8,
    },
    elevation: 6,
  },

  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 12,
  },

  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },

  infoLabel: {
    flex: 1,
    color: '#64748B',
    fontSize: 14,
    marginLeft: 10,
  },

  infoValue: {
    flex: 2,
    color: '#0F172A',
    fontSize: 14,
    fontWeight: '500',
  },

  editRow: {
    marginVertical: 6,
  },

  editLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },

  editInput: {
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
    color: '#0F172A',
    backgroundColor: '#F8FAFC',
  },

  editInputError: {
    borderColor: '#EF4444',
  },

  errorText: {
    fontSize: 12,
    color: '#EF4444',
    marginTop: 4,
  },

  editButton: {
    marginHorizontal: 12,
    marginTop: 10,
    marginBottom: 12,
    backgroundColor: '#0F172A',
    paddingVertical: 16,
    borderRadius: 22,
    alignItems: 'center',
  },

  editButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 15,
  },

  editActionRow: {
    flexDirection: 'row',
    gap: 12,
    marginHorizontal: 12,
    marginTop: 10,
    marginBottom: 12,
  },

  cancelEditButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    paddingVertical: 13,
    borderRadius: 12,
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },

  cancelEditButtonText: {
    color: '#0F172A',
    fontSize: 14,
    fontWeight: '700',
  },

  saveButton: {
    flex: 1,
    backgroundColor: '#185FA5',
    paddingVertical: 13,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },

  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },

  logoutButton: {
    marginHorizontal: 12,
    marginTop: 0,
    marginBottom: 24,
    backgroundColor: '#FEE2E2',
    paddingVertical: 16,
    borderRadius: 22,
    alignItems: 'center',
  },

  logoutButtonText: {
    color: '#DC2626',
    fontWeight: '700',
    fontSize: 15,
  },

  dropdownButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: '#F8FAFC',
    minHeight: 44,
  },

  dropdownButtonError: {
    borderColor: '#EF4444',
  },

  dropdownValueText: {
    flex: 1,
    fontSize: 15,
    color: '#0F172A',
  },

  dropdownPlaceholderText: {
    flex: 1,
    fontSize: 15,
    color: '#94A3B8',
  },

  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    justifyContent: 'flex-end',
  },

  sheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '70%',
    paddingBottom: 24,
  },

  datePickerSheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 24,
  },

  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },

  sheetTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
  },

  // Used for the iOS date picker modal "Done" button
  sheetDoneText: {
    color: '#2563EB',
    fontWeight: '600',
    fontSize: 15,
  },

  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 4,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    paddingHorizontal: 10,
    backgroundColor: '#F8FAFC',
  },

  searchInput: {
    flex: 1,
    paddingVertical: 8,
    fontSize: 14,
    color: '#0F172A',
  },

  optionList: {
    paddingHorizontal: 8,
    marginTop: 4,
  },

  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 13,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginVertical: 1,
  },

  optionItemSelected: {
    backgroundColor: '#EFF6FF',
  },

  optionText: {
    fontSize: 15,
    color: '#334155',
  },

  optionTextSelected: {
    color: '#2563EB',
    fontWeight: '600',
  },

  emptyText: {
    textAlign: 'center',
    color: '#94A3B8',
    fontSize: 14,
    paddingVertical: 24,
  },
});