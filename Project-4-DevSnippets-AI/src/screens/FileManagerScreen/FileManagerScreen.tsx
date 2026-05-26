// ============================================================
// DevNest — File Manager Screen (Neon UI)
// ============================================================
import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Dimensions, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Folder, Plus, Search, ScanLine, FileDown, Sparkles } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';

import { Colors } from '@/theme/colors';
import { useFolderStore } from '@/store/folderStore';
import { DevNestFolder } from '@/types/file.types';

const { width } = Dimensions.get('window');
const FOLDER_MARGIN = 12;
const FOLDER_SIZE = (width - 48 - (FOLDER_MARGIN * 2)) / 3;

export function FileManagerScreen() {
  const router = useRouter();
  const { folders } = useFolderStore();
  const [searchQuery, setSearchQuery] = useState('');

  const handleCreateFolder = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    // In a real app, open a modal to create folder
    // For now, we will just route or show toast
  };

  const renderFolder = (folder: DevNestFolder) => (
    <TouchableOpacity 
      key={folder.id} 
      style={[styles.folderCard, { backgroundColor: folder.color + '15' }]}
      onPress={() => router.push(`/folder/${folder.id}`)}
    >
      <Folder size={32} color={folder.color} fill={folder.color} />
      <Text style={styles.folderName} numberOfLines={1}>{folder.name}</Text>
      <Text style={styles.folderCount}>{folder.snippetCount} items</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>
        
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>My <Text style={styles.green}>Files</Text></Text>
          <Text style={styles.headerSubtitle}>Organize your snippets into beautiful folders.</Text>
        </View>

        {/* Tip Banner */}
        <View style={styles.tipBanner}>
          <View style={styles.tipIconWrap}>
            <Sparkles size={16} color={Colors.bg.primary} fill={Colors.bg.primary} />
          </View>
          <Text style={styles.tipText}>Tip: Long press any folder to edit or delete it.</Text>
        </View>

        {/* Folders Grid */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Folders</Text>
        </View>
        <View style={styles.gridContainer}>
          {/* Add New Folder Card */}
          <TouchableOpacity style={styles.addFolderCard} onPress={handleCreateFolder}>
            <View style={styles.addFolderIconWrap}>
              <Plus size={24} color={Colors.text.primary} />
            </View>
            <Text style={styles.addFolderText}>Add Folder</Text>
          </TouchableOpacity>

          {/* Render Actual Folders */}
          {folders.map(renderFolder)}
        </View>

        {/* Quick Actions */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
        </View>
        <View style={styles.quickActionsContainer}>
          <TouchableOpacity style={styles.quickActionBtn}>
            <ScanLine size={24} color={Colors.accent.primary} />
            <Text style={styles.quickActionText}>Scan Code</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.quickActionBtn}>
            <FileDown size={24} color={Colors.accent.primary} />
            <Text style={styles.quickActionText}>Import File</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Floating Bottom Search Bar (similar to tab bar style) */}
      <View style={styles.bottomSearchBarWrap}>
        <View style={styles.bottomSearchBar}>
          <Search size={20} color={Colors.text.tertiary} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search folders..."
            placeholderTextColor={Colors.text.tertiary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg.primary },
  header: { paddingHorizontal: 24, paddingTop: 16, marginBottom: 24 },
  headerTitle: { fontSize: 32, fontWeight: '800', color: Colors.text.primary, letterSpacing: -1 },
  green: { color: Colors.accent.primary },
  headerSubtitle: { color: Colors.text.secondary, fontSize: 15, marginTop: 8 },

  tipBanner: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.bg.secondary,
    marginHorizontal: 24, padding: 12, borderRadius: 12, marginBottom: 32,
    borderWidth: 1, borderColor: Colors.border.primary
  },
  tipIconWrap: { width: 24, height: 24, borderRadius: 12, backgroundColor: Colors.accent.primary, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  tipText: { color: Colors.text.secondary, fontSize: 13, fontWeight: '500' },

  sectionHeader: { paddingHorizontal: 24, marginBottom: 16 },
  sectionTitle: { color: Colors.text.primary, fontSize: 18, fontWeight: '700' },

  gridContainer: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 24, gap: FOLDER_MARGIN, marginBottom: 32 },
  
  folderCard: {
    width: FOLDER_SIZE, height: FOLDER_SIZE * 1.1, borderRadius: 20,
    padding: 12, justifyContent: 'center', alignItems: 'center',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)',
  },
  folderName: { color: Colors.text.primary, fontSize: 14, fontWeight: '600', marginTop: 12, marginBottom: 4, textAlign: 'center' },
  folderCount: { color: Colors.text.tertiary, fontSize: 11, fontWeight: '500' },

  addFolderCard: {
    width: FOLDER_SIZE, height: FOLDER_SIZE * 1.1, borderRadius: 20,
    padding: 12, justifyContent: 'center', alignItems: 'center',
    backgroundColor: Colors.bg.secondary, borderWidth: 1, borderColor: Colors.border.primary, borderStyle: 'dashed'
  },
  addFolderIconWrap: { width: 40, height: 40, borderRadius: 20, backgroundColor: Colors.bg.tertiary, alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  addFolderText: { color: Colors.text.secondary, fontSize: 13, fontWeight: '600' },

  quickActionsContainer: { flexDirection: 'row', paddingHorizontal: 24, gap: 12 },
  quickActionBtn: {
    flex: 1, backgroundColor: Colors.bg.secondary, borderRadius: 20, padding: 20,
    alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: Colors.border.primary
  },
  quickActionText: { color: Colors.text.primary, fontSize: 14, fontWeight: '600', marginTop: 12 },

  bottomSearchBarWrap: {
    position: 'absolute', bottom: 100, left: 24, right: 24,
  },
  bottomSearchBar: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.bg.secondary,
    borderWidth: 1, borderColor: Colors.border.primary, borderRadius: 30,
    height: 56, paddingHorizontal: 16,
    shadowColor: '#000', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.5, shadowRadius: 20, elevation: 10,
  },
  searchInput: { flex: 1, color: Colors.text.primary, fontSize: 15, marginLeft: 12 },
});
