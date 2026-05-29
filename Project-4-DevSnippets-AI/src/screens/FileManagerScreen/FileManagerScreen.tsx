// ============================================================
// DevNest — File Manager Screen (Premium UI)
// ============================================================
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Dimensions, TextInput, Alert, Modal, KeyboardAvoidingView, Platform, Image } from 'react-native';
import { useRef, useMemo, useCallback, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Folder, Plus, Search, ScanLine, FileDown, Sparkles, Menu, Bell, FileText, Cloud, Image as ImageIcon, SlidersHorizontal, MoreVertical } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';

import { useThemeColors } from '@/theme/colors';
import { useFolderStore } from '@/store/folderStore';
import { useSnippetStore } from '@/store/snippetStore';
import { SnippetCard } from '@/components/cards/SnippetCard';
import { GlassFolder } from '@/components/common/GlassFolder';
import { DevNestFolder } from '@/types/file.types';
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import Toast from 'react-native-toast-message';
import { askGeminiVision } from '@/services/aiService';

const { width } = Dimensions.get('window');
const FOLDER_MARGIN = 16;
// 3 Columns layout calculation
const FOLDER_SIZE = (width - 48 - (FOLDER_MARGIN * 2)) / 3;

const FILTERS = ['All', 'Folders', 'Snippets'];

const FOLDER_COLORS = [
  '#58A6FF', // Blue
  '#39D353', // Green
  '#D29922', // Yellow
  '#FF5252', // Red
  '#A371F7', // Purple
  '#FF66B2', // Pink
  '#FF9800', // Orange
];

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
  const [showAllFolders, setShowAllFolders] = useState(false);
  
  const [showFilters, setShowFilters] = useState(false);
  const [activeFilter, setActiveFilter] = useState('All');

  const getFolderImage = (color: string) => {
    switch (color) {
      case '#58A6FF': return require('../../../assets/iamge-aste/folder_blue.png');
      case '#39D353': return require('../../../assets/iamge-aste/folder_green.png');
      case '#D29922': return require('../../../assets/iamge-aste/folder_yellow.png');
      case '#FF5252': return require('../../../assets/iamge-aste/folder_red.png');
      case '#A371F7': return require('../../../assets/iamge-aste/folder_purple.png');
      case '#FF66B2': return require('../../../assets/iamge-aste/folder_pink.png');
      case '#FF9800': return require('../../../assets/iamge-aste/folder_orange.png');
      case '#F78166': return require('../../../assets/iamge-aste/folder_orange.png'); // legacy red fallback
      default: return require('../../../assets/iamge-aste/folder_blue.png');
    }
  };

  const uncategorizedSnippets = useMemo(() => {
    return snippets.filter(s => 
      !s.folderId && 
      !s.isDeleted && 
      (s.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
       (s.description && s.description.toLowerCase().includes(searchQuery.toLowerCase())))
    );
  }, [snippets, searchQuery]);

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
    Alert.alert('Delete Folder', 'Are you sure?', [
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
        Toast.show({ type: 'info', text1: 'Analyzing image...' });
        const extractedCode = await askGeminiVision("Extract the code snippet from this image. Do not add any conversational text or markdown formatting blocks like ```javascript. Just output the pure code exactly as it appears in the image.", result.assets[0].base64, result.assets[0].mimeType || 'image/jpeg');
        Toast.show({ type: 'success', text1: 'Code Extracted!' });
        router.push({ pathname: '/snippet/create', params: { importedContent: extractedCode, importedTitle: 'Scanned Code' } });
      }
    } catch (e: any) {
      Toast.show({ type: 'error', text1: 'Failed to scan code' });
    }
  };

  const handleAddScreenshot = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        quality: 0.2,
        base64: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0 && result.assets[0].base64) {
        Toast.show({ type: 'info', text1: 'Analyzing screenshot...' });
        const extractedCode = await askGeminiVision("Extract the code snippet from this image. Do not add any conversational text or markdown formatting blocks like ```javascript. Just output the pure code exactly as it appears in the image.", result.assets[0].base64, result.assets[0].mimeType || 'image/jpeg');
        Toast.show({ type: 'success', text1: 'Code Extracted!' });
        router.push({ pathname: '/snippet/create', params: { importedContent: extractedCode, importedTitle: 'Screenshot Code' } });
      }
    } catch (e: any) {
      Toast.show({ type: 'error', text1: 'Failed to process screenshot' });
    }
  };

  const renderFolder = (folder: DevNestFolder) => (
    <TouchableOpacity 
      key={folder.id} 
      style={styles.folderCard}
      onPress={() => router.push(`/folder/${folder.id}`)}
      onLongPress={() => openEditModal(folder)}
      delayLongPress={300}
    >
      <View style={styles.badgeContainer}>
        <Text style={styles.badgeText}>{folder.snippetCount}</Text>
      </View>
      <View style={styles.folderIconCenter}>
        <GlassFolder color={folder.color || FOLDER_COLORS[0]} size={72} />
      </View>
      <View style={styles.folderCardBottom}>
        <Text style={styles.folderName} numberOfLines={2}>{folder.name}</Text>
        <View style={styles.folderMetaRow}>
          <Text style={styles.folderCountText}>{folder.snippetCount} items</Text>
          <MoreVertical size={14} color={colors.text.tertiary} />
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>
        
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>My Files 👋</Text>
          <Text style={styles.headerSubtitle}>All your documents, organized and safe</Text>
        </View>

        {/* Top Search Bar */}
        <View style={styles.searchContainer}>
          <View style={styles.searchBar}>
            <Search size={20} color={colors.text.tertiary} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search files, folders..."
              placeholderTextColor={colors.text.tertiary}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            <TouchableOpacity 
              style={[styles.filterIconWrap, showFilters && { backgroundColor: colors.accent.primary + '30' }]}
              onPress={() => setShowFilters(!showFilters)}
            >
              <SlidersHorizontal size={20} color={showFilters ? colors.accent.primary : colors.text.tertiary} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Filters (collapsible) */}
        {showFilters && (
          <View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filtersScroll}>
              {FILTERS.map((filter, index) => (
                <TouchableOpacity 
                  key={index} 
                  style={[styles.filterChip, activeFilter === filter && styles.filterChipActive]}
                  onPress={() => setActiveFilter(filter)}
                >
                  <Text style={[styles.filterText, activeFilter === filter && styles.filterTextActive]}>{filter}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Banner Card */}
        <View style={styles.bannerContainer}>
          <View style={styles.bannerContent}>
            <View style={styles.tipPill}>
              <Sparkles size={12} color="#15803D" fill="#15803D" />
              <Text style={styles.tipPillText}>Tip</Text>
            </View>
            <Text style={styles.bannerTitle}>Group files into folders{'\n'}for better organization</Text>
          </View>
          <Image 
            source={require('../../../assets/iamge-aste/image copy.png')} 
            style={styles.bannerImage} 
            resizeMode="contain" 
          />
        </View>

        {/* Folders Section */}
        {(activeFilter === 'All' || activeFilter === 'Folders') && (
          <>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Folders</Text>
              {folders.filter(f => f.name.toLowerCase().includes(searchQuery.toLowerCase())).length > 5 && (
                <TouchableOpacity onPress={() => setShowAllFolders(!showAllFolders)}>
                  <Text style={styles.viewAllText}>{showAllFolders ? 'View less ←' : 'View all →'}</Text>
                </TouchableOpacity>
              )}
            </View>

            <View style={styles.gridContainer}>
              <TouchableOpacity style={styles.addFolderCard} onPress={handleCreateFolder}>
                <Plus size={28} color={colors.accent.primary} />
                <Text style={styles.addFolderText}>Add folder</Text>
              </TouchableOpacity>

              {(showAllFolders 
                ? folders.filter(f => f.name.toLowerCase().includes(searchQuery.toLowerCase())) 
                : folders.filter(f => f.name.toLowerCase().includes(searchQuery.toLowerCase())).slice(0, 5)
              ).map(renderFolder)}
            </View>
          </>
        )}

        {/* Quick Actions */}
        {activeFilter === 'All' && (
          <>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Quick Actions</Text>
            </View>
            <View style={styles.quickActionsContainer}>
              <TouchableOpacity style={[styles.actionBtn, { backgroundColor: colors.bg.primary === '#000000' ? '#022C22' : '#ECFDF5' }]} onPress={handleScanCode}>
                <View style={[styles.actionIconWrap, { backgroundColor: colors.bg.primary === '#000000' ? '#064E3B' : '#D1FAE5' }]}>
                  <FileText size={24} color={colors.bg.primary === '#000000' ? '#34D399' : '#10B981'} />
                </View>
                <Text style={[styles.actionTitle, { color: colors.bg.primary === '#000000' ? '#34D399' : '#10B981' }]}>Scan Document</Text>
                <Text style={[styles.actionSubtitle, { color: colors.bg.primary === '#000000' ? '#A3A3A3' : colors.text.tertiary }]}>Use camera to scan</Text>
              </TouchableOpacity>

              <TouchableOpacity style={[styles.actionBtn, { backgroundColor: colors.bg.primary === '#000000' ? '#1E1B4B' : '#EEF2FF' }]} onPress={handleImportFile}>
                <View style={[styles.actionIconWrap, { backgroundColor: colors.bg.primary === '#000000' ? '#312E81' : '#E0E7FF' }]}>
                  <Cloud size={24} color={colors.bg.primary === '#000000' ? '#818CF8' : '#6366F1'} fill={colors.bg.primary === '#000000' ? '#818CF8' : '#6366F1'} />
                </View>
                <Text style={[styles.actionTitle, { color: colors.bg.primary === '#000000' ? '#818CF8' : '#6366F1' }]}>Import Files</Text>
                <Text style={[styles.actionSubtitle, { color: colors.bg.primary === '#000000' ? '#A3A3A3' : colors.text.tertiary }]}>From local device</Text>
              </TouchableOpacity>

              <TouchableOpacity style={[styles.actionBtn, { backgroundColor: colors.bg.primary === '#000000' ? '#082F49' : '#F0F9FF' }]} onPress={handleAddScreenshot}>
                <View style={[styles.actionIconWrap, { backgroundColor: colors.bg.primary === '#000000' ? '#0C4A6E' : '#E0F2FE' }]}>
                  <ImageIcon size={24} color={colors.bg.primary === '#000000' ? '#38BDF8' : '#0EA5E9'} fill={colors.bg.primary === '#000000' ? '#38BDF8' : '#0EA5E9'} />
                </View>
                <Text style={[styles.actionTitle, { color: colors.bg.primary === '#000000' ? '#38BDF8' : '#0EA5E9' }]}>Add Screenshot</Text>
                <Text style={[styles.actionSubtitle, { color: colors.bg.primary === '#000000' ? '#A3A3A3' : colors.text.tertiary }]}>Save from gallery</Text>
              </TouchableOpacity>
            </View>
          </>
        )}

        {/* Uncategorized Snippets Section */}
        {(activeFilter === 'All' || activeFilter === 'Snippets') && (
          <>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Uncategorized Snippets</Text>
            </View>
            <View style={styles.snippetsContainer}>
              {uncategorizedSnippets.length > 0 ? (
                uncategorizedSnippets.map((snippet) => (
                  <SnippetCard 
                    key={snippet.id} 
                    snippet={snippet} 
                    onPress={() => router.push(`/snippet/${snippet.id}`)}
                  />
                ))
              ) : (
                <Text style={styles.emptyText}>No uncategorized snippets found</Text>
              )}
            </View>
          </>
        )}

      </ScrollView>

      {/* Modal */}
      <Modal visible={isModalVisible} transparent={true} animationType="slide" onRequestClose={() => setIsModalVisible(false)}>
        <KeyboardAvoidingView style={styles.modalOverlay} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <TouchableOpacity style={styles.modalBackdrop} activeOpacity={1} onPress={() => setIsModalVisible(false)} />
          <View style={styles.modalContainer}>
            <View style={styles.modalHandle} />
            <Text style={styles.modalTitle}>{editFolderId ? 'Edit Folder' : 'New Folder'}</Text>
            
            <Text style={styles.inputLabel}>Folder Name</Text>
            <TextInput style={styles.modalInput} value={folderName} onChangeText={setFolderName} placeholder="e.g. React Hooks" placeholderTextColor={colors.text.tertiary} autoFocus />

            <Text style={styles.inputLabel}>Folder Color</Text>
            <View style={styles.colorsGrid}>
              {FOLDER_COLORS.map(c => (
                <TouchableOpacity key={c} style={[styles.colorCircle, { backgroundColor: c }, folderColor === c && styles.colorCircleActive]} onPress={() => setFolderColor(c)} />
              ))}
            </View>

            <View style={styles.modalActions}>
              {editFolderId ? (
                <TouchableOpacity style={styles.modalDeleteBtn} onPress={handleDelete}><Text style={styles.modalDeleteText}>Delete</Text></TouchableOpacity>
              ) : <View style={{ flex: 1 }} />}
              <TouchableOpacity style={styles.modalSaveBtn} onPress={handleSave}><Text style={styles.modalSaveText}>Save</Text></TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}

const getStyles = (colors: any) => ({
  container: { flex: 1, backgroundColor: colors.bg.primary },

  header: { paddingHorizontal: 24, paddingTop: 24, marginBottom: 24 },
  headerTitle: { fontSize: 32, fontWeight: '800', color: colors.text.primary, letterSpacing: -0.5 },
  headerSubtitle: { color: colors.text.secondary, fontSize: 14, marginTop: 4 },

  bannerContainer: { marginHorizontal: 24, backgroundColor: colors.bg.primary === '#000000' ? '#161616' : '#F0FDF4', borderRadius: 20, padding: 20, paddingRight: 150, marginBottom: 32, minHeight: 110, justifyContent: 'center', position: 'relative' },
  bannerContent: { zIndex: 2 },
  tipPill: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.bg.primary === '#000000' ? '#064E3B' : '#DCFCE7', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16, alignSelf: 'flex-start', marginBottom: 12 },
  tipPillText: { color: '#4ADE80', fontSize: 12, fontWeight: '700', marginLeft: 6 },
  bannerTitle: { fontSize: 15, fontWeight: '600', color: colors.text.primary, lineHeight: 22 },
  bannerImage: { position: 'absolute', right: -25, top: -65, width: 240, height: 240, zIndex: 10 },

  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', paddingHorizontal: 24, marginBottom: 16 },
  sectionTitle: { color: colors.text.primary, fontSize: 18, fontWeight: '700' },
  viewAllText: { color: colors.accent.primary, fontSize: 14, fontWeight: '600' },

  gridContainer: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 24, gap: FOLDER_MARGIN, marginBottom: 32 },
  folderCard: { width: FOLDER_SIZE, height: FOLDER_SIZE * 1.3, backgroundColor: colors.bg.secondary, borderRadius: 20, padding: 12, position: 'relative', borderWidth: 1, borderColor: colors.border.primary },
  badgeContainer: { position: 'absolute', top: 8, right: 8, backgroundColor: colors.bg.primary, paddingHorizontal: 8, paddingVertical: 2, borderRadius: 12, zIndex: 10 },
  badgeText: { fontSize: 10, fontWeight: '700', color: colors.text.secondary },
  folderIconCenter: { flex: 1, justifyContent: 'center', alignItems: 'center', marginTop: 10 },
  folderCardBottom: { marginTop: 'auto' },
  folderName: { fontSize: 13, fontWeight: '700', color: colors.text.primary, lineHeight: 16, marginBottom: 4 },
  folderMetaRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  folderCountText: { fontSize: 10, color: colors.text.tertiary, fontWeight: '500' },

  addFolderCard: { width: FOLDER_SIZE, height: FOLDER_SIZE * 1.3, backgroundColor: colors.bg.primary, borderRadius: 20, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: colors.border.primary, borderStyle: 'dashed' },
  addFolderText: { fontSize: 12, fontWeight: '600', color: colors.accent.primary, marginTop: 8 },

  quickActionsContainer: { flexDirection: 'row', paddingHorizontal: 24, gap: 12, marginBottom: 24 },
  actionBtn: { flex: 1, borderRadius: 20, padding: 16, alignItems: 'center', justifyContent: 'center' },
  actionIconWrap: { width: 48, height: 48, borderRadius: 16, alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  actionTitle: { fontSize: 13, fontWeight: '700', textAlign: 'center', marginBottom: 4 },
  actionSubtitle: { fontSize: 10, color: colors.text.tertiary, textAlign: 'center' },

  snippetsContainer: { paddingHorizontal: 24, gap: 12, paddingBottom: 24 },
  emptyText: { color: colors.text.tertiary, fontSize: 14, textAlign: 'center', marginTop: 16 },

  searchContainer: { paddingHorizontal: 24, marginBottom: 16 },
  searchBar: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.bg.secondary, borderRadius: 20, paddingHorizontal: 16, height: 56, borderWidth: 1, borderColor: colors.border.primary },
  searchInput: { flex: 1, marginLeft: 12, fontSize: 15, color: colors.text.primary, height: '100%' },
  
  filtersScroll: { paddingHorizontal: 24, paddingBottom: 16, paddingTop: 4 },
  filterChip: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: colors.bg.secondary, borderWidth: 1, borderColor: colors.border.primary, marginRight: 8 },
  filterChipActive: { backgroundColor: colors.accent.primary, borderColor: colors.accent.primary },
  filterText: { color: colors.text.secondary, fontSize: 13, fontWeight: '600' },
  filterTextActive: { color: '#000000', fontWeight: '700' },
  filterIconWrap: { padding: 8, borderRadius: 12 },

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
