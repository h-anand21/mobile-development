// ============================================================
// DevNest — Profile Screen (Neon UI)
// ============================================================
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Settings, ShieldCheck, User, Shield, CreditCard, Smartphone, Clock, Download, Trash2, LogOut, ChevronRight } from 'lucide-react-native';

import { Colors } from '@/theme/colors';
import { useSettingsStore } from '@/store/settingsStore';
import { useSnippetStore } from '@/store/snippetStore';

const { width } = Dimensions.get('window');

function MenuItem({ icon: Icon, title, color, onPress }: { icon: any, title: string, color: string, onPress?: () => void }) {
  return (
    <TouchableOpacity style={styles.menuItem} onPress={onPress}>
      <View style={[styles.menuIconWrap, { backgroundColor: color + '15' }]}>
        <Icon size={20} color={color} />
      </View>
      <Text style={styles.menuItemTitle}>{title}</Text>
      <ChevronRight size={20} color={Colors.text.tertiary} />
    </TouchableOpacity>
  );
}

export function ProfileScreen() {
  const router = useRouter();
  const { userProfile } = useSettingsStore();
  const { snippets } = useSnippetStore();

  const emoji = userProfile?.avatarIndex !== undefined 
    ? ['👨‍💻', '👩‍💻', '🧑‍💻', '🧑‍🚀', '👨‍🔬', '👩‍🔬', '🤖', '🐱', '🐻', '🦊', '🚀', '⚡'][userProfile.avatarIndex] 
    : '👨‍💻';

  // Calculate mock storage percentage based on snippets count (100 snippets = 100%)
  const storagePercentage = Math.min((snippets.length / 100) * 100, 100);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>
        
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>My <Text style={styles.green}>Profile</Text></Text>
          <TouchableOpacity style={styles.settingsBtn} onPress={() => router.push('/settings' as any)}>
            <Settings size={24} color={Colors.text.primary} />
          </TouchableOpacity>
        </View>

        {/* Avatar & Info */}
        <View style={styles.profileSection}>
          <View style={styles.avatarWrap}>
            <Text style={styles.avatarEmoji}>{emoji}</Text>
          </View>
          <View style={styles.nameWrap}>
            <Text style={styles.name}>{userProfile?.name || 'Developer'}</Text>
            <ShieldCheck size={20} color={Colors.accent.primary} fill={Colors.bg.primary} />
          </View>
          <Text style={styles.handle}>@developer • Pro Member</Text>
        </View>

        {/* Storage Bar */}
        <View style={styles.storageCard}>
          <View style={styles.storageHeader}>
            <Text style={styles.storageTitle}>Local Storage Usage</Text>
            <Text style={styles.storageAmount}>{storagePercentage.toFixed(1)}%</Text>
          </View>
          <View style={styles.storageBarBg}>
            <View style={[styles.storageBarFill, { width: `${storagePercentage}%` }]} />
          </View>
          <Text style={styles.storageSubText}>Your snippets are stored safely offline.</Text>
        </View>

        {/* Account Section */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Account</Text>
        </View>
        <View style={styles.menuCard}>
          <MenuItem icon={User} title="Personal Info" color={Colors.status.info} />
          <MenuItem icon={Shield} title="Security & Lock" color={Colors.status.warning} />
          <MenuItem icon={CreditCard} title="Subscription" color={Colors.accent.primary} />
          <MenuItem icon={Smartphone} title="Connected Devices" color={Colors.text.secondary} />
        </View>

        {/* Activity Section */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Activity</Text>
        </View>
        <View style={styles.menuCard}>
          <MenuItem icon={Clock} title="Recent Activity" color={Colors.status.success} />
          <MenuItem icon={Download} title="Downloads & Export" color={Colors.status.info} />
          <MenuItem icon={Trash2} title="Trash" color={Colors.status.error} />
        </View>

        {/* Log Out */}
        <TouchableOpacity style={styles.logoutBtn}>
          <LogOut size={20} color={Colors.status.error} />
          <Text style={styles.logoutText}>Log Out</Text>
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg.primary },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 24, paddingTop: 16, marginBottom: 32,
  },
  headerTitle: { fontSize: 32, fontWeight: '800', color: Colors.text.primary, letterSpacing: -1 },
  green: { color: Colors.accent.primary },
  settingsBtn: {
    width: 44, height: 44, borderRadius: 22, backgroundColor: Colors.bg.secondary,
    alignItems: 'center', justifyContent: 'center',
  },

  profileSection: { alignItems: 'center', marginBottom: 32 },
  avatarWrap: {
    width: 100, height: 100, borderRadius: 30, backgroundColor: Colors.bg.secondary,
    alignItems: 'center', justifyContent: 'center', marginBottom: 16,
    borderWidth: 2, borderColor: Colors.accent.primary,
  },
  avatarEmoji: { fontSize: 50 },
  nameWrap: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 },
  name: { color: Colors.text.primary, fontSize: 24, fontWeight: '800' },
  handle: { color: Colors.text.secondary, fontSize: 14, fontWeight: '500' },

  storageCard: {
    marginHorizontal: 24, backgroundColor: Colors.bg.secondary, borderRadius: 20,
    padding: 20, marginBottom: 32, borderWidth: 1, borderColor: Colors.border.primary,
  },
  storageHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  storageTitle: { color: Colors.text.primary, fontSize: 15, fontWeight: '700' },
  storageAmount: { color: Colors.accent.primary, fontSize: 15, fontWeight: '800' },
  storageBarBg: { height: 8, backgroundColor: Colors.bg.tertiary, borderRadius: 4, marginBottom: 12, overflow: 'hidden' },
  storageBarFill: { height: '100%', backgroundColor: Colors.accent.primary, borderRadius: 4 },
  storageSubText: { color: Colors.text.tertiary, fontSize: 12 },

  sectionHeader: { paddingHorizontal: 24, marginBottom: 12 },
  sectionTitle: { color: Colors.text.secondary, fontSize: 14, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1 },

  menuCard: {
    marginHorizontal: 24, backgroundColor: Colors.bg.secondary, borderRadius: 20,
    marginBottom: 32, paddingVertical: 8,
  },
  menuItem: {
    flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 12,
  },
  menuIconWrap: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginRight: 16 },
  menuItemTitle: { flex: 1, color: Colors.text.primary, fontSize: 16, fontWeight: '600' },

  logoutBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 12,
    marginHorizontal: 24, backgroundColor: Colors.status.error + '15',
    paddingVertical: 16, borderRadius: 20, marginBottom: 40,
    borderWidth: 1, borderColor: Colors.status.error + '30',
  },
  logoutText: { color: Colors.status.error, fontSize: 16, fontWeight: '700' },
});
