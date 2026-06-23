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

export default function NoteCard({ note, index, isDark, onPress, onPinToggle }) {
  const backgroundColor = STICKY_COLORS[index % STICKY_COLORS.length];
  

  const rotation = useMemo(() => {
    const rotations = ['-1.5deg', '1deg', '-1deg', '1.5deg', '-0.5deg'];
    return rotations[index % rotations.length];
  }, [index]);

  const decorationType = index % 3;
  const displayDate = note.date || '';

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
            ) : (note.noteType === 'notebook' && note.templateData?.pages?.[0]) ? (() => {
              const firstPage = note.templateData.pages[0];
              const pageLines = firstPage.lines || [];
              const pageTextBoxes = firstPage.textBoxes || [];
              const isPageDark = firstPage.pageThemeMode ? firstPage.pageThemeMode === 'dark' : isDark;
              const resolvePageColor = (color) => {
                if (!color) return isPageDark ? '#FFFFFF' : '#000000';
                const c = color.toUpperCase();
                if (c === '#000000' && isPageDark) return '#FFFFFF';
                if (c === '#FFFFFF' && !isPageDark) return '#000000';
                return color;
              };
              const pageHeight = firstPage.pageHeight || 500;
              const lineSlotsRuled = Math.floor(pageHeight / 55);
              const lineSlotsGridH = Math.floor(pageHeight / 55);
              return (
                 <View style={[styles.cardImagePreview, { backgroundColor: isPageDark ? '#121212' : '#FFFFFF', padding: 3, borderWidth: 0.5, borderColor: isPageDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' }]}>
                  <Svg width="100%" height="100%" viewBox={`0 0 360 ${pageHeight}`} preserveAspectRatio="xMidYMin slice">
                    {/* Rules/Grids */}
                    {firstPage.pageStyle === 'ruled' && (
                      <>
                        {Array.from({ length: lineSlotsRuled }).map((_, i) => (
                          <Path
                            key={`c-ruled-${i}`}
                            d={`M 0 ${(i + 1) * 55} L 360 ${(i + 1) * 55}`}
                            stroke={isPageDark ? "#2C3E50" : "#B3E5FC"}
                            strokeWidth={1}
                            opacity={isPageDark ? 0.6 : 0.8}
                          />
                        ))}
                        <Path d={`M 45 0 L 45 ${pageHeight}`} stroke={isPageDark ? "#E74C3C" : "#FFCDD2"} strokeWidth={1.5} opacity={isPageDark ? 0.5 : 0.8} />
                      </>
                    )}
                    {firstPage.pageStyle === 'grid' && (
                      <>
                        {Array.from({ length: lineSlotsGridH }).map((_, i) => (
                          <Path
                            key={`c-grid-h-${i}`}
                            d={`M 0 ${(i + 1) * 55} L 360 ${(i + 1) * 55}`}
                            stroke={isPageDark ? "#2A2A2A" : "#ECEFF1"}
                            strokeWidth={1.5}
                          />
                        ))}
                        {Array.from({ length: 6 }).map((_, i) => (
                          <Path
                            key={`c-grid-v-${i}`}
                            d={`M ${(i + 1) * 55} 0 L ${(i + 1) * 55} ${pageHeight}`}
                            stroke={isPageDark ? "#2A2A2A" : "#ECEFF1"}
                            strokeWidth={1.5}
                          />
                        ))}
                      </>
                    )}

                    {/* Drawings */}
                    {pageLines.map((line, lIdx) => {
                      const path = line.reduce((acc, point, idx) => {
                        if (idx === 0) return `M ${point.x} ${point.y}`;
                        return `${acc} L ${point.x} ${point.y}`;
                      }, '');
                      const first = line[0];
                      const last = line[line.length - 1];
                      let pathData = path;
                      if (first && last && line.length > 2) {
                        const dist = Math.sqrt((first.x - last.x) ** 2 + (first.y - last.y) ** 2);
                        if (dist < 8) pathData += ' Z';
                      }
                      return (
                        <Path
                          key={lIdx}
                          d={pathData}
                          stroke={resolvePageColor(line[0]?.color)}
                          strokeWidth={line[0]?.width || 4}
                          strokeOpacity={line[0]?.opacity !== undefined ? line[0].opacity : 1}
                          fill="none"
                        />
                      );
                    })}

                    {/* Text Boxes */}
                    {pageTextBoxes.map((box) => (
                      <SvgText
                        key={box.id}
                        x={box.x + box.width / 2}
                        y={box.y + box.height / 2 + 5}
                        fill={resolvePageColor(box.color)}
                        fontSize={16}
                        fontWeight={box.fontStyle?.includes('bold') ? 'bold' : 'normal'}
                        fontStyle={box.fontStyle?.includes('italic') ? 'italic' : 'normal'}
                        textAnchor="middle"
                        alignmentBaseline="middle"
                      >
                        {(box.text || '').split('\n')[0] || ''}
                      </SvgText>
                    ))}
                  </Svg>
                  {(firstPage.images || []).map((img) => (
                    <Image
                      key={img.id}
                      source={{ uri: img.uri }}
                      style={{
                        position: 'absolute',
                        left: `${(img.x / 360) * 100}%`,
                        top: `${(img.y / pageHeight) * 100}%`,
                        width: `${(img.width / 360) * 100}%`,
                        height: `${(img.height / pageHeight) * 100}%`,
                      }}
                      resizeMode="cover"
                    />
                  ))}
                </View>
              );
            })() : (
              note.drawings && note.drawings.length > 0 && (
                <View style={[styles.cardImagePreview, { backgroundColor: '#FFFFFF', padding: 4 }]}>
                  <Svg width="100%" height="100%" viewBox="0 0 350 450" preserveAspectRatio="xMidYMin slice">
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
            ) : note.noteType === 'notebook' ? null : (
              <Text 
                style={styles.preview} 
                numberOfLines={((note.images && note.images.length > 0) || (note.drawings && note.drawings.length > 0)) ? 1 : 3}
              >
                {note.content}
              </Text>
            )}
            {note.reminder && (
              <View style={styles.cardReminderBadge}>
                <Ionicons name="notifications" size={10} color="#0D47A1" />
                <Text style={styles.cardReminderText} numberOfLines={1}>
                  {note.reminder.formattedText}
                </Text>
              </View>
            )}
          </View>
          
          <View style={styles.footer}>
            <View style={{ flexDirection: 'row', gap: 4, alignItems: 'center' }}>
              {note.noteType === 'notebook' && (
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 2 }}>
                  <Ionicons name="book-outline" size={12} color="rgba(0,0,0,0.4)" />
                  <Text style={{ fontSize: 10, color: 'rgba(0,0,0,0.4)', fontWeight: '700' }}>
                    {note.templateData?.pages?.length || 1} pgs
                  </Text>
                </View>
              )}
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
            <Text style={styles.dateText}>{displayDate}</Text>
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
    fontSize: 9.5,
    color: 'rgba(0,0,0,0.6)',
    fontWeight: '700',
    textAlign: 'right',
    marginTop: 2,
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
  cardReminderBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(13, 71, 161, 0.08)',
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 3,
    gap: 4,
    marginTop: 6,
    alignSelf: 'flex-start',
    maxWidth: '100%',
    borderWidth: 0.5,
    borderColor: 'rgba(13, 71, 161, 0.15)',
  },
  cardReminderText: {
    fontSize: 9,
    color: '#0D47A1',
    fontWeight: '700',
  },
});
