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

import { Colors } from '@/theme/colors';
import { useSettingsStore } from '@/store/settingsStore';
import { useSnippetStore } from '@/store/snippetStore';
import { useFolderStore } from '@/store/folderStore';
import { SnippetCard } from '@/components/cards/SnippetCard';

const { width } = Dimensions.get('window');
const cardWidth = (width - 48 - 36) / 4; // 48 padding, 3x12 gap

function StatCard({ icon: Icon, title, count, delay, onPress }: { icon: any, title: string, count: number, delay: number, onPress?: () => void }) {
  return (
    <Animated.View entering={FadeInDown.delay(delay).springify()}>
      <TouchableOpacity 
        style={styles.statCard} 
        activeOpacity={onPress ? 0.7 : 1} 
        onPress={onPress}
        disabled={!onPress}
      >
        <View style={styles.statIconWrap}>
          <Icon size={18} color={Colors.bg.primary} fill={Colors.bg.primary} />
        </View>
        <Text style={styles.statCount}>{count}</Text>
        <Text style={styles.statTitle}>{title}</Text>
        
        {/* Decorative chart line placeholder */}
        <View style={styles.chartLine}>
          <View style={styles.chartSegment1} />
          <View style={styles.chartSegment2} />
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}

export function HomeScreen() {
  const router = useRouter();
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

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={isLoading} onRefresh={handleRefresh} tintColor={Colors.accent.primary} />}
        contentContainerStyle={{ paddingBottom: 120 }}
      >
        {/* Header (Top Bar) */}
        <View style={styles.topBar}>
          <TouchableOpacity style={styles.iconBtn}>
            <View style={styles.hamburgerLine} />
            <View style={[styles.hamburgerLine, { width: 14 }]} />
            <View style={styles.hamburgerLine} />
          </TouchableOpacity>
          <View style={styles.topBarRight}>
            <TouchableOpacity style={styles.iconBtnCircle}>
              <Search size={20} color={Colors.text.primary} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconBtnCircle}>
              <View style={styles.notificationDot} />
              <View style={{ position: 'absolute', top: 12, right: 12, width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.accent.primary, borderWidth: 2, borderColor: Colors.bg.primary, zIndex: 10 }} />
              <Sparkles size={20} color={Colors.text.primary} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.avatarWrap} onPress={() => router.push('/(tabs)/profile')}>
              <Text style={styles.avatarEmoji}>
                 {userProfile?.avatarIndex !== undefined 
                  ? ['👨‍💻', '👩‍💻', '🧑‍💻', '🧑‍🚀', '👨‍🔬', '👩‍🔬', '🤖', '🐱', '🐻', '🦊', '🚀', '⚡'][userProfile.avatarIndex] 
                  : '👨‍💻'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Hero Section */}
        <View style={styles.heroSection}>
          <Text style={styles.greeting}>Good Morning, <Text style={styles.greetingName}>{userProfile?.name || 'Developer'} 👋</Text></Text>
          <Text style={styles.headline}>Ready to code something <Text style={styles.neonText}>amazing?</Text></Text>
          {/* Placeholder for 3D Boy Illustration */}
          <View style={styles.heroIllustrationPlaceholder} />
        </View>

        {/* Search Bar */}
        <TouchableOpacity 
          style={styles.searchBar} 
          activeOpacity={0.8}
          onPress={() => router.push('/(tabs)/search')}
        >
          <Search size={20} color={Colors.text.tertiary} />
          <Text style={styles.searchText}>Search snippets, folders, tags...</Text>
          <View style={styles.filterBtn}>
            <SlidersHorizontal size={16} color={Colors.accent.primary} />
          </View>
        </TouchableOpacity>

        {/* Stats Grid (4 items side by side) */}
        <View style={styles.statsGrid}>
          <StatCard icon={Code} title="Snippets" count={snippets.length} delay={100} onPress={() => router.push('/(tabs)/search')} />
          <StatCard icon={Folder} title="Folders" count={folders.length} delay={200} onPress={() => router.push('/(tabs)/files')} />
          <StatCard icon={Star} title="Favorites" count={favoritesCount} delay={300} onPress={() => router.push('/favorites' as any)} />
          <StatCard icon={LayoutTemplate} title="Templates" count={6} delay={400} onPress={() => router.push('/templates')} />
        </View>

        {/* AI Banner */}
        <TouchableOpacity 
          style={styles.aiBanner} 
          activeOpacity={0.9}
          onPress={() => router.push('/ai-history')}
        >
          <View style={styles.aiBannerContent}>
            <View style={styles.aiBadge}>
              <Sparkles size={16} color={Colors.accent.primary} fill={Colors.accent.primary} />
              <Text style={styles.aiBadgeText}>AI Assistant</Text>
            </View>
            <Text style={styles.aiSubtitle}>Ask AI to explain, optimize or refactor your code.</Text>
            <View style={styles.aiActionBtn}>
              <Text style={styles.aiActionText}>Ask AI →</Text>
            </View>
          </View>
          {/* Placeholder for Robot Illustration */}
        </TouchableOpacity>

        {/* Recent Snippets */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent Snippets</Text>
          <TouchableOpacity onPress={() => router.push('/(tabs)/search')}>
            <Text style={styles.seeAll}>View all →</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.listContainer}>
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

        {/* Quick Actions */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.quickActionsScroll}>
          <TouchableOpacity style={styles.actionPill} onPress={() => router.push('/snippet/create')}>
            <View style={styles.actionIconBox}>
              <Plus size={16} color="#000" strokeWidth={3} />
            </View>
            <Text style={styles.actionPillText}>New Snippet</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionPill} onPress={() => router.push('/(tabs)/files')}>
            <ScanLine size={18} color={Colors.accent.primary} />
            <Text style={styles.actionPillText}>Scan Code</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionPill} onPress={() => {}}>
            <FileDown size={18} color={Colors.accent.primary} />
            <Text style={styles.actionPillText}>Import File</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionPill} onPress={() => router.push('/ai-history')}>
            <Sparkles size={18} color={Colors.accent.primary} fill={Colors.accent.primary} />
            <Text style={styles.actionPillText}>AI Explain</Text>
          </TouchableOpacity>
        </ScrollView>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg.primary },
  
  topBar: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 24, paddingTop: 12, paddingBottom: 24,
  },
  iconBtn: {
    width: 44, height: 44, borderRadius: 12, backgroundColor: Colors.bg.secondary,
    justifyContent: 'center', paddingHorizontal: 12, gap: 5,
  },
  hamburgerLine: { width: 18, height: 2, backgroundColor: Colors.text.primary, borderRadius: 1 },
  topBarRight: { flexDirection: 'row', gap: 12, alignItems: 'center' },
  iconBtnCircle: {
    width: 44, height: 44, borderRadius: 22, backgroundColor: Colors.bg.secondary,
    alignItems: 'center', justifyContent: 'center',
  },
  notificationDot: {},
  avatarWrap: {
    width: 44, height: 44, borderRadius: 22, backgroundColor: Colors.accent.primary,
    alignItems: 'center', justifyContent: 'center',
  },
  avatarEmoji: { fontSize: 24 },

  heroSection: { paddingHorizontal: 24, paddingBottom: 32, position: 'relative' },
  greeting: { fontSize: 16, color: Colors.text.secondary, marginBottom: 8, fontWeight: '500' },
  greetingName: { color: Colors.text.primary },
  headline: { fontSize: 32, color: Colors.text.primary, fontWeight: '800', lineHeight: 40, width: '70%' },
  neonText: { color: Colors.accent.primary },
  heroIllustrationPlaceholder: {
    position: 'absolute', right: 0, top: -20, width: 140, height: 140,
    // Add background image here when assets are available
  },

  searchBar: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.bg.secondary,
    marginHorizontal: 24, paddingLeft: 16, paddingRight: 8, height: 56, borderRadius: 28,
    marginBottom: 32,
  },
  searchText: { flex: 1, color: Colors.text.tertiary, fontSize: 15, marginLeft: 12 },
  filterBtn: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', borderColor: Colors.accent.primary, borderWidth: 1 },

  statsGrid: {
    flexDirection: 'row', paddingHorizontal: 24, justifyContent: 'space-between', marginBottom: 32, gap: 12,
  },
  statCard: {
    flex: 1, backgroundColor: Colors.bg.secondary, padding: 12, borderRadius: 20,
  },
  statIconWrap: { width: 36, height: 36, borderRadius: 12, backgroundColor: Colors.accent.primary, alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  statCount: { color: Colors.text.primary, fontSize: 20, fontWeight: '800', marginBottom: 4 },
  statTitle: { color: Colors.text.secondary, fontSize: 11, fontWeight: '500', marginBottom: 12 },
  chartLine: { height: 16, flexDirection: 'row', alignItems: 'flex-end', gap: 2 },
  chartSegment1: { flex: 1, height: 8, backgroundColor: Colors.accent.primary, borderTopLeftRadius: 4, borderTopRightRadius: 4, opacity: 0.5 },
  chartSegment2: { flex: 1, height: 16, backgroundColor: Colors.accent.primary, borderTopLeftRadius: 4, borderTopRightRadius: 4 },

  aiBanner: {
    marginHorizontal: 24, backgroundColor: '#0B1C0A', borderRadius: 24,
    padding: 24, marginBottom: 32,
    borderWidth: 1, borderColor: 'rgba(204, 255, 0, 0.2)',
  },
  aiBannerContent: { width: '65%' },
  aiBadge: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
  aiBadgeText: { color: Colors.text.primary, fontSize: 16, fontWeight: '700' },
  aiSubtitle: { color: Colors.text.secondary, fontSize: 13, lineHeight: 20, marginBottom: 16 },
  aiActionBtn: { backgroundColor: Colors.accent.primary, alignSelf: 'flex-start', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 20 },
  aiActionText: { color: '#000', fontSize: 14, fontWeight: '800' },

  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', paddingHorizontal: 24, marginBottom: 16 },
  sectionTitle: { color: Colors.text.primary, fontSize: 18, fontWeight: '700' },
  seeAll: { color: Colors.accent.primary, fontSize: 13, fontWeight: '600' },

  listContainer: { paddingHorizontal: 24, marginBottom: 24 },
  emptyState: { alignItems: 'center', paddingVertical: 40, backgroundColor: Colors.bg.secondary, borderRadius: 20 },
  emptyEmoji: { fontSize: 40, marginBottom: 12 },
  emptyText: { color: Colors.text.primary, fontSize: 16, fontWeight: '700', marginBottom: 4 },
  emptySub: { color: Colors.text.secondary, fontSize: 14 },

  quickActionsScroll: { paddingHorizontal: 24, gap: 12 },
  actionPill: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.bg.secondary, padding: 8, paddingRight: 16, borderRadius: 30, gap: 10 },
  actionIconBox: { width: 28, height: 28, borderRadius: 14, backgroundColor: Colors.accent.primary, alignItems: 'center', justifyContent: 'center' },
  actionPillText: { color: Colors.text.primary, fontSize: 14, fontWeight: '600' },
});
