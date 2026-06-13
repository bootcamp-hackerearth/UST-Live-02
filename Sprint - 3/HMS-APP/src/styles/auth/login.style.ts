import { StyleSheet } from 'react-native';
import { COLORS } from '@/constants/theme';

export const loginStyles = StyleSheet.create({
  keyboardView: {
    flex: 1,
    backgroundColor: '#D9E6FF',
  },

scrollContainer: {
  flexGrow: 1,
  justifyContent: 'center',
  paddingHorizontal: 22,
  paddingVertical: 40,
  // backgroundColor: 'black',
  backgroundColor: '#D9E6FF',
},

  loginCard: {
    backgroundColor: COLORS.white,
    borderRadius: 18,
    padding: 24,
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 20,
    shadowOffset: {
      width: 0,
      height: 6,
    },
    elevation: 6,
  },

  logoCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: COLORS.primary,
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 18,
  },

  logoText: {
    color: COLORS.white,
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: 1,
  },

  title: {
    fontSize: 28,
    fontWeight: '800',
    color: COLORS.textDark,
    textAlign: 'center',
    marginBottom: 8,
  },

  subtitle: {
    fontSize: 14,
    color: COLORS.textLight,
    textAlign: 'center',
    marginBottom: 28,
    lineHeight: 20,
  },

  formContainer: {
    marginTop: 4,
  },

  forgotContainer: {
    alignSelf: 'flex-end',
    marginTop: -6,
    marginBottom: 18,
  },

  forgotText: {
    color: COLORS.secondary,
    fontSize: 14,
    fontWeight: '600',
  },

  registerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 24,
  },

  registerText: {
    color: COLORS.textLight,
    fontSize: 14,
  },

  registerLink: {
    color: COLORS.secondary,
    fontSize: 14,
    fontWeight: '700',
  },
  showPasswordText: {
  color: COLORS.secondary,
  fontSize: 13,
  fontWeight: '700',
},
});