import React from 'react';
import { SafeAreaView, StatusBar } from 'react-native';
import { AuthProvider } from './src/contexts/AuthContext';
import AppNavigator from './src/navigation/AppNavigator';
import theme from './src/styles/theme';

/**
 * Vulnerable Bank Mobile App
 * 
 * This app is intentionally built with security vulnerabilities for educational purposes.
 * It demonstrates common security issues in mobile banking applications.
 */
const App = () => {
  return (
    <AuthProvider>
      <StatusBar 
        barStyle="light-content" 
        backgroundColor={theme.COLORS.backgroundDark} 
      />
      <AppNavigator />
    </AuthProvider>
  );
};

export default App;
