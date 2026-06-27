import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F1EFE8',
  },

  contentContainer: {
    padding: 16,
    paddingBottom: 32,
  },

  pageHeader: {
    marginBottom: 16,
  },

  pageTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#2C2C2A',
  },

  pageSubtitle: {
    fontSize: 14,
    color: '#5F5E5A',
    marginTop: 4,
  },

  segmentContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 0.5,
    borderColor: '#D3D1C7',
    padding: 4,
    marginBottom: 16,
  },

  segmentButton: {
    flex: 1,
    height: 42,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 9,
  },

  activeSegmentButton: {
    backgroundColor: '#185FA5',
  },

  segmentText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#5F5E5A',
  },

  activeSegmentText: {
    color: '#FFFFFF',
  },
});