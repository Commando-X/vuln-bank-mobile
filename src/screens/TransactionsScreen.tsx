import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, RefreshControl } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import { ScreenType } from '../navigation/types';
import { useAuth } from '../contexts/AuthContext';
import { ENDPOINTS, get } from '../utils/api';
import globalStyles from '../styles/globalStyles';
import theme from '../styles/theme';

const { COLORS, SIZES, SHADOWS } = theme;

interface TransactionsScreenProps {
  onNavigate: (screen: ScreenType) => void;
  params?: {
    filterByType?: 'sent' | 'received';
  };
}

interface Transaction {
  id: number;
  from_account: string;
  to_account: string;
  amount: number;
  timestamp: string;
  description?: string;
}

const TransactionsScreen: React.FC<TransactionsScreenProps> = ({ onNavigate, params }) => {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const accountNumber = user?.accountNumber || '';
  const filterType = params?.filterByType;

  const fetchTransactions = async () => {
    if (!user || !accountNumber) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const response = await get(
        ENDPOINTS.transactions(accountNumber),
        user.token
      );
      
      if (response.ok && response.data.transactions) {
        let filteredTransactions = response.data.transactions;
        
        // Apply filter if specified
        if (filterType === 'sent') {
          filteredTransactions = filteredTransactions.filter(
            (t: Transaction) => t.from_account === accountNumber
          );
        } else if (filterType === 'received') {
          filteredTransactions = filteredTransactions.filter(
            (t: Transaction) => t.to_account === accountNumber
          );
        }
        
        setTransactions(filteredTransactions);
      } else {
        setError(response.data.message || 'Failed to fetch transactions');
      }
    } catch (error) {
      console.error("Transactions fetch error:", error);
      setError('Network error or server unavailable');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };
  
  const onRefresh = () => {
    setRefreshing(true);
    fetchTransactions();
  };

  useEffect(() => {
    fetchTransactions();
  }, [user, accountNumber, filterType]);

  const renderEmptyList = () => (
    <View style={styles.emptyContainer}>
      <Icon name="exchange" size={60} color={COLORS.textLight} />
      <Text style={styles.emptyText}>No transactions found</Text>
    </View>
  );

  const renderTransaction = ({ item }: { item: Transaction }) => {
    const isSender = item.from_account === accountNumber;
    const otherParty = isSender ? item.to_account : item.from_account;
    const formattedDate = new Date(item.timestamp).toLocaleString();
    
    return (
      <View style={styles.transactionCard}>
        <View style={styles.transactionIconContainer}>
          <Icon 
            name={isSender ? "arrow-up" : "arrow-down"} 
            size={24} 
            color={isSender ? COLORS.danger : COLORS.success} 
          />
        </View>
        
        <View style={styles.transactionDetails}>
          <Text style={styles.transactionTitle}>
            {isSender ? 'Sent to' : 'Received from'}: {otherParty}
          </Text>
          
          <Text style={styles.transactionDate}>{formattedDate}</Text>
          
          {item.description && (
            <Text style={styles.transactionDescription} numberOfLines={1}>
              {item.description}
            </Text>
          )}
        </View>
        
        <Text style={[
          styles.transactionAmount,
          isSender ? styles.amountSent : styles.amountReceived
        ]}>
          {isSender ? '-' : '+'}${Math.abs(item.amount).toFixed(2)}
        </Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Transaction History</Text>
        
        <View style={styles.filterContainer}>
          <Text style={styles.filterLabel}>Filter by:</Text>
          <View style={styles.filterButtons}>
            <Text 
              style={[
                styles.filterButton, 
                !filterType && styles.filterButtonActive
              ]}
              onPress={() => onNavigate('transactions', {})}
            >
              All
            </Text>
            <Text 
              style={[
                styles.filterButton, 
                filterType === 'sent' && styles.filterButtonActive
              ]}
              onPress={() => onNavigate('transactions', { filterByType: 'sent' })}
            >
              Sent
            </Text>
            <Text 
              style={[
                styles.filterButton, 
                filterType === 'received' && styles.filterButtonActive
              ]}
              onPress={() => onNavigate('transactions', { filterByType: 'received' })}
            >
              Received
            </Text>
          </View>
        </View>
      </View>
      
      {loading && !refreshing ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loaderText}>Loading transactions...</Text>
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <Icon name="exclamation-circle" size={40} color={COLORS.danger} />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : (
        <FlatList
          data={transactions}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderTransaction}
          ListEmptyComponent={renderEmptyList}
          refreshControl={
            <RefreshControl 
              refreshing={refreshing} 
              onRefresh={onRefresh} 
              colors={[COLORS.primary]} 
            />
          }
          contentContainerStyle={
            transactions.length === 0 ? { flex: 1 } : { paddingBottom: SIZES.spacing.xl }
          }
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.backgroundDark,
  },
  header: {
    padding: SIZES.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  headerTitle: {
    fontSize: SIZES.large,
    fontWeight: 'bold',
    color: COLORS.white,
    marginBottom: SIZES.spacing.sm,
  },
  filterContainer: {
    marginTop: SIZES.spacing.sm,
  },
  filterLabel: {
    fontSize: SIZES.small,
    color: COLORS.textLight,
    marginBottom: SIZES.spacing.xs,
  },
  filterButtons: {
    flexDirection: 'row',
  },
  filterButton: {
    paddingHorizontal: SIZES.spacing.md,
    paddingVertical: SIZES.spacing.xs,
    marginRight: SIZES.spacing.sm,
    borderRadius: SIZES.radius.sm,
    backgroundColor: COLORS.cardDark,
    color: COLORS.textLight,
  },
  filterButtonActive: {
    backgroundColor: COLORS.primary,
    color: COLORS.white,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SIZES.spacing.lg,
  },
  emptyText: {
    fontSize: SIZES.medium,
    color: COLORS.textLight,
    textAlign: 'center',
    marginTop: SIZES.spacing.md,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loaderText: {
    fontSize: SIZES.medium,
    color: COLORS.textLight,
    marginTop: SIZES.spacing.md,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SIZES.spacing.lg,
  },
  errorText: {
    fontSize: SIZES.medium,
    color: COLORS.danger,
    textAlign: 'center',
    marginTop: SIZES.spacing.md,
  },
  transactionCard: {
    flexDirection: 'row',
    padding: SIZES.spacing.md,
    marginHorizontal: SIZES.spacing.md,
    marginTop: SIZES.spacing.md,
    backgroundColor: COLORS.cardDark,
    borderRadius: SIZES.radius.md,
    alignItems: 'center',
    ...SHADOWS.small,
  },
  transactionIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SIZES.spacing.md,
  },
  transactionDetails: {
    flex: 1,
  },
  transactionTitle: {
    fontSize: SIZES.medium,
    fontWeight: '500',
    color: COLORS.white,
  },
  transactionDate: {
    fontSize: SIZES.small,
    color: COLORS.textLight,
    marginBottom: 2,
  },
  transactionDescription: {
    fontSize: SIZES.small,
    color: COLORS.textLight,
    marginTop: 2,
    fontStyle: 'italic',
  },
  transactionAmount: {
    fontSize: SIZES.medium,
    fontWeight: 'bold',
  },
  amountSent: {
    color: COLORS.danger,
  },
  amountReceived: {
    color: COLORS.success,
  },
});

export default TransactionsScreen;
