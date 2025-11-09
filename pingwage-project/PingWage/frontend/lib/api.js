//
// FILE: frontend/lib/api.js
//
import AsyncStorage from '@react-native-async-storage/async-storage';

// !! Replace with your backend's actual URL
const API_URL = 'http://10.50.3.253:3000/api/v1';

/**
 * Helper function to handle common fetch response logic.
 * This prevents the 'JSON Parse error: <' by checking res.ok
 * and content-type before trying to parse JSON.
 */
const handleResponse = async (res) => {
  // Check if the response is JSON
  const contentType = res.headers.get('content-type');
  const isJson = contentType && contentType.includes('application/json');

  if (!res.ok) {
    // If the response is not OK (e.g., 404, 500, 401)
    // Try to get the error message from the body (as text)
    const errorText = await res.text();

    // If it was JSON, we might be able to parse it for a message
    if (isJson) {
      try {
        const jsonError = JSON.parse(errorText);
        throw new Error(jsonError.message || jsonError.error || 'Server returned an error');
      } catch (e) {
        // Fallback if parsing the error JSON fails
        throw new Error(errorText || 'Server error: Invalid JSON response');
      }
    }

    // If it wasn't JSON, throw the HTML/text content
    // This will now show you the real error instead of "JSON Parse error"
    throw new Error(errorText || `Server error: ${res.status}`);
  }

  // If we're here, res.ok was true.
  // Handle cases where the body might be empty on a 200/204
  if (!isJson || res.status === 204) {
    return { success: true, data: null }; // Or whatever your app expects
  }

  // Only parse as JSON if we are sure it's JSON and res was ok
  return res.json();
};

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

  return handleResponse(res);
};

export default API_URL;
