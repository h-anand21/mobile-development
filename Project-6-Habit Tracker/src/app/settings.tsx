import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, Switch, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import Animated, {
  FadeInDown,
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
} from 'react-native-reanimated';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import { useTheme } from '../context/ThemeContext';

export default function SettingsScreen() {
  const router = useRouter();
  const { T, isDark, toggleTheme } = useTheme();

  const [quietHours,   setQuietHours]   = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);

  useEffect(() => {
    AsyncStorage.multiGet(['SETTINGS_QUIET_HOURS','SETTINGS_SOUND_ENABLED']).then(pairs => {
      if (pairs[0][1] !== null) setQuietHours(pairs[0][1] === 'true');
      if (pairs[1][1] !== null) setSoundEnabled(pairs[1][1] === 'true');
    }).catch(() => {});
  }, []);

  const handleQuietHours = async (val: boolean) => {
    setQuietHours(val);
    await AsyncStorage.setItem('SETTINGS_QUIET_HOURS', String(val));
    if (val) Alert.alert('Quiet Hours', 'Reminders muted 10 PM – 7 AM.');
  };

  const handleSound = async (val: boolean) => {
    setSoundEnabled(val);
    await AsyncStorage.setItem('SETTINGS_SOUND_ENABLED', String(val));
  };

  const handleReset = () => {
    Alert.alert(
      '⚠️ Reset All Data',
      'This will permanently delete all habits, streaks, and cancel all reminders. Cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset Everything', style: 'destructive',
          onPress: async () => {
            try {
              await Notifications.cancelAllScheduledNotificationsAsync();
              await AsyncStorage.clear();
              router.replace('/onboarding/screen1');
            } catch (e) { console.error(e); }
          },
        },
      ]
    );
  };

  // Tab anims
  const s0 = useSharedValue(1), s1 = useSharedValue(1), s2 = useSharedValue(1), s3 = useSharedValue(1);
  const a0 = useAnimatedStyle(() => ({ transform: [{ scale: s0.value }] }));
  const a1 = useAnimatedStyle(() => ({ transform: [{ scale: s1.value }] }));
  const a2 = useAnimatedStyle(() => ({ transform: [{ scale: s2.value }] }));
  const a3 = useAnimatedStyle(() => ({ transform: [{ scale: s3.value }] }));
  const pt = (v: any) => { v.value = withSequence(withSpring(0.8), withSpring(1, { damping: 10 })); };

  // Theme toggle animation
  const toggleScale = useSharedValue(1);
  const toggleStyle = useAnimatedStyle(() => ({ transform: [{ scale: toggleScale.value }] }));
  const handleToggle = () => {
    toggleScale.value = withSequence(withSpring(0.85), withSpring(1, { damping: 8 }));
    toggleTheme();
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: T.bg }]}>
      <View style={[styles.root, { backgroundColor: T.bg }]}>

        {/* Header */}
        <Animated.View entering={FadeInDown.duration(400).springify()} style={styles.header}>
          <Text style={[styles.headerEmoji]}>⚙️</Text>
          <Text style={[styles.headerTitle, { color: T.textPrimary }]}>Settings</Text>
        </Animated.View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

          {/* ── APPEARANCE ── */}
          <Animated.View entering={FadeInDown.delay(80).springify()}>
            <Text style={[styles.sectionLabel, { color: T.textMuted }]}>Appearance</Text>
            <View style={[T.neo, styles.group]}>

              {/* Theme Toggle — big prominent row */}
              <View style={styles.themeRow}>
                <View style={[T.neo, styles.themeIconBig, { backgroundColor: T.bg }]}>
                  <Text style={{ fontSize: 26 }}>{isDark ? '🌙' : '☀️'}</Text>
                </View>
                <View style={styles.themeText}>
                  <Text style={[styles.rowTitle, { color: T.textPrimary }]}>
                    {isDark ? 'Dark Mode' : 'Light Mode'}
                  </Text>
                  <Text style={[styles.rowDesc, { color: T.textMuted }]}>
                    {isDark ? 'Deep blue neumorphic theme' : 'Bright airy neumorphic theme'}
                  </Text>
                </View>
                <Animated.View style={[styles.themeToggleBtn, { backgroundColor: isDark ? T.tealDim : T.yellowDim, borderColor: isDark ? T.tealBorder : T.teal }, toggleStyle]}>
                  <Pressable onPress={handleToggle} style={styles.themeToggleInner}>
                    <View style={[styles.themeThumb, { backgroundColor: isDark ? T.teal : T.yellow, transform: [{ translateX: isDark ? 22 : 0 }] }]} />
                  </Pressable>
                </Animated.View>
              </View>

            </View>
          </Animated.View>

          {/* ── NOTIFICATIONS ── */}
          <Animated.View entering={FadeInDown.delay(140).springify()}>
            <Text style={[styles.sectionLabel, { color: T.textMuted }]}>Notifications</Text>
            <View style={[T.neo, styles.group]}>

              <View style={styles.row}>
                <View style={[T.neo, styles.rowIcon, { backgroundColor: T.bg }]}>
                  <Text style={styles.rowEmoji}>🌙</Text>
                </View>
                <View style={styles.rowText}>
                  <Text style={[styles.rowTitle, { color: T.textPrimary }]}>Quiet Hours</Text>
                  <Text style={[styles.rowDesc, { color: T.textMuted }]}>Mute reminders 10 PM – 7 AM</Text>
                </View>
                <Switch
                  value={quietHours}
                  onValueChange={handleQuietHours}
                  trackColor={{ false: T.border, true: T.teal }}
                  thumbColor={T.bg}
                />
              </View>

              <View style={[styles.divider, { backgroundColor: T.border }]} />

              <View style={styles.row}>
                <View style={[T.neo, styles.rowIcon, { backgroundColor: T.bg }]}>
                  <Text style={styles.rowEmoji}>🔊</Text>
                </View>
                <View style={styles.rowText}>
                  <Text style={[styles.rowTitle, { color: T.textPrimary }]}>Sound Effects</Text>
                  <Text style={[styles.rowDesc, { color: T.textMuted }]}>Play audio for reminders</Text>
                </View>
                <Switch
                  value={soundEnabled}
                  onValueChange={handleSound}
                  trackColor={{ false: T.border, true: T.teal }}
                  thumbColor={T.bg}
                />
              </View>

            </View>
          </Animated.View>

          {/* ── APP CONFIG ── */}
          <Animated.View entering={FadeInDown.delay(200).springify()}>
            <Text style={[styles.sectionLabel, { color: T.textMuted }]}>App Configuration</Text>
            <View style={[T.neo, styles.group]}>

              <Pressable style={({ pressed }) => [styles.row, pressed && { opacity: 0.7 }]}
                onPress={() => router.push('/notifications')}>
                <View style={[T.neo, styles.rowIcon, { backgroundColor: T.bg }]}>
                  <Text style={styles.rowEmoji}>🔔</Text>
                </View>
                <View style={styles.rowText}>
                  <Text style={[styles.rowTitle, { color: T.textPrimary }]}>Notification Registry</Text>
                  <Text style={[styles.rowDesc, { color: T.textMuted }]}>Push tokens & permission status</Text>
                </View>
                <Text style={[styles.chevron, { color: T.textMuted }]}>›</Text>
              </Pressable>

            </View>
          </Animated.View>

          {/* ── DANGER ZONE ── */}
          <Animated.View entering={FadeInDown.delay(260).springify()}>
            <Text style={[styles.sectionLabel, { color: T.textMuted }]}>Danger Zone</Text>
            <View style={[T.neo, styles.group, { borderTopColor: 'rgba(234,94,94,0.2)', borderLeftColor: 'rgba(234,94,94,0.2)' }]}>

              <Pressable style={({ pressed }) => [styles.row, pressed && { opacity: 0.7 }]}
                onPress={handleReset}>
                <View style={[T.neo, styles.rowIcon, { backgroundColor: T.bg }]}>
                  <Text style={styles.rowEmoji}>🗑️</Text>
                </View>
                <View style={styles.rowText}>
                  <Text style={[styles.rowTitle, { color: T.red }]}>Reset Application Data</Text>
                  <Text style={[styles.rowDesc, { color: T.textMuted }]}>Clear all habits & cancel reminders</Text>
                </View>
                <Text style={[styles.chevron, { color: T.red }]}>›</Text>
              </Pressable>

            </View>
          </Animated.View>

          {/* About */}
          <Animated.View entering={FadeInDown.delay(320).springify()} style={styles.about}>
            <Text style={[styles.aboutApp, { color: T.teal }]}>🌿 HabitFlow</Text>
            <Text style={[styles.aboutVer, { color: T.textMuted }]}>Version 1.0.0  ·  Expo SDK 55</Text>
            <Text style={[styles.aboutMode, { color: T.textMuted }]}>{isDark ? '🌙 Dark' : '☀️ Light'} Neumorphic Design</Text>
          </Animated.View>

          <View style={{ height: 110 }} />
        </ScrollView>

        {/* Tab Bar */}
        <View style={[T.neo, styles.tabBar, { backgroundColor: T.tabBg }]}>
          <Pressable style={styles.tabItem} onPressIn={() => pt(s0)} onPress={() => router.push('/')}>
            <Animated.View style={a0}><Text style={styles.tabIcon}>🏠</Text></Animated.View>
            <Text style={[styles.tabLabel, { color: T.textMuted }]}>Home</Text>
          </Pressable>
          <Pressable style={styles.tabItem} onPressIn={() => pt(s1)} onPress={() => router.push('/analytics')}>
            <Animated.View style={a1}><Text style={styles.tabIcon}>📊</Text></Animated.View>
            <Text style={[styles.tabLabel, { color: T.textMuted }]}>Analytics</Text>
          </Pressable>
          <Pressable style={styles.tabItem} onPressIn={() => pt(s2)} onPress={() => router.push('/achievements')}>
            <Animated.View style={a2}><Text style={styles.tabIcon}>🏆</Text></Animated.View>
            <Text style={[styles.tabLabel, { color: T.textMuted }]}>Badges</Text>
          </Pressable>
          <Pressable style={styles.tabItem} onPressIn={() => pt(s3)} onPress={() => {}}>
            <Animated.View style={[styles.tabActive, { backgroundColor: T.tealDim, borderColor: T.tealBorder }, a3]}>
              <Text style={styles.tabIcon}>⚙️</Text>
            </Animated.View>
            <Text style={[styles.tabLabel, { color: T.teal }]}>Settings</Text>
          </Pressable>
        </View>

      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  root: { flex: 1 },

  header: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 20, paddingTop: 12, paddingBottom: 14 },
  headerEmoji: { fontSize: 22 },
  headerTitle: { fontSize: 20, fontWeight: '800' },

  scroll: { paddingHorizontal: 16, paddingTop: 4 },
  sectionLabel: { fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1.2, marginBottom: 8, marginTop: 12, paddingLeft: 4 },
  group: { borderRadius: 22, paddingHorizontal: 14, paddingVertical: 6, marginBottom: 6 },

  // Theme row — big and prominent
  themeRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 16 },
  themeIconBig: { width: 56, height: 56, borderRadius: 18, alignItems: 'center', justifyContent: 'center', marginRight: 14 },
  themeText: { flex: 1, marginRight: 12 },
  themeToggleBtn: {
    width: 52, height: 30, borderRadius: 15, borderWidth: 1,
    justifyContent: 'center', paddingHorizontal: 3,
  },
  themeToggleInner: { flex: 1, justifyContent: 'center' },
  themeThumb: { width: 24, height: 24, borderRadius: 12 },

  // Normal row
  row: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12 },
  rowIcon: { width: 40, height: 40, borderRadius: 14, alignItems: 'center', justifyContent: 'center', marginRight: 14 },
  rowEmoji: { fontSize: 18 },
  rowText: { flex: 1, marginRight: 10 },
  rowTitle: { fontSize: 15, fontWeight: '700', marginBottom: 2 },
  rowDesc:  { fontSize: 11, lineHeight: 16 },
  chevron:  { fontSize: 22, fontWeight: '300' },
  divider:  { height: 1, marginVertical: 2 },

  about: { alignItems: 'center', paddingVertical: 20 },
  aboutApp:  { fontSize: 16, fontWeight: '800', marginBottom: 4 },
  aboutVer:  { fontSize: 12, marginBottom: 4 },
  aboutMode: { fontSize: 11, fontStyle: 'italic' },

  tabBar: { position: 'absolute', bottom: 18, left: 14, right: 14, height: 68, borderRadius: 28, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around' },
  tabItem: { alignItems: 'center', justifyContent: 'center', width: 68 },
  tabActive: { borderRadius: 14, width: 44, height: 32, alignItems: 'center', justifyContent: 'center', borderWidth: 1 },
  tabIcon:   { fontSize: 18 },
  tabLabel:  { fontSize: 9, fontWeight: '700', marginTop: 4, textTransform: 'uppercase' },
});
