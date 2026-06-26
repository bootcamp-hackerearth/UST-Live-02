import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  appointmentCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 0.5,
    borderColor: '#D3D1C7',
    padding: 16,
    marginBottom: 12,
  },

  appointmentTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 12,
  },

  appointmentDoctor: {
    fontSize: 16,
    fontWeight: '700',
    color: '#2C2C2A',
  },

  appointmentMeta: {
    fontSize: 13,
    color: '#5F5E5A',
    marginTop: 4,
  },

  statusBadge: {
    backgroundColor: '#EAF3DE',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },

  statusText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#27500A',
  },

  reasonBox: {
    backgroundColor: '#F8F8F5',
    borderRadius: 10,
    padding: 12,
  },

  reasonLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#5F5E5A',
    marginBottom: 4,
  },

  reasonText: {
    fontSize: 13,
    color: '#2C2C2A',
    lineHeight: 18,
  },
  appointmentInfo: {
    flex: 1,
    paddingRight: 12,
  },

  bottomRow: {
    marginTop: 12,
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    gap: 12,
  },
  cancelButton: {
    marginTop: 8,
    backgroundColor: '#FCEBEB',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
    alignSelf: 'flex-end',
  },

  cancelButtonText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#A32D2D',
  },

  statusCancelled: {
    backgroundColor: '#FCEBEB',
  },

  statusCancelledText: {
    color: '#A32D2D',
  },

  statusCompleted: {
    backgroundColor: '#E6F1FB',
  },

  statusCompletedText: {
    color: '#0C447C',
  },

  actionButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },

  healthRecordButton: {
    backgroundColor: '#E6F1FB',
    borderWidth: 1,
    borderColor: '#185FA5',
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 7,
  },

  healthRecordButtonText: {
    color: '#185FA5',
    fontSize: 12,
    fontWeight: '600',
  },
});

