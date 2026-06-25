import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, Switch, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';

export default function SettingsScreen() {
  const router = useRouter();

  // Settings states
  const [quietHours, setQuietHours] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Load settings on mount
  useEffect(() => {
    async function loadSettings() {
      try {
        const quiet = await AsyncStorage.getItem('SETTINGS_QUIET_HOURS');
        const sound = await AsyncStorage.getItem('SETTINGS_SOUND_ENABLED');
        if (quiet !== null) setQuietHours(quiet === 'true');
        if (sound !== null) setSoundEnabled(sound === 'true');
      } catch (e) {
        console.error('Failed to load settings', e);
      }
    }
    loadSettings();
  }, []);

  const handleToggleQuietHours = async (val: boolean) => {
    setQuietHours(val);
    await AsyncStorage.setItem('SETTINGS_QUIET_HOURS', String(val));
    if (val) {
      Alert.alert('Quiet Hours Active', 'Reminders will be muted during late night hours (10:00 PM - 07:00 AM).');
    }
  };

  const handleToggleSound = async (val: boolean) => {
    setSoundEnabled(val);
    await AsyncStorage.setItem('SETTINGS_SOUND_ENABLED', String(val));
  };

  const handleResetData = () => {
    Alert.alert(
      'Reset All Data',
      'This will permanently delete all habits, streaks, and cancel ALL scheduled reminders. This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset Everything',
          style: 'destructive',
          onPress: async () => {
            try {
              // 1. Cancel all notifications at OS level
              await Notifications.cancelAllScheduledNotificationsAsync();
              // 2. Clear local storage
              await AsyncStorage.clear();
              // 3. Route to onboarding
              router.replace('/onboarding/screen1');
            } catch (error) {
              console.error('Failed to reset app data:', error);
            }
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Settings</Text>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          
          {/* Preferences Section */}
          <Text style={styles.sectionLabel}>Preferences</Text>
          <View style={styles.settingsGroup}>
            
            <View style={styles.settingRow}>
              <View style={styles.settingTextContainer}>
                <Text style={styles.settingTitle}>Quiet Hours (DND)</Text>
                <Text style={styles.settingDesc}>Mute reminders between 10 PM and 7 AM</Text>
              </View>
              <Switch
                value={quietHours}
                onValueChange={handleToggleQuietHours}
                trackColor={{ false: '#1C2330', true: '#5EEAD4' }}
                thumbColor={quietHours ? '#0B0F14' : '#94A3B8'}
              />
            </View>

            <View style={styles.divider} />

            <View style={styles.settingRow}>
              <View style={styles.settingTextContainer}>
                <Text style={styles.settingTitle}>Sound Effects</Text>
                <Text style={styles.settingDesc}>Play sounds for reminder banners</Text>
              </View>
              <Switch
                value={soundEnabled}
                onValueChange={handleToggleSound}
                trackColor={{ false: '#1C2330', true: '#5EEAD4' }}
                thumbColor={soundEnabled ? '#0B0F14' : '#94A3B8'}
              />
            </View>

          </View>

          {/* Configuration Section */}
          <Text style={styles.sectionLabel}>App Configuration</Text>
          <View style={styles.settingsGroup}>
            
            <Pressable style={styles.navigationRow} onPress={() => router.push('/notifications')}>
              <View style={styles.settingTextContainer}>
                <Text style={styles.settingTitle}>Notification Registry</Text>
                <Text style={styles.settingDesc}>Expo Push Tokens & permissions status</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color="#94A3B8" />
            </Pressable>

          </View>

          {/* Danger Zone Section */}
          <Text style={styles.sectionLabel}>Danger Zone</Text>
          <View style={[styles.settingsGroup, styles.dangerGroup]}>
            
            <Pressable style={styles.navigationRow} onPress={handleResetData}>
              <View style={styles.settingTextContainer}>
                <Text style={[styles.settingTitle, styles.dangerText]}>Reset Application Data</Text>
                <Text style={styles.settingDesc}>Clear storage & cancel all notification triggers</Text>
              </View>
              <Ionicons name="trash-outline" size={18} color="#FF4949" />
            </Pressable>

          </View>

          {/* About Version */}
          <View style={styles.aboutContainer}>
            <Text style={styles.aboutTitle}>HabitFlow</Text>
            <Text style={styles.aboutVersion}>Version 1.0.0 (Expo SDK 55)</Text>
            <Text style={styles.aboutCredit}>Built with premium dark aesthetics 🌿</Text>
          </View>

          <View style={{ height: 100 }} />
        </ScrollView>

        {/* Floating Custom Navigation Bar */}
        <View style={styles.tabBar}>
          <Pressable style={styles.tabItem} onPress={() => router.push('/')}>
            <Ionicons name="home-outline" size={22} color="#94A3B8" />
            <Text style={styles.tabLabel}>Home</Text>
          </Pressable>

          <Pressable style={styles.tabItem} onPress={() => router.push('/analytics')}>
            <Ionicons name="bar-chart-outline" size={22} color="#94A3B8" />
            <Text style={styles.tabLabel}>Analytics</Text>
          </Pressable>

          <Pressable style={styles.tabItem} onPress={() => router.push('/achievements')}>
            <Ionicons name="trophy-outline" size={22} color="#94A3B8" />
            <Text style={styles.tabLabel}>Badges</Text>
          </Pressable>

          <Pressable style={styles.tabItem} onPress={() => {}}>
            <Ionicons name="settings" size={22} color="#5EEAD4" />
            <Text style={[styles.tabLabel, { color: '#5EEAD4' }]}>Settings</Text>
          </Pressable>
        </View>

      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#0B0F14',
  },
  container: {
    flex: 1,
    backgroundColor: '#0B0F14',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(148, 163, 184, 0.06)',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  scrollContent: {
    padding: 20,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#94A3B8',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 10,
    marginTop: 10,
  },
  settingsGroup: {
    backgroundColor: '#151A22',
    borderWidth: 1,
    borderColor: 'rgba(148, 163, 184, 0.06)',
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginBottom: 24,
  },
  dangerGroup: {
    borderColor: 'rgba(255, 73, 73, 0.15)',
    backgroundColor: 'rgba(255, 73, 73, 0.01)',
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
  },
  navigationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(148, 163, 184, 0.06)',
  },
  settingTextContainer: {
    flex: 1,
    marginRight: 12,
  },
  settingTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  dangerText: {
    color: '#FF4949',
  },
  settingDesc: {
    fontSize: 12,
    color: '#94A3B8',
    lineHeight: 16,
  },
  aboutContainer: {
    alignItems: 'center',
    marginTop: 20,
  },
  aboutTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  aboutVersion: {
    fontSize: 12,
    color: '#94A3B8',
    marginBottom: 2,
  },
  aboutCredit: {
    fontSize: 11,
    color: '#5EEAD4',
    fontStyle: 'italic',
  },
  tabBar: {
    position: 'absolute',
    bottom: 24,
    left: 20,
    right: 20,
    height: 64,
    backgroundColor: 'rgba(21, 26, 34, 0.85)',
    borderRadius: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    borderWidth: 1,
    borderColor: 'rgba(148, 163, 184, 0.08)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 15,
    elevation: 8,
  },
  tabItem: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    width: 60,
  },
  tabLabel: {
    fontSize: 10,
    color: '#94A3B8',
    fontWeight: '500',
    marginTop: 4,
  },
});
