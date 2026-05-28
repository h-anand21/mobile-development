// ============================================================
// DevNest — Create Snippet Screen
// ============================================================
import React, { useState } from 'react';
import { 
  View, Text, StyleSheet, TextInput, TouchableOpacity, 
  ScrollView, Switch, KeyboardAvoidingView, Platform 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ArrowLeft, Check, Code, Hash, X } from 'lucide-react-native';
import Toast from 'react-native-toast-message';
import * as Haptics from 'expo-haptics';

import { useThemeColors } from '@/theme/colors';
import { useSnippetStore } from '@/store/snippetStore';
import { useFolderStore } from '@/store/folderStore';
import { useSettingsStore } from '@/store/settingsStore';
import { LANGUAGES } from '@/constants/languages';
import { Language } from '@/types/snippet.types';
import { useLocalSearchParams } from 'expo-router';

export function CreateSnippetScreen() {
  const router = useRouter();
  const colors = useThemeColors();
  const styles = getStyles(colors);
  const params = useLocalSearchParams();
  const { createSnippet } = useSnippetStore();
  const { folders } = useFolderStore();
  const { enabledLanguages } = useSettingsStore();

  const [title, setTitle] = useState((params.importedTitle as string) || (params.title as string) || '');
  const [language, setLanguage] = useState<Language>((params.language as Language) || (params.importedLanguage as Language) || 'JavaScript');
  const [code, setCode] = useState((params.importedContent as string) || (params.content as string) || '');
  const [description, setDescription] = useState((params.description as string) || '');
  const [tagsInput, setTagsInput] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [folderId, setFolderId] = useState<string | undefined>(undefined);
  const [isPrivate, setIsPrivate] = useState(false);

  // Validation
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
      await createSnippet({
        title: title.trim(),
        content: code.trim(),
        language,
        tags,
        description: description.trim(),
        folderId,
      });
      Toast.show({ type: 'success', text1: 'Snippet created successfully!' });
      router.back();
    } catch (e: any) {
      Toast.show({ type: 'error', text1: 'Failed to create snippet', text2: e.message });
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
        style={{ flex: 1 }}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <ArrowLeft size={24} color={colors.text.primary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>New <Text style={styles.green}>Snippet</Text></Text>
          <TouchableOpacity 
            style={[styles.saveTopBtn, !isValid && styles.saveBtnDisabled]} 
            onPress={handleSave}
            disabled={!isValid}
          >
            <Check size={20} color={colors.accent.primary} />
          </TouchableOpacity>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          {/* Title */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Snippet Title <Text style={styles.required}>*</Text></Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. Binary Search Algorithm"
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
              <Text style={styles.label}>Add to Folder</Text>
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
                placeholder="// Write or paste your code here..."
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
                placeholder="e.g. sorting (press enter/add)"
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
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const getStyles = (colors: any) => ({
  container: { flex: 1, backgroundColor: colors.bg.primary },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingVertical: 16,
    borderBottomWidth: 1, borderBottomColor: colors.border.primary,
  },
  backBtn: { padding: 4 },
  headerTitle: { fontSize: 20, fontWeight: '800', color: colors.text.primary },
  green: { color: colors.accent.primary },
  saveTopBtn: { backgroundColor: colors.bg.secondary, padding: 10, borderRadius: 12, borderWidth: 1, borderColor: colors.border.primary },
  saveBtnDisabled: { opacity: 0.5 },
  
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
} as any);
