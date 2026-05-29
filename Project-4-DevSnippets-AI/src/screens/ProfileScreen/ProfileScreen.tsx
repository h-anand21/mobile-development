// ============================================================
// DevNest — Profile Screen (Neon UI)
// ============================================================
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Settings, ShieldCheck, User, Shield, CreditCard, Smartphone, Clock, Download, Trash2, LogOut, ChevronRight, Code, Folder, Cloud, Wifi, Lock, Bot, RefreshCw, Monitor, Hexagon, Flame } from 'lucide-react-native';

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
      <View style={styles.menuIconWrap}>
        <Icon size={20} color={color} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.menuItemTitle}>{title}</Text>
      </View>
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

        {/* Hero Card */}
        <View style={styles.heroCard}>
           <View style={styles.localModeBadge}>
             <Monitor size={12} color={colors.accent.primary} />
             <Text style={styles.localModeText}>Local Mode</Text>
           </View>
           
           <View style={{ flexDirection: 'row', alignItems: 'flex-start', marginTop: 12 }}>
             <View style={styles.avatarColumn}>
               <View style={styles.heroAvatarWrap}>
                 <Image source={selectedAvatarSource} style={{ width: '100%', height: '100%', resizeMode: 'cover' }} />
               </View>
             </View>
             <View style={styles.infoColumn}>
               <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                 <Text style={styles.heroName} numberOfLines={1}>{userProfile?.name || 'Developer'}</Text>
                 <ShieldCheck size={18} color={colors.accent.primary} fill={colors.bg.secondary} />
               </View>
               <Text style={styles.heroHandle}>@developer</Text>
               <Text style={styles.heroRole}>Full Stack Developer 🚀</Text>
               <Text style={styles.heroBio} numberOfLines={1}>{userProfile?.bio || 'Offline-First Builder'}</Text>
               
               <View style={styles.skillsRow}>
                 <View style={[styles.skillBadge, { backgroundColor: '#F7DF1E20', borderColor: '#F7DF1E40' }]}><Text style={[styles.skillText, { color: '#F7DF1E' }]}>JS</Text></View>
                 <View style={[styles.skillBadge, { backgroundColor: '#3178C620', borderColor: '#3178C640' }]}><Text style={[styles.skillText, { color: '#3178C6' }]}>TS</Text></View>
                 <View style={[styles.skillBadge, { backgroundColor: '#61DAFB20', borderColor: '#61DAFB40' }]}><Settings size={12} color="#61DAFB" /></View>
                 <View style={[styles.skillBadge, { backgroundColor: '#33993320', borderColor: '#33993340' }]}><Text style={[styles.skillText, { color: '#339933' }]}>Node</Text></View>
                 <View style={[styles.skillBadge, { backgroundColor: colors.bg.tertiary, borderColor: colors.border.primary }]}><Text style={[styles.skillText, { color: colors.text.secondary }]}>+3</Text></View>
               </View>
             </View>
           </View>

           <View style={styles.badgesRow}>
             <View style={styles.badgeBox}>
               <Hexagon size={28} color={colors.accent.primary} />
               <View style={{ marginLeft: 8 }}>
                 <Text style={{ color: colors.text.primary, fontSize: 13, fontWeight: '700' }}>Level 1</Text>
                 <Text style={{ color: colors.accent.primary, fontSize: 11, fontWeight: '600' }}>Beginner</Text>
               </View>
             </View>
             <View style={styles.badgeDivider} />
             <View style={styles.badgeBox}>
               <Flame size={28} color="#FF5722" />
               <View style={{ marginLeft: 8 }}>
                 <Text style={{ color: colors.text.primary, fontSize: 13, fontWeight: '700' }}>12</Text>
                 <Text style={{ color: colors.text.secondary, fontSize: 11, fontWeight: '500' }}>Day Streak</Text>
               </View>
             </View>
           </View>
        </View>

        {/* Milestone Progress */}
        <View style={styles.storageCard}>
          <View style={styles.storageHeader}>
            <Text style={styles.storageTitle}>Milestone Progress</Text>
            <Text style={styles.storageAmount}><Text style={{ color: colors.accent.primary }}>{totalSnippets}</Text> / {milestoneTarget} Snippets ({storagePercentage}%)</Text>
          </View>
          <View style={styles.storageBarBg}>
            <View style={[styles.storageBarFill, { width: `${storagePercentage}%` }]} />
          </View>
          <View style={styles.storageDetails}>
            <Text style={styles.storageSubText}>Total Snippets: <Text style={styles.storageBold}>{totalSnippets}</Text></Text>
            <Text style={styles.storageSubText}>Total Folders: <Text style={styles.storageBold}>{totalFolders}</Text></Text>
          </View>
          <TouchableOpacity 
            style={{ flexDirection: 'row', alignItems: 'center', marginTop: 12, justifyContent: 'space-between' }}
            onPress={() => Alert.alert('Storage Details', 'Your offline storage is functioning optimally and securely.')}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
               <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: colors.accent.primary }} />
               <Text style={styles.unlimitedText}>Unlimited Offline Storage Active (~{estimatedKB} KB used)</Text>
            </View>
            <ChevronRight size={16} color={colors.text.secondary} />
          </TouchableOpacity>
        </View>

        {/* Stats Grid */}
        <View style={styles.statsGrid}>
          <View style={styles.statBox}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 12 }}>
              <View style={[styles.statIconWrap, { borderColor: colors.accent.primary + '40' }]}><Code size={20} color={colors.accent.primary} /></View>
              <View>
                <Text style={styles.statBoxNumber}>{totalSnippets}</Text>
                <Text style={styles.statBoxTitle}>Snippets</Text>
              </View>
            </View>
            <View style={{ width: '100%', height: 1, backgroundColor: colors.border.primary, marginBottom: 8 }} />
            <Text style={styles.statBoxSub}>Total Snippets</Text>
          </View>
          <View style={styles.statBox}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 12 }}>
              <View style={[styles.statIconWrap, { borderColor: '#3B82F640' }]}><Folder size={20} color="#3B82F6" /></View>
              <View>
                <Text style={styles.statBoxNumber}>{totalFolders}</Text>
                <Text style={styles.statBoxTitle}>Folders</Text>
              </View>
            </View>
            <View style={{ width: '100%', height: 1, backgroundColor: colors.border.primary, marginBottom: 8 }} />
            <Text style={styles.statBoxSub}>Total Folders</Text>
          </View>
          <View style={[styles.statBox, { borderColor: '#8B5CF640' }]}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 12 }}>
              <View style={[styles.statIconWrap, { borderColor: '#8B5CF640' }]}><Cloud size={20} color="#8B5CF6" /></View>
              <View>
                <Text style={styles.statBoxNumber}>{estimatedKB} <Text style={{ fontSize: 12 }}>KB</Text></Text>
                <Text style={styles.statBoxTitle}>Storage</Text>
              </View>
            </View>
            <View style={{ width: '100%', height: 1, backgroundColor: colors.border.primary, marginBottom: 8 }} />
            <Text style={styles.statBoxSub}>Used Offline</Text>
          </View>
        </View>

        {/* Quick Status Row */}
        <View style={styles.statusRow}>
           <View style={styles.statusItem}>
             <Wifi size={18} color={colors.text.secondary} />
             <View style={{ alignItems: 'center' }}>
               <Text style={styles.statusTitle}>Offline</Text>
               <Text style={[styles.statusSub, { color: colors.accent.primary }]}><Text style={{ fontSize: 16 }}>•</Text> Active</Text>
             </View>
           </View>
           <View style={styles.statusDivider} />
           <View style={styles.statusItem}>
             <Lock size={18} color={colors.text.secondary} />
             <View style={{ alignItems: 'center' }}>
               <Text style={styles.statusTitle}>Secure</Text>
               <Text style={[styles.statusSub, { color: colors.accent.primary }]}><Text style={{ fontSize: 16 }}>•</Text> Encrypted</Text>
             </View>
           </View>
           <View style={styles.statusDivider} />
           <View style={styles.statusItem}>
             <Bot size={18} color={colors.text.secondary} />
             <View style={{ alignItems: 'center' }}>
               <Text style={styles.statusTitle}>AI Assistant</Text>
               <Text style={[styles.statusSub, { color: colors.accent.primary }]}><Text style={{ fontSize: 16 }}>•</Text> Ready</Text>
             </View>
           </View>
           <View style={styles.statusDivider} />
           <View style={styles.statusItem}>
             <RefreshCw size={18} color={colors.text.secondary} />
             <View style={{ alignItems: 'center' }}>
               <Text style={styles.statusTitle}>Sync</Text>
               <Text style={[styles.statusSub, { color: colors.status.warning }]}><Text style={{ fontSize: 16 }}>•</Text> Disabled</Text>
             </View>
           </View>
        </View>

        {/* Account Section */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>ACCOUNT</Text>
        </View>
        <View style={styles.menuCard}>
          <MenuItem icon={User} title="Personal Info" color={colors.status.info} colors={colors} styles={styles} onPress={() => setEditModalVisible(true)} />
          <MenuItem icon={Shield} title="Security & Lock" color={colors.status.warning} colors={colors} styles={styles} onPress={() => router.push('/settings' as any)} />
          <MenuItem icon={CreditCard} title="Subscription" color={colors.accent.primary} colors={colors} styles={styles} onPress={() => Alert.alert('Pro Plan', 'You are on the Pro Plan. Enjoy DevNest!')} />
          <MenuItem icon={Smartphone} title="Connected Devices" color={colors.text.secondary} colors={colors} styles={styles} onPress={() => Alert.alert('Connected Devices', 'This is currently your only connected device.')} />
        </View>

        {/* Activity Section */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>ACTIVITY</Text>
        </View>
        <View style={styles.menuCard}>
          <MenuItem icon={Clock} title="Recent Activity" color={colors.status.success} colors={colors} styles={styles} onPress={() => Alert.alert('Recent Activity', 'You have no recent activity logs.')} />
          <MenuItem icon={Download} title="Downloads & Export" color={colors.status.info} colors={colors} styles={styles} onPress={() => router.push('/settings' as any)} />
          <MenuItem icon={Trash2} title="Trash" color={colors.status.error} colors={colors} styles={styles} onPress={() => router.push('/trash' as any)} />
        </View>

        {/* Log Out */}
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <View style={[styles.menuIconWrap, { borderColor: colors.status.error + '40', borderWidth: 1 }]}>
            <LogOut size={22} color={colors.status.error} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.logoutText}>Log Out</Text>
            <Text style={{ color: colors.text.secondary, fontSize: 11, marginTop: 2 }}>End current session and secure your account</Text>
          </View>
          <ChevronRight size={20} color={colors.status.error} />
        </TouchableOpacity>
        
        <Text style={{ textAlign: 'center', color: colors.text.tertiary, fontSize: 12, marginTop: -20, marginBottom: 40 }}>
          DevSnippets AI  •  Version 1.0.0
        </Text>

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

  heroCard: {
    marginHorizontal: 24, backgroundColor: colors.bg.secondary, borderRadius: 24,
    padding: 16, marginBottom: 24, borderWidth: 1, borderColor: colors.border.primary, position: 'relative'
  },
  localModeBadge: {
    position: 'absolute', top: 12, left: 12, flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: colors.bg.tertiary, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8, borderWidth: 1, borderColor: colors.border.primary, zIndex: 10
  },
  localModeText: { color: colors.text.secondary, fontSize: 10, fontWeight: '700' },
  avatarColumn: { width: 120, alignItems: 'center', marginRight: 16, marginTop: 20 },
  heroAvatarWrap: { width: 120, height: 120, borderRadius: 60, overflow: 'hidden', borderWidth: 2, borderColor: colors.accent.primary },
  infoColumn: { flex: 1, marginTop: 4 },
  heroName: { color: colors.text.primary, fontSize: 22, fontWeight: '800' },
  heroHandle: { color: colors.text.secondary, fontSize: 13, fontWeight: '500', marginBottom: 6 },
  heroRole: { color: colors.accent.primary, fontSize: 14, fontWeight: '700', marginBottom: 2 },
  heroBio: { color: colors.text.tertiary, fontSize: 12, fontWeight: '500', marginBottom: 12 },
  skillsRow: { flexDirection: 'row', gap: 6, flexWrap: 'wrap' },
  skillBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  skillText: { fontSize: 10, fontWeight: '800' },
  badgesRow: { flexDirection: 'row', backgroundColor: colors.bg.tertiary, borderRadius: 16, padding: 12, marginTop: 24, alignItems: 'center', justifyContent: 'space-around', borderWidth: 1, borderColor: colors.border.primary },
  badgeBox: { flexDirection: 'row', alignItems: 'center' },
  badgeDivider: { width: 1, height: 30, backgroundColor: colors.border.primary },

  storageCard: {
    marginHorizontal: 24, backgroundColor: colors.bg.secondary, borderRadius: 20,
    padding: 20, marginBottom: 24, borderWidth: 1, borderColor: colors.border.primary,
  },
  storageHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  storageTitle: { color: colors.text.primary, fontSize: 14, fontWeight: '700' },
  storageAmount: { color: colors.text.secondary, fontSize: 13, fontWeight: '700' },
  storageBarBg: { height: 10, backgroundColor: colors.bg.tertiary, borderRadius: 5, marginBottom: 16, overflow: 'hidden' },
  storageBarFill: { height: '100%', backgroundColor: colors.accent.primary, borderRadius: 5 },
  storageDetails: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  storageSubText: { color: colors.text.tertiary, fontSize: 12 },
  storageBold: { color: colors.text.primary, fontWeight: '700' },
  unlimitedText: { color: colors.accent.primary, fontSize: 12, fontWeight: '700' },

  statsGrid: { flexDirection: 'row', paddingHorizontal: 24, gap: 12, marginBottom: 24 },
  statBox: { flex: 1, backgroundColor: colors.bg.secondary, borderRadius: 16, padding: 12, borderWidth: 1, borderColor: colors.border.primary },
  statIconWrap: { width: 32, height: 32, borderRadius: 8, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  statBoxNumber: { color: colors.text.primary, fontSize: 18, fontWeight: '800' },
  statBoxTitle: { color: colors.text.secondary, fontSize: 11, fontWeight: '600' },
  statBoxSub: { color: colors.text.tertiary, fontSize: 10, fontWeight: '500', textAlign: 'center' },

  statusRow: { flexDirection: 'row', marginHorizontal: 24, backgroundColor: colors.bg.secondary, borderRadius: 16, paddingVertical: 16, marginBottom: 32, borderWidth: 1, borderColor: colors.border.primary, justifyContent: 'space-evenly', alignItems: 'center' },
  statusItem: { alignItems: 'center', gap: 6 },
  statusTitle: { color: colors.text.primary, fontSize: 10, fontWeight: '700' },
  statusSub: { fontSize: 10, fontWeight: '700' },
  statusDivider: { width: 1, height: 30, backgroundColor: colors.border.primary },

  sectionHeader: { paddingHorizontal: 24, marginBottom: 8 },
  sectionTitle: { color: colors.text.tertiary, fontSize: 12, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1 },

  menuCard: {
    marginHorizontal: 24, backgroundColor: colors.bg.secondary, borderRadius: 20,
    marginBottom: 32, paddingVertical: 8, borderWidth: 1, borderColor: colors.border.primary,
  },
  menuItem: {
    flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 12,
  },
  menuIconWrap: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center', marginRight: 16 },
  menuItemTitle: { color: colors.text.secondary, fontSize: 15, fontWeight: '600' },

  logoutBtn: {
    flexDirection: 'row', alignItems: 'center', marginHorizontal: 24, backgroundColor: colors.status.error + '05',
    padding: 16, borderRadius: 20, marginBottom: 40, borderWidth: 1, borderColor: colors.status.error + '30',
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
