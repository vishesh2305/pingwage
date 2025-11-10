import { View, Text, TextInput, Pressable, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { useState, useRef } from 'react';
import { useRouter } from 'expo-router';
import BackButton from '@/components/BackButton';
import { Ionicons } from '@expo/vector-icons';
// Import both the 'api' object and the default 'API_URL' for logging
import API_URL, { api } from '@/lib/api'; 
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function VerifyPhoneScreen() {
  const router = useRouter();
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [countryCode, setCountryCode] = useState('+41'); // Assuming +41 for simplicity
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);
  const otpInputs = useRef<Array<TextInput | null>>([]);

  const getFullPhone = () => {
    // Basic cleanup, remove leading 0 if present
    const cleanPhone = phoneNumber.startsWith('0') ? phoneNumber.substring(1) : phoneNumber;
    return countryCode + cleanPhone.replace(/\s/g, ''); // Combine and remove spaces
  }

  const handleSendOtp = async () => {
    setIsLoading(true);
    const fullPhoneNumber = getFullPhone();
    
    // --- START DEBUG LOGGING ---
    console.log('------------------------------');
    console.log('Attempting to send OTP...');
    console.log('Phone number:', fullPhoneNumber);
    console.log('Calling URL:', `${API_URL}/auth/register`);
    // --- END DEBUG LOGGING ---
    
    try {
      // API call to send OTP (backend route is /register)
      const res = await api.post('/auth/register', {
        phone: fullPhoneNumber,
      });

      // --- START DEBUG LOGGING ---
      console.log('Server response received:', JSON.stringify(res, null, 2));
      // --- END DEBUG LOGGING ---

      if (res.success) {
        console.log('Success! Setting step to OTP.');
        setStep('otp');
      } else {
        // --- START DEBUG LOGGING ---
        console.warn('Server responded with an error:', res.message);
        // --- END DEBUG LOGGING ---
        Alert.alert('Error', res.message || 'Could not send verification code.');
      }
    } catch (error) {
      // --- START DEBUG LOGGING ---
      console.error('CRITICAL: handleSendOtp network request failed.');
      // Log the full error object to see what it contains
      console.error('Error Type:', (error as Error).name);
      console.error('Error Message:', (error as Error).message);
      console.error('Full Error Object:', JSON.stringify(error, null, 2));
      console.log('------------------------------');
      // --- END DEBUG LOGGING ---
      Alert.alert('Network Error', 'Could not connect to the server. Please check your network, IP address, and firewall settings.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    setIsLoading(true);
    const fullPhoneNumber = getFullPhone();
    const code = otp.join('');

    // --- START DEBUG LOGGING ---
    console.log('------------------------------');
    console.log('Attempting to verify OTP...');
    console.log('Phone number:', fullPhoneNumber);
    console.log('Code:', code);
    console.log('Calling URL:', `${API_URL}/auth/verify-phone`);
    // --- END DEBUG LOGGING ---

    try {
      // API call to verify OTP
      const res = await api.post('/auth/verify-phone', {
        phone: fullPhoneNumber,
        code: code,
      });

      // --- START DEBUG LOGGING ---
      console.log('Server response received:', JSON.stringify(res, null, 2));
      // --- END DEBUG LOGGING ---

      if (res.success && res.data.token) {
        // Save the temporary token needed for profile setup & setting PIN
        // This token is from /verify-phone and is short-lived
        await AsyncStorage.setItem('tempToken', res.data.token);
        
        // CRITICAL FIX: Store the user_id from the verification response
        // This is needed later in create-passcode.tsx
        if (res.data.user_id) {
          await AsyncStorage.setItem('userId', res.data.user_id.toString());
          console.log('Stored userId:', res.data.user_id);
        } else {
          console.warn('No user_id in verification response!');
        }
        
        console.log('Verifying OTP:', code);
        router.push({
          pathname: '/company-verification',
          params: { phoneNumber: fullPhoneNumber },
        });
      } else {
        // --- START DEBUG LOGGING ---
        console.warn('Server responded with an error:', res.message);
        // --- END DEBUG LOGGING ---
        Alert.alert('Error', res.message || 'Invalid or expired verification code.');
      }
    } catch (error) {
      // --- START DEBUG LOGGING ---
      console.error('CRITICAL: handleVerifyOtp network request failed.');
      console.error('Error Type:', (error as Error).name);
      console.error('Error Message:', (error as Error).message);
      console.error('Full Error Object:', JSON.stringify(error, null, 2));
      console.log('------------------------------');
      // --- END DEBUG LOGGING ---
      Alert.alert('Network Error', 'Could not connect to the server. Please check your network and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOtpChange = (value: string, index: number) => {
    if (value.length > 1) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      otpInputs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyPress = (key: string, index: number) => {
    // Handle backspace
    if (key === 'Backspace' && !otp[index] && index > 0) {
      otpInputs.current[index - 1]?.focus();
    }
  };

  const handleResendCode = () => {
    // --- START DEBUG LOGGING ---
    console.log('Resending OTP code...');
    // --- END DEBUG LOGGING ---
    // Re-call handleSendOtp to resend
    handleSendOtp();
    setOtp(['', '', '', '', '', '']);
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1 bg-background-dark"
    >
      <View className="flex-1 px-4 pt-10 pb-6">
        {/* Header */}
        <View className="flex-row items-center pb-2">
          <BackButton onPress={step === 'otp' ? () => setStep('phone') : undefined} />
          <Text className="text-white text-lg font-bold flex-1 text-center pr-12">
            Verify Your Phone Number
          </Text>
        </View>

        {/* Body Text */}
        <Text className="text-[#A9A9A9] text-base font-normal text-center pb-8 pt-2 px-4">
          {step === 'phone'
            ? "We'll send you a verification code to confirm it's you."
            : `Enter the verification code we sent to ${getFullPhone()}.`}
        </Text>

        {step === 'phone' ? (
          /* Phone Number Input */
          <View className="flex-1">
            <View className="gap-4">
              <View>
                <Text className="text-white text-base font-medium pb-2">
                  Phone Number
                </Text>
                <View className="flex-row items-stretch gap-0">
                  {/* Country Selector */}
                  <Pressable className="flex-row items-center justify-center gap-2 rounded-l-lg border border-r-0 border-white/20 bg-white/5 px-3">
                    <Text className="text-xl">🇨🇭</Text>
                    {/* <Ionicons name="chevron-down" size={18} color="#A9A9A9" /> */}
                    <Text className="text-white/60 text-base">{countryCode}</Text>
                  </Pressable>

                  {/* Phone Input */}
                  <TextInput
                    className="flex-1 rounded-r-lg border border-white/20 bg-white/5 h-14 px-4 text-white text-base"
                    placeholder="79 123 45 67"
                    placeholderTextColor="#A9A9A9"
                    keyboardType="phone-pad"
                    value={phoneNumber}
                    onChangeText={setPhoneNumber}
                  />
                </View>
              </View>
            </View>

            {/* Spacer */}
            <View className="flex-1" />

            {/* Footer */}
            <View className="gap-4">
              <Pressable
                onPress={handleSendOtp}
                disabled={isLoading}
                className={`h-14 rounded-xl bg-primary items-center justify-center active:opacity-80 ${isLoading ? 'opacity-50' : ''}`}
              >
                <Text className="text-background-dark text-base font-bold">
                  {isLoading ? 'Sending...' : 'Send Code'}
                </Text>
              </Pressable>

              <Text className="text-[#A9A9A9] text-xs font-normal text-center max-w-sm mx-auto">
                By continuing, you agree to our{' '}
                <Text className="font-medium text-white underline">
                  Terms of Service
                </Text>{' '}
                and{' '}
                <Text className="font-medium text-white underline">
                  Privacy Policy
                </Text>
                .
              </Text>
            </View>
          </View>
        ) : (
          /* OTP Verification */
          <View className="flex-1">
            <View>
              <Text className="text-white text-base font-medium pb-2">
                Verification Code
              </Text>
              <View className="flex-row justify-between gap-2">
                {otp.map((digit, index) => (
                  <TextInput
                    key={index}
                    ref={(ref) => {
                      otpInputs.current[index] = ref;
                    }}
                    className="h-16 flex-1 text-center text-xl font-bold rounded-lg border border-white/20 bg-white/5 text-white"
                    maxLength={1}
                    keyboardType="number-pad"
                    value={digit}
                    onChangeText={(value) => handleOtpChange(value, index)}
                    onKeyPress={({ nativeEvent: { key } }) =>
                      handleOtpKeyPress(key, index)
                    }
                  />
                ))}
              </View>
            </View>

            {/* Resend Code Link */}
            <View className="pt-4 items-center">
              <Text className="text-[#A9A9A9] text-sm font-normal">
                Didn't get a code?{' '}
                <Text
                  onPress={handleResendCode}
                  className="font-medium text-primary underline"
                >
                  Resend
                </Text>
              </Text>
            </View>

            {/* Spacer */}
            <View className="flex-1" />

            {/* Footer */}
            <View className="gap-4">
              <Pressable
                onPress={handleVerifyOtp}
                disabled={isLoading}
                className={`h-14 rounded-xl bg-primary items-center justify-center active:opacity-80 ${isLoading ? 'opacity-50' : ''}`}
              >
                <Text className="text-background-dark text-base font-bold">
                  {isLoading ? 'Verifying...' : 'Verify'}
                </Text>
              </Pressable>

              <Text className="text-[#A9A9A9] text-xs font-normal text-center max-w-sm mx-auto">
                By continuing, you agree to our{' '}
                <Text className="font-medium text-white underline">
                  Terms of Service
                </Text>{' '}
                and{' '}
                <Text className="font-medium text-white underline">
                  Privacy Policy
                </Text>
                .
              </Text>
            </View>
          </View>
        )}
      </View>
    </KeyboardAvoidingView>
  );
}