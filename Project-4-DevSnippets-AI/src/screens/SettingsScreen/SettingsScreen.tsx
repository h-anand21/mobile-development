// ============================================================
// DevNest — Settings Screen
// ============================================================
import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Switch } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ArrowLeft, Moon, Bell, Database, HelpCircle, FileText, Smartphone, Fingerprint } from 'lucide-react-native';

import { Colors } from '@/theme/colors';

function SettingRow({ icon: Icon, title, subtitle, value, onToggle, onPress }: any) {
  const content = (
    <>
      <View style={[styles.iconWrap, { backgroundColor: Colors.bg.tertiary }]}>
        <Icon size={20} color={Colors.text.primary} />
      </View>
      <View style={styles.textWrap}>
        <Text style={styles.settingTitle}>{title}</Text>
        {subtitle && <Text style={styles.settingSubtitle}>{subtitle}</Text>}
      </View>
      {onToggle !== undefined ? (
        <Switch 
          value={value} 
          onValueChange={onToggle} 
          trackColor={{ false: Colors.border.primary, true: Colors.accent.primary }}
          thumbColor="#fff"
        />
      ) : (
        <Text style={{ color: Colors.text.tertiary, fontSize: 18 }}>›</Text>
      )}
    </>
  );

  if (onToggle !== undefined) {
    return <View style={styles.settingRow}>{content}</View>;
  }

  return (
    <TouchableOpacity style={styles.settingRow} onPress={onPress}>
      {content}
    </TouchableOpacity>
  );
}

import { useSnippetStore } from '@/store/snippetStore';
import { useFolderStore } from '@/store/folderStore';
import { getDB } from '@/database/db';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { Alert } from 'react-native';
import Toast from 'react-native-toast-message';

export function SettingsScreen() {
  const router = useRouter();
  
  const [isDark, setIsDark] = useState(true);
  const [isNotifications, setIsNotifications] = useState(true);
  const [isBiometric, setIsBiometric] = useState(false);

  const { snippets } = useSnippetStore();
  const { folders } = useFolderStore();

  const handleAppLock = (val: boolean) => {
    setIsBiometric(val);
    if (val) {
      Toast.show({ type: 'info', text1: 'App Lock enabled (Mock)' });
    }
  };

  const handleBackup = async () => {
    try {
      const backupData = {
        version: "1.0",
        date: new Date().toISOString(),
        snippets,
        folders
      };
      
      const fileUri = `${FileSystem.documentDirectory}DevNest_Backup_${Date.now()}.json`;
      await FileSystem.writeAsStringAsync(fileUri, JSON.stringify(backupData, null, 2));
      
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(fileUri);
      } else {
        Toast.show({ type: 'success', text1: 'Backup saved locally!' });
      }
    } catch (e: any) {
      Toast.show({ type: 'error', text1: 'Backup failed', text2: e.message });
    }
  };

  const handleClearCache = () => {
    Alert.alert('Clear Cache', 'This will remove offline AI history. Your snippets are safe.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Clear', style: 'destructive', onPress: async () => {
          try {
            await getDB().runAsync(`DELETE FROM ai_history WHERE isSaved = 0`);
            Toast.show({ type: 'success', text1: 'Cache cleared' });
          } catch(e) {
            Toast.show({ type: 'error', text1: 'Failed to clear cache' });
          }
      }}
    ]);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <ArrowLeft size={24} color={Colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Settings</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 60 }}>
        
        {/* Security Banner */}
        <View style={styles.securityBanner}>
          <View style={styles.securityIcon}>
            <ShieldCheck size={24} color={Colors.bg.primary} />
          </View>
          <View style={styles.securityTextWrap}>
            <Text style={styles.securityTitle}>100% Offline & Secure</Text>
            <Text style={styles.securitySub}>Your code never leaves your device.</Text>
          </View>
        </View>

        {/* Preferences */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Preferences</Text>
        </View>
        <View style={styles.card}>
          <SettingRow 
            icon={Moon} title="Dark Mode" subtitle="Use neon dark theme"
            value={isDark} onToggle={setIsDark}
          />
          <View style={styles.divider} />
          <SettingRow 
            icon={Bell} title="Notifications" subtitle="App updates and tips"
            value={isNotifications} onToggle={setIsNotifications}
          />
        </View>

        {/* Security */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Security & Data</Text>
        </View>
        <View style={styles.card}>
          <SettingRow 
            icon={Fingerprint} title="App Lock" subtitle="Require biometrics to open"
            value={isBiometric} onToggle={handleAppLock}
          />
          <View style={styles.divider} />
          <SettingRow 
            icon={Database} title="Backup Data" subtitle="Export a full JSON backup"
            onPress={handleBackup}
          />
          <View style={styles.divider} />
          <SettingRow 
            icon={Smartphone} title="Clear Cache" subtitle="Free up local space"
            onPress={handleClearCache}
          />
        </View>

        {/* Support */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Support</Text>
        </View>
        <View style={styles.card}>
          <SettingRow icon={HelpCircle} title="Help Center" />
          <View style={styles.divider} />
          <SettingRow icon={FileText} title="Terms & Privacy" />
        </View>

        <Text style={styles.version}>DevNest v1.0.0</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

// Temporary ShieldCheck icon since it wasn't imported in SettingsScreen.tsx
import { ShieldCheck } from 'lucide-react-native';

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg.primary },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingVertical: 12, marginBottom: 16,
  },
  backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: Colors.bg.secondary, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 20, fontWeight: '800', color: Colors.text.primary },

  securityBanner: {
    flexDirection: 'row', alignItems: 'center', marginHorizontal: 24, backgroundColor: Colors.accent.primary,
    padding: 16, borderRadius: 20, marginBottom: 32,
  },
  securityIcon: { width: 48, height: 48, borderRadius: 24, backgroundColor: 'rgba(0,0,0,0.1)', alignItems: 'center', justifyContent: 'center', marginRight: 16 },
  securityTextWrap: { flex: 1 },
  securityTitle: { color: Colors.bg.primary, fontSize: 16, fontWeight: '800', marginBottom: 4 },
  securitySub: { color: 'rgba(0,0,0,0.7)', fontSize: 13, fontWeight: '500' },

  sectionHeader: { paddingHorizontal: 24, marginBottom: 12 },
  sectionTitle: { color: Colors.text.secondary, fontSize: 14, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1 },

  card: { marginHorizontal: 24, backgroundColor: Colors.bg.secondary, borderRadius: 20, paddingVertical: 8, marginBottom: 32, borderWidth: 1, borderColor: Colors.border.primary },
  settingRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 12 },
  iconWrap: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginRight: 16 },
  textWrap: { flex: 1 },
  settingTitle: { color: Colors.text.primary, fontSize: 16, fontWeight: '600' },
  settingSubtitle: { color: Colors.text.tertiary, fontSize: 12, marginTop: 2 },
  divider: { height: 1, backgroundColor: Colors.border.primary, marginLeft: 76 },

  version: { textAlign: 'center', color: Colors.text.tertiary, fontSize: 13, marginTop: 16, marginBottom: 40 },
});
