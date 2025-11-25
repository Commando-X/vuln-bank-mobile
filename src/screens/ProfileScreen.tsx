import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ActivityIndicator, ScrollView, Switch, TextInput } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import CustomButton from '../components/CustomButton';
import { ScreenType } from '../navigation/types';
import { useAuth } from '../contexts/AuthContext';
import { ENDPOINTS, get, post } from '../utils/api';
import globalStyles from '../styles/globalStyles';
import theme from '../styles/theme';

const { COLORS, SIZES, SHADOWS } = theme;

interface ProfileScreenProps {
  onNavigate: (screen: ScreenType) => void;
}

const ProfileScreen: React.FC<ProfileScreenProps> = ({ onNavigate }) => {
  const { user, logout } = useAuth();
  const [loading, setLoading] = useState(false);
  const [imageUrl, setImageUrl] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadMessage, setUploadMessage] = useState<string | null>(null);
  const [ssrfTarget, setSsrfTarget] = useState(ENDPOINTS.ssrf.internalSecret);
  const [ssrfResponse, setSsrfResponse] = useState<string | null>(null);
  const [ssrfLoading, setSsrfLoading] = useState(false);
  
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

  const handleUploadByUrl = async () => {
    if (!imageUrl) {
      Alert.alert('Error', 'Please provide an image URL');
      return;
    }

    setUploading(true);
    setUploadMessage(null);

    try {
      const response = await post(
        ENDPOINTS.profile.uploadByUrl,
        { image_url: imageUrl },
        user?.token
      );

      if (response.ok) {
        setUploadMessage(response.data.message || 'Profile picture uploaded via URL');
        Alert.alert('Success', 'Profile image fetched and saved');
      } else {
        const msg = response.data.message || 'Upload failed';
        setUploadMessage(msg);
        Alert.alert('Error', msg);
      }
    } catch (error) {
      setUploadMessage('Network error or server unavailable');
      Alert.alert('Error', 'Network error or server unavailable');
    } finally {
      setUploading(false);
    }
  };

  const handleFetchSsrf = async () => {
    if (!ssrfTarget) {
      Alert.alert('Error', 'Please provide a target path');
      return;
    }

    setSsrfLoading(true);
    setSsrfResponse(null);

    try {
      const endpoint = ssrfTarget.startsWith('/') ? ssrfTarget : `/${ssrfTarget}`;
      const response = await get(endpoint, user?.token);
      const formatted =
        typeof response.data === 'string'
          ? response.data
          : JSON.stringify(response.data, null, 2);
      setSsrfResponse(formatted);

      if (!response.ok) {
        Alert.alert('Request Error', response.data?.message || 'Request failed');
      }
    } catch (error) {
      setSsrfResponse('Network error or server unavailable');
      Alert.alert('Error', 'Network error or server unavailable');
    } finally {
      setSsrfLoading(false);
    }
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

      {/* Profile Picture Upload */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Profile Picture</Text>
        <Text style={styles.helperText}>
          Upload by URL (vulnerable fetch on the server). Great for testing SSRF.
        </Text>
        <View style={styles.formGroup}>
          <Text style={styles.label}>Image URL</Text>
          <TextInput
            style={globalStyles.input}
            placeholder="http://127.0.0.1:8080/image.png"
            placeholderTextColor={COLORS.textLight}
            value={imageUrl}
            onChangeText={setImageUrl}
            autoCapitalize="none"
          />
        </View>
        {uploading ? (
          <ActivityIndicator size="large" color={COLORS.primary} style={styles.loader} />
        ) : (
          <CustomButton
            title="Fetch & Upload"
            onPress={handleUploadByUrl}
            isFullWidth
            iconName="upload"
          />
        )}
        {uploadMessage && (
          <Text style={styles.statusMessage}>{uploadMessage}</Text>
        )}
      </View>

      {/* SSRF Playground */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>SSRF Playground</Text>
        <Text style={styles.helperText}>
          Trigger server-side requests against internal endpoints.
        </Text>

        <View style={styles.quickTargets}>
          <TouchableOpacity
            style={styles.targetChip}
            onPress={() => setSsrfTarget(ENDPOINTS.ssrf.internalSecret)}
          >
            <Text style={styles.chipText}>/internal/secret</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.targetChip}
            onPress={() => setSsrfTarget(ENDPOINTS.ssrf.internalConfig)}
          >
            <Text style={styles.chipText}>/internal/config.json</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.targetChip}
            onPress={() => setSsrfTarget(ENDPOINTS.ssrf.metadataRoot)}
          >
            <Text style={styles.chipText}>/latest/meta-data/</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.targetChip}
            onPress={() => setSsrfTarget(ENDPOINTS.ssrf.metadataRole)}
          >
            <Text style={styles.chipText}>/latest/.../vulnbank-role</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Target Path</Text>
          <TextInput
            style={globalStyles.input}
            placeholder="/internal/secret"
            placeholderTextColor={COLORS.textLight}
            value={ssrfTarget}
            onChangeText={setSsrfTarget}
            autoCapitalize="none"
          />
        </View>

        {ssrfLoading ? (
          <ActivityIndicator size="large" color={COLORS.primary} style={styles.loader} />
        ) : (
          <CustomButton
            title="Fetch Target"
            onPress={handleFetchSsrf}
            isFullWidth
            iconName="bug"
          />
        )}

        {ssrfResponse && (
          <View style={styles.responseBox}>
            <Text style={styles.responseText}>{ssrfResponse}</Text>
          </View>
        )}
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
  helperText: {
    fontSize: SIZES.small,
    color: COLORS.textLight,
    marginBottom: SIZES.spacing.sm,
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
  formGroup: {
    marginBottom: SIZES.spacing.md,
  },
  statusMessage: {
    fontSize: SIZES.small,
    color: COLORS.textLight,
    marginTop: SIZES.spacing.sm,
  },
  quickTargets: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: SIZES.spacing.md,
  },
  targetChip: {
    backgroundColor: COLORS.cardDark,
    paddingVertical: SIZES.spacing.xs,
    paddingHorizontal: SIZES.spacing.sm,
    borderRadius: SIZES.radius.sm,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    marginRight: SIZES.spacing.sm,
    marginBottom: SIZES.spacing.sm,
  },
  chipText: {
    color: COLORS.white,
    fontSize: SIZES.small,
  },
  responseBox: {
    marginTop: SIZES.spacing.md,
    backgroundColor: COLORS.backgroundDark,
    borderRadius: SIZES.radius.md,
    padding: SIZES.spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  responseText: {
    color: COLORS.textLight,
    fontSize: SIZES.small,
  },
});

export default ProfileScreen;
