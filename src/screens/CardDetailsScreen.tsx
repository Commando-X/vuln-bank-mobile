import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import { ScreenType } from '../navigation/types';
import { useAuth } from '../contexts/AuthContext';
import { ENDPOINTS, get, post } from '../utils/api';
import CustomButton from '../components/CustomButton';
import globalStyles from '../styles/globalStyles';
import theme from '../styles/theme';

const { COLORS, SIZES, SHADOWS } = theme;

interface CardDetailsScreenProps {
  onNavigate: (screen: ScreenType) => void;
  params?: {
    cardId: number | string;
  };
}

interface VirtualCard {
  id: number;
  card_number: string;
  cvv: string;
  expiry_date: string;
  card_type: string;
  limit: number;
  balance: number;
  is_frozen: boolean;
  created_at: string;
}

const CardDetailsScreen: React.FC<CardDetailsScreenProps> = ({ onNavigate, params }) => {
  const { user } = useAuth();
  const [card, setCard] = useState<VirtualCard | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [togglingFreeze, setTogglingFreeze] = useState(false);

  const cardId = params?.cardId;

  const fetchCardDetails = async () => {
    if (!user || !cardId) {
      setError('Invalid card ID or user session');
      setLoading(false);
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      const response = await get(
        ENDPOINTS.virtualCards.list,
        user.token
      );
      
      if (response.ok && response.data.cards) {
        // Find the specific card from the list
        const foundCard = response.data.cards.find((c: VirtualCard) => c.id.toString() === cardId.toString());
        if (foundCard) {
          setCard(foundCard);
        } else {
          setError('Card not found');
        }
      } else {
        setError(response.data.message || 'Failed to fetch card details');
      }
    } catch (error) {
      console.error("Card details fetch error:", error);
      setError('Network error or server unavailable');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCardDetails();
  }, [user, cardId]);

  const formatCardNumber = (number: string) => {
    return number.replace(/(\d{4})/g, '$1 ').trim();
  };

  const getCardTypeColor = (type: string) => {
    switch (type.toLowerCase()) {
      case 'premium':
        return '#9C27B0'; // Purple
      case 'business':
        return '#FF9800'; // Orange
      default:
        return COLORS.primary; // Blue
    }
  };

  const handleToggleFreeze = async () => {
    if (!card) return;
    
    setTogglingFreeze(true);

    try {
      const response = await post(
        ENDPOINTS.virtualCards.toggleFreeze(card.id),
        {},
        user?.token
      );

      if (response.ok) {
        setCard({
          ...card,
          is_frozen: !card.is_frozen
        });
        
        Alert.alert(
          'Success', 
          `Card has been ${card.is_frozen ? 'unfrozen' : 'frozen'} successfully`
        );
      } else {
        Alert.alert('Error', response.data.message || 'Failed to toggle card status');
      }
    } catch (error) {
      console.error("Card toggle freeze error:", error);
      Alert.alert('Error', 'Network error or server unavailable');
    } finally {
      setTogglingFreeze(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Loading card details...</Text>
      </View>
    );
  }

  if (error || !card) {
    return (
      <View style={styles.centerContainer}>
        <Icon name="exclamation-circle" size={40} color={COLORS.danger} />
        <Text style={styles.errorText}>{error || 'Card not found'}</Text>
        <CustomButton 
          title="Go Back" 
          onPress={() => onNavigate('cards')} 
          variant="outline"
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Card Display */}
      <View style={[
        styles.cardDisplay,
        { backgroundColor: getCardTypeColor(card.card_type) }
      ]}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardType}>
            {card.card_type.toUpperCase()} 
            {card.is_frozen && ' (FROZEN)'}
          </Text>
          <Icon name="credit-card" size={24} color={COLORS.white} />
        </View>
        
        <Text style={styles.cardNumber}>
          {formatCardNumber(card.card_number)}
        </Text>
        
        <View style={styles.cardFooter}>
          <View>
            <Text style={styles.cardLabel}>EXPIRES</Text>
            <Text style={styles.cardExpiry}>{card.expiry_date}</Text>
          </View>
          <View>
            <Text style={styles.cardLabel}>CVV</Text>
            <Text style={styles.cardExpiry}>{card.cvv}</Text>
          </View>
        </View>
      </View>
      
      {/* Card Information */}
      <View style={styles.detailsContainer}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Card Information</Text>
          
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Card Balance</Text>
            <Text style={styles.detailValue}>${card.balance.toFixed(2)}</Text>
          </View>
          
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Card Limit</Text>
            <Text style={styles.detailValue}>${card.limit.toFixed(2)}</Text>
          </View>
          
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Card Status</Text>
            <View style={[
              styles.statusBadge,
              {
                backgroundColor: card.is_frozen 
                  ? COLORS.danger + '20' 
                  : COLORS.success + '20'
              }
            ]}>
              <Text style={[
                styles.statusText,
                {
                  color: card.is_frozen 
                    ? COLORS.danger 
                    : COLORS.success
                }
              ]}>
                {card.is_frozen ? 'Frozen' : 'Active'}
              </Text>
            </View>
          </View>
          
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Created</Text>
            <Text style={styles.detailValue}>
              {new Date(card.created_at).toLocaleDateString()}
            </Text>
          </View>
        </View>
        
        {/* Card Actions */}
        <View style={styles.actionsContainer}>
          {togglingFreeze ? (
            <ActivityIndicator size="large" color={COLORS.primary} />
          ) : (
            <CustomButton 
              title={card.is_frozen ? "Unfreeze Card" : "Freeze Card"}
              onPress={handleToggleFreeze}
              iconName={card.is_frozen ? "unlock" : "lock"}
              isFullWidth
              variant={card.is_frozen ? "outline" : "primary"}
            />
          )}
          
          <CustomButton 
            title="View Transactions"
            onPress={() => onNavigate('cardTransactions', { cardId: card.id })}
            iconName="history"
            isFullWidth
          />
          
          <CustomButton 
            title="Back to Cards"
            onPress={() => onNavigate('cards')}
            variant="outline"
            isFullWidth
          />
        </View>
      </View>
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
  cardDisplay: {
    borderRadius: SIZES.radius.lg,
    padding: SIZES.spacing.lg,
    marginBottom: SIZES.spacing.lg,
    ...SHADOWS.medium,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SIZES.spacing.lg,
  },
  cardType: {
    color: COLORS.white,
    fontSize: SIZES.medium,
    fontWeight: 'bold',
  },
  cardNumber: {
    color: COLORS.white,
    fontSize: SIZES.large,
    fontWeight: 'bold',
    letterSpacing: 2,
    marginBottom: SIZES.spacing.lg,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cardLabel: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: SIZES.small,
    marginBottom: 4,
  },
  cardExpiry: {
    color: COLORS.white,
    fontSize: SIZES.medium,
  },
  detailsContainer: {
    flex: 1,
  },
  section: {
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
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
  statusBadge: {
    paddingHorizontal: SIZES.spacing.md,
    paddingVertical: SIZES.spacing.xs,
    borderRadius: SIZES.radius.md,
  },
  statusText: {
    fontSize: SIZES.small,
    fontWeight: 'bold',
  },
  actionsContainer: {
    gap: SIZES.spacing.md,
  },
});

export default CardDetailsScreen;
