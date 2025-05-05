import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, Alert, ActivityIndicator, ScrollView } from 'react-native';
import CustomButton from '../components/CustomButton';
import { ScreenType } from '../navigation/types';
import { useAuth } from '../contexts/AuthContext';
import { ENDPOINTS, post } from '../utils/api';
import globalStyles from '../styles/globalStyles';
import theme from '../styles/theme';

const { COLORS, SIZES, SHADOWS } = theme;

interface TransferScreenProps {
  onNavigate: (screen: ScreenType) => void;
  params?: {
    prefillRecipient?: string;
    prefillAmount?: number;
  };
}

const TransferScreen: React.FC<TransferScreenProps> = ({ onNavigate, params }) => {
  const { user } = useAuth();
  const [toAccount, setToAccount] = useState(params?.prefillRecipient || '');
  const [amount, setAmount] = useState(params?.prefillAmount ? params.prefillAmount.toString() : '');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);

  const handleTransfer = async () => {
    if (!toAccount || !amount) {
      Alert.alert('Error', 'Please enter recipient account and amount');
      return;
    }

    if (isNaN(parseFloat(amount))) {
      Alert.alert('Error', 'Amount must be a valid number');
      return;
    }

    setLoading(true);

    try {
      const response = await post(
        ENDPOINTS.transfer,
        {
          from_account: user?.accountNumber,
          to_account: toAccount,
          amount: parseFloat(amount),
          description: description || 'Transfer from mobile app'
        },
        user?.token
      );

      if (response.ok) {
        Alert.alert(
          'Success',
          `Transfer of $${amount} to account ${toAccount} was successful!`,
          [{ text: 'OK', onPress: () => onNavigate('dashboard') }]
        );
      } else {
        Alert.alert('Transfer Failed', response.data.message || 'Transfer could not be completed');
      }
    } catch (error) {
      Alert.alert('Error', 'Network error or server unavailable');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView 
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      keyboardShouldPersistTaps="handled"
    >
      <View style={styles.card}>
        <Text style={styles.title}>Money Transfer</Text>
        
        <View style={styles.formGroup}>
          <Text style={styles.label}>From Account</Text>
          <View style={styles.disabledInput}>
            <Text style={styles.disabledText}>{user?.accountNumber || 'Loading...'}</Text>
          </View>
        </View>
        
        <View style={styles.formGroup}>
          <Text style={styles.label}>To Account</Text>
          <TextInput
            style={globalStyles.input}
            placeholder="Enter recipient's account number"
            placeholderTextColor={COLORS.textLight}
            value={toAccount}
            onChangeText={setToAccount}
            keyboardType="numeric"
            autoCapitalize="none"
          />
        </View>
        
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
        </View>
        
        <View style={styles.formGroup}>
          <Text style={styles.label}>Description (Optional)</Text>
          <TextInput
            style={globalStyles.input}
            placeholder="Enter transfer description"
            placeholderTextColor={COLORS.textLight}
            value={description}
            onChangeText={setDescription}
            multiline
          />
        </View>
        
        {loading ? (
          <ActivityIndicator size="large" color={COLORS.primary} style={styles.loader} />
        ) : (
          <View style={styles.buttonContainer}>
            <CustomButton
              title="Transfer"
              onPress={handleTransfer}
              isFullWidth
            />
            <CustomButton
              title="Cancel"
              onPress={() => onNavigate('dashboard')}
              isFullWidth
              variant="outline"
            />
          </View>
        )}
      </View>
      
      <View style={styles.infoCard}>
        <Text style={styles.infoTitle}>Transfer Information</Text>
        <Text style={styles.infoText}>
          • Transfers are processed immediately
        </Text>
        <Text style={styles.infoText}>
          • Daily transfer limit: $10,000
        </Text>
        <Text style={styles.infoText}>
          • Must have sufficient funds in your account
        </Text>
        <Text style={styles.infoText}>
          • Double-check recipient account number
        </Text>
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
  card: {
    backgroundColor: COLORS.cardDark,
    borderRadius: SIZES.radius.md,
    padding: SIZES.spacing.lg,
    marginBottom: SIZES.spacing.lg,
    ...SHADOWS.medium,
  },
  title: {
    fontSize: SIZES.large,
    fontWeight: 'bold',
    color: COLORS.white,
    marginBottom: SIZES.spacing.lg,
    textAlign: 'center',
  },
  formGroup: {
    marginBottom: SIZES.spacing.md,
  },
  label: {
    fontSize: SIZES.medium,
    color: COLORS.white,
    marginBottom: SIZES.spacing.xs,
  },
  disabledInput: {
    backgroundColor: COLORS.backgroundDark,
    padding: SIZES.spacing.md,
    borderRadius: SIZES.radius.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  disabledText: {
    color: COLORS.textLight,
    fontSize: SIZES.medium,
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
  buttonContainer: {
    marginTop: SIZES.spacing.md,
  },
  infoCard: {
    backgroundColor: 'rgba(0, 123, 255, 0.1)',
    borderRadius: SIZES.radius.md,
    padding: SIZES.spacing.lg,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.primary,
  },
  infoTitle: {
    fontSize: SIZES.medium,
    fontWeight: 'bold',
    color: COLORS.white,
    marginBottom: SIZES.spacing.md,
  },
  infoText: {
    fontSize: SIZES.medium,
    color: COLORS.textLight,
    marginBottom: SIZES.spacing.sm,
  },
});

export default TransferScreen;
