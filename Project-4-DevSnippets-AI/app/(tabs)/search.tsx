// ============================================================
// DevNest — Search Screen (Theme Aware)
// ============================================================
import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Platform, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Search, SlidersHorizontal, ArrowLeft, Bookmark, MoreVertical, Folder } from 'lucide-react-native';

import { useThemeColors } from '@/theme/colors';
import { useSnippetStore } from '@/store/snippetStore';
import { useFolderStore } from '@/store/folderStore';
import { SnippetCard } from '@/components/cards/SnippetCard';
import { useDebounce } from '@/hooks/useDebounce';
import { timeAgo } from '@/utils/formatters/dateFormatter';

const FILTERS = ['All', 'Snippets', 'Folders', 'Tags'];

export default function SearchScreen() {
  const router = useRouter();
  const colors = useThemeColors();
  const styles = getStyles(colors);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('All');
  const [showFilters, setShowFilters] = useState(false);
  
  const debouncedQuery = useDebounce(searchQuery, 300);
  
  const { snippets } = useSnippetStore();
  const { folders } = useFolderStore();

  const searchResults = useMemo(() => {
    const q = debouncedQuery.toLowerCase().trim();
    
    let filteredSnippets = snippets.filter(s => !s.isDeleted);
    let filteredFolders = folders;
    
    if (q) {
      filteredSnippets = filteredSnippets.filter(s => 
        s.title.toLowerCase().includes(q) || 
        s.language.toLowerCase().includes(q) || 
        (s.description && s.description.toLowerCase().includes(q)) ||
        (s.tags && s.tags.some(t => t.toLowerCase().includes(q)))
      );
      
      filteredFolders = filteredFolders.filter(f => 
        f.name.toLowerCase().includes(q)
      );
    }
    
    return {
      snippets: filteredSnippets,
      folders: filteredFolders,
    };
  }, [debouncedQuery, snippets, folders]);

  const allTags = useMemo(() => {
    const tags = new Set<string>();
    snippets.forEach(s => {
      if (!s.isDeleted && s.tags) {
        s.tags.forEach(t => tags.add(t));
      }
    });
    if (tags.size === 0) {
      ['useState', 'react', 'hooks', 'frontend', 'api', 'styling'].forEach(t => tags.add(t));
    }
    return Array.from(tags).slice(0, 15);
  }, [snippets]);

  const showSnippets = activeFilter === 'All' || activeFilter === 'Snippets' || activeFilter === 'Tags';
  const showFolders = activeFilter === 'All' || activeFilter === 'Folders';

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>
        
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
            <ArrowLeft size={24} color={colors.text.primary} />
          </TouchableOpacity>
          <View style={styles.headerTitleWrap}>
            <Text style={styles.headerTitle}>Search</Text>
            <View style={styles.headerDot} />
          </View>
          <Text style={styles.headerSubtitle}>Find snippets, folders, tags and more</Text>

        </View>

        {/* Search Input */}
        <View style={[styles.searchWrap, { zIndex: 10 }]}>
          {/* Dino Mascot */}
          <Image 
            source={require('../../assets/iamge-aste/image.png')} 
            style={styles.dinoMascot}
            resizeMode="contain"
          />
          <View style={styles.searchBar}>
            <Search size={20} color={colors.text.tertiary} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search..."
              placeholderTextColor={colors.text.tertiary}
              value={searchQuery}
              onChangeText={setSearchQuery}
              autoCapitalize="none"
              autoCorrect={false}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')} style={styles.clearBtn} hitSlop={{top:10,bottom:10,left:10,right:10}}>
                <Text style={styles.clearBtnText}>×</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity 
              style={[styles.filterIconWrap, showFilters && { backgroundColor: colors.accent.primary + '30' }]}
              onPress={() => setShowFilters(!showFilters)}
            >
              <SlidersHorizontal size={20} color={colors.accent.primary} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Filter Chips */}
        {showFilters && (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScroll}>
            {FILTERS.map(filter => (
              <TouchableOpacity 
                key={filter}
                style={[styles.filterChip, activeFilter === filter && styles.filterChipActive]}
                onPress={() => setActiveFilter(filter)}
              >
                <Text style={[styles.filterText, activeFilter === filter && styles.filterTextActive]}>
                  {filter}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}

        {debouncedQuery.trim().length > 0 && searchResults.snippets.length === 0 && searchResults.folders.length === 0 ? (
          <View style={styles.emptyWrap}>
            <Text style={styles.emptyEmoji}>🔍</Text>
            <Text style={styles.emptyText}>No results found</Text>
            <Text style={styles.emptySubText}>Try searching for something else.</Text>
          </View>
        ) : (
          <>
            {/* Top Results */}
            {showSnippets && searchResults.snippets.length > 0 && (
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionTitle}>Top Results</Text>
                </View>
                <View style={styles.listContainer}>
                  {/* Show preview only for the first result */}
                  <SnippetCard 
                    key={searchResults.snippets[0].id} 
                    snippet={searchResults.snippets[0]} 
                    onPress={() => router.push(`/snippet/${searchResults.snippets[0].id}`)} 
                    showPreview={true}
                  />
                </View>
              </View>
            )}

            {/* Folders */}
            {showFolders && searchResults.folders.length > 0 && (
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionTitle}>Folders</Text>
                  <TouchableOpacity onPress={() => router.push('/(tabs)/files')}>
                    <Text style={styles.viewAllText}>View all →</Text>
                  </TouchableOpacity>
                </View>
                <View style={styles.listContainer}>
                  {searchResults.folders.map(folder => {
                    const count = snippets.filter(s => s.folderId === folder.id && !s.isDeleted).length;
                    return (
                      <TouchableOpacity 
                        key={folder.id} 
                        style={styles.folderCard}
                        onPress={() => router.push(`/folder/${folder.id}`)}
                      >
                        <View style={[styles.folderIconBg, { backgroundColor: folder.color || colors.accent.primary }]}>
                          <Folder size={24} color="#000" fill="#000" />
                        </View>
                        <View style={{ flex: 1, marginLeft: 16 }}>
                          <Text style={styles.folderTitle}>{folder.name}</Text>
                          <Text style={styles.folderMeta}>{count} snippets • Updated {timeAgo(folder.updatedAt)}</Text>
                        </View>
                        <Text style={{ color: colors.text.secondary, fontSize: 20 }}>›</Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>
            )}

            {/* Tags Section */}
            {showSnippets && (
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionTitle}>Tags</Text>
                  <TouchableOpacity onPress={() => setActiveFilter('Tags')}>
                    <Text style={styles.viewAllText}>View all →</Text>
                  </TouchableOpacity>
                </View>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tagsScroll}>
                  {allTags.map(tag => {
                    const isActive = searchQuery.toLowerCase() === tag.toLowerCase();
                    return (
                      <TouchableOpacity 
                        key={tag}
                        style={isActive ? styles.tagPillActive : styles.tagPill}
                        onPress={() => setSearchQuery(isActive ? '' : tag)}
                      >
                        <Text style={isActive ? styles.tagTextActive : styles.tagText}>{tag}</Text>
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>
              </View>
            )}

            {/* More Snippets */}
            {showSnippets && searchResults.snippets.length > 1 && (
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionTitle}>More Snippets</Text>
                </View>
                <View style={styles.listContainer}>
                  {searchResults.snippets.slice(1).map(snippet => (
                    <SnippetCard 
                      key={snippet.id} 
                      snippet={snippet} 
                      onPress={() => router.push(`/snippet/${snippet.id}`)} 
                    />
                  ))}
                </View>
              </View>
            )}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const getStyles = (colors: any) => ({
  container: { flex: 1, backgroundColor: colors.bg.primary },
  header: { paddingHorizontal: 24, paddingTop: 16, position: 'relative' },
  backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.bg.secondary, alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  headerTitleWrap: { flexDirection: 'row', alignItems: 'baseline' },
  headerTitle: { fontSize: 36, fontWeight: '800', color: colors.text.primary, letterSpacing: -1 },
  headerDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.accent.primary, marginLeft: 2 },
  headerSubtitle: { color: colors.text.secondary, fontSize: 15, marginTop: 8, marginBottom: 24 },
  
  searchWrap: { paddingHorizontal: 24, marginBottom: 20 },
  searchBar: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: colors.bg.secondary,
    borderWidth: 1, borderColor: '#CCFF00', borderRadius: 16,
    height: 56, paddingLeft: 16, paddingRight: 8,
  },
  searchInput: { flex: 1, color: colors.text.primary, fontSize: 16, marginLeft: 12 },
  clearBtn: { width: 24, height: 24, borderRadius: 12, backgroundColor: colors.bg.tertiary, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  clearBtnText: { color: colors.text.secondary, fontSize: 14, fontWeight: 'bold', marginTop: -2 },
  filterIconWrap: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  dinoMascot: { position: 'absolute', right: -10, bottom: 42, width: 240, height: 240, zIndex: 11 },

  filterScroll: { paddingHorizontal: 24, gap: 12, marginBottom: 32 },
  filterChip: { height: 40, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 20, borderRadius: 20, backgroundColor: colors.bg.secondary, borderWidth: 1, borderColor: colors.border.primary, marginRight: 8 },
  filterChipActive: { backgroundColor: colors.accent.primary, borderColor: colors.accent.primary },
  filterText: { color: colors.text.secondary, fontSize: 14, fontWeight: '600' },
  filterTextActive: { color: '#000' },

  section: { marginBottom: 24 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 24, marginBottom: 16 },
  sectionTitle: { color: colors.text.primary, fontSize: 18, fontWeight: '700' },
  viewAllText: { color: colors.accent.primary, fontSize: 13, fontWeight: '600' },
  
  listContainer: { paddingHorizontal: 24, gap: 12 },

  folderCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.bg.secondary, padding: 12, borderRadius: 16, borderWidth: 1, borderColor: colors.border.primary },
  folderIconBg: { width: 40, height: 40, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  folderTitle: { color: colors.text.primary, fontSize: 15, fontWeight: '600', marginBottom: 2 },
  folderMeta: { color: colors.text.tertiary, fontSize: 12 },

  tagsScroll: { paddingHorizontal: 24, gap: 12 },
  tagPill: { paddingHorizontal: 20, paddingVertical: 10, borderRadius: 20, backgroundColor: colors.bg.secondary, borderWidth: 1, borderColor: colors.border.primary },
  tagPillActive: { paddingHorizontal: 20, paddingVertical: 10, borderRadius: 20, backgroundColor: 'transparent', borderWidth: 1, borderColor: '#CCFF00' },
  tagText: { color: colors.text.secondary, fontSize: 14, fontWeight: '500' },
  tagTextActive: { color: '#CCFF00', fontSize: 14, fontWeight: '500' },

  emptyWrap: { alignItems: 'center', justifyContent: 'center', paddingVertical: 60 },
  emptyEmoji: { fontSize: 48, marginBottom: 16 },
  emptyText: { color: colors.text.primary, fontSize: 18, fontWeight: '700', marginBottom: 8 },
  emptySubText: { color: colors.text.secondary, fontSize: 14 },
} as any);
