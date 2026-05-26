// ============================================================
// DevNest — AI Chat Modal
// ============================================================
import React, { forwardRef, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { BottomSheetModal, BottomSheetBackdrop } from '@gorhom/bottom-sheet';
import { Sparkles, Send, X, Code2 } from 'lucide-react-native';

import { Colors } from '@/theme/colors';

interface AIChatModalProps {
  initialCode?: string;
  initialLanguage?: string;
}

export const AIChatModal = forwardRef<BottomSheetModal, AIChatModalProps>(
  ({ initialCode, initialLanguage }, ref) => {
    const [prompt, setPrompt] = useState('');
    const [messages, setMessages] = useState<{ role: 'user' | 'ai', text: string }[]>([
      { role: 'ai', text: 'Hi there! I am your AI assistant. How can I help you with your code today?' }
    ]);

    const handleSend = () => {
      if (!prompt.trim()) return;
      
      setMessages([...messages, { role: 'user', text: prompt }]);
      setPrompt('');

      // Mock AI response
      setTimeout(() => {
        setMessages(prev => [...prev, { 
          role: 'ai', 
          text: 'I can certainly help with that! However, since this is a UI prototype, I am not connected to a real AI backend yet. Stay tuned for the real thing!' 
        }]);
      }, 1000);
    };

    return (
      <BottomSheetModal
        ref={ref}
        snapPoints={['85%']}
        handleIndicatorStyle={{ backgroundColor: Colors.text.tertiary }}
        backgroundStyle={{ backgroundColor: Colors.bg.secondary }}
        backdropComponent={(props) => (
          <BottomSheetBackdrop {...props} disappearsOnIndex={-1} appearsOnIndex={0} opacity={0.6} />
        )}
      >
        <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <Sparkles size={24} color={Colors.accent.primary} />
              <Text style={styles.title}>Ask AI</Text>
            </View>
            <TouchableOpacity onPress={() => (ref as any)?.current?.dismiss()} style={styles.closeBtn}>
              <X size={20} color={Colors.text.primary} />
            </TouchableOpacity>
          </View>

          {/* Context Snippet (if provided) */}
          {initialCode && (
            <View style={styles.contextBanner}>
              <Code2 size={16} color={Colors.text.secondary} />
              <Text style={styles.contextText} numberOfLines={1}>Context: {initialCode}</Text>
            </View>
          )}

          {/* Chat History */}
          <ScrollView contentContainerStyle={styles.chatScroll} showsVerticalScrollIndicator={false}>
            {messages.map((msg, index) => (
              <View key={index} style={[styles.messageBubble, msg.role === 'user' ? styles.userBubble : styles.aiBubble]}>
                <Text style={[styles.messageText, msg.role === 'user' && styles.userText]}>{msg.text}</Text>
              </View>
            ))}
          </ScrollView>

          {/* Input Area */}
          <View style={styles.inputWrap}>
            <TextInput
              style={styles.input}
              placeholder="Ask me to explain, optimize, or write code..."
              placeholderTextColor={Colors.text.tertiary}
              value={prompt}
              onChangeText={setPrompt}
              multiline
            />
            <TouchableOpacity 
              style={[styles.sendBtn, !prompt.trim() && { opacity: 0.5 }]} 
              onPress={handleSend}
              disabled={!prompt.trim()}
            >
              <Send size={20} color="#000" />
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </BottomSheetModal>
    );
  }
);

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: Colors.border.primary,
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  title: { fontSize: 20, fontWeight: '800', color: Colors.text.primary },
  closeBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: Colors.bg.tertiary, alignItems: 'center', justifyContent: 'center' },

  contextBanner: {
    flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: Colors.bg.tertiary,
    paddingHorizontal: 20, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: Colors.border.primary,
  },
  contextText: { color: Colors.text.secondary, fontSize: 13, flex: 1, fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace' },

  chatScroll: { padding: 20, gap: 16 },
  messageBubble: { maxWidth: '85%', padding: 16, borderRadius: 20 },
  userBubble: { alignSelf: 'flex-end', backgroundColor: Colors.accent.primary, borderBottomRightRadius: 4 },
  aiBubble: { alignSelf: 'flex-start', backgroundColor: Colors.bg.tertiary, borderBottomLeftRadius: 4, borderWidth: 1, borderColor: Colors.border.primary },
  messageText: { color: Colors.text.primary, fontSize: 15, lineHeight: 22 },
  userText: { color: '#000', fontWeight: '500' },

  inputWrap: {
    flexDirection: 'row', alignItems: 'flex-end', padding: 16,
    borderTopWidth: 1, borderTopColor: Colors.border.primary, backgroundColor: Colors.bg.secondary,
  },
  input: {
    flex: 1, backgroundColor: Colors.bg.primary, borderRadius: 20,
    minHeight: 50, maxHeight: 120, paddingHorizontal: 16, paddingTop: 14, paddingBottom: 14,
    color: Colors.text.primary, fontSize: 15, borderWidth: 1, borderColor: Colors.border.primary,
  },
  sendBtn: {
    width: 50, height: 50, borderRadius: 25, backgroundColor: Colors.accent.primary,
    alignItems: 'center', justifyContent: 'center', marginLeft: 12,
  },
});
