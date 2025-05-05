/**
 * Theme configuration file for Vulnerable Bank Mobile App
 * Matches the color scheme of the web version
 */

export const COLORS = {
  // Match the web version's colors
  primary: '#007bff',
  primaryDark: '#0056b3',
  secondary: '#34a853',
  danger: '#ea4335',
  warning: '#fbbc05',
  success: '#28a745',
  info: '#17a2b8',
  
  // Text colors
  text: '#202124',
  textLight: '#6c757d',
  textDark: '#343a40',
  
  // Background colors
  background: '#f8f9fa',
  backgroundDark: '#121212',
  
  // UI element colors
  border: '#e0e0e0',
  card: '#ffffff',
  cardDark: '#1f1f1f',
  
  // Special colors
  white: '#ffffff',
  black: '#000000',
  transparent: 'transparent',
  
  // Overlay
  overlay: 'rgba(0, 0, 0, 0.5)',
  
  // Status colors
  statusPending: '#fbbc05',
  statusApproved: '#34a853',
  statusRejected: '#ea4335',
};

export const FONTS = {
  regular: {
    fontFamily: 'System',
    fontWeight: 'normal',
  },
  medium: {
    fontFamily: 'System',
    fontWeight: '500',
  },
  bold: {
    fontFamily: 'System',
    fontWeight: 'bold',
  },
  light: {
    fontFamily: 'System',
    fontWeight: '300',
  },
};

export const SIZES = {
  // Font sizes
  xSmall: 10,
  small: 12,
  medium: 16,
  large: 20,
  xLarge: 24,
  xxLarge: 32,
  
  // Spacing
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
  },
  
  // Border radius
  radius: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24,
    round: 50,
  },
};

export const SHADOWS = {
  small: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 2,
  },
  medium: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.29,
    shadowRadius: 4.65,
    elevation: 4,
  },
  large: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 5,
    },
    shadowOpacity: 0.36,
    shadowRadius: 6.68,
    elevation: 8,
  },
};

const theme = { COLORS, FONTS, SIZES, SHADOWS };

export default theme;
