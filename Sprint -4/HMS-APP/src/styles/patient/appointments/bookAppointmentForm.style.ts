import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 0.5,
    borderColor: '#D3D1C7',
    padding: 16,
  },

  cardTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#2C2C2A',
    marginBottom: 16,
  },

  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#2C2C2A',
    marginBottom: 8,
    marginTop: 12,
  },

  selectedDoctorBox: {
    backgroundColor: '#E6F1FB',
    borderRadius: 10,
    padding: 12,
    marginBottom: 4,
    borderWidth: 1.5,       // add this
  borderColor: '#185FA5', // add this
  },
  
  selectedBadge: {
  backgroundColor: '#185FA5',
  borderRadius: 20,
  paddingHorizontal: 9,
  paddingVertical: 3,
},
selectedBadgeText: {
  fontSize: 11,
  fontWeight: '500' as const,
  color: '#FFFFFF',
},
selectedDoctorAvatar: {
  width: 42,
  height: 42,
  borderRadius: 21,
  backgroundColor: '#185FA5',
  alignItems: 'center' as const,
  justifyContent: 'center' as const,
},
selectedDoctorInitials: {
  fontSize: 14,
  fontWeight: '600' as const,
  color: '#FFFFFF',
},
  

  selectedDoctorName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#185FA5',
  },

  selectedDoctorSpecialization: {
    fontSize: 12,
    color: '#5F5E5A',
    marginTop: 3,
  },
doctorChip: {
  minWidth: 150,
  paddingVertical: 12,
  paddingHorizontal: 14,
  borderRadius: 10,
  borderWidth: 1,
  borderColor: '#D3D1C7',
  backgroundColor: '#FFFFFF',
  marginRight: 10,
},

activeDoctorChip: {
  backgroundColor: '#185FA5',
  borderColor: '#185FA5',
  borderWidth: 2,
  shadowColor: '#185FA5',
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.25,
  shadowRadius: 6,
  elevation: 4,
},
doctorGrid: {
  flexDirection: 'row' as const,
  flexWrap: 'wrap' as const,
  gap: 10,
  marginBottom: 12,
},
doctorGridCard: {
  width: '47%',
  paddingVertical: 12,
  paddingHorizontal: 12,
  borderRadius: 10,
  borderWidth: 1,
  borderColor: '#D3D1C7',
  backgroundColor: '#FFFFFF',
},
activeDoctorGridCard: {
  backgroundColor: '#185FA5',  // same as activeSlotButton
  borderColor: '#185FA5',
  borderWidth: 1.5,
},
  doctorChipText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#2C2C2A',
  },

  doctorChipSubText: {
    fontSize: 12,
    color: '#5F5E5A',
    marginTop: 3,
  },

  activeDoctorChipText: {
    color: '#FFFFFF',
  },

  input: {
    height: 44,
    backgroundColor: '#F8F8F5',
    borderWidth: 1,
    borderColor: '#D3D1C7',
    borderRadius: 10,
    paddingHorizontal: 14,
    fontSize: 14,
    color: '#2C2C2A',
  },

  helperText: {
    fontSize: 12,
    color: '#5F5E5A',
    marginTop: 5,
  },

  reasonInput: {
    minHeight: 90,
    textAlignVertical: 'top',
    paddingTop: 12,
  },

  slotLoadingBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F8F5',
    borderRadius: 10,
    padding: 14,
    gap: 10,
  },

  slotLoadingText: {
    fontSize: 13,
    color: '#5F5E5A',
  },

  emptySlotBox: {
    backgroundColor: '#F8F8F5',
    borderRadius: 10,
    padding: 14,
  },

  emptySlotText: {
    fontSize: 13,
    color: '#5F5E5A',
  },

  slotGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },

  slotButton: {
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: 20,
    backgroundColor: '#F8F8F5',
    borderWidth: 1,
    borderColor: '#D3D1C7',
  },

  activeSlotButton: {
    backgroundColor: '#185FA5',
    borderColor: '#185FA5',
  },

  slotText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#2C2C2A',
  },

  activeSlotText: {
    color: '#FFFFFF',
  },

  submitButton: {
    height: 44,
    backgroundColor: '#185FA5',
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 18,
  },

  disabledButton: {
    opacity: 0.7,
  },

  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },

  loadingText: {
    marginTop: 10,
    fontSize: 14,
    color: '#5F5E5A',
    textAlign: 'center',
  },

  doctorChipScroll: {
  marginBottom: 22,
},

doctorChipContainer: {
  paddingBottom: 4,
  gap: 10,
},

showMoreText: {
  fontSize: 13,
  color: '#185FA5',
  fontWeight: '600' as const,
  textAlign: 'center' as const,
  marginTop: 6,
  marginBottom: 12,
},
});


