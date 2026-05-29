// ============================================================
// DevNest — Home Screen (Neon UI)
// ============================================================
import React, { useCallback, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, RefreshControl, Image, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Plus, Sparkles, Folder, Star, LayoutTemplate, Search, ScanLine, FileDown, SlidersHorizontal, Code } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import Animated, { FadeInDown } from 'react-native-reanimated';
import Svg, { Path } from 'react-native-svg';

import { useThemeColors } from '@/theme/colors';
import { useSettingsStore } from '@/store/settingsStore';
import { useSnippetStore } from '@/store/snippetStore';
import { useFolderStore } from '@/store/folderStore';
import { SnippetCard } from '@/components/cards/SnippetCard';
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import Toast from 'react-native-toast-message';
import { askGeminiVision } from '@/services/aiService';
import { AVATARS } from '@/constants/avatars';

const { width } = Dimensions.get('window');

function StatCard({ icon: Icon, title, count, delay, iconBgColor, styles, onPress }: { icon: any, title: string, count: number, delay: number, iconBgColor: string, styles: any, onPress?: () => void }) {
  return (
    <Animated.View entering={FadeInDown.delay(delay).springify()} style={{ flex: 1 }}>
      <TouchableOpacity style={styles.statCard} onPress={onPress} activeOpacity={0.8}>
        <View style={[styles.statIconContainer, { backgroundColor: iconBgColor + '20' }]}>
          <Icon size={18} color={iconBgColor} />
        </View>
        <View style={styles.statContent}>
          <Text style={styles.statCount}>{count}</Text>
          <Text style={styles.statTitle} numberOfLines={1}>{title}</Text>
        </View>
        <View style={{ marginTop: 8, height: 16, width: '100%', overflow: 'hidden' }}>
          <Svg width="100%" height="100%" viewBox="0 0 100 20" preserveAspectRatio="none">
            <Path d="M 0,10 Q 15,0 25,10 T 50,10 T 75,10 T 100,10" fill="none" stroke={iconBgColor} strokeWidth="2.5" />
          </Svg>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}

export function HomeScreen() {
  const router = useRouter();
  const colors = useThemeColors();
  const styles = getStyles(colors);
  
  const { userProfile } = useSettingsStore();
  const { snippets, loadSnippets, isLoading } = useSnippetStore();
  const { folders } = useFolderStore();

  const handleRefresh = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    loadSnippets();
  }, [loadSnippets]);

  const recentSnippets = useMemo(() => {
    return [...snippets].sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()).slice(0, 5);
  }, [snippets]);

  const favoritesCount = snippets.filter(s => s.isFavorite).length;

  const handleImportFile = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['text/*', 'application/json', 'application/javascript', 'application/typescript'],
        copyToCacheDirectory: true
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const fileUri = result.assets[0].uri;
        const fileName = result.assets[0].name;
        
        const response = await fetch(fileUri);
        const content = await response.text();
        
        router.push({
          pathname: '/snippet/create',
          params: { importedContent: content, importedTitle: fileName }
        });
      }
    } catch (e: any) {
      Toast.show({ type: 'error', text1: 'Failed to import file', text2: e.message });
    }
  };

  const handleScanCode = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Toast.show({ type: 'error', text1: 'Camera permission required' });
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ['images'],
        quality: 0.2,
        base64: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0 && result.assets[0].base64) {
        Toast.show({ type: 'info', text1: 'Analyzing image with AI...' });
        
        const extractedCode = await askGeminiVision(
          "Extract the code snippet from this image. Do not add any conversational text or markdown formatting blocks like ```javascript. Just output the pure code exactly as it appears in the image.",
          result.assets[0].base64,
          result.assets[0].mimeType || 'image/jpeg'
        );

        Toast.show({ type: 'success', text1: 'Code Extracted Successfully!' });

        router.push({
          pathname: '/snippet/create',
          params: { importedContent: extractedCode, importedTitle: 'Scanned Code' }
        });
      }
    } catch (e: any) {
      Toast.show({ type: 'error', text1: 'Failed to scan code', text2: e.message });
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={isLoading} onRefresh={handleRefresh} tintColor={colors.accent.primary} />}
        contentContainerStyle={{ paddingBottom: 120 }}
      >
        {/* Header (Top Bar) */}
        <View style={styles.topBar}>
          <TouchableOpacity style={[styles.avatarWrap, { overflow: 'hidden' }]} onPress={() => router.push('/(tabs)/profile')}>
            <Image 
              source={AVATARS[userProfile?.avatarIndex !== undefined && userProfile.avatarIndex < AVATARS.length ? userProfile.avatarIndex : 0]} 
              style={{ width: '100%', height: '100%', resizeMode: 'cover' }} 
            />
          </TouchableOpacity>

          <TouchableOpacity style={styles.navSearchBar} onPress={() => router.push('/(tabs)/search')} activeOpacity={0.8}>
            <Search size={18} color={colors.text.tertiary} />
            <Text style={styles.navSearchText}>Search...</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.navAiBtn} onPress={() => router.push('/ai-history')} activeOpacity={0.8}>
            <Sparkles size={16} color={colors.bg.primary === '#000000' ? '#000' : '#FFF'} fill={colors.bg.primary === '#000000' ? '#000' : '#FFF'} />
            <Text style={styles.navAiText}>AI</Text>
          </TouchableOpacity>
        </View>

        {/* Hero Section */}
        <View style={styles.heroSection}>
          <View style={styles.heroTextContent}>
            <Text style={styles.greeting}>Good Morning, <Text style={styles.greetingName}>{userProfile?.name || 'Developer'} 👋</Text></Text>
            <Text style={styles.headline}>Ready to code{'\n'}something <Text style={styles.neonText}>amazing?</Text></Text>
          </View>
          {/* Full image for Developer */}
          <Image 
            source={require('../../../assets/iamge-aste/062ac288-f81d-4a4c-b1d9-6462174bcafb.pngfgf.png')} 
            style={{ width: 160, height: 160, position: 'absolute', right: 20, top: -5, zIndex: -1 }} 
            resizeMode="contain" 
          />
        </View>

        {/* Stats Grid (4 items side by side) */}
        <View style={styles.statsGrid}>
          <StatCard icon={Code} title="Snippets" count={snippets.length} delay={100} iconBgColor="#a3e635" styles={styles} onPress={() => router.push('/(tabs)/search')} />
          <StatCard icon={Folder} title="Folders" count={folders.length} delay={200} iconBgColor="#3b82f6" styles={styles} onPress={() => router.push('/(tabs)/files')} />
          <StatCard icon={Star} title="Favorites" count={favoritesCount} delay={300} iconBgColor="#f59e0b" styles={styles} onPress={() => router.push('/favorites' as any)} />
          <StatCard icon={LayoutTemplate} title="Templates" count={6} delay={400} iconBgColor="#ec4899" styles={styles} onPress={() => router.push('/templates')} />
        </View>

        {/* AI Banner */}
        <TouchableOpacity 
          style={styles.aiBanner} 
          activeOpacity={0.9}
          onPress={() => router.push('/ai-history')}
        >
          <View style={styles.aiBannerContent}>
            <View style={styles.aiBadge}>
              <Sparkles size={16} color={colors.accent.primary} fill={colors.accent.primary} />
              <Text style={[styles.aiBadgeText, { color: colors.text.primary }]}>AI Assistant</Text>
            </View>
            <Text style={[styles.aiSubtitle, { color: colors.text.secondary }]}>Ask AI to explain, optimize{'\n'}or refactor your code.</Text>
            <View style={styles.aiActionBtn}>
              <Text style={styles.aiActionText}>Ask AI →</Text>
            </View>
          </View>
          {/* Full image for Robot */}
          <Image 
            source={require('../../../assets/iamge-aste/062ac288-f81d-4a4c-b1d9-6462174bcafb.pngfbfj.png')} 
            style={{ width: 130, height: 130, position: 'absolute', right: 5, bottom: -5 }} 
            resizeMode="contain" 
          />
        </TouchableOpacity>

        {/* Quick Actions */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={[styles.quickActionsScroll, { marginBottom: 32 }]}>
          <TouchableOpacity style={styles.actionPill} onPress={() => router.push('/snippet/create')}>
            <View style={styles.actionIconBox}>
              <Plus size={16} color="#000" strokeWidth={3} />
            </View>
            <Text style={styles.actionPillText}>New Snippet</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionPill} onPress={handleScanCode}>
            <ScanLine size={18} color={colors.accent.primary} />
            <Text style={styles.actionPillText}>Scan Code</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionPill} onPress={handleImportFile}>
            <FileDown size={18} color={colors.accent.primary} />
            <Text style={styles.actionPillText}>Import File</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionPill} onPress={() => router.push('/ai-history')}>
            <Sparkles size={18} color={colors.accent.primary} fill={colors.accent.primary} />
            <Text style={styles.actionPillText}>AI Explain</Text>
          </TouchableOpacity>
        </ScrollView>

        {/* Recent Snippets */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent Snippets</Text>
          <TouchableOpacity onPress={() => router.push('/(tabs)/search')}>
            <Text style={styles.seeAll}>View all →</Text>
          </TouchableOpacity>
        </View>

        <View style={[styles.listContainer, { position: 'relative' }]}>
          {recentSnippets.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyEmoji}>📝</Text>
              <Text style={styles.emptyText}>No snippets yet</Text>
              <Text style={styles.emptySub}>Create your first snippet to get started!</Text>
            </View>
          ) : (
            recentSnippets.map(snippet => (
              <SnippetCard 
                key={snippet.id} 
                snippet={snippet} 
                onPress={() => router.push(`/snippet/${snippet.id}`)} 
              />
            ))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const getStyles = (colors: any) => ({
  container: { flex: 1, backgroundColor: colors.bg.primary },
  
  topBar: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 24, paddingTop: 12, paddingBottom: 24, gap: 12,
  },
  navSearchBar: {
    flex: 1, height: 44, backgroundColor: colors.bg.secondary, borderRadius: 22,
    flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16,
    borderWidth: 1, borderColor: colors.border.primary,
  },
  navSearchText: { color: colors.text.tertiary, fontSize: 14, marginLeft: 8 },
  navAiBtn: {
    height: 44, paddingHorizontal: 16, borderRadius: 22, backgroundColor: colors.accent.primary,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6,
  },
  navAiText: { color: colors.bg.primary === '#000000' ? '#000' : '#FFF', fontSize: 15, fontWeight: '800' },
  avatarWrap: {
    width: 44, height: 44, borderRadius: 22, backgroundColor: colors.accent.primary,
    alignItems: 'center', justifyContent: 'center',
  },
  avatarEmoji: { fontSize: 24 },

  heroSection: {
    position: 'relative',
    paddingHorizontal: 24, marginBottom: 32, marginTop: 16, minHeight: 140,
  },
  heroTextContent: { width: '65%', zIndex: 1 },
  greeting: { fontSize: 16, fontFamily: 'Inter-Medium', color: colors.text.secondary },
  greetingName: { color: colors.accent.primary, fontWeight: '700' },
  headline: { fontSize: 28, fontFamily: 'SpaceGrotesk-Bold', color: colors.text.primary, lineHeight: 36, marginTop: 8 },
  neonText: { color: colors.accent.primary, textShadowColor: colors.accent.primary + '80', textShadowOffset: { width: 0, height: 0 }, textShadowRadius: 10 },

  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    marginBottom: 32,
    gap: 8,
  },
  statCard: {
    flex: 1,
    padding: 10, borderRadius: 16,
    backgroundColor: colors.bg.secondary,
    borderWidth: 1, borderColor: colors.border.primary,
  },
  statIconContainer: { width: 32, height: 32, borderRadius: 8, alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
  statContent: {},
  statCount: { fontSize: 18, fontWeight: '800', color: colors.text.primary, marginBottom: 2 },
  statTitle: { fontSize: 10, color: colors.text.secondary },

  aiBanner: {
    marginHorizontal: 24, marginBottom: 32, borderRadius: 24,
    backgroundColor: colors.bg.secondary, padding: 20,
    borderWidth: 1, borderColor: colors.border.primary,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    position: 'relative', overflow: 'visible', zIndex: 1
  },
  aiBannerContent: { flex: 1, paddingRight: 90 },
  aiBannerImage: { width: 140, height: 140, marginRight: 16 },
  aiBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 12,
  },
  aiBadgeText: { color: colors.text.primary, fontSize: 16, fontWeight: '700' },
  aiSubtitle: { color: colors.text.secondary, fontSize: 13, lineHeight: 20, marginBottom: 16 },
  aiActionBtn: { backgroundColor: colors.accent.primary, alignSelf: 'flex-start', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 20 },
  aiActionText: { color: colors.bg.primary === '#000000' ? '#000' : '#FFF', fontSize: 14, fontWeight: '800' },

  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', paddingHorizontal: 24, marginBottom: 16 },
  sectionTitle: { color: colors.text.primary, fontSize: 18, fontWeight: '700' },
  seeAll: { color: colors.accent.primary, fontSize: 13, fontWeight: '600' },

  listContainer: { paddingHorizontal: 24, marginBottom: 24 },
  emptyState: { alignItems: 'center', paddingVertical: 40, backgroundColor: colors.bg.secondary, borderRadius: 20, borderWidth: 1, borderColor: colors.border.primary },
  emptyEmoji: { fontSize: 40, marginBottom: 12 },
  emptyText: { color: colors.text.primary, fontSize: 16, fontWeight: '700', marginBottom: 4 },
  emptySub: { color: colors.text.secondary, fontSize: 14 },

  quickActionsScroll: { paddingHorizontal: 24, gap: 12 },
  actionPill: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.bg.secondary, padding: 8, paddingRight: 16, borderRadius: 30, gap: 10, borderWidth: 1, borderColor: colors.border.primary },
  actionIconBox: { width: 28, height: 28, borderRadius: 14, backgroundColor: colors.accent.primary, alignItems: 'center', justifyContent: 'center' },
  actionPillText: { color: colors.text.primary, fontSize: 14, fontWeight: '600' },
} as any);
