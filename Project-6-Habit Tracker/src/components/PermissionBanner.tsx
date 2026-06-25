import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { openNotificationSettings } from '../lib/notifications/setup';

interface PermissionBannerProps {
  onCheckPermissions?: () => void;
}

export default function PermissionBanner({ onCheckPermissions }: PermissionBannerProps) {
  const handleOpenSettings = () => {
    openNotificationSettings();
    // After returning, the user can tap to check permissions or we hook AppState listener to auto-refresh
    if (onCheckPermissions) {
      // Small timeout to allow system settings modal to slide in/out
      setTimeout(onCheckPermissions, 1000);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.iconContainer}>
        <Ionicons name="notifications-off-outline" size={24} color="#F59E0B" />
      </View>
      <View style={styles.textContainer}>
        <Text style={styles.title}>Reminders Disabled</Text>
        <Text style={styles.description}>
          Enable notification permissions in system settings to receive your scheduled reminders.
        </Text>
      </View>
      <Pressable style={styles.button} onPress={handleOpenSettings}>
        <Text style={styles.buttonText}>Enable</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'rgba(245, 158, 11, 0.08)',
    borderColor: 'rgba(245, 158, 11, 0.25)',
    borderWidth: 1,
    borderRadius: 20,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 8,
  },
  iconContainer: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
    marginRight: 8,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 2,
  },
  description: {
    color: '#94A3B8',
    fontSize: 12,
    lineHeight: 16,
  },
  button: {
    backgroundColor: '#F59E0B',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
  },
  buttonText: {
    color: '#0A1628',
    fontSize: 13,
    fontWeight: '700',
  },
});
