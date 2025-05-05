import { StyleSheet } from 'react-native';
import theme from './theme';

const { COLORS, SIZES, SHADOWS } = theme;

export default StyleSheet.create({
  // Container styles
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  safeAreaView: {
    flex: 1,
    backgroundColor: COLORS.backgroundDark,
  },
  contentContainer: {
    flex: 1,
    padding: SIZES.spacing.md,
  },
  centeredContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SIZES.spacing.lg,
  },
  rowContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  spaceBetween: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  
  // Text styles
  title: {
    fontSize: SIZES.xxLarge,
    fontWeight: 'bold',
    color: COLORS.white,
    marginBottom: SIZES.spacing.lg,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: SIZES.large,
    fontWeight: '500',
    color: COLORS.white,
    marginVertical: SIZES.spacing.md,
  },
  text: {
    fontSize: SIZES.medium,
    color: COLORS.white,
  },
  textLight: {
    fontSize: SIZES.medium,
    color: COLORS.textLight,
  },
  errorText: {
    fontSize: SIZES.medium,
    color: COLORS.danger,
    textAlign: 'center',
    marginTop: SIZES.spacing.md,
  },
  
  // Input styles
  input: {
    backgroundColor: COLORS.cardDark,
    color: COLORS.white,
    padding: SIZES.spacing.md,
    marginBottom: SIZES.spacing.md,
    borderRadius: SIZES.radius.md,
    width: '100%',
    fontSize: SIZES.medium,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  
  // Button styles
  button: {
    backgroundColor: COLORS.primary,
    paddingVertical: SIZES.spacing.md,
    paddingHorizontal: SIZES.spacing.lg,
    borderRadius: SIZES.radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: SIZES.spacing.sm,
    ...SHADOWS.medium,
  },
  buttonText: {
    color: COLORS.white,
    fontSize: SIZES.medium,
    fontWeight: '600',
  },
  buttonIcon: {
    marginBottom: SIZES.spacing.xs,
  },
  fullWidthButton: {
    width: '100%',
    backgroundColor: COLORS.primary,
    paddingVertical: SIZES.spacing.md,
    borderRadius: SIZES.radius.md,
    alignItems: 'center',
    marginBottom: SIZES.spacing.md,
    ...SHADOWS.small,
  },
  outlineButton: {
    backgroundColor: 'transparent',
    paddingVertical: SIZES.spacing.md,
    paddingHorizontal: SIZES.spacing.lg,
    borderRadius: SIZES.radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: SIZES.spacing.sm,
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  outlineButtonText: {
    color: COLORS.primary,
    fontSize: SIZES.medium,
    fontWeight: '600',
  },
  
  // Card styles
  card: {
    backgroundColor: COLORS.cardDark,
    borderRadius: SIZES.radius.md,
    padding: SIZES.spacing.md,
    marginBottom: SIZES.spacing.md,
    ...SHADOWS.small,
  },
  
  // Form styles
  formGroup: {
    marginBottom: SIZES.spacing.md,
    width: '100%',
  },
  formLabel: {
    fontSize: SIZES.medium,
    color: COLORS.white,
    marginBottom: SIZES.spacing.xs,
  },
  
  // Transaction item styles
  transactionItem: {
    backgroundColor: COLORS.cardDark,
    padding: SIZES.spacing.md,
    marginBottom: SIZES.spacing.md,
    borderRadius: SIZES.radius.md,
    ...SHADOWS.small,
  },
  
  // Card item styles
  virtualCard: {
    backgroundColor: COLORS.primaryDark,
    padding: SIZES.spacing.lg,
    marginBottom: SIZES.spacing.md,
    borderRadius: SIZES.radius.md,
    ...SHADOWS.medium,
  },
  
  // Header styles
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SIZES.spacing.md,
    paddingVertical: SIZES.spacing.md,
    backgroundColor: COLORS.backgroundDark,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  headerText: {
    color: COLORS.white,
    fontSize: SIZES.large,
    fontWeight: 'bold',
    textAlign: 'center',
    flex: 1,
  },
  
  // Menu styles
  menuContainer: {
    flex: 1,
    backgroundColor: COLORS.overlay,
  },
  menuContent: {
    width: '80%',
    height: '100%',
    backgroundColor: COLORS.background,
    padding: SIZES.spacing.lg,
  },
  menuItem: {
    paddingVertical: SIZES.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  menuItemText: {
    fontSize: SIZES.large,
    color: COLORS.text,
  },
  logoutButton: {
    marginTop: SIZES.spacing.xl,
    paddingVertical: SIZES.spacing.md,
  },
  logoutText: {
    fontSize: SIZES.large,
    color: COLORS.danger,
    fontWeight: 'bold',
  },
  
  // Loading
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  // Balance display
  balanceText: {
    fontSize: 32,
    color: COLORS.white,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  
  // Dashboard grid
  dashboardGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: SIZES.spacing.lg,
  },
  dashboardButton: {
    width: 100,
    height: 100,
    borderRadius: SIZES.radius.md,
    margin: SIZES.spacing.sm,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    ...SHADOWS.medium,
  },
  
  // Bill payment styles
  billCategory: {
    backgroundColor: COLORS.cardDark,
    padding: SIZES.spacing.md,
    marginBottom: SIZES.spacing.md,
    borderRadius: SIZES.radius.md,
    ...SHADOWS.small,
  },
});
