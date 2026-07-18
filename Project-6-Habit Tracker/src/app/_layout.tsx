import 'react-native-get-random-values';
import { Buffer } from 'buffer';
global.Buffer = global.Buffer || Buffer;
import React, { useEffect, useState } from 'react';
import { Stack, router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import * as Notifications from 'expo-notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ThemeProvider, useTheme } from '../context/ThemeContext';
import { initializeNotificationChannel } from '../lib/notifications/setup';
import { handleNotificationTap } from '../lib/notifications/handlers';

// Inner layout that can access ThemeContext
function AppLayout() {
  const { T, isDark } = useTheme();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    async function prepareApp() {
      try {
        // 1. Initialize custom Android notification channel
        await initializeNotificationChannel();

        // 2. Check onboarding status
        const onboardingCompleted = await AsyncStorage.getItem('ONBOARDING_COMPLETED');
        
        if (onboardingCompleted !== 'true') {
          setTimeout(() => {
            router.replace('/onboarding');
          }, 100);
        }

        // 3. Cold-start: check if app was opened by tapping a notification
        // This handles the case where app was completely closed when user tapped the notification.
        // addNotificationResponseReceivedListener (below) only fires when app is already running.
        const lastResponse = await Notifications.getLastNotificationResponseAsync();
        if (lastResponse) {
          const data = lastResponse.notification.request.content.data;
          handleNotificationTap(data as any);
        }

      } catch (error) {
        console.error('App preparation failed:', error);
      } finally {
        setIsReady(true);
      }
    }

    prepareApp();

    // 3. Register Notification Listeners
    const foregroundSubscription = Notifications.addNotificationReceivedListener(notification => {
      console.log('Foreground notification received:', notification);
    });

    const responseSubscription = Notifications.addNotificationResponseReceivedListener(response => {
      const data = response.notification.request.content.data;
      console.log('Notification response received:', data);
      handleNotificationTap(data as any);
    });

    return () => {
      foregroundSubscription.remove();
      responseSubscription.remove();
    };
  }, []);

  if (!isReady) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: T.bg }]}>
        <ActivityIndicator size="large" color={T.teal} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: T.bg }]}>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: T.bg },
          animation: 'slide_from_right',
        }}
      >
        <Stack.Screen name="index" />
        <Stack.Screen name="onboarding/index" />
        <Stack.Screen name="new" options={{ presentation: 'modal' }} />
        <Stack.Screen name="edit" options={{ presentation: 'modal' }} />
        <Stack.Screen name="habit/[id]" />
        <Stack.Screen name="analytics" />
        <Stack.Screen name="achievements" />
        <Stack.Screen name="notifications" />
        <Stack.Screen name="settings" />
      </Stack>
    </View>
  );
}

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <AppLayout />
      </ThemeProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
