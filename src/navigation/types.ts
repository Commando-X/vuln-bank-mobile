/**
 * Navigation Types for Vulnerable Bank Mobile App
 */

export type ScreenType = 
  // Auth screens
  | 'welcome'
  | 'login'
  | 'register'
  | 'forgotPassword'
  | 'resetPassword'
  
  // Main app screens
  | 'dashboard'
  | 'balance'
  | 'transfer'
  | 'profile'
  | 'transactions'
  | 'loans'
  | 'cards'
  | 'bills'
  | 'admin'
  
  // Card-related screens
  | 'cardDetails'
  | 'cardTransactions'
  | 'createCard'
  
  // Bill-related screens
  | 'selectBillCategory'
  | 'selectBiller'
  | 'paymentMethod';

// Parameter types for each screen
export type ScreenParams = {
  // Auth screens don't need params
  
  // Main app screens
  dashboard?: {};
  balance?: {};
  transfer?: {
    prefillRecipient?: string;
    prefillAmount?: number;
  };
  profile?: {};
  transactions?: {
    filterByType?: 'sent' | 'received';
  };
  loans?: {};
  cards?: {};
  bills?: {};
  admin?: {};
  
  // Card-related screens
  cardDetails?: {
    cardId: number | string;
  };
  cardTransactions?: {
    cardId: number | string;
  };
  createCard?: {};
  
  // Bill-related screens
  selectBillCategory?: {};
  selectBiller?: {
    categoryId: number | string;
  };
  paymentMethod?: {
    billerId: number | string;
    amount: number;
  };
};
