import { View, Text, Pressable, Alert } from 'react-native'; // <-- 1. Import Alert
import { useState, useEffect } from 'react';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Haptics from 'expo-haptics';
import { useAuth } from '@/contexts/AppDataContext'; // <-- 2. Import useAuth

export default function CreatePasscodeScreen() {
  const router = useRouter();
  const { signIn } = useAuth(); // <-- 3. Get the signIn function
  const [passcode, setPasscode] = useState('');
  const [confirmPasscode, setConfirmPasscode] = useState('');
  const [step, setStep] = useState<'create' | 'confirm'>('create');

  const handleNumberPress = (num: string) => {
    // Light haptic feedback for number press
    Haptics.selectionAsync();

    if (step === 'create' && passcode.length < 4) {
      const newPass = passcode + num;
      setPasscode(newPass);
      if (newPass.length === 4) {
        // Medium haptic when completing 4 digits
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        setTimeout(() => setStep('confirm'), 300);
      }
    } else if (step === 'confirm' && confirmPasscode.length < 4) {
      const newConfirm = confirmPasscode + num;
      setConfirmPasscode(newConfirm);
      if (newConfirm.length === 4) {
        // Medium haptic when completing 4 digits
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
          
          console.log('====== PASSCODE SETUP STARTED ======');
          
          try {
            // Retrieve the session token and user data from onboarding
            const tempToken = await AsyncStorage.getItem('tempToken');
            const userId = await AsyncStorage.getItem('userId');
            const employeeName = await AsyncStorage.getItem('employeeName');

            console.log('Retrieved from AsyncStorage:', {
              tempToken: tempToken ? '✓ Present' : '✗ Missing',
              userId: userId ? `✓ ${userId}` : '✗ Missing',
              employeeName: employeeName ? `✓ ${employeeName}` : '✗ Missing',
            });

            // Better error handling with specific messages
            if (!tempToken) {
              throw new Error('Authentication token not found. Please restart the onboarding process.');
            }
            
            if (!userId) {
              throw new Error('User ID not found. This is a critical error. Please restart the app and try again.');
            }

            // Create the user object the app context needs
            const userObject = {
              id: userId,
              name: employeeName || 'User',
            };

            console.log('User object created:', userObject);

            // Save the new passcode securely
            await SecureStore.setItemAsync('userPasscode', passcode);
            console.log('✓ Passcode saved securely');

            // Save user data to SecureStore for future logins
            await SecureStore.setItemAsync('userId', userId);
            await SecureStore.setItemAsync('employeeName', employeeName || 'User');
            console.log('✓ User data saved to SecureStore');

            // Mark onboarding as complete
            await AsyncStorage.setItem('hasCompletedOnboarding', 'true');
            console.log('✓ Onboarding marked as complete');

            // Sign the user in
            // This saves the token as 'authToken' in SecureStore
            // and automatically navigates to the '/(tabs)' dashboard.
            console.log('Calling signIn...');
            await signIn(tempToken, userObject);
            console.log('✓ Sign-in successful');
            console.log('====== PASSCODE SETUP COMPLETED ======');

          } catch (err) {
            console.error('====== PASSCODE SETUP FAILED ======');
            console.error('Error details:', {
              name: (err as Error).name,
              message: (err as Error).message,
              stack: (err as Error).stack,
            });
            
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
            
            // Show user-friendly error message
            Alert.alert(
              'Setup Failed', 
              (err as Error).message || 'Could not complete setup. Please try again.',
              [
                {
                  text: 'OK',
                  onPress: () => setConfirmPasscode(''),
                }
              ]
            );
          }
        } else {
          // Passcode doesn't match
          console.warn('Passcodes do not match');
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
          Alert.alert(
            'Passcodes Don\'t Match',
            'Please try again.',
            [
              {
                text: 'OK',
                onPress: () => {
                  setPasscode('');
                  setConfirmPasscode('');
                  setStep('create');
                }
              }
            ]
          );
        }
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [confirmPasscode, passcode, signIn]);

  const handleBackspace = () => {
    Haptics.selectionAsync();
    if (step === 'create') setPasscode(passcode.slice(0, -1));
    else setConfirmPasscode(confirmPasscode.slice(0, -1));
  };

  const currentPasscode = step === 'create' ? passcode : confirmPasscode;

  return (
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