// ============================================================
// DevNest — Edit Snippet Screen (Theme Aware)
// ============================================================
import React, { useState, useEffect } from 'react';
import { 
  View, Text, StyleSheet, TextInput, TouchableOpacity, 
  ScrollView, KeyboardAvoidingView, Platform, Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { ArrowLeft, Check, Code, Hash, X, Trash2 } from 'lucide-react-native';
import Toast from 'react-native-toast-message';
import * as Haptics from 'expo-haptics';

import { useThemeColors } from '@/theme/colors';
import { useSnippetStore } from '@/store/snippetStore';
import { useFolderStore } from '@/store/folderStore';
import { useSettingsStore } from '@/store/settingsStore';
import { LANGUAGES } from '@/constants/languages';
import { Language } from '@/types/snippet.types';

export function EditSnippetScreen() {
  const router = useRouter();
  const colors = useThemeColors();
  const styles = getStyles(colors);
  
  const { id } = useLocalSearchParams<{ id: string }>();
  const { getSnippetById, updateSnippet, deleteSnippet } = useSnippetStore();
  const { folders } = useFolderStore();
  const { enabledLanguages } = useSettingsStore();
  
  const snippet = getSnippetById(id as string);

  const [title, setTitle] = useState('');
  const [language, setLanguage] = useState<Language>('JavaScript');
  const [code, setCode] = useState('');
  const [description, setDescription] = useState('');
  const [tagsInput, setTagsInput] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [folderId, setFolderId] = useState<string | undefined>(undefined);
  const [isPrivate, setIsPrivate] = useState(false);

  useEffect(() => {
    if (snippet) {
      setTitle(snippet.title);
      setLanguage(snippet.language);
      setCode(snippet.content);
      setDescription(snippet.description || '');
      setTags(snippet.tags || []);
      setFolderId(snippet.folderId);
    }
  }, [snippet]);

  if (!snippet) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <ArrowLeft size={24} color={colors.text.primary} />
          </TouchableOpacity>
        </View>
        <View style={styles.emptyWrap}>
          <Text style={styles.emptyEmoji}>🚫</Text>
          <Text style={styles.emptyText}>Snippet not found</Text>
        </View>
      </SafeAreaView>
    );
  }

  const isValid = title.trim().length > 0 && code.trim().length > 0;

  const handleAddTag = () => {
    const trimmed = tagsInput.trim().toLowerCase();
    if (trimmed && !tags.includes(trimmed)) {
      setTags([...tags, trimmed]);
      setTagsInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(t => t !== tagToRemove));
  };

  const handleSave = async () => {
    if (!isValid) return;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    try {
      await updateSnippet(snippet.id, {
        title: title.trim(),
        content: code.trim(),
        language,
        tags,
        description: description.trim(),
        folderId: folderId || undefined,
      });
      Toast.show({ type: 'success', text1: 'Snippet updated successfully!' });
      router.back();
    } catch (e: any) {
      Toast.show({ type: 'error', text1: 'Update failed', text2: e.message });
    }
  };

  const handleDelete = () => {
    Alert.alert('Delete Snippet', 'Are you sure you want to delete this snippet?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => {
        await deleteSnippet(snippet.id);
        Toast.show({ type: 'success', text1: 'Snippet deleted' });
        router.back();
      }}
    ]);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
        style={{ flex: 1 }}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
              <ArrowLeft size={24} color={colors.text.primary} />
            </TouchableOpacity>
            <View style={{ marginLeft: 16 }}>
              <Text style={styles.headerTitle}>Edit Snippet</Text>
              <Text style={styles.headerSubtitle}>{snippet.title}</Text>
            </View>
          </View>
          <TouchableOpacity 
            style={[styles.saveTopBtn, !isValid && styles.saveBtnDisabled]} 
            onPress={handleSave}
            disabled={!isValid}
          >
            <Text style={styles.saveTopText}>Save</Text>
          </TouchableOpacity>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          {/* Title */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Snippet Title <Text style={styles.required}>*</Text></Text>
            <TextInput
              style={styles.input}
              placeholder="Snippet title..."
              placeholderTextColor={colors.text.tertiary}
              value={title}
              onChangeText={setTitle}
            />
          </View>

          {/* Language Selection */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Language</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.langScroll}>
              {LANGUAGES.filter(lang => enabledLanguages.includes(lang.label)).map((lang) => {
                const isActive = language === lang.label;
                return (
                  <TouchableOpacity
                    key={lang.label}
                    style={[styles.langChip, isActive && styles.langChipActive]}
                    onPress={() => setLanguage(lang.label)}
                  >
                    <View style={[styles.langDot, { backgroundColor: lang.color }]} />
                    <Text style={[styles.langChipText, isActive && styles.langChipTextActive]}>
                      {lang.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>

          {/* Folder Selection */}
          {folders.length > 0 && (
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Folder</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.folderScroll}>
                <TouchableOpacity
                  style={[styles.folderChip, folderId === undefined && styles.folderChipActive]}
                  onPress={() => setFolderId(undefined)}
                >
                  <Text style={[styles.folderChipText, folderId === undefined && styles.folderChipTextActive]}>
                    None
                  </Text>
                </TouchableOpacity>
                {folders.map((folder) => {
                  const isActive = folderId === folder.id;
                  return (
                    <TouchableOpacity
                      key={folder.id}
                      style={[styles.folderChip, isActive && styles.folderChipActive]}
                      onPress={() => setFolderId(folder.id)}
                    >
                      <Text style={[styles.folderChipText, isActive && styles.folderChipTextActive]}>
                        {folder.name}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>
          )}

          {/* Code Area */}
          <View style={styles.inputGroup}>
            <View style={styles.labelRow}>
              <Text style={styles.label}>Code <Text style={styles.required}>*</Text></Text>
              <Code size={16} color={colors.accent.primary} />
            </View>
            <View style={styles.codeContainer}>
              <TextInput
                style={styles.codeInput}
                multiline
                placeholder="// Write code here..."
                placeholderTextColor={colors.text.tertiary}
                value={code}
                onChangeText={setCode}
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>
          </View>

          {/* Description */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Description</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              multiline
              numberOfLines={3}
              placeholder="Describe what this snippet does..."
              placeholderTextColor={colors.text.tertiary}
              value={description}
              onChangeText={setDescription}
            />
          </View>

          {/* Tags */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Tags</Text>
            <View style={styles.tagInputRow}>
              <TextInput
                style={[styles.input, { flex: 1 }]}
                placeholder="Add tags..."
                placeholderTextColor={colors.text.tertiary}
                value={tagsInput}
                onChangeText={setTagsInput}
                onSubmitEditing={handleAddTag}
              />
              <TouchableOpacity style={styles.addTagBtn} onPress={handleAddTag}>
                <Text style={styles.addTagText}>Add</Text>
              </TouchableOpacity>
            </View>
            {tags.length > 0 && (
              <View style={styles.tagsContainer}>
                {tags.map((tag) => (
                  <View key={tag} style={styles.tagBadge}>
                    <Hash size={12} color={colors.accent.primary} />
                    <Text style={styles.tagBadgeText}>{tag}</Text>
                    <TouchableOpacity onPress={() => handleRemoveTag(tag)}>
                      <X size={14} color={colors.text.secondary} />
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            )}
          </View>

          {/* Delete Action */}
          <TouchableOpacity style={styles.deleteBtn} onPress={handleDelete}>
            <Trash2 size={20} color={colors.status.error} />
            <Text style={styles.deleteBtnText}>Delete Snippet</Text>
          </TouchableOpacity>

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const getStyles = (colors: any) => ({
  container: { flex: 1, backgroundColor: colors.bg.primary },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingVertical: 12,
    borderBottomWidth: 1, borderBottomColor: colors.border.primary,
  },
  backBtn: { padding: 4 },
  headerTitle: { fontSize: 18, fontWeight: '800', color: colors.text.primary },
  headerSubtitle: { fontSize: 12, color: colors.text.tertiary, marginTop: 2 },
  green: { color: colors.accent.primary },
  
  saveTopBtn: { backgroundColor: colors.accent.primary, paddingHorizontal: 16, paddingVertical: 8, borderRadius: 12 },
  saveBtnDisabled: { opacity: 0.5 },
  saveTopText: { color: colors.bg.primary === '#000000' ? '#000' : '#FFF', fontWeight: '700', fontSize: 14 },

  scrollContent: { padding: 20, paddingBottom: 200 },
  
  inputGroup: { marginBottom: 24 },
  labelRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  label: { fontSize: 14, fontWeight: '600', color: colors.text.secondary, marginBottom: 8 },
  required: { color: colors.status.error },
  
  input: {
    backgroundColor: colors.bg.secondary,
    borderWidth: 1, borderColor: colors.border.primary,
    borderRadius: 12, paddingHorizontal: 16, height: 50,
    color: colors.text.primary, fontSize: 15,
  },
  textArea: { height: 100, paddingTop: 16 },
  
  langScroll: { gap: 8, paddingRight: 20 },
  langChip: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    paddingHorizontal: 16, paddingVertical: 10,
    backgroundColor: colors.bg.secondary,
    borderRadius: 12, borderWidth: 1, borderColor: colors.border.primary,
    marginRight: 8,
  },
  langChipActive: { backgroundColor: colors.accent.primary, borderColor: colors.accent.primary },
  langDot: { width: 10, height: 10, borderRadius: 5 },
  langChipText: { color: colors.text.secondary, fontSize: 14, fontWeight: '600' },
  langChipTextActive: { color: '#000' },

  folderScroll: { gap: 8, paddingRight: 20 },
  folderChip: {
    paddingHorizontal: 16, paddingVertical: 10,
    backgroundColor: colors.bg.secondary,
    borderRadius: 12, borderWidth: 1, borderColor: colors.border.primary,
    marginRight: 8,
  },
  folderChipActive: { backgroundColor: colors.accent.primary, borderColor: colors.accent.primary },
  folderChipText: { color: colors.text.secondary, fontSize: 14, fontWeight: '600' },
  folderChipTextActive: { color: '#000' },

  codeContainer: {
    backgroundColor: colors.bg.secondary,
    borderWidth: 1, borderColor: colors.border.primary,
    borderRadius: 12, overflow: 'hidden',
  },
  codeInput: {
    padding: 16, height: 250,
    color: colors.text.primary, fontSize: 14,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },

  tagInputRow: { flexDirection: 'row', gap: 12, alignItems: 'center' },
  addTagBtn: {
    backgroundColor: colors.bg.tertiary, height: 50, paddingHorizontal: 20,
    borderRadius: 12, alignItems: 'center', justifyContent: 'center',
  },
  addTagText: { color: colors.text.primary, fontWeight: '600' },
  tagsContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 12 },
  tagBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: colors.bg.tertiary, paddingHorizontal: 12, paddingVertical: 6,
    borderRadius: 8,
  },
  tagBadgeText: { color: colors.text.primary, fontSize: 13, fontWeight: '500' },

  deleteBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    borderWidth: 1, borderColor: colors.status.error, borderRadius: 14,
    height: 54, marginTop: 12, backgroundColor: colors.status.error + '10',
  },
  deleteBtnText: { color: colors.status.error, fontSize: 16, fontWeight: '600' },

  emptyWrap: { flex: 1, alignItems: 'center', justifyContent: 'center', marginTop: 40 },
  emptyEmoji: { fontSize: 48, marginBottom: 16 },
  emptyText: { color: colors.text.primary, fontSize: 18, fontWeight: '700' },
} as any);
