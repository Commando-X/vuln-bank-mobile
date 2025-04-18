import React, { useState, useEffect } from 'react';
import { SafeAreaView, StyleSheet, View, Text, TextInput, Button, Alert, Platform, FlatList, ActivityIndicator, TouchableOpacity, Modal } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/FontAwesome';

// Screen Components
const WelcomeScreen: React.FC<{ onLoginPress: () => void; onRegisterPress: () => void }> = ({ onLoginPress, onRegisterPress }) => (
  <View style={styles.centeredContainer}>
    <Text style={styles.title}>Welcome</Text>
    <CustomButton title="Login" onPress={onLoginPress} isFullWidth />
    <CustomButton title="Register" onPress={onRegisterPress} isFullWidth />
  </View>
);

const LoginScreen: React.FC<{ onLogin: (username: string, password: string) => void; onRegisterPress: () => void }> = ({ onLogin, onRegisterPress }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  return (
    <View style={styles.centeredContainer}>
      <Text style={styles.title}>Login</Text>
      <TextInput style={styles.input} placeholder="Username" value={username} onChangeText={setUsername} placeholderTextColor="#aaa" />
      <TextInput style={styles.input} placeholder="Password" value={password} onChangeText={setPassword} secureTextEntry placeholderTextColor="#aaa" />
      <CustomButton title="Login" onPress={() => onLogin(username, password)} isFullWidth />
      <CustomButton title="Register" onPress={onRegisterPress} isFullWidth />
    </View>
  );
};

const RegisterScreen: React.FC<{ onRegister: (username: string, password: string) => void; onLoginPress: () => void }> = ({ onRegister, onLoginPress }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  return (
    <View style={styles.centeredContainer}>
      <Text style={styles.title}>Register</Text>
      <TextInput style={styles.input} placeholder="Username" value={username} onChangeText={setUsername} placeholderTextColor="#aaa" />
      <TextInput style={styles.input} placeholder="Password" value={password} onChangeText={setPassword} secureTextEntry placeholderTextColor="#aaa" />
      <CustomButton title="Register" onPress={() => onRegister(username, password)} isFullWidth />
      <CustomButton title="Login" onPress={onLoginPress} isFullWidth />
    </View>
  );
};

const DashboardScreen: React.FC<{ username: string; onNavigate: (screen: ScreenType) => void }> = ({ username, onNavigate }) => {
  const dashboardButtons = [
    { title: 'Check Balance', icon: 'money', screen: 'balance' },
    { title: 'Transfer Money', icon: 'exchange', screen: 'transfer' },
    { title: 'Profile', icon: 'user', screen: 'profile' },
    { title: 'Transaction History', icon: 'history', screen: 'transactions' },
    { title: 'Loans', icon: 'hand-holding-usd', screen: 'loans' },
    { title: 'Virtual Cards', icon: 'credit-card', screen: 'cards' },
    { title: 'Bill Payments', icon: 'file-invoice', screen: 'bills' },
  ];

  return (
    <View style={styles.centeredContainer}>
      <Text style={styles.title}>Welcome, {username}</Text>
      <View style={styles.buttonGrid}>
        {dashboardButtons.map((btn, index) => (
          <CustomButton key={index} title={btn.title} iconName={btn.icon} onPress={() => onNavigate(btn.screen as ScreenType)} />
        ))}
      </View>
    </View>
  );
};

const BalanceScreen: React.FC<{ jwt: string; accountNumber: string }> = ({ jwt, accountNumber }) => {
  const [balance, setBalance] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBalance = async () => {
      try {
        const response = await fetch(`${API_BASE}/check_balance/${accountNumber}`, {
          headers: { Authorization: `Bearer ${jwt}` },
        });
        const data = await response.json();
        if (response.ok) setBalance(data.balance);
        else setError(data.message || 'Failed to fetch balance');
      } catch {
        setError('Network error');
      } finally {
        setLoading(false);
      }
    };
    fetchBalance();
  }, [jwt, accountNumber]);

  if (loading) return <Text style={styles.loadingText}>Loading...</Text>;
  if (error) return <Text style={styles.errorText}>{error}</Text>;
  return (
    <View style={styles.centeredContainer}>
      <Text style={styles.title}>Account Balance</Text>
      <Text style={styles.balanceText}>₦{balance?.toFixed(2)}</Text>
    </View>
  );
};

const TransferScreen: React.FC<{ jwt: string; accountNumber: string }> = ({ jwt, accountNumber }) => {
  const [toAccount, setToAccount] = useState('');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');

  const handleTransfer = async () => {
    if (!toAccount || !amount) return Alert.alert('Error', 'Please fill in all required fields');
    try {
      const response = await fetch(`${API_BASE}/transfer`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${jwt}` },
        body: JSON.stringify({ from_account: accountNumber, to_account: toAccount, amount: parseFloat(amount), description }),
      });
      const data = await response.json();
      Alert.alert(response.ok ? 'Success' : 'Error', response.ok ? 'Transfer completed successfully' : data.message || 'Transfer failed');
    } catch {
      Alert.alert('Error', 'Unable to connect');
    }
  };

  return (
    <View style={styles.centeredContainer}>
      <Text style={styles.title}>Money Transfer</Text>
      <TextInput style={styles.input} placeholder="To Account Number" value={toAccount} onChangeText={setToAccount} placeholderTextColor="#aaa" />
      <TextInput style={styles.input} placeholder="Amount" value={amount} onChangeText={setAmount} keyboardType="numeric" placeholderTextColor="#aaa" />
      <TextInput style={styles.input} placeholder="Description (optional)" value={description} onChangeText={setDescription} placeholderTextColor="#aaa" />
      <CustomButton title="Transfer" onPress={handleTransfer} isFullWidth />
    </View>
  );
};

const ProfileScreen: React.FC<{ jwt: string; username: string }> = ({ jwt, username }) => (
  <View style={styles.centeredContainer}>
    <Text style={styles.title}>Profile</Text>
    <Text style={styles.username}>Username: {username}</Text>
  </View>
);

const TransactionsScreen: React.FC<{ jwt: string; accountNumber: string }> = ({ jwt, accountNumber }) => {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const response = await fetch(`${API_BASE}/transactions/${accountNumber}`, {
          headers: { Authorization: `Bearer ${jwt}` },
        });
        const data = await response.json();
        if (response.ok) setTransactions(data.transactions);
        else setError(data.message || 'Failed to fetch transactions');
      } catch {
        setError('Network error');
      } finally {
        setLoading(false);
      }
    };
    fetchTransactions();
  }, [jwt, accountNumber]);

  if (loading) return <ActivityIndicator size="large" color="#fff" />;
  if (error) return <Text style={styles.errorText}>{error}</Text>;
  return (
    <View style={styles.centeredContainer}>
      <Text style={styles.title}>Transaction History</Text>
      <FlatList
        data={transactions}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.transactionItem}>
            <Text>From: {item.from_account}</Text>
            <Text>To: {item.to_account}</Text>
            <Text>Amount: ₦{item.amount}</Text>
            <Text>Time: {item.timestamp}</Text>
          </View>
        )}
      />
    </View>
  );
};

const LoansScreen: React.FC<{ jwt: string }> = ({ jwt }) => {
  const [amount, setAmount] = useState('');

  const handleRequestLoan = async () => {
    if (!amount) return Alert.alert('Error', 'Please enter an amount');
    try {
      const response = await fetch(`${API_BASE}/request_loan`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${jwt}` },
        body: JSON.stringify({ amount: parseFloat(amount) }),
      });
      const data = await response.json();
      Alert.alert(response.ok ? 'Success' : 'Error', response.ok ? 'Loan request submitted' : data.message || 'Request failed');
    } catch {
      Alert.alert('Error', 'Unable to connect');
    }
  };

  return (
    <View style={styles.centeredContainer}>
      <Text style={styles.title}>Request a Loan</Text>
      <TextInput style={styles.input} placeholder="Loan Amount" value={amount} onChangeText={setAmount} keyboardType="numeric" placeholderTextColor="#aaa" />
      <CustomButton title="Request Loan" onPress={handleRequestLoan} isFullWidth />
    </View>
  );
};

const CardsScreen: React.FC<{ jwt: string }> = ({ jwt }) => {
  const [cards, setCards] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCards = async () => {
      try {
        const response = await fetch(`${API_BASE}/api/virtual-cards`, {
          headers: { Authorization: `Bearer ${jwt}` },
        });
        const data = await response.json();
        if (response.ok) setCards(data.cards);
        else setError(data.message || 'Failed to fetch cards');
      } catch {
        setError('Network error');
      } finally {
        setLoading(false);
      }
    };
    fetchCards();
  }, [jwt]);

  const handleCreateCard = async () => {
    try {
      const response = await fetch(`${API_BASE}/api/virtual-cards/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${jwt}` },
        body: JSON.stringify({ card_limit: 1000, card_type: 'standard' }), // Default values
      });
      const data = await response.json();
      if (response.ok) {
        setCards([...cards, data.card_details]);
        Alert.alert('Success', 'Card created successfully');
      } else {
        Alert.alert('Error', data.message || 'Failed to create card');
      }
    } catch {
      Alert.alert('Error', 'Unable to connect');
    }
  };

  if (loading) return <ActivityIndicator size="large" color="#fff" />;
  if (error) return <Text style={styles.errorText}>{error}</Text>;
  return (
    <View style={styles.centeredContainer}>
      <Text style={styles.title}>Virtual Cards</Text>
      <FlatList
        data={cards}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.cardItem}>
            <Text>Card Number: {item.card_number}</Text>
            <Text>CVV: {item.cvv}</Text>
            <Text>Expiry: {item.expiry_date}</Text>
          </View>
        )}
      />
      <CustomButton title="Create New Card" onPress={handleCreateCard} isFullWidth />
    </View>
  );
};

const BillsScreen: React.FC<{ jwt: string }> = ({ jwt }) => {
  const [categories, setCategories] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [billers, setBillers] = useState<any[]>([]);
  const [selectedBiller, setSelectedBiller] = useState<number | null>(null);
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch(`${API_BASE}/api/bill-categories`, {
          headers: { Authorization: `Bearer ${jwt}` },
        });
        const data = await response.json();
        if (response.ok) setCategories(data.categories);
        else setError(data.message || 'Failed to fetch categories');
      } catch {
        setError('Network error');
      } finally {
        setLoading(false);
      }
    };
    fetchCategories();
  }, [jwt]);

  const fetchBillers = async (categoryId: number) => {
    try {
      const response = await fetch(`${API_BASE}/api/billers/by-category/${categoryId}`, {
        headers: { Authorization: `Bearer ${jwt}` },
      });
      const data = await response.json();
      if (response.ok) setBillers(data.billers);
      else setError(data.message || 'Failed to fetch billers');
    } catch {
      setError('Network error');
    }
  };

  const handleSelectCategory = (categoryId: number) => {
    setSelectedCategory(categoryId);
    fetchBillers(categoryId);
  };

  const handlePayBill = async () => {
    if (!selectedBiller || !amount) return Alert.alert('Error', 'Please select a biller and enter an amount');
    try {
      const response = await fetch(`${API_BASE}/api/bill-payments/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${jwt}` },
        body: JSON.stringify({ biller_id: selectedBiller, amount: parseFloat(amount), payment_method: 'balance' }),
      });
      const data = await response.json();
      Alert.alert(response.ok ? 'Success' : 'Error', response.ok ? 'Payment successful' : data.message || 'Payment failed');
    } catch {
      Alert.alert('Error', 'Unable to connect');
    }
  };

  if (loading) return <ActivityIndicator size="large" color="#fff" />;
  if (error) return <Text style={styles.errorText}>{error}</Text>;
  return (
    <View style={styles.centeredContainer}>
      <Text style={styles.title}>Bill Payments</Text>
      {!selectedCategory ? (
        <FlatList
          data={categories}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <CustomButton title={item.name} onPress={() => handleSelectCategory(item.id)} isFullWidth />
          )}
        />
      ) : !selectedBiller ? (
        <FlatList
          data={billers}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <CustomButton title={item.name} onPress={() => setSelectedBiller(item.id)} isFullWidth />
          )}
        />
      ) : (
        <View>
          <TextInput style={styles.input} placeholder="Amount" value={amount} onChangeText={setAmount} keyboardType="numeric" placeholderTextColor="#aaa" />
          <CustomButton title="Pay Bill" onPress={handlePayBill} isFullWidth />
        </View>
      )}
    </View>
  );
};

const AdminScreen: React.FC<{ jwt: string }> = ({ jwt }) => {
  const [newAdminUsername, setNewAdminUsername] = useState('');
  const [newAdminPassword, setNewAdminPassword] = useState('');
  const [userIdToDelete, setUserIdToDelete] = useState('');

  const handleCreateAdmin = async () => {
    if (!newAdminUsername || !newAdminPassword) return Alert.alert('Error', 'Please enter username and password');
    try {
      const response = await fetch(`${API_BASE}/admin/create_admin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${jwt}` },
        body: JSON.stringify({ username: newAdminUsername, password: newAdminPassword }),
      });
      const data = await response.json();
      Alert.alert(response.ok ? 'Success' : 'Error', response.ok ? 'Admin created successfully' : data.message || 'Failed to create admin');
    } catch {
      Alert.alert('Error', 'Unable to connect');
    }
  };

  const handleDeleteAccount = async () => {
    if (!userIdToDelete) return Alert.alert('Error', 'Please enter a user ID');
    try {
      const response = await fetch(`${API_BASE}/admin/delete_account/${userIdToDelete}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${jwt}` },
      });
      const data = await response.json();
      Alert.alert(response.ok ? 'Success' : 'Error', response.ok ? 'Account deleted successfully' : data.message || 'Failed to delete account');
    } catch {
      Alert.alert('Error', 'Unable to connect');
    }
  };

  return (
    <View style={styles.centeredContainer}>
      <Text style={styles.title}>Admin Panel</Text>
      <Text style={styles.subtitle}>Create New Admin</Text>
      <TextInput style={styles.input} placeholder="Username" value={newAdminUsername} onChangeText={setNewAdminUsername} placeholderTextColor="#aaa" />
      <TextInput style={styles.input} placeholder="Password" value={newAdminPassword} onChangeText={setNewAdminPassword} secureTextEntry placeholderTextColor="#aaa" />
      <CustomButton title="Create Admin" onPress={handleCreateAdmin} isFullWidth />
      <Text style={styles.subtitle}>Delete Account</Text>
      <TextInput style={styles.input} placeholder="User ID" value={userIdToDelete} onChangeText={setUserIdToDelete} keyboardType="numeric" placeholderTextColor="#aaa" />
      <CustomButton title="Delete Account" onPress={handleDeleteAccount} isFullWidth />
    </View>
  );
};

// Reusable Components
const CustomButton: React.FC<{ title: string; onPress: () => void; iconName?: string; isFullWidth?: boolean }> = ({ title, onPress, iconName, isFullWidth = false }) => {
  const buttonStyle = isFullWidth ? styles.fullWidthButton : styles.customButton;
  return (
    <TouchableOpacity style={buttonStyle} onPress={onPress}>
      {iconName && <Icon name={iconName} size={40} color="#fff" style={styles.buttonIcon} />}
      <Text style={styles.buttonText}>{title}</Text>
    </TouchableOpacity>
  );
};

const Header: React.FC<{ onBackPress: () => void; onMenuPress: () => void }> = ({ onBackPress, onMenuPress }) => (
  <View style={styles.header}>
    <TouchableOpacity onPress={onBackPress}>
      <Icon name="arrow-left" size={24} color="#fff" />
    </TouchableOpacity>
    <Text style={styles.headerText}>🏦 Dashboard</Text>
    <TouchableOpacity onPress={onMenuPress}>
      <Icon name="bars" size={24} color="#fff" />
    </TouchableOpacity>
  </View>
);

const MenuModal: React.FC<{ visible: boolean; onClose: () => void; onMenuItemPress: (key: string) => void; isAdmin: boolean; onLogout: () => void }> = ({ visible, onClose, onMenuItemPress, isAdmin, onLogout }) => (
  <Modal animationType="slide" transparent visible={visible}>
    <View style={styles.menuContainer}>
      <View style={styles.menuBox}>
        <TouchableOpacity onPress={() => onMenuItemPress('profile')}><Text style={styles.menuText}>Profile</Text></TouchableOpacity>
        <TouchableOpacity onPress={() => onMenuItemPress('transfer')}><Text style={styles.menuText}>Money Transfer</Text></TouchableOpacity>
        <TouchableOpacity onPress={() => onMenuItemPress('loans')}><Text style={styles.menuText}>Loans</Text></TouchableOpacity>
        <TouchableOpacity onPress={() => onMenuItemPress('transactions')}><Text style={styles.menuText}>Transaction History</Text></TouchableOpacity>
        <TouchableOpacity onPress={() => onMenuItemPress('cards')}><Text style={styles.menuText}>Virtual Cards</Text></TouchableOpacity>
        <TouchableOpacity onPress={() => onMenuItemPress('bills')}><Text style={styles.menuText}>Bill Payments</Text></TouchableOpacity>
        <TouchableOpacity onPress={() => onMenuItemPress('balance')}><Text style={styles.menuText}>Check Balance</Text></TouchableOpacity>
        {isAdmin && <TouchableOpacity onPress={() => onMenuItemPress('admin')}><Text style={styles.menuText}>Admin Panel</Text></TouchableOpacity>}
        <TouchableOpacity onPress={onLogout}><Text style={styles.logoutBtn}>Logout</Text></TouchableOpacity>
        <Button title="Close" onPress={onClose} />
      </View>
    </View>
  </Modal>
);

// Main App Component
const API_BASE = 'https://vuln-bank-deploy.onrender.com';
const HEADER_HEIGHT = Platform.OS === 'android' ? 50 : 70;

type ScreenType = 'welcome' | 'login' | 'register' | 'dashboard' | 'transactions' | 'loans' | 'cards' | 'bills' | 'admin' | 'balance' | 'transfer' | 'profile';

const App = () => {
  const [screen, setScreen] = useState<ScreenType>('welcome');
  const [menuVisible, setMenuVisible] = useState(false);
  const [username, setUsername] = useState('');
  const [jwt, setJwt] = useState<string | null>(null);
  const [accountNumber, setAccountNumber] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem('jwt').then(token => {
      if (token) {
        setJwt(token);
        setScreen('dashboard');
      }
    });
  }, []);

  const handleLogin = async (username: string, password: string) => {
    try {
      const response = await fetch(`${API_BASE}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      const data = await response.json();
      if (response.ok && data.token) {
        setJwt(data.token);
        setUsername(username);
        setIsAdmin(username.toLowerCase() === 'admin');
        await AsyncStorage.setItem('jwt', data.token);
        setAccountNumber(data.accountNumber || 'ADMIN001'); // Mocked for simplicity
        setScreen('dashboard');
      } else {
        Alert.alert('Login Failed', data.message || 'No token returned');
      }
    } catch {
      Alert.alert('Error', 'Unable to connect');
    }
  };

  const handleRegister = async (username: string, password: string) => {
    try {
      const response = await fetch(`${API_BASE}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      const data = await response.json();
      if (response.ok) {
        Alert.alert('Success', 'Registration complete. You can now login.');
        setScreen('login');
      } else {
        Alert.alert('Failed', data.message || 'Registration failed');
      }
    } catch {
      Alert.alert('Error', 'Unable to connect');
    }
  };

  const handleLogout = async () => {
    await AsyncStorage.removeItem('jwt');
    setJwt(null);
    setUsername('');
    setAccountNumber('');
    setScreen('login');
    setMenuVisible(false);
  };

  const renderScreen = () => {
    switch (screen) {
      case 'welcome': return <WelcomeScreen onLoginPress={() => setScreen('login')} onRegisterPress={() => setScreen('register')} />;
      case 'login': return <LoginScreen onLogin={handleLogin} onRegisterPress={() => setScreen('register')} />;
      case 'register': return <RegisterScreen onRegister={handleRegister} onLoginPress={() => setScreen('login')} />;
      case 'dashboard': return <DashboardScreen username={username} onNavigate={setScreen} />;
      case 'balance': return <BalanceScreen jwt={jwt!} accountNumber={accountNumber} />;
      case 'transfer': return <TransferScreen jwt={jwt!} accountNumber={accountNumber} />;
      case 'profile': return <ProfileScreen jwt={jwt!} username={username} />;
      case 'transactions': return <TransactionsScreen jwt={jwt!} accountNumber={accountNumber} />;
      case 'loans': return <LoansScreen jwt={jwt!} />;
      case 'cards': return <CardsScreen jwt={jwt!} />;
      case 'bills': return <BillsScreen jwt={jwt!} />;
      case 'admin': return <AdminScreen jwt={jwt!} />;
      default: return <Text>Unknown Screen</Text>;
    }
  };

  const isAuthenticatedScreen = !['welcome', 'login', 'register'].includes(screen);

  return (
    <SafeAreaView style={styles.screen}>
      {isAuthenticatedScreen && <Header onBackPress={() => setScreen('dashboard')} onMenuPress={() => setMenuVisible(true)} />}
      <View style={isAuthenticatedScreen ? styles.contentWithHeader : styles.centeredContainer}>
        {renderScreen()}
      </View>
      {isAuthenticatedScreen && (
        <MenuModal
          visible={menuVisible}
          onClose={() => setMenuVisible(false)}
          onMenuItemPress={(key) => { setScreen(key as ScreenType); setMenuVisible(false); }}
          isAdmin={isAdmin}
          onLogout={handleLogout}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#121212' },
  centeredContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  contentWithHeader: { marginTop: HEADER_HEIGHT, flex: 1 },
  title: { fontSize: 32, color: '#fff', marginBottom: 30, textAlign: 'center' },
  input: { backgroundColor: '#333', color: '#fff', padding: 10, marginBottom: 15, borderRadius: 5, width: '100%', fontSize: 16 },
  header: { position: 'absolute', top: 0, left: 0, right: 0, backgroundColor: '#121212', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 15, paddingTop: Platform.OS === 'android' ? 40 : 60, paddingBottom: 10, zIndex: 10 },
  headerText: { color: '#fff', fontSize: 20, flex: 1, textAlign: 'center' },
  menuContainer: { flex: 1, justifyContent: 'flex-start', backgroundColor: 'rgba(0,0,0,0.4)' },
  menuBox: { backgroundColor: '#fff', padding: 20, width: '80%', height: '100%' },
  menuText: { fontSize: 18, marginBottom: 15 },
  logoutBtn: { color: 'red', fontWeight: 'bold', marginVertical: 15, fontSize: 16 },
  buttonGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', marginTop: 20 },
  customButton: { backgroundColor: '#007AFF', width: 100, height: 100, borderRadius: 10, justifyContent: 'center', alignItems: 'center', margin: 10 },
  fullWidthButton: { backgroundColor: '#007AFF', paddingVertical: 15, borderRadius: 5, alignItems: 'center', marginBottom: 10, width: '100%' },
  buttonText: { color: '#fff', fontSize: 16, textAlign: 'center' },
  buttonIcon: { marginBottom: 5 },
  balanceText: { fontSize: 32, color: '#fff', fontWeight: 'bold' },
  username: { fontSize: 18, color: '#fff', marginBottom: 20 },
  loadingText: { color: '#fff', textAlign: 'center' },
  errorText: { color: 'red', textAlign: 'center' },
  transactionItem: { backgroundColor: '#1f1f1f', padding: 15, marginBottom: 10, borderRadius: 10 },
  cardItem: { backgroundColor: '#1f1f1f', padding: 15, marginBottom: 10, borderRadius: 10 },
  subtitle: { fontSize: 18, color: '#fff', marginTop: 20, marginBottom: 10 },
});

export default App;