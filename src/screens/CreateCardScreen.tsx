import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, Alert, ActivityIndicator, TouchableOpacity } from 'react-native';
import { ScreenType } from '../navigation/types';
import { useAuth } from '../contexts/AuthContext';
import { ENDPOINTS, post } from '../utils/api';
import CustomButton from '../components/CustomButton';
import Icon from 'react-native-vector-icons/FontAwesome';
import globalStyles from '../styles/globalStyles';
import theme from '../styles/theme';

const { COLORS, SIZES, SHADOWS } = theme;

interface CreateCardScreenProps {
  onNavigate: (screen: ScreenType) => void;
}

const CreateCardScreen: React.FC<CreateCardScreenProps> = ({ onNavigate }) => {
  const { user } = useAuth();
  const [cardLimit, setCardLimit] = useState('');
  const [cardType, setCardType] = useState('standard');
  const [loading, setLoading] = useState(false);

  const handleCreateCard = async () => {
    if (!cardLimit || parseFloat(cardLimit) <= 0) {
      Alert.alert('Error', 'Please enter a valid card limit');
      return;
    }

    setLoading(true);

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
        Alert.alert(
          'Success',
          'Virtual card created successfully',
          [
            {
              text: 'View Cards',
              onPress: () => onNavigate('cards')
            }
          ]
        );
      } else {
        Alert.alert('Error', response.data.message || 'Failed to create card');
      }
    } catch (error) {
      console.error("Card creation error:", error);
      Alert.alert('Error', 'Network error or server unavailable');
    } finally {
      setLoading(false);
    }
  };

  const renderCardTypeOption = (type: string, label: string, icon: string, color: string) => (
    <TouchableOpacity
      style={[
        styles.cardTypeOption,
        cardType === type && { borderColor: color, backgroundColor: color + '10' }
      ]}
      onPress={() => setCardType(type)}
    >
      <View style={styles.cardTypeHeader}>
        <Icon name={icon} size={24} color={color} />
        <Text style={[styles.cardTypeLabel, { color }]}>{label}</Text>
      </View>
      
      <View style={styles.cardTypeContent}>
        <Text style={styles.cardTypeDescription}>
          {type === 'standard' 
            ? 'Basic features with standard limits and regular protection.' 
            : 'Premium features with higher limits and advanced protection.'}
        </Text>
      </View>
      
      {cardType === type && (
        <View style={[styles.selectedIndicator, { backgroundColor: color }]}>
          <Icon name="check" size={16} color={COLORS.white} />
        </View>
      )}
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.headerTitle}>Create Virtual Card</Text>
      <Text style={styles.headerSubtitle}>
        Create a new virtual card for online payments and transactions
      </Text>
      
      <View style={styles.formContainer}>
        <Text style={styles.sectionTitle}>Card Type</Text>
        <View style={styles.cardTypeContainer}>
          {renderCardTypeOption(
            'standard', 
            'Standard Card', 
            'credit-card', 
            COLORS.primary
          )}
          
          {renderCardTypeOption(
            'premium', 
            'Premium Card', 
            'diamond', 
            '#9C27B0'
          )}
        </View>
        
        <Text style={styles.sectionTitle}>Card Limit</Text>
        <View style={styles.formGroup}>
          <Text style={styles.label}>Set your card spending limit ($)</Text>
          <View style={styles.amountInputContainer}>
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
          <Text style={styles.limitHint}>
            {cardType === 'premium' 
              ? 'Premium cards can have higher limits (up to $50,000)' 
              : 'Standard cards typically have limits up to $10,000'}
          </Text>
        </View>
        
        <View style={styles.cardPreview}>
          <View style={[
            styles.cardPreviewInner, 
            { 
              backgroundColor: cardType === 'premium' ? '#9C27B0' : COLORS.primary,
              opacity: !cardLimit || parseFloat(cardLimit) <= 0 ? 0.5 : 1 
            }
          ]}>
            <View style={styles.cardPreviewHeader}>
              <Text style={styles.cardPreviewType}>
                {cardType === 'premium' ? 'PREMIUM' : 'STANDARD'}
              </Text>
              <Icon name="credit-card" size={24} color={COLORS.white} />
            </View>
            
            <Text style={styles.cardPreviewNumber}>
              **** **** **** ****
            </Text>
            
            <View style={styles.cardPreviewFooter}>
              <View>
                <Text style={styles.cardPreviewLabel}>LIMIT</Text>
                <Text style={styles.cardPreviewValue}>
                  ${cardLimit ? parseFloat(cardLimit).toFixed(2) : '0.00'}
                </Text>
              </View>
              <View>
                <Text style={styles.cardPreviewLabel}>EXPIRES</Text>
                <Text style={styles.cardPreviewValue}>Future Date</Text>
              </View>
            </View>
          </View>
        </View>
        
        {loading ? (
          <ActivityIndicator size="large" color={COLORS.primary} style={styles.loader} />
        ) : (
          <View style={styles.buttonsContainer}>
            <CustomButton
              title="Create Card"
              onPress={handleCreateCard}
              isFullWidth
              disabled={!cardLimit || parseFloat(cardLimit) <= 0}
            />
            
            <CustomButton
              title="Cancel"
              onPress={() => onNavigate('cards')}
              variant="outline"
              isFullWidth
            />
          </View>
        )}
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
  headerTitle: {
    fontSize: SIZES.xxLarge,
    fontWeight: 'bold',
    color: COLORS.white,
    marginBottom: SIZES.spacing.xs,
  },
  headerSubtitle: {
    fontSize: SIZES.medium,
    color: COLORS.textLight,
    marginBottom: SIZES.spacing.lg,
  },
  formContainer: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: SIZES.large,
    fontWeight: 'bold',
    color: COLORS.white,
    marginBottom: SIZES.spacing.md,
  },
  cardTypeContainer: {
    marginBottom: SIZES.spacing.lg,
    gap: SIZES.spacing.md,
  },
  cardTypeOption: {
    backgroundColor: COLORS.cardDark,
    borderRadius: SIZES.radius.md,
    padding: SIZES.spacing.md,
    borderWidth: 2,
    borderColor: 'transparent',
    ...SHADOWS.small,
  },
  cardTypeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SIZES.spacing.sm,
  },
  cardTypeLabel: {
    fontSize: SIZES.medium,
    fontWeight: 'bold',
    marginLeft: SIZES.spacing.sm,
  },
  cardTypeContent: {
    paddingLeft: SIZES.spacing.xl,
  },
  cardTypeDescription: {
    fontSize: SIZES.small,
    color: COLORS.textLight,
  },
  selectedIndicator: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  formGroup: {
    marginBottom: SIZES.spacing.lg,
  },
  label: {
    fontSize: SIZES.medium,
    color: COLORS.white,
    marginBottom: SIZES.spacing.sm,
  },
  amountInputContainer: {
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
  limitHint: {
    fontSize: SIZES.small,
    color: COLORS.textLight,
    marginTop: SIZES.spacing.xs,
  },
  cardPreview: {
    marginVertical: SIZES.spacing.lg,
    alignItems: 'center',
  },
  cardPreviewInner: {
    width: '100%',
    aspectRatio: 1.6,
    borderRadius: SIZES.radius.lg,
    padding: SIZES.spacing.lg,
    ...SHADOWS.medium,
  },
  cardPreviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SIZES.spacing.lg,
  },
  cardPreviewType: {
    color: COLORS.white,
    fontSize: SIZES.medium,
    fontWeight: 'bold',
  },
  cardPreviewNumber: {
    color: COLORS.white,
    fontSize: SIZES.large,
    fontWeight: 'bold',
    letterSpacing: 2,
    marginBottom: SIZES.spacing.lg,
  },
  cardPreviewFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 'auto',
  },
  cardPreviewLabel: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: SIZES.small,
    marginBottom: 4,
  },
  cardPreviewValue: {
    color: COLORS.white,
    fontSize: SIZES.medium,
  },
  loader: {
    marginTop: SIZES.spacing.lg,
  },
  buttonsContainer: {
    gap: SIZES.spacing.md,
  },
});

export default CreateCardScreen;
