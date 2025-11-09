import { View, Text, Pressable, Alert } from 'react-native'; // Import Alert
import { useState, useEffect } from 'react';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Haptics from 'expo-haptics';
import { useAuth } from '@/app/AppDataContext'; // <-- 1. IMPORT useAuth

export default function CreatePasscodeScreen() {
  const router = useRouter();
  const { signIn } = useAuth(); // <-- 2. GET THE signIn FUNCTION
  const [passcode, setPasscode] = useState('');
  const [confirmPasscode, setConfirmPasscode] = useState('');
  const [step, setStep] = useState<'create' | 'confirm'>('create');

  const handleNumberPress = (num: string) => {
    // ... (no changes in this function)
    Haptics.selectionAsync();

    if (step === 'create' && passcode.length < 4) {
      const newPass = passcode + num;
      setPasscode(newPass);
      if (newPass.length === 4) {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        setTimeout(() => setStep('confirm'), 300);
      }
    } else if (step === 'confirm' && confirmPasscode.length < 4) {
      const newConfirm = confirmPasscode + num;
      setConfirmPasscode(newConfirm);
      if (newConfirm.length === 4) {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      }
    }
  };

  // Auto-submit when confirm passcode is complete
  useEffect(() => {
    if (confirmPasscode.length === 4) {
      const timer = setTimeout(async () => {
        if (passcode === confirmPasscode) {
          // Passcode matches, save and navigate
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          try {
            // --- 3. THIS IS THE NEW LOGIC ---

            // Retrieve the session token and user data from onboarding
            const tempToken = await AsyncStorage.getItem('tempToken');
            const userId = await AsyncStorage.getItem('userId'); // (Assuming this was saved in verify-phone step)
            const employeeName = await AsyncStorage.getItem('employeeName');

            if (!tempToken) {
              throw new Error('Onboarding session expired. Please start over.');
            }

            // Create the user object the app context needs
            const userObject = {
              id: userId,
              name: employeeName,
              // Add any other user details you saved during onboarding
            };

            // Save the new passcode securely
            await SecureStore.setItemAsync('userPasscode', passcode);
            
            // Mark onboarding as complete
            await AsyncStorage.setItem('hasCompletedOnboarding', 'true');

            // --- 4. SIGN THE USER IN ---
            // This saves the token as 'authToken' in SecureStore
            // and automatically navigates to the '/(tabs)' dashboard.
            await signIn(tempToken, userObject);

            // We no longer need the old router.push
            // router.replace('/(tabs)'); // <-- This is now handled by signIn()

          } catch (err) {
            console.error('Error completing setup:', err);
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
            Alert.alert('Setup Failed', (err as Error).message || 'Could not complete setup.');
            setConfirmPasscode('');
          }
        } else {
          // Passcode doesn't match
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
          setConfirmPasscode('');
        }
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [confirmPasscode, passcode, signIn]); // <-- Add signIn to dependency array

  const handleBackspace = () => {
    // ... (no changes in this function)
    Haptics.selectionAsync();
    if (step === 'create') setPasscode(passcode.slice(0, -1));
    else setConfirmPasscode(confirmPasscode.slice(0, -1));
  };

  const currentPasscode = step === 'create' ? passcode : confirmPasscode;

  return (
    // ... (no changes to the JSX UI)
    <View className="flex-1 bg-background-dark">
      <View className="flex-1 p-4 justify-between">
        <View className="items-center pt-8">
          <Text className="text-sm font-medium text-[#A9A9A9] mb-8">
            Step 4 of 4
          </Text>
          <Text className="text-white text-[32px] font-bold text-center pb-3">
            {step === 'create' ? 'Create Your Passcode' : 'Confirm Your Passcode'}
          </Text>
          <Text className="text-[#A9A9A9] text-base text-center">
            {step === 'create'
              ? 'This will secure your account.'
              : 'Please re-enter to confirm.'}
          </Text>

          <View className="flex-row items-center justify-center gap-4 py-8 mt-4">
            {[0, 1, 2, 3].map((i) => (
              <View
                key={i}
                className={`h-4 w-4 rounded-full ${
                  i < currentPasscode.length ? 'bg-primary' : 'bg-white/20'
                }`}
              />
            ))}
          </View>
        </View>

        <View className="w-full max-w-sm mx-auto pb-8">
          <View className="gap-4">
            {['123', '456', '789'].map((row) => (
              <View key={row} className="flex-row gap-4">
                {row.split('').map((n) => (
                  <Pressable
                    key={n}
                    onPress={() => handleNumberPress(n)}
                    className="flex-1 h-20 items-center justify-center rounded-full bg-white/10 active:bg-white/20"
                  >
                    <Text className="text-3xl font-bold text-white">{n}</Text>
                  </Pressable>
                ))}
              </View>
            ))}
            <View className="flex-row gap-4">
              <View className="flex-1 h-20" />
              <Pressable
                onPress={() => handleNumberPress('0')}
                className="flex-1 h-20 items-center justify-center rounded-full bg-white/10 active:bg-white/20"
              >
                <Text className="text-3xl font-bold text-white">0</Text>
              </Pressable>
              <Pressable
                onPress={handleBackspace}
                className="flex-1 h-20 items-center justify-center rounded-full active:bg-white/10"
              >
                <Ionicons name="backspace-outline" size={32} color="#fff" />
              </Pressable>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
}