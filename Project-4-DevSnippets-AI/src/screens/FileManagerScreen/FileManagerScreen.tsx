// ============================================================
// DevNest — File Manager Screen (Neon UI)
// ============================================================
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Dimensions, TextInput, Alert } from 'react-native';
import { useRef, useMemo, useCallback } from 'react';
import { BottomSheetModal, BottomSheetBackdrop, BottomSheetTextInput } from '@gorhom/bottom-sheet';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Folder, Plus, Search, ScanLine, FileDown, Sparkles } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';

import { Colors } from '@/theme/colors';
import { useFolderStore } from '@/store/folderStore';
import { DevNestFolder } from '@/types/file.types';
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import Toast from 'react-native-toast-message';

const { width } = Dimensions.get('window');
const FOLDER_MARGIN = 12;
const FOLDER_SIZE = (width - 48 - (FOLDER_MARGIN * 2)) / 3;

const FOLDER_COLORS = ['#58A6FF', '#39D353', '#D29922', '#F78166', '#A371F7', '#FF66B2'];

export function FileManagerScreen() {
  const router = useRouter();
  const { folders, createFolder, updateFolder, deleteFolder } = useFolderStore();
  const [searchQuery, setSearchQuery] = useState('');

  const bottomSheetRef = useRef<BottomSheetModal>(null);
  const [editFolderId, setEditFolderId] = useState<string | null>(null);
  const [folderName, setFolderName] = useState('');
  const [folderColor, setFolderColor] = useState(FOLDER_COLORS[0]);

  const snapPoints = useMemo(() => ['55%'], []);
  const renderBackdrop = useCallback(
    (props: any) => <BottomSheetBackdrop {...props} appearsOnIndex={0} disappearsOnIndex={-1} />,
    []
  );

  const handleCreateFolder = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setEditFolderId(null);
    setFolderName('');
    setFolderColor(FOLDER_COLORS[0]);
    bottomSheetRef.current?.present();
  };

  const openEditModal = (folder: DevNestFolder) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setEditFolderId(folder.id);
    setFolderName(folder.name);
    setFolderColor(folder.color || FOLDER_COLORS[0]);
    bottomSheetRef.current?.present();
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
      bottomSheetRef.current?.dismiss();
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
          bottomSheetRef.current?.dismiss();
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
        
        // Read file contents
        const content = await FileSystem.readAsStringAsync(fileUri);
        
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
        quality: 0.8,
      });

      if (!result.canceled) {
        Toast.show({ 
          type: 'success', 
          text1: 'Image captured! 📸', 
          text2: 'AI OCR parsing will be available in the next phase.' 
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
          <TouchableOpacity style={styles.quickActionBtn} onPress={handleScanCode}>
            <ScanLine size={24} color={Colors.accent.primary} />
            <Text style={styles.quickActionText}>Scan Code</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.quickActionBtn} onPress={handleImportFile}>
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

      {/* Bottom Sheet Modal */}
      <BottomSheetModal
        ref={bottomSheetRef}
        index={0}
        snapPoints={snapPoints}
        backdropComponent={renderBackdrop}
        backgroundStyle={{ backgroundColor: Colors.bg.secondary }}
        handleIndicatorStyle={{ backgroundColor: Colors.border.primary }}
      >
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>{editFolderId ? 'Edit Folder' : 'New Folder'}</Text>
          
          <Text style={styles.inputLabel}>Folder Name</Text>
          <BottomSheetTextInput
            style={styles.modalInput}
            value={folderName}
            onChangeText={setFolderName}
            placeholder="e.g. React Hooks"
            placeholderTextColor={Colors.text.tertiary}
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
      </BottomSheetModal>
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

  modalContent: { padding: 24, flex: 1 },
  modalTitle: { fontSize: 20, fontWeight: '700', color: Colors.text.primary, marginBottom: 24 },
  inputLabel: { fontSize: 13, color: Colors.text.secondary, fontWeight: '600', textTransform: 'uppercase', marginBottom: 8 },
  modalInput: { backgroundColor: Colors.bg.tertiary, borderRadius: 12, padding: 16, color: Colors.text.primary, fontSize: 16, marginBottom: 24, borderWidth: 1, borderColor: Colors.border.primary },
  colorsGrid: { flexDirection: 'row', gap: 16, marginBottom: 32 },
  colorCircle: { width: 36, height: 36, borderRadius: 18, opacity: 0.5 },
  colorCircleActive: { opacity: 1, borderWidth: 3, borderColor: '#fff' },
  modalActions: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  modalDeleteBtn: { padding: 12 },
  modalDeleteText: { color: Colors.status.error, fontSize: 15, fontWeight: '600' },
  modalSaveBtn: { backgroundColor: Colors.accent.primary, paddingHorizontal: 24, paddingVertical: 12, borderRadius: 20 },
  modalSaveText: { color: '#000', fontSize: 15, fontWeight: '700' },
});
