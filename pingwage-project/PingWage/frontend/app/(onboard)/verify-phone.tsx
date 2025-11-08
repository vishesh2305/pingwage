import { View, Text, TextInput, Pressable, KeyboardAvoidingView, Platform } from 'react-native';
import { useState, useRef } from 'react';
import { useRouter } from 'expo-router';
import BackButton from '@/components/BackButton';
import { Ionicons } from '@expo/vector-icons';

export default function VerifyPhoneScreen() {
  const router = useRouter();
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [countryCode, setCountryCode] = useState('+41');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const otpInputs = useRef<Array<TextInput | null>>([]);

  const handleSendOtp = () => {
    // TODO: API call to send OTP
    console.log('Sending OTP to:', countryCode + phoneNumber);
    setStep('otp');
  };

  const handleVerifyOtp = () => {
    // TODO: API call to verify OTP
    console.log('Verifying OTP:', otp.join(''));
    // Navigate to company verification screen with phone number
    const fullPhoneNumber = countryCode + phoneNumber;
    router.push({
      pathname: '/company-verification',
      params: { phoneNumber: fullPhoneNumber }
    });
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
    // TODO: API call to resend OTP
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
            : 'Enter the verification code we sent to your phone.'}
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
                    <Ionicons name="chevron-down" size={18} color="#A9A9A9" />
                  </Pressable>

                  {/* Phone Input */}
                  <TextInput
                    className="flex-1 rounded-r-lg border border-white/20 bg-white/5 h-14 px-4 text-white text-base"
                    placeholder="+41 79 123 45 67"
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
                className="h-14 rounded-xl bg-primary items-center justify-center active:opacity-80"
              >
                <Text className="text-background-dark text-base font-bold">
                  Send Code
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
                    ref={(ref) => (otpInputs.current[index] = ref)}
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
                className="h-14 rounded-xl bg-primary items-center justify-center active:opacity-80"
              >
                <Text className="text-background-dark text-base font-bold">
                  Verify
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
