import { Tabs } from 'expo-router';
import { View } from 'react-native';
import { AppDataProvider } from '../../contexts/AppDataContext';
import BottomNav from '@/components/BottomNav';

export default function TabsLayout() {
  return (
    <AppDataProvider>
      <View style={{ flex: 1 }}>
        <Tabs
          screenOptions={{
            headerShown: false,
            animation: 'shift',
            tabBarStyle: { display: 'none' },
          }}
        >
          <Tabs.Screen name="index" />
          <Tabs.Screen name="history" />
          <Tabs.Screen name="profile" />
          <Tabs.Screen name="support" />
        </Tabs>
        <BottomNav />
      </View>
    </AppDataProvider>
  );
}
