import { View, Text, TextInput, Pressable, KeyboardAvoidingView, Platform, Alert, Modal, ScrollView } from 'react-native';
import { useState, useRef } from 'react';
import { useRouter } from 'expo-router';
import BackButton from '@/components/BackButton';
import { Ionicons } from '@expo/vector-icons';
import { api } from '@/lib/api'; // Import our new helper
import AsyncStorage from '@react-native-async-storage/async-storage';

// Country codes with flags and dial codes
const COUNTRY_CODES = [
  { code: '+1', country: 'US', flag: '🇺🇸', name: 'United States' },
  { code: '+1', country: 'CA', flag: '🇨🇦', name: 'Canada' },
  { code: '+44', country: 'GB', flag: '🇬🇧', name: 'United Kingdom' },
  { code: '+91', country: 'IN', flag: '🇮🇳', name: 'India' },
  { code: '+86', country: 'CN', flag: '🇨🇳', name: 'China' },
  { code: '+81', country: 'JP', flag: '🇯🇵', name: 'Japan' },
  { code: '+49', country: 'DE', flag: '🇩🇪', name: 'Germany' },
  { code: '+33', country: 'FR', flag: '🇫🇷', name: 'France' },
  { code: '+39', country: 'IT', flag: '🇮🇹', name: 'Italy' },
  { code: '+34', country: 'ES', flag: '🇪🇸', name: 'Spain' },
  { code: '+61', country: 'AU', flag: '🇦🇺', name: 'Australia' },
  { code: '+7', country: 'RU', flag: '🇷🇺', name: 'Russia' },
  { code: '+55', country: 'BR', flag: '🇧🇷', name: 'Brazil' },
  { code: '+52', country: 'MX', flag: '🇲🇽', name: 'Mexico' },
  { code: '+27', country: 'ZA', flag: '🇿🇦', name: 'South Africa' },
  { code: '+82', country: 'KR', flag: '🇰🇷', name: 'South Korea' },
  { code: '+65', country: 'SG', flag: '🇸🇬', name: 'Singapore' },
  { code: '+971', country: 'AE', flag: '🇦🇪', name: 'UAE' },
  { code: '+41', country: 'CH', flag: '🇨🇭', name: 'Switzerland' },
  { code: '+31', country: 'NL', flag: '🇳🇱', name: 'Netherlands' },
  { code: '+46', country: 'SE', flag: '🇸🇪', name: 'Sweden' },
  { code: '+47', country: 'NO', flag: '🇳🇴', name: 'Norway' },
  { code: '+45', country: 'DK', flag: '🇩🇰', name: 'Denmark' },
  { code: '+358', country: 'FI', flag: '🇫🇮', name: 'Finland' },
  { code: '+351', country: 'PT', flag: '🇵🇹', name: 'Portugal' },
  { code: '+48', country: 'PL', flag: '🇵🇱', name: 'Poland' },
  { code: '+90', country: 'TR', flag: '🇹🇷', name: 'Turkey' },
  { code: '+20', country: 'EG', flag: '🇪🇬', name: 'Egypt' },
  { code: '+234', country: 'NG', flag: '🇳🇬', name: 'Nigeria' },
  { code: '+254', country: 'KE', flag: '🇰🇪', name: 'Kenya' },
  { code: '+966', country: 'SA', flag: '🇸🇦', name: 'Saudi Arabia' },
  { code: '+92', country: 'PK', flag: '🇵🇰', name: 'Pakistan' },
  { code: '+880', country: 'BD', flag: '🇧🇩', name: 'Bangladesh' },
  { code: '+84', country: 'VN', flag: '🇻🇳', name: 'Vietnam' },
  { code: '+66', country: 'TH', flag: '🇹🇭', name: 'Thailand' },
  { code: '+60', country: 'MY', flag: '🇲🇾', name: 'Malaysia' },
  { code: '+63', country: 'PH', flag: '🇵🇭', name: 'Philippines' },
  { code: '+62', country: 'ID', flag: '🇮🇩', name: 'Indonesia' },
  { code: '+64', country: 'NZ', flag: '🇳🇿', name: 'New Zealand' },
];

export default function VerifyPhoneScreen() {
  const router = useRouter();
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [selectedCountry, setSelectedCountry] = useState(COUNTRY_CODES[18]); // Switzerland as default
  const [showCountryPicker, setShowCountryPicker] = useState(false);
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);
  const otpInputs = useRef<Array<TextInput | null>>([]);

  const getFullPhone = () => {
    // Basic cleanup, remove leading 0 if present
    const cleanPhone = phoneNumber.startsWith('0') ? phoneNumber.substring(1) : phoneNumber;
    return selectedCountry.code + cleanPhone.replace(/\s/g, ''); // Combine and remove spaces
  }

  const handleSendOtp = async () => {
    setIsLoading(true);
    const fullPhoneNumber = getFullPhone();
    
    try {
      // API call to send OTP (backend route is /register)
      const res = await api.post('/auth/register', {
        phone: fullPhoneNumber,
      });

      if (res.success) {
        console.log('Sending OTP to:', fullPhoneNumber);
        setStep('otp');
      } else {
        Alert.alert('Error', res.message || 'Could not send verification code.');
      }
    } catch (error) {
      console.error('handleSendOtp error:', error);
      Alert.alert('Error', 'An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    setIsLoading(true);
    const fullPhoneNumber = getFullPhone();
    const code = otp.join('');

    try {
      // API call to verify OTP
      const res = await api.post('/auth/verify-phone', {
        phone: fullPhoneNumber,
        code: code,
      });

      if (res.success && res.data.token) {
        // Save the temporary token needed for profile setup & setting PIN
        // This token is from /verify-phone and is short-lived
        await AsyncStorage.setItem('tempToken', res.data.token);
        
        console.log('Verifying OTP:', code);
        router.push({
          pathname: '/company-verification',
          params: { phoneNumber: fullPhoneNumber },
        });
      } else {
        Alert.alert('Error', res.message || 'Invalid or expired verification code.');
      }
    } catch (error) {
      console.error('handleVerifyOtp error:', error);
      Alert.alert('Error', 'An error occurred. Please try again.');
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
    // Re-call handleSendOtp to resend
    handleSendOtp();
    console.log('Resending OTP');
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
                  <Pressable
                    onPress={() => setShowCountryPicker(true)}
                    className="flex-row items-center justify-center gap-2 rounded-l-lg border border-r-0 border-white/20 bg-white/5 px-3 active:opacity-70"
                  >
                    <Text className="text-xl">{selectedCountry.flag}</Text>
                    <Ionicons name="chevron-down" size={18} color="#A9A9A9" />
                    <Text className="text-white/60 text-base">{selectedCountry.code}</Text>
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
                    //
                    // --- THIS IS THE FIX ---
                    // Changed (ref) => (output) to (ref) => { function body }
                    //
                    ref={(ref) => {
                      otpInputs.current[index] = ref;
                    }}
                    //
                    // --- END OF FIX ---
                    //
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

      {/* Country Picker Modal */}
      <Modal
        visible={showCountryPicker}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowCountryPicker(false)}
      >
        <View className="flex-1 bg-black/50" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <Pressable
            className="flex-1"
            onPress={() => setShowCountryPicker(false)}
          />
          <View className="bg-background-dark rounded-t-3xl" style={{ height: '70%' }}>
            {/* Modal Header */}
            <View className="flex-row items-center justify-between p-4 border-b border-white/10">
              <Text className="text-white text-lg font-bold">Select Country</Text>
              <Pressable onPress={() => setShowCountryPicker(false)}>
                <Ionicons name="close" size={24} color="#A9A9A9" />
              </Pressable>
            </View>

            {/* Country List */}
            <ScrollView style={{ flex: 1 }}>
              {COUNTRY_CODES.map((country, index) => (
                <Pressable
                  key={`${country.country}-${index}`}
                  onPress={() => {
                    setSelectedCountry(country);
                    setShowCountryPicker(false);
                  }}
                  className="flex-row items-center justify-between p-4 border-b border-white/5 active:bg-white/5"
                >
                  <View className="flex-row items-center gap-3">
                    <Text className="text-2xl">{country.flag}</Text>
                    <Text className="text-white text-base">{country.name}</Text>
                  </View>
                  <Text className="text-white/60 text-base">{country.code}</Text>
                </Pressable>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
}