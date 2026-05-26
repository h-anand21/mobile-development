// ============================================================
// DevNest — Edit Snippet Screen
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

import { Colors } from '@/theme/colors';
import { useSnippetStore } from '@/store/snippetStore';
import { LANGUAGES } from '@/constants/languages';
import { Language } from '@/types/snippet.types';

export function EditSnippetScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { getSnippetById, updateSnippet, deleteSnippet } = useSnippetStore();
  
  const snippet = getSnippetById(id as string);

  const [title, setTitle] = useState('');
  const [language, setLanguage] = useState<Language>('JavaScript');
  const [code, setCode] = useState('');
  const [description, setDescription] = useState('');
  const [tagsInput, setTagsInput] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [isPrivate, setIsPrivate] = useState(false);

  useEffect(() => {
    if (snippet) {
      setTitle(snippet.title);
      setLanguage(snippet.language);
      setCode(snippet.content);
      setDescription(snippet.description || '');
      setTags(snippet.tags || []);
    }
  }, [snippet]);

  if (!snippet) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <ArrowLeft size={24} color={Colors.text.primary} />
          </TouchableOpacity>
        </View>
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <Text style={{ color: Colors.text.primary, fontSize: 18 }}>Snippet not found</Text>
        </View>
      </SafeAreaView>
    );
  }

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
      await updateSnippet(snippet.id, {
        title: title.trim(),
        content: code.trim(),
        language,
        description: description.trim() || undefined,
        tags,
      });

      Toast.show({
        type: 'success',
        text1: 'Changes saved ✨',
      });

      router.back();
    } catch (e: any) {
      Toast.show({
        type: 'error',
        text1: 'Failed to update',
        text2: e.message,
      });
    }
  };

  const handleDelete = () => {
    Alert.alert('Delete Snippet', 'Are you sure you want to delete this snippet?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => {
        await deleteSnippet(snippet.id);
        Toast.show({ type: 'success', text1: 'Snippet deleted' });
        router.dismissAll();
      }}
    ]);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <KeyboardAvoidingView 
        style={{ flex: 1 }} 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} hitSlop={{top:10, bottom:10, left:10, right:10}}>
            <ArrowLeft size={24} color={Colors.text.primary} />
          </TouchableOpacity>
          <View style={{ flex: 1, alignItems: 'center' }}>
            <Text style={styles.headerTitle}>Edit <Text style={styles.green}>Snippet ✨</Text></Text>
            <Text style={styles.headerSubtitle}>Update your code snippet</Text>
          </View>
          <TouchableOpacity 
            onPress={handleSave} 
            disabled={!isValid}
            style={[styles.saveTopBtn, !isValid && { opacity: 0.5 }]}
          >
            <Text style={styles.saveTopText}>Save</Text>
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          
          {/* Title */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Title <Text style={styles.required}>*</Text></Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. JWT Authentication Middleware"
              placeholderTextColor={Colors.text.tertiary}
              value={title}
              onChangeText={setTitle}
            />
          </View>

          {/* Language Selection */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Language <Text style={styles.required}>*</Text></Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.langScroll}>
              {LANGUAGES.slice(0, 10).map(lang => {
                const isActive = language === lang.label;
                return (
                  <TouchableOpacity 
                    key={lang.label} 
                    style={[styles.langChip, isActive && styles.langChipActive]}
                    onPress={() => setLanguage(lang.label as Language)}
                  >
                    <View style={[styles.langDot, { backgroundColor: lang.color }]} />
                    <Text style={[styles.langChipText, isActive && styles.langChipTextActive]}>{lang.label}</Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>

          {/* Code Editor Area */}
          <View style={styles.inputGroup}>
            <View style={styles.labelRow}>
              <Text style={styles.label}>Code <Text style={styles.required}>*</Text></Text>
              <Code size={16} color={Colors.text.secondary} />
            </View>
            <View style={styles.codeContainer}>
              <TextInput
                style={styles.codeInput}
                placeholder="// Write or paste your code here..."
                placeholderTextColor={Colors.text.tertiary}
                value={code}
                onChangeText={setCode}
                multiline
                textAlignVertical="top"
                autoCapitalize="none"
                autoCorrect={false}
                spellCheck={false}
              />
            </View>
          </View>

          {/* Description */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Description (Optional)</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="What does this snippet do?"
              placeholderTextColor={Colors.text.tertiary}
              value={description}
              onChangeText={setDescription}
              multiline
              textAlignVertical="top"
            />
          </View>

          {/* Tags */}
          <View style={styles.inputGroup}>
            <View style={styles.labelRow}>
              <Text style={styles.label}>Tags</Text>
              <Hash size={16} color={Colors.text.secondary} />
            </View>
            <View style={styles.tagInputRow}>
              <TextInput
                style={[styles.input, { flex: 1, marginBottom: 0 }]}
                placeholder="Add a tag..."
                placeholderTextColor={Colors.text.tertiary}
                value={tagsInput}
                onChangeText={setTagsInput}
                onSubmitEditing={handleAddTag}
                returnKeyType="done"
              />
              <TouchableOpacity style={styles.addTagBtn} onPress={handleAddTag}>
                <Text style={styles.addTagText}>Add</Text>
              </TouchableOpacity>
            </View>
            {tags.length > 0 && (
              <View style={styles.tagsContainer}>
                {tags.map(tag => (
                  <View key={tag} style={styles.tagBadge}>
                    <Text style={styles.tagBadgeText}>#{tag}</Text>
                    <TouchableOpacity onPress={() => handleRemoveTag(tag)} hitSlop={{top:5, bottom:5, left:5, right:5}}>
                      <X size={14} color={Colors.text.secondary} />
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            )}
          </View>

          {/* Delete Action */}
          <TouchableOpacity style={styles.deleteBtn} onPress={handleDelete}>
            <Trash2 size={20} color={Colors.status.error} />
            <Text style={styles.deleteBtnText}>Delete Snippet</Text>
          </TouchableOpacity>

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg.primary },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingVertical: 12,
    borderBottomWidth: 1, borderBottomColor: Colors.border.primary,
  },
  backBtn: { padding: 4 },
  headerTitle: { fontSize: 18, fontWeight: '800', color: Colors.text.primary },
  headerSubtitle: { fontSize: 12, color: Colors.text.tertiary, marginTop: 2 },
  green: { color: Colors.accent.primary },
  
  saveTopBtn: { backgroundColor: Colors.accent.primary, paddingHorizontal: 16, paddingVertical: 8, borderRadius: 12 },
  saveTopText: { color: '#000', fontWeight: '700', fontSize: 14 },

  scrollContent: { padding: 20, paddingBottom: 40 },
  
  inputGroup: { marginBottom: 24 },
  labelRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  label: { fontSize: 14, fontWeight: '600', color: Colors.text.secondary, marginBottom: 8 },
  required: { color: Colors.status.error },
  
  input: {
    backgroundColor: Colors.bg.secondary,
    borderWidth: 1, borderColor: Colors.border.primary,
    borderRadius: 12, paddingHorizontal: 16, height: 50,
    color: Colors.text.primary, fontSize: 15,
  },
  textArea: { height: 100, paddingTop: 16 },
  
  langScroll: { gap: 8, paddingRight: 20 },
  langChip: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    paddingHorizontal: 16, paddingVertical: 10,
    backgroundColor: Colors.bg.secondary,
    borderRadius: 12, borderWidth: 1, borderColor: Colors.border.primary,
  },
  langChipActive: { backgroundColor: Colors.accent.primary + '15', borderColor: Colors.accent.primary },
  langDot: { width: 10, height: 10, borderRadius: 5 },
  langChipText: { color: Colors.text.primary, fontSize: 14, fontWeight: '500' },
  langChipTextActive: { color: Colors.accent.primary, fontWeight: '700' },

  codeContainer: {
    backgroundColor: Colors.bg.secondary,
    borderWidth: 1, borderColor: Colors.border.primary,
    borderRadius: 12, overflow: 'hidden',
  },
  codeInput: {
    padding: 16, height: 250,
    color: Colors.text.primary, fontSize: 14,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },

  tagInputRow: { flexDirection: 'row', gap: 12, alignItems: 'center' },
  addTagBtn: {
    backgroundColor: Colors.bg.tertiary, height: 50, paddingHorizontal: 20,
    borderRadius: 12, alignItems: 'center', justifyContent: 'center',
  },
  addTagText: { color: Colors.text.primary, fontWeight: '600' },
  tagsContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 12 },
  tagBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: Colors.bg.tertiary, paddingHorizontal: 12, paddingVertical: 6,
    borderRadius: 8,
  },
  tagBadgeText: { color: Colors.text.primary, fontSize: 13, fontWeight: '500' },

  deleteBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    borderWidth: 1, borderColor: Colors.status.error, borderRadius: 14,
    height: 54, marginTop: 12, backgroundColor: Colors.status.error + '10',
  },
  deleteBtnText: { color: Colors.status.error, fontSize: 16, fontWeight: '600' },
});
