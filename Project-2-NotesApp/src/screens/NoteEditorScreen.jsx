import React, { useMemo, useState } from 'react';
import {
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
import { LinearGradient } from 'expo-linear-gradient';

export default function NoteEditorScreen({ onSave, onBack, theme }) {
  const { height } = useWindowDimensions();
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
        headerGradient: {
          paddingTop: 50,
          paddingBottom: 25,
          paddingHorizontal: 24,
          borderBottomLeftRadius: 35,
          borderBottomRightRadius: 35,
          position: 'relative',
          overflow: 'hidden',
          elevation: 8,
          shadowColor: '#FF8C00',
          shadowOffset: { width: 0, height: 6 },
          shadowOpacity: 0.25,
          shadowRadius: 15,
        },
        headerTop: {
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 16,
          zIndex: 2,
        },
        iconBtn: {
          width: 44,
          height: 44,
          borderRadius: 14,
          backgroundColor: 'rgba(255,255,255,0.25)',
          alignItems: 'center',
          justifyContent: 'center',
          borderWidth: 1,
          borderColor: 'rgba(255,255,255,0.2)',
        },
        headerContent: {
          zIndex: 2,
        },
        headerTitle: {
          color: '#FFFFFF',
          fontSize: 30,
          fontWeight: '900',
          letterSpacing: -1,
        },
        headerSubtitle: {
          color: 'rgba(255,255,255,0.85)',
          fontSize: 14,
          marginTop: 2,
          fontWeight: '500',
        },
        bgIcon: {
          position: 'absolute',
          right: -20,
          bottom: -15,
          opacity: 0.12,
          zIndex: 1,
        },
        bgCircle: {
          position: 'absolute',
          left: -30,
          top: -15,
          width: 120,
          height: 120,
          borderRadius: 60,
          backgroundColor: 'rgba(255,255,255,0.08)',
          zIndex: 1,
        },
        mainContent: {
          flex: 1,
          paddingHorizontal: 20,
          paddingTop: 20,
        },
        inputCard: {
          flex: 1,
          backgroundColor: theme.surface,
          borderRadius: 30,
          padding: 18,
          elevation: 4,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.06,
          shadowRadius: 10,
          marginBottom: 16,
        },
        labelGroup: {
          flexDirection: 'row',
          alignItems: 'center',
          gap: 6,
          marginBottom: 8,
        },
        label: {
          fontSize: 13,
          fontWeight: '800',
          color: theme.mutedText,
          textTransform: 'uppercase',
          letterSpacing: 1,
        },
        titleInput: {
          fontSize: 20,
          fontWeight: '700',
          color: theme.text,
          paddingVertical: 10,
          paddingHorizontal: 4,
          borderBottomWidth: 1,
          borderBottomColor: theme.border,
          marginBottom: 16,
        },
        bodyScroll: {
          flex: 1,
        },
        bodyInput: {
          fontSize: 16,
          color: theme.text,
          paddingHorizontal: 4,
          lineHeight: 24,
          textAlignVertical: 'top',
        },
        footer: {
          flexDirection: 'row',
          gap: 12,
          paddingHorizontal: 20,
          paddingBottom: 25,
          paddingTop: 10,
        },
        cancelBtn: {
          flex: 1,
          height: 58,
          borderRadius: 18,
          backgroundColor: theme.surface,
          alignItems: 'center',
          justifyContent: 'center',
          borderWidth: 1.5,
          borderColor: theme.border,
        },
        cancelTxt: {
          color: theme.text,
          fontSize: 16,
          fontWeight: '800',
        },
        saveBtnContainer: {
          flex: 2,
          height: 58,
          borderRadius: 18,
          overflow: 'hidden',
          elevation: 6,
          shadowColor: '#FF8C00',
          shadowOffset: { width: 0, height: 3 },
          shadowOpacity: 0.3,
          shadowRadius: 8,
        },
        saveGrad: {
          flex: 1,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 8,
        },
        saveTxt: {
          color: '#FFFFFF',
          fontSize: 16,
          fontWeight: '800',
        },
        statusTxt: {
          textAlign: 'center',
          fontSize: 13,
          color: theme.accent,
          fontWeight: '700',
          marginBottom: 10,
        },
      }),
    [theme]
  );

  return (
    <KeyboardAvoidingView
      style={styles.screen}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      {/* Fixed Header */}
      <LinearGradient
        colors={['#FF8C00', '#FFD700']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.headerGradient}
      >
        <View style={styles.bgCircle} />
        <View style={styles.bgIcon}>
          <Ionicons name="document-text" size={160} color="#FFFFFF" />
        </View>

        <View style={styles.headerTop}>
          <Pressable onPress={onBack} style={styles.iconBtn}>
            <Ionicons name="chevron-back" size={24} color="#FFFFFF" />
          </Pressable>
          <Pressable 
            onPress={() => {
              setTitle('');
              setBody('');
              setStatus('Draft Cleared ✨');
            }} 
            style={styles.iconBtn}
          >
            <Ionicons name="sparkles-outline" size={22} color="#FFFFFF" />
          </Pressable>
        </View>

        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>New Note</Text>
          <Text style={styles.headerSubtitle}>Turn your ideas into reality</Text>
        </View>
      </LinearGradient>

      {/* Main Content Area */}
      <View style={styles.mainContent}>
        <View style={styles.inputCard}>
          <View style={styles.labelGroup}>
            <Ionicons name="bookmark" size={14} color={theme.primary} />
            <Text style={styles.label}>Note Title</Text>
          </View>
          <TextInput
            value={title}
            onChangeText={setTitle}
            placeholder="What's on your mind?"
            placeholderTextColor={theme.placeholder}
            style={styles.titleInput}
          />

          <View style={styles.labelGroup}>
            <Ionicons name="reader" size={14} color={theme.primary} />
            <Text style={styles.label}>Description</Text>
          </View>
          
          <ScrollView style={styles.bodyScroll} showsVerticalScrollIndicator={false}>
            <TextInput
              value={body}
              onChangeText={setBody}
              placeholder="Write down your thoughts here..."
              placeholderTextColor={theme.placeholder}
              style={styles.bodyInput}
              multiline
              scrollEnabled={false} // Managed by outer ScrollView
            />
          </ScrollView>
        </View>
      </View>

      {/* Fixed Footer */}
      {!!status && <Text style={styles.statusTxt}>{status}</Text>}
      
      <View style={styles.footer}>
        <Pressable onPress={onBack} style={styles.cancelBtn}>
          <Text style={styles.cancelTxt}>Cancel</Text>
        </Pressable>

        <Pressable
          onPress={() => {
            if (title.trim() || body.trim()) {
              onSave({ title: title || 'Untitled Note', content: body });
            } else {
              setStatus('Oops! Add some content first ✍️');
            }
          }}
          style={styles.saveBtnContainer}
        >
          <LinearGradient
            colors={['#FF8C00', '#FFD700']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.saveGrad}
          >
            <Ionicons name="checkmark-done" size={20} color="#FFFFFF" />
            <Text style={styles.saveTxt}>Save Note</Text>
          </LinearGradient>
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}
