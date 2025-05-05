import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, Alert, ActivityIndicator, TextInput } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import { ScreenType } from '../navigation/types';
import { useAuth } from '../contexts/AuthContext';
import { ENDPOINTS, get, post } from '../utils/api';
import CustomButton from '../components/CustomButton';
import globalStyles from '../styles/globalStyles';
import theme from '../styles/theme';

const { COLORS, SIZES, SHADOWS } = theme;

interface AdminScreenProps {
  onNavigate: (screen: ScreenType) => void;
}

interface User {
  id: number;
  username: string;
  account_number: string;
  balance: number;
  is_admin: boolean;
}

interface Loan {
  id: number;
  user_id: number;
  amount: number;
  status: string;
}

const AdminScreen: React.FC<AdminScreenProps> = ({ onNavigate }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Users
  const [users, setUsers] = useState<User[]>([]);
  const [pendingLoans, setPendingLoans] = useState<Loan[]>([]);
  
  // New admin form
  const [adminUsername, setAdminUsername] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [creating, setCreating] = useState(false);

  const fetchAdminData = async () => {
    if (!user || !user.isAdmin) {
      setError('You do not have administrative privileges');
      setLoading(false);
      return;
    }
    
    try {
      setLoading(true);
      
      // Fetch users
      const usersResponse = await get(
        ENDPOINTS.admin.users,
        user.token
      );
      
      if (usersResponse.ok && usersResponse.data.users) {
        setUsers(usersResponse.data.users);
      } else {
        setError(usersResponse.data.message || 'Failed to fetch users');
      }
      
      // Fetch pending loans
      const loansResponse = await get(
        ENDPOINTS.admin.pendingLoans,
        user.token
      );
      
      if (loansResponse.ok && loansResponse.data.loans) {
        setPendingLoans(loansResponse.data.loans);
      }
    } catch (error) {
      console.error("Admin data fetch error:", error);
      setError('Network error or server unavailable');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, [user]);

  const handleDeleteAccount = async (userId: number) => {
    try {
      const response = await post(
        ENDPOINTS.admin.deleteAccount(userId),
        {},
        user?.token
      );
      
      if (response.ok) {
        // Update local state to reflect deletion
        setUsers(users.filter(u => u.id !== userId));
        Alert.alert('Success', 'Account deleted successfully');
      } else {
        Alert.alert('Error', response.data.message || 'Failed to delete account');
      }
    } catch (error) {
      console.error("Account deletion error:", error);
      Alert.alert('Error', 'Network error or server unavailable');
    }
  };

  const handleApproveLoan = async (loanId: number) => {
    try {
      const response = await post(
        ENDPOINTS.admin.approveLoan(loanId),
        {},
        user?.token
      );
      
      if (response.ok) {
        // Update local state to reflect approval
        setPendingLoans(pendingLoans.filter(l => l.id !== loanId));
        Alert.alert('Success', 'Loan approved successfully');
      } else {
        Alert.alert('Error', response.data.message || 'Failed to approve loan');
      }
    } catch (error) {
      console.error("Loan approval error:", error);
      Alert.alert('Error', 'Network error or server unavailable');
    }
  };

  const handleCreateAdmin = async () => {
    if (!adminUsername || !adminPassword) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }
    
    setCreating(true);
    
    try {
      const response = await post(
        ENDPOINTS.admin.createAdmin,
        {
          username: adminUsername,
          password: adminPassword
        },
        user?.token
      );
      
      if (response.ok) {
        Alert.alert('Success', 'Admin account created successfully');
        setAdminUsername('');
        setAdminPassword('');
        
        // Refresh user list
        fetchAdminData();
      } else {
        Alert.alert('Error', response.data.message || 'Failed to create admin account');
      }
    } catch (error) {
      console.error("Admin creation error:", error);
      Alert.alert('Error', 'Network error or server unavailable');
    } finally {
      setCreating(false);
    }
  };

  const confirmDeleteAccount = (userId: number) => {
    Alert.alert(
      'Confirm Deletion',
      'Are you sure you want to delete this account? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: () => handleDeleteAccount(userId) }
      ]
    );
  };

  const confirmApproveLoan = (loanId: number) => {
    Alert.alert(
      'Confirm Approval',
      'Are you sure you want to approve this loan request?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Approve', onPress: () => handleApproveLoan(loanId) }
      ]
    );
  };

  const renderUserItem = ({ item }: { item: User }) => (
    <View style={styles.userItem}>
      <View style={styles.userDetails}>
        <Text style={styles.username}>
          {item.username} {item.is_admin && <Text style={styles.adminBadge}>(Admin)</Text>}
        </Text>
        <Text style={styles.accountDetails}>
          Account: {item.account_number}
        </Text>
        <Text style={styles.accountDetails}>
          Balance: ${item.balance.toFixed(2)}
        </Text>
      </View>
      
      <CustomButton
        title="Delete"
        onPress={() => confirmDeleteAccount(item.id)}
        variant="danger"
      />
    </View>
  );

  const renderLoanItem = ({ item }: { item: Loan }) => (
    <View style={styles.loanItem}>
      <View style={styles.loanDetails}>
        <Text style={styles.loanId}>Loan #{item.id}</Text>
        <Text style={styles.loanUser}>User ID: {item.user_id}</Text>
        <Text style={styles.loanAmount}>Amount: ${item.amount.toFixed(2)}</Text>
      </View>
      
      <CustomButton
        title="Approve"
        onPress={() => confirmApproveLoan(item.id)}
        variant="success"
      />
    </View>
  );

  if (!user?.isAdmin) {
    return (
      <View style={styles.container}>
        <View style={styles.unauthorizedContainer}>
          <Icon name="lock" size={60} color={COLORS.danger} />
          <Text style={styles.unauthorizedText}>
            You do not have permission to access this section
          </Text>
          <CustomButton
            title="Go to Dashboard"
            onPress={() => onNavigate('dashboard')}
            isFullWidth
          />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.headerTitle}>Admin Panel</Text>
      
      {loading ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loaderText}>Loading admin data...</Text>
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <Icon name="exclamation-circle" size={40} color={COLORS.danger} />
          <Text style={styles.errorText}>{error}</Text>
          <CustomButton 
            title="Try Again" 
            onPress={fetchAdminData} 
            variant="outline"
          />
        </View>
      ) : (
        <View style={styles.content}>
          {/* User Management Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>User Management</Text>
            <FlatList
              data={users}
              keyExtractor={(item) => item.id.toString()}
              renderItem={renderUserItem}
              ListEmptyComponent={
                <Text style={styles.emptyText}>No users found</Text>
              }
            />
          </View>
          
          {/* Create Admin Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Create Admin</Text>
            <View style={styles.formGroup}>
              <Text style={styles.label}>Username</Text>
              <TextInput
                style={globalStyles.input}
                placeholder="Enter username"
                placeholderTextColor={COLORS.textLight}
                value={adminUsername}
                onChangeText={setAdminUsername}
                autoCapitalize="none"
              />
            </View>
            
            <View style={styles.formGroup}>
              <Text style={styles.label}>Password</Text>
              <TextInput
                style={globalStyles.input}
                placeholder="Enter password"
                placeholderTextColor={COLORS.textLight}
                value={adminPassword}
                onChangeText={setAdminPassword}
                secureTextEntry
              />
            </View>
            
            {creating ? (
              <ActivityIndicator size="large" color={COLORS.primary} />
            ) : (
              <CustomButton
                title="Create Admin"
                onPress={handleCreateAdmin}
                isFullWidth
              />
            )}
          </View>
          
          {/* Pending Loans Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Pending Loans</Text>
            <FlatList
              data={pendingLoans}
              keyExtractor={(item) => item.id.toString()}
              renderItem={renderLoanItem}
              ListEmptyComponent={
                <Text style={styles.emptyText}>No pending loans</Text>
              }
            />
          </View>
        </View>
      )}
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
    marginBottom: SIZES.spacing.lg,
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
  content: {
    flex: 1,
  },
  section: {
    backgroundColor: COLORS.cardDark,
    borderRadius: SIZES.radius.md,
    padding: SIZES.spacing.lg,
    marginBottom: SIZES.spacing.lg,
    ...SHADOWS.medium,
  },
  sectionTitle: {
    fontSize: SIZES.large,
    fontWeight: 'bold',
    color: COLORS.white,
    marginBottom: SIZES.spacing.md,
  },
  formGroup: {
    marginBottom: SIZES.spacing.md,
  },
  label: {
    fontSize: SIZES.medium,
    color: COLORS.white,
    marginBottom: SIZES.spacing.xs,
  },
  userItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SIZES.spacing.md,
    marginBottom: SIZES.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  userDetails: {
    flex: 1,
  },
  username: {
    fontSize: SIZES.medium,
    fontWeight: 'bold',
    color: COLORS.white,
    marginBottom: SIZES.spacing.xs,
  },
  adminBadge: {
    color: COLORS.primary,
    fontStyle: 'italic',
  },
  accountDetails: {
    fontSize: SIZES.small,
    color: COLORS.textLight,
  },
  loanItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SIZES.spacing.md,
    marginBottom: SIZES.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  loanDetails: {
    flex: 1,
  },
  loanId: {
    fontSize: SIZES.medium,
    fontWeight: 'bold',
    color: COLORS.white,
    marginBottom: SIZES.spacing.xs,
  },
  loanUser: {
    fontSize: SIZES.small,
    color: COLORS.textLight,
  },
  loanAmount: {
    fontSize: SIZES.medium,
    color: COLORS.white,
  },
  unauthorizedContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SIZES.spacing.lg,
  },
  unauthorizedText: {
    fontSize: SIZES.medium,
    color: COLORS.danger,
    textAlign: 'center',
    marginVertical: SIZES.spacing.xl,
  },
  emptyText: {
    fontSize: SIZES.medium,
    color: COLORS.textLight,
    textAlign: 'center',
    padding: SIZES.spacing.md,
  },
});

export default AdminScreen;
