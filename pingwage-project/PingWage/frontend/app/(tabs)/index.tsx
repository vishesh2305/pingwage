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
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAppData } from '../AppDataContext';
import * as Haptics from 'expo-haptics';

const ACTIVITY = [
  { id: '1', title: 'Withdrawal - Bank Transfer', date: 'Oct 25, 2023', amount: '- $50.00', type: 'out' },
  { id: '2', title: 'Wages Earned - 8 hours', date: 'Oct 24, 2023', amount: '+ $160.00', type: 'in' },
  { id: '3', title: 'Payday Deposit', date: 'Oct 15, 2023', amount: '+ $1200.00', type: 'in' },
];

export default function TabsHomeScreen() {
  const router = useRouter();
  const { isDataLoaded, setIsDataLoaded, employeeName, setEmployeeName } = useAppData();
  const [loading, setLoading] = useState(!isDataLoaded);
  const pulse = useRef(new Animated.Value(0.5)).current;

  // data shown on card
  const available = '$245.50';
  const earnedThisPeriod = '$850.00';
  const progressPercent = 28; // percent width for progress bar

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

    (async () => {
      // simulate API delay ~2s, and read employeeName if saved
      await new Promise((r) => setTimeout(r, 1200));
      try {
        const stored = await AsyncStorage.getItem('employeeName');
        if (mounted && stored) setEmployeeName(stored);
      } catch (e) {
        console.warn('Error reading employeeName', e);
      } finally {
        // ensure approx 2s total
        setTimeout(() => {
          if (mounted) {
            setLoading(false);
            setIsDataLoaded(true);
          }
        }, 900);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [isDataLoaded]);

  const onGetPaidNow = async () => {
    // Satisfying double-tap haptic for important action
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setTimeout(() => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }, 50);
    // TODO: implement payout flow
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
            <Image
              source={{ uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBSVUQ26YP7WvfIBgCxqIWhxY9_zSQtkyi6Y1BBwWOSiUaZvfiT8FAs0ZP0mr8qLidUIQy9l-T4eSzVeApeQdeV8OIX5sGGr4-nHqN4KdDFfi0HZhsvxhdnMG6ojo5J50BPaRv0VLvoGeWSOp7K3PK0XHlzQ4-DBXShM6dx9P-XT2Aa7OKyJGKKyMxO3cZ9E6WjdsuGJsg_pSD6QMrQtPIfkoPJoIjOBlNKhXnJSGjDzNnqhiYt-K1GN_g1NNekuZjJcJVrQuQx4Rti' }}
              style={styles.avatar}
            />
          </View>
          <Text className="text-white text-lg font-bold ml-3">Hi, {employeeName}</Text>
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
