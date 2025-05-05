import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import CustomButton from '../components/CustomButton';
import { ScreenType } from '../navigation/types';
import { useAuth } from '../contexts/AuthContext';
import globalStyles from '../styles/globalStyles';
import theme from '../styles/theme';

const { COLORS, SIZES } = theme;

interface LoginScreenProps {
  onNavigate: (screen: ScreenType) => void;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ onNavigate }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  const handleLogin = async () => {
    if (!username || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setLoading(true);
    
    try {
      const success = await login(username, password);
      
      if (success) {
        onNavigate('dashboard');
      } else {
        Alert.alert('Login Failed', 'Invalid username or password');
      }
    } catch (error) {
      Alert.alert('Error', 'An unexpected error occurred');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome Back</Text>
      <Text style={styles.subtitle}>Sign in to your account</Text>
      
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
          <Text style={styles.label}>Password</Text>
          <TextInput
            style={globalStyles.input}
            placeholder="Enter your password"
            placeholderTextColor={COLORS.textLight}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            autoCapitalize="none"
          />
        </View>
        
        <Text 
          style={styles.forgotPassword}
          onPress={() => onNavigate('forgotPassword')}
        >
          Forgot Password?
        </Text>
        
        {loading ? (
          <ActivityIndicator size="large" color={COLORS.primary} style={styles.loader} />
        ) : (
          <CustomButton
            title="Login"
            onPress={handleLogin}
            isFullWidth
          />
        )}
      </View>
      
      <View style={styles.footer}>
        <Text style={styles.footerText}>
          Don't have an account?{' '}
          <Text 
            style={styles.signupText}
            onPress={() => onNavigate('register')}
          >
            Sign Up
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
  forgotPassword: {
    fontSize: SIZES.medium,
    color: COLORS.primary,
    textAlign: 'right',
    marginBottom: SIZES.spacing.lg,
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
  signupText: {
    color: COLORS.primary,
    fontWeight: 'bold',
  },
});

export default LoginScreen;
