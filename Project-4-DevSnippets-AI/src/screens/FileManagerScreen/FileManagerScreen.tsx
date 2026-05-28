// ============================================================
// DevNest — File Manager Screen (Neon UI)
// ============================================================
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Dimensions, TextInput, Alert, Modal, KeyboardAvoidingView, Platform } from 'react-native';
import { useRef, useMemo, useCallback, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Folder, Plus, Search, ScanLine, FileDown, Sparkles } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';

import { useThemeColors } from '@/theme/colors';
import { useFolderStore } from '@/store/folderStore';
import { useSnippetStore } from '@/store/snippetStore';
import { SnippetCard } from '@/components/cards/SnippetCard';
import { DevNestFolder } from '@/types/file.types';
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import Toast from 'react-native-toast-message';
import { askGeminiVision } from '@/services/aiService';

const { width } = Dimensions.get('window');
const FOLDER_MARGIN = 12;
const FOLDER_SIZE = (width - 48 - (FOLDER_MARGIN * 2)) / 3;

const FOLDER_COLORS = ['#58A6FF', '#39D353', '#D29922', '#F78166', '#A371F7', '#FF66B2'];

export function FileManagerScreen() {
  const router = useRouter();
  const colors = useThemeColors();
  const styles = getStyles(colors);
  const { folders, createFolder, updateFolder, deleteFolder } = useFolderStore();
  const { snippets } = useSnippetStore();
  const [searchQuery, setSearchQuery] = useState('');

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editFolderId, setEditFolderId] = useState<string | null>(null);
  const [folderName, setFolderName] = useState('');
  const [folderColor, setFolderColor] = useState(FOLDER_COLORS[0]);

  const handleCreateFolder = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setEditFolderId(null);
    setFolderName('');
    setFolderColor(FOLDER_COLORS[0]);
    setIsModalVisible(true);
  };

  const openEditModal = (folder: DevNestFolder) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setEditFolderId(folder.id);
    setFolderName(folder.name);
    setFolderColor(folder.color || FOLDER_COLORS[0]);
    setIsModalVisible(true);
  };

  const handleSave = async () => {
    if (!folderName.trim()) {
      Toast.show({ type: 'error', text1: 'Folder name is required' });
      return;
    }
    
    try {
      if (editFolderId) {
        await updateFolder(editFolderId, { name: folderName.trim(), color: folderColor });
        Toast.show({ type: 'success', text1: 'Folder updated' });
      } else {
        await createFolder(folderName.trim(), folderColor, 'Folder');
        Toast.show({ type: 'success', text1: 'Folder created' });
      }
      setIsModalVisible(false);
    } catch (e: any) {
      Toast.show({ type: 'error', text1: 'Failed to save folder' });
    }
  };

  const handleDelete = () => {
    if (!editFolderId) return;
    Alert.alert('Delete Folder', 'Are you sure? Snippets inside will not be deleted, but they will lose this folder.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => {
        try {
          await deleteFolder(editFolderId);
          Toast.show({ type: 'success', text1: 'Folder deleted' });
          setIsModalVisible(false);
        } catch(e) {
          Toast.show({ type: 'error', text1: 'Failed to delete' });
        }
      }}
    ]);
  };

  const handleImportFile = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['text/*', 'application/json', 'application/javascript', 'application/typescript'],
        copyToCacheDirectory: true
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const fileUri = result.assets[0].uri;
        const fileName = result.assets[0].name;
        
        // Read file contents using fetch
        const response = await fetch(fileUri);
        const content = await response.text();
        
        // Go to create screen with content
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

  const renderFolder = (folder: DevNestFolder) => (
    <TouchableOpacity 
      key={folder.id} 
      style={[styles.folderCard, { backgroundColor: folder.color + '15' }]}
      onPress={() => router.push(`/folder/${folder.id}`)}
      onLongPress={() => openEditModal(folder)}
      delayLongPress={300}
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

        {/* Top Search Bar */}
        <View style={styles.topSearchBarWrap}>
          <View style={styles.searchBar}>
            <Search size={20} color={colors.text.tertiary} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search folders & snippets..."
              placeholderTextColor={colors.text.tertiary}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
        </View>

        {/* Tip Banner */}
        <View style={styles.tipBanner}>
          <View style={styles.tipIconWrap}>
            <Sparkles size={16} color={colors.bg.primary} fill={colors.bg.primary} />
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
              <Plus size={24} color={colors.text.primary} />
            </View>
            <Text style={styles.addFolderText}>Add Folder</Text>
          </TouchableOpacity>

          {/* Render Actual Folders */}
          {folders.filter(f => f.name.toLowerCase().includes(searchQuery.toLowerCase())).map(renderFolder)}
        </View>

        {/* Quick Actions */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
        </View>
        <View style={styles.quickActionsContainer}>
          <TouchableOpacity style={styles.quickActionBtn} onPress={handleScanCode}>
            <ScanLine size={24} color={colors.accent.primary} />
            <Text style={styles.quickActionText}>Scan Code</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.quickActionBtn} onPress={handleImportFile}>
            <FileDown size={24} color={colors.accent.primary} />
            <Text style={styles.quickActionText}>Import File</Text>
          </TouchableOpacity>
        </View>

        {/* All Snippets */}
        <View style={[styles.sectionHeader, { marginTop: 32 }]}>
          <Text style={styles.sectionTitle}>All Snippets</Text>
        </View>
        <View style={styles.snippetsContainer}>
          {snippets
            .filter(s => s.title.toLowerCase().includes(searchQuery.toLowerCase()) || s.description?.toLowerCase().includes(searchQuery.toLowerCase()))
            .map(snippet => (
              <SnippetCard 
                key={snippet.id} 
                snippet={snippet} 
                onPress={() => router.push(`/snippet/${snippet.id}`)} 
              />
          ))}
          {snippets.filter(s => s.title.toLowerCase().includes(searchQuery.toLowerCase()) || s.description?.toLowerCase().includes(searchQuery.toLowerCase())).length === 0 && (
             <Text style={styles.emptyText}>No snippets found.</Text>
          )}
        </View>
      </ScrollView>

      {/* Custom Bottom Sheet Modal using React Native Modal */}
      <Modal
        visible={isModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setIsModalVisible(false)}
      >
        <KeyboardAvoidingView 
          style={styles.modalOverlay}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <TouchableOpacity style={styles.modalBackdrop} activeOpacity={1} onPress={() => setIsModalVisible(false)} />
          <View style={styles.modalContainer}>
            <View style={styles.modalHandle} />
            <Text style={styles.modalTitle}>{editFolderId ? 'Edit Folder' : 'New Folder'}</Text>
            
            <Text style={styles.inputLabel}>Folder Name</Text>
            <TextInput
              style={styles.modalInput}
              value={folderName}
              onChangeText={setFolderName}
              placeholder="e.g. React Hooks"
              placeholderTextColor={colors.text.tertiary}
              autoFocus
            />

            <Text style={styles.inputLabel}>Folder Color</Text>
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
              {editFolderId ? (
                <TouchableOpacity style={styles.modalDeleteBtn} onPress={handleDelete}>
                  <Text style={styles.modalDeleteText}>Delete</Text>
                </TouchableOpacity>
              ) : <View style={{ flex: 1 }} />}
              
              <TouchableOpacity style={styles.modalSaveBtn} onPress={handleSave}>
                <Text style={styles.modalSaveText}>Save</Text>
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
  header: { paddingHorizontal: 24, paddingTop: 16, marginBottom: 24 },
  headerTitle: { fontSize: 32, fontWeight: '800', color: colors.text.primary, letterSpacing: -1 },
  green: { color: colors.accent.primary },
  headerSubtitle: { color: colors.text.secondary, fontSize: 15, marginTop: 8 },

  tipBanner: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: colors.bg.secondary,
    marginHorizontal: 24, padding: 12, borderRadius: 12, marginBottom: 32,
    borderWidth: 1, borderColor: colors.border.primary
  },
  tipIconWrap: { width: 24, height: 24, borderRadius: 12, backgroundColor: colors.accent.primary, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  tipText: { color: colors.text.secondary, fontSize: 13, fontWeight: '500' },

  sectionHeader: { paddingHorizontal: 24, marginBottom: 16 },
  sectionTitle: { color: colors.text.primary, fontSize: 18, fontWeight: '700' },

  gridContainer: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 24, gap: FOLDER_MARGIN, marginBottom: 32 },
  
  folderCard: {
    width: FOLDER_SIZE, height: FOLDER_SIZE * 1.1, borderRadius: 20,
    padding: 12, justifyContent: 'center', alignItems: 'center',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)',
  },
  folderName: { color: colors.text.primary, fontSize: 14, fontWeight: '600', marginTop: 12, marginBottom: 4, textAlign: 'center' },
  folderCount: { color: colors.text.tertiary, fontSize: 11, fontWeight: '500' },

  addFolderCard: {
    width: FOLDER_SIZE, height: FOLDER_SIZE * 1.1, borderRadius: 20,
    padding: 12, justifyContent: 'center', alignItems: 'center',
    backgroundColor: colors.bg.secondary, borderWidth: 1, borderColor: colors.border.primary, borderStyle: 'dashed'
  },
  addFolderIconWrap: { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.bg.tertiary, alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  addFolderText: { color: colors.text.secondary, fontSize: 13, fontWeight: '600' },

  quickActionsContainer: { flexDirection: 'row', paddingHorizontal: 24, gap: 12 },
  quickActionBtn: {
    flex: 1, backgroundColor: colors.bg.secondary, borderRadius: 20, padding: 20,
    alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: colors.border.primary
  },
  quickActionBtnActive: {},
  quickActionText: { color: colors.text.primary, fontSize: 14, fontWeight: '600', marginTop: 12 },

  snippetsContainer: { paddingHorizontal: 24, gap: 12 },
  emptyText: { color: colors.text.tertiary, fontSize: 14, textAlign: 'center', marginTop: 16 },

  topSearchBarWrap: {
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  searchBar: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: colors.bg.secondary,
    borderWidth: 1, borderColor: colors.border.primary, borderRadius: 16,
    height: 52, paddingHorizontal: 16,
  },
  searchInput: { flex: 1, color: colors.text.primary, fontSize: 15, marginLeft: 12 },

  modalOverlay: { flex: 1, justifyContent: 'flex-end' },
  modalBackdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.5)' },
  modalContainer: { backgroundColor: colors.bg.secondary, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, paddingBottom: 40 },
  modalHandle: { width: 40, height: 4, backgroundColor: colors.border.primary, borderRadius: 2, alignSelf: 'center', marginBottom: 24 },
  modalTitle: { fontSize: 20, fontWeight: '700', color: colors.text.primary, marginBottom: 24 },
  inputLabel: { fontSize: 13, color: colors.text.secondary, fontWeight: '600', textTransform: 'uppercase', marginBottom: 8 },
  modalInput: { backgroundColor: colors.bg.tertiary, borderRadius: 12, padding: 16, color: colors.text.primary, fontSize: 16, marginBottom: 24, borderWidth: 1, borderColor: colors.border.primary },
  colorsGrid: { flexDirection: 'row', gap: 16, marginBottom: 32 },
  colorCircle: { width: 36, height: 36, borderRadius: 18, opacity: 0.5 },
  colorCircleActive: { opacity: 1, borderWidth: 3, borderColor: '#fff' },
  modalActions: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  modalDeleteBtn: { padding: 12 },
  modalDeleteText: { color: colors.status.error, fontSize: 15, fontWeight: '600' },
  modalSaveBtn: { backgroundColor: colors.accent.primary, paddingHorizontal: 24, paddingVertical: 12, borderRadius: 20 },
  modalSaveText: { color: colors.bg.primary === '#000000' ? '#000' : '#FFF', fontSize: 15, fontWeight: '700' },
} as any);
