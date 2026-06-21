import React, { useMemo, useState, useEffect } from 'react';
import {
  FlatList,
  Image,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  useWindowDimensions,
  Alert,
  BackHandler,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Path, Text as SvgText } from 'react-native-svg';
import NoteCard from '../components/NoteCard';
let Audio = null;
try {
  Audio = require('expo-av').Audio;
} catch (error) {
  console.warn('Audio module not loaded:', error);
}

export default function NotesListScreen({ 
  notes, 
  onCreateNew, 
  onDelete, 
  theme, 
  isDark, 
  setIsDark,
  userProfile,
  onLogout
}) {
  const { width, height } = useWindowDimensions();
  const isTablet = width >= 768;
  const [query, setQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [selectedNote, setSelectedNote] = useState(null);

  // Audio Player Row Component (defined locally to access stylesheet and hooks easily)
  const AudioPlayerRow = ({ uri, duration }) => {
    const [sound, setSound] = useState(null);
    const [isPlaying, setIsPlaying] = useState(false);

    useEffect(() => {
      return sound
        ? () => {
            sound.unloadAsync();
          }
        : undefined;
    }, [sound]);

    const handlePlayPause = async () => {
      if (!Audio) {
        Alert.alert('Not Supported', 'Audio playback is not supported in this environment.');
        return;
      }
      if (sound === null) {
        const { sound: newSound } = await Audio.Sound.createAsync(
          { uri },
          { shouldPlay: true }
        );
        setSound(newSound);
        setIsPlaying(true);
        newSound.setOnPlaybackStatusUpdate((status) => {
          if (status.didJustFinish) {
            setIsPlaying(false);
            newSound.setPositionAsync(0);
          }
        });
      } else {
        if (isPlaying) {
          await sound.pauseAsync();
          setIsPlaying(false);
        } else {
          await sound.playAsync();
          setIsPlaying(true);
        }
      }
    };

    return (
      <View style={styles.audioRow}>
        <Pressable onPress={handlePlayPause} style={styles.audioPlayBtn}>
          <Ionicons name={isPlaying ? "pause" : "play"} size={16} color="#FFFFFF" />
        </Pressable>
        <Text style={styles.audioText}>Voice Memo ({duration}s)</Text>
      </View>
    );
  };

  // Handle Back Button to close Search or Modal
  useEffect(() => {
    const backAction = () => {
      if (selectedNote) {
        setSelectedNote(null);
        return true;
      }
      if (isSearching) {
        setIsSearching(false);
        setQuery('');
        return true;
      }
      return false; // Let parent App.jsx handle it (exit logic)
    };

    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      backAction
    );

    return () => backHandler.remove();
  }, [isSearching, selectedNote]);

  const handleProfilePress = () => {
    Alert.alert(
      "Profile Settings",
      "What would you like to do?",
      [
        {
          text: "Logout (Keep Notes)",
          onPress: () => onLogout(false),
          style: "default"
        },
        {
          text: "Clear All Data & Logout",
          onPress: () => onLogout(true),
          style: "destructive"
        },
        {
          text: "Cancel",
          style: "cancel"
        }
      ]
    );
  };

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
        // Premium Stylish Modal Styles
        modalOverlay: {
          flex: 1,
          backgroundColor: 'rgba(0,0,0,0.75)',
          justifyContent: 'center',
          alignItems: 'center',
          padding: 20,
        },
        modalPaper: {
          width: '100%',
          maxHeight: '85%',
          backgroundColor: '#FFF9C4', // Soft Sticky Note Yellow
          borderRadius: 2,
          padding: 24,
          elevation: 25,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 15 },
          shadowOpacity: 0.5,
          shadowRadius: 25,
          transform: [{ rotate: '-1deg' }], // Slight stylish tilt
        },
        modalTape: {
          position: 'absolute',
          top: -15,
          alignSelf: 'center',
          width: 120,
          height: 40,
          backgroundColor: 'rgba(255,255,255,0.4)',
          borderWidth: 1,
          borderColor: 'rgba(0,0,0,0.05)',
          zIndex: 20,
        },
        modalPin: {
          position: 'absolute',
          top: 10,
          right: 20,
          width: 20,
          height: 20,
          borderRadius: 10,
          backgroundColor: '#FF5252',
          borderWidth: 2,
          borderColor: '#D32F2F',
          elevation: 5,
          zIndex: 20,
        },
        modalHeader: {
          marginTop: 10,
          marginBottom: 20,
          borderBottomWidth: 1,
          borderBottomColor: 'rgba(0,0,0,0.05)',
          paddingBottom: 12,
        },
        modalTitle: {
          fontSize: 28,
          fontWeight: '900',
          color: '#333333',
          fontFamily: Platform.OS === 'ios' ? 'Avenir-Heavy' : 'sans-serif-medium',
        },
        modalDate: {
          fontSize: 14,
          color: '#757575',
          fontWeight: '600',
          marginTop: 4,
        },
        modalBody: {
          flexGrow: 0,
          marginBottom: 20,
        },
        modalContent: {
          fontSize: 18,
          lineHeight: 28,
          color: '#444444',
          fontFamily: Platform.OS === 'ios' ? 'Avenir' : 'serif',
        },
        modalCloseBtn: {
          marginTop: 10,
          alignSelf: 'center',
        },
        closeBtnGradient: {
          width: 50,
          height: 50,
          borderRadius: 25,
          alignItems: 'center',
          justifyContent: 'center',
          elevation: 5,
        },
        audioRow: {
          flexDirection: 'row',
          alignItems: 'center',
          backgroundColor: '#FFFFFF',
          borderWidth: 1,
          borderColor: 'rgba(0,0,0,0.1)',
          borderRadius: 14,
          paddingVertical: 10,
          paddingHorizontal: 14,
          marginVertical: 4,
          gap: 12,
        },
        audioPlayBtn: {
          width: 36,
          height: 36,
          borderRadius: 18,
          backgroundColor: theme.primary,
          alignItems: 'center',
          justifyContent: 'center',
        },
        audioText: {
          flex: 1,
          fontSize: 14,
          fontWeight: '700',
          color: '#333333',
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
                <Pressable onPress={handleProfilePress}>
                  <Image 
                    source={{ uri: userProfile?.avatar || 'https://api.dicebear.com/7.x/avataaars/png?seed=Felix' }} 
                    style={styles.avatar} 
                  />
                </Pressable>
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
                    color={isDark ? "#FFD700" : "#000000"} 
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

        {/* Title Section (Hide when searching) */}
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
            onPress={() => setSelectedNote(item)}
            onDelete={() => onDelete(item.id)}
          />
        )}
        numColumns={2}
        key="grid"
        contentContainerStyle={styles.listContent}
        columnWrapperStyle={styles.columnWrapper}
        showsVerticalScrollIndicator={false}
      />

      {/* Premium Stylish Note Modal */}
      <Modal
        visible={!!selectedNote}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setSelectedNote(null)}
      >
        <Pressable 
          style={styles.modalOverlay} 
          onPress={() => setSelectedNote(null)}
        >
          <Pressable style={styles.modalPaper} onPress={() => {}}>
            {/* Decorative Tape & Pin */}
            <View style={styles.modalTape} />
            <View style={styles.modalPin} />

            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{selectedNote?.title}</Text>
              <Text style={styles.modalDate}>{selectedNote?.date}</Text>
            </View>

            <ScrollView 
              style={styles.modalBody} 
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingBottom: 20 }}
            >
              {selectedNote?.images && selectedNote.images.length > 0 && (
                <ScrollView 
                  horizontal 
                  showsHorizontalScrollIndicator={false}
                  style={{ marginBottom: 16 }}
                  contentContainerStyle={{ gap: 10 }}
                >
                  {selectedNote.images.map((img, idx) => (
                    <Image 
                      key={idx} 
                      source={{ uri: img.uri }} 
                      style={{ 
                        width: 220, 
                        height: 160, 
                        borderRadius: 10, 
                        backgroundColor: 'rgba(0,0,0,0.05)',
                        borderWidth: 1,
                        borderColor: 'rgba(0,0,0,0.05)',
                      }} 
                    />
                  ))}
                </ScrollView>
              )}

              {selectedNote?.drawings && selectedNote.drawings.length > 0 && (
                <ScrollView 
                  horizontal 
                  showsHorizontalScrollIndicator={false}
                  style={{ marginBottom: 16 }}
                  contentContainerStyle={{ gap: 10 }}
                >
                  {selectedNote.drawings.map((drawing, idx) => (
                    <View 
                      key={idx} 
                      style={{ 
                        width: 220, 
                        height: 280, 
                        borderRadius: 10, 
                        backgroundColor: '#FFFFFF',
                        borderWidth: 1,
                        borderColor: 'rgba(0,0,0,0.1)',
                        padding: 8,
                      }}
                    >
                      <Svg width="100%" height="100%" viewBox="0 0 350 450">
                        {drawing.lines.map((line, lIdx) => {
                          const path = line.reduce((acc, point, idx) => {
                            if (idx === 0) return `M ${point.x} ${point.y}`;
                            return `${acc} L ${point.x} ${point.y}`;
                          }, '');
                          
                          const first = line[0];
                          const last = line[line.length - 1];
                          let pathData = path;
                          if (first && last && line.length > 2) {
                            const dist = Math.sqrt((first.x - last.x) ** 2 + (first.y - last.y) ** 2);
                            if (dist < 8) {
                              pathData += ' Z';
                            }
                          }
                          
                          return (
                            <React.Fragment key={lIdx}>
                              <Path
                                d={pathData}
                                stroke={line[0]?.color || '#000000'}
                                strokeWidth={line[0]?.width || 4}
                                strokeOpacity={line[0]?.opacity !== undefined ? line[0].opacity : 1}
                                fill="none"
                              />
                              {line[0]?.text && (() => {
                                let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
                                line.forEach(p => {
                                  if (p.x < minX) minX = p.x;
                                  if (p.x > maxX) maxX = p.x;
                                  if (p.y < minY) minY = p.y;
                                  if (p.y > maxY) maxY = p.y;
                                });
                                const cx = (minX + maxX) / 2;
                                const cy = (minY + maxY) / 2;
                                return (
                                  <SvgText
                                    x={cx}
                                    y={cy + 4}
                                    fill={line[0].color || '#000000'}
                                    fontSize={14}
                                    fontWeight="bold"
                                    textAnchor="middle"
                                    alignmentBaseline="middle"
                                    {...(line[0].rotation !== undefined && {
                                      transform: `rotate(${(line[0].rotation * 180) / Math.PI}, ${cx}, ${cy})`
                                    })}
                                  >
                                    {line[0].text}
                                  </SvgText>
                                );
                              })()}
                            </React.Fragment>
                          );
                        })}
                      </Svg>
                    </View>
                  ))}
                </ScrollView>
              )}

              {selectedNote?.audio && selectedNote.audio.length > 0 && (
                <View style={{ marginBottom: 16 }}>
                  {selectedNote.audio.map((track, idx) => (
                    <AudioPlayerRow 
                      key={idx}
                      uri={track.uri}
                      duration={track.duration}
                    />
                  ))}
                </View>
              )}

              {selectedNote?.noteType === 'checklist' && selectedNote.checklist && selectedNote.checklist.length > 0 ? (
                <View style={{ gap: 8, marginVertical: 8 }}>
                  {selectedNote.checklist.map((item) => (
                    <View key={item.id} style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                      <Ionicons 
                        name={item.checked ? "checkbox" : "square-outline"} 
                        size={20} 
                        color={item.checked ? '#757575' : '#333333'} 
                      />
                      <Text 
                        style={{
                          fontSize: 18,
                          color: '#444444',
                          textDecorationLine: item.checked ? 'line-through' : 'none',
                          opacity: item.checked ? 0.6 : 1,
                        }}
                      >
                        {item.text}
                      </Text>
                    </View>
                  ))}
                </View>
              ) : (
                <Text style={styles.modalContent}>{selectedNote?.content}</Text>
              )}
            </ScrollView>

            <Pressable 
              style={styles.modalCloseBtn} 
              onPress={() => setSelectedNote(null)}
            >
              <LinearGradient
                colors={['#FF8C00', '#FFD700']}
                style={styles.closeBtnGradient}
              >
                <Ionicons name="checkmark" size={28} color="#FFFFFF" />
              </LinearGradient>
            </Pressable>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}
