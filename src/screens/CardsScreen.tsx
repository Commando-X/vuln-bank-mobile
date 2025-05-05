import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, Modal, TextInput, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import { ScreenType } from '../navigation/types';
import { useAuth } from '../contexts/AuthContext';
import { ENDPOINTS, get, post } from '../utils/api';
import CustomButton from '../components/CustomButton';
import globalStyles from '../styles/globalStyles';
import theme from '../styles/theme';

const { COLORS, SIZES, SHADOWS } = theme;

interface CardsScreenProps {
  onNavigate: (screen: ScreenType) => void;
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

const CardsScreen: React.FC<CardsScreenProps> = ({ onNavigate }) => {
  const { user } = useAuth();
  const [cards, setCards] = useState<VirtualCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showCardDetails, setShowCardDetails] = useState(false);
  const [selectedCard, setSelectedCard] = useState<VirtualCard | null>(null);
  const [cardLimit, setCardLimit] = useState('');
  const [cardType, setCardType] = useState('standard');
  const [creatingCard, setCreatingCard] = useState(false);
  const [togglingFreeze, setTogglingFreeze] = useState(false);

  const fetchCards = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const response = await get(
        ENDPOINTS.virtualCards.list,
        user.token
      );
      
      if (response.ok && response.data.cards) {
        setCards(response.data.cards);
      } else {
        setError(response.data.message || 'Failed to fetch cards');
      }
    } catch (error) {
      console.error("Cards fetch error:", error);
      setError('Network error or server unavailable');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCards();
  }, [user]);

  const handleCreateCard = async () => {
    if (!cardLimit || parseFloat(cardLimit) <= 0) {
      Alert.alert('Error', 'Please enter a valid card limit');
      return;
    }

    setCreatingCard(true);

    try {
      const response = await post(
        ENDPOINTS.virtualCards.create,
        {
          card_limit: parseFloat(cardLimit),
          card_type: cardType
        },
        user?.token
      );

      if (response.ok && response.data) {
        Alert.alert('Success', 'Virtual card created successfully');
        setShowCreateModal(false);
        setCardLimit('');
        setCardType('standard');
        fetchCards(); // Refresh the card list
      } else {
        Alert.alert('Error', response.data.message || 'Failed to create card');
      }
    } catch (error) {
      console.error("Card creation error:", error);
      Alert.alert('Error', 'Network error or server unavailable');
    } finally {
      setCreatingCard(false);
    }
  };

  const handleToggleFreeze = async (cardId: number) => {
    if (togglingFreeze) return;
    
    setTogglingFreeze(true);

    try {
      const response = await post(
        ENDPOINTS.virtualCards.toggleFreeze(cardId),
        {},
        user?.token
      );

      if (response.ok) {
        // Update local state to reflect change
        const updatedCards = cards.map(card => 
          card.id === cardId 
            ? { ...card, is_frozen: !card.is_frozen } 
            : card
        );
        setCards(updatedCards);
        
        // Update selected card if it's the one being toggled
        if (selectedCard && selectedCard.id === cardId) {
          setSelectedCard({
            ...selectedCard,
            is_frozen: !selectedCard.is_frozen
          });
        }
        
        Alert.alert(
          'Success', 
          `Card has been ${selectedCard?.is_frozen ? 'unfrozen' : 'frozen'} successfully`
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

  const viewCardDetails = (card: VirtualCard) => {
    setSelectedCard(card);
    setShowCardDetails(true);
  };

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

  const renderCard = ({ item }: { item: VirtualCard }) => {
    const cardColor = getCardTypeColor(item.card_type);
    
    return (
      <TouchableOpacity 
        style={[styles.cardItem, { backgroundColor: cardColor }]}
        onPress={() => viewCardDetails(item)}
        activeOpacity={0.8}
      >
        <View style={styles.cardHeader}>
          <Text style={styles.cardType}>
            {item.card_type.toUpperCase()} {item.is_frozen && '(FROZEN)'}
          </Text>
          <Icon name="credit-card" size={24} color={COLORS.white} />
        </View>
        
        <Text style={styles.cardNumber}>
          {formatCardNumber(item.card_number.slice(-8).padStart(16, '*'))}
        </Text>
        
        <View style={styles.cardFooter}>
          <View>
            <Text style={styles.cardLabel}>BALANCE</Text>
            <Text style={styles.cardBalance}>${item.balance.toFixed(2)}</Text>
          </View>
          <View>
            <Text style={styles.cardLabel}>EXPIRES</Text>
            <Text style={styles.cardExpiry}>{item.expiry_date}</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderEmptyList = () => (
    <View style={styles.emptyContainer}>
      <Icon name="credit-card" size={60} color={COLORS.textLight} />
      <Text style={styles.emptyText}>You don't have any virtual cards yet</Text>
      <CustomButton 
        title="Create Your First Card" 
        onPress={() => setShowCreateModal(true)}
        isFullWidth
      />
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Virtual Cards</Text>
        <Text style={styles.headerSubtitle}>
          Create and manage your virtual payment cards
        </Text>
      </View>
      
      <CustomButton 
        title="Create New Card" 
        onPress={() => setShowCreateModal(true)}
        iconName="plus"
        isFullWidth
      />
      
      {loading ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loaderText}>Loading your cards...</Text>
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <Icon name="exclamation-circle" size={40} color={COLORS.danger} />
          <Text style={styles.errorText}>{error}</Text>
          <CustomButton 
            title="Try Again" 
            onPress={fetchCards} 
            variant="outline"
          />
        </View>
      ) : (
        <FlatList
          data={cards}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderCard}
          ListEmptyComponent={renderEmptyList}
          contentContainerStyle={
            cards.length === 0 
              ? styles.emptyListContainer 
              : styles.cardListContainer
          }
        />
      )}
      
      {/* Create Card Modal */}
      <Modal
        visible={showCreateModal}
        animationType="slide"
        transparent
        onRequestClose={() => setShowCreateModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Create Virtual Card</Text>
              <TouchableOpacity onPress={() => setShowCreateModal(false)}>
                <Icon name="times" size={24} color={COLORS.textLight} />
              </TouchableOpacity>
            </View>
            
            <View style={styles.formGroup}>
              <Text style={styles.label}>Card Limit ($)</Text>
              <View style={styles.amountContainer}>
                <Text style={styles.currencySymbol}>$</Text>
                <TextInput
                  style={[globalStyles.input, styles.amountInput]}
                  placeholder="0.00"
                  placeholderTextColor={COLORS.textLight}
                  value={cardLimit}
                  onChangeText={setCardLimit}
                  keyboardType="decimal-pad"
                />
              </View>
            </View>
            
            <View style={styles.formGroup}>
              <Text style={styles.label}>Card Type</Text>
              <View style={styles.cardTypeContainer}>
                <TouchableOpacity 
                  style={[
                    styles.cardTypeOption,
                    cardType === 'standard' && styles.cardTypeSelected,
                    { borderColor: COLORS.primary }
                  ]}
                  onPress={() => setCardType('standard')}
                >
                  <Text style={styles.cardTypeText}>Standard</Text>
                  {cardType === 'standard' && (
                    <Icon name="check" size={16} color={COLORS.primary} />
                  )}
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={[
                    styles.cardTypeOption,
                    cardType === 'premium' && styles.cardTypeSelected,
                    { borderColor: '#9C27B0' }
                  ]}
                  onPress={() => setCardType('premium')}
                >
                  <Text style={styles.cardTypeText}>Premium</Text>
                  {cardType === 'premium' && (
                    <Icon name="check" size={16} color="#9C27B0" />
                  )}
                </TouchableOpacity>
              </View>
            </View>
            
            <View style={styles.modalButtonContainer}>
              {creatingCard ? (
                <ActivityIndicator size="large" color={COLORS.primary} />
              ) : (
                <>
                  <CustomButton 
                    title="Create Card" 
                    onPress={handleCreateCard}
                    isFullWidth
                  />
                  <CustomButton 
                    title="Cancel" 
                    onPress={() => setShowCreateModal(false)}
                    isFullWidth
                    variant="outline"
                  />
                </>
              )}
            </View>
          </View>
        </View>
      </Modal>
      
      {/* Card Details Modal */}
      <Modal
        visible={showCardDetails}
        animationType="slide"
        transparent
        onRequestClose={() => setShowCardDetails(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Card Details</Text>
              <TouchableOpacity onPress={() => setShowCardDetails(false)}>
                <Icon name="times" size={24} color={COLORS.textLight} />
              </TouchableOpacity>
            </View>
            
            {selectedCard && (
              <>
                <View style={[
                  styles.cardDetailDisplay,
                  { backgroundColor: getCardTypeColor(selectedCard.card_type) }
                ]}>
                  <View style={styles.cardHeader}>
                    <Text style={styles.cardType}>
                      {selectedCard.card_type.toUpperCase()} 
                      {selectedCard.is_frozen && ' (FROZEN)'}
                    </Text>
                    <Icon name="credit-card" size={24} color={COLORS.white} />
                  </View>
                  
                  <Text style={styles.detailCardNumber}>
                    {formatCardNumber(selectedCard.card_number)}
                  </Text>
                  
                  <View style={styles.cardFooter}>
                    <View>
                      <Text style={styles.cardLabel}>EXPIRES</Text>
                      <Text style={styles.cardExpiry}>{selectedCard.expiry_date}</Text>
                    </View>
                    <View>
                      <Text style={styles.cardLabel}>CVV</Text>
                      <Text style={styles.cardExpiry}>{selectedCard.cvv}</Text>
                    </View>
                  </View>
                </View>
                
                <View style={styles.detailsContainer}>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Card Balance</Text>
                    <Text style={styles.detailValue}>${selectedCard.balance.toFixed(2)}</Text>
                  </View>
                  
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Card Limit</Text>
                    <Text style={styles.detailValue}>${selectedCard.limit.toFixed(2)}</Text>
                  </View>
                  
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Card Status</Text>
                    <View style={[
                      styles.statusBadge,
                      {
                        backgroundColor: selectedCard.is_frozen 
                          ? COLORS.danger + '20' 
                          : COLORS.success + '20'
                      }
                    ]}>
                      <Text style={[
                        styles.statusText, 
                        {
                          color: selectedCard.is_frozen 
                            ? COLORS.danger 
                            : COLORS.success
                        }
                      ]}>
                        {selectedCard.is_frozen ? 'Frozen' : 'Active'}
                      </Text>
                    </View>
                  </View>
                  
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Created</Text>
                    <Text style={styles.detailValue}>
                      {new Date(selectedCard.created_at).toLocaleDateString()}
                    </Text>
                  </View>
                </View>
                
                <View style={styles.cardActionsContainer}>
                  <CustomButton 
                    title={selectedCard.is_frozen ? "Unfreeze Card" : "Freeze Card"}
                    onPress={() => handleToggleFreeze(selectedCard.id)}
                    iconName={selectedCard.is_frozen ? "unlock" : "lock"}
                    isFullWidth
                    variant={selectedCard.is_frozen ? "outline" : "primary"}
                  />
                  
                  <CustomButton 
                    title="View Transactions"
                    onPress={() => {
                      setShowCardDetails(false);
                      onNavigate('cardTransactions', { cardId: selectedCard.id });
                    }}
                    iconName="history"
                    isFullWidth
                  />
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.backgroundDark,
    padding: SIZES.spacing.md,
  },
  header: {
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
    marginBottom: SIZES.spacing.md,
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
    marginVertical: SIZES.spacing.md,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SIZES.spacing.lg,
  },
  emptyText: {
    fontSize: SIZES.medium,
    color: COLORS.textLight,
    textAlign: 'center',
    marginVertical: SIZES.spacing.lg,
  },
  emptyListContainer: {
    flex: 1,
  },
  cardListContainer: {
    paddingTop: SIZES.spacing.md,
  },
  cardItem: {
    borderRadius: SIZES.radius.md,
    padding: SIZES.spacing.lg,
    marginBottom: SIZES.spacing.md,
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
  cardBalance: {
    color: COLORS.white,
    fontSize: SIZES.medium,
    fontWeight: 'bold',
  },
  cardExpiry: {
    color: COLORS.white,
    fontSize: SIZES.medium,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    padding: SIZES.spacing.lg,
  },
  modalContent: {
    backgroundColor: COLORS.backgroundDark,
    borderRadius: SIZES.radius.lg,
    padding: SIZES.spacing.lg,
    ...SHADOWS.large,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SIZES.spacing.lg,
  },
  modalTitle: {
    fontSize: SIZES.large,
    fontWeight: 'bold',
    color: COLORS.white,
  },
  formGroup: {
    marginBottom: SIZES.spacing.md,
  },
  label: {
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
  cardTypeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cardTypeOption: {
    flex: 1,
    marginHorizontal: SIZES.spacing.xs,
    paddingVertical: SIZES.spacing.md,
    paddingHorizontal: SIZES.spacing.md,
    borderWidth: 2,
    borderRadius: SIZES.radius.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardTypeSelected: {
    backgroundColor: 'rgba(0, 123, 255, 0.1)',
  },
  cardTypeText: {
    color: COLORS.white,
    fontSize: SIZES.medium,
  },
  modalButtonContainer: {
    marginTop: SIZES.spacing.lg,
  },
  cardDetailDisplay: {
    borderRadius: SIZES.radius.md,
    padding: SIZES.spacing.lg,
    marginBottom: SIZES.spacing.lg,
    ...SHADOWS.medium,
  },
  detailCardNumber: {
    color: COLORS.white,
    fontSize: SIZES.large,
    fontWeight: 'bold',
    letterSpacing: 2,
    marginBottom: SIZES.spacing.lg,
  },
  detailsContainer: {
    marginBottom: SIZES.spacing.lg,
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
  cardActionsContainer: {
    marginTop: SIZES.spacing.md,
  },
});

export default CardsScreen;
