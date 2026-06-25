import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { usePushNotifications } from '../hooks/use-push-notifications';
import { openNotificationSettings } from '../lib/notifications/setup';

export default function NotificationsScreen() {
  const router = useRouter();
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
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        
        {/* Header */}
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="chevron-back" size={24} color="#FFFFFF" />
          </Pressable>
          <Text style={styles.headerTitle}>Notification Center</Text>
          <View style={{ width: 44 }} />
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          
          {/* Permission Status Card */}
          <Text style={styles.sectionLabel}>System Status</Text>
          <View style={[
            styles.statusCard,
            isGranted ? styles.statusCardGranted : styles.statusCardDenied
          ]}>
            <View style={[
              styles.iconCircle,
              { backgroundColor: isGranted ? 'rgba(34, 197, 94, 0.1)' : 'rgba(245, 158, 11, 0.1)' }
            ]}>
              <Ionicons 
                name={isGranted ? 'checkmark-circle' : 'notifications-off'} 
                size={26} 
                color={isGranted ? '#22C55E' : '#F59E0B'} 
              />
            </View>

            <View style={styles.statusDetails}>
              <Text style={styles.statusTitle}>
                {isGranted ? 'Notifications Enabled' : 'Notifications Disabled'}
              </Text>
              <Text style={styles.statusDesc}>
                {isGranted 
                  ? 'Your local habit reminders and push alerts are configured correctly.'
                  : 'You must grant notification permissions to schedule reminders.'}
              </Text>
            </View>

            {!isGranted && (
              <Pressable style={styles.settingsBtn} onPress={handleOpenSettings}>
                <Text style={styles.settingsBtnText}>Settings</Text>
              </Pressable>
            )}
          </View>

          {/* Local Reminders Info */}
          <Text style={styles.sectionLabel}>Local Reminders</Text>
          <View style={styles.infoCard}>
            <View style={styles.infoRow}>
              <Ionicons name="time-outline" size={20} color="#5EEAD4" />
              <View style={styles.infoTextContainer}>
                <Text style={styles.infoTitle}>Background Reminders</Text>
                <Text style={styles.infoDesc}>
                  Reminders are scheduled locally on your device and trigger even if offline.
                </Text>
              </View>
            </View>
            <View style={styles.divider} />
            <View style={styles.infoRow}>
              <Ionicons name="phone-portrait-outline" size={20} color="#5EEAD4" />
              <View style={styles.infoTextContainer}>
                <Text style={styles.infoTitle}>Android Importance Channel</Text>
                <Text style={styles.infoDesc}>
                  Created high-priority "habit-reminders" channel to ensure alerts show as heads-up banners.
                </Text>
              </View>
            </View>
          </View>

          {/* Push Notifications Configuration */}
          <Text style={styles.sectionLabel}>Push Notifications</Text>
          <View style={styles.pushCard}>
            <Text style={styles.pushCardTitle}>Expo Push Token</Text>
            <Text style={styles.pushCardDesc}>
              This unique token allows push servers to send announcements or streak nudges to your device.
            </Text>

            {isRegistering ? (
              <View style={styles.loadingBox}>
                <ActivityIndicator size="small" color="#5EEAD4" />
                <Text style={styles.loadingText}>Fetching Push Token...</Text>
              </View>
            ) : pushToken ? (
              <View style={styles.tokenContainer}>
                <Text style={styles.tokenText} numberOfLines={2}>
                  {pushToken}
                </Text>
                <Pressable style={styles.copyBtn} onPress={copyToken}>
                  <Ionicons name="copy-outline" size={18} color="#0B0F14" />
                  <Text style={styles.copyBtnText}>Copy Token</Text>
                </Pressable>
              </View>
            ) : (
              <View style={styles.tokenErrorBox}>
                <Ionicons name="warning-outline" size={20} color="#F59E0B" />
                <Text style={styles.tokenErrorText}>
                  Push tokens require a physical device and an EAS development build client.
                </Text>
                <Pressable style={styles.retryBtn} onPress={register}>
                  <Text style={styles.retryBtnText}>Retry Registration</Text>
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
    backgroundColor: '#0B0F14',
  },
  container: {
    flex: 1,
    backgroundColor: '#0B0F14',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    height: 56,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(148, 163, 184, 0.06)',
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: '#151A22',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(148, 163, 184, 0.08)',
  },
  headerTitle: {
    fontSize: 18,
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
  statusCard: {
    borderWidth: 1,
    borderRadius: 24,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  statusCardGranted: {
    backgroundColor: 'rgba(34, 197, 94, 0.04)',
    borderColor: 'rgba(34, 197, 94, 0.15)',
  },
  statusCardDenied: {
    backgroundColor: 'rgba(245, 158, 11, 0.04)',
    borderColor: 'rgba(245, 158, 11, 0.15)',
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  statusDetails: {
    flex: 1,
    marginRight: 8,
  },
  statusTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  statusDesc: {
    fontSize: 12,
    color: '#94A3B8',
    lineHeight: 16,
  },
  settingsBtn: {
    backgroundColor: '#F59E0B',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
  },
  settingsBtnText: {
    color: '#0B0F14',
    fontSize: 12,
    fontWeight: '700',
  },
  infoCard: {
    backgroundColor: '#151A22',
    borderWidth: 1,
    borderColor: 'rgba(148, 163, 184, 0.06)',
    borderRadius: 24,
    padding: 16,
    marginBottom: 24,
  },
  infoRow: {
    flexDirection: 'row',
    paddingVertical: 4,
  },
  infoTextContainer: {
    marginLeft: 12,
    flex: 1,
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  infoDesc: {
    fontSize: 12,
    color: '#94A3B8',
    lineHeight: 16,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(148, 163, 184, 0.06)',
    marginVertical: 12,
  },
  pushCard: {
    backgroundColor: '#151A22',
    borderWidth: 1,
    borderColor: 'rgba(148, 163, 184, 0.06)',
    borderRadius: 24,
    padding: 16,
    marginBottom: 20,
  },
  pushCardTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  pushCardDesc: {
    fontSize: 12,
    color: '#94A3B8',
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
    color: '#94A3B8',
    fontSize: 13,
    marginLeft: 10,
  },
  tokenContainer: {
    backgroundColor: '#0B0F14',
    borderRadius: 16,
    padding: 12,
    borderWidth: 0.5,
    borderColor: 'rgba(148, 163, 184, 0.1)',
  },
  tokenText: {
    fontSize: 12,
    fontFamily: 'monospace',
    color: '#94A3B8',
    lineHeight: 16,
    marginBottom: 12,
    textAlign: 'center',
  },
  copyBtn: {
    backgroundColor: '#5EEAD4',
    flexDirection: 'row',
    height: 40,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  copyBtnText: {
    color: '#0B0F14',
    fontWeight: '700',
    fontSize: 13,
    marginLeft: 6,
  },
  tokenErrorBox: {
    backgroundColor: 'rgba(245, 158, 11, 0.03)',
    borderColor: 'rgba(245, 158, 11, 0.1)',
    borderWidth: 1,
    borderRadius: 16,
    padding: 12,
    alignItems: 'center',
  },
  tokenErrorText: {
    color: '#94A3B8',
    fontSize: 11,
    lineHeight: 15,
    textAlign: 'center',
    marginVertical: 8,
  },
  retryBtn: {
    backgroundColor: '#151A22',
    borderColor: 'rgba(245, 158, 11, 0.3)',
    borderWidth: 0.5,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 10,
    marginTop: 4,
  },
  retryBtnText: {
    color: '#F59E0B',
    fontSize: 12,
    fontWeight: '600',
  },
});
