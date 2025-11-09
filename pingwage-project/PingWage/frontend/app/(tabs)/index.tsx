import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  Pressable,
  FlatList,
  SafeAreaView,
  StatusBar,
  Image,
  Animated,
  StyleSheet,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAppData } from '../AppDataContext';
import * as Haptics from 'expo-haptics';
import { protectedFetch } from '@/lib/api'; // Import our helper

const ACTIVITY = [
  { id: '1', title: 'Withdrawal - Bank Transfer', date: 'Oct 25, 2023', amount: '- $50.00', type: 'out' },
  { id: '2', title: 'Wages Earned - 8 hours', date: 'Oct 24, 2023', amount: '+ $160.00', type: 'in' },
  { id: '3', title: 'Payday Deposit', date: 'Oct 15, 2023', amount: '+ $1200.00', type: 'in' },
];

// Helper to format currency
const formatCurrency = (amount: number = 0) => {
  return `$${amount.toFixed(2)}`;
};

export default function TabsHomeScreen() {
  const router = useRouter();
  const { isDataLoaded, setIsDataLoaded, employeeName, setEmployeeName } = useAppData();
  const [loading, setLoading] = useState(!isDataLoaded);
  const pulse = useRef(new Animated.Value(0.5)).current;

  // data shown on card - now using state
  const [available, setAvailable] = useState('$0.00');
  const [earnedThisPeriod, setEarnedThisPeriod] = useState('$0.00');
  const [progressPercent, setProgressPercent] = useState(0); // percent width
  const [profilePhoto, setProfilePhoto] = useState<string | null>(null);

  useEffect(() => {
    // If data is already loaded, skip the loading animation
    if (isDataLoaded) {
      setLoading(false);
      return;
    }

    let mounted = true;

    // pulse animation for skeleton
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1, duration: 700, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 0.4, duration: 700, useNativeDriver: true }),
      ])
    ).start();

    const loadAppData = async () => {
      try {
        // 1. Get employee name (saved during profile setup)
        const storedName = await AsyncStorage.getItem('employeeName');
        if (mounted && storedName) {
          setEmployeeName(storedName);
        }

        // 2. Fetch user profile (to get photo_url)
        // This assumes the main login token is saved as 'authToken'
        const profileRes = await protectedFetch('/worker/me', { method: 'GET' }, 'authToken');
        if (mounted && profileRes.success && profileRes.data.profile_photo_url) {
          setProfilePhoto(profileRes.data.profile_photo_url);
        }

        // 3. Fetch current earnings
        const earningsRes = await protectedFetch('/earnings/current', { method: 'GET' }, 'authToken');
        
        if (mounted && earningsRes.success) {
          const data = earningsRes.data;
          
          setAvailable(formatCurrency(data.available_now));
          setEarnedThisPeriod(formatCurrency(data.total_earned));

          // Calculate progress percentage of the pay period
          if (data.pay_period_start && data.pay_period_end) {
            const start = new Date(data.pay_period_start).getTime();
            const end = new Date(data.pay_period_end).getTime();
            const now = Date.now();
            
            let percent = ((now - start) / (end - start)) * 100;
            percent = Math.min(Math.max(percent, 0), 100); // Clamp between 0-100
            setProgressPercent(percent);
          }
        }
      } catch (e) {
        console.warn('Error loading app data', e);
        if (mounted) {
          // Could be an auth error, redirect to login
          // router.replace('/'); 
          Alert.alert("Error", "Could not load your data. Please try logging in again.");
        }
      } finally {
        if (mounted) {
          setLoading(false);
          setIsDataLoaded(true);
        }
      }
    };

    loadAppData();

    return () => {
      mounted = false;
    };
  }, [isDataLoaded]); // Only run once on mount

  const onGetPaidNow = async () => {
    // Satisfying double-tap haptic for important action
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setTimeout(() => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }, 50);
    // TODO: implement payout flow
    // This would navigate to a new screen to confirm amount,
    // then call POST /api/advances/request
    console.log('Get Paid Now tapped');
  };

  const handleActivityPress = (item: typeof ACTIVITY[0]) => {
    // Light tap for list item interaction
    Haptics.selectionAsync();
    console.log('Activity item tapped:', item.title);
  };

  const renderActivity = ({ item }: { item: typeof ACTIVITY[0] }) => {
    const bg =
      item.type === 'in' ? 'rgba(34,197,94,0.12)' : item.type === 'out' ? 'rgba(239,68,68,0.12)' : 'rgba(255,199,0,0.12)';
    const icon = item.type === 'in' ? 'arrow-downward' : item.type === 'out' ? 'arrow-upward' : 'payments';
    const amountColor = item.type === 'in' ? '#10B981' : item.type === 'out' ? '#EF4444' : '#FFC700';

    return (
      <Pressable
        onPress={() => handleActivityPress(item)}
        className="flex-row items-center justify-between px-4 py-3"
      >
        <View className="flex-row items-center gap-4">
          <View style={[styles.activityDot, { backgroundColor: bg }]}>
            <MaterialIcons name={icon as any} size={18} color={item.type === 'in' ? '#10B981' : item.type === 'out' ? '#EF4444' : '#FFC700'} />
          </View>
          <View style={{ maxWidth: '68%' }}>
            <Text className="text-white text-base font-medium">{item.title}</Text>
            <Text className="text-slate-400 text-sm">{item.date}</Text>
          </View>
        </View>

        <Text style={{ color: amountColor }} className="text-base font-medium">
          {item.amount}
        </Text>
      </Pressable>
    );
  };

  // Skeleton view
  const Skeleton = () => (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#181711' }}>
      <StatusBar barStyle="light-content" />
      <View style={{ paddingHorizontal: 16, paddingTop: 14 }}>
        <Animated.View style={{ opacity: pulse, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Animated.View style={[styles.avatarSkeleton, { opacity: pulse }]} />
            <View style={{ marginLeft: 12 }}>
              <Animated.View style={[styles.skelLineShort, { opacity: pulse }]} />
              <Animated.View style={[styles.skelLineSmaller, { opacity: pulse, marginTop: 6 }]} />
            </View>
          </View>
          <Animated.View style={[styles.skelIcon, { opacity: pulse }]} />
        </Animated.View>

        <Animated.View style={[{ opacity: pulse, marginTop: 18 }]}>
          <View style={[styles.card, { height: 150, justifyContent: 'center', alignItems: 'center' }]}>
            <Animated.View style={[styles.skelLineBig, { opacity: pulse }]} />
            <Animated.View style={[styles.skelBar, { opacity: pulse, marginTop: 10 }]} />
          </View>
        </Animated.View>

        <Animated.View style={{ opacity: pulse, marginTop: 14 }}>
          <Animated.View style={[styles.ctaSkel, { opacity: pulse }]} />
        </Animated.View>

        <View style={{ marginTop: 18 }}>
          <Animated.View style={[styles.skelSectionTitle, { opacity: pulse }]} />
          <View style={{ marginTop: 10 }}>
            <Animated.View style={[styles.skelItem, { opacity: pulse }]} />
            <Animated.View style={[styles.skelItem, { opacity: pulse, marginTop: 10 }]} />
            <Animated.View style={[styles.skelItem, { opacity: pulse, marginTop: 10 }]} />
          </View>
        </View>
      </View>
    </SafeAreaView>
  );

  return loading ? (
    <Skeleton />
  ) : (
    <SafeAreaView className="flex-1 bg-background-dark">
      <StatusBar barStyle="light-content" />

      {/* Header */}
      <View className="flex-row items-center justify-between px-4 pt-10 pb-2">
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <View style={styles.avatarWrap}>
            {profilePhoto ? (
              <Image source={{ uri: profilePhoto }} style={styles.avatar} />
            ) : (
              <Ionicons name="person" size={20} color="#A9A9A9" />
            )}
          </View>
          <Text className="text-white text-lg font-bold ml-3">Hi, {employeeName || 'User'}</Text>
        </View>

        <Pressable
          style={{ padding: 6 }}
          onPress={() => router.push('/settings')}
        >
          <Ionicons name="settings-outline" size={22} color="#A9A9A9" />
        </Pressable>
      </View>

      {/* Card */}
      <View className="px-4">
        <View style={styles.card}>
          <Text className="text-slate-400 text-base font-medium text-center">Available to Withdraw</Text>
<Text
  style={{
    fontFamily: 'Manrope_800ExtraBold',
    fontSize: 46,
    color: '#ffffff',
    letterSpacing: -0.5,
    lineHeight: 52,
    textAlign: 'center',
  }}
>
  {available}
</Text>

          <View style={styles.progressWrap}>
            <View style={[styles.progressBarBg]}>
              <View style={[styles.progressBarFill, { width: `${progressPercent}%` }]} />
            </View>
          </View>

          <Text className="text-slate-400 text-sm mt-3">Earned this pay period: {earnedThisPeriod}</Text>
        </View>
      </View>

      {/* CTA */}
      <View className="px-4 py-3">
        <Pressable
          onPress={onGetPaidNow}
          style={[styles.cta, { elevation: 8 }]}
        >
          <Text className="text-black text-lg font-bold">Get Paid Now</Text>
        </Pressable>
      </View>

      {/* Recent Activity heading */}
      <Text className="text-white text-[20px] font-bold px-4 pt-2 pb-2">Recent Activity</Text>

      {/* Activity list */}
      <FlatList
        data={ACTIVITY}
        keyExtractor={(it) => it.id}
        renderItem={renderActivity}
        contentContainerStyle={{ paddingBottom: 120 }}
        ItemSeparatorComponent={() => <View style={{ height: 6 }} />}
      />

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  avatarWrap: {
    width: 44,
    height: 44,
    borderRadius: 44,
    padding: 3,
    backgroundColor: '#2a2820',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatar: { width: 38, height: 38, borderRadius: 38, backgroundColor: '#2a2820' },
  card: {
    backgroundColor: '#121212',
    borderRadius: 14,
    padding: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 6,
  },
  progressWrap: { width: '100%', marginTop: 12, alignItems: 'center' },
  progressBarBg: { width: '100%', height: 10, backgroundColor: '#2f2f2f', borderRadius: 999 },
  progressBarFill: { height: 10, backgroundColor: '#FFC700', borderRadius: 999 },
  cta: {
    width: '100%',
    height: 56,
    borderRadius: 14,
    backgroundColor: '#FFC700',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#FFC700',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.22,
    shadowRadius: 18,
  },
  activityDot: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  // skeleton styles
  avatarSkeleton: { width: 44, height: 44, borderRadius: 44, backgroundColor: '#2f2f2f' },
  //
  // --- THIS IS THE FIX ---
  // Added the missing skelIcon style
  //
  skelIcon: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#2f2f2f' },
  //
  // --- END OF FIX ---
  //
  skelLineShort: { width: 140, height: 12, borderRadius: 6, backgroundColor: '#2f2f2f' },
  skelLineSmaller: { width: 80, height: 10, borderRadius: 6, backgroundColor: '#2f2f2f' },
  skelLineBig: { width: 180, height: 28, borderRadius: 8, backgroundColor: '#2f2f2f' },
  skelBar: { width: '80%', height: 8, borderRadius: 8, backgroundColor: '#2f2f2f' },
  ctaSkel: { width: '100%', height: 56, borderRadius: 14, backgroundColor: '#2f2f2f' },
  skelSectionTitle: { width: 160, height: 18, borderRadius: 8, backgroundColor: '#2f2f2f' },
  skelItem: { width: '100%', height: 64, borderRadius: 12, backgroundColor: '#2f2f2f' },

  bottomTabs: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 84,
    backgroundColor: '#151515',
    borderTopColor: '#1f1f1f',
    borderTopWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingBottom: 10,
    paddingTop: 10,
  },
  tabItem: { alignItems: 'center', justifyContent: 'center' },
  tabIconActive: {
    backgroundColor: '#FFC700',
    width: 38,
    height: 38,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
});