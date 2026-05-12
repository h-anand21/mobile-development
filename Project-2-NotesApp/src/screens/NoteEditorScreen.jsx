import React, { useMemo, useState } from 'react';
import {
  ImageBackground,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  useWindowDimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import useAppTheme from '../hooks/useAppTheme';

export default function NoteEditorScreen({ onBack }) {
  const { theme } = useAppTheme();
  const { width } = useWindowDimensions();
  const isTablet = width >= 768;

  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [status, setStatus] = useState('');

  const styles = useMemo(
    () =>
      StyleSheet.create({
        screen: {
          flex: 1,
          backgroundColor: theme.background,
        },
        scrollContent: {
          padding: isTablet ? 24 : 16,
          paddingBottom: 28,
        },
        hero: {
          height: isTablet ? 230 : 190,
          borderRadius: 28,
          overflow: 'hidden',
          marginBottom: 16,
          borderWidth: 1,
          borderColor: theme.border,
        },
        heroImage: {
          borderRadius: 28,
        },
        heroOverlay: {
          flex: 1,
          padding: 18,
          justifyContent: 'space-between',
          backgroundColor: theme.overlay,
        },
        heroTop: {
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
        },
        iconButton: {
          width: 42,
          height: 42,
          borderRadius: 14,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: 'rgba(255,255,255,0.14)',
        },
        heroKicker: {
          color: '#FFFFFF',
          fontSize: 12,
          fontWeight: '700',
          letterSpacing: 2,
          marginBottom: 6,
        },
        heroTitle: {
          color: '#FFFFFF',
          fontSize: isTablet ? 28 : 24,
          fontWeight: '800',
          maxWidth: 250,
        },
        heroSubtitle: {
          color: 'rgba(255,255,255,0.9)',
          fontSize: 14,
          lineHeight: 20,
          maxWidth: 260,
        },
        card: {
          borderWidth: 1,
          borderColor: theme.border,
          backgroundColor: theme.surface,
          borderRadius: 24,
          padding: 16,
          gap: 14,
        },
        label: {
          fontSize: 13,
          fontWeight: '700',
          color: theme.mutedText,
          marginBottom: 8,
        },
        input: {
          borderWidth: 1,
          borderColor: theme.border,
          borderRadius: 18,
          backgroundColor: theme.background,
          color: theme.text,
          paddingHorizontal: 14,
          paddingVertical: 14,
          fontSize: 15,
        },
        titleInput: {
          minHeight: 52,
        },
        bodyInput: {
          minHeight: isTablet ? 320 : 260,
          textAlignVertical: 'top',
        },
        actionRow: {
          flexDirection: 'row',
          gap: 12,
          marginTop: 4,
        },
        actionButton: {
          flex: 1,
          height: 52,
          borderRadius: 18,
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'row',
          gap: 8,
        },
        backButton: {
          backgroundColor: theme.surface,
          borderWidth: 1,
          borderColor: theme.border,
        },
        saveButton: {
          backgroundColor: theme.primary,
        },
        backText: {
          color: theme.text,
          fontSize: 14,
          fontWeight: '700',
        },
        saveText: {
          color: theme.primaryText,
          fontSize: 14,
          fontWeight: '700',
        },
        statusText: {
          fontSize: 13,
          color: theme.accent,
          fontWeight: '600',
          marginTop: 6,
        },
      }),
    [theme, isTablet],
  );

  return (
    <KeyboardAvoidingView
      style={styles.screen}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={styles.scrollContent}
      >
        <ImageBackground
          source={{
            uri: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1200&q=80',
          }}
          style={styles.hero}
          imageStyle={styles.heroImage}
        >
          <View style={styles.heroOverlay}>
            <View style={styles.heroTop}>
              <Pressable onPress={onBack} style={styles.iconButton}>
                <Ionicons name="arrow-back" size={20} color="#FFFFFF" />
              </Pressable>

              <Pressable
                onPress={() => {
                  setTitle('');
                  setBody('');
                  setStatus('Draft cleared');
                }}
                style={styles.iconButton}
              >
                <Ionicons name="trash-outline" size={20} color="#FFFFFF" />
              </Pressable>
            </View>

            <View>
              <Text style={styles.heroKicker}>EDITOR</Text>
              <Text style={styles.heroTitle}>Write a note</Text>
              <Text style={styles.heroSubtitle}>
                Comfortable spacing, keyboard-safe inputs, and a calm writing
                layout.
              </Text>
            </View>
          </View>
        </ImageBackground>

        <View style={styles.card}>
          <View>
            <Text style={styles.label}>Title</Text>
            <TextInput
              value={title}
              onChangeText={setTitle}
              placeholder="Note title"
              placeholderTextColor={theme.placeholder}
              style={[styles.input, styles.titleInput]}
            />
          </View>

          <View>
            <Text style={styles.label}>Content</Text>
            <TextInput
              value={body}
              onChangeText={setBody}
              placeholder="Start writing your note here..."
              placeholderTextColor={theme.placeholder}
              style={[styles.input, styles.bodyInput]}
              multiline
            />
          </View>

          <View style={styles.actionRow}>
            <Pressable
              onPress={onBack}
              style={[styles.actionButton, styles.backButton]}
            >
              <Ionicons name="chevron-back" size={18} color={theme.text} />
              <Text style={styles.backText}>Back</Text>
            </Pressable>

            <Pressable
              onPress={() => setStatus('Saved locally')}
              style={[styles.actionButton, styles.saveButton]}
            >
              <Ionicons
                name="save-outline"
                size={18}
                color={theme.primaryText}
              />
              <Text style={styles.saveText}>Save</Text>
            </Pressable>
          </View>

          {!!status && <Text style={styles.statusText}>{status}</Text>}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
