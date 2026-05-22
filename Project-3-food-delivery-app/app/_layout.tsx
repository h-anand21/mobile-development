import 'react-native-gesture-handler';
import { Stack, useRouter, useSegments } from 'expo-router';
import { useEffect, useState } from 'react';
import { ThemeProvider, DarkTheme } from '@react-navigation/native';
import { useAuthStore } from '../store/authStore';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import * as SplashScreen from 'expo-splash-screen';
import { CustomSplashScreen } from '../components/CustomSplashScreen';

// Keep the native splash screen visible while we initialize
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const { isAuthenticated, hasOnboarded } = useAuthStore();
  const segments = useSegments();
  const router = useRouter();
  
  const [appIsReady, setAppIsReady] = useState(false);

  useEffect(() => {
    async function prepareApp() {
      try {
        // Hide the native splash IMMEDIATELY so our custom JS splash shows
        await SplashScreen.hideAsync();
        // Now show our custom splash for 10 seconds
        await new Promise(resolve => setTimeout(resolve, 2000));
      } catch (e) {
        console.warn(e);
      } finally {
        setAppIsReady(true);
      }
    }

    prepareApp();
  }, []);

  useEffect(() => {
    if (!appIsReady) return;

    const inAuthGroup = segments[0] === '(auth)';

    if (!isAuthenticated) {
      if (!hasOnboarded && segments[1] !== 'onboarding') {
        router.replace('/(auth)/onboarding');
      } else if (hasOnboarded && !inAuthGroup) {
        router.replace('/(auth)/login');
      }
    } else if (isAuthenticated && inAuthGroup) {
      router.replace('/(tabs)/home');
    }
  }, [isAuthenticated, hasOnboarded, segments, appIsReady]);

  if (!appIsReady) {
    return <CustomSplashScreen />;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ThemeProvider value={DarkTheme}>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(auth)" options={{ headerShown: false }} />
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="+not-found" />
        </Stack>
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}
