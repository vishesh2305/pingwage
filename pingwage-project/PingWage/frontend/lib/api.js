//
// FILE: frontend/lib/api.js
//
import AsyncStorage from '@react-native-async-storage/async-storage';

// !! Replace with your backend's actual URL
const API_URL = 'http://10.50.3.253:3000/api/v1';

/**
 * A simple fetch wrapper for unauthenticated routes
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
    if (!res.ok) {
      const text = await res.text();
      throw new Error(`HTTP ${res.status}: ${text}`);
    }
    return res.json();
  },
  get: async (endpoint) => {
    const res = await fetch(`${API_URL}${endpoint}`);
    if (!res.ok) {
      const text = await res.text();
      throw new Error(`HTTP ${res.status}: ${text}`);
    }
    return res.json();
  },
};

/**
 * A fetch wrapper for protected routes that require a token
 * @param {string} endpoint - The API endpoint (e.g., '/workers/me')
 * @param {object} options - Fetch options (method, body, etc.)
 * @param {string} tokenKey - The key for the token in AsyncStorage (e.g., 'tempToken' or 'authToken')
 */
export const protectedFetch = async (endpoint, options = {}, tokenKey = 'authToken') => {
  const token = await AsyncStorage.getItem(tokenKey);

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

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`HTTP ${res.status}: ${text}`);
  }

  return res.json();
};

export default API_URL;