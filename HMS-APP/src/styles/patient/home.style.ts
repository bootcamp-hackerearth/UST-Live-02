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

  loadingContainer: {
    flex: 1,
    backgroundColor: '#F1EFE8',
    alignItems: 'center',
    justifyContent: 'center',
  },

  loadingText: {
    marginTop: 10,
    fontSize: 14,
    color: '#5F5E5A',
  },

  topHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },

  greetingText: {
    fontSize: 14,
    color: '#5F5E5A',
    marginBottom: 2,
  },

  patientName: {
    fontSize: 26,
    fontWeight: '700',
    color: '#2C2C2A',
  },

  avatarCircle: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: '#185FA5',
    alignItems: 'center',
    justifyContent: 'center',
  },

  avatarText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },

  uhidCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 0.5,
    borderColor: '#D3D1C7',
    padding: 16,
    marginBottom: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  uhidLabel: {
    fontSize: 12,
    color: '#5F5E5A',
    marginBottom: 4,
  },

  uhidValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#185FA5',
  },

  verifiedBadge: {
    backgroundColor: '#EAF3DE',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },

  verifiedText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#27500A',
  },

  quickActionRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },

  quickActionCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 0.5,
    borderColor: '#D3D1C7',
    padding: 16,
  },

  quickActionIcon: {
    fontSize: 24,
    marginBottom: 10,
    color: '#185FA5',
  },

  quickActionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#2C2C2A',
  },

  quickActionSubtitle: {
    fontSize: 13,
    color: '#5F5E5A',
    marginTop: 2,
  },

  searchCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 0.5,
    borderColor: '#D3D1C7',
    padding: 16,
    marginBottom: 14,
  },

  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#2C2C2A',
  },

  sectionSubtitle: {
    fontSize: 13,
    color: '#5F5E5A',
    marginTop: 4,
    marginBottom: 14,
  },

  searchInput: {
    height: 44,
    backgroundColor: '#F8F8F5',
    borderWidth: 1,
    borderColor: '#D3D1C7',
    borderRadius: 10,
    paddingHorizontal: 14,
    fontSize: 14,
    color: '#2C2C2A',
  },

  chipScroll: {
    marginBottom: 16,
  },

  chip: {
    paddingHorizontal: 15,
    paddingVertical: 9,
    borderRadius: 22,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D3D1C7',
    marginRight: 8,
  },

  activeChip: {
    backgroundColor: '#185FA5',
    borderColor: '#185FA5',
  },

  chipText: {
    fontSize: 13,
    color: '#2C2C2A',
    fontWeight: '600',
  },

  activeChipText: {
    color: '#FFFFFF',
  },

  listHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
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

  doctorCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 0.5,
    borderColor: '#D3D1C7',
    padding: 16,
    marginBottom: 12,
  },

  doctorTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },

  doctorAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#E6F1FB',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },

  doctorAvatarText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#185FA5',
  },

  doctorMainInfo: {
    flex: 1,
  },

  doctorName: {
    fontSize: 17,
    fontWeight: '700',
    color: '#2C2C2A',
  },

  specialization: {
    fontSize: 13,
    color: '#185FA5',
    fontWeight: '600',
    marginTop: 3,
  },

  doctorDetailsBox: {
    backgroundColor: '#F8F8F5',
    borderRadius: 10,
    padding: 12,
    marginBottom: 14,
  },

  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 8,
  },

  detailLabel: {
    fontSize: 12,
    color: '#5F5E5A',
    flex: 1,
  },

  detailValue: {
    fontSize: 12,
    color: '#2C2C2A',
    fontWeight: '600',
    flex: 1.4,
    textAlign: 'right',
  },

  bookButton: {
    height: 42,
    backgroundColor: '#185FA5',
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },

  bookButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
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
  },
});