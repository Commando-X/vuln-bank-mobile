import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, Modal, Alert, ActivityIndicator } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import { ScreenType } from '../navigation/types';
import { useAuth } from '../contexts/AuthContext';
import { ENDPOINTS, get, post } from '../utils/api';
import CustomButton from '../components/CustomButton';
import globalStyles from '../styles/globalStyles';
import theme from '../styles/theme';

const { COLORS, SIZES, SHADOWS } = theme;

interface BillsScreenProps {
  onNavigate: (screen: ScreenType) => void;
}

interface BillCategory {
  id: number;
  name: string;
  description: string;
}

interface Biller {
  id: number;
  name: string;
  category_id: number;
  minimum_amount: number;
  maximum_amount?: number;
}

interface BillPayment {
  id: number;
  amount: number;
  status: string;
  reference: string;
  biller_name: string;
  category_name: string;
  payment_method: string;
  card_number?: string;
  description?: string;
  created_at: string;
}

const BillsScreen: React.FC<BillsScreenProps> = ({ onNavigate }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [paymentHistory, setPaymentHistory] = useState<BillPayment[]>([]);
  const [error, setError] = useState<string | null>(null);
  
  // Payment modal states
  const [showPayModal, setShowPayModal] = useState(false);
  const [categories, setCategories] = useState<BillCategory[]>([]);
  const [billers, setBillers] = useState<Biller[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [selectedBiller, setSelectedBiller] = useState<Biller | null>(null);
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('balance');
  const [virtualCards, setVirtualCards] = useState<any[]>([]);
  const [selectedCard, setSelectedCard] = useState<number | null>(null);
  const [processingPayment, setProcessingPayment] = useState(false);

  const fetchPaymentHistory = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const response = await get(
        ENDPOINTS.billPayments.history,
        user.token
      );
      
      if (response.ok && response.data.payments) {
        setPaymentHistory(response.data.payments);
      } else {
        setError(response.data.message || 'Failed to fetch payment history');
      }
    } catch (error) {
      console.error("Error fetching bill payments:", error);
      setError('Network error or server unavailable');
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await get(ENDPOINTS.billPayments.categories);
      
      if (response.ok && response.data.categories) {
        setCategories(response.data.categories);
      }
    } catch (error) {
      console.error("Error fetching bill categories:", error);
    }
  };

  const fetchBillers = async (categoryId: number) => {
    try {
      const response = await get(
        ENDPOINTS.billPayments.billersByCategory(categoryId)
      );
      
      if (response.ok && response.data.billers) {
        setBillers(response.data.billers);
      } else {
        setBillers([]);
      }
    } catch (error) {
      console.error("Error fetching billers:", error);
      setBillers([]);
    }
  };

  const fetchVirtualCards = async () => {
    if (!user) return;
    
    try {
      const response = await get(
        ENDPOINTS.virtualCards.list,
        user.token
      );
      
      if (response.ok && response.data.cards) {
        // Filter out frozen cards
        const activeCards = response.data.cards.filter((card: any) => 
          !card.is_frozen && card.balance > 0
        );
        setVirtualCards(activeCards);
      }
    } catch (error) {
      console.error("Error fetching virtual cards:", error);
    }
  };

  useEffect(() => {
    fetchPaymentHistory();
    fetchCategories();
    fetchVirtualCards();
  }, [user]);

  const handleCategorySelect = (categoryId: number) => {
    setSelectedCategory(categoryId);
    setSelectedBiller(null);
    fetchBillers(categoryId);
  };

  const handleBillerSelect = (biller: Biller) => {
    setSelectedBiller(biller);
    // Set minimum amount as default
    setAmount(biller.minimum_amount.toString());
  };

  const handlePaymentMethodChange = (method: string) => {
    setPaymentMethod(method);
    if (method === 'virtual_card') {
      // If there are no cards, default back to balance
      if (virtualCards.length === 0) {
        Alert.alert(
          'No Cards Available', 
          'You don\'t have any active virtual cards. Create a card first or use your account balance.',
          [{ text: 'OK', onPress: () => setPaymentMethod('balance') }]
        );
      } else if (virtualCards.length === 1) {
        // If there's only one card, select it automatically
        setSelectedCard(virtualCards[0].id);
      }
    } else {
      setSelectedCard(null);
    }
  };

  const resetPaymentForm = () => {
    setSelectedCategory(null);
    setSelectedBiller(null);
    setAmount('');
    setDescription('');
    setPaymentMethod('balance');
    setSelectedCard(null);
  };

  const handlePayBill = async () => {
    if (!selectedBiller) {
      Alert.alert('Error', 'Please select a biller');
      return;
    }

    if (!amount || parseFloat(amount) <= 0) {
      Alert.alert('Error', 'Please enter a valid amount');
      return;
    }

    const amountValue = parseFloat(amount);
    
    if (amountValue < selectedBiller.minimum_amount) {
      Alert.alert('Error', `Minimum amount is $${selectedBiller.minimum_amount}`);
      return;
    }

    if (selectedBiller.maximum_amount && amountValue > selectedBiller.maximum_amount) {
      Alert.alert('Error', `Maximum amount is $${selectedBiller.maximum_amount}`);
      return;
    }

    if (paymentMethod === 'virtual_card' && !selectedCard) {
      Alert.alert('Error', 'Please select a card');
      return;
    }

    setProcessingPayment(true);

    try {
      const paymentData: any = {
        biller_id: selectedBiller.id,
        amount: amountValue,
        payment_method: paymentMethod,
        description: description || `Payment to ${selectedBiller.name}`
      };

      if (paymentMethod === 'virtual_card') {
        paymentData.card_id = selectedCard;
      }

      const response = await post(
        ENDPOINTS.billPayments.create,
        paymentData,
        user?.token
      );

      if (response.ok) {
        Alert.alert(
          'Success',
          'Payment processed successfully!',
          [{ text: 'OK' }]
        );
        setShowPayModal(false);
        resetPaymentForm();
        fetchPaymentHistory();
      } else {
        Alert.alert('Error', response.data.message || 'Failed to process payment');
      }
    } catch (error) {
      console.error("Bill payment error:", error);
      Alert.alert('Error', 'Network error or server unavailable');
    } finally {
      setProcessingPayment(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
      case 'successful':
        return COLORS.success;
      case 'pending':
        return COLORS.warning;
      case 'failed':
        return COLORS.danger;
      default:
        return COLORS.textLight;
    }
  };

  const renderCategoryItem = ({ item }: { item: BillCategory }) => (
    <TouchableOpacity
      style={[
        styles.categoryItem,
        selectedCategory === item.id && styles.selectedCategoryItem
      ]}
      onPress={() => handleCategorySelect(item.id)}
    >
      <Icon
        name={getCategoryIcon(item.name)}
        size={24}
        color={selectedCategory === item.id ? COLORS.white : COLORS.primary}
      />
      <Text style={[
        styles.categoryName,
        selectedCategory === item.id && styles.selectedCategoryName
      ]}>
        {item.name}
      </Text>
    </TouchableOpacity>
  );

  const getCategoryIcon = (categoryName: string) => {
    const name = categoryName.toLowerCase();
    if (name.includes('electricity')) return 'bolt';
    if (name.includes('water')) return 'tint';
    if (name.includes('internet')) return 'wifi';
    if (name.includes('telecom') || name.includes('mobile')) return 'mobile';
    if (name.includes('tv') || name.includes('cable')) return 'television';
    if (name.includes('gas')) return 'fire';
    return 'building';
  };

  const renderBillerItem = ({ item }: { item: Biller }) => (
    <TouchableOpacity
      style={[
        styles.billerItem,
        selectedBiller?.id === item.id && styles.selectedBillerItem
      ]}
      onPress={() => handleBillerSelect(item)}
    >
      <Text style={[
        styles.billerName,
        selectedBiller?.id === item.id && styles.selectedBillerName
      ]}>
        {item.name}
      </Text>
      <Text style={styles.billerMinAmount}>
        Min: ${item.minimum_amount}
      </Text>
    </TouchableOpacity>
  );

  const renderPaymentHistoryItem = ({ item }: { item: BillPayment }) => (
    <View style={styles.paymentItem}>
      <View style={styles.paymentHeader}>
        <Text style={styles.paymentAmount}>${item.amount.toFixed(2)}</Text>
        <View style={[
          styles.statusBadge,
          { backgroundColor: getStatusColor(item.status) + '20' }
        ]}>
          <Text style={[
            styles.statusText,
            { color: getStatusColor(item.status) }
          ]}>
            {item.status}
          </Text>
        </View>
      </View>
      
      <View style={styles.paymentDetails}>
        <Text style={styles.paymentBiller}>{item.biller_name}</Text>
        <Text style={styles.paymentCategory}>{item.category_name}</Text>
        <Text style={styles.paymentMethod}>
          {item.payment_method === 'virtual_card' 
            ? `Card ending in ${item.card_number?.slice(-4)}` 
            : 'Account Balance'}
        </Text>
        <Text style={styles.paymentDate}>
          {new Date(item.created_at).toLocaleString()}
        </Text>
        {item.description && (
          <Text style={styles.paymentDescription}>{item.description}</Text>
        )}
      </View>
    </View>
  );

  const renderEmptyList = () => (
    <View style={styles.emptyContainer}>
      <Icon name="file-text-o" size={60} color={COLORS.textLight} />
      <Text style={styles.emptyText}>No bill payment history found</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Bill Payments</Text>
        <Text style={styles.headerSubtitle}>
          Pay all your bills in one place
        </Text>
      </View>
      
      <CustomButton 
        title="Pay a Bill" 
        onPress={() => setShowPayModal(true)}
        iconName="file-text-o"
        isFullWidth
      />
      
      {loading ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loaderText}>Loading your payment history...</Text>
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <Icon name="exclamation-circle" size={40} color={COLORS.danger} />
          <Text style={styles.errorText}>{error}</Text>
          <CustomButton 
            title="Try Again" 
            onPress={fetchPaymentHistory} 
            variant="outline"
          />
        </View>
      ) : (
        <FlatList
          data={paymentHistory}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderPaymentHistoryItem}
          ListEmptyComponent={renderEmptyList}
          contentContainerStyle={
            paymentHistory.length === 0 
              ? styles.emptyListContainer 
              : styles.paymentListContainer
          }
        />
      )}
      
      {/* Pay Bill Modal */}
      <Modal
        visible={showPayModal}
        animationType="slide"
        transparent
        onRequestClose={() => setShowPayModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Pay Bill</Text>
              <TouchableOpacity onPress={() => setShowPayModal(false)}>
                <Icon name="times" size={24} color={COLORS.textLight} />
              </TouchableOpacity>
            </View>
            
            <View style={styles.formGroup}>
              <Text style={styles.label}>Bill Category</Text>
              <FlatList
                data={categories}
                keyExtractor={(item) => item.id.toString()}
                renderItem={renderCategoryItem}
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.categoriesList}
              />
            </View>
            
            {selectedCategory && (
              <View style={styles.formGroup}>
                <Text style={styles.label}>Select Biller</Text>
                <FlatList
                  data={billers}
                  keyExtractor={(item) => item.id.toString()}
                  renderItem={renderBillerItem}
                  style={styles.billersList}
                  contentContainerStyle={
                    billers.length === 0 ? styles.emptyBillersList : undefined
                  }
                  ListEmptyComponent={
                    <Text style={styles.emptyBillersText}>
                      No billers found for this category
                    </Text>
                  }
                />
              </View>
            )}
            
            {selectedBiller && (
              <>
                <View style={styles.formGroup}>
                  <Text style={styles.label}>Amount</Text>
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
                  {selectedBiller.minimum_amount > 0 && (
                    <Text style={styles.inputHint}>
                      Minimum amount: ${selectedBiller.minimum_amount}
                    </Text>
                  )}
                  {selectedBiller.maximum_amount && (
                    <Text style={styles.inputHint}>
                      Maximum amount: ${selectedBiller.maximum_amount}
                    </Text>
                  )}
                </View>
                
                <View style={styles.formGroup}>
                  <Text style={styles.label}>Payment Method</Text>
                  <View style={styles.paymentMethodContainer}>
                    <TouchableOpacity
                      style={[
                        styles.paymentMethodOption,
                        paymentMethod === 'balance' && styles.selectedPaymentMethod
                      ]}
                      onPress={() => handlePaymentMethodChange('balance')}
                    >
                      <Icon 
                        name="money" 
                        size={20} 
                        color={paymentMethod === 'balance' ? COLORS.white : COLORS.primary} 
                      />
                      <Text style={[
                        styles.paymentMethodText,
                        paymentMethod === 'balance' && styles.selectedPaymentMethodText
                      ]}>
                        Account Balance
                      </Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity
                      style={[
                        styles.paymentMethodOption,
                        paymentMethod === 'virtual_card' && styles.selectedPaymentMethod
                      ]}
                      onPress={() => handlePaymentMethodChange('virtual_card')}
                    >
                      <Icon 
                        name="credit-card" 
                        size={20} 
                        color={paymentMethod === 'virtual_card' ? COLORS.white : COLORS.primary} 
                      />
                      <Text style={[
                        styles.paymentMethodText,
                        paymentMethod === 'virtual_card' && styles.selectedPaymentMethodText
                      ]}>
                        Virtual Card
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
                
                {paymentMethod === 'virtual_card' && virtualCards.length > 0 && (
                  <View style={styles.formGroup}>
                    <Text style={styles.label}>Select Card</Text>
                    {virtualCards.map(card => (
                      <TouchableOpacity 
                        key={card.id}
                        style={[
                          styles.cardOption,
                          selectedCard === card.id && styles.selectedCardOption
                        ]}
                        onPress={() => setSelectedCard(card.id)}
                      >
                        <View style={styles.cardOptionLeft}>
                          <Text style={styles.cardNumber}>
                            **** **** **** {card.card_number.slice(-4)}
                          </Text>
                          <Text style={styles.cardBalance}>
                            Balance: ${card.balance.toFixed(2)}
                          </Text>
                        </View>
                        {selectedCard === card.id && (
                          <Icon name="check" size={20} color={COLORS.primary} />
                        )}
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
                
                <View style={styles.formGroup}>
                  <Text style={styles.label}>Description (Optional)</Text>
                  <TextInput
                    style={globalStyles.input}
                    placeholder="Add a description"
                    placeholderTextColor={COLORS.textLight}
                    value={description}
                    onChangeText={setDescription}
                  />
                </View>
                
                <View style={styles.modalButtonContainer}>
                  {processingPayment ? (
                    <ActivityIndicator size="large" color={COLORS.primary} />
                  ) : (
                    <>
                      <CustomButton 
                        title="Pay Now" 
                        onPress={handlePayBill}
                        isFullWidth
                      />
                      <CustomButton 
                        title="Cancel" 
                        onPress={() => setShowPayModal(false)}
                        isFullWidth
                        variant="outline"
                      />
                    </>
                  )}
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
  paymentListContainer: {
    paddingTop: SIZES.spacing.md,
  },
  paymentItem: {
    backgroundColor: COLORS.cardDark,
    borderRadius: SIZES.radius.md,
    padding: SIZES.spacing.md,
    marginBottom: SIZES.spacing.md,
    ...SHADOWS.small,
  },
  paymentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SIZES.spacing.sm,
  },
  paymentAmount: {
    fontSize: SIZES.large,
    fontWeight: 'bold',
    color: COLORS.white,
  },
  statusBadge: {
    paddingHorizontal: SIZES.spacing.md,
    paddingVertical: SIZES.spacing.xs,
    borderRadius: SIZES.radius.sm,
  },
  statusText: {
    fontSize: SIZES.small,
    fontWeight: 'bold',
  },
  paymentDetails: {
    marginTop: SIZES.spacing.xs,
  },
  paymentBiller: {
    fontSize: SIZES.medium,
    fontWeight: '500',
    color: COLORS.white,
  },
  paymentCategory: {
    fontSize: SIZES.small,
    color: COLORS.textLight,
    marginBottom: SIZES.spacing.xs,
  },
  paymentMethod: {
    fontSize: SIZES.small,
    color: COLORS.textLight,
  },
  paymentDate: {
    fontSize: SIZES.small,
    color: COLORS.textLight,
    marginBottom: SIZES.spacing.xs,
  },
  paymentDescription: {
    fontSize: SIZES.small,
    fontStyle: 'italic',
    color: COLORS.textLight,
    marginTop: SIZES.spacing.xs,
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
    maxHeight: '80%',
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
  categoriesList: {
    padding: SIZES.spacing.xs,
  },
  categoryItem: {
    backgroundColor: COLORS.cardDark,
    padding: SIZES.spacing.md,
    borderRadius: SIZES.radius.md,
    marginRight: SIZES.spacing.sm,
    alignItems: 'center',
    minWidth: 100,
    ...SHADOWS.small,
  },
  selectedCategoryItem: {
    backgroundColor: COLORS.primary,
  },
  categoryName: {
    fontSize: SIZES.small,
    color: COLORS.white,
    marginTop: SIZES.spacing.sm,
    textAlign: 'center',
  },
  selectedCategoryName: {
    fontWeight: 'bold',
  },
  billersList: {
    maxHeight: 200,
  },
  billerItem: {
    backgroundColor: COLORS.cardDark,
    padding: SIZES.spacing.md,
    borderRadius: SIZES.radius.md,
    marginBottom: SIZES.spacing.sm,
    ...SHADOWS.small,
  },
  selectedBillerItem: {
    backgroundColor: 'rgba(0, 123, 255, 0.2)',
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  billerName: {
    fontSize: SIZES.medium,
    color: COLORS.white,
    marginBottom: SIZES.spacing.xs,
  },
  selectedBillerName: {
    fontWeight: 'bold',
  },
  billerMinAmount: {
    fontSize: SIZES.small,
    color: COLORS.textLight,
  },
  emptyBillersList: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SIZES.spacing.lg,
  },
  emptyBillersText: {
    fontSize: SIZES.medium,
    color: COLORS.textLight,
    textAlign: 'center',
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
  inputHint: {
    fontSize: SIZES.small,
    color: COLORS.textLight,
    marginTop: 4,
  },
  paymentMethodContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  paymentMethodOption: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.cardDark,
    padding: SIZES.spacing.md,
    marginHorizontal: SIZES.spacing.xs,
    borderRadius: SIZES.radius.md,
    ...SHADOWS.small,
  },
  selectedPaymentMethod: {
    backgroundColor: COLORS.primary,
  },
  paymentMethodText: {
    color: COLORS.white,
    marginLeft: SIZES.spacing.sm,
  },
  selectedPaymentMethodText: {
    fontWeight: 'bold',
  },
  cardOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.cardDark,
    padding: SIZES.spacing.md,
    borderRadius: SIZES.radius.md,
    marginBottom: SIZES.spacing.sm,
    ...SHADOWS.small,
  },
  selectedCardOption: {
    borderWidth: 1,
    borderColor: COLORS.primary,
    backgroundColor: 'rgba(0, 123, 255, 0.1)',
  },
  cardOptionLeft: {
    flex: 1,
  },
  cardNumber: {
    fontSize: SIZES.medium,
    color: COLORS.white,
    marginBottom: 4,
  },
  cardBalance: {
    fontSize: SIZES.small,
    color: COLORS.textLight,
  },
  modalButtonContainer: {
    marginTop: SIZES.spacing.md,
  }
});

export default BillsScreen;
