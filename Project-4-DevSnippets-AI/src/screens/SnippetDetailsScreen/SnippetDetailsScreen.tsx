// ============================================================
// DevNest — Snippet Details Screen
// ============================================================
import React, { useState } from 'react';
import { 
  View, Text, StyleSheet, TouchableOpacity, ScrollView, 
  Alert, Share, Platform 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { 
  ArrowLeft, Edit3, Star, MoreVertical, Copy, Maximize2, 
  Trash2, Share as ShareIcon, Code, FileCode, Tag, Hash 
} from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import * as Clipboard from 'expo-clipboard';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import Toast from 'react-native-toast-message';

import { Colors } from '@/theme/colors';
import { useSnippetStore } from '@/store/snippetStore';
import { getLanguageConfig } from '@/constants/languages';
import { timeAgo } from '@/utils/formatters/dateFormatter';
import { AIChatModal } from '@/components/modals/AIChatModal';
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { useRef } from 'react';

type Tab = 'Info' | 'History';

export function SnippetDetailsScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { getSnippetById, toggleFavorite, deleteSnippet } = useSnippetStore();
  const aiModalRef = useRef<BottomSheetModal>(null);
  
  const [activeTab, setActiveTab] = useState<Tab>('Info');
  
  const snippet = getSnippetById(id as string);
  
  if (!snippet) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.iconBtn}>
            <ArrowLeft size={24} color={Colors.text.primary} />
          </TouchableOpacity>
        </View>
        <View style={styles.emptyWrap}>
          <Text style={styles.emptyEmoji}>🚫</Text>
          <Text style={styles.emptyText}>Snippet not found</Text>
        </View>
      </SafeAreaView>
    );
  }

  const langConfig = getLanguageConfig(snippet.language);

  const handleCopy = async () => {
    await Clipboard.setStringAsync(snippet.content);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    Toast.show({ type: 'success', text1: 'Code copied to clipboard' });
  };

  const handleFavorite = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    toggleFavorite(snippet.id);
  };

  const handleDelete = () => {
    Alert.alert('Delete Snippet', 'Are you sure you want to delete this snippet?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => {
        await deleteSnippet(snippet.id);
        Toast.show({ type: 'success', text1: 'Snippet deleted' });
        router.back();
      }}
    ]);
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `${snippet.title}\n\n${snippet.content}`,
        title: snippet.title,
      });
    } catch (error: any) {
      Toast.show({ type: 'error', text1: 'Failed to share', text2: error.message });
    }
  };

  const handleExport = async () => {
    try {
      const ext = langConfig.shortLabel.toLowerCase();
      const filename = `${snippet.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.${ext === 'txt' ? 'txt' : ext}`;
      const fileUri = `${FileSystem.documentDirectory}${filename}`;
      
      await FileSystem.writeAsStringAsync(fileUri, snippet.content);
      
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(fileUri);
      } else {
        Toast.show({ type: 'success', text1: 'Saved locally', text2: fileUri });
      }
    } catch (e: any) {
      Toast.show({ type: 'error', text1: 'Failed to export', text2: e.message });
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.iconBtn}>
          <ArrowLeft size={24} color={Colors.text.primary} />
        </TouchableOpacity>
        <View style={styles.headerActions}>
          <TouchableOpacity onPress={() => router.push(`/snippet/edit/${snippet.id}`)} style={styles.iconBtn}>
            <Edit3 size={22} color={Colors.text.primary} />
          </TouchableOpacity>
          <TouchableOpacity onPress={handleFavorite} style={styles.iconBtn}>
            <Star size={22} color={snippet.isFavorite ? Colors.status.warning : Colors.text.primary} fill={snippet.isFavorite ? Colors.status.warning : 'transparent'} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconBtn}>
            <MoreVertical size={22} color={Colors.text.primary} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Title & Meta */}
        <View style={styles.titleSection}>
          <View style={[styles.langBadge, { backgroundColor: langConfig.color }]}>
            <Text style={[styles.langBadgeText, { color: langConfig.textColor }]}>{langConfig.shortLabel}</Text>
          </View>
          <View style={styles.titleTextWrap}>
            <Text style={styles.title}>{snippet.title}</Text>
            <View style={styles.metaRow}>
              <Text style={styles.metaText}>Updated {timeAgo(snippet.updatedAt)}</Text>
              <View style={[styles.metaDot, { backgroundColor: langConfig.color }]} />
              <Text style={styles.metaText}>{snippet.language}</Text>
            </View>
          </View>
        </View>

        {/* Code Preview */}
        <View style={styles.codeSection}>
          <View style={styles.codeHeader}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <Code size={18} color={Colors.accent.primary} />
              <Text style={styles.codeHeaderText}>Code</Text>
            </View>
            <View style={{ flexDirection: 'row', gap: 12 }}>
              <TouchableOpacity onPress={handleCopy} style={styles.codeActionBtn}>
                <Copy size={16} color={Colors.text.secondary} />
              </TouchableOpacity>
              <TouchableOpacity style={styles.codeActionBtn}>
                <Maximize2 size={16} color={Colors.text.secondary} />
              </TouchableOpacity>
            </View>
          </View>
          
          <View style={styles.codeBox}>
            <Text style={styles.codeText}>{snippet.content}</Text>
          </View>
        </View>

        {/* Tabs */}
        <View style={styles.tabsContainer}>
          {(['Info', 'History'] as Tab[]).map((tab) => {
            const isActive = activeTab === tab;
            return (
              <TouchableOpacity 
                key={tab} 
                style={[styles.tab, isActive && styles.activeTab]}
                onPress={() => setActiveTab(tab)}
              >
                <Text style={[styles.tabText, isActive && styles.activeTabText]}>{tab}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Info Tab Content */}
        {activeTab === 'Info' && (
          <View style={styles.tabContent}>
            
            {/* Description */}
            <View style={styles.infoCard}>
              <Text style={styles.infoCardTitle}>Description</Text>
              <Text style={styles.infoCardText}>{snippet.description || 'No description provided.'}</Text>
            </View>

            {/* Tags */}
            <View style={styles.infoCard}>
              <Text style={styles.infoCardTitle}>Tags</Text>
              {snippet.tags && snippet.tags.length > 0 ? (
                <View style={styles.tagsRow}>
                  {snippet.tags.map(tag => (
                    <View key={tag} style={styles.tagPill}>
                      <Hash size={12} color={Colors.accent.primary} />
                      <Text style={styles.tagText}>{tag}</Text>
                    </View>
                  ))}
                </View>
              ) : (
                <Text style={styles.infoCardText}>No tags added.</Text>
              )}
            </View>

            {/* Quick Actions Grid */}
            <View style={styles.actionsGrid}>
              <TouchableOpacity style={styles.actionGridItem} onPress={handleShare}>
                <View style={[styles.actionGridIconWrap, { backgroundColor: Colors.accent.primary + '15' }]}>
                  <ShareIcon size={20} color={Colors.accent.primary} />
                </View>
                <Text style={styles.actionGridText}>Share</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.actionGridItem} onPress={handleExport}>
                <View style={[styles.actionGridIconWrap, { backgroundColor: Colors.status.info + '15' }]}>
                  <FileCode size={20} color={Colors.status.info} />
                </View>
                <Text style={styles.actionGridText}>Export</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.actionGridItem} onPress={handleDelete}>
                <View style={[styles.actionGridIconWrap, { backgroundColor: Colors.status.error + '15' }]}>
                  <Trash2 size={20} color={Colors.status.error} />
                </View>
                <Text style={styles.actionGridText}>Delete</Text>
              </TouchableOpacity>
            </View>
            
          </View>
        )}

        {/* History Tab Content */}
        {activeTab === 'History' && (
          <View style={styles.tabContent}>
             <View style={styles.emptyWrap}>
              <Text style={styles.emptyEmoji}>✨</Text>
              <Text style={styles.emptyText}>Ask AI Assistant</Text>
              <Text style={styles.emptySubText}>Use Gemini to explain or optimize this code.</Text>
              <TouchableOpacity 
                style={{ marginTop: 24, backgroundColor: Colors.accent.primary, paddingHorizontal: 24, paddingVertical: 12, borderRadius: 20 }}
                onPress={() => aiModalRef.current?.present()}
              >
                <Text style={{ color: '#000', fontWeight: 'bold' }}>Open AI Chat</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

      </ScrollView>

      {/* AI Chat Modal */}
      <AIChatModal 
        ref={aiModalRef} 
        initialCode={snippet.content} 
        initialLanguage={snippet.language} 
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg.primary },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingVertical: 12,
  },
  iconBtn: {
    width: 44, height: 44, borderRadius: 22, backgroundColor: Colors.bg.secondary,
    alignItems: 'center', justifyContent: 'center',
  },
  headerActions: { flexDirection: 'row', gap: 12 },
  
  emptyWrap: { flex: 1, alignItems: 'center', justifyContent: 'center', marginTop: 40 },
  emptyEmoji: { fontSize: 48, marginBottom: 16 },
  emptyText: { color: Colors.text.primary, fontSize: 18, fontWeight: '700', marginBottom: 8 },
  emptySubText: { color: Colors.text.secondary, fontSize: 14 },
  
  scrollContent: { paddingBottom: 60 },
  
  titleSection: { flexDirection: 'row', paddingHorizontal: 24, paddingBottom: 24, paddingTop: 12 },
  langBadge: { width: 56, height: 56, borderRadius: 16, alignItems: 'center', justifyContent: 'center', marginRight: 16 },
  langBadgeText: { fontSize: 18, fontWeight: '800' },
  titleTextWrap: { flex: 1, justifyContent: 'center' },
  title: { color: Colors.text.primary, fontSize: 22, fontWeight: '800', marginBottom: 8, letterSpacing: -0.5 },
  metaRow: { flexDirection: 'row', alignItems: 'center' },
  metaText: { color: Colors.text.secondary, fontSize: 13, fontWeight: '500' },
  metaDot: { width: 4, height: 4, borderRadius: 2, marginHorizontal: 8 },

  codeSection: { marginHorizontal: 24, marginBottom: 32 },
  codeHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  codeHeaderText: { color: Colors.text.primary, fontSize: 16, fontWeight: '700' },
  codeActionBtn: { width: 36, height: 36, borderRadius: 10, backgroundColor: Colors.bg.secondary, alignItems: 'center', justifyContent: 'center' },
  codeBox: { backgroundColor: '#0B0B0C', borderRadius: 20, padding: 20, borderWidth: 1, borderColor: Colors.bg.secondary },
  codeText: { color: Colors.text.primary, fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace', fontSize: 13, lineHeight: 22 },

  tabsContainer: { flexDirection: 'row', paddingHorizontal: 24, borderBottomWidth: 1, borderBottomColor: Colors.border.primary, marginBottom: 24 },
  tab: { flex: 1, paddingVertical: 16, alignItems: 'center', borderBottomWidth: 2, borderBottomColor: 'transparent' },
  activeTab: { borderBottomColor: Colors.accent.primary },
  tabText: { color: Colors.text.tertiary, fontSize: 15, fontWeight: '600' },
  activeTabText: { color: Colors.text.primary },

  tabContent: { paddingHorizontal: 24 },
  
  infoCard: { backgroundColor: Colors.bg.secondary, borderRadius: 20, padding: 20, marginBottom: 16 },
  infoCardTitle: { color: Colors.text.primary, fontSize: 16, fontWeight: '700', marginBottom: 12 },
  infoCardText: { color: Colors.text.secondary, fontSize: 14, lineHeight: 22 },
  
  tagsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  tagPill: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: Colors.bg.tertiary, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 12 },
  tagText: { color: Colors.text.primary, fontSize: 13, fontWeight: '600' },

  actionsGrid: { flexDirection: 'row', justifyContent: 'space-between', gap: 12, marginTop: 8 },
  actionGridItem: { flex: 1, backgroundColor: Colors.bg.secondary, borderRadius: 20, padding: 16, alignItems: 'center' },
  actionGridIconWrap: { width: 48, height: 48, borderRadius: 16, alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  actionGridText: { color: Colors.text.primary, fontSize: 13, fontWeight: '600' },
});
