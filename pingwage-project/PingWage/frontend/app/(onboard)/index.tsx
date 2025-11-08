import { View, Text, Pressable } from 'react-native';
import { useEffect, useRef } from 'react';
import { useRouter } from 'expo-router';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  withDelay,
  withSpring,
  withRepeat,
  Easing,
} from 'react-native-reanimated';
import Logo from '@/components/Logo';
import { Ionicons } from '@expo/vector-icons';

export default function WelcomeScreen() {
  const router = useRouter();
  const hasAnimated = useRef(false);

  // Animation values
  const logoOpacity = useSharedValue(hasAnimated.current ? 1 : 0);
  const logoScale = useSharedValue(hasAnimated.current ? 1 : 0.5);
  const headlineOpacity = useSharedValue(hasAnimated.current ? 1 : 0);
  const headlineTranslateY = useSharedValue(hasAnimated.current ? 0 : 30);
  const cardsOpacity = useSharedValue(hasAnimated.current ? 1 : 0);
  const cardsTranslateY = useSharedValue(hasAnimated.current ? 0 : 30);
  const buttonOpacity = useSharedValue(hasAnimated.current ? 1 : 0);
  const buttonTranslateY = useSharedValue(hasAnimated.current ? 0 : 30);

  // Glow animation for cards
  const cardGlow = useSharedValue(0);

  useEffect(() => {
    if (!hasAnimated.current) {
      // Logo animation
      logoOpacity.value = withTiming(1, { duration: 600, easing: Easing.out(Easing.ease) });
      logoScale.value = withSpring(1, { damping: 12, stiffness: 100 });

      // Headline animation (delayed)
      headlineOpacity.value = withDelay(200, withTiming(1, { duration: 600 }));
      headlineTranslateY.value = withDelay(200, withSpring(0, { damping: 12 }));

      // Cards animation (delayed)
      cardsOpacity.value = withDelay(400, withTiming(1, { duration: 600 }));
      cardsTranslateY.value = withDelay(400, withSpring(0, { damping: 12 }));

      // Button animation (delayed)
      buttonOpacity.value = withDelay(600, withTiming(1, { duration: 600 }));
      buttonTranslateY.value = withDelay(600, withSpring(0, { damping: 12 }));

      hasAnimated.current = true;
    }

    // Subtle glow animation for cards (always runs)
    cardGlow.value = withDelay(
      hasAnimated.current ? 0 : 1000,
      withRepeat(
        withTiming(1, { duration: 2000, easing: Easing.inOut(Easing.ease) }),
        -1,
        true
      )
    );
  }, []);

  const logoAnimatedStyle = useAnimatedStyle(() => ({
    opacity: logoOpacity.value,
    transform: [{ scale: logoScale.value }],
  }));

  const headlineAnimatedStyle = useAnimatedStyle(() => ({
    opacity: headlineOpacity.value,
    transform: [{ translateY: headlineTranslateY.value }],
  }));

  const cardsAnimatedStyle = useAnimatedStyle(() => ({
    opacity: cardsOpacity.value,
    transform: [{ translateY: cardsTranslateY.value }],
  }));

  const buttonAnimatedStyle = useAnimatedStyle(() => ({
    opacity: buttonOpacity.value,
    transform: [{ translateY: buttonTranslateY.value }],
  }));

  const cardGlowStyle = useAnimatedStyle(() => {
    const borderOpacity = 0.2 + cardGlow.value * 0.15; // Oscillates between 0.2 and 0.35
    return {
      borderColor: `rgba(236, 200, 19, ${borderOpacity})`,
    };
  });

  const handleGetStarted = () => {
    router.push('/verify-phone');
  };

  const handleLogin = () => {
    // Navigate to passcode entry screen for returning users
    router.push('/enter-passcode');
  };

  return (
    <View className="flex-1 bg-background-dark">
      {/* Logo Section */}
      <Animated.View
        style={logoAnimatedStyle}
        className="w-full items-center justify-center pt-12 pb-2"
      >
        <View className="h-16 w-16 items-center justify-center rounded-full bg-[#2a2820] mb-1">
          <Logo size={40} color="#ecc813" />
        </View>
        <Text className="text-white text-lg font-bold">
          PingWage
        </Text>
      </Animated.View>

      {/* Headline */}
      <Animated.Text
        style={headlineAnimatedStyle}
        className="text-white text-[32px] font-bold leading-tight px-6 text-center pb-6 pt-4"
      >
        Get Paid Every Second You Work
      </Animated.Text>

      {/* Feature Cards Grid */}
      <Animated.View style={cardsAnimatedStyle} className="px-4 gap-3">
        {/* First Row - 2 columns */}
        <View className="flex-row gap-3">
          {/* Fast Card */}
          <Animated.View style={cardGlowStyle} className="flex-1 gap-3 rounded-lg border bg-[#27251c] p-4">
            <View>
              <Ionicons name="flash" size={24} color="#ecc813" />
            </View>
            <View className="gap-1">
              <Text className="text-white text-base font-bold leading-tight">
                Fast
              </Text>
              <Text className="text-[#b9b49d] text-sm font-normal leading-normal">
                Instant access to your earnings, anytime you need it.
              </Text>
            </View>
          </Animated.View>

          {/* Fair Card */}
          <Animated.View style={cardGlowStyle} className="flex-1 gap-3 rounded-lg border bg-[#27251c] p-4">
            <View>
              <Ionicons name="pricetag" size={24} color="#ecc813" />
            </View>
            <View className="gap-1">
              <Text className="text-white text-base font-bold leading-tight">
                Fair
              </Text>
              <Text className="text-[#b9b49d] text-sm font-normal leading-normal">
                Transparent, low fees with no hidden costs.
              </Text>
            </View>
          </Animated.View>
        </View>

        {/* Second Row - Full width */}
        <View className="flex-row gap-3">
          <Animated.View style={cardGlowStyle} className="flex-1 gap-3 rounded-lg border bg-[#27251c] p-4">
            <View>
              <Ionicons name="shield-checkmark" size={24} color="#ecc813" />
            </View>
            <View className="gap-1">
              <Text className="text-white text-base font-bold leading-tight">
                Safe
              </Text>
              <Text className="text-[#b9b49d] text-sm font-normal leading-normal">
                Bank-level security to protect your data and privacy.
              </Text>
            </View>
          </Animated.View>
        </View>
      </Animated.View>

      {/* Spacer */}
      <View className="flex-1" />

      {/* Bottom Section - Button & Login Link */}
      <Animated.View style={buttonAnimatedStyle} className="w-full pb-8 pt-4 px-4">
        <Pressable
          onPress={handleGetStarted}
          className="w-full rounded-lg h-12 bg-primary items-center justify-center mb-3 active:opacity-80"
        >
          <Text className="text-background-dark text-base font-bold">
            Get Started
          </Text>
        </Pressable>
        <Text className="text-[#b9b49d] text-sm font-normal leading-normal text-center">
          Already have an account?{' '}
          <Text
            onPress={handleLogin}
            className="font-bold text-white underline"
          >
            Log In
          </Text>
        </Text>
      </Animated.View>
    </View>
  );
}
