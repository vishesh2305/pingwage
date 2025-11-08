import { View, Text, Pressable } from 'react-native';
import { useState, useEffect } from 'react';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as SecureStore from 'expo-secure-store';
import * as Haptics from 'expo-haptics';

export default function EnterPasscodeScreen() {
  const router = useRouter();
  const [passcode, setPasscode] = useState('');
  const [error, setError] = useState(false);
  const [storedPasscode, setStoredPasscode] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const saved = await SecureStore.getItemAsync('userPasscode');
      setStoredPasscode(saved);
    })();
  }, []);

  const handleNumberPress = (num: string) => {
    // Light haptic feedback for number press - use selectionAsync for better compatibility
    Haptics.selectionAsync();

    if (passcode.length < 4) {
      const newCode = passcode + num;
      setPasscode(newCode);
      setError(false);
      if (newCode.length === 4) {
        // Medium haptic when completing 4 digits
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        setTimeout(() => verifyPasscode(newCode), 100);
      }
    }
  };

  const verifyPasscode = (code: string) => {
    if (storedPasscode && code === storedPasscode) {
      // Success haptic
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.replace('/(tabs)');
    } else {
      // Error haptic - stronger feedback for wrong passcode
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      setError(true);
      setTimeout(() => setPasscode(''), 500);
    }
  };

  const handleBackspace = () => {
    // Light haptic for backspace
    Haptics.selectionAsync();
    setPasscode(passcode.slice(0, -1));
    setError(false);
  };

  return (
    <View className="flex-1 bg-background-dark">
      <View className="flex-1 p-4 justify-between">
        <View className="items-center pt-16">
          <Text className="text-white text-[32px] font-bold pb-3">
            Enter Your Passcode
          </Text>
          <Text className="text-[#A9A9A9] text-base text-center">
            Enter your 4-digit passcode to continue
          </Text>

          <View className="flex-row items-center justify-center gap-4 py-8 mt-4">
            {[0, 1, 2, 3].map((i) => (
              <View
                key={i}
                className={`h-4 w-4 rounded-full ${
                  error
                    ? 'bg-red-500'
                    : i < passcode.length
                    ? 'bg-primary'
                    : 'bg-white/20'
                }`}
              />
            ))}
          </View>

          {error && (
            <Text className="text-red-400 text-sm font-medium">
              Incorrect passcode. Try again.
            </Text>
          )}
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
                <Ionicons name="backspace-outline" size={32} color="#FFFFFF" />
              </Pressable>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
}
