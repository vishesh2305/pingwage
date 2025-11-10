import { router } from 'expo-router';
import React, { createContext, useContext, useEffect, useState } from 'react';
import * as SecureStore from 'expo-secure-store';
import { ActivityIndicator, View } from 'react-native';

// This is the shape of our global data
type AppData = {
  onboardingCompleted: boolean;
  setOnboardingCompleted: (completed: boolean) => void;

  // Auth-related
  token: string | null;
  user: any | null;
  signIn: (token: string, user: any) => void;
  signOut: () => void;
  isLoading: boolean;

  // 👇 NEW: App-wide worker state
  isDataLoaded: boolean;
  setIsDataLoaded: (value: boolean) => void;
  employeeName: string;
  setEmployeeName: (value: string) => void;
};

const AppDataContext = createContext<AppData | undefined>(undefined);

export const AppDataProvider = ({ children }: { children: React.ReactNode }) => {
  const [onboardingCompleted, setOnboardingCompleted] = useState(false);

  // Auth state
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // 👇 NEW: Shared UI data for your dashboard
  const [isDataLoaded, setIsDataLoaded] = useState(false);
  const [employeeName, setEmployeeName] = useState('');

  useEffect(() => {
    const loadToken = async () => {
      try {
        const storedToken = await SecureStore.getItemAsync('authToken');
        const storedUser = await SecureStore.getItemAsync('userData');

        if (storedToken) {
          setToken(storedToken);
          setUser(JSON.parse(storedUser || 'null'));
          setOnboardingCompleted(true);
        }
      } catch (e) {
        console.error('Failed to load auth data', e);
      }
      setIsLoading(false);
    };
    loadToken();
  }, []);

  const handleSetOnboardingCompleted = (completed: boolean) => {
    setOnboardingCompleted(completed);
  };

  const signIn = async (newToken: string, newUser: any) => {
    try {
      await SecureStore.setItemAsync('authToken', newToken);
      await SecureStore.setItemAsync('userData', JSON.stringify(newUser));

      setToken(newToken);
      setUser(newUser);
      setOnboardingCompleted(true);
      router.replace('/(tabs)');
    } catch (e) {
      console.error('Failed to save auth data', e);
    }
  };

  const signOut = async () => {
    try {
      await SecureStore.deleteItemAsync('authToken');
      await SecureStore.deleteItemAsync('userData');

      setToken(null);
      setUser(null);
      setOnboardingCompleted(false);
      router.replace('/(onboard)');
    } catch (e) {
      console.error('Failed to clear auth data', e);
    }
  };

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <AppDataContext.Provider
      value={{
        onboardingCompleted,
        setOnboardingCompleted: handleSetOnboardingCompleted,
        token,
        user,
        signIn,
        signOut,
        isLoading,

        // 👇 NEW
        isDataLoaded,
        setIsDataLoaded,
        employeeName,
        setEmployeeName,
      }}
    >
      {children}
    </AppDataContext.Provider>
  );
};

// Custom hooks
export const useAuth = () => {
  const context = useContext(AppDataContext);
  if (!context) throw new Error('useAuth must be used within an AppDataProvider');
  return context;
};

export const useAppData = () => {
  const context = useContext(AppDataContext);
  if (!context) throw new Error('useAppData must be used within an AppDataProvider');
  return context;
};
