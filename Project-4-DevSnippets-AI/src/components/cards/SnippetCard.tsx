// ============================================================
// DevNest — Snippet Card Component (Neon UI)
// ============================================================
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ViewStyle } from 'react-native';
import { Star, MoreHorizontal } from 'lucide-react-native';
import { Snippet } from '@/types/snippet.types';
import { Colors } from '@/theme/colors';
import { timeAgo } from '@/utils/formatters/dateFormatter';
import { LANGUAGES } from '@/constants/languages';

interface SnippetCardProps {
  snippet: Snippet;
  onPress: () => void;
  style?: ViewStyle;
}

export function SnippetCard({ snippet, onPress, style }: SnippetCardProps) {
  const languageConfig = LANGUAGES.find(l => l.label === snippet.language) || LANGUAGES[0];

  return (
    <TouchableOpacity
      style={[styles.card, style]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.contentRow}>
        {/* Language Square Badge */}
        <View style={[styles.langBadge, { backgroundColor: languageConfig.color }]}>
          <Text style={[styles.langBadgeText, { color: languageConfig.textColor }]}>
            {languageConfig.shortLabel}
          </Text>
        </View>

        {/* Text Content */}
        <View style={styles.textWrap}>
          <Text style={styles.title} numberOfLines={1}>
            {snippet.title || 'Untitled Snippet'}
          </Text>
          <View style={styles.metaRow}>
            <Text style={styles.metaText}>{timeAgo(snippet.updatedAt)}</Text>
            <View style={[styles.metaDot, { backgroundColor: languageConfig.color }]} />
            <Text style={styles.metaText}>{languageConfig.label}</Text>
          </View>
        </View>

        {/* Actions */}
        <View style={styles.actionsWrap}>
          <TouchableOpacity hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <Star 
              size={20} 
              color={snippet.isFavorite ? Colors.status.warning : Colors.text.tertiary} 
              fill={snippet.isFavorite ? Colors.status.warning : 'transparent'} 
            />
          </TouchableOpacity>
          <TouchableOpacity hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }} style={styles.moreBtn}>
            <MoreHorizontal size={20} color={Colors.text.tertiary} />
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.bg.secondary,
    borderRadius: 20,
    padding: 16,
    marginBottom: 12,
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  langBadge: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  langBadgeText: {
    fontSize: 16,
    fontWeight: '800',
  },
  textWrap: {
    flex: 1,
    justifyContent: 'center',
  },
  title: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: 6,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaText: {
    fontSize: 12,
    color: Colors.text.secondary,
    fontWeight: '500',
  },
  metaDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    marginHorizontal: 6,
  },
  actionsWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 12,
  },
  moreBtn: {
    marginLeft: 16,
    backgroundColor: Colors.bg.tertiary,
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
