import React, { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const STICKY_COLORS = [
  '#B9FBC0', // Mint Green
  '#FFCF96', // Light Orange
  '#D0BCFF', // Lavender
  '#98FFD9', // Aqua
  '#A0E7FF', // Sky Blue
  '#FFFD96', // Pale Yellow
];

export default function NoteCard({ note, index, onPress, onDelete }) {
  // Use index to pick a color so it's consistent for that note in the list
  const backgroundColor = STICKY_COLORS[index % STICKY_COLORS.length];
  
  // Random slight rotation for that "pinned" look
  const rotation = useMemo(() => {
    const rotations = ['-2deg', '1deg', '-1.5deg', '2.5deg', '-0.5deg'];
    return rotations[index % rotations.length];
  }, [index]);

  // Determine decoration (Pin or Tape)
  const decorationType = index % 3; // 0: Pin, 1: Tape, 2: Paperclip (we'll use Tape for 2 too)

  return (
    <View style={[styles.wrapper, { transform: [{ rotate: rotation }] }]}>
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [
          styles.card,
          { backgroundColor },
          pressed && styles.cardPressed
        ]}
      >
        {/* Decoration: Pin or Tape */}
        {decorationType === 0 ? (
          <View style={styles.pinContainer}>
            <View style={styles.pinHead} />
            <View style={styles.pinShadow} />
          </View>
        ) : (
          <View style={styles.tape} />
        )}

        <Pressable 
          onPress={onDelete}
          style={styles.deleteButton}
        >
          <Ionicons name="close-circle" size={20} color="rgba(0,0,0,0.3)" />
        </Pressable>

        <View style={styles.content}>
          <Text style={styles.title} numberOfLines={2}>
            {note.title}
          </Text>
          <Text style={styles.preview} numberOfLines={4}>
            {note.content}
          </Text>
          
          <View style={styles.footer}>
            <Text style={styles.date}>{note.date}</Text>
          </View>
        </View>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    margin: 8,
    paddingTop: 10, // Space for the pin
  },
  card: {
    flex: 1,
    aspectRatio: 1, // Make it square like a post-it
    padding: 16,
    paddingTop: 24,
    borderRadius: 2, // Sharp edges with very slight roundness
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
  },
  cardPressed: {
    transform: [{ scale: 0.98 }],
  },
  pinContainer: {
    position: 'absolute',
    top: -8,
    left: '50%',
    marginLeft: -8,
    zIndex: 10,
    alignItems: 'center',
  },
  pinHead: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#FF4444',
    borderWidth: 1,
    borderColor: '#CC0000',
    zIndex: 2,
  },
  pinShadow: {
    position: 'absolute',
    top: 4,
    left: 4,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: 'rgba(0,0,0,0.1)',
    zIndex: 1,
  },
  tape: {
    position: 'absolute',
    top: -10,
    left: '30%',
    width: 60,
    height: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    transform: [{ rotate: '5deg' }],
    zIndex: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  deleteButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    zIndex: 11,
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '800',
    color: '#333333',
    marginBottom: 8,
    fontFamily: 'System', // Use a handwriting font if loaded, but System is safe
  },
  preview: {
    fontSize: 14,
    lineHeight: 18,
    color: '#444444',
    fontStyle: 'italic',
  },
  footer: {
    marginTop: 'auto',
  },
  date: {
    fontSize: 11,
    color: 'rgba(0,0,0,0.4)',
    fontWeight: '600',
    textAlign: 'right',
  },
});
