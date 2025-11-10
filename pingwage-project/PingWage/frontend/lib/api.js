//
// FILE: frontend/lib/api.js
//
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store'; // <-- 1. IMPORT SECURESTORE

// !! Replace with your backend's actual URL
const API_URL = 'http://10.50.3.253:3000/api/v1';

/**
 * Helper function to handle common fetch response logic.
 * (This function is unchanged)
 */
const handleResponse = async (res) => {
  const contentType = res.headers.get('content-type');
  const isJson = contentType && contentType.includes('application/json');

  if (!res.ok) {
    const errorText = await res.text();
    if (isJson) {
      try {
        const jsonError = JSON.parse(errorText);
        throw new Error(jsonError.message || jsonError.error || 'Server returned an error');
      } catch (e) {
        throw new Error(errorText || 'Server error: Invalid JSON response');
      }
    }
    throw new Error(errorText || `Server error: ${res.status}`);
  }

  if (!isJson || res.status === 204) {
    return { success: true, data: null }; 
  }

  return res.json();
};

/**
 * A simple fetch wrapper for unauthenticated routes
 * (This is unchanged)
 */
export const api = {
  post: async (endpoint, body) => {
    const res = await fetch(`${API_URL}${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });
    return handleResponse(res);
  },
  get: async (endpoint) => {
    const res = await fetch(`${API_URL}${endpoint}`);
    return handleResponse(res);
  },
};

/**
 * A fetch wrapper for protected routes that require a token
 * @param {string} endpoint - The API endpoint (e.g., '/workers/me')
 * @param {object} options - Fetch options (method, body, etc.)
 * @param {string} tokenKey - The key for the token ('tempToken' or 'authToken')
 */
export const protectedFetch = async (endpoint, options = {}, tokenKey = 'authToken') => {
  
  // --- 2. THIS IS THE NEW LOGIC ---
  let token = null;
  if (tokenKey === 'authToken') {
    // Permanent tokens are in SecureStore
    token = await SecureStore.getItemAsync('authToken');
  } else if (tokenKey === 'tempToken') {
    // Onboarding tokens are in AsyncStorage
    token = await AsyncStorage.getItem('tempToken');
  }
  // --- END OF NEW LOGIC ---

  if (!token) {
    throw new Error('No auth token found');
  }

  const res = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: {
      ...options.headers,
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: options.body ? JSON.stringify(options.body) : null,
  });

  return handleResponse(res); // Use the handler
};

export default API_URL;
