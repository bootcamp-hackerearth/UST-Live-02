import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 0.5,
    borderColor: '#D3D1C7',
    padding: 16,
    alignItems: 'center',
  },

  loadingText: {
    marginTop: 10,
    fontSize: 14,
    color: '#5F5E5A',
  },

  listHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },

  listTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#2C2C2A',
  },

  listCount: {
    fontSize: 12,
    color: '#5F5E5A',
  },

  emptyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 0.5,
    borderColor: '#D3D1C7',
    padding: 24,
    alignItems: 'center',
  },

  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#2C2C2A',
    marginBottom: 6,
  },

  emptyText: {
    fontSize: 13,
    color: '#5F5E5A',
    textAlign: 'center',
    lineHeight: 18,
  },

  
});

