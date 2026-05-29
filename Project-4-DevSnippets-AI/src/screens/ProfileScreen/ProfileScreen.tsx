// ============================================================
// DevNest — Profile Screen (Neon UI)
// ============================================================
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Settings, ShieldCheck, User, Shield, CreditCard, Smartphone, Clock, Download, Trash2, LogOut, ChevronRight } from 'lucide-react-native';

import { useThemeColors } from '@/theme/colors';
import { useSettingsStore } from '@/store/settingsStore';
import { useSnippetStore } from '@/store/snippetStore';
import { useFolderStore } from '@/store/folderStore';
import { Alert, Modal, TextInput, KeyboardAvoidingView, Platform, Image } from 'react-native';
import { AVATARS } from '@/constants/avatars';

const { width } = Dimensions.get('window');

function MenuItem({ icon: Icon, title, color, colors, styles, onPress }: { icon: any, title: string, color: string, colors: any, styles: any, onPress?: () => void }) {
  return (
    <TouchableOpacity style={styles.menuItem} onPress={onPress}>
      <View style={[styles.menuIconWrap, { backgroundColor: color + '15' }]}>
        <Icon size={20} color={color} />
      </View>
      <Text style={styles.menuItemTitle}>{title}</Text>
      <ChevronRight size={20} color={colors.text.tertiary} />
    </TouchableOpacity>
  );
}

export function ProfileScreen() {
  const router = useRouter();
  const colors = useThemeColors();
  const styles = getStyles(colors);
  
  const { userProfile, setUserProfile, logout } = useSettingsStore();
  const { snippets } = useSnippetStore();
  const { folders } = useFolderStore();

  const [isEditModalVisible, setEditModalVisible] = React.useState(false);
  const [tempName, setTempName] = React.useState(userProfile?.name || '');
  const [tempAvatarIdx, setTempAvatarIdx] = React.useState(userProfile?.avatarIndex || 0);

  const selectedAvatarSource = AVATARS[userProfile?.avatarIndex !== undefined && userProfile.avatarIndex < AVATARS.length ? userProfile.avatarIndex : 0];

  const totalSnippets = snippets.filter(s => !s.isDeleted).length;
  const totalFolders = folders.length;

  const estimatedBytes = snippets.reduce((acc, curr) => acc + curr.title.length + curr.content.length + (curr.description?.length || 0), 0) + (totalSnippets * 100);
  const estimatedKB = (estimatedBytes / 1024).toFixed(1);

  // Dynamic progress bar based on developer milestones (target: 100 snippets)
  const milestoneTarget = 100;
  const storagePercentage = Math.min(Math.round((totalSnippets / milestoneTarget) * 100), 100);

  const handleLogout = () => {
    Alert.alert('Log Out', 'Are you sure you want to log out? Your data will remain on the device.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Log Out', style: 'destructive', onPress: async () => {
          await logout();
          router.replace('/onboarding' as any);
      }}
    ]);
  };

  const handleSaveProfile = () => {
    setUserProfile({
      name: tempName,
      avatarIndex: tempAvatarIdx,
    });
    setEditModalVisible(false);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>
        
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>My <Text style={styles.green}>Profile</Text></Text>
          <TouchableOpacity style={styles.settingsBtn} onPress={() => router.push('/settings' as any)}>
            <Settings size={24} color={colors.text.primary} />
          </TouchableOpacity>
        </View>

        {/* Avatar & Info */}
        <View style={styles.profileSection}>
          <View style={[styles.avatarWrap, { overflow: 'hidden' }]}>
            <Image source={selectedAvatarSource} style={{ width: '100%', height: '100%', resizeMode: 'cover' }} />
          </View>
          <View style={styles.nameWrap}>
            <Text style={styles.name}>{userProfile?.name || 'Developer'}</Text>
            <ShieldCheck size={20} color={colors.accent.primary} fill={colors.bg.primary} />
          </View>
          <Text style={styles.handle}>@developer • Local Mode</Text>
        </View>

        {/* Storage / Milestone Progress Bar */}
        <View style={styles.storageCard}>
          <View style={styles.storageHeader}>
            <Text style={styles.storageTitle}>Milestone Progress</Text>
            <Text style={styles.storageAmount}>{totalSnippets} / {milestoneTarget} Snippets ({storagePercentage}%)</Text>
          </View>
          <View style={styles.storageDetails}>
            <Text style={styles.storageSubText}>Total Snippets: <Text style={styles.storageBold}>{totalSnippets}</Text></Text>
            <Text style={styles.storageSubText}>Total Folders: <Text style={styles.storageBold}>{totalFolders}</Text></Text>
          </View>
          <View style={styles.storageBarBg}>
            <View style={[styles.storageBarFill, { width: `${storagePercentage}%` }]} />
          </View>
          <Text style={styles.unlimitedText}>🟢 Unlimited Offline Storage Active (~{estimatedKB} KB used)</Text>
        </View>

        {/* Account Section */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Account</Text>
        </View>
        <View style={styles.menuCard}>
          <MenuItem icon={User} title="Personal Info" color={colors.status.info} colors={colors} styles={styles} onPress={() => setEditModalVisible(true)} />
          <MenuItem icon={Shield} title="Security & Lock" color={colors.status.warning} colors={colors} styles={styles} onPress={() => router.push('/settings' as any)} />
          <MenuItem icon={CreditCard} title="Subscription" color={colors.accent.primary} colors={colors} styles={styles} onPress={() => Alert.alert('Pro Plan', 'You are on the Pro Plan. Enjoy DevNest!')} />
          <MenuItem icon={Smartphone} title="Connected Devices" color={colors.text.secondary} colors={colors} styles={styles} />
        </View>

        {/* Activity Section */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Activity</Text>
        </View>
        <View style={styles.menuCard}>
          <MenuItem icon={Clock} title="Recent Activity" color={colors.status.success} colors={colors} styles={styles} />
          <MenuItem icon={Download} title="Downloads & Export" color={colors.status.info} colors={colors} styles={styles} onPress={() => router.push('/settings' as any)} />
          <MenuItem icon={Trash2} title="Trash" color={colors.status.error} colors={colors} styles={styles} onPress={() => router.push('/trash' as any)} />
        </View>

        {/* Log Out */}
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <LogOut size={20} color={colors.status.error} />
          <Text style={styles.logoutText}>Log Out</Text>
        </TouchableOpacity>

      </ScrollView>

      {/* Edit Profile Modal */}
      <Modal visible={isEditModalVisible} transparent animationType="slide">
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Edit Profile</Text>
            
            <Text style={styles.modalLabel}>Choose Avatar</Text>
            <View style={styles.emojiGrid}>
              {AVATARS.map((avatar, idx) => (
                <TouchableOpacity 
                  key={idx} 
                  style={[styles.emojiBtn, tempAvatarIdx === idx && styles.emojiBtnActive, { overflow: 'hidden', padding: 0 }]}
                  onPress={() => setTempAvatarIdx(idx)}
                >
                  <Image source={avatar} style={{ width: '100%', height: '100%', resizeMode: 'cover' }} />
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.modalLabel}>Profile Name</Text>
            <TextInput
              style={styles.modalInput}
              value={tempName}
              onChangeText={setTempName}
              placeholder="Your name..."
              placeholderTextColor={colors.text.tertiary}
            />

            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.modalCancel} onPress={() => setEditModalVisible(false)}>
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalSave} onPress={handleSaveProfile}>
                <Text style={styles.modalSaveText}>Save Changes</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}

const getStyles = (colors: any) => ({
  container: { flex: 1, backgroundColor: colors.bg.primary },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 24, paddingTop: 16, marginBottom: 32,
  },
  headerTitle: { fontSize: 32, fontWeight: '800', color: colors.text.primary, letterSpacing: -1 },
  green: { color: colors.accent.primary },
  settingsBtn: {
    width: 44, height: 44, borderRadius: 22, backgroundColor: colors.bg.secondary,
    alignItems: 'center', justifyContent: 'center',
  },

  profileSection: { alignItems: 'center', marginBottom: 32 },
  avatarWrap: {
    width: 100, height: 100, borderRadius: 30, backgroundColor: colors.bg.secondary,
    alignItems: 'center', justifyContent: 'center', marginBottom: 16,
    borderWidth: 2, borderColor: colors.accent.primary,
  },
  avatarEmoji: { fontSize: 50 },
  nameWrap: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 },
  name: { color: colors.text.primary, fontSize: 24, fontWeight: '800' },
  handle: { color: colors.text.secondary, fontSize: 14, fontWeight: '500' },

  storageCard: {
    marginHorizontal: 24, backgroundColor: colors.bg.secondary, borderRadius: 20,
    padding: 20, marginBottom: 32, borderWidth: 1, borderColor: colors.border.primary,
  },
  storageHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  storageTitle: { color: colors.text.primary, fontSize: 15, fontWeight: '700' },
  storageAmount: { color: colors.accent.primary, fontSize: 15, fontWeight: '800' },
  storageBarBg: { height: 8, backgroundColor: colors.bg.tertiary, borderRadius: 4, marginBottom: 12, overflow: 'hidden' },
  storageBarFill: { height: '100%', backgroundColor: colors.accent.primary, borderRadius: 4 },
  storageDetails: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  storageSubText: { color: colors.text.tertiary, fontSize: 13 },
  storageBold: { color: colors.text.primary, fontWeight: '700' },
  unlimitedText: { color: colors.status.success, fontSize: 13, fontWeight: '700', marginTop: 4 },

  sectionHeader: { paddingHorizontal: 24, marginBottom: 12 },
  sectionTitle: { color: colors.text.secondary, fontSize: 14, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1 },

  menuCard: {
    marginHorizontal: 24, backgroundColor: colors.bg.secondary, borderRadius: 20,
    marginBottom: 32, paddingVertical: 8, borderWidth: 1, borderColor: colors.border.primary,
  },
  menuItem: {
    flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 12,
  },
  menuIconWrap: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginRight: 16 },
  menuItemTitle: { flex: 1, color: colors.text.primary, fontSize: 16, fontWeight: '600' },

  logoutBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 12,
    marginHorizontal: 24, backgroundColor: colors.status.error + '15',
    paddingVertical: 16, borderRadius: 20, marginBottom: 40,
    borderWidth: 1, borderColor: colors.status.error + '30',
  },
  logoutText: { color: colors.status.error, fontSize: 16, fontWeight: '700' },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: colors.bg.secondary, borderTopLeftRadius: 32, borderTopRightRadius: 32, padding: 24, paddingBottom: Platform.OS === 'ios' ? 40 : 24 },
  modalTitle: { fontSize: 24, fontWeight: '800', color: colors.text.primary, marginBottom: 24 },
  modalLabel: { fontSize: 14, fontWeight: '600', color: colors.text.secondary, marginBottom: 12, textTransform: 'uppercase', letterSpacing: 1 },
  
  emojiGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 24 },
  emojiBtn: { width: 50, height: 50, borderRadius: 25, backgroundColor: colors.bg.primary, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: 'transparent' },
  emojiBtnActive: { borderColor: colors.accent.primary, backgroundColor: colors.accent.primary + '20' },
  emojiText: { fontSize: 24 },

  modalInput: { backgroundColor: colors.bg.primary, color: colors.text.primary, borderRadius: 16, padding: 16, fontSize: 16, marginBottom: 32, borderWidth: 1, borderColor: colors.border.primary },
  
  modalActions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 12 },
  modalCancel: { paddingVertical: 14, paddingHorizontal: 24, borderRadius: 16, backgroundColor: colors.bg.tertiary },
  modalCancelText: { color: colors.text.primary, fontWeight: '600', fontSize: 16 },
  modalSave: { paddingVertical: 14, paddingHorizontal: 24, borderRadius: 16, backgroundColor: colors.accent.primary },
  modalSaveText: { color: colors.bg.primary, fontWeight: '700', fontSize: 16 },
} as any);
