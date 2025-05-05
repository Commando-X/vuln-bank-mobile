import React from 'react';
import { Modal, View, Text, TouchableOpacity } from 'react-native';
import CustomButton from './CustomButton';
import globalStyles from '../styles/globalStyles';
import theme from '../styles/theme';

const { COLORS } = theme;

interface MenuModalProps {
  visible: boolean;
  onClose: () => void;
  onMenuItemPress: (key: string) => void;
  isAdmin: boolean;
  onLogout: () => void;
}

const MenuModal: React.FC<MenuModalProps> = ({ 
  visible, 
  onClose, 
  onMenuItemPress, 
  isAdmin, 
  onLogout 
}) => {
  const menuItems = [
    { key: 'profile', label: 'Profile' },
    { key: 'transfer', label: 'Money Transfer' },
    { key: 'loans', label: 'Loans' },
    { key: 'transactions', label: 'Transaction History' },
    { key: 'cards', label: 'Virtual Cards' },
    { key: 'bills', label: 'Bill Payments' },
    { key: 'balance', label: 'Check Balance' },
  ];

  // Admin-only menu item
  if (isAdmin) {
    menuItems.push({ key: 'admin', label: 'Admin Panel' });
  }

  return (
    <Modal 
      animationType="slide"
      transparent
      visible={visible}
    >
      <View style={globalStyles.menuContainer}>
        <View style={globalStyles.menuContent}>
          {menuItems.map((item) => (
            <TouchableOpacity 
              key={item.key} 
              style={globalStyles.menuItem} 
              onPress={() => onMenuItemPress(item.key)}
            >
              <Text style={globalStyles.menuItemText}>{item.label}</Text>
            </TouchableOpacity>
          ))}
          
          <TouchableOpacity 
            style={[globalStyles.menuItem, globalStyles.logoutButton]} 
            onPress={onLogout}
          >
            <Text style={globalStyles.logoutText}>Logout</Text>
          </TouchableOpacity>
          
          <CustomButton 
            title="Close" 
            onPress={onClose} 
          />
        </View>
      </View>
    </Modal>
  );
};

export default MenuModal;
