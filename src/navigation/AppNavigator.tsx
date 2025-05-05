import React, { useState } from 'react';
import { SafeAreaView, View } from 'react-native';
import { ScreenType, ScreenParams } from './types';
import { useAuth } from '../contexts/AuthContext';
import globalStyles from '../styles/globalStyles';
import Header from '../components/Header';
import MenuModal from '../components/MenuModal';

// Import all screens
import WelcomeScreen from '../screens/WelcomeScreen';
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import ForgotPasswordScreen from '../screens/ForgotPasswordScreen';
import ResetPasswordScreen from '../screens/ResetPasswordScreen';
import DashboardScreen from '../screens/DashboardScreen';
import BalanceScreen from '../screens/BalanceScreen';
import TransferScreen from '../screens/TransferScreen';
import ProfileScreen from '../screens/ProfileScreen';
import TransactionsScreen from '../screens/TransactionsScreen';
import LoansScreen from '../screens/LoansScreen';
import CardsScreen from '../screens/CardsScreen';
import BillsScreen from '../screens/BillsScreen';
import AdminScreen from '../screens/AdminScreen';
import CardDetailsScreen from '../screens/CardDetailsScreen';
import CardTransactionsScreen from '../screens/CardTransactionsScreen';
import CreateCardScreen from '../screens/CreateCardScreen';

interface Props {
  initialScreen?: ScreenType;
}

const AppNavigator: React.FC<Props> = ({ initialScreen = 'welcome' }) => {
  const { user, isAuthenticated, logout } = useAuth();
  const [currentScreen, setCurrentScreen] = useState<ScreenType>(
    isAuthenticated ? 'dashboard' : initialScreen
  );
  const [screenParams, setScreenParams] = useState<ScreenParams>({});
  const [menuVisible, setMenuVisible] = useState(false);

  // Navigate to a new screen with optional parameters
  const navigate = (screen: ScreenType, params: ScreenParams = {}) => {
    setCurrentScreen(screen);
    setScreenParams(params);
    setMenuVisible(false); // Close menu if open
  };
  
  // Go back to dashboard
  const goBack = () => {
    // If on a main screen, go to dashboard
    if (!['welcome', 'login', 'register', 'forgotPassword', 'resetPassword', 'dashboard'].includes(currentScreen)) {
      setCurrentScreen('dashboard');
    }
  };

  // Handle menu press
  const handleMenuItemPress = (screen: string) => {
    navigate(screen as ScreenType);
  };

  // Handle logout
  const handleLogout = async () => {
    await logout();
    navigate('login');
    setMenuVisible(false);
  };

  // Render current screen based on authentication state
  const renderScreen = () => {
    // If not authenticated, only show auth screens
    if (!isAuthenticated && !['welcome', 'login', 'register', 'forgotPassword', 'resetPassword'].includes(currentScreen)) {
      return <WelcomeScreen onNavigate={navigate} />;
    }

    // Otherwise, render the appropriate screen
    switch (currentScreen) {
      // Auth screens
      case 'welcome':
        return <WelcomeScreen onNavigate={navigate} />;
      case 'login':
        return <LoginScreen onNavigate={navigate} />;
      case 'register':
        return <RegisterScreen onNavigate={navigate} />;
      case 'forgotPassword':
        return <ForgotPasswordScreen onNavigate={navigate} />;
      case 'resetPassword':
        return <ResetPasswordScreen onNavigate={navigate} />;
      
      // Main app screens
      case 'dashboard':
        return <DashboardScreen onNavigate={navigate} />;
      case 'balance':
        return <BalanceScreen onNavigate={navigate} />;
      case 'transfer':
        return <TransferScreen onNavigate={navigate} params={screenParams.transfer} />;
      case 'profile':
        return <ProfileScreen onNavigate={navigate} />;
      case 'transactions':
        return <TransactionsScreen onNavigate={navigate} params={screenParams.transactions} />;
      case 'loans':
        return <LoansScreen onNavigate={navigate} />;
      case 'cards':
        return <CardsScreen onNavigate={navigate} />;
      case 'bills':
        return <BillsScreen onNavigate={navigate} />;
      case 'admin':
        return user?.isAdmin ? <AdminScreen onNavigate={navigate} /> : <DashboardScreen onNavigate={navigate} />;
      
      // Card-related screens
      case 'cardDetails':
        return <CardDetailsScreen onNavigate={navigate} params={screenParams.cardDetails} />;
      case 'cardTransactions':
        return <CardTransactionsScreen onNavigate={navigate} params={screenParams.cardTransactions} />;
      case 'createCard':
        return <CreateCardScreen onNavigate={navigate} />;
      
      // Fallback
      default:
        return <DashboardScreen onNavigate={navigate} />;
    }
  };

  const isAuthenticatedScreen = isAuthenticated && 
    !['welcome', 'login', 'register', 'forgotPassword', 'resetPassword'].includes(currentScreen);

  return (
    <SafeAreaView style={globalStyles.safeAreaView}>
      {isAuthenticatedScreen && (
        <Header 
          title={currentScreen.charAt(0).toUpperCase() + currentScreen.slice(1)} 
          onBackPress={goBack} 
          onMenuPress={() => setMenuVisible(true)} 
        />
      )}
      
      <View style={isAuthenticatedScreen ? globalStyles.contentContainer : globalStyles.centeredContainer}>
        {renderScreen()}
      </View>
      
      {isAuthenticatedScreen && (
        <MenuModal
          visible={menuVisible}
          onClose={() => setMenuVisible(false)}
          onMenuItemPress={handleMenuItemPress}
          isAdmin={user?.isAdmin || false}
          onLogout={handleLogout}
        />
      )}
    </SafeAreaView>
  );
};

export default AppNavigator;
