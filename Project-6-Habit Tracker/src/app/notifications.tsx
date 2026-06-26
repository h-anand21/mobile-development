import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { usePushNotifications } from '../hooks/use-push-notifications';
import { openNotificationSettings } from '../lib/notifications/setup';
import { useTheme } from '../context/ThemeContext';

export default function NotificationsScreen() {
  const router = useRouter();
  const { T, isDark } = useTheme();
  const {
    pushToken,
    permissionStatus,
    isRegistering,
    register,
    copyToken,
    checkPermissions,
  } = usePushNotifications();

  // Try to register when loading the screen to get/refresh token
  useEffect(() => {
    register();
    checkPermissions();
  }, []);

  const handleOpenSettings = () => {
    openNotificationSettings();
    // Re-check permissions after a small delay
    setTimeout(checkPermissions, 1500);
  };

  const isGranted = permissionStatus === 'granted';

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: T.bg }]}>
      <View style={[styles.container, { backgroundColor: T.bg }]}>
        
        {/* Header */}
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={({ pressed }) => [T.neo, styles.backButton, pressed && { opacity: 0.7 }]}>
            <Text style={{ fontSize: 18, color: T.textPrimary }}>←</Text>
          </Pressable>
          <Text style={[styles.headerTitle, { color: T.textPrimary }]}>Notification Center</Text>
          <View style={{ width: 44 }} />
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          
          {/* Permission Status Card */}
          <Text style={[styles.sectionLabel, { color: T.textMuted }]}>System Status</Text>
          <View style={[
            T.neo,
            styles.statusCard,
            { borderLeftWidth: 4, borderLeftColor: isGranted ? T.green : T.orange }
          ]}>
            <View style={[
              styles.iconCircle,
              { backgroundColor: isGranted ? T.greenDim : T.orangeDim }
            ]}>
              <Text style={{ fontSize: 22 }}>{isGranted ? '🔔' : '🔕'}</Text>
            </View>

            <View style={styles.statusDetails}>
              <Text style={[styles.statusTitle, { color: T.textPrimary }]}>
                {isGranted ? 'Notifications Enabled' : 'Notifications Disabled'}
              </Text>
              <Text style={[styles.statusDesc, { color: T.textMuted }]}>
                {isGranted 
                  ? 'Your local habit reminders and push alerts are configured correctly.'
                  : 'You must grant notification permissions to schedule reminders.'}
              </Text>
            </View>

            {!isGranted && (
              <Pressable style={({ pressed }) => [T.neo, styles.settingsBtn, pressed && { opacity: 0.8 }]} onPress={handleOpenSettings}>
                <Text style={[styles.settingsBtnText, { color: T.orange }]}>Settings</Text>
              </Pressable>
            )}
          </View>

          {/* Local Reminders Info */}
          <Text style={[styles.sectionLabel, { color: T.textMuted }]}>Local Reminders</Text>
          <View style={[T.neo, styles.infoCard]}>
            <View style={styles.infoRow}>
              <Text style={{ fontSize: 22, marginRight: 12 }}>⏰</Text>
              <View style={styles.infoTextContainer}>
                <Text style={[styles.infoTitle, { color: T.textPrimary }]}>Background Reminders</Text>
                <Text style={[styles.infoDesc, { color: T.textMuted }]}>
                  Reminders are scheduled locally on your device and trigger even if offline.
                </Text>
              </View>
            </View>
            <View style={[styles.divider, { backgroundColor: T.border }]} />
            <View style={styles.infoRow}>
              <Text style={{ fontSize: 22, marginRight: 12 }}>📱</Text>
              <View style={styles.infoTextContainer}>
                <Text style={[styles.infoTitle, { color: T.textPrimary }]}>Android Importance Channel</Text>
                <Text style={[styles.infoDesc, { color: T.textMuted }]}>
                  Created high-priority "habit-reminders" channel to ensure alerts show as heads-up banners.
                </Text>
              </View>
            </View>
          </View>

          {/* Push Notifications Configuration */}
          <Text style={[styles.sectionLabel, { color: T.textMuted }]}>Push Notifications</Text>
          <View style={[T.neo, styles.pushCard]}>
            <Text style={[styles.pushCardTitle, { color: T.textPrimary }]}>Expo Push Token</Text>
            <Text style={[styles.pushCardDesc, { color: T.textMuted }]}>
              This unique token allows push servers to send announcements or streak nudges to your device.
            </Text>

            {isRegistering ? (
              <View style={styles.loadingBox}>
                <ActivityIndicator size="small" color={T.teal} />
                <Text style={[styles.loadingText, { color: T.textMuted }]}>Fetching Push Token...</Text>
              </View>
            ) : pushToken ? (
              <View style={[T.neoPressed, styles.tokenContainer, { backgroundColor: T.bgPress }]}>
                <Text style={[styles.tokenText, { color: T.textSub }]} numberOfLines={2}>
                  {pushToken}
                </Text>
                <Pressable style={({ pressed }) => [T.neo, styles.copyBtn, pressed && { opacity: 0.8 }]} onPress={copyToken}>
                  <Text style={{ fontSize: 16, marginRight: 6 }}>📋</Text>
                  <Text style={[styles.copyBtnText, { color: T.teal }]}>Copy Token</Text>
                </Pressable>
              </View>
            ) : (
              <View style={[styles.tokenErrorBox, { borderColor: T.orangeDim }]}>
                <Text style={{ fontSize: 22 }}>⚠️</Text>
                <Text style={[styles.tokenErrorText, { color: T.textMuted }]}>
                  Push tokens require a physical device and an EAS development build client.
                </Text>
                <Pressable style={({ pressed }) => [T.neo, styles.retryBtn, pressed && { opacity: 0.8 }]} onPress={register}>
                  <Text style={[styles.retryBtnText, { color: T.orange }]}>Retry Registration</Text>
                </Pressable>
              </View>
            )}
          </View>

          <View style={{ height: 40 }} />
        </ScrollView>

      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    height: 56,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
  },
  scrollContent: {
    padding: 20,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1.2,
    marginBottom: 8,
    marginTop: 14,
    paddingLeft: 4,
  },
  statusCard: {
    borderRadius: 22,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  iconCircle: {
    width: 46,
    height: 46,
    borderRadius: 23,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  statusDetails: {
    flex: 1,
    marginRight: 8,
  },
  statusTitle: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 2,
  },
  statusDesc: {
    fontSize: 12,
    lineHeight: 16,
  },
  settingsBtn: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
  },
  settingsBtnText: {
    fontSize: 12,
    fontWeight: '700',
  },
  infoCard: {
    borderRadius: 22,
    padding: 16,
    marginBottom: 20,
  },
  infoRow: {
    flexDirection: 'row',
    paddingVertical: 4,
    alignItems: 'center',
  },
  infoTextContainer: {
    marginLeft: 6,
    flex: 1,
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 2,
  },
  infoDesc: {
    fontSize: 12,
    lineHeight: 16,
  },
  divider: {
    height: 1,
    marginVertical: 12,
  },
  pushCard: {
    borderRadius: 22,
    padding: 16,
    marginBottom: 20,
  },
  pushCardTitle: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 4,
  },
  pushCardDesc: {
    fontSize: 12,
    lineHeight: 16,
    marginBottom: 16,
  },
  loadingBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
  },
  loadingText: {
    fontSize: 13,
    marginLeft: 10,
  },
  tokenContainer: {
    borderRadius: 18,
    padding: 12,
    borderWidth: 0.5,
    borderColor: 'rgba(148, 163, 184, 0.1)',
  },
  tokenText: {
    fontSize: 12,
    fontFamily: 'monospace',
    lineHeight: 16,
    marginBottom: 12,
    textAlign: 'center',
  },
  copyBtn: {
    flexDirection: 'row',
    height: 40,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  copyBtnText: {
    fontWeight: '700',
    fontSize: 13,
  },
  tokenErrorBox: {
    borderRadius: 18,
    borderWidth: 1,
    padding: 12,
    alignItems: 'center',
  },
  tokenErrorText: {
    fontSize: 11,
    lineHeight: 15,
    textAlign: 'center',
    marginVertical: 8,
  },
  retryBtn: {
    borderWidth: 0.5,
    borderColor: 'rgba(148, 163, 184, 0.1)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 10,
    marginTop: 4,
  },
  retryBtnText: {
    fontSize: 12,
    fontWeight: '600',
  },
});
