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

  card: {
    backgroundColor: '#FFFFFF',
    margin: 12,
    borderRadius: 22,
    padding: 20,
    shadowColor: '#000',
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
    borderBottomColor: '#F4F7FB',
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

  editButton: {
    margin: 12,
    backgroundColor: '#0F172A',
    padding: 16,
    borderRadius: 22,
    alignItems: 'center',
  },

  editButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 15,
  },

  logoutButton: {
    margin: 12,
    marginTop: 0,
    backgroundColor: '#FEE2E2',
    padding: 16,
    borderRadius: 22,
    alignItems: 'center',
  },

  logoutButtonText: {
    color: '#DC2626',
    fontWeight: '700',
    fontSize: 15,
  },

  nameEditRow: {
  flexDirection: 'row',
  gap: 10,
  marginTop: 12,
  paddingHorizontal: 16,
},

nameInput: {
  flex: 1,
  backgroundColor: '#FFFFFF',
  borderWidth: 1,
  borderColor: '#D3D1C7',
  borderRadius: 10,
  paddingHorizontal: 12,
  paddingVertical: 10,
  fontSize: 14,
  color: '#2C2C2A',
},

editRow: {
  marginBottom: 14,
},

editLabel: {
  fontSize: 13,
  fontWeight: '600',
  color: '#5F5E5A',
  marginBottom: 6,
},

editInput: {
  borderWidth: 1,
  borderColor: '#D3D1C7',
  borderRadius: 10,
  paddingHorizontal: 12,
  paddingVertical: 10,
  fontSize: 14,
  color: '#2C2C2A',
  backgroundColor: '#FFFFFF',
},

editActionRow: {
  flexDirection: 'row',
  gap: 12,
  marginTop: 10,
  marginBottom: 12,
},

cancelEditButton: {
  flex: 1,
  borderWidth: 1,
  borderColor: '#D3D1C7',
  paddingVertical: 13,
  borderRadius: 12,
  alignItems: 'center',
  backgroundColor: '#FFFFFF',
},

cancelEditButtonText: {
  color: '#2C2C2A',
  fontSize: 14,
  fontWeight: '700',
},

saveButton: {
  flex: 1,
  backgroundColor: '#185FA5',
  paddingVertical: 13,
  borderRadius: 12,
  alignItems: 'center',
},

saveButtonText: {
  color: '#FFFFFF',
  fontSize: 14,
  fontWeight: '700',
},

editInputError: {
  borderColor: '#A32D2D',
},

errorText: {
  color: '#A32D2D',
  fontSize: 12,
  marginTop: 4,
},
});

