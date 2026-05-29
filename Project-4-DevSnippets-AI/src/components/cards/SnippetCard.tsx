// ============================================================
// DevNest — Snippet Card Component (Neon UI)
// ============================================================
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ViewStyle } from 'react-native';
import { SvgUri } from 'react-native-svg';
import { Star, MoreHorizontal, Eye } from 'lucide-react-native';
import { CodeHighlighter } from '@/components/common/CodeHighlighter';
import { Snippet } from '@/types/snippet.types';
import { useThemeColors } from '@/theme/colors';
import { timeAgo } from '@/utils/formatters/dateFormatter';
import { LANGUAGES, LANGUAGE_LOGOS } from '@/constants/languages';
import { useRouter } from 'expo-router';
import { useSnippetStore } from '@/store/snippetStore';
import { Alert } from 'react-native';
import * as Haptics from 'expo-haptics';
import Toast from 'react-native-toast-message';

interface SnippetCardProps {
  snippet: Snippet;
  onPress: () => void;
  style?: ViewStyle;
  showPreview?: boolean;
}

export function SnippetCard({ snippet, showPreview = false, onPress, style }: SnippetCardProps) {
  const colors = useThemeColors();
  const styles = getStyles(colors);
  
  const languageConfig = LANGUAGES.find(l => l.label === snippet.language) || LANGUAGES[0];
  const logoPath = LANGUAGE_LOGOS[snippet.language] || LANGUAGE_LOGOS[languageConfig.label];
  const logoUrl = logoPath ? `https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/${logoPath}` : null;
  const router = useRouter();
  const { toggleFavorite, deleteSnippet } = useSnippetStore();

  const handleFavoriteToggle = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    toggleFavorite(snippet.id);
  };

  const handleMorePress = () => {
    Alert.alert(
      'Snippet Options',
      snippet.title,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Edit', onPress: () => router.push(`/snippet/edit/${snippet.id}`) },
        { text: 'Delete', style: 'destructive', onPress: () => {
          deleteSnippet(snippet.id);
          Toast.show({ type: 'success', text1: 'Snippet deleted' });
        }},
      ]
    );
  };

  return (
    <TouchableOpacity
      style={[styles.card, style]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.contentRow}>
        {/* Language Square Badge */}
        {logoUrl ? (
          <View style={[styles.langBadge, { backgroundColor: colors.bg.secondary, borderWidth: 1, borderColor: colors.border.primary, overflow: 'hidden' }]}>
            <SvgUri uri={logoUrl} width="100%" height="100%" />
          </View>
        ) : (
          <View style={[styles.langBadge, { backgroundColor: languageConfig.color }]}>
            <Text style={[styles.langBadgeText, { color: languageConfig.textColor }]}>
              {languageConfig.shortLabel}
            </Text>
          </View>
        )}

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
          <TouchableOpacity 
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            onPress={handleFavoriteToggle}
          >
            <Star 
              size={20} 
              color={snippet.isFavorite ? colors.status.warning : colors.text.tertiary} 
              fill={snippet.isFavorite ? colors.status.warning : 'transparent'} 
            />
          </TouchableOpacity>
          <TouchableOpacity 
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }} 
            style={styles.moreBtn}
            onPress={handleMorePress}
          >
            <MoreHorizontal size={20} color={colors.text.tertiary} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Optional Code Preview */}
      {showPreview && snippet.content && (
        <View style={styles.previewContainer}>
          <View style={styles.previewCodeWrap}>
            <CodeHighlighter code={snippet.content.split('\n').slice(0, 6).join('\n') + (snippet.content.split('\n').length > 6 ? '\n...' : '')} language={snippet.language} />
          </View>
          <TouchableOpacity style={styles.previewBtn} onPress={onPress}>
            <Eye size={14} color={colors.text.secondary} />
            <Text style={styles.previewBtnText}>Preview</Text>
          </TouchableOpacity>
        </View>
      )}
    </TouchableOpacity>
  );
}

const getStyles = (colors: any) => ({
  card: {
    backgroundColor: colors.bg.secondary,
    borderRadius: 20,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border.primary,
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
    color: colors.text.primary,
    marginBottom: 6,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaText: {
    fontSize: 12,
    color: colors.text.secondary,
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
    backgroundColor: 'transparent',
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  previewContainer: {
    marginTop: 16,
    backgroundColor: colors.bg.primary === '#000000' ? '#111' : colors.bg.tertiary, // adapts to light/dark
    borderRadius: 12,
    padding: 12,
    position: 'relative',
    overflow: 'hidden',
  },
  previewCodeWrap: {
    opacity: 0.9,
  },
  previewBtn: {
    position: 'absolute',
    bottom: 12,
    right: 12,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.bg.primary === '#000000' ? colors.bg.elevated : colors.bg.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    gap: 6,
    borderWidth: 1,
    borderColor: colors.border.secondary,
  },
  previewBtnText: {
    color: colors.text.secondary,
    fontSize: 12,
    fontWeight: '600',
  }
} as any);
