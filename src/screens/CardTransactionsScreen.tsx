import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import { ScreenType } from '../navigation/types';
import { useAuth } from '../contexts/AuthContext';
import { ENDPOINTS, get } from '../utils/api';
import CustomButton from '../components/CustomButton';
import globalStyles from '../styles/globalStyles';
import theme from '../styles/theme';

const { COLORS, SIZES, SHADOWS } = theme;

interface CardTransactionsScreenProps {
  onNavigate: (screen: ScreenType) => void;
  params?: {
    cardId: number | string;
  };
}

interface CardTransaction {
  id: number;
  amount: number;
  merchant: string;
  timestamp: string;
  status: string;
  type: string;
  card_id: number;
}

const CardTransactionsScreen: React.FC<CardTransactionsScreenProps> = ({ onNavigate, params }) => {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<CardTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cardDetails, setCardDetails] = useState<any>(null);  // To store some card info

  const cardId = params?.cardId;

  const fetchTransactions = async () => {
    if (!user || !cardId) {
      setError('Invalid card ID or user session');
      setLoading(false);
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      // Get card transactions
      const txnResponse = await get(
        ENDPOINTS.virtualCards.transactions(cardId),
        user.token
      );
      
      if (txnResponse.ok && txnResponse.data.transactions) {
        setTransactions(txnResponse.data.transactions);
      } else {
        setError(txnResponse.data.message || 'Failed to fetch transactions');
      }

      // Get card details to show card info
      const cardResponse = await get(
        ENDPOINTS.virtualCards.list,
        user.token
      );
      
      if (cardResponse.ok && cardResponse.data.cards) {
        const card = cardResponse.data.cards.find((c: any) => c.id.toString() === cardId.toString());
        if (card) {
          setCardDetails({
            card_type: card.card_type,
            card_number: card.card_number,
            balance: card.balance,
            is_frozen: card.is_frozen
          });
        }
      }
    } catch (error) {
      console.error("Transactions fetch error:", error);
      setError('Network error or server unavailable');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, [user, cardId]);

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
      case 'successful':
        return COLORS.success;
      case 'pending':
        return COLORS.warning;
      case 'declined':
      case 'failed':
        return COLORS.danger;
      default:
        return COLORS.textLight;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'payment':
        return 'shopping-cart';
      case 'refund':
        return 'undo';
      case 'withdrawal':
        return 'money';
      case 'deposit':
        return 'bank';
      default:
        return 'exchange';
    }
  };

  const formatCardNumber = (number?: string) => {
    if (!number) return 'Card';
    return `Card *${number.slice(-4)}`;
  };

  const renderTransactionItem = ({ item }: { item: CardTransaction }) => (
    <View style={styles.transactionItem}>
      <View style={styles.transactionLeft}>
        <View style={[styles.iconContainer, { backgroundColor: getStatusColor(item.status) + '20' }]}>
          <Icon name={getTypeIcon(item.type)} size={20} color={getStatusColor(item.status)} />
        </View>
      </View>
      
      <View style={styles.transactionMiddle}>
        <Text style={styles.merchant}>{item.merchant}</Text>
        <Text style={styles.timestamp}>{new Date(item.timestamp).toLocaleString()}</Text>
      </View>
      
      <View style={styles.transactionRight}>
        <Text style={[
          styles.amount, 
          { color: item.type === 'refund' ? COLORS.success : COLORS.white }
        ]}>
          {item.type === 'refund' ? '+' : '-'}${Math.abs(item.amount).toFixed(2)}
        </Text>
        <View style={[
          styles.statusBadge,
          { backgroundColor: getStatusColor(item.status) + '20' }
        ]}>
          <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>
            {item.status}
          </Text>
        </View>
      </View>
    </View>
  );

  const renderEmptyList = () => (
    <View style={styles.emptyContainer}>
      <Icon name="credit-card" size={60} color={COLORS.textLight} />
      <Text style={styles.emptyText}>No transactions found for this card</Text>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Loading transactions...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centerContainer}>
        <Icon name="exclamation-circle" size={40} color={COLORS.danger} />
        <Text style={styles.errorText}>{error}</Text>
        <CustomButton 
          title="Try Again" 
          onPress={fetchTransactions} 
          variant="outline"
          style={styles.button}
        />
        <CustomButton 
          title="Go Back to Card" 
          onPress={() => onNavigate('cardDetails', { cardId })} 
          style={styles.button}
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Card Info Header */}
      {cardDetails && (
        <View style={[
          styles.cardInfoContainer,
          {backgroundColor: cardDetails.is_frozen ? COLORS.cardDark : COLORS.primary}
        ]}>
          <View style={styles.cardInfoTop}>
            <Text style={styles.cardLabel}>
              {cardDetails.card_type.toUpperCase()} {formatCardNumber(cardDetails.card_number)}
            </Text>
            {cardDetails.is_frozen && (
              <View style={styles.frozenTag}>
                <Text style={styles.frozenText}>FROZEN</Text>
              </View>
            )}
          </View>
          <Text style={styles.cardBalance}>
            Balance: ${cardDetails.balance?.toFixed(2) || '0.00'}
          </Text>
        </View>
      )}

      {/* Transaction List */}
      <Text style={styles.sectionTitle}>Transaction History</Text>
      
      <FlatList
        data={transactions}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderTransactionItem}
        ListEmptyComponent={renderEmptyList}
        contentContainerStyle={transactions.length === 0 ? styles.emptyList : undefined}
      />
      
      <CustomButton 
        title="Back to Card Details" 
        onPress={() => onNavigate('cardDetails', { cardId })} 
        variant="outline"
        isFullWidth
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.backgroundDark,
    padding: SIZES.spacing.md,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SIZES.spacing.lg,
  },
  loadingText: {
    fontSize: SIZES.medium,
    color: COLORS.textLight,
    marginTop: SIZES.spacing.md,
  },
  errorText: {
    fontSize: SIZES.medium,
    color: COLORS.danger,
    textAlign: 'center',
    marginVertical: SIZES.spacing.md,
  },
  button: {
    marginTop: SIZES.spacing.sm,
  },
  cardInfoContainer: {
    borderRadius: SIZES.radius.md,
    padding: SIZES.spacing.md,
    marginBottom: SIZES.spacing.md,
    ...SHADOWS.small,
  },
  cardInfoTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SIZES.spacing.xs,
  },
  cardLabel: {
    color: COLORS.white,
    fontSize: SIZES.medium,
    fontWeight: 'bold',
  },
  frozenTag: {
    backgroundColor: 'rgba(255, 0, 0, 0.2)',
    paddingHorizontal: SIZES.spacing.sm,
    paddingVertical: 2,
    borderRadius: SIZES.radius.sm,
  },
  frozenText: {
    color: COLORS.danger,
    fontSize: SIZES.small,
    fontWeight: 'bold',
  },
  cardBalance: {
    color: COLORS.white,
    fontSize: SIZES.small,
  },
  sectionTitle: {
    fontSize: SIZES.large,
    fontWeight: 'bold',
    color: COLORS.white,
    marginBottom: SIZES.spacing.md,
  },
  transactionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SIZES.spacing.md,
    backgroundColor: COLORS.cardDark,
    borderRadius: SIZES.radius.md,
    marginBottom: SIZES.spacing.sm,
    ...SHADOWS.small,
  },
  transactionLeft: {
    marginRight: SIZES.spacing.md,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  transactionMiddle: {
    flex: 1,
  },
  merchant: {
    color: COLORS.white,
    fontSize: SIZES.medium,
    fontWeight: '500',
  },
  timestamp: {
    color: COLORS.textLight,
    fontSize: SIZES.small,
  },
  transactionRight: {
    alignItems: 'flex-end',
  },
  amount: {
    fontSize: SIZES.medium,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statusBadge: {
    paddingHorizontal: SIZES.spacing.sm,
    paddingVertical: 2,
    borderRadius: SIZES.radius.sm,
  },
  statusText: {
    fontSize: SIZES.small,
    fontWeight: 'bold',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SIZES.spacing.xl,
  },
  emptyText: {
    fontSize: SIZES.medium,
    color: COLORS.textLight,
    textAlign: 'center',
    marginTop: SIZES.spacing.md,
  },
  emptyList: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default CardTransactionsScreen;
