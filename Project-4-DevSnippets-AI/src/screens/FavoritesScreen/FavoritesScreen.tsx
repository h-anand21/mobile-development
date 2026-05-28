// ============================================================
// DevNest — Favorites Screen
// ============================================================
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ArrowLeft, Star, Search } from 'lucide-react-native';

import { Colors } from '@/theme/colors';
import { useSnippetStore } from '@/store/snippetStore';
import { SnippetCard } from '@/components/cards/SnippetCard';

export function FavoritesScreen() {
  const router = useRouter();
  const { snippets } = useSnippetStore();
  
  const favoriteSnippets = snippets.filter(s => s.isFavorite === 1 && !s.isDeleted);

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <ArrowLeft size={24} color={Colors.text.primary} />
          </TouchableOpacity>
          <View style={styles.headerTitleWrap}>
            <Text style={styles.headerTitle}>Favo<Text style={styles.green}>rites</Text></Text>
            <Star size={16} color={Colors.status.warning} fill={Colors.status.warning} style={{ marginLeft: 6, marginTop: 4 }} />
          </View>
        </View>
        
        <TouchableOpacity style={styles.searchBtn} onPress={() => router.push('/(tabs)/search')}>
          <Search size={20} color={Colors.text.primary} />
        </TouchableOpacity>
      </View>

      <Text style={styles.headerSubtitle}>Your most used and loved snippets.</Text>

      {/* Snippets List */}
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.listContent}>
        {favoriteSnippets.length === 0 ? (
          <View style={styles.emptyWrap}>
            <Text style={styles.emptyEmoji}>⭐</Text>
            <Text style={styles.emptyText}>No favorites yet</Text>
            <Text style={styles.emptySubText}>Tap the star icon on any snippet to save it here.</Text>
          </View>
        ) : (
          favoriteSnippets.map((snippet) => (
            <SnippetCard 
              key={snippet.id} 
              snippet={snippet} 
              onPress={() => router.push(`/snippet/${snippet.id}`)} 
            />
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg.primary },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 24, paddingTop: 16, marginBottom: 8,
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center' },
  backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: Colors.bg.secondary, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  headerTitleWrap: { flexDirection: 'row', alignItems: 'center' },
  headerTitle: { fontSize: 24, fontWeight: '800', color: Colors.text.primary, letterSpacing: -0.5 },
  green: { color: Colors.accent.primary },
  searchBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: Colors.bg.secondary, alignItems: 'center', justifyContent: 'center' },
  
  headerSubtitle: { paddingHorizontal: 24, color: Colors.text.secondary, fontSize: 14, marginBottom: 24 },

  listContent: { paddingHorizontal: 24, paddingBottom: 60, gap: 12 },

  emptyWrap: { alignItems: 'center', justifyContent: 'center', marginTop: 40, padding: 40, backgroundColor: Colors.bg.secondary, borderRadius: 20, borderWidth: 1, borderColor: Colors.border.primary },
  emptyEmoji: { fontSize: 48, marginBottom: 16 },
  emptyText: { color: Colors.text.primary, fontSize: 18, fontWeight: '700', marginBottom: 8 },
  emptySubText: { color: Colors.text.secondary, fontSize: 14, textAlign: 'center' },
});
