import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import CustomButton from '../components/CustomButton';
import { ScreenType } from '../navigation/types';
import { ENDPOINTS, post } from '../utils/api';
import globalStyles from '../styles/globalStyles';
import theme from '../styles/theme';

const { COLORS, SIZES, SHADOWS } = theme;

interface ResetPasswordScreenProps {
  onNavigate: (screen: ScreenType) => void;
}

const ResetPasswordScreen: React.FC<ResetPasswordScreenProps> = ({ onNavigate }) => {
  const [username, setUsername] = useState('');
  const [resetPin, setResetPin] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleResetPassword = async () => {
    if (!username || !resetPin || !newPassword) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setLoading(true);

    try {
      const response = await post(
        ENDPOINTS.resetPassword.reset,
        { 
          username,
          reset_pin: resetPin,
          new_password: newPassword
        }
      );

      if (response.ok) {
        Alert.alert(
          'Success',
          'Your password has been reset successfully!',
          [
            {
              text: 'Login',
              onPress: () => onNavigate('login')
            }
          ]
        );
      } else {
        Alert.alert('Error', response.data.message || 'Failed to reset password');
      }
    } catch (error) {
      console.error('Password reset error:', error);
      Alert.alert('Error', 'Network error or server unavailable');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Reset Password</Text>
      <Text style={styles.subtitle}>
        Enter the PIN received in your email to reset your password
      </Text>
      
      <View style={styles.form}>
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Username</Text>
          <TextInput
            style={globalStyles.input}
            placeholder="Enter your username"
            placeholderTextColor={COLORS.textLight}
            value={username}
            onChangeText={setUsername}
            autoCapitalize="none"
          />
        </View>
        
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Reset PIN</Text>
          <TextInput
            style={globalStyles.input}
            placeholder="Enter 3-digit PIN"
            placeholderTextColor={COLORS.textLight}
            value={resetPin}
            onChangeText={setResetPin}
            keyboardType="number-pad"
            maxLength={3}
          />
        </View>
        
        <View style={styles.inputContainer}>
          <Text style={styles.label}>New Password</Text>
          <TextInput
            style={globalStyles.input}
            placeholder="Enter new password"
            placeholderTextColor={COLORS.textLight}
            value={newPassword}
            onChangeText={setNewPassword}
            secureTextEntry
          />
        </View>
        
        {loading ? (
          <ActivityIndicator size="large" color={COLORS.primary} style={styles.loader} />
        ) : (
          <CustomButton
            title="Reset Password"
            onPress={handleResetPassword}
            isFullWidth
          />
        )}
      </View>
      
      <View style={styles.footer}>
        <Text style={styles.footerText}>
          Remember your password?{' '}
          <Text 
            style={styles.loginText}
            onPress={() => onNavigate('login')}
          >
            Sign In
          </Text>
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SIZES.spacing.lg,
    width: '100%',
    backgroundColor: COLORS.backgroundDark,
  },
  title: {
    fontSize: SIZES.xxLarge,
    fontWeight: 'bold',
    color: COLORS.white,
    marginBottom: SIZES.spacing.xs,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: SIZES.medium,
    color: COLORS.textLight,
    marginBottom: SIZES.spacing.xl,
    textAlign: 'center',
  },
  form: {
    width: '100%',
    marginBottom: SIZES.spacing.xl,
  },
  inputContainer: {
    marginBottom: SIZES.spacing.md,
  },
  label: {
    fontSize: SIZES.medium,
    color: COLORS.white,
    marginBottom: SIZES.spacing.xs,
  },
  loader: {
    marginVertical: SIZES.spacing.md,
  },
  footer: {
    marginTop: SIZES.spacing.xl,
  },
  footerText: {
    fontSize: SIZES.medium,
    color: COLORS.textLight,
    textAlign: 'center',
  },
  loginText: {
    color: COLORS.primary,
    fontWeight: 'bold',
  },
});

export default ResetPasswordScreen;
