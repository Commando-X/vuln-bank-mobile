import React from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import { ScreenType } from '../navigation/types';
import { useAuth } from '../contexts/AuthContext';
import CustomButton from '../components/CustomButton';
import globalStyles from '../styles/globalStyles';
import theme from '../styles/theme';

const { COLORS, SIZES, SHADOWS } = theme;

// Dashboard menu item configuration
const dashboardMenuItems = [
  { 
    title: 'Check Balance', 
    icon: 'money', 
    screen: 'balance', 
    color: COLORS.primary,
    description: 'View your current account balance'
  },
  { 
    title: 'Money Transfer', 
    icon: 'exchange', 
    screen: 'transfer', 
    color: COLORS.secondary,
    description: 'Send money to other accounts'
  },
  { 
    title: 'Transaction History', 
    icon: 'history', 
    screen: 'transactions', 
    color: COLORS.info,
    description: 'View your recent transactions'
  },
  { 
    title: 'Loans', 
    icon: 'dollar', 
    screen: 'loans', 
    color: COLORS.warning,
    description: 'Apply for a new loan'
  },
  { 
    title: 'Virtual Cards', 
    icon: 'credit-card', 
    screen: 'cards', 
    color: COLORS.primary,
    description: 'Manage your virtual payment cards'
  },
  { 
    title: 'Bill Payments', 
    icon: 'file-text-o', 
    screen: 'bills', 
    color: COLORS.danger,
    description: 'Pay your bills online'
  },
];

// Admin-only menu item
const adminMenuItem = { 
  title: 'Admin Panel', 
  icon: 'lock', 
  screen: 'admin', 
  color: '#9C27B0',
  description: 'Access administrative functions'
};

interface DashboardScreenProps {
  onNavigate: (screen: ScreenType) => void;
}

const DashboardScreen: React.FC<DashboardScreenProps> = ({ onNavigate }) => {
  const { user } = useAuth();
  const isAdmin = user?.isAdmin || false;
  
  // Add admin option if user is admin
  const menuItems = isAdmin 
    ? [...dashboardMenuItems, adminMenuItem] 
    : dashboardMenuItems;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      {/* Welcome Section */}
      <View style={styles.welcomeSection}>
        <View style={styles.welcomeContent}>
          <Text style={styles.welcomeTitle}>
            Welcome back, {user?.username || 'User'}
          </Text>
          <Text style={styles.accountNumber}>
            Account: {user?.accountNumber || 'Not available'}
          </Text>
        </View>
      </View>

      {/* Quick Actions Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.menuGrid}>
          {menuItems.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={[styles.menuItem, { backgroundColor: item.color }]}
              onPress={() => onNavigate(item.screen as ScreenType)}
            >
              <Icon name={item.icon} size={SIZES.xxLarge} color={COLORS.white} />
              <Text style={styles.menuItemTitle}>{item.title}</Text>
              <Text style={styles.menuItemDescription} numberOfLines={2}>
                {item.description}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
      
      {/* Profile Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Your Profile</Text>
        <TouchableOpacity
          style={styles.profileButton}
          onPress={() => onNavigate('profile')}
        >
          <Icon name="user-circle" size={SIZES.xxLarge} color={COLORS.primary} />
          <View style={styles.profileTextContainer}>
            <Text style={styles.profileButtonTitle}>View Profile</Text>
            <Text style={styles.profileButtonSubtitle}>
              Update personal information and settings
            </Text>
          </View>
          <Icon name="chevron-right" size={SIZES.large} color={COLORS.primary} />
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.backgroundDark,
  },
  contentContainer: {
    padding: SIZES.spacing.md,
  },
  welcomeSection: {
    backgroundColor: COLORS.primary,
    borderRadius: SIZES.radius.lg,
    padding: SIZES.spacing.lg,
    marginBottom: SIZES.spacing.lg,
    ...SHADOWS.medium,
  },
  welcomeContent: {
    flexDirection: 'column',
  },
  welcomeTitle: {
    fontSize: SIZES.large,
    fontWeight: 'bold',
    color: COLORS.white,
    marginBottom: SIZES.spacing.xs,
  },
  accountNumber: {
    fontSize: SIZES.medium,
    color: COLORS.white,
    opacity: 0.8,
  },
  section: {
    marginBottom: SIZES.spacing.xl,
  },
  sectionTitle: {
    fontSize: SIZES.large,
    fontWeight: 'bold',
    color: COLORS.white,
    marginBottom: SIZES.spacing.md,
  },
  menuGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  menuItem: {
    width: '48%',
    aspectRatio: 1,
    borderRadius: SIZES.radius.md,
    padding: SIZES.spacing.md,
    marginBottom: SIZES.spacing.md,
    justifyContent: 'center',
    alignItems: 'center',
    ...SHADOWS.medium,
  },
  menuItemTitle: {
    fontSize: SIZES.medium,
    fontWeight: 'bold',
    color: COLORS.white,
    marginTop: SIZES.spacing.sm,
    marginBottom: SIZES.spacing.xs,
    textAlign: 'center',
  },
  menuItemDescription: {
    fontSize: SIZES.small,
    color: COLORS.white,
    opacity: 0.8,
    textAlign: 'center',
  },
  profileButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.cardDark,
    borderRadius: SIZES.radius.md,
    padding: SIZES.spacing.md,
    ...SHADOWS.small,
  },
  profileTextContainer: {
    flex: 1,
    marginLeft: SIZES.spacing.md,
  },
  profileButtonTitle: {
    fontSize: SIZES.medium,
    fontWeight: 'bold',
    color: COLORS.white,
  },
  profileButtonSubtitle: {
    fontSize: SIZES.small,
    color: COLORS.textLight,
  },
});

export default DashboardScreen;
