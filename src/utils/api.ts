// API Base URL
export const API_BASE = 'https://vulnbank.org';

// API Endpoints
export const ENDPOINTS = {
  login: '/login',
  register: '/register',
  checkBalance: (accountNumber: string) => `/check_balance/${accountNumber}`,
  transfer: '/transfer',
  transactions: (accountNumber: string) => `/transactions/${accountNumber}`,
  requestLoan: '/request_loan',
  virtualCards: {
    list: '/api/virtual-cards',
    create: '/api/virtual-cards/create',
    toggleFreeze: (cardId: number | string) => `/api/virtual-cards/${cardId}/toggle-freeze`,
    transactions: (cardId: number | string) => `/api/virtual-cards/${cardId}/transactions`,
    updateLimit: (cardId: number | string) => `/api/virtual-cards/${cardId}/update-limit`,
  },
  billPayments: {
    categories: '/api/bill-categories',
    billersByCategory: (categoryId: number | string) => `/api/billers/by-category/${categoryId}`,
    create: '/api/bill-payments/create',
    history: '/api/bill-payments/history',
  },
  admin: {
    users: '/sup3r_s3cr3t_admin',
    createAdmin: '/admin/create_admin',
    deleteAccount: (userId: number | string) => `/admin/delete_account/${userId}`,
    approveLoan: (loanId: number | string) => `/admin/approve_loan/${loanId}`,
    pendingLoans: '/api/bill-categories',  // Placeholder -
      
  },
  // Placeholders for missing endpoints that might be needed
  profile: {
    get: '/profile',  // Placeholder
    update: '/profile/update',  // Placeholder
  },
  resetPassword: {
    request: '/api/v2/forgot-password',
    reset: '/api/v2/reset-password',
  },
};

/**
 * Make API request with proper error handling
 */
export const apiRequest = async (
  endpoint: string, 
  options: RequestOptions = {}
): Promise<any> => {
  const { 
    method = 'GET', 
    token = null, 
    body = null,
    headers: customHeaders = {}
  } = options;

  try {
    // Prepare headers
    const headers: Record<string, string> = {
      ...customHeaders,
    };

    // Add Content-Type for JSON requests
    if (body && !(body instanceof FormData)) {
      headers['Content-Type'] = 'application/json';
    }

    // Add authorization if token provided
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    // Prepare request options
    const requestOptions: RequestInit = {
      method,
      headers,
    };

    // Add body if provided
    if (body) {
      requestOptions.body = body instanceof FormData 
        ? body 
        : JSON.stringify(body);
    }

    // Make the fetch request
    const response = await fetch(`${API_BASE}${endpoint}`, requestOptions);
    
    // Parse the JSON response
    const data = await response.json();
    
    // Return both response status and data
    return {
      ok: response.ok,
      status: response.status,
      data,
    };
  } catch (error) {
    return {
      ok: false,
      status: 0,
      data: { message: 'Network error or server unavailable', error },
    };
  }
};

// Types
export interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  token?: string | null;
  body?: any;
  headers?: Record<string, string>;
}

// Helper functions for common request types
export const get = (endpoint: string, token?: string | null) => 
  apiRequest(endpoint, { token });

export const post = (endpoint: string, body: any, token?: string | null) => 
  apiRequest(endpoint, { method: 'POST', body, token });

export const put = (endpoint: string, body: any, token?: string | null) => 
  apiRequest(endpoint, { method: 'PUT', body, token });

export const del = (endpoint: string, token?: string | null) => 
  apiRequest(endpoint, { method: 'DELETE', token });
