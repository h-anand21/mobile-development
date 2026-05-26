// ============================================================
// DevNest — Folder Detail Screen
// ============================================================
import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { ArrowLeft, MoreVertical, Search, SlidersHorizontal, Folder as FolderIcon } from 'lucide-react-native';

import { Colors } from '@/theme/colors';
import { useFolderStore } from '@/store/folderStore';
import { useSnippetStore } from '@/store/snippetStore';
import { SnippetCard } from '@/components/cards/SnippetCard';

const FILTERS = ['All', 'Favorites', 'Recently Used'];

export function FolderDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  
  const { getFolderById } = useFolderStore();
  const { snippets } = useSnippetStore();
  
  const folder = getFolderById(id as string);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('All');

  const folderSnippets = useMemo(() => {
    return snippets.filter(s => s.folderId === id);
  }, [snippets, id]);

  const filteredSnippets = useMemo(() => {
    let result = folderSnippets;
    
    if (activeFilter === 'Favorites') {
      result = result.filter(s => s.isFavorite);
    }
    
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(s => 
        s.title.toLowerCase().includes(q) || 
        s.description?.toLowerCase().includes(q) ||
        s.tags?.some(t => t.toLowerCase().includes(q))
      );
    }
    
    return result;
  }, [folderSnippets, activeFilter, searchQuery]);

  if (!folder) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.iconBtn}>
            <ArrowLeft size={24} color={Colors.text.primary} />
          </TouchableOpacity>
        </View>
        <View style={styles.emptyWrap}>
          <Text style={styles.emptyEmoji}>🚫</Text>
          <Text style={styles.emptyText}>Folder not found</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity onPress={() => router.back()} style={styles.iconBtn}>
            <ArrowLeft size={24} color={Colors.text.primary} />
          </TouchableOpacity>
          <View style={styles.headerTitleWrap}>
            <FolderIcon size={20} color={folder.color} fill={folder.color} />
            <View style={{ marginLeft: 12 }}>
              <Text style={styles.headerTitle}>{folder.name}</Text>
              <Text style={styles.headerSubtitle}>{folderSnippets.length} snippets</Text>
            </View>
          </View>
        </View>
        <TouchableOpacity style={styles.iconBtn}>
          <MoreVertical size={20} color={Colors.text.primary} />
        </TouchableOpacity>
      </View>

      {/* Search Input */}
      <View style={styles.searchWrap}>
        <View style={styles.searchBar}>
          <Search size={20} color={Colors.text.tertiary} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search in folder..."
            placeholderTextColor={Colors.text.tertiary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')} style={styles.clearBtn}>
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
        <TouchableOpacity style={styles.sortChip}>
          <Text style={styles.sortText}>Newest ⌄</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Snippets List */}
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.listContent}>
        {filteredSnippets.length === 0 ? (
          <View style={styles.emptyWrap}>
            <Text style={styles.emptyEmoji}>📝</Text>
            <Text style={styles.emptyText}>No snippets found</Text>
            <Text style={styles.emptySubText}>Add some snippets to this folder.</Text>
          </View>
        ) : (
          filteredSnippets.map(snippet => (
            <SnippetCard 
              key={snippet.id}
              snippet={snippet}
              onPress={() => router.push(`/snippet/${snippet.id}`)}
            />
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg.primary },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 24, paddingVertical: 12, marginBottom: 8,
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center' },
  iconBtn: {
    width: 44, height: 44, borderRadius: 22, backgroundColor: Colors.bg.secondary,
    alignItems: 'center', justifyContent: 'center',
  },
  headerTitleWrap: { flexDirection: 'row', alignItems: 'center', marginLeft: 16 },
  headerTitle: { fontSize: 20, fontWeight: '800', color: Colors.text.primary },
  headerSubtitle: { color: Colors.text.tertiary, fontSize: 13, marginTop: 2, fontWeight: '500' },
  
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

  filterScroll: { paddingHorizontal: 24, gap: 12, paddingBottom: 16, maxHeight: 60 },
  filterChip: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: Colors.bg.secondary, borderWidth: 1, borderColor: Colors.border.primary },
  filterChipActive: { backgroundColor: Colors.accent.primary, borderColor: Colors.accent.primary },
  filterText: { color: Colors.text.secondary, fontSize: 14, fontWeight: '600' },
  filterTextActive: { color: '#000' },
  
  sortChip: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: 'transparent', marginLeft: 'auto' },
  sortText: { color: Colors.text.tertiary, fontSize: 14, fontWeight: '600' },

  listContent: { paddingHorizontal: 24, paddingBottom: 120 },

  emptyWrap: { alignItems: 'center', justifyContent: 'center', marginTop: 40, padding: 40, backgroundColor: Colors.bg.secondary, borderRadius: 20 },
  emptyEmoji: { fontSize: 48, marginBottom: 16 },
  emptyText: { color: Colors.text.primary, fontSize: 18, fontWeight: '700', marginBottom: 8 },
  emptySubText: { color: Colors.text.secondary, fontSize: 14, textAlign: 'center' },
});
