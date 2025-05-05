import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ActivityIndicator, ScrollView, Switch } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import CustomButton from '../components/CustomButton';
import { ScreenType } from '../navigation/types';
import { useAuth } from '../contexts/AuthContext';
import globalStyles from '../styles/globalStyles';
import theme from '../styles/theme';

const { COLORS, SIZES, SHADOWS } = theme;

interface ProfileScreenProps {
  onNavigate: (screen: ScreenType) => void;
}

const ProfileScreen: React.FC<ProfileScreenProps> = ({ onNavigate }) => {
  const { user, logout } = useAuth();
  const [loading, setLoading] = useState(false);
  
  // Settings toggles
  const [pushNotifications, setPushNotifications] = useState(true);
  const [biometricLogin, setBiometricLogin] = useState(false);
  const [darkMode, setDarkMode] = useState(true);
  const [transactionAlerts, setTransactionAlerts] = useState(true);
  
  const handleLogout = async () => {
    Alert.alert(
      'Logout Confirmation',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            setLoading(true);
            try {
              await logout();
              onNavigate('login');
            } catch (error) {
              Alert.alert('Error', 'Failed to logout. Try again.');
            } finally {
              setLoading(false);
            }
          },
        }
      ]
    );
  };

  return (
    <ScrollView 
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
    >
      {/* Profile Header */}
      <View style={styles.profileHeader}>
        <View style={styles.avatarContainer}>
          <Text style={styles.avatarText}>
            {user?.username.charAt(0).toUpperCase() || 'U'}
          </Text>
        </View>
        <Text style={styles.username}>{user?.username || 'User'}</Text>
        <Text style={styles.accountNumber}>Account: {user?.accountNumber || 'N/A'}</Text>
      </View>
      
      {/* Account Details */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Account Details</Text>
        
        <View style={styles.detailRow}>
          <View style={styles.detailIconContainer}>
            <Icon name="user" size={18} color={COLORS.primary} />
          </View>
          <View style={styles.detailContent}>
            <Text style={styles.detailLabel}>Username</Text>
            <Text style={styles.detailValue}>{user?.username || 'N/A'}</Text>
          </View>
        </View>
        
        <View style={styles.detailRow}>
          <View style={styles.detailIconContainer}>
            <Icon name="credit-card" size={18} color={COLORS.primary} />
          </View>
          <View style={styles.detailContent}>
            <Text style={styles.detailLabel}>Account Number</Text>
            <Text style={styles.detailValue}>{user?.accountNumber || 'N/A'}</Text>
          </View>
        </View>
        
        <View style={styles.detailRow}>
          <View style={styles.detailIconContainer}>
            <Icon name="check-circle" size={18} color={COLORS.success} />
          </View>
          <View style={styles.detailContent}>
            <Text style={styles.detailLabel}>Account Status</Text>
            <Text style={[styles.detailValue, styles.statusText]}>Active</Text>
          </View>
        </View>
        
        <View style={styles.detailRow}>
          <View style={styles.detailIconContainer}>
            <Icon name={user?.isAdmin ? "lock" : "user"} size={18} color={user?.isAdmin ? COLORS.warning : COLORS.primary} />
          </View>
          <View style={styles.detailContent}>
            <Text style={styles.detailLabel}>Account Type</Text>
            <Text style={styles.detailValue}>{user?.isAdmin ? 'Administrator' : 'Regular User'}</Text>
          </View>
        </View>
      </View>
      
      {/* Settings */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Settings</Text>
        
        <View style={styles.settingRow}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingTitle}>Push Notifications</Text>
            <Text style={styles.settingDescription}>Receive account notifications</Text>
          </View>
          <Switch 
            value={pushNotifications} 
            onValueChange={setPushNotifications}
            trackColor={{ false: '#767577', true: COLORS.primary }}
            thumbColor={pushNotifications ? '#f4f3f4' : '#f4f3f4'}
          />
        </View>
        
        <View style={styles.settingRow}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingTitle}>Biometric Login</Text>
            <Text style={styles.settingDescription}>Login with face or fingerprint</Text>
          </View>
          <Switch 
            value={biometricLogin} 
            onValueChange={setBiometricLogin}
            trackColor={{ false: '#767577', true: COLORS.primary }}
            thumbColor={biometricLogin ? '#f4f3f4' : '#f4f3f4'}
          />
        </View>
        
        <View style={styles.settingRow}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingTitle}>Dark Mode</Text>
            <Text style={styles.settingDescription}>Toggle dark mode appearance</Text>
          </View>
          <Switch 
            value={darkMode} 
            onValueChange={setDarkMode}
            trackColor={{ false: '#767577', true: COLORS.primary }}
            thumbColor={darkMode ? '#f4f3f4' : '#f4f3f4'}
          />
        </View>
        
        <View style={styles.settingRow}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingTitle}>Transaction Alerts</Text>
            <Text style={styles.settingDescription}>Get alerted for all transactions</Text>
          </View>
          <Switch 
            value={transactionAlerts} 
            onValueChange={setTransactionAlerts}
            trackColor={{ false: '#767577', true: COLORS.primary }}
            thumbColor={transactionAlerts ? '#f4f3f4' : '#f4f3f4'}
          />
        </View>
      </View>
      
      {/* Account Actions */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Account Actions</Text>
        
        <TouchableOpacity style={styles.actionItem}>
          <View style={styles.actionIcon}>
            <Icon name="lock" size={20} color={COLORS.primary} />
          </View>
          <Text style={styles.actionText}>Change Password</Text>
          <Icon name="chevron-right" size={16} color={COLORS.textLight} />
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.actionItem}>
          <View style={styles.actionIcon}>
            <Icon name="cog" size={20} color={COLORS.primary} />
          </View>
          <Text style={styles.actionText}>Account Settings</Text>
          <Icon name="chevron-right" size={16} color={COLORS.textLight} />
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.actionItem}>
          <View style={styles.actionIcon}>
            <Icon name="question-circle" size={20} color={COLORS.primary} />
          </View>
          <Text style={styles.actionText}>Help & Support</Text>
          <Icon name="chevron-right" size={16} color={COLORS.textLight} />
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.actionItem}>
          <View style={styles.actionIcon}>
            <Icon name="shield" size={20} color={COLORS.primary} />
          </View>
          <Text style={styles.actionText}>Privacy & Security</Text>
          <Icon name="chevron-right" size={16} color={COLORS.textLight} />
        </TouchableOpacity>
      </View>
      
      {/* Logout Button */}
      {loading ? (
        <ActivityIndicator size="large" color={COLORS.primary} style={styles.loader} />
      ) : (
        <CustomButton 
          title="Logout" 
          onPress={handleLogout} 
          isFullWidth
          variant="danger"
        />
      )}
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
  profileHeader: {
    alignItems: 'center',
    marginBottom: SIZES.spacing.xl,
  },
  avatarContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SIZES.spacing.md,
    ...SHADOWS.medium,
  },
  avatarText: {
    fontSize: 40,
    fontWeight: 'bold',
    color: COLORS.white,
  },
  username: {
    fontSize: SIZES.large,
    fontWeight: 'bold',
    color: COLORS.white,
    marginBottom: SIZES.spacing.xs,
  },
  accountNumber: {
    fontSize: SIZES.medium,
    color: COLORS.textLight,
  },
  card: {
    backgroundColor: COLORS.cardDark,
    borderRadius: SIZES.radius.md,
    padding: SIZES.spacing.lg,
    marginBottom: SIZES.spacing.lg,
    ...SHADOWS.small,
  },
  cardTitle: {
    fontSize: SIZES.large,
    fontWeight: 'bold',
    color: COLORS.white,
    marginBottom: SIZES.spacing.md,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SIZES.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  detailIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0, 123, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SIZES.spacing.md,
  },
  detailContent: {
    flex: 1,
  },
  detailLabel: {
    fontSize: SIZES.small,
    color: COLORS.textLight,
    marginBottom: 2,
  },
  detailValue: {
    fontSize: SIZES.medium,
    color: COLORS.white,
  },
  statusText: {
    color: COLORS.success,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SIZES.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  settingInfo: {
    flex: 1,
  },
  settingTitle: {
    fontSize: SIZES.medium,
    fontWeight: '500',
    color: COLORS.white,
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: SIZES.small,
    color: COLORS.textLight,
  },
  actionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SIZES.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  actionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 123, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SIZES.spacing.md,
  },
  actionText: {
    flex: 1,
    fontSize: SIZES.medium,
    color: COLORS.white,
  },
  loader: {
    marginVertical: SIZES.spacing.md,
  },
});

export default ProfileScreen;
