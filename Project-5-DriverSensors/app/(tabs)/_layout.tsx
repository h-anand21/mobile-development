import React, { useEffect, useRef, useState } from 'react';
import { View, Animated, StyleSheet } from 'react-native';
import { Tabs, useRouter } from 'expo-router';
import { MaterialCommunityIcons, Feather, AntDesign, Octicons } from '@expo/vector-icons';
import { COLORS } from '../../src/ui/colors';
import { useAppTheme } from '../../src/ui/theme';
import { storage } from '../../src/database/storage';
import { useAccelerometer } from '../../src/hooks/useAccelerometer';
import { useGyroscope } from '../../src/hooks/useGyroscope';
import { useMagnetometer } from '../../src/hooks/useMagnetometer';
import { useDeviceMotion } from '../../src/hooks/useDeviceMotion';
import { useLocation } from '../../src/hooks/useLocation';
import { useDetectionEngine } from '../../src/services/detection/useDetectionEngine';

interface TabIconProps {
  icon: React.ReactNode;
  focused: boolean;
  color: string;
  colors: any;
}

// Custom Tab Bar Icon Component with Spring Pop Scale and Floating Active Pod Animations
function TabIcon({ icon, focused, color, colors }: TabIconProps) {
  const scaleAnim = useRef(new Animated.Value(focused ? 1.15 : 1.0)).current;
  const translateAnim = useRef(new Animated.Value(focused ? -6 : 0)).current;
  const borderOpacityAnim = useRef(new Animated.Value(focused ? 1 : 0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: focused ? 1.15 : 1.0,
        useNativeDriver: true,
        tension: 60,
        friction: 7,
      }),
      Animated.timing(translateAnim, {
        toValue: focused ? -6 : 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(borderOpacityAnim, {
        toValue: focused ? 1 : 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();
  }, [focused]);

  return (
    <View style={styles.tabIconContainer}>
      <Animated.View style={[
        styles.iconPod,
        {
          transform: [
            { scale: scaleAnim },
            { translateY: translateAnim }
          ],
          borderRadius: focused ? 19 : undefined,
          borderColor: focused ? colors.accent : undefined,
          backgroundColor: focused ? (colors.accent + '1c') : undefined, // Transparent accent background
          borderWidth: focused ? 1.5 : undefined,
        }
      ]}>
        {icon}
      </Animated.View>
      {focused && <View style={[styles.indicatorLine, { backgroundColor: colors.accent, shadowColor: colors.accent }]} />}
    </View>
  );
}

export default function TabLayout() {
  // Global hooks execution to track drive sensors in background across tabs
  useAccelerometer();
  useGyroscope();
  useMagnetometer();
  useDeviceMotion();
  useLocation();
  useDetectionEngine();

  const { colors } = useAppTheme();
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkOnboarding = () => {
      const completed = storage.getString('has_completed_onboarding') === 'true';
      if (!completed) {
        router.replace('/onboarding');
      }
      setLoading(false);
    };

    if (storage.isLoaded()) {
      checkOnboarding();
    } else {
      const unsubscribe = storage.onLoad(checkOnboarding);
      const timer = setTimeout(checkOnboarding, 600);
      return () => {
        unsubscribe();
        clearTimeout(timer);
      };
    }
  }, []);

  if (loading) {
    return <View style={{ flex: 1, backgroundColor: colors.background }} />;
  }

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          position: 'absolute',
          bottom: 20,
          left: 20,
          right: 20,
          backgroundColor: colors.tabBarBg, // Opaque based on theme
          borderRadius: 28,
          height: 68,
          paddingBottom: 10,
          paddingTop: 10,
          borderWidth: 1.5,
          borderColor: colors.tabBarBorder, // Dynamic border
          shadowColor: colors.accent,
          shadowOffset: { width: 0, height: 8 },
          shadowOpacity: 0.15,
          shadowRadius: 16,
          elevation: 10,
        },
        tabBarActiveTintColor: colors.accent, // Dynamic accent color
        tabBarInactiveTintColor: colors.textSlate, // Dynamic inactive text
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: 'bold',
          marginTop: 2,
        },
        sceneStyle: { backgroundColor: colors.background },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, focused }) => (
            <TabIcon 
              focused={focused} 
              color={color} 
              colors={colors}
              icon={<AntDesign name="home" size={20} color={color} />} 
            />
          ),
        }}
      />
      <Tabs.Screen
        name="drive"
        options={{
          title: 'Drive',
          tabBarIcon: ({ color, focused }) => (
            <TabIcon 
              focused={focused} 
              color={color} 
              colors={colors}
              icon={<MaterialCommunityIcons name="steering" size={22} color={color} />} 
            />
          ),
        }}
      />
      <Tabs.Screen
        name="dashboard"
        options={{
          title: 'Dashboard',
          tabBarIcon: ({ color, focused }) => (
            <TabIcon 
              focused={focused} 
              color={color} 
              colors={colors}
              icon={<Feather name="bar-chart-2" size={20} color={color} />} 
            />
          ),
        }}
      />
      <Tabs.Screen
        name="history"
        options={{
          title: 'History',
          tabBarIcon: ({ color, focused }) => (
            <TabIcon 
              focused={focused} 
              color={color} 
              colors={colors}
              icon={<Feather name="calendar" size={18} color={color} />} 
            />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          href: null,
          title: 'Profile',
          tabBarIcon: ({ color, focused }) => (
            <TabIcon 
              focused={focused} 
              color={color} 
              colors={colors}
              icon={<Feather name="user" size={20} color={color} />} 
            />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabIconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 48,
    width: 60,
  },
  iconPod: {
    width: 38,
    height: 38,
    alignItems: 'center',
    justifyContent: 'center',
  },
  indicatorLine: {
    position: 'absolute',
    bottom: -10, // Positioned right under the tab text label
    width: 14,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: '#00f5ff',
    shadowColor: '#00f5ff',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 4,
    elevation: 5,
  }
});
