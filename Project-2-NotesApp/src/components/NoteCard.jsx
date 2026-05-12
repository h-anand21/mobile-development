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
  const backgroundColor = STICKY_COLORS[index % STICKY_COLORS.length];
  
  const rotation = useMemo(() => {
    const rotations = ['-1.5deg', '1deg', '-1deg', '1.5deg', '-0.5deg'];
    return rotations[index % rotations.length];
  }, [index]);

  const decorationType = index % 3;

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
        {decorationType === 0 ? (
          <View style={styles.pinContainer}>
            <View style={styles.pinHead} />
          </View>
        ) : (
          <View style={styles.tape} />
        )}

        <Pressable 
          onPress={onDelete}
          style={styles.deleteButton}
        >
          <Ionicons name="close-circle" size={20} color="rgba(0,0,0,0.2)" />
        </Pressable>

        <View style={styles.content}>
          <View>
            <Text style={styles.title} numberOfLines={1}>
              {note.title}
            </Text>
            <Text style={styles.preview} numberOfLines={3}>
              {note.content}
            </Text>
          </View>
          
          <View style={styles.footer}>
            <Text style={styles.dateText}>{note.date}</Text>
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
    paddingTop: 10,
  },
  card: {
    flex: 1,
    aspectRatio: 1,
    padding: 14,
    paddingTop: 24,
    paddingBottom: 10, // Added more bottom padding to prevent cut-off
    borderRadius: 2,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 5,
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
  },
  pinHead: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#FF4444',
    borderWidth: 1,
    borderColor: '#CC0000',
  },
  tape: {
    position: 'absolute',
    top: -10,
    left: '30%',
    width: 50,
    height: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
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
    justifyContent: 'space-between',
  },
  title: {
    fontSize: 16,
    fontWeight: '900',
    color: '#1A1A1A',
    marginBottom: 4,
  },
  preview: {
    fontSize: 13,
    lineHeight: 18,
    color: '#444444',
    fontStyle: 'italic',
  },
  footer: {
    marginTop: 'auto',
    paddingTop: 4,
  },
  dateText: {
    fontSize: 10,
    color: 'rgba(0,0,0,0.5)',
    fontWeight: '700',
    textAlign: 'right',
  },
});
