import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import CustomButton from '../components/CustomButton';
import { ScreenType } from '../navigation/types';
import globalStyles from '../styles/globalStyles';
import theme from '../styles/theme';

const { COLORS, SIZES } = theme;

interface WelcomeScreenProps {
  onNavigate: (screen: ScreenType) => void;
}

const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onNavigate }) => {
  return (
    <View style={styles.container}>
      <View style={styles.logoContainer}>
        <Text style={styles.logoText}>🏦</Text>
        <Text style={styles.appName}>Vulnerable Bank</Text>
      </View>
      
      <Text style={styles.tagline}>
        Banking Made Simple & InSecure
      </Text>
      
      <Text style={styles.description}>
      This is an Intentionally vulnerable application, designed for everyone to practice application security.
      </Text>
      
      <View style={styles.buttonContainer}>
        
        <CustomButton 
          title="  Login  " 
          onPress={() => onNavigate('login')} 
          isFullWidth 
        />
        {/* <View style={{ height: 2 }} /> */}
        <CustomButton 
          title="Register" 
          onPress={() => onNavigate('register')} 
          isFullWidth 
          // variant="outline"
        />
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
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: SIZES.spacing.xxl,
  },
  logoText: {
    fontSize: 80,
    marginBottom: SIZES.spacing.md,
  },
  appName: {
    fontSize: SIZES.xxLarge,
    fontWeight: 'bold',
    color: COLORS.white,
    marginBottom: SIZES.spacing.md,
  },
  tagline: {
    fontSize: SIZES.large,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: SIZES.spacing.md,
    textAlign: 'center',
  },
  description: {
    fontSize: SIZES.medium,
    color: COLORS.textLight,
    textAlign: 'center',
    marginBottom: SIZES.spacing.xl,
  },
  buttonContainer: {
    width: '100%',
    marginTop: SIZES.spacing.lg,
  },
});

export default WelcomeScreen;
