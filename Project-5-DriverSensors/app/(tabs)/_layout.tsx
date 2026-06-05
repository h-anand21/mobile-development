import { Tabs } from 'expo-router';
import { MaterialCommunityIcons, Feather, AntDesign, Octicons } from '@expo/vector-icons';
import { COLORS } from '../../src/ui/colors';
import { useAccelerometer } from '../../src/hooks/useAccelerometer';
import { useGyroscope } from '../../src/hooks/useGyroscope';
import { useMagnetometer } from '../../src/hooks/useMagnetometer';
import { useDeviceMotion } from '../../src/hooks/useDeviceMotion';
import { useLocation } from '../../src/hooks/useLocation';
import { useDetectionEngine } from '../../src/services/detection/useDetectionEngine';

export default function TabLayout() {
  // Global hooks execution to track drive sensors in background across tabs
  useAccelerometer();
  useGyroscope();
  useMagnetometer();
  useDeviceMotion();
  useLocation();
  useDetectionEngine();

  return (
    <Tabs

      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#000000',
          borderTopWidth: 0,
          elevation: 0,
          height: 60,
          paddingBottom: 8,
          paddingTop: 8,
        },
        tabBarActiveTintColor: '#06b6d4', // Cyan-like glow
        tabBarInactiveTintColor: COLORS.textMuted,
        tabBarLabelStyle: {
          fontSize: 10,
          marginTop: 2,
        },
        sceneStyle: { backgroundColor: COLORS.background },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => <AntDesign name="home" size={22} color={color} />,
        }}
      />
      <Tabs.Screen
        name="drive"
        options={{
          title: 'Drive',
          tabBarIcon: ({ color }) => <MaterialCommunityIcons name="steering" size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="dashboard"
        options={{
          title: 'Dashboard',
          tabBarIcon: ({ color }) => <Octicons name="graph" size={20} color={color} />,
        }}
      />
      <Tabs.Screen
        name="history"
        options={{
          title: 'History',
          tabBarIcon: ({ color }) => <Feather name="calendar" size={20} color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color }) => <Feather name="user" size={22} color={color} />,
        }}
      />
    </Tabs>
  );
}
