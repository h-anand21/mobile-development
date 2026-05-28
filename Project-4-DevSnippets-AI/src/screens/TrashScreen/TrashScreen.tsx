// ============================================================
// DevNest — Trash Screen (Theme Aware)
// ============================================================
import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ArrowLeft, Trash2, RotateCcw, AlertTriangle } from 'lucide-react-native';

import { useThemeColors } from '@/theme/colors';
import { useSnippetStore } from '@/store/snippetStore';

export function TrashScreen() {
  const router = useRouter();
  const colors = useThemeColors();
  const styles = getStyles(colors);
  
  const { deletedSnippets, loadDeletedSnippets, restoreSnippet, permanentlyDeleteSnippet } = useSnippetStore();

  useEffect(() => {
    loadDeletedSnippets();
  }, []);

  const handleRestore = (id: string, title: string) => {
    restoreSnippet(id);
    Alert.alert('Restored', `"${title}" has been restored to your snippets.`);
  };

  const handlePermanentDelete = (id: string, title: string) => {
    Alert.alert(
      'Permanently Delete',
      `Are you sure you want to permanently delete "${title}"? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete Permanently', style: 'destructive', onPress: () => permanentlyDeleteSnippet(id) }
      ]
    );
  };

  const getRemainingDays = (updatedAt: string) => {
    const deletedDate = new Date(updatedAt);
    const today = new Date();
    const diffTime = Math.abs(today.getTime() - deletedDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    const remaining = 30 - diffDays;
    return remaining > 0 ? remaining : 0;
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <ArrowLeft size={24} color={colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Trash <Text style={styles.red}>Bin</Text></Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Warning Banner */}
      <View style={styles.warningBanner}>
        <AlertTriangle size={20} color={colors.status.error} style={{ marginRight: 12 }} />
        <Text style={styles.warningText}>Items in the Trash will be permanently deleted after 30 days.</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.listContent}>
        {deletedSnippets.length === 0 ? (
          <View style={styles.emptyWrap}>
            <Text style={styles.emptyEmoji}>🗑️</Text>
            <Text style={styles.emptyText}>Trash is empty</Text>
            <Text style={styles.emptySubText}>Deleted snippets will appear here before being permanently removed.</Text>
          </View>
        ) : (
          deletedSnippets.map((snippet) => {
            const daysLeft = getRemainingDays(snippet.updatedAt);
            return (
              <View key={snippet.id} style={styles.trashCard}>
                <View style={styles.cardHeader}>
                  <View>
                    <Text style={styles.snippetTitle}>{snippet.title}</Text>
                    <Text style={styles.snippetMeta}>
                      Language: {snippet.language} • {daysLeft} days remaining
                    </Text>
                  </View>
                </View>
                
                <View style={styles.cardActions}>
                  <TouchableOpacity 
                    style={[styles.actionBtn, styles.restoreBtn]} 
                    onPress={() => handleRestore(snippet.id, snippet.title)}
                  >
                    <RotateCcw size={16} color={colors.accent.primary} />
                    <Text style={styles.restoreText}>Restore</Text>
                  </TouchableOpacity>

                  <TouchableOpacity 
                    style={[styles.actionBtn, styles.deleteBtn]} 
                    onPress={() => handlePermanentDelete(snippet.id, snippet.title)}
                  >
                    <Trash2 size={16} color={colors.status.error} />
                    <Text style={styles.deleteText}>Delete</Text>
                  </TouchableOpacity>
                </View>
              </View>
            );
          })
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const getStyles = (colors: any) => ({
  container: { flex: 1, backgroundColor: colors.bg.primary },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 24, paddingTop: 16, marginBottom: 16,
  },
  backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.bg.secondary, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 24, fontWeight: '800', color: colors.text.primary, letterSpacing: -0.5 },
  red: { color: colors.status.error },
  
  warningBanner: {
    flexDirection: 'row', alignItems: 'center', marginHorizontal: 24, backgroundColor: colors.status.error + '10',
    paddingHorizontal: 16, paddingVertical: 12, borderRadius: 16, marginBottom: 20, borderWidth: 1, borderColor: colors.status.error + '20'
  },
  warningText: { flex: 1, color: colors.text.secondary, fontSize: 13, fontWeight: '500' },

  listContent: { paddingHorizontal: 24, paddingBottom: 60, gap: 16 },

  emptyWrap: { alignItems: 'center', justifyContent: 'center', marginTop: 40, padding: 40, backgroundColor: colors.bg.secondary, borderRadius: 20, borderWidth: 1, borderColor: colors.border.primary },
  emptyEmoji: { fontSize: 48, marginBottom: 16 },
  emptyText: { color: colors.text.primary, fontSize: 18, fontWeight: '700', marginBottom: 8 },
  emptySubText: { color: colors.text.secondary, fontSize: 14, textAlign: 'center' },

  trashCard: {
    backgroundColor: colors.bg.secondary, borderRadius: 20, padding: 18,
    borderWidth: 1, borderColor: colors.border.primary, gap: 16
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  snippetTitle: { color: colors.text.primary, fontSize: 16, fontWeight: '700' },
  snippetMeta: { color: colors.text.tertiary, fontSize: 12, marginTop: 4 },
  
  cardActions: { flexDirection: 'row', gap: 12 },
  actionBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 12, borderRadius: 12, gap: 8 },
  restoreBtn: { backgroundColor: colors.accent.primary + '10', borderWidth: 1, borderColor: colors.accent.primary + '20' },
  restoreText: { color: colors.accent.primary, fontWeight: '600', fontSize: 14 },
  deleteBtn: { backgroundColor: colors.status.error + '10', borderWidth: 1, borderColor: colors.status.error + '20' },
  deleteText: { color: colors.status.error, fontWeight: '600', fontSize: 14 },
} as any);
