import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, ScrollView, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import { ScreenType } from '../navigation/types';
import { useAuth } from '../contexts/AuthContext';
import { ENDPOINTS, post, get } from '../utils/api';
import CustomButton from '../components/CustomButton';
import globalStyles from '../styles/globalStyles';
import theme from '../styles/theme';

const { COLORS, SIZES, SHADOWS } = theme;

interface LoansScreenProps {
  onNavigate: (screen: ScreenType) => void;
}

interface Loan {
  id: number;
  amount: number;
  status: string;
  created_at: string;
}

const LoansScreen: React.FC<LoansScreenProps> = ({ onNavigate }) => {
  const { user } = useAuth();
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingLoans, setLoadingLoans] = useState(true);
  const [loans, setLoans] = useState<Loan[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Placeholder API endpoint for getting user loans
  const fetchLoans = async () => {
    if (!user) return;
    
    setLoadingLoans(true);
    setError(null);
    
    try {
      // Using a placeholder endpoint for now
      // This would be replaced with the actual endpoint once implemented
      // Using transactions endpoint for now just to show some data
      const response = await get(
        ENDPOINTS.transactions(user.accountNumber),
        user.token
      );
      
      if (response.ok) {
        // Mock loans data based on transactions
        // This would be replaced with actual loans data
        const mockLoans: Loan[] = [
          {
            id: 1,
            amount: 5000,
            status: 'approved',
            created_at: new Date(Date.now() - 3600000 * 24 * 30).toISOString(),
          },
          {
            id: 2,
            amount: 10000,
            status: 'pending',
            created_at: new Date(Date.now() - 3600000 * 24 * 7).toISOString(),
          }
        ];
        setLoans(mockLoans);
      } else {
        setError('Failed to fetch loans');
      }
    } catch (error) {
      console.error("Error fetching loans:", error);
      setError('Network error or server unavailable');
    } finally {
      setLoadingLoans(false);
    }
  };

  useEffect(() => {
    fetchLoans();
  }, [user]);

  const handleRequestLoan = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      Alert.alert('Error', 'Please enter a valid loan amount');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await post(
        ENDPOINTS.requestLoan,
        { amount: parseFloat(amount) },
        user?.token
      );

      if (response.ok) {
        Alert.alert(
          'Success',
          'Loan request submitted successfully. Our staff will review your application.',
          [{ text: 'OK' }]
        );
        setAmount('');
        
        // Add a mock loan to the UI immediately
        const newLoan: Loan = {
          id: Date.now(), // Use timestamp as a temporary ID
          amount: parseFloat(amount),
          status: 'pending',
          created_at: new Date().toISOString(),
        };
        
        setLoans([newLoan, ...loans]);
      } else {
        Alert.alert('Error', response.data.message || 'Failed to request loan');
      }
    } catch (error) {
      console.error("Loan request error:", error);
      Alert.alert('Error', 'Network error or server unavailable');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'approved':
        return COLORS.success;
      case 'pending':
        return COLORS.warning;
      case 'rejected':
        return COLORS.danger;
      default:
        return COLORS.textLight;
    }
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
    >
      <View style={styles.headerContainer}>
        <Text style={styles.headerTitle}>Loan Services</Text>
        <Text style={styles.headerSubtitle}>Apply for a loan or check your loan status</Text>
      </View>

      {/* Apply for loan section */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Icon name="money" size={24} color={COLORS.primary} />
          <Text style={styles.cardTitle}>Apply for a New Loan</Text>
        </View>
        
        <Text style={styles.cardDescription}>
          Request a loan for your personal or business needs. 
          Competitive interest rates starting at just 5.9% APR.
        </Text>
        
        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Loan Amount ($)</Text>
          <View style={styles.amountContainer}>
            <Text style={styles.currencySymbol}>$</Text>
            <TextInput
              style={[globalStyles.input, styles.amountInput]}
              placeholder="0.00"
              placeholderTextColor={COLORS.textLight}
              value={amount}
              onChangeText={setAmount}
              keyboardType="decimal-pad"
            />
          </View>
        </View>
        
        {loading ? (
          <ActivityIndicator size="large" color={COLORS.primary} style={styles.loader} />
        ) : (
          <CustomButton
            title="Request Loan"
            onPress={handleRequestLoan}
            isFullWidth
          />
        )}
      </View>

      {/* Your loans section */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Icon name="list" size={24} color={COLORS.primary} />
          <Text style={styles.cardTitle}>Your Loans</Text>
        </View>
        
        {loadingLoans ? (
          <ActivityIndicator size="large" color={COLORS.primary} style={styles.loader} />
        ) : error ? (
          <View style={styles.errorContainer}>
            <Icon name="exclamation-circle" size={30} color={COLORS.danger} />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : loans.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>You don't have any loans yet</Text>
          </View>
        ) : (
          loans.map((loan) => (
            <View key={loan.id} style={styles.loanItem}>
              <View style={styles.loanDetails}>
                <Text style={styles.loanAmount}>${loan.amount.toFixed(2)}</Text>
                <Text style={styles.loanDate}>
                  Requested on {new Date(loan.created_at).toLocaleDateString()}
                </Text>
              </View>
              <View style={[styles.statusBadge, { backgroundColor: getStatusColor(loan.status) + '20' }]}>
                <Text style={[styles.statusText, { color: getStatusColor(loan.status) }]}>
                  {loan.status.charAt(0).toUpperCase() + loan.status.slice(1)}
                </Text>
              </View>
            </View>
          ))
        )}
      </View>

      {/* Loan information section */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Icon name="info-circle" size={24} color={COLORS.primary} />
          <Text style={styles.cardTitle}>Loan Information</Text>
        </View>
        
        <View style={styles.infoItem}>
          <Text style={styles.infoLabel}>Interest Rate</Text>
          <Text style={styles.infoValue}>5.9% - 15.9% APR</Text>
        </View>
        
        <View style={styles.infoItem}>
          <Text style={styles.infoLabel}>Term Length</Text>
          <Text style={styles.infoValue}>12 - 60 months</Text>
        </View>
        
        <View style={styles.infoItem}>
          <Text style={styles.infoLabel}>Minimum Amount</Text>
          <Text style={styles.infoValue}>$500</Text>
        </View>
        
        <View style={styles.infoItem}>
          <Text style={styles.infoLabel}>Maximum Amount</Text>
          <Text style={styles.infoValue}>$50,000</Text>
        </View>
        
        <View style={styles.infoItem}>
          <Text style={styles.infoLabel}>Processing Time</Text>
          <Text style={styles.infoValue}>1-3 business days</Text>
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
  headerContainer: {
    marginBottom: SIZES.spacing.lg,
  },
  headerTitle: {
    fontSize: SIZES.xxLarge,
    fontWeight: 'bold',
    color: COLORS.white,
    marginBottom: SIZES.spacing.xs,
  },
  headerSubtitle: {
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
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SIZES.spacing.md,
  },
  cardTitle: {
    fontSize: SIZES.large,
    fontWeight: 'bold',
    color: COLORS.white,
    marginLeft: SIZES.spacing.sm,
  },
  cardDescription: {
    fontSize: SIZES.medium,
    color: COLORS.textLight,
    marginBottom: SIZES.spacing.md,
  },
  inputContainer: {
    marginBottom: SIZES.spacing.md,
  },
  inputLabel: {
    fontSize: SIZES.medium,
    color: COLORS.white,
    marginBottom: SIZES.spacing.xs,
  },
  amountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  currencySymbol: {
    color: COLORS.primary,
    fontSize: SIZES.large,
    marginRight: SIZES.spacing.xs,
    fontWeight: 'bold',
  },
  amountInput: {
    flex: 1,
  },
  loader: {
    marginVertical: SIZES.spacing.md,
  },
  errorContainer: {
    alignItems: 'center',
    padding: SIZES.spacing.md,
  },
  errorText: {
    color: COLORS.danger,
    marginTop: SIZES.spacing.sm,
    textAlign: 'center',
  },
  emptyContainer: {
    padding: SIZES.spacing.lg,
    alignItems: 'center',
  },
  emptyText: {
    color: COLORS.textLight,
    fontSize: SIZES.medium,
    textAlign: 'center',
  },
  loanItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SIZES.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  loanDetails: {
    flex: 1,
  },
  loanAmount: {
    fontSize: SIZES.large,
    fontWeight: 'bold',
    color: COLORS.white,
    marginBottom: SIZES.spacing.xs,
  },
  loanDate: {
    fontSize: SIZES.small,
    color: COLORS.textLight,
  },
  statusBadge: {
    paddingHorizontal: SIZES.spacing.md,
    paddingVertical: SIZES.spacing.xs,
    borderRadius: SIZES.radius.md,
  },
  statusText: {
    fontSize: SIZES.small,
    fontWeight: 'bold',
  },
  infoItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: SIZES.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  infoLabel: {
    fontSize: SIZES.medium,
    color: COLORS.textLight,
  },
  infoValue: {
    fontSize: SIZES.medium,
    fontWeight: '500',
    color: COLORS.white,
  },
});

export default LoansScreen;
