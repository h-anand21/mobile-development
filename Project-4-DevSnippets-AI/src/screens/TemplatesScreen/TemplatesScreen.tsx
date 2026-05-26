// ============================================================
// DevNest — Templates Screen
// ============================================================
import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ArrowLeft, Sparkles, Search, ChevronRight } from 'lucide-react-native';

import { Colors } from '@/theme/colors';
import { getLanguageConfig } from '@/constants/languages';

const FILTERS = ['All', 'JavaScript', 'React', 'Node.js', 'SQL'];

const MOCK_TEMPLATES = [
  { id: '1', title: 'React Component', description: 'Functional component with props and StyleSheet', language: 'TypeScript', tag: 'React' },
  { id: '2', title: 'Custom React Hook', description: 'Basic structure for a reusable React hook', language: 'JavaScript', tag: 'React' },
  { id: '3', title: 'Express API Route', description: 'Router setup with async/await error handling', language: 'JavaScript', tag: 'Node.js' },
  { id: '4', title: 'SQL Select Query', description: 'Advanced SELECT with JOIN and GROUP BY', language: 'SQL', tag: 'SQL' },
  { id: '5', title: 'Fetch API Wrapper', description: 'Generic fetch function with TypeScript generics', language: 'TypeScript', tag: 'JavaScript' },
];

export function TemplatesScreen() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('All');

  const filteredTemplates = MOCK_TEMPLATES.filter(t => {
    const matchesFilter = activeFilter === 'All' || t.tag === activeFilter || t.language === activeFilter;
    const matchesSearch = t.title.toLowerCase().includes(searchQuery.toLowerCase()) || t.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <ArrowLeft size={24} color={Colors.text.primary} />
          </TouchableOpacity>
          <View style={styles.headerTitleWrap}>
            <Text style={styles.headerTitle}>Temp<Text style={styles.green}>lates</Text></Text>
            <Sparkles size={16} color={Colors.accent.primary} style={{ marginLeft: 6, marginTop: 4 }} />
          </View>
        </View>
      </View>

      <Text style={styles.headerSubtitle}>Start faster with pre-built boilerplate code.</Text>

      {/* Search Input */}
      <View style={styles.searchWrap}>
        <View style={styles.searchBar}>
          <Search size={20} color={Colors.text.tertiary} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search templates..."
            placeholderTextColor={Colors.text.tertiary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')} style={styles.clearBtn}>
              <Text style={styles.clearBtnText}>×</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

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

      {/* Templates List */}
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.listContent}>
        {filteredTemplates.length === 0 ? (
          <View style={styles.emptyWrap}>
            <Text style={styles.emptyEmoji}>🧩</Text>
            <Text style={styles.emptyText}>No templates found</Text>
            <Text style={styles.emptySubText}>Try adjusting your search or filters.</Text>
          </View>
        ) : (
          filteredTemplates.map((template) => {
            const langConfig = getLanguageConfig(template.language);
            return (
              <TouchableOpacity key={template.id} style={styles.templateCard} onPress={() => router.push('/snippet/create')}>
                <View style={[styles.langBadge, { backgroundColor: langConfig.color }]}>
                  <Text style={[styles.langBadgeText, { color: langConfig.textColor }]}>{langConfig.shortLabel}</Text>
                </View>
                <View style={styles.textWrap}>
                  <Text style={styles.templateTitle}>{template.title}</Text>
                  <Text style={styles.templateDesc} numberOfLines={2}>{template.description}</Text>
                </View>
                <ChevronRight size={20} color={Colors.text.tertiary} />
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
  
  headerSubtitle: { paddingHorizontal: 24, color: Colors.text.secondary, fontSize: 14, marginBottom: 20 },

  searchWrap: { paddingHorizontal: 24, marginBottom: 16 },
  searchBar: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.bg.secondary,
    borderWidth: 1, borderColor: Colors.border.primary, borderRadius: 16,
    height: 50, paddingLeft: 16, paddingRight: 8,
  },
  searchInput: { flex: 1, color: Colors.text.primary, fontSize: 15, marginLeft: 12 },
  clearBtn: { width: 20, height: 20, borderRadius: 10, backgroundColor: Colors.bg.tertiary, alignItems: 'center', justifyContent: 'center', marginRight: 8 },
  clearBtnText: { color: Colors.text.secondary, fontSize: 12, fontWeight: 'bold', marginTop: -2 },

  filterScroll: { paddingHorizontal: 24, gap: 12, paddingBottom: 16, maxHeight: 60, marginBottom: 8 },
  filterChip: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: Colors.bg.secondary, borderWidth: 1, borderColor: Colors.border.primary },
  filterChipActive: { backgroundColor: Colors.accent.primary, borderColor: Colors.accent.primary },
  filterText: { color: Colors.text.secondary, fontSize: 14, fontWeight: '600' },
  filterTextActive: { color: '#000' },

  listContent: { paddingHorizontal: 24, paddingBottom: 60 },

  templateCard: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.bg.secondary,
    padding: 16, borderRadius: 20, marginBottom: 12, borderWidth: 1, borderColor: Colors.border.primary,
  },
  langBadge: { width: 48, height: 48, borderRadius: 14, alignItems: 'center', justifyContent: 'center', marginRight: 16 },
  langBadgeText: { fontSize: 16, fontWeight: '800' },
  textWrap: { flex: 1, paddingRight: 12 },
  templateTitle: { color: Colors.text.primary, fontSize: 15, fontWeight: '700', marginBottom: 4 },
  templateDesc: { color: Colors.text.secondary, fontSize: 13, lineHeight: 18 },

  emptyWrap: { alignItems: 'center', justifyContent: 'center', marginTop: 40, padding: 40, backgroundColor: Colors.bg.secondary, borderRadius: 20 },
  emptyEmoji: { fontSize: 48, marginBottom: 16 },
  emptyText: { color: Colors.text.primary, fontSize: 18, fontWeight: '700', marginBottom: 8 },
  emptySubText: { color: Colors.text.secondary, fontSize: 14, textAlign: 'center' },
});
