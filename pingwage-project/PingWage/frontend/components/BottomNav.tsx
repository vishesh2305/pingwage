import React from 'react';
import { View, Pressable, Text, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter, usePathname } from 'expo-router';
import * as Haptics from 'expo-haptics';

type Tab = 'dashboard' | 'history' | 'profile' | 'support';

export default function BottomNav() {
  const router = useRouter();
  const pathname = usePathname();

  // Determine active tab from pathname
  const getActiveTab = (): Tab => {
    if (pathname.includes('/history')) return 'history';
    if (pathname.includes('/profile')) return 'profile';
    if (pathname.includes('/support')) return 'support';
    return 'dashboard';
  };

  const active = getActiveTab();

  const tabs = [
    { key: 'dashboard', label: 'Dashboard', icon: 'dashboard', path: '/(tabs)' as const },
    { key: 'history', label: 'History', icon: 'history', path: '/(tabs)/history' as const },
    { key: 'profile', label: 'Profile', icon: 'person', path: '/(tabs)/profile' as const },
    { key: 'support', label: 'Support', icon: 'support-agent', path: '/(tabs)/support' as const },
  ];

  const handleTabPress = (path: any) => {
    Haptics.selectionAsync();
    router.push(path);
  };

  return (
    <View style={styles.container}>
      {tabs.map((t) => {
        const isActive = active === t.key;
        return (
          <Pressable
            key={t.key}
            onPress={() => handleTabPress(t.path)}
            style={styles.tabItem}
          >
            {isActive ? (
              <View style={styles.tabIconActive}>
                <MaterialIcons name={t.icon as any} size={20} color="#181711" />
              </View>
            ) : (
              <MaterialIcons name={t.icon as any} size={22} color="#A9A9A9" />
            )}
            <Text
              style={[
                styles.tabLabel,
                { color: isActive ? '#FFC700' : '#A9A9A9', fontWeight: isActive ? '700' : '500' },
              ]}
            >
              {t.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
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
  tabLabel: {
    fontSize: 12,
    marginTop: 4,
  },
});
