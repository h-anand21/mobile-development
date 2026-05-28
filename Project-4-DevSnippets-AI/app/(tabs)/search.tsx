import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Search, SlidersHorizontal, ArrowLeft, Bookmark, MoreVertical, Folder } from 'lucide-react-native';
import { Colors } from '@/theme/colors';
import { useSnippetStore } from '@/store/snippetStore';
import { useFolderStore } from '@/store/folderStore';
import { SnippetCard } from '@/components/cards/SnippetCard';
import { useDebounce } from '@/hooks/useDebounce';

const FILTERS = ['All', 'Snippets', 'Folders', 'Tags'];

export default function SearchScreen() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('All');
  
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
        f.name.toLowerCase().includes(q) ||
        (f.description && f.description.toLowerCase().includes(q))
      );
    }
    
    return {
      snippets: filteredSnippets,
      folders: filteredFolders,
    };
  }, [debouncedQuery, snippets, folders]);

  const showSnippets = activeFilter === 'All' || activeFilter === 'Snippets' || activeFilter === 'Tags';
  const showFolders = activeFilter === 'All' || activeFilter === 'Folders';

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>
        
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
            <ArrowLeft size={24} color={Colors.text.primary} />
          </TouchableOpacity>
          <View style={styles.headerTitleWrap}>
            <Text style={styles.headerTitle}>Search</Text>
            <View style={styles.headerDot} />
          </View>
          <Text style={styles.headerSubtitle}>Find snippets, folders, tags and more</Text>
        </View>

        {/* Search Input */}
        <View style={styles.searchWrap}>
          <View style={styles.searchBar}>
            <Search size={20} color={Colors.text.tertiary} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search..."
              placeholderTextColor={Colors.text.tertiary}
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
            <View style={styles.filterIconWrap}>
              <SlidersHorizontal size={20} color={Colors.accent.primary} />
            </View>
          </View>
        </View>

        {/* Filter Chips */}
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

        {debouncedQuery.trim().length > 0 && searchResults.snippets.length === 0 && searchResults.folders.length === 0 ? (
          <View style={styles.emptyWrap}>
            <Text style={styles.emptyEmoji}>🔍</Text>
            <Text style={styles.emptyText}>No results found</Text>
            <Text style={styles.emptySubText}>Try searching for something else.</Text>
          </View>
        ) : (
          <>
            {/* Snippets */}
            {showSnippets && searchResults.snippets.length > 0 && (
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionTitle}>Snippets ({searchResults.snippets.length})</Text>
                </View>
                <View style={styles.listContainer}>
                  {searchResults.snippets.map(snippet => (
                    <SnippetCard 
                      key={snippet.id} 
                      snippet={snippet} 
                      onPress={() => router.push(`/snippet/${snippet.id}`)} 
                    />
                  ))}
                </View>
              </View>
            )}

            {/* Folders */}
            {showFolders && searchResults.folders.length > 0 && (
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionTitle}>Folders ({searchResults.folders.length})</Text>
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
                        <View style={[styles.folderIconBg, { backgroundColor: folder.color || Colors.accent.primary }]}>
                          <Folder size={24} color="#000" fill="#000" />
                        </View>
                        <View style={{ flex: 1, marginLeft: 16 }}>
                          <Text style={styles.folderTitle}>{folder.name}</Text>
                          <Text style={styles.folderMeta}>{count} snippets</Text>
                        </View>
                        <Text style={{ color: Colors.text.secondary, fontSize: 20 }}>›</Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>
            )}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg.primary },
  header: { paddingHorizontal: 24, paddingTop: 16, position: 'relative' },
  backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: Colors.bg.secondary, alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  headerTitleWrap: { flexDirection: 'row', alignItems: 'baseline' },
  headerTitle: { fontSize: 36, fontWeight: '800', color: Colors.text.primary, letterSpacing: -1 },
  headerDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.accent.primary, marginLeft: 2 },
  headerSubtitle: { color: Colors.text.secondary, fontSize: 15, marginTop: 8, marginBottom: 24 },
  
  searchWrap: { paddingHorizontal: 24, marginBottom: 20 },
  searchBar: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.bg.secondary,
    borderWidth: 1, borderColor: Colors.border.primary, borderRadius: 16,
    height: 56, paddingLeft: 16, paddingRight: 8,
  },
  searchInput: { flex: 1, color: Colors.text.primary, fontSize: 16, marginLeft: 12 },
  clearBtn: { width: 24, height: 24, borderRadius: 12, backgroundColor: Colors.bg.tertiary, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  clearBtnText: { color: Colors.text.secondary, fontSize: 14, fontWeight: 'bold', marginTop: -2 },
  filterIconWrap: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },

  filterScroll: { paddingHorizontal: 24, gap: 12, marginBottom: 32 },
  filterChip: { paddingHorizontal: 20, paddingVertical: 10, borderRadius: 20, backgroundColor: Colors.bg.secondary, borderWidth: 1, borderColor: Colors.border.primary },
  filterChipActive: { backgroundColor: Colors.accent.primary, borderColor: Colors.accent.primary },
  filterText: { color: Colors.text.secondary, fontSize: 14, fontWeight: '600' },
  filterTextActive: { color: '#000' },

  section: { marginBottom: 24 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', paddingHorizontal: 24, marginBottom: 16 },
  sectionTitle: { color: Colors.text.primary, fontSize: 18, fontWeight: '700' },
  
  listContainer: { paddingHorizontal: 24, gap: 12 },

  folderCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.bg.secondary, padding: 16, borderRadius: 16 },
  folderIconBg: { width: 48, height: 48, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  folderTitle: { color: Colors.text.primary, fontSize: 16, fontWeight: '600', marginBottom: 4 },
  folderMeta: { color: Colors.text.tertiary, fontSize: 13 },

  emptyWrap: { alignItems: 'center', justifyContent: 'center', paddingVertical: 60 },
  emptyEmoji: { fontSize: 48, marginBottom: 16 },
  emptyText: { color: Colors.text.primary, fontSize: 18, fontWeight: '700', marginBottom: 8 },
  emptySubText: { color: Colors.text.secondary, fontSize: 14 },
});
