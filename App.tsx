// Updated App.tsx with a fixed top‑bar header and proper layout spacing

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  Button,
  StyleSheet,
  ScrollView,
  Alert,
  TouchableOpacity,
  Modal,
  SafeAreaView,
  Platform,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/FontAwesome';

const API_BASE = 'http://10.0.2.2:5000';
const HIDDEN_DEBUG_ENDPOINT = '/debug/users';
const HARDCODED_ADMIN = { username: 'admin', password: 'admin123' };

const App = () => {
  const [screen, setScreen] = useState<
    | 'login'
    | 'dashboard'
    | 'transactions'
    | 'profile'
    | 'transfer'
    | 'loans'
    | 'cards'
    | 'bills'
    | 'admin'
    | 'balance'
  >('login');
  const [menuVisible, setMenuVisible] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [jwt, setJwt] = useState<string | null>(null);
  const [accountNumber, setAccountNumber] = useState('');
  const [transactions, setTransactions] = useState<any[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem('jwt').then(token => {
      if (token) setJwt(token);
    });
  }, []);

  /*  ──────────────  Auth & API helpers  ────────────── */
  const login = async () => {
    try {
      const response = await fetch(`${API_BASE}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      const data = await response.json();
      if (response.ok && data.token) {
        setJwt(data.token);
        setIsAdmin(username.toLowerCase() === 'admin');
        await AsyncStorage.setItem('jwt', data.token);
        setScreen('dashboard');
      } else {
        Alert.alert('Login Failed', data.message || 'No token returned');
      }
    } catch {
      Alert.alert('Error', 'Unable to connect');
    }
  };

  const fetchTransactions = async () => {
    try {
      const res = await fetch(
        `${API_BASE}/api/transactions?account_number=${accountNumber}`,
        { headers: { Authorization: `Bearer ${jwt}` } },
      );
      const data = await res.json();
      if (res.ok) {
        setTransactions(data.transactions || []);
        setScreen('transactions');
      } else {
        Alert.alert('Error', data.message);
      }
    } catch {
      Alert.alert('Error', 'Network issue');
    }
  };

  /*  ──────────────  UI Helpers  ────────────── */
  const renderHeader = () => (
    <View style={styles.fixedTopBar}>
      <TouchableOpacity onPress={() => setScreen('dashboard')}>
        <Icon name="arrow-left" size={24} color="#ccc" style={{ marginRight: 12 }} />
      </TouchableOpacity>

      <Text style={styles.headerText}>🏦 Dashboard</Text>

      <TouchableOpacity onPress={() => setMenuVisible(true)}>
        <Icon name="bars" size={24} color="#fff" style={{ marginLeft: 12 }} />
      </TouchableOpacity>
    </View>
  );

  const renderMenu = () => (
    <Modal animationType="slide" transparent visible={menuVisible}>
      <View style={styles.menuContainer}>
        <View style={styles.menuBox}>
          {[
            { name: 'Profile', key: 'profile' },
            { name: 'Money Transfer', key: 'transfer' },
            { name: 'Loans', key: 'loans' },
            { name: 'Transaction History', key: 'transactions' },
            { name: 'Virtual Cards', key: 'cards' },
            { name: 'Bill Payments', key: 'bills' },
            { name: 'Check Balance', key: 'balance' },
            ...(isAdmin ? [{ name: 'Admin Panel', key: 'admin' }] : []),
          ].map(({ name, key }, i) => (
            <TouchableOpacity
              key={i}
              onPress={() => {
                setScreen(key as any);
                setMenuVisible(false);
              }}
            >
              <Text style={styles.menuItem}>{name}</Text>
            </TouchableOpacity>
          ))}

          <TouchableOpacity
            onPress={async () => {
              await AsyncStorage.removeItem('jwt');
              setJwt(null);
              setScreen('login');
              setMenuVisible(false);
            }}
          >
            <Text style={styles.logoutBtn}>Logout</Text>
          </TouchableOpacity>

          <Button title="Close" onPress={() => setMenuVisible(false)} />
        </View>
      </View>
    </Modal>
  );

  const renderPlaceholder = (label: string) => (
    <SafeAreaView style={styles.screen}>
      {renderHeader()}
      <View style={styles.headerSpacer} />
      <View style={styles.contentCenter}>
        <Text style={styles.title}>{label} Page Coming Soon</Text>
      </View>
      {renderMenu()}
    </SafeAreaView>
  );

  /*  ──────────────  Screens  ────────────── */

  // ─── Login ───────────────────────────────────────────
  if (screen === 'login') {
    return (
      <SafeAreaView style={styles.screen}>
        <View style={styles.contentCenter}>
          <Text style={styles.title}>🔐 Vuln Bank Login</Text>
          <TextInput
            style={styles.input}
            placeholder="Username"
            value={username}
            onChangeText={setUsername}
          />
          <TextInput
            style={styles.input}
            placeholder="Password"
            value={password}
            secureTextEntry
            onChangeText={setPassword}
          />
          <Button title="Login (Insecure)" onPress={login} />
          <Text style={styles.debugText}>{`Debug API: ${API_BASE}${HIDDEN_DEBUG_ENDPOINT}`}</Text>
          <Text style={styles.debugText}>{`Admin User: ${HARDCODED_ADMIN.username}/${HARDCODED_ADMIN.password}`}</Text>
        </View>
      </SafeAreaView>
    );
  }

  // ─── Dashboard ───────────────────────────────────────
  if (screen === 'dashboard') {
    return (
      <SafeAreaView style={styles.screen}>
        {renderHeader()}
        <View style={styles.headerSpacer} />
        <ScrollView contentContainerStyle={styles.contentCenter}>
          <TextInput
            style={styles.input}
            placeholder="Account Number"
            value={accountNumber}
            onChangeText={setAccountNumber}
          />
          <Button title="View Transactions" onPress={fetchTransactions} />
        </ScrollView>
        {renderMenu()}
      </SafeAreaView>
    );
  }

  // ─── Transactions ───────────────────────────────────
  if (screen === 'transactions') {
    return (
      <SafeAreaView style={styles.screen}>
        {renderHeader()}
        <View style={styles.headerSpacer} />
        <ScrollView contentContainerStyle={styles.contentCenter}>
          <Text style={styles.title}>📄 Transactions</Text>
          {transactions.map((tx, i) => (
            <View key={i} style={styles.result}>
              <Text style={styles.resultText}>From: {tx.from_account}</Text>
              <Text style={styles.resultText}>To: {tx.to_account}</Text>
              <Text style={styles.resultText}>Amount: ₦{tx.amount}</Text>
              <Text style={styles.resultText}>Type: {tx.transaction_type}</Text>
              <Text style={styles.resultText}>Time: {tx.timestamp}</Text>
            </View>
          ))}
        </ScrollView>
        {renderMenu()}
      </SafeAreaView>
    );
  }

  // ─── Other placeholder screens ───────────────────────
  return renderPlaceholder(screen.charAt(0).toUpperCase() + screen.slice(1));
};

/*  ──────────────  Styles  ────────────── */
const HEADER_HEIGHT = (Platform.OS === 'android' ? 40 : 60) + 10;

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#121212',
  },
  contentCenter: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  fixedTopBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    backgroundColor: '#121212',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingTop: Platform.OS === 'android' ? 40 : 60,
    paddingBottom: 10,
  },
  headerText: {
    color: '#fff',
    fontSize: 20,
    flex: 1,
    textAlign: 'center',
  },
  headerSpacer: {
    height: HEADER_HEIGHT,
  },
  title: {
    fontSize: 24,
    color: '#fff',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    backgroundColor: '#fff',
    padding: 10,
    marginBottom: 12,
    borderRadius: 6,
    width: '100%',
  },
  result: {
    backgroundColor: '#1f1f1f',
    padding: 15,
    marginTop: 20,
    borderRadius: 10,
    width: '100%',
  },
  resultText: {
    color: '#fff',
    marginBottom: 6,
  },
  debugText: {
    color: '#555',
    marginTop: 20,
    fontSize: 10,
    fontStyle: 'italic',
    textAlign: 'center',
  },
  menuContainer: {
    flex: 1,
    justifyContent: 'flex-start',
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  menuBox: {
    backgroundColor: '#fff',
    padding: 20,
    width: '80%',
    height: '100%',
  },
  menuItem: {
    fontSize: 18,
    marginBottom: 15,
  },
  logoutBtn: {
    color: 'red',
    fontWeight: 'bold',
    marginVertical: 15,
    fontSize: 16,
  },
});

export default App;
