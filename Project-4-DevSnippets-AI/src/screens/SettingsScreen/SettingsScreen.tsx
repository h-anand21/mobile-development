// ============================================================
// DevNest — Settings Screen (Theme Aware & Languages Customizable)
// ============================================================
import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Switch } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ArrowLeft, Moon, Bell, Database, HelpCircle, FileText, Smartphone, Fingerprint, Key, ShieldCheck, Globe } from 'lucide-react-native';

import { useThemeColors } from '@/theme/colors';
import { useSettingsStore } from '@/store/settingsStore';
import { useSnippetStore } from '@/store/snippetStore';
import { useFolderStore } from '@/store/folderStore';
import { LANGUAGES } from '@/constants/languages';
import { getDB } from '@/database/db';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import { Alert } from 'react-native';
import Toast from 'react-native-toast-message';

import * as Linking from 'expo-linking';
import { Modal, TextInput, KeyboardAvoidingView, Platform } from 'react-native';

function SettingRow({ icon: Icon, title, subtitle, value, onToggle, onPress, colors, styles }: any) {
  const content = (
    <>
      <View style={[styles.iconWrap, { backgroundColor: colors.bg.tertiary }]}>
        <Icon size={20} color={colors.text.primary} />
      </View>
      <View style={styles.textWrap}>
        <Text style={styles.settingTitle}>{title}</Text>
        {subtitle && <Text style={styles.settingSubtitle}>{subtitle}</Text>}
      </View>
      {onToggle !== undefined ? (
        <Switch 
          value={value} 
          onValueChange={onToggle} 
          trackColor={{ false: colors.border.primary, true: colors.accent.primary }}
          thumbColor="#fff"
        />
      ) : (
        <Text style={{ color: colors.text.tertiary, fontSize: 18 }}>›</Text>
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

export function SettingsScreen() {
  const router = useRouter();
  const colors = useThemeColors();
  const styles = getStyles(colors);
  
  const { 
    theme, setTheme,
    notificationsEnabled, setNotificationsEnabled,
    appLockEnabled, setAppLockEnabled,
    geminiApiKey, setGeminiApiKey,
    enabledLanguages, setEnabledLanguages
  } = useSettingsStore();

  const [isApiKeyModalVisible, setApiKeyModalVisible] = useState(false);
  const [tempApiKey, setTempApiKey] = useState(geminiApiKey || '');
  const [isLanguagesModalVisible, setLanguagesModalVisible] = useState(false);

  const { snippets } = useSnippetStore();
  const { folders } = useFolderStore();

  const handleAppLock = (val: boolean) => {
    setAppLockEnabled(val);
    if (val) {
      Toast.show({ type: 'info', text1: 'App Lock enabled' });
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

  const handleHelpCenter = () => {
    Linking.openURL('mailto:work.himu2006@gmail.com');
  };

  const handleTerms = () => {
    Alert.alert('Terms & Privacy', 'All your data is stored locally on your device. We do not collect or share any of your snippets or personal information.');
  };

  const handleSaveApiKey = () => {
    setGeminiApiKey(tempApiKey);
    setApiKeyModalVisible(false);
    Toast.show({ type: 'success', text1: 'API Key saved securely!' });
  };

  const handleToggleLanguage = (langLabel: string) => {
    if (enabledLanguages.includes(langLabel)) {
      if (enabledLanguages.length <= 1) {
        Alert.alert('Error', 'At least one language must remain enabled.');
        return;
      }
      setEnabledLanguages(enabledLanguages.filter(l => l !== langLabel));
    } else {
      setEnabledLanguages([...enabledLanguages, langLabel]);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <ArrowLeft size={24} color={colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Settings</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 60 }}>
        
        {/* Security Banner */}
        <View style={styles.securityBanner}>
          <View style={styles.securityIcon}>
            <ShieldCheck size={24} color={colors.bg.primary} />
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
            value={theme === 'dark'} onToggle={(val: boolean) => setTheme(val ? 'dark' : 'light')}
            colors={colors} styles={styles}
          />
          <View style={styles.divider} />
          <SettingRow 
            icon={Globe} title="Custom Languages" subtitle="Enable/disable active selector list"
            onPress={() => setLanguagesModalVisible(true)}
            colors={colors} styles={styles}
          />
          <View style={styles.divider} />
          <SettingRow 
            icon={Bell} title="Notifications" subtitle="App updates and tips"
            value={notificationsEnabled} onToggle={setNotificationsEnabled}
            colors={colors} styles={styles}
          />
        </View>

        {/* Security */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Security & Data</Text>
        </View>
        <View style={styles.card}>
          <SettingRow 
            icon={Fingerprint} title="App Lock" subtitle="Require biometrics to open"
            value={appLockEnabled} onToggle={handleAppLock}
            colors={colors} styles={styles}
          />
          <View style={styles.divider} />
          <SettingRow 
            icon={Key} title="Gemini API Key" subtitle={geminiApiKey ? "Key is set (Tap to change)" : "Set key for AI features"}
            onPress={() => setApiKeyModalVisible(true)}
            colors={colors} styles={styles}
          />
          <View style={styles.divider} />
          <SettingRow 
            icon={Database} title="Backup Data" subtitle="Export a full JSON backup"
            onPress={handleBackup}
            colors={colors} styles={styles}
          />
          <View style={styles.divider} />
          <SettingRow 
            icon={Smartphone} title="Clear Cache" subtitle="Free up local space"
            onPress={handleClearCache}
            colors={colors} styles={styles}
          />
        </View>

        {/* Support */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Support</Text>
        </View>
        <View style={styles.card}>
          <SettingRow icon={HelpCircle} title="Help Center" onPress={handleHelpCenter} colors={colors} styles={styles} />
          <View style={styles.divider} />
          <SettingRow icon={FileText} title="Terms & Privacy" onPress={handleTerms} colors={colors} styles={styles} />
        </View>

        <Text style={styles.version}>DevNest v1.0.0</Text>
      </ScrollView>

      {/* API Key Modal */}
      <Modal visible={isApiKeyModalVisible} transparent animationType="fade">
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Set Gemini API Key</Text>
            <Text style={styles.modalSub}>Get your key from Google AI Studio. It will be stored securely on your device.</Text>
            <TextInput
              style={styles.modalInput}
              value={tempApiKey}
              onChangeText={setTempApiKey}
              placeholder="Paste API Key here..."
              placeholderTextColor={colors.text.tertiary}
              secureTextEntry
              autoCapitalize="none"
            />
            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.modalCancel} onPress={() => setApiKeyModalVisible(false)}>
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalSave} onPress={handleSaveApiKey}>
                <Text style={styles.modalSaveText}>Save Securely</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* Languages Customization Modal */}
      <Modal visible={isLanguagesModalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { width: '90%', height: '80%', paddingBottom: 24 }]}>
            <Text style={styles.modalTitle}>Custom Languages</Text>
            <Text style={styles.modalSub}>Select which programming languages appear in your new snippet selection list.</Text>
            
            <ScrollView showsVerticalScrollIndicator={true} style={{ flex: 1, marginBottom: 16 }}>
              {LANGUAGES.map((lang) => {
                const isEnabled = enabledLanguages.includes(lang.label);
                return (
                  <View key={lang.label} style={styles.languageToggleRow}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                      <View style={[styles.langColorIndicator, { backgroundColor: lang.color }]} />
                      <Text style={{ color: colors.text.primary, fontSize: 16, fontWeight: '600' }}>{lang.label}</Text>
                    </View>
                    <Switch
                      value={isEnabled}
                      onValueChange={() => handleToggleLanguage(lang.label)}
                      trackColor={{ false: colors.border.primary, true: colors.accent.primary }}
                      thumbColor="#fff"
                    />
                  </View>
                );
              })}
            </ScrollView>

            <TouchableOpacity style={styles.doneBtn} onPress={() => setLanguagesModalVisible(false)}>
              <Text style={styles.doneBtnText}>Done</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const getStyles = (colors: any) => ({
  container: { flex: 1, backgroundColor: colors.bg.primary },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingVertical: 12, marginBottom: 16,
  },
  backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.bg.secondary, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 20, fontWeight: '800', color: colors.text.primary },

  securityBanner: {
    flexDirection: 'row', alignItems: 'center', marginHorizontal: 24, backgroundColor: colors.accent.primary,
    padding: 16, borderRadius: 20, marginBottom: 32,
  },
  securityIcon: { width: 48, height: 48, borderRadius: 24, backgroundColor: 'rgba(0,0,0,0.1)', alignItems: 'center', justifyContent: 'center', marginRight: 16 },
  securityTextWrap: { flex: 1 },
  securityTitle: { color: colors.bg.primary, fontSize: 16, fontWeight: '800', marginBottom: 4 },
  securitySub: { color: 'rgba(0,0,0,0.7)', fontSize: 13, fontWeight: '500' },

  sectionHeader: { paddingHorizontal: 24, marginBottom: 12 },
  sectionTitle: { color: colors.text.secondary, fontSize: 14, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1 },

  card: { marginHorizontal: 24, backgroundColor: colors.bg.secondary, borderRadius: 20, paddingVertical: 8, marginBottom: 32, borderWidth: 1, borderColor: colors.border.primary },
  settingRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 12 },
  iconWrap: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginRight: 16 },
  textWrap: { flex: 1 },
  settingTitle: { color: colors.text.primary, fontSize: 16, fontWeight: '600' },
  settingSubtitle: { color: colors.text.tertiary, fontSize: 12, marginTop: 2 },
  divider: { height: 1, backgroundColor: colors.border.primary, marginLeft: 76 },

  version: { textAlign: 'center', color: colors.text.tertiary, fontSize: 13, marginTop: 16, marginBottom: 40 },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { width: '85%', backgroundColor: colors.bg.secondary, borderRadius: 24, padding: 24, borderWidth: 1, borderColor: colors.border.primary },
  modalTitle: { fontSize: 20, fontWeight: '800', color: colors.text.primary, marginBottom: 8 },
  modalSub: { fontSize: 14, color: colors.text.secondary, marginBottom: 20, lineHeight: 20 },
  modalInput: { backgroundColor: colors.bg.primary, color: colors.text.primary, borderRadius: 12, padding: 16, fontSize: 16, marginBottom: 24, borderWidth: 1, borderColor: colors.border.primary },
  modalActions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 12 },
  modalCancel: { paddingVertical: 12, paddingHorizontal: 20, borderRadius: 12, backgroundColor: colors.bg.tertiary },
  modalCancelText: { color: colors.text.primary, fontWeight: '600' },
  modalSave: { paddingVertical: 12, paddingHorizontal: 20, borderRadius: 12, backgroundColor: colors.accent.primary },
  modalSaveText: { color: colors.bg.primary === '#000000' ? '#000' : '#FFF', fontWeight: '700' },

  languageToggleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: colors.border.primary },
  langColorIndicator: { width: 14, height: 14, borderRadius: 7 },
  doneBtn: { backgroundColor: colors.accent.primary, paddingVertical: 14, borderRadius: 14, alignItems: 'center', justifyContent: 'center', marginTop: 8 },
  doneBtnText: { color: colors.bg.primary === '#000000' ? '#000' : '#FFF', fontSize: 16, fontWeight: '700' },
} as any);
