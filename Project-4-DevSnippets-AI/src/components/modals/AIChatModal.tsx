// ============================================================
// DevNest — AI Chat Modal (Theme Aware)
// ============================================================
import React, { forwardRef, useState, useMemo, useRef, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, KeyboardAvoidingView, Platform, Keyboard } from 'react-native';
import { BottomSheetModal, BottomSheetBackdrop, BottomSheetView, BottomSheetScrollView, BottomSheetTextInput, BottomSheetFooter } from '@gorhom/bottom-sheet';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Sparkles, Send, X, Code2 } from 'lucide-react-native';
import Toast from 'react-native-toast-message';

import { useThemeColors } from '@/theme/colors';
import { askGemini } from '@/services/aiService';

interface AIChatModalProps {
  initialCode?: string;
  initialLanguage?: string;
}

// Separate component to hold input state so typing doesn't re-render the whole modal
const ChatInputFooter = (props: any) => {
  const { onSend, isLoading, bottomInset, colors, styles, ...footerProps } = props;
  const [prompt, setPrompt] = useState('');

  return (
    <BottomSheetFooter {...footerProps} bottomInset={bottomInset}>
      <View style={styles.inputWrap}>
        <BottomSheetTextInput
          style={styles.input}
          placeholder="Ask me to explain, optimize, or write code..."
          placeholderTextColor={colors.text.tertiary}
          value={prompt}
          onChangeText={setPrompt}
          multiline
          editable={!isLoading}
        />
        <TouchableOpacity 
          style={[styles.sendBtn, (!prompt.trim() || isLoading) && { opacity: 0.5 }]} 
          onPress={() => {
            if (prompt.trim() && !isLoading) {
              onSend(prompt.trim());
              setPrompt('');
            }
          }}
          disabled={!prompt.trim() || isLoading}
        >
          <Send size={20} color={colors.bg.primary === '#000000' ? '#000' : '#fff'} />
        </TouchableOpacity>
      </View>
    </BottomSheetFooter>
  );
};

export const AIChatModal = forwardRef<BottomSheetModal, AIChatModalProps>(
  ({ initialCode = '', initialLanguage = 'JavaScript' }, ref) => {
    const colors = useThemeColors();
    const styles = getStyles(colors);
    
    const { bottom } = useSafeAreaInsets();
    const scrollViewRef = useRef<any>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [messages, setMessages] = useState<Array<{ role: 'user' | 'model'; text: string }>>([]);

    const systemPrompt = useMemo(() => {
      return `You are a helpful programming assistant. Below is the code context:
Language: ${initialLanguage}
Code Context:
\`\`\`${initialLanguage.toLowerCase()}
${initialCode}
\`\`\``;
    }, [initialCode, initialLanguage]);

    const handleSend = async (userPrompt: string) => {
      setIsLoading(true);
      // Update local message list
      const newMessages = [...messages, { role: 'user' as const, text: userPrompt }];
      setMessages(newMessages);
      
      // Auto scroll
      setTimeout(() => scrollViewRef.current?.scrollToEnd({ animated: true }), 100);

      try {
        const fullPrompt = `${systemPrompt}\n\nUser Question: ${userPrompt}\nAnswer concisely:`;
        const responseText = await askGemini(fullPrompt);
        
        setMessages([...newMessages, { role: 'model' as const, text: responseText }]);
        
        // Auto scroll
        setTimeout(() => scrollViewRef.current?.scrollToEnd({ animated: true }), 100);
      } catch (e: any) {
        Toast.show({ type: 'error', text1: 'AI failed to respond', text2: e.message });
      } finally {
        setIsLoading(false);
      }
    };

    const renderBackdrop = useCallback(
      (props: any) => (
        <BottomSheetBackdrop {...props} disappearsOnIndex={-1} appearsOnIndex={0} opacity={0.6} />
      ),
      []
    );

    return (
      <BottomSheetModal
        ref={ref}
        index={0}
        snapPoints={['80%']}
        backdropComponent={renderBackdrop}
        handleIndicatorStyle={{ backgroundColor: colors.border.primary }}
        backgroundStyle={{ backgroundColor: colors.bg.secondary }}
        footerComponent={(footerProps) => (
          <ChatInputFooter 
            {...footerProps} 
            onSend={handleSend} 
            isLoading={isLoading} 
            bottomInset={bottom}
            colors={colors}
            styles={styles}
          />
        )}
      >
        <View style={{ flex: 1, backgroundColor: colors.bg.secondary }}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <Sparkles size={24} color={colors.accent.primary} fill={colors.accent.primary + '20'} />
              <Text style={styles.title}>AI Chat Assistant</Text>
            </View>
            <TouchableOpacity 
              style={styles.closeBtn} 
              onPress={() => (ref as any).current?.dismiss()}
            >
              <X size={20} color={colors.text.primary} />
            </TouchableOpacity>
          </View>

          {/* Context Display */}
          {initialCode.trim().length > 0 && (
            <View style={styles.contextBanner}>
              <Code2 size={16} color={colors.text.secondary} />
              <Text style={styles.contextText} numberOfLines={1}>
                Context: {initialLanguage} Snippet ({initialCode.substring(0, 30).replace(/\n/g, ' ')}...)
              </Text>
            </View>
          )}

          {/* Chat History */}
          <BottomSheetScrollView 
            ref={scrollViewRef}
            style={{ flex: 1 }}
            contentContainerStyle={[styles.chatScroll, { paddingBottom: 140 }]} 
            showsVerticalScrollIndicator={true}
            keyboardShouldPersistTaps="handled"
          >
            {messages.length === 0 ? (
              <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', marginTop: 80, paddingHorizontal: 32 }}>
                <Sparkles size={48} color={colors.accent.primary} style={{ marginBottom: 16 }} />
                <Text style={{ color: colors.text.primary, fontSize: 18, fontWeight: '700', marginBottom: 8, textAlign: 'center' }}>How can I help you?</Text>
                <Text style={{ color: colors.text.secondary, fontSize: 14, textAlign: 'center', lineHeight: 20 }}>Ask me to explain this code snippet, find potential bugs, or optimize its performance.</Text>
              </View>
            ) : (
              messages.map((msg, index) => (
                <View key={index} style={[styles.messageBubble, msg.role === 'user' ? styles.userBubble : styles.aiBubble]}>
                  <Text style={[styles.messageText, msg.role === 'user' && styles.userText]}>{msg.text}</Text>
                </View>
              ))
            )}
          </BottomSheetScrollView>
        </View>
      </BottomSheetModal>
    );
  }
);

const getStyles = (colors: any) => ({
  container: { flex: 1 },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: colors.border.primary,
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  title: { fontSize: 20, fontWeight: '800', color: colors.text.primary },
  closeBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: colors.bg.tertiary, alignItems: 'center', justifyContent: 'center' },

  contextBanner: {
    flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: colors.bg.tertiary,
    paddingHorizontal: 20, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: colors.border.primary,
  },
  contextText: { color: colors.text.secondary, fontSize: 13, flex: 1, fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace' },

  chatScroll: { padding: 20, gap: 16 },
  messageBubble: { maxWidth: '85%', padding: 16, borderRadius: 20 },
  userBubble: { alignSelf: 'flex-end', backgroundColor: colors.accent.primary, borderBottomRightRadius: 4 },
  aiBubble: { alignSelf: 'flex-start', backgroundColor: colors.bg.tertiary, borderBottomLeftRadius: 4, borderWidth: 1, borderColor: colors.border.primary },
  messageText: { color: colors.text.primary, fontSize: 15, lineHeight: 22 },
  userText: { color: '#000', fontWeight: '500' },

  inputWrap: {
    flexDirection: 'row', alignItems: 'flex-end', padding: 16,
    borderTopWidth: 1, borderTopColor: colors.border.primary, backgroundColor: colors.bg.secondary,
  },
  input: {
    flex: 1, backgroundColor: colors.bg.primary, borderRadius: 20,
    minHeight: 50, maxHeight: 120, paddingHorizontal: 16, paddingTop: 14, paddingBottom: 14,
    color: colors.text.primary, fontSize: 15, borderWidth: 1, borderColor: colors.border.primary,
  },
  sendBtn: {
    width: 50, height: 50, borderRadius: 25, backgroundColor: colors.accent.primary,
    alignItems: 'center', justifyContent: 'center', marginLeft: 12,
  },
} as any);
