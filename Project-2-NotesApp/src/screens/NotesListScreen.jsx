import React, { useMemo, useState } from 'react';
import {
  FlatList,
  Pressable,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
  useWindowDimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import useAppTheme from '../hooks/useAppTheme';
import { NOTES } from '../constants/notes';
import NoteCard from '../components/NoteCard';

export default function NotesListScreen({ onCreateNew }) {
  const { theme, isDark, setIsDark } = useAppTheme();
  const { width } = useWindowDimensions();
  const isTablet = width >= 768;
  const [query, setQuery] = useState('');

  const styles = useMemo(
    () =>
      StyleSheet.create({
        screen: {
          flex: 1,
          backgroundColor: theme.background,
        },
        header: {
          paddingHorizontal: isTablet ? 24 : 16,
          paddingTop: 16,
          paddingBottom: 12,
          gap: 14,
        },
        topRow: {
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 12,
        },
        titleGroup: {
          flex: 1,
        },
        kicker: {
          fontSize: 12,
          fontWeight: '700',
          letterSpacing: 2,
          color: theme.accent,
          marginBottom: 4,
        },
        heading: {
          fontSize: isTablet ? 30 : 26,
          fontWeight: '800',
          color: theme.text,
        },
        subtitle: {
          fontSize: 14,
          lineHeight: 20,
          color: theme.mutedText,
        },
        newButton: {
          flexDirection: 'row',
          alignItems: 'center',
          gap: 8,
          paddingHorizontal: 14,
          paddingVertical: 10,
          borderRadius: 16,
          backgroundColor: theme.primary,
        },
        newButtonText: {
          color: theme.primaryText,
          fontWeight: '700',
          fontSize: 13,
        },
        switchRow: {
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingHorizontal: 14,
          paddingVertical: 12,
          borderWidth: 1,
          borderColor: theme.border,
          borderRadius: 18,
          backgroundColor: theme.surface,
        },
        switchLabel: {
          fontSize: 14,
          fontWeight: '600',
          color: theme.text,
        },
        searchBar: {
          flexDirection: 'row',
          alignItems: 'center',
          gap: 10,
          paddingHorizontal: 14,
          height: 52,
          borderRadius: 18,
          borderWidth: 1,
          borderColor: theme.border,
          backgroundColor: theme.surface,
        },
        searchInput: {
          flex: 1,
          color: theme.text,
          fontSize: 15,
        },
        listContent: {
          paddingHorizontal: isTablet ? 24 : 16,
          paddingBottom: 24,
        },
        columnWrapper: {
          gap: 12,
        },
        emptyBox: {
          alignItems: 'center',
          justifyContent: 'center',
          paddingVertical: 40,
        },
        emptyTitle: {
          fontSize: 18,
          fontWeight: '700',
          color: theme.text,
          marginTop: 10,
          marginBottom: 6,
        },
        emptyText: {
          fontSize: 14,
          textAlign: 'center',
          color: theme.mutedText,
          maxWidth: 260,
        },
      }),
    [theme, isTablet],
  );

  const filteredNotes = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return NOTES;
    return NOTES.filter(
      (note) =>
        note.title.toLowerCase().includes(q) ||
        note.content.toLowerCase().includes(q),
    );
  }, [query]);

  return (
    <View style={styles.screen}>
      <View style={styles.header}>
        <View style={styles.topRow}>
          <View style={styles.titleGroup}>
            <Text style={styles.kicker}>NOTES</Text>
            <Text style={styles.heading}>My Notes</Text>
          </View>

          <Pressable
            onPress={onCreateNew}
            style={({ pressed }) =>
              StyleSheet.compose(styles.newButton, pressed && { opacity: 0.9 })
            }
          >
            <Ionicons name="add" size={18} color={theme.primaryText} />
            <Text style={styles.newButtonText}>New</Text>
          </Pressable>
        </View>

        <Text style={styles.subtitle}>
          Search, browse, and open notes from a clean mobile-friendly list.
        </Text>

        <View style={styles.switchRow}>
          <Text style={styles.switchLabel}>
            {isDark ? 'Dark mode' : 'Light mode'}
          </Text>
          <Switch
            value={isDark}
            onValueChange={setIsDark}
            thumbColor={isDark ? theme.primary : '#FFFFFF'}
            trackColor={{ false: '#CBD5E1', true: theme.primary }}
          />
        </View>

        <View style={styles.searchBar}>
          <Ionicons name="search" size={18} color={theme.mutedText} />
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Search notes"
            placeholderTextColor={theme.placeholder}
            style={styles.searchInput}
          />
        </View>
      </View>

      <FlatList
        data={filteredNotes}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <NoteCard
            note={item}
            theme={theme}
            isTablet={isTablet}
            onPress={() => console.log('Pressed note:', item.title)}
          />
        )}
        numColumns={isTablet ? 2 : 1}
        key={isTablet ? 'tablet' : 'phone'}
        contentContainerStyle={styles.listContent}
        columnWrapperStyle={isTablet ? styles.columnWrapper : undefined}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}
