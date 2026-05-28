// ============================================================
// DevNest — Root Layout
// ============================================================
import '../src/global.css';
import { useEffect, useState } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';

import { initDB } from '@/database/db';
import { seedDatabase } from '@/database/seedData';
import { useSettingsStore } from '@/store/settingsStore';
import { useSnippetStore } from '@/store/snippetStore';
import { useFolderStore } from '@/store/folderStore';
import { Colors, useThemeColors } from '@/theme/colors';
import Toast from 'react-native-toast-message';

function RootLayoutNav() {
  const router = useRouter();
  const segments = useSegments();
  const { onboardingDone, profileSetupDone, isLoaded } = useSettingsStore();

  useEffect(() => {
    if (!isLoaded) return;

    const inAuthGroup = segments[0] === '(tabs)';
    const inOnboarding = segments[0] === 'onboarding';
    const inProfileSetup = segments[0] === 'profile-setup';

    if (!onboardingDone && !inOnboarding) {
      router.replace('/onboarding');
    } else if (onboardingDone && !profileSetupDone && !inProfileSetup) {
      router.replace('/profile-setup');
    } else if (onboardingDone && profileSetupDone && !inAuthGroup) {
      router.replace('/(tabs)');
    }
  }, [isLoaded, onboardingDone, profileSetupDone]);

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="onboarding" options={{ headerShown: false, animation: 'fade' }} />
      <Stack.Screen name="profile-setup" options={{ headerShown: false, animation: 'slide_from_right' }} />
      <Stack.Screen name="snippet/create" options={{ headerShown: false, animation: 'slide_from_bottom' }} />
      <Stack.Screen name="snippet/[id]" options={{ headerShown: false, animation: 'slide_from_right' }} />
      <Stack.Screen name="snippet/edit/[id]" options={{ headerShown: false, animation: 'slide_from_right' }} />
      <Stack.Screen name="folder/[id]" options={{ headerShown: false, animation: 'slide_from_right' }} />
      <Stack.Screen name="ai-history" options={{ headerShown: false, animation: 'slide_from_right' }} />
      <Stack.Screen name="templates" options={{ headerShown: false, animation: 'slide_from_right' }} />
      <Stack.Screen name="favorites" options={{ headerShown: false, animation: 'slide_from_right' }} />
      <Stack.Screen name="trash" options={{ headerShown: false, animation: 'slide_from_right' }} />
    </Stack>
  );
}


export default function RootLayout() {
  const [isReady, setIsReady] = useState(false);
  const loadSettings = useSettingsStore(s => s.loadSettings);
  const loadSnippets = useSnippetStore(s => s.loadSnippets);
  const loadFolders = useFolderStore(s => s.loadFolders);
  const colors = useThemeColors();
  const theme = useSettingsStore(s => s.theme);

  useEffect(() => {
    async function init() {
      try {
        await initDB();
        await seedDatabase();
        await loadSettings();
        await Promise.all([loadSnippets(), loadFolders()]);
      } catch (e) {
        console.error('[DevNest] Init error:', e);
      } finally {
        setIsReady(true);
      }
    }
    init();
  }, []);

  if (!isReady) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.bg.primary, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={colors.accent.primary} />
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <BottomSheetModalProvider>
        <StatusBar style={theme === 'light' ? 'dark' : 'light'} backgroundColor={colors.bg.primary} />
        <RootLayoutNav />
        <Toast />
      </BottomSheetModalProvider>
    </GestureHandlerRootView>
  );
}
