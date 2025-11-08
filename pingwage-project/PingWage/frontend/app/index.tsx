import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import OnboardWelcome from './(onboard)/index'; // your welcome screen

export default function AppEntry() {
  const router = useRouter();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const hasCompleted = await AsyncStorage.getItem('hasCompletedOnboarding');
        if (hasCompleted === 'true') {
          // returning user -> go to passcode
          router.replace('/enter-passcode');
          return;
        }
      } catch (e) {
        console.warn('Error reading onboarding flag', e);
      } finally {
        setChecking(false);
      }
    })();
  }, []);

  if (checking) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#181711' }}>
        <ActivityIndicator size="large" color="#ecc813" />
      </View>
    );
  }

  // new user -> show welcome screen
  return <OnboardWelcome />;
}
