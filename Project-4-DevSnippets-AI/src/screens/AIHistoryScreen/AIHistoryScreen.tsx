// ============================================================
// DevNest — AI History Screen
// ============================================================
import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ArrowLeft, Sparkles, Filter, Code2, Zap, Shuffle, Database, Bug, Star } from 'lucide-react-native';

import { Colors } from '@/theme/colors';

const FILTERS = ['All', 'Explain', 'Optimize', 'Generate'];

const MOCK_HISTORY = [
  { id: '1', action: 'Explain', title: 'React useEffect Hook', preview: 'The useEffect hook allows you to perform side effects...', date: '2 hours ago', icon: Code2, color: Colors.status.info },
  { id: '2', action: 'Optimize', title: 'Nested Loops Refactor', preview: 'By using a Map, we reduced the time complexity from O(n^2) to...', date: 'Yesterday', icon: Zap, color: Colors.accent.primary },
  { id: '3', action: 'Generate', title: 'Axios Interceptor', preview: 'Here is the boilerplate for setting up an Axios interceptor...', date: '2 days ago', icon: Shuffle, color: Colors.status.warning },
  { id: '4', action: 'SQL', title: 'Join Query Fix', preview: 'You missed the ON clause in your LEFT JOIN. Here is the fixed...', date: '1 week ago', icon: Database, color: Colors.text.secondary },
  { id: '5', action: 'Debug', title: 'Undefined Error', preview: 'The variable data is undefined before the API returns. Add optional...', date: '2 weeks ago', icon: Bug, color: Colors.status.error },
];

export function AIHistoryScreen() {
  const router = useRouter();
  const [activeFilter, setActiveFilter] = useState('All');

  const filteredHistory = MOCK_HISTORY.filter(h => 
    activeFilter === 'All' || h.action === activeFilter
  );

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <ArrowLeft size={24} color={Colors.text.primary} />
          </TouchableOpacity>
          <View style={styles.headerTitleWrap}>
            <Text style={styles.headerTitle}>AI <Text style={styles.green}>History</Text></Text>
            <Sparkles size={16} color={Colors.accent.primary} style={{ marginLeft: 6, marginTop: 4 }} />
          </View>
        </View>
        <TouchableOpacity style={styles.filterBtn}>
          <Filter size={20} color={Colors.text.primary} />
        </TouchableOpacity>
      </View>

      <Text style={styles.headerSubtitle}>Review your past AI conversations and code generations.</Text>

      {/* Filter Chips */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScroll}>
        {FILTERS.map(filter => (
          <TouchableOpacity 
            key={filter}
            style={[styles.filterChip, activeFilter === filter && styles.filterChipActive]}
            onPress={() => setActiveFilter(filter)}
          >
            <Text style={[styles.filterText, activeFilter === filter && styles.filterTextActive]}>
              {filter}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* History List */}
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.listContent}>
        {filteredHistory.length === 0 ? (
          <View style={styles.emptyWrap}>
            <Text style={styles.emptyEmoji}>🤖</Text>
            <Text style={styles.emptyText}>No AI history found</Text>
            <Text style={styles.emptySubText}>Try asking AI to explain or optimize your code.</Text>
          </View>
        ) : (
          filteredHistory.map((item) => {
            const Icon = item.icon;
            return (
              <TouchableOpacity key={item.id} style={styles.historyCard}>
                <View style={[styles.iconWrap, { backgroundColor: item.color + '15' }]}>
                  <Icon size={20} color={item.color} />
                </View>
                <View style={styles.textWrap}>
                  <Text style={styles.historyTitle}>{item.title}</Text>
                  <Text style={styles.historyPreview} numberOfLines={1}>{item.preview}</Text>
                  <Text style={styles.historyDate}>{item.date}</Text>
                </View>
                <TouchableOpacity style={styles.starBtn}>
                  <Star size={20} color={Colors.text.tertiary} />
                </TouchableOpacity>
              </TouchableOpacity>
            );
          })
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
  filterBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: Colors.bg.secondary, alignItems: 'center', justifyContent: 'center' },
  
  headerSubtitle: { paddingHorizontal: 24, color: Colors.text.secondary, fontSize: 14, marginBottom: 20 },

  filterScroll: { paddingHorizontal: 24, gap: 12, paddingBottom: 16, maxHeight: 60, marginBottom: 8 },
  filterChip: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: Colors.bg.secondary, borderWidth: 1, borderColor: Colors.border.primary },
  filterChipActive: { backgroundColor: Colors.accent.primary, borderColor: Colors.accent.primary },
  filterText: { color: Colors.text.secondary, fontSize: 14, fontWeight: '600' },
  filterTextActive: { color: '#000' },

  listContent: { paddingHorizontal: 24, paddingBottom: 60 },

  historyCard: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.bg.secondary,
    padding: 16, borderRadius: 20, marginBottom: 12, borderWidth: 1, borderColor: Colors.border.primary,
  },
  iconWrap: { width: 48, height: 48, borderRadius: 16, alignItems: 'center', justifyContent: 'center', marginRight: 16 },
  textWrap: { flex: 1 },
  historyTitle: { color: Colors.text.primary, fontSize: 15, fontWeight: '700', marginBottom: 4 },
  historyPreview: { color: Colors.text.secondary, fontSize: 13, marginBottom: 6 },
  historyDate: { color: Colors.text.tertiary, fontSize: 11, fontWeight: '500' },
  starBtn: { padding: 8 },

  emptyWrap: { alignItems: 'center', justifyContent: 'center', marginTop: 40, padding: 40, backgroundColor: Colors.bg.secondary, borderRadius: 20 },
  emptyEmoji: { fontSize: 48, marginBottom: 16 },
  emptyText: { color: Colors.text.primary, fontSize: 18, fontWeight: '700', marginBottom: 8 },
  emptySubText: { color: Colors.text.secondary, fontSize: 14, textAlign: 'center' },
});
