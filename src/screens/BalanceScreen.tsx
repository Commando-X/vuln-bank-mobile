import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, RefreshControl, ScrollView } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import CustomButton from '../components/CustomButton';
import { ScreenType } from '../navigation/types';
import { useAuth } from '../contexts/AuthContext';
import { ENDPOINTS, get } from '../utils/api';
import globalStyles from '../styles/globalStyles';
import theme from '../styles/theme';

const { COLORS, SIZES, SHADOWS } = theme;

interface BalanceScreenProps {
  onNavigate: (screen: ScreenType) => void;
}

const BalanceScreen: React.FC<BalanceScreenProps> = ({ onNavigate }) => {
  const { user } = useAuth();
  const [balance, setBalance] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchBalance = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const response = await get(
        ENDPOINTS.checkBalance(user.accountNumber),
        user.token
      );
      
      if (response.ok && response.data) {
        setBalance(response.data.balance);
        setLastUpdated(new Date());
      } else {
        setError(response.data.message || 'Failed to fetch balance');
      }
    } catch (error) {
      console.error("Balance fetch error:", error);
      setError('Network error or server unavailable');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };
  
  const onRefresh = () => {
    setRefreshing(true);
    fetchBalance();
  };

  useEffect(() => {
    fetchBalance();
  }, [user]);

  return (
    <ScrollView 
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.primary]} />
      }
    >
      <View style={styles.balanceCard}>
        <Text style={styles.balanceLabel}>Available Balance</Text>
        
        {loading && !refreshing ? (
          <ActivityIndicator size="large" color={COLORS.primary} style={styles.loader} />
        ) : error ? (
          <View style={styles.errorContainer}>
            <Icon name="exclamation-circle" size={40} color={COLORS.danger} />
            <Text style={styles.errorText}>{error}</Text>
            <CustomButton 
              title="Try Again" 
              onPress={fetchBalance} 
              variant="outline" 
            />
          </View>
        ) : (
          <>
            <Text style={styles.balanceAmount}>
              ${balance?.toFixed(2) || '0.00'}
            </Text>
            {lastUpdated && (
              <Text style={styles.lastUpdated}>
                Last updated: {lastUpdated.toLocaleTimeString()}
              </Text>
            )}
          </>
        )}
      </View>
      
      <View style={styles.quickActionsContainer}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        
        <View style={styles.buttonsRow}>
          <CustomButton 
            title="Transfer Money" 
            iconName="exchange" 
            onPress={() => onNavigate('transfer')} 
          />
          <CustomButton 
            title="Transaction History" 
            iconName="history" 
            onPress={() => onNavigate('transactions')} 
          />
        </View>
        
        <View style={styles.buttonsRow}>
          <CustomButton 
            title="Request Loan" 
            iconName="dollar" 
            onPress={() => onNavigate('loans')} 
          />
          <CustomButton 
            title="Pay Bills" 
            iconName="file-text-o" 
            onPress={() => onNavigate('bills')} 
          />
        </View>
      </View>
      
      <View style={styles.accountDetailsCard}>
        <Text style={styles.sectionTitle}>Account Details</Text>
        
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Account Number:</Text>
          <Text style={styles.detailValue}>{user?.accountNumber}</Text>
        </View>
        
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Account Type:</Text>
          <Text style={styles.detailValue}>Checking</Text>
        </View>
        
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Account Status:</Text>
          <Text style={[styles.detailValue, styles.statusActive]}>Active</Text>
        </View>
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
  balanceCard: {
    backgroundColor: COLORS.primary,
    borderRadius: SIZES.radius.lg,
    padding: SIZES.spacing.xl,
    marginBottom: SIZES.spacing.lg,
    alignItems: 'center',
    ...SHADOWS.medium,
  },
  balanceLabel: {
    fontSize: SIZES.medium,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: SIZES.spacing.sm,
  },
  balanceAmount: {
    fontSize: 48,
    fontWeight: 'bold',
    color: COLORS.white,
    marginVertical: SIZES.spacing.md,
  },
  lastUpdated: {
    fontSize: SIZES.small,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  loader: {
    marginVertical: SIZES.spacing.lg,
  },
  errorContainer: {
    alignItems: 'center',
    padding: SIZES.spacing.md,
  },
  errorText: {
    color: COLORS.white,
    marginVertical: SIZES.spacing.md,
    textAlign: 'center',
    fontSize: SIZES.medium,
  },
  quickActionsContainer: {
    backgroundColor: COLORS.cardDark,
    borderRadius: SIZES.radius.md,
    padding: SIZES.spacing.lg,
    marginBottom: SIZES.spacing.lg,
    ...SHADOWS.small,
  },
  sectionTitle: {
    fontSize: SIZES.large,
    fontWeight: 'bold',
    color: COLORS.white,
    marginBottom: SIZES.spacing.md,
  },
  buttonsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SIZES.spacing.md,
  },
  accountDetailsCard: {
    backgroundColor: COLORS.cardDark,
    borderRadius: SIZES.radius.md,
    padding: SIZES.spacing.lg,
    marginBottom: SIZES.spacing.lg,
    ...SHADOWS.small,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: SIZES.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  detailLabel: {
    fontSize: SIZES.medium,
    color: COLORS.textLight,
  },
  detailValue: {
    fontSize: SIZES.medium,
    color: COLORS.white,
    fontWeight: '500',
  },
  statusActive: {
    color: COLORS.success,
  },
});

export default BalanceScreen;
