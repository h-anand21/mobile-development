import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Search, SlidersHorizontal, ArrowLeft, Bookmark, MoreVertical, Folder } from 'lucide-react-native';
import { Colors } from '@/theme/colors';

const FILTERS = ['All', 'Snippets', 'Folders', 'Tags', 'Templates', 'Users'];

export default function SearchScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('All');

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>
        
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backBtn}>
            <ArrowLeft size={24} color={Colors.text.primary} />
          </TouchableOpacity>
          <View style={styles.headerTitleWrap}>
            <Text style={styles.headerTitle}>Search</Text>
            <View style={styles.headerDot} />
          </View>
          <Text style={styles.headerSubtitle}>Find snippets, folders, tags and more</Text>
          {/* Dinosaur Illustration Placeholder */}
          <View style={styles.illustrationPlaceholder} />
        </View>

        {/* Search Input */}
        <View style={styles.searchWrap}>
          <View style={styles.searchBar}>
            <Search size={20} color={Colors.text.tertiary} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search..."
              placeholderTextColor={Colors.text.tertiary}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')} style={styles.clearBtn}>
                <Text style={styles.clearBtnText}>×</Text>
              </TouchableOpacity>
            )}
            <View style={styles.filterIconWrap}>
              <SlidersHorizontal size={20} color={Colors.accent.primary} />
            </View>
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

        {/* Top Results */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Top Results</Text>
        </View>
        
        {/* Detailed Snippet Card */}
        <View style={styles.detailedCard}>
          <View style={styles.detailedCardTop}>
            <View style={[styles.langBadge, { backgroundColor: Colors.lang.default }]}>
              <Text style={[styles.langBadgeText, { color: '#000' }]}>{'</>'}</Text>
            </View>
            <View style={styles.detailedTextWrap}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <Text style={styles.detailedTitle}>React useState Hook</Text>
                <View style={styles.snippetTag}><Text style={styles.snippetTagText}>Snippet</Text></View>
              </View>
              <Text style={styles.detailedSubtitle}>A React Hook that adds state to functional components.</Text>
              <Text style={styles.detailedMeta}>JavaScript  •  2 days ago</Text>
            </View>
            <View style={{ flexDirection: 'row', gap: 12 }}>
              <Bookmark size={20} color={Colors.text.secondary} />
              <MoreVertical size={20} color={Colors.text.secondary} />
            </View>
          </View>
          
          <View style={styles.codePreview}>
            <Text style={styles.codeLine}><Text style={{ color: '#58A6FF' }}>import</Text> {'{ useState }'} <Text style={{ color: '#58A6FF' }}>from</Text> <Text style={{ color: '#A5D6FF' }}>'react'</Text>;</Text>
            <Text style={styles.codeLine}></Text>
            <Text style={styles.codeLine}><Text style={{ color: '#D2A8FF' }}>function</Text> <Text style={{ color: '#79C0FF' }}>Counter</Text>() {'{'}</Text>
            <Text style={styles.codeLine}>  <Text style={{ color: '#58A6FF' }}>const</Text> [count, setCount] = <Text style={{ color: '#79C0FF' }}>useState</Text>(0);</Text>
            <Text style={styles.codeLine}>  <Text style={{ color: '#D2A8FF' }}>return</Text> (</Text>
            <Text style={styles.codeLine}>    {'<button onClick={() => setCount(count + 1)}>'}</Text>
            
            <TouchableOpacity style={styles.previewBtn}>
              <Text style={styles.previewBtnText}>Preview</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Folders */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Folders</Text>
          <Text style={styles.seeAllText}>View all →</Text>
        </View>
        <View style={styles.folderCard}>
          <Folder size={24} color={Colors.accent.primary} fill={Colors.accent.primary} />
          <View style={{ flex: 1, marginLeft: 16 }}>
            <Text style={styles.folderTitle}>React Hooks</Text>
            <Text style={styles.folderMeta}>12 snippets  •  Updated 1 day ago</Text>
          </View>
          <Text style={{ color: Colors.text.secondary, fontSize: 18 }}>›</Text>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg.primary },
  header: { paddingHorizontal: 24, paddingTop: 16, position: 'relative' },
  backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: Colors.bg.secondary, alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  headerTitleWrap: { flexDirection: 'row', alignItems: 'baseline' },
  headerTitle: { fontSize: 36, fontWeight: '800', color: Colors.text.primary, letterSpacing: -1 },
  headerDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.accent.primary, marginLeft: 2 },
  headerSubtitle: { color: Colors.text.secondary, fontSize: 15, marginTop: 8, marginBottom: 24 },
  illustrationPlaceholder: { position: 'absolute', right: 24, top: 20, width: 100, height: 100 },

  searchWrap: { paddingHorizontal: 24, marginBottom: 20 },
  searchBar: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.bg.primary,
    borderWidth: 1, borderColor: Colors.accent.primary, borderRadius: 16,
    height: 56, paddingLeft: 16, paddingRight: 8,
    shadowColor: Colors.accent.primary, shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.2, shadowRadius: 10, elevation: 5,
  },
  searchInput: { flex: 1, color: Colors.text.primary, fontSize: 16, marginLeft: 12 },
  clearBtn: { width: 24, height: 24, borderRadius: 12, backgroundColor: Colors.bg.secondary, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  clearBtnText: { color: Colors.text.secondary, fontSize: 14, fontWeight: 'bold', marginTop: -2 },
  filterIconWrap: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },

  filterScroll: { paddingHorizontal: 24, gap: 12, marginBottom: 32 },
  filterChip: { paddingHorizontal: 20, paddingVertical: 10, borderRadius: 20, backgroundColor: Colors.bg.secondary, borderWidth: 1, borderColor: Colors.border.primary },
  filterChipActive: { backgroundColor: Colors.accent.primary, borderColor: Colors.accent.primary },
  filterText: { color: Colors.text.secondary, fontSize: 14, fontWeight: '600' },
  filterTextActive: { color: '#000' },

  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', paddingHorizontal: 24, marginBottom: 16 },
  sectionTitle: { color: Colors.text.primary, fontSize: 18, fontWeight: '700' },
  seeAllText: { color: Colors.accent.primary, fontSize: 14, fontWeight: '600' },

  detailedCard: { backgroundColor: Colors.bg.secondary, marginHorizontal: 24, borderRadius: 20, padding: 16, marginBottom: 32 },
  detailedCardTop: { flexDirection: 'row', marginBottom: 16 },
  langBadge: { width: 48, height: 48, borderRadius: 14, alignItems: 'center', justifyContent: 'center', marginRight: 16 },
  langBadgeText: { fontSize: 18, fontWeight: '800' },
  detailedTextWrap: { flex: 1 },
  detailedTitle: { color: Colors.text.primary, fontSize: 16, fontWeight: '700', marginBottom: 4 },
  snippetTag: { backgroundColor: 'rgba(204, 255, 0, 0.1)', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6 },
  snippetTagText: { color: Colors.accent.primary, fontSize: 10, fontWeight: '700' },
  detailedSubtitle: { color: Colors.text.secondary, fontSize: 13, marginBottom: 8, lineHeight: 18 },
  detailedMeta: { color: Colors.text.tertiary, fontSize: 12, fontWeight: '500' },
  
  codePreview: { backgroundColor: '#111', borderRadius: 12, padding: 16, position: 'relative' },
  codeLine: { color: Colors.text.secondary, fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace', fontSize: 13, lineHeight: 22 },
  previewBtn: { position: 'absolute', bottom: 16, right: 16, backgroundColor: 'rgba(255,255,255,0.1)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
  previewBtnText: { color: Colors.text.primary, fontSize: 12, fontWeight: '600' },

  folderCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.bg.secondary, marginHorizontal: 24, padding: 16, borderRadius: 16 },
  folderTitle: { color: Colors.text.primary, fontSize: 16, fontWeight: '600', marginBottom: 4 },
  folderMeta: { color: Colors.text.tertiary, fontSize: 13 },
});
