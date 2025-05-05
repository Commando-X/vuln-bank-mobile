import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import theme from '../styles/theme';
import globalStyles from '../styles/globalStyles';

const { COLORS, SIZES } = theme;

interface CustomButtonProps {
  title: string;
  onPress: () => void;
  iconName?: string;
  isFullWidth?: boolean;
  variant?: 'primary' | 'secondary' | 'danger' | 'outline';
}

const CustomButton: React.FC<CustomButtonProps> = ({ 
  title, 
  onPress, 
  iconName, 
  isFullWidth = false,
  variant = 'primary'
}) => {
  const getButtonStyle = () => {
    // const baseStyle = isFullWidth ? globalStyles.fullWidthButton : globalStyles.button;
    const stylesArray: any[] = [globalStyles.button];

    if (isFullWidth) {
        stylesArray.push({ alignSelf: 'stretch', width: '100%' });
      }
    
      if (variant === 'outline') {
        stylesArray.push(globalStyles.outlineButton);
      } else {
        stylesArray.push({
          backgroundColor: {
            primary: COLORS.primary,
            secondary: COLORS.secondary,
            danger: COLORS.danger,
          }[variant],
        });
      }
      return stylesArray;
    };  

//     if (variant === 'outline') {
//       return [baseStyle, globalStyles.outlineButton];
//     }
    
//     // Color variants
//     const variantStyles: Record<string, object> = {
//       primary: { backgroundColor: COLORS.primary },
//       secondary: { backgroundColor: COLORS.secondary },
//       danger: { backgroundColor: COLORS.danger },
//     };
    
//     return [baseStyle, variantStyles[variant]];
//   };
  
  const getTextStyle = () => {
    if (variant === 'outline') {
      return globalStyles.outlineButtonText;
    }
    return globalStyles.buttonText;
  };

  return (
    <TouchableOpacity style={getButtonStyle()} onPress={onPress}>
      {iconName && (
        <Icon 
          name={iconName} 
          size={SIZES.xLarge} 
          color={variant === 'outline' ? COLORS.primary : COLORS.white} 
          style={globalStyles.buttonIcon} 
        />
      )}
      <Text style={getTextStyle()}>{title}</Text>
    </TouchableOpacity>
  );
};

export default CustomButton;
