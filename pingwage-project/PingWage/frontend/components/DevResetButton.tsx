import React from 'react';
import { Pressable, Text, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';

export default function DevResetButton() {
  const handleReset = async () => {
    try {
      await AsyncStorage.removeItem('hasCompletedOnboarding');
      await SecureStore.deleteItemAsync('userPasscode');

      console.log('✅ User data cleared');
      Alert.alert(
        'Reset Complete',
        'User data cleared successfully.\nPlease close and reopen the app.',
        [{ text: 'OK' }]
      );
    } catch (e) {
      console.error('❌ Error clearing data:', e);
      Alert.alert('Error', 'Something went wrong while clearing data.');
    }
  };

  return (
    <Pressable
      onLongPress={handleReset} // long press = reset
      style={{
        position: 'absolute',
        bottom: 40,
        right: 20,
        backgroundColor: 'red',
        paddingVertical: 10,
        paddingHorizontal: 16,
        borderRadius: 10,
      }}
    >
      <Text style={{ color: 'white', fontWeight: 'bold' }}>Reset</Text>
    </Pressable>
  );
}
