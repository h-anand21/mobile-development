// ============================================================
// DevNest — Snippet Card Component (Neon UI)
// ============================================================
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ViewStyle } from 'react-native';
import { SvgUri } from 'react-native-svg';
import { Star, MoreHorizontal } from 'lucide-react-native';
import { Snippet } from '@/types/snippet.types';
import { useThemeColors } from '@/theme/colors';
import { timeAgo } from '@/utils/formatters/dateFormatter';
import { LANGUAGES } from '@/constants/languages';
import { useRouter } from 'expo-router';
import { useSnippetStore } from '@/store/snippetStore';
import { Alert } from 'react-native';
import * as Haptics from 'expo-haptics';
import Toast from 'react-native-toast-message';

interface SnippetCardProps {
  snippet: Snippet;
  onPress: () => void;
  style?: ViewStyle;
}

export function SnippetCard({ snippet, onPress, style }: SnippetCardProps) {
  const colors = useThemeColors();
  const styles = getStyles(colors);
  
  const LANGUAGE_LOGOS: Record<string, string> = {
    'JavaScript': 'javascript/javascript-original.svg',
    'TypeScript': 'typescript/typescript-original.svg',
    'React': 'react/react-original.svg',
    'Python': 'python/python-original.svg',
    'Java': 'java/java-original.svg',
    'C++': 'cplusplus/cplusplus-original.svg',
    'HTML': 'html5/html5-original.svg',
    'CSS': 'css3/css3-original.svg',
    'Go': 'go/go-original.svg',
  };

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
          <View style={[styles.langBadge, { backgroundColor: colors.bg.secondary, borderWidth: 1, borderColor: colors.border.primary, padding: 4 }]}>
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
    backgroundColor: colors.bg.tertiary,
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
} as any);
