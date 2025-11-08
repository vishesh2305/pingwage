import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Pressable, View } from 'react-native';

interface BackButtonProps {
  onPress?: () => void;
}

export default function BackButton({ onPress }: BackButtonProps) {
  const router = useRouter();

  const handlePress = () => {
    if (onPress) {
      onPress();
    } else {
      router.back();
    }
  };

  return (
    <Pressable
      onPress={handlePress}
      className="flex h-10 w-10 shrink-0 items-center justify-center active:opacity-70"
    >
      <View className="h-10 w-10 rounded-full bg-white/5 border border-white/10 items-center justify-center">
        <Ionicons name="arrow-back" size={20} color="#F5F5F5" />
      </View>
    </Pressable>
  );
}
