// ============================================================
// DevNest — Templates Screen (Theme Aware & Boilerplates Filled)
// ============================================================
import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ArrowLeft, Sparkles, Search, ChevronRight } from 'lucide-react-native';

import { useThemeColors } from '@/theme/colors';
import { getLanguageConfig } from '@/constants/languages';
import { TEMPLATES } from '@/constants/templates';
import { useSettingsStore } from '@/store/settingsStore';



export function TemplatesScreen() {
  const router = useRouter();
  const colors = useThemeColors();
  const styles = getStyles(colors);
  
  const { enabledLanguages } = useSettingsStore();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('All');

  const filters = ['All', ...enabledLanguages];

  // Only show templates for enabled languages
  const availableTemplates = TEMPLATES.filter(t => enabledLanguages.includes(t.language));

  const filteredTemplates = availableTemplates.filter(t => {
    const matchesFilter = activeFilter === 'All' || t.tag === activeFilter || t.language === activeFilter;
    const matchesSearch = t.title.toLowerCase().includes(searchQuery.toLowerCase()) || t.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const handleSelectTemplate = (template: typeof TEMPLATES[0]) => {
    router.push({
      pathname: '/snippet/create',
      params: {
        title: template.title,
        content: template.content,
        language: template.language
      }
    });
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <ArrowLeft size={24} color={colors.text.primary} />
          </TouchableOpacity>
          <View style={styles.headerTitleWrap}>
            <Text style={styles.headerTitle}>Temp<Text style={styles.green}>lates</Text></Text>
            <Sparkles size={16} color={colors.accent.primary} style={{ marginLeft: 6, marginTop: 4 }} />
          </View>
        </View>
      </View>

      <Text style={styles.headerSubtitle}>Start faster with pre-built boilerplate code.</Text>

      {/* Search Input */}
      <View style={styles.searchWrap}>
        <View style={styles.searchBar}>
          <Search size={20} color={colors.text.tertiary} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search templates..."
            placeholderTextColor={colors.text.tertiary}
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
        {filters.map(filter => (
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
              <TouchableOpacity 
                key={template.id} 
                style={styles.templateCard} 
                onPress={() => handleSelectTemplate(template)}
              >
                <View style={[styles.langBadge, { backgroundColor: langConfig.color }]}>
                  <Text style={[styles.langBadgeText, { color: langConfig.textColor }]}>{langConfig.shortLabel}</Text>
                </View>
                <View style={styles.textWrap}>
                  <Text style={styles.templateTitle}>{template.title}</Text>
                  <Text style={styles.templateDesc} numberOfLines={2}>{template.description}</Text>
                </View>
                <ChevronRight size={20} color={colors.text.tertiary} />
              </TouchableOpacity>
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
    paddingHorizontal: 24, paddingTop: 16, marginBottom: 8,
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center' },
  backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.bg.secondary, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  headerTitleWrap: { flexDirection: 'row', alignItems: 'center' },
  headerTitle: { fontSize: 24, fontWeight: '800', color: colors.text.primary, letterSpacing: -0.5 },
  green: { color: colors.accent.primary },
  
  headerSubtitle: { paddingHorizontal: 24, color: colors.text.secondary, fontSize: 14, marginBottom: 20 },

  searchWrap: { paddingHorizontal: 24, marginBottom: 16 },
  searchBar: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: colors.bg.secondary,
    borderWidth: 1, borderColor: colors.border.primary, borderRadius: 16,
    height: 50, paddingLeft: 16, paddingRight: 8,
  },
  searchInput: { flex: 1, color: colors.text.primary, fontSize: 15, marginLeft: 12 },
  clearBtn: { width: 20, height: 20, borderRadius: 10, backgroundColor: colors.bg.tertiary, alignItems: 'center', justifyContent: 'center', marginRight: 8 },
  clearBtnText: { color: colors.text.secondary, fontSize: 12, fontWeight: 'bold', marginTop: -2 },

  filterScroll: { paddingHorizontal: 24, gap: 12, marginBottom: 16 },
  filterChip: { height: 40, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 16, borderRadius: 20, backgroundColor: colors.bg.secondary, borderWidth: 1, borderColor: colors.border.primary, marginRight: 8 },
  filterChipActive: { backgroundColor: colors.accent.primary, borderColor: colors.accent.primary },
  filterText: { color: colors.text.secondary, fontSize: 14, fontWeight: '600' },
  filterTextActive: { color: '#000' },

  listContent: { paddingHorizontal: 24, paddingBottom: 60 },

  templateCard: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: colors.bg.secondary,
    padding: 16, borderRadius: 20, marginBottom: 12, borderWidth: 1, borderColor: colors.border.primary,
  },
  langBadge: { width: 48, height: 48, borderRadius: 14, alignItems: 'center', justifyContent: 'center', marginRight: 16 },
  langBadgeText: { fontSize: 16, fontWeight: '800' },
  textWrap: { flex: 1, paddingRight: 12 },
  templateTitle: { color: colors.text.primary, fontSize: 15, fontWeight: '700', marginBottom: 4 },
  templateDesc: { color: colors.text.secondary, fontSize: 13, lineHeight: 18 },

  emptyWrap: { alignItems: 'center', justifyContent: 'center', marginTop: 40, padding: 40, backgroundColor: colors.bg.secondary, borderRadius: 20, borderWidth: 1, borderColor: colors.border.primary },
  emptyEmoji: { fontSize: 48, marginBottom: 16 },
  emptyText: { color: colors.text.primary, fontSize: 18, fontWeight: '700', marginBottom: 8 },
  emptySubText: { color: colors.text.secondary, fontSize: 14, textAlign: 'center' },
} as any);
