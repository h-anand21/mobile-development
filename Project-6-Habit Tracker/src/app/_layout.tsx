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
import { initializeNotificationChannel } from '../lib/notifications/setup';
import { handleNotificationTap } from '../lib/notifications/handlers';

export default function RootLayout() {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    async function prepareApp() {
      try {
        // 1. Initialize custom Android notification channel
        await initializeNotificationChannel();

        // 2. Check onboarding status
        const onboardingCompleted = await AsyncStorage.getItem('ONBOARDING_COMPLETED');
        
        if (onboardingCompleted !== 'true') {
          // If not completed, route to onboarding screen 1
          setTimeout(() => {
            router.replace('/onboarding/screen1');
          }, 100);
        }
      } catch (error) {
        console.error('App preparation failed:', error);
      } finally {
        setIsReady(true);
      }
    }

    prepareApp();

    // 3. Register Notification Listeners

    // Listener for when a notification is received in the foreground
    const foregroundSubscription = Notifications.addNotificationReceivedListener(notification => {
      console.log('Foreground notification received:', notification);
      // You can trigger custom visual feedback here if desired
    });

    // Listener for when the user taps on a notification (foreground or background)
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
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#5EEAD4" />
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <View style={styles.container}>
        <StatusBar style="light" />
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: '#0A1628' },
            animation: 'slide_from_right',
          }}
        >
          <Stack.Screen name="index" />
          <Stack.Screen name="onboarding/screen1" />
          <Stack.Screen name="onboarding/screen2" />
          <Stack.Screen name="onboarding/screen3" />
          <Stack.Screen name="new" options={{ presentation: 'modal' }} />
          <Stack.Screen name="edit" options={{ presentation: 'modal' }} />
          <Stack.Screen name="habit/[id]" />
          <Stack.Screen name="analytics" />
          <Stack.Screen name="achievements" />
          <Stack.Screen name="notifications" />
          <Stack.Screen name="settings" />
        </Stack>
      </View>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A1628',
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: '#0A1628',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
