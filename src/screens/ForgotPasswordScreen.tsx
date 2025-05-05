import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import CustomButton from '../components/CustomButton';
import { ScreenType } from '../navigation/types';
import { ENDPOINTS, post } from '../utils/api';
import globalStyles from '../styles/globalStyles';
import theme from '../styles/theme';

const { COLORS, SIZES, SHADOWS } = theme;

interface ForgotPasswordScreenProps {
  onNavigate: (screen: ScreenType) => void;
}

const ForgotPasswordScreen: React.FC<ForgotPasswordScreenProps> = ({ onNavigate }) => {
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async () => {
    if (!username) {
      Alert.alert('Error', 'Please enter your username');
      return;
    }

    setLoading(true);

    try {
      const response = await post(
        ENDPOINTS.resetPassword.request,
        { username }
      );

      if (response.ok) {
        setSuccess(true);
        Alert.alert(
          'Success',
          'Reset PIN has been sent to your registered email address.',
          [
            {
              text: 'OK',
              onPress: () => onNavigate('resetPassword')
            }
          ]
        );
      } else {
        Alert.alert('Error', response.data.message || 'Failed to process request');
      }
    } catch (error) {
      console.error('Forgot password error:', error);
      Alert.alert('Error', 'Network error or server unavailable');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Forgot Password</Text>
      <Text style={styles.subtitle}>
        Enter your username to receive a reset PIN
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
            editable={!loading && !success}
          />
        </View>
        
        {loading ? (
          <ActivityIndicator size="large" color={COLORS.primary} style={styles.loader} />
        ) : (
          <CustomButton
            title="Request Reset PIN"
            onPress={handleSubmit}
            isFullWidth
            variant={success ? "success" : "primary"}
          />
        )}
      </View>
      
      <View style={styles.footer}>
        <Text style={styles.footerText}>
          Remembered your password?{' '}
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

export default ForgotPasswordScreen;
