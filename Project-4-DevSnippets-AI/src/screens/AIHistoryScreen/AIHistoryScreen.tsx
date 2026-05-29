import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ArrowLeft, Sparkles, Filter, Code2, Zap, Shuffle, Database, Bug, Star } from 'lucide-react-native';

import { useThemeColors } from '@/theme/colors';
import { useAIStore } from '@/store/aiStore';
import { timeAgo } from '@/utils/formatters/dateFormatter';

const FILTERS = ['All', 'Explain', 'Optimize', 'Generate'];

export function AIHistoryScreen() {
  const router = useRouter();
  const colors = useThemeColors();
  const styles = getStyles(colors);
  const { history, loadHistory, toggleSaved } = useAIStore();
  const [activeFilter, setActiveFilter] = useState('All');
  const [selectedItem, setSelectedItem] = useState<any>(null);

  useEffect(() => {
    loadHistory();
  }, []);

  const filteredHistory = history.filter(h => 
    activeFilter === 'All' || h.actionType.toLowerCase() === activeFilter.toLowerCase()
  );

  const getIconForAction = (actionType: string) => {
    switch (actionType.toLowerCase()) {
      case 'explain': return { icon: Code2, color: colors.status.info };
      case 'optimize': return { icon: Zap, color: colors.accent.primary };
      case 'generate': return { icon: Shuffle, color: colors.status.warning };
      case 'debug': return { icon: Bug, color: colors.status.error };
      case 'refactor': return { icon: Shuffle, color: colors.accent.secondary || colors.status.info };
      default: return { icon: Code2, color: colors.text.secondary };
    }
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
            <Text style={styles.headerTitle}>AI <Text style={styles.green}>History</Text></Text>
            <Sparkles size={16} color={colors.accent.primary} style={{ marginLeft: 6, marginTop: 4 }} />
          </View>
        </View>
        <TouchableOpacity style={styles.filterBtn}>
          <Filter size={20} color={colors.text.primary} />
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
          <View style={[styles.emptyWrap, { paddingHorizontal: 20 }]}>
            <View style={{ width: 80, height: 80, borderRadius: 40, backgroundColor: colors.accent.primary + '20', alignItems: 'center', justifyContent: 'center', marginBottom: 24 }}>
              <Text style={{ fontSize: 40 }}>✨</Text>
            </View>
            <Text style={styles.emptyText}>Welcome to DevNest AI</Text>
            <Text style={styles.emptySubText}>Your personal AI pair programmer. All your code explanations and optimizations will appear here.</Text>
            
            <View style={{ width: '100%', marginTop: 32, gap: 16 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                <View style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: colors.bg.tertiary, alignItems: 'center', justifyContent: 'center' }}><Text style={{ color: colors.text.secondary, fontWeight: 'bold' }}>1</Text></View>
                <Text style={{ color: colors.text.primary, fontSize: 14, flex: 1 }}>Go to any saved snippet in your library.</Text>
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                <View style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: colors.bg.tertiary, alignItems: 'center', justifyContent: 'center' }}><Text style={{ color: colors.text.secondary, fontWeight: 'bold' }}>2</Text></View>
                <Text style={{ color: colors.text.primary, fontSize: 14, flex: 1 }}>Tap the <Text style={{ color: colors.accent.primary, fontWeight: 'bold' }}>History</Text> tab at the top.</Text>
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                <View style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: colors.bg.tertiary, alignItems: 'center', justifyContent: 'center' }}><Text style={{ color: colors.text.secondary, fontWeight: 'bold' }}>3</Text></View>
                <Text style={{ color: colors.text.primary, fontSize: 14, flex: 1 }}>Choose an <Text style={{ color: colors.accent.primary, fontWeight: 'bold' }}>AI Quick Action</Text> to see the magic!</Text>
              </View>
            </View>
            
            <TouchableOpacity 
              style={{ marginTop: 40, backgroundColor: colors.bg.tertiary, paddingHorizontal: 24, paddingVertical: 14, borderRadius: 20, width: '100%', alignItems: 'center', borderWidth: 1, borderColor: colors.border.primary }}
              onPress={() => router.push('/settings')}
            >
              <Text style={{ color: colors.text.primary, fontWeight: 'bold' }}>⚙️ Check API Key Settings</Text>
            </TouchableOpacity>
          </View>
        ) : (
          filteredHistory.map((item) => {
            const { icon: Icon, color } = getIconForAction(item.actionType);
            return (
              <TouchableOpacity key={item.id} style={styles.historyCard} onPress={() => setSelectedItem(item)}>
                <View style={[styles.iconWrap, { backgroundColor: color + '15' }]}>
                  <Icon size={20} color={color} />
                </View>
                <View style={styles.textWrap}>
                  <Text style={styles.historyTitle}>{item.snippetTitle || item.actionType.toUpperCase()}</Text>
                  <Text style={styles.historyPreview} numberOfLines={1}>{item.response}</Text>
                  <Text style={styles.historyDate}>{timeAgo(item.createdAt)}</Text>
                </View>
                <TouchableOpacity style={styles.starBtn} onPress={() => toggleSaved(item.id)}>
                  <Star size={20} color={item.isSaved ? colors.status.warning : colors.text.tertiary} fill={item.isSaved ? colors.status.warning : 'transparent'} />
                </TouchableOpacity>
              </TouchableOpacity>
            );
          })
        )}
      </ScrollView>

      {/* Detail Modal */}
      <Modal visible={!!selectedItem} animationType="slide" transparent={true}>
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' }}>
          <View style={{ backgroundColor: colors.bg.primary, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, maxHeight: '80%' }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <Text style={{ color: colors.text.primary, fontSize: 18, fontWeight: 'bold' }}>
                {selectedItem?.actionType.toUpperCase()}
              </Text>
              <TouchableOpacity onPress={() => setSelectedItem(null)} style={{ padding: 8, backgroundColor: colors.bg.secondary, borderRadius: 20 }}>
                <Text style={{ color: colors.text.primary, fontWeight: 'bold' }}>✕</Text>
              </TouchableOpacity>
            </View>
            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={{ color: colors.text.secondary, fontSize: 14, marginBottom: 8 }}>Prompt:</Text>
              <View style={{ backgroundColor: colors.bg.secondary, padding: 12, borderRadius: 12, marginBottom: 16 }}>
                 <Text style={{ color: colors.text.primary, fontSize: 13 }}>{selectedItem?.prompt}</Text>
              </View>
              <Text style={{ color: colors.text.secondary, fontSize: 14, marginBottom: 8 }}>AI Response:</Text>
              <Text style={{ color: colors.text.primary, fontSize: 15, lineHeight: 24, marginBottom: 40 }}>
                {selectedItem?.response}
              </Text>
            </ScrollView>
          </View>
        </View>
      </Modal>

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
  filterBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.bg.secondary, alignItems: 'center', justifyContent: 'center' },
  
  headerSubtitle: { paddingHorizontal: 24, color: colors.text.secondary, fontSize: 14, marginBottom: 20 },

  filterScroll: { paddingHorizontal: 24, gap: 12, paddingBottom: 16, maxHeight: 60, marginBottom: 8 },
  filterChip: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: colors.bg.secondary, borderWidth: 1, borderColor: colors.border.primary },
  filterChipActive: { backgroundColor: colors.accent.primary, borderColor: colors.accent.primary },
  filterText: { color: colors.text.secondary, fontSize: 14, fontWeight: '600' },
  filterTextActive: { color: '#000' },

  listContent: { paddingHorizontal: 24, paddingBottom: 60 },

  historyCard: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: colors.bg.secondary,
    padding: 16, borderRadius: 20, marginBottom: 12, borderWidth: 1, borderColor: colors.border.primary,
  },
  iconWrap: { width: 48, height: 48, borderRadius: 16, alignItems: 'center', justifyContent: 'center', marginRight: 16 },
  textWrap: { flex: 1 },
  historyTitle: { color: colors.text.primary, fontSize: 15, fontWeight: '700', marginBottom: 4 },
  historyPreview: { color: colors.text.secondary, fontSize: 13, marginBottom: 6 },
  historyDate: { color: colors.text.tertiary, fontSize: 11, fontWeight: '500' },
  starBtn: { padding: 8 },

  emptyWrap: { alignItems: 'center', justifyContent: 'center', marginTop: 40, padding: 40, backgroundColor: colors.bg.secondary, borderRadius: 20 },
  emptyEmoji: { fontSize: 48, marginBottom: 16 },
  emptyText: { color: colors.text.primary, fontSize: 18, fontWeight: '700', marginBottom: 8 },
  emptySubText: { color: colors.text.secondary, fontSize: 14, textAlign: 'center' },
} as any);
