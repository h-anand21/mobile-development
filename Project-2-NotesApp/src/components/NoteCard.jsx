import React, { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Svg, { Path, Text as SvgText } from 'react-native-svg';

const STICKY_COLORS = [
  '#B9FBC0', // Mint Green
  '#FFCF96', // Light Orange
  '#D0BCFF', // Lavender
  '#98FFD9', // Aqua
  '#A0E7FF', // Sky Blue
  '#FFFD96', // Pale Yellow
];

export default function NoteCard({ note, index, onPress, onPinToggle }) {
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
          onPress={onPinToggle}
          style={styles.pinButton}
        >
          <Ionicons 
            name={note.isPinned ? "bookmark" : "bookmark-outline"} 
            size={18} 
            color={note.isPinned ? "#FF8C00" : "rgba(0,0,0,0.35)"} 
          />
        </Pressable>

        <View style={styles.content}>
          <View style={{ flex: 1 }}>
            <Text style={styles.title} numberOfLines={1}>
              {note.title}
            </Text>
            {note.images && note.images.length > 0 ? (
              <Image 
                source={{ uri: note.images[0].uri }} 
                style={styles.cardImagePreview} 
              />
            ) : (
              note.drawings && note.drawings.length > 0 && (
                <View style={[styles.cardImagePreview, { backgroundColor: '#FFFFFF', padding: 4 }]}>
                  <Svg width="100%" height="100%" viewBox="0 0 350 450">
                    {note.drawings[0].lines.map((line, lIdx) => {
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
              )
            )}
            {note.noteType === 'checklist' && note.checklist && note.checklist.length > 0 ? (
              <View style={styles.cardChecklistContainer}>
                {note.checklist.slice(0, ((note.images && note.images.length > 0) || (note.drawings && note.drawings.length > 0)) ? 1 : 3).map((item) => (
                  <View key={item.id} style={styles.cardChecklistItem}>
                    <Ionicons 
                      name={item.checked ? "checkbox" : "square-outline"} 
                      size={12} 
                      color={item.checked ? 'rgba(0,0,0,0.3)' : 'rgba(0,0,0,0.6)'} 
                    />
                    <Text 
                      style={[
                        styles.cardChecklistText,
                        item.checked && styles.cardChecklistTextChecked
                      ]}
                      numberOfLines={1}
                    >
                      {item.text}
                    </Text>
                  </View>
                ))}
                {note.checklist.length > (((note.images && note.images.length > 0) || (note.drawings && note.drawings.length > 0)) ? 1 : 3) && (
                  <Text style={styles.cardChecklistMore}>
                    + {note.checklist.length - (((note.images && note.images.length > 0) || (note.drawings && note.drawings.length > 0)) ? 1 : 3)} more items
                  </Text>
                )}
              </View>
            ) : (
              <Text 
                style={styles.preview} 
                numberOfLines={((note.images && note.images.length > 0) || (note.drawings && note.drawings.length > 0)) ? 1 : 3}
              >
                {note.content}
              </Text>
            )}
          </View>
          
          <View style={[styles.footer, { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }]}>
            <View style={{ flexDirection: 'row', gap: 4, alignItems: 'center' }}>
              {note.noteType === 'template' && (
                <Ionicons name="calendar-outline" size={12} color="rgba(0,0,0,0.4)" />
              )}
              {note.images && note.images.length > 0 && (
                <Ionicons name="image-outline" size={12} color="rgba(0,0,0,0.4)" />
              )}
              {note.drawings && note.drawings.length > 0 && (
                <Ionicons name="brush-outline" size={12} color="rgba(0,0,0,0.4)" />
              )}
              {note.audio && note.audio.length > 0 && (
                <Ionicons name="mic-outline" size={12} color="rgba(0,0,0,0.4)" />
              )}
            </View>
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
  pinButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    zIndex: 11,
    padding: 4,
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
  cardImagePreview: {
    width: '100%',
    height: 55,
    borderRadius: 6,
    marginBottom: 6,
    backgroundColor: 'rgba(0,0,0,0.05)',
  },
  cardChecklistContainer: {
    marginVertical: 4,
    gap: 3,
  },
  cardChecklistItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  cardChecklistText: {
    fontSize: 12,
    color: '#333333',
    flex: 1,
  },
  cardChecklistTextChecked: {
    textDecorationLine: 'line-through',
    color: 'rgba(0,0,0,0.4)',
  },
  cardChecklistMore: {
    fontSize: 10,
    color: 'rgba(0,0,0,0.5)',
    fontWeight: '700',
    marginTop: 2,
  },
});
