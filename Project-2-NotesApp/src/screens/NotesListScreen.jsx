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
import { LinearGradient } from 'expo-linear-gradient';
import NoteCard from '../components/NoteCard';

export default function NotesListScreen({ 
  notes, 
  onCreateNew, 
  onDelete, 
  theme, 
  isDark, 
  setIsDark,
  userProfile
}) {
  const { width } = useWindowDimensions();
  const isTablet = width >= 768;
  const [query, setQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  const greetingPrefix = useMemo(() => {
    const prefixes = ['Hello', 'Hi', 'Hey'];
    return prefixes[Math.floor(Math.random() * prefixes.length)];
  }, []);

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
          paddingBottom: 10,
        },
        topBar: {
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          height: 60,
          marginBottom: 10,
        },
        profileSection: {
          flexDirection: 'row',
          alignItems: 'center',
          gap: 12,
        },
        avatar: {
          width: 50,
          height: 50,
          borderRadius: 25,
          borderWidth: 2,
          borderColor: theme.primary,
        },
        greeting: {
          fontSize: 17,
          fontWeight: '700',
          color: theme.text,
        },
        actionButtons: {
          flexDirection: 'row',
          alignItems: 'center',
          gap: 12,
        },
        iconCircle: {
          width: 46,
          height: 46,
          borderRadius: 23,
          backgroundColor: isDark ? '#252525' : '#FFFFFF',
          alignItems: 'center',
          justifyContent: 'center',
          elevation: 3,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 3,
        },
        searchBarContainer: {
          flexDirection: 'row',
          alignItems: 'center',
          flex: 1,
          height: 56,
          borderRadius: 28,
          backgroundColor: isDark ? '#252525' : '#FFFFFF',
          paddingHorizontal: 12,
          gap: 10,
          elevation: 4,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
        },
        searchInput: {
          flex: 1,
          color: theme.text,
          fontSize: 16,
          fontWeight: '500',
        },
        closeButton: {
          padding: 4,
        },
        titleSection: {
          marginVertical: 15,
        },
        mainTitle: {
          fontSize: 34,
          fontWeight: '900',
          color: theme.text,
          letterSpacing: -0.5,
        },
        dateSub: {
          fontSize: 14,
          color: theme.mutedText,
          marginTop: 2,
        },
        createCard: {
          width: '100%',
          height: 150,
          borderRadius: 28,
          marginBottom: 24,
          overflow: 'hidden',
          elevation: 5,
          shadowColor: '#FF8C00',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.3,
          shadowRadius: 8,
        },
        gradient: {
          flex: 1,
          padding: 20,
          justifyContent: 'center',
        },
        plusIconContainer: {
          width: 44,
          height: 44,
          borderRadius: 22,
          backgroundColor: 'rgba(255,255,255,0.25)',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: 12,
        },
        createLabel: {
          fontSize: 15,
          color: 'rgba(255,255,255,0.9)',
          fontWeight: '600',
        },
        createTitle: {
          fontSize: 26,
          color: '#FFFFFF',
          fontWeight: '900',
        },
        listContent: {
          paddingHorizontal: 16,
          paddingBottom: 40,
        },
        columnWrapper: {
          gap: 16,
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

  const toggleSearch = () => {
    setIsSearching(!isSearching);
    if (isSearching) {
      setQuery('');
    }
  };

  return (
    <View style={styles.screen}>
      <View style={styles.header}>
        {/* Conditional Top Bar or Search Bar */}
        <View style={styles.topBar}>
          {!isSearching ? (
            <>
              <View style={styles.profileSection}>
                <Image 
                  source={{ uri: userProfile?.avatar || 'https://api.dicebear.com/7.x/avataaars/png?seed=Felix' }} 
                  style={styles.avatar} 
                />
                <Text style={styles.greeting}>{greetingPrefix}, {userProfile?.name || 'H.Anand'} 👋</Text>
              </View>

              <View style={styles.actionButtons}>
                <Pressable onPress={toggleSearch} style={styles.iconCircle}>
                  <Ionicons name="search" size={22} color={theme.text} />
                </Pressable>
                <Pressable onPress={() => setIsDark(!isDark)} style={styles.iconCircle}>
                  <Ionicons 
                    name={isDark ? "sunny" : "moon"} 
                    size={24} 
                    color={isDark ? "#FFD700" : "#7C3AED"} 
                  />
                </Pressable>
              </View>
            </>
          ) : (
            <View style={styles.searchBarContainer}>
              <Ionicons name="search-outline" size={20} color={theme.mutedText} />
              <TextInput
                value={query}
                onChangeText={setQuery}
                placeholder="Search notes..."
                placeholderTextColor={theme.placeholder}
                style={styles.searchInput}
                autoFocus
              />
              <Pressable onPress={toggleSearch} style={styles.closeButton}>
                <Ionicons name="close-circle" size={24} color={theme.mutedText} />
              </Pressable>
            </View>
          )}
        </View>

        {/* Title Section (Hide when searching to focus on results) */}
        {!isSearching && (
          <View style={styles.titleSection}>
            <Text style={styles.mainTitle}>My Notes</Text>
            <Text style={styles.dateSub}>Today {today}</Text>
          </View>
        )}

        {/* Create Card (Hide when searching) */}
        {!isSearching && (
          <Pressable onPress={onCreateNew} style={styles.createCard}>
            <LinearGradient
              colors={['#FF8C00', '#FFD700']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.gradient}
            >
              <View style={styles.plusIconContainer}>
                <Ionicons name="add" size={28} color="#FFFFFF" />
              </View>
              <View>
                <Text style={styles.createLabel}>Get productive</Text>
                <Text style={styles.createTitle}>Create New Note</Text>
              </View>
            </LinearGradient>
          </Pressable>
        )}
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
