import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import globalStyles from '../styles/globalStyles';
import theme from '../styles/theme';

const { COLORS } = theme;

interface HeaderProps {
  title?: string;
  onBackPress: () => void;
  onMenuPress: () => void;
}

const Header: React.FC<HeaderProps> = ({ 
  title = 'Vulnerable Bank', 
  onBackPress, 
  onMenuPress 
}) => {
  return (
    <View style={globalStyles.header}>
      <TouchableOpacity onPress={onBackPress}>
        <Icon name="arrow-left" size={24} color={COLORS.white} />
      </TouchableOpacity>
      
      <Text style={globalStyles.headerText}>
        {title}
      </Text>
      
      <TouchableOpacity onPress={onMenuPress}>
        <Icon name="bars" size={24} color={COLORS.white} />
      </TouchableOpacity>
    </View>
  );
};

export default Header;
