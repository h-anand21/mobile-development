// ============================================================
// DevNest — Folder Detail Screen
// ============================================================
import React, { useState, useMemo, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, Modal, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { ArrowLeft, MoreVertical, Search, SlidersHorizontal, Folder as FolderIcon } from 'lucide-react-native';
import Toast from 'react-native-toast-message';

import { useThemeColors } from '@/theme/colors';
import { useFolderStore } from '@/store/folderStore';
import { useSnippetStore } from '@/store/snippetStore';
import { GlassFolder } from '@/components/common/GlassFolder';
import { SnippetCard } from '@/components/cards/SnippetCard';

const FILTERS = ['All', 'Favorites', 'Recently Used'];
const FOLDER_COLORS = [
  '#58A6FF', // Blue
  '#39D353', // Green
  '#D29922', // Yellow
  '#FF5252', // Red
  '#A371F7', // Purple
  '#FF66B2', // Pink
  '#FF9800', // Orange
];

export function FolderDetailScreen() {
  const router = useRouter();
  const colors = useThemeColors();
  const styles = getStyles(colors);
  
  const { id } = useLocalSearchParams<{ id: string }>();
  
  const { getFolderById, updateFolder, deleteFolder } = useFolderStore();
  const { snippets } = useSnippetStore();
  
  const folder = getFolderById(id as string);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('All');
  const [showFilters, setShowFilters] = useState(false);

  // Edit Modal State
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [folderName, setFolderName] = useState('');
  const [folderColor, setFolderColor] = useState(FOLDER_COLORS[0]);

  useEffect(() => {
    if (folder) {
      setFolderName(folder.name);
      setFolderColor(folder.color || FOLDER_COLORS[0]);
    }
  }, [folder]);

  const handleSaveFolder = async () => {
    if (!folder || !folderName.trim()) return;
    try {
      await updateFolder(folder.id, { name: folderName.trim(), color: folderColor });
      Toast.show({ type: 'success', text1: 'Folder updated' });
      setIsEditModalVisible(false);
    } catch (e) {
      Toast.show({ type: 'error', text1: 'Failed to update folder' });
    }
  };

  const handleDeleteFolder = async () => {
    if (!folder) return;
    try {
      await deleteFolder(folder.id);
      Toast.show({ type: 'success', text1: 'Folder deleted' });
      setIsEditModalVisible(false);
      router.back();
    } catch(e) {
      Toast.show({ type: 'error', text1: 'Failed to delete' });
    }
  };

  const folderSnippets = useMemo(() => {
    return snippets.filter(s => s.folderId === id && !s.isDeleted);
  }, [snippets, id]);

  const filteredSnippets = useMemo(() => {
    let result = folderSnippets;
    
    if (activeFilter === 'Favorites') {
      result = result.filter(s => s.isFavorite);
    }

    if (searchQuery.trim().length > 0) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(s => 
        s.title.toLowerCase().includes(q) || 
        s.content.toLowerCase().includes(q) ||
        s.language.toLowerCase().includes(q)
      );
    }

    return result;
  }, [folderSnippets, activeFilter, searchQuery]);

  if (!folder) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.iconBtn}>
            <ArrowLeft size={24} color={colors.text.primary} />
          </TouchableOpacity>
        </View>
        <View style={styles.emptyWrap}>
          <Text style={styles.emptyEmoji}>📁</Text>
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
            <ArrowLeft size={24} color={colors.text.primary} />
          </TouchableOpacity>
          <View style={styles.headerTitleWrap}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <GlassFolder color={folder.color || colors.accent.primary} size={24} />
              <Text style={styles.headerTitle}>{folder.name}</Text>
            </View>
            <Text style={styles.headerSubtitle}>{folderSnippets.length} snippets</Text>
          </View>
        </View>
        
        <TouchableOpacity style={styles.iconBtn} onPress={() => setIsEditModalVisible(true)}>
          <MoreVertical size={24} color={colors.text.primary} />
        </TouchableOpacity>
      </View>

      {/* Search Input */}
      <View style={styles.searchWrap}>
        <View style={styles.searchBar}>
          <Search size={20} color={colors.text.tertiary} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search in folder..."
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

      {/* Snippet Cards */}
      <ScrollView contentContainerStyle={styles.listContent} showsVerticalScrollIndicator={false}>
        {filteredSnippets.length === 0 ? (
          <View style={styles.emptyWrap}>
            <Text style={styles.emptyEmoji}>📝</Text>
            <Text style={styles.emptyText}>No snippets found</Text>
            <Text style={styles.emptySubText}>There are no snippets matching your query in this folder.</Text>
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

      {/* Edit Folder Modal */}
      <Modal visible={isEditModalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <TouchableOpacity style={styles.modalBackdrop} activeOpacity={1} onPress={() => setIsEditModalVisible(false)} />
          <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
            <View style={styles.modalContainer}>
              <View style={styles.modalHandle} />
              <Text style={styles.modalTitle}>Folder Settings</Text>
              
              <Text style={styles.inputLabel}>Folder Name</Text>
              <TextInput 
                style={styles.modalInput}
                placeholder="Name your folder..."
                placeholderTextColor={colors.text.tertiary}
                value={folderName}
                onChangeText={setFolderName}
              />

              <Text style={styles.inputLabel}>Choose Color</Text>
              <View style={styles.colorsGrid}>
                {FOLDER_COLORS.map(c => (
                  <TouchableOpacity 
                    key={c}
                    style={[styles.colorCircle, { backgroundColor: c }, folderColor === c && styles.colorCircleActive]}
                    onPress={() => setFolderColor(c)}
                  />
                ))}
              </View>

              <View style={styles.modalActions}>
                <TouchableOpacity style={styles.modalDeleteBtn} onPress={handleDeleteFolder}>
                  <Text style={styles.modalDeleteText}>Delete</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.modalSaveBtn} onPress={handleSaveFolder}>
                  <Text style={styles.modalSaveText}>Save</Text>
                </TouchableOpacity>
              </View>
            </View>
          </KeyboardAvoidingView>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const getStyles = (colors: any) => ({
  container: { flex: 1, backgroundColor: colors.bg.primary },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 24, paddingVertical: 12, marginBottom: 8,
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center' },
  iconBtn: {
    width: 44, height: 44, borderRadius: 22, backgroundColor: colors.bg.secondary,
    alignItems: 'center', justifyContent: 'center',
  },
  headerTitleWrap: { flexDirection: 'column', marginLeft: 16 },
  headerTitle: { fontSize: 20, fontWeight: '800', color: colors.text.primary },
  headerSubtitle: { color: colors.text.tertiary, fontSize: 13, marginTop: 2, fontWeight: '500' },
  
  searchWrap: { paddingHorizontal: 24, marginBottom: 20 },
  searchBar: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: colors.bg.secondary,
    borderWidth: 1, borderColor: colors.border.primary, borderRadius: 16,
    height: 56, paddingLeft: 16, paddingRight: 8,
  },
  searchInput: { flex: 1, color: colors.text.primary, fontSize: 16, marginLeft: 12 },
  clearBtn: { width: 24, height: 24, borderRadius: 12, backgroundColor: colors.bg.tertiary, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  clearBtnText: { color: colors.text.secondary, fontSize: 14, fontWeight: 'bold', marginTop: -2 },
  filterIconWrap: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },

  filterScroll: { paddingHorizontal: 24, gap: 12, paddingBottom: 16, maxHeight: 60 },
  filterChip: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: colors.bg.secondary, borderWidth: 1, borderColor: colors.border.primary, marginRight: 8 },
  filterChipActive: { backgroundColor: colors.accent.primary, borderColor: colors.accent.primary },
  filterText: { color: colors.text.secondary, fontSize: 14, fontWeight: '600' },
  filterTextActive: { color: '#000' },
  
  sortChip: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: 'transparent', marginLeft: 'auto' },
  sortText: { color: colors.text.tertiary, fontSize: 14, fontWeight: '600' },

  listContent: { paddingHorizontal: 24, paddingBottom: 120 },

  emptyWrap: { alignItems: 'center', justifyContent: 'center', marginTop: 40, padding: 40, backgroundColor: colors.bg.secondary, borderRadius: 20, borderWidth: 1, borderColor: colors.border.primary },
  emptyEmoji: { fontSize: 48, marginBottom: 16 },
  emptyText: { color: colors.text.primary, fontSize: 18, fontWeight: '700', marginBottom: 8 },
  emptySubText: { color: colors.text.secondary, fontSize: 14, textAlign: 'center' },

  modalOverlay: { flex: 1, justifyContent: 'flex-end' },
  modalBackdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.5)' },
  modalContainer: { backgroundColor: colors.bg.secondary, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, paddingBottom: 40 },
  modalHandle: { width: 40, height: 4, backgroundColor: colors.border.primary, borderRadius: 2, alignSelf: 'center', marginBottom: 24 },
  modalTitle: { fontSize: 20, fontWeight: '700', color: colors.text.primary, marginBottom: 24 },
  inputLabel: { fontSize: 13, color: colors.text.secondary, fontWeight: '600', textTransform: 'uppercase', marginBottom: 8 },
  modalInput: { backgroundColor: colors.bg.primary, borderRadius: 12, padding: 16, color: colors.text.primary, fontSize: 16, marginBottom: 24, borderWidth: 1, borderColor: colors.border.primary },
  colorsGrid: { flexDirection: 'row', gap: 16, marginBottom: 32 },
  colorCircle: { width: 36, height: 36, borderRadius: 18, opacity: 0.5 },
  colorCircleActive: { opacity: 1, borderWidth: 3, borderColor: '#fff' },
  modalActions: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  modalDeleteBtn: { padding: 12 },
  modalDeleteText: { color: colors.status.error, fontSize: 15, fontWeight: '600' },
  modalSaveBtn: { backgroundColor: colors.accent.primary, paddingHorizontal: 24, paddingVertical: 12, borderRadius: 20 },
  modalSaveText: { color: colors.bg.primary === '#000000' ? '#000' : '#FFF', fontSize: 15, fontWeight: '700' },
} as any);
