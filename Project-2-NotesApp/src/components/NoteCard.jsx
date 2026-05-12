import React, { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function NoteCard({ note, theme, isTablet, onPress }) {
  const styles = useMemo(
    () =>
      StyleSheet.create({
        card: {
          flex: 1,
          borderWidth: 1,
          borderRadius: 22,
          padding: 16,
          marginBottom: 14,
          backgroundColor: theme.card,
          borderColor: theme.border,
          minHeight: isTablet ? 164 : 150,
        },
        cardPressed: {
          transform: [{ scale: 0.985 }],
          opacity: 0.96,
        },
        row: {
          flexDirection: 'row',
          alignItems: 'flex-start',
          gap: 12,
        },
        iconBox: {
          width: 42,
          height: 42,
          borderRadius: 14,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: theme.accent,
        },
        content: {
          flex: 1,
        },
        title: {
          fontSize: isTablet ? 18 : 16,
          fontWeight: '700',
          color: theme.text,
          marginBottom: 6,
        },
        preview: {
          fontSize: 14,
          lineHeight: 20,
          color: theme.mutedText,
          marginBottom: 12,
        },
        footer: {
          marginTop: 'auto',
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
        },
        date: {
          fontSize: 12,
          color: theme.accent,
          fontWeight: '600',
        },
        tag: {
          fontSize: 12,
          color: theme.mutedText,
        },
      }),
    [theme, isTablet],
  );

  const preview =
    note.content.length > 95
      ? `${note.content.slice(0, 95).trim()}…`
      : note.content;

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) =>
        StyleSheet.compose(styles.card, pressed && styles.cardPressed)
      }
    >
      <View style={styles.row}>
        <View style={styles.iconBox}>
          <Ionicons
            name="document-text-outline"
            size={18}
            color={theme.primaryText}
          />
        </View>

        <View style={styles.content}>
          <Text style={styles.title} numberOfLines={1}>
            {note.title}
          </Text>
          <Text style={styles.preview} numberOfLines={2}>
            {preview}
          </Text>
          <View style={styles.footer}>
            <Text style={styles.date}>{note.date}</Text>
            <Text style={styles.tag}>Tap to open</Text>
          </View>
        </View>
      </View>
    </Pressable>
  );
}
