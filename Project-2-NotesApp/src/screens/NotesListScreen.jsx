import React, { useMemo, useState } from 'react';
import {
  FlatList,
  Image,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
  useWindowDimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import NoteCard from '../components/NoteCard';

export default function NotesListScreen({ 
  notes, 
  onCreateNew, 
  onDelete, 
  theme, 
  isDark, 
  setIsDark 
}) {
  const { width } = useWindowDimensions();
  const isTablet = width >= 768;
  const [query, setQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  });

  const styles = useMemo(
    () =>
      StyleSheet.create({
        screen: {
          flex: 1,
          backgroundColor: isDark ? '#121212' : '#F9F7F2',
        },
        header: {
          paddingHorizontal: 20,
          paddingTop: 10,
          paddingBottom: 20,
        },
        topBar: {
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 24,
        },
        profileSection: {
          flexDirection: 'row',
          alignItems: 'center',
          gap: 12,
        },
        avatar: {
          width: 48,
          height: 48,
          borderRadius: 24,
          borderWidth: 2,
          borderColor: theme.primary,
        },
        greeting: {
          fontSize: 16,
          fontWeight: '700',
          color: theme.text,
        },
        actionButtons: {
          flexDirection: 'row',
          alignItems: 'center',
          gap: 12,
        },
        iconCircle: {
          width: 44,
          height: 44,
          borderRadius: 22,
          backgroundColor: isDark ? '#252525' : '#FFFFFF',
          alignItems: 'center',
          justifyContent: 'center',
          elevation: 2,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.1,
          shadowRadius: 2,
        },
        titleSection: {
          marginBottom: 20,
        },
        mainTitle: {
          fontSize: 32,
          fontWeight: '900',
          color: theme.text,
        },
        dateSub: {
          fontSize: 14,
          color: theme.mutedText,
          marginTop: 4,
        },
        createCardContainer: {
          flexDirection: 'row',
          gap: 12,
          marginBottom: 24,
        },
        createCard: {
          flex: 1,
          height: 140,
          borderRadius: 24,
          padding: 16,
          justifyContent: 'flex-end',
          position: 'relative',
          overflow: 'hidden',
        },
        plusIconContainer: {
          position: 'absolute',
          top: 16,
          left: 16,
          width: 36,
          height: 36,
          borderRadius: 18,
          backgroundColor: 'rgba(255,255,255,0.3)',
          alignItems: 'center',
          justifyContent: 'center',
        },
        createLabel: {
          fontSize: 14,
          color: 'rgba(255,255,255,0.8)',
          fontWeight: '600',
        },
        createTitle: {
          fontSize: 22,
          color: '#FFFFFF',
          fontWeight: '900',
          marginTop: 2,
        },
        searchContainer: {
          marginBottom: 16,
        },
        searchBar: {
          flexDirection: 'row',
          alignItems: 'center',
          gap: 10,
          paddingHorizontal: 16,
          height: 54,
          borderRadius: 18,
          backgroundColor: isDark ? '#252525' : '#FFFFFF',
          borderWidth: 1,
          borderColor: theme.border,
        },
        searchInput: {
          flex: 1,
          color: theme.text,
          fontSize: 16,
        },
        listContent: {
          paddingHorizontal: 14,
          paddingBottom: 40,
        },
        columnWrapper: {
          gap: 12,
        },
      }),
    [theme, isDark, isTablet]
  );

  const filteredNotes = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return notes;
    return notes.filter(
      (note) =>
        note.title.toLowerCase().includes(q) ||
        note.content.toLowerCase().includes(q),
    );
  }, [query, notes]);

  return (
    <View style={styles.screen}>
      <View style={styles.header}>
        {/* Top Bar */}
        <View style={styles.topBar}>
          <View style={styles.profileSection}>
            <Image 
              source={{ uri: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?q=80&w=200&auto=format&fit=crop' }} 
              style={styles.avatar} 
            />
            <Text style={styles.greeting}>Hi, H.Anand 👋</Text>
          </View>

          <View style={styles.actionButtons}>
            <Pressable 
              onPress={() => setIsSearching(!isSearching)}
              style={styles.iconCircle}
            >
              <Ionicons name="search" size={20} color={theme.text} />
            </Pressable>
            
            <Pressable 
              onPress={() => setIsDark(!isDark)}
              style={styles.iconCircle}
            >
              <Ionicons 
                name={isDark ? "sunny" : "moon"} 
                size={22} 
                color={isDark ? "#FFD700" : "#7C3AED"} 
              />
            </Pressable>
          </View>
        </View>

        {/* Title Section */}
        <View style={styles.titleSection}>
          <Text style={styles.mainTitle}>My Notes</Text>
          <Text style={styles.dateSub}>Today {today}</Text>
        </View>

        {/* Search Bar (Conditional) */}
        {isSearching && (
          <View style={styles.searchContainer}>
            <View style={styles.searchBar}>
              <Ionicons name="search-outline" size={20} color={theme.mutedText} />
              <TextInput
                value={query}
                onChangeText={setQuery}
                placeholder="Search notes..."
                placeholderTextColor={theme.placeholder}
                style={styles.searchInput}
                autoFocus
              />
            </View>
          </View>
        )}

        {/* Create Cards */}
        <View style={styles.createCardContainer}>
          <Pressable 
            onPress={onCreateNew}
            style={[styles.createCard, { backgroundColor: '#FF8C00' }]} // Orange
          >
            <View style={styles.plusIconContainer}>
              <Ionicons name="add" size={24} color="#FFFFFF" />
            </View>
            <Text style={styles.createLabel}>Create</Text>
            <Text style={styles.createTitle}>New Note</Text>
          </Pressable>

          <View style={[styles.createCard, { backgroundColor: '#FFD700' }]}> // Yellow
            <View style={styles.plusIconContainer}>
              <Ionicons name="calendar-outline" size={22} color="#FFFFFF" />
            </View>
            <Text style={styles.createLabel}>Create</Text>
            <Text style={styles.createTitle}>New Task</Text>
          </View>
        </View>
      </View>

      <FlatList
        data={filteredNotes}
        keyExtractor={(item) => item.id}
        renderItem={({ item, index }) => (
          <NoteCard
            note={item}
            index={index}
            onPress={() => console.log('Pressed note:', item.title)}
            onDelete={() => onDelete(item.id)}
          />
        )}
        numColumns={2}
        key="grid"
        contentContainerStyle={styles.listContent}
        columnWrapperStyle={styles.columnWrapper}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}
