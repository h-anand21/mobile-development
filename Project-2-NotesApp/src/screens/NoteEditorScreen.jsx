import React, { useMemo, useState, useRef, useEffect } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  useWindowDimensions,
  Modal,
  Alert,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';
import Svg, { Path, Text as SvgText } from 'react-native-svg';
import DrawingCanvas from './DrawingCanvas';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
let Audio = null;
try {
  Audio = require('expo-av').Audio;
} catch (error) {
  console.warn('Audio module not loaded:', error);
}

export default function NoteEditorScreen({ onSave, onBack, theme, noteToEdit }) {
  const { height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const [title, setTitle] = useState(noteToEdit ? noteToEdit.title : '');
  const [body, setBody] = useState(noteToEdit ? (noteToEdit.noteType === 'text' ? noteToEdit.content : '') : '');
  const [status, setStatus] = useState('');
  const scrollViewRef = useRef(null);
  const descriptionScrollViewRef = useRef(null);

  // New Media & Checklist states
  const [noteType, setNoteType] = useState(noteToEdit ? noteToEdit.noteType : 'text'); // 'text' or 'checklist'
  const [checklist, setChecklist] = useState(noteToEdit ? (noteToEdit.checklist || []) : []);
  const [images, setImages] = useState(noteToEdit ? (noteToEdit.images || []) : []);
  const [drawings, setDrawings] = useState(noteToEdit ? (noteToEdit.drawings || []) : []);
  const [audio, setAudio] = useState(noteToEdit ? (noteToEdit.audio || []) : []);
  const [isBottomSheetVisible, setIsBottomSheetVisible] = useState(false);
  const [isDrawingCanvasVisible, setIsDrawingCanvasVisible] = useState(false);
  const [viewerImageUri, setViewerImageUri] = useState(null);

  const handleSaveDrawing = (newDrawingLines) => {
    setDrawings(prev => [...prev, { lines: newDrawingLines }]);
    setIsDrawingCanvasVisible(false);
  };

  // Audio Recorder States & Handlers
  const [recordDuration, setRecordDuration] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [recording, setRecording] = useState(null);
  const [isRecordingModalVisible, setIsRecordingModalVisible] = useState(false);
  const timerRef = useRef(null);

  const startRecording = async () => {
    if (!Audio) {
      Alert.alert('Not Supported', 'Audio recording is not supported in this environment.');
      return;
    }
    try {
      const permission = await Audio.requestPermissionsAsync();
      if (permission.status === 'granted') {
        await Audio.setAudioModeAsync({
          allowsRecordingIOS: true,
          playsInSilentModeIOS: true,
        });
        const { recording: newRecording } = await Audio.Recording.createAsync(
          Audio.RecordingOptionsPresets.HIGH_QUALITY
        );
        setRecording(newRecording);
        setIsRecording(true);
        setRecordDuration(0);
        timerRef.current = setInterval(() => {
          setRecordDuration(prev => prev + 1);
        }, 1000);
      } else {
        Alert.alert('Permission Denied', 'Microphone permission is required to record audio.');
      }
    } catch (err) {
      console.error('Failed to start recording', err);
    }
  };

  const stopRecording = async (shouldSave = true) => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setIsRecording(false);
    if (!recording) return;
    try {
      await recording.stopAndUnloadAsync();
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
      });
      const uri = recording.getURI();
      if (shouldSave) {
        setAudio(prev => [...prev, { uri, duration: recordDuration }]);
      }
      setRecording(null);
      setIsRecordingModalVisible(false);
    } catch (err) {
      console.error('Failed to stop recording', err);
    }
  };

  const cancelRecording = async () => {
    await stopRecording(false);
    setIsRecordingModalVisible(false);
  };

  // Audio Player Row Component (Defined locally inside NoteEditorScreen to access styles easily)
  const AudioPlayerRow = ({ uri, duration, onDelete }) => {
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
        {onDelete && (
          <Pressable onPress={onDelete} style={styles.audioDeleteBtn}>
            <Ionicons name="trash-outline" size={18} color="#EF4444" />
          </Pressable>
        )}
      </View>
    );
  };

  // Image Handlers
  const handlePickImage = async (useCamera = false) => {
    setIsBottomSheetVisible(false);
    
    // Ask permission
    const permissionResult = useCamera 
      ? await ImagePicker.requestCameraPermissionsAsync() 
      : await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permissionResult.granted) {
      Alert.alert(
        'Permission Required',
        `We need ${useCamera ? 'camera' : 'gallery'} permission to attach photos!`
      );
      return;
    }

    const result = useCamera
      ? await ImagePicker.launchCameraAsync({
          mediaTypes: ['images'],
          allowsEditing: true,
          quality: 0.8,
        })
      : await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ['images'],
          allowsEditing: true,
          quality: 0.8,
        });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      const selectedUri = result.assets[0].uri;
      setImages(prev => [...prev, { uri: selectedUri }]);
    }
  };

  const triggerImageOptions = () => {
    setIsBottomSheetVisible(false);
    Alert.alert(
      "Add Image",
      "Choose an option to upload your photo:",
      [
        {
          text: "Camera (Take Photo)",
          onPress: () => handlePickImage(true),
        },
        {
          text: "Gallery (Choose Photo)",
          onPress: () => handlePickImage(false),
        },
        {
          text: "Cancel",
          style: "cancel"
        }
      ]
    );
  };

  // Checklist Helpers
  const handleAddChecklistItem = () => {
    setChecklist(prev => [...prev, { id: Date.now().toString(), text: '', checked: false }]);
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  const handleUpdateChecklistItem = (id, text) => {
    setChecklist(prev => prev.map(item => item.id === id ? { ...item, text } : item));
  };

  const handleToggleChecklistItem = (id) => {
    setChecklist(prev => prev.map(item => item.id === id ? { ...item, checked: !item.checked } : item));
  };

  const handleRemoveChecklistItem = (id) => {
    setChecklist(prev => prev.filter(item => item.id !== id));
  };

  const handleSwitchToChecklist = () => {
    if (noteType === 'text') {
      const lines = body.split('\n').filter(line => line.trim() !== '');
      const initialList = lines.length > 0 
        ? lines.map((line, index) => ({ id: `${Date.now()}-${index}`, text: line, checked: false }))
        : [{ id: Date.now().toString(), text: '', checked: false }];
      setChecklist(initialList);
      setNoteType('checklist');
    }
    setIsBottomSheetVisible(false);
  };

  const handleSwitchToText = () => {
    if (noteType === 'checklist') {
      const combinedText = checklist.map(item => item.text).join('\n');
      setBody(combinedText);
      setNoteType('text');
    }
    setIsBottomSheetVisible(false);
  };

  const styles = useMemo(
    () =>
      StyleSheet.create({
        screen: {
          flex: 1,
          backgroundColor: theme.background,
        },
        headerGradient: {
          paddingTop: Platform.OS === 'ios' ? 45 : 35,
          paddingBottom: 15,
          paddingHorizontal: 24,
          borderBottomLeftRadius: 20,
          borderBottomRightRadius: 20,
          position: 'relative',
          overflow: 'hidden',
          elevation: 8,
          shadowColor: '#FF8C00',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.2,
          shadowRadius: 10,
        },
        headerTop: {
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 8,
          zIndex: 2,
        },
        iconBtn: {
          width: 38,
          height: 38,
          borderRadius: 10,
          backgroundColor: 'rgba(255,255,255,0.25)',
          alignItems: 'center',
          justifyContent: 'center',
          borderWidth: 1,
          borderColor: 'rgba(255,255,255,0.2)',
        },
        headerContent: {
          zIndex: 2,
        },
        headerTitle: {
          color: '#FFFFFF',
          fontSize: 22,
          fontWeight: '900',
          letterSpacing: -0.5,
        },
        headerSubtitle: {
          color: 'rgba(255,255,255,0.85)',
          fontSize: 12,
          marginTop: 1,
          fontWeight: '500',
        },
        bgIcon: {
          position: 'absolute',
          right: -10,
          bottom: -10,
          opacity: 0.12,
          zIndex: 1,
        },
        bgCircle: {
          position: 'absolute',
          left: -20,
          top: -10,
          width: 80,
          height: 80,
          borderRadius: 40,
          backgroundColor: 'rgba(255,255,255,0.08)',
          zIndex: 1,
        },
        mainContent: {
          paddingHorizontal: 20,
          paddingTop: 20,
        },
        inputCard: {
          backgroundColor: theme.surface,
          borderRadius: 30,
          padding: 18,
          elevation: 4,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.06,
          shadowRadius: 10,
          marginBottom: 16,
          flexGrow: 1,
          minHeight: height - 250,
        },
        labelGroup: {
          flexDirection: 'row',
          alignItems: 'center',
          gap: 6,
          marginBottom: 8,
        },
        label: {
          fontSize: 13,
          fontWeight: '800',
          color: theme.mutedText,
          textTransform: 'uppercase',
          letterSpacing: 1,
        },
        titleInput: {
          fontSize: 20,
          fontWeight: '700',
          color: theme.text,
          paddingVertical: 10,
          paddingHorizontal: 4,
          borderBottomWidth: 1,
          borderBottomColor: theme.border,
          marginBottom: 16,
        },
        bodyScroll: {
          flex: 1,
        },
        bodyInput: {
          fontSize: 16,
          color: theme.text,
          paddingHorizontal: 4,
          lineHeight: 24,
          textAlignVertical: 'top',
          minHeight: 200,
        },
        imagePreviewsContainer: {
          maxHeight: 110,
          marginVertical: 10,
        },
        imagePreviewWrapper: {
          width: 90,
          height: 90,
          borderRadius: 14,
          position: 'relative',
          overflow: 'hidden',
          backgroundColor: '#EEEEEE',
          borderWidth: 1,
          borderColor: theme.border,
          marginRight: 10,
        },
        imagePreview: {
          width: '100%',
          height: '100%',
        },
        imageDeleteBtn: {
          position: 'absolute',
          top: 4,
          right: 4,
          backgroundColor: '#FFFFFF',
          borderRadius: 10,
          elevation: 3,
        },
        audioRow: {
          flexDirection: 'row',
          alignItems: 'center',
          backgroundColor: theme.surface,
          borderWidth: 1,
          borderColor: theme.border,
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
          color: theme.text,
        },
        audioDeleteBtn: {
          padding: 6,
        },
        footer: {
          flexDirection: 'row',
          gap: 12,
          paddingHorizontal: 20,
          paddingBottom: 25,
          paddingTop: 10,
        },
        cancelBtn: {
          flex: 1,
          height: 58,
          borderRadius: 18,
          backgroundColor: theme.surface,
          alignItems: 'center',
          justifyContent: 'center',
          borderWidth: 1.5,
          borderColor: theme.border,
        },
        cancelTxt: {
          color: theme.text,
          fontSize: 16,
          fontWeight: '800',
        },
        saveBtnContainer: {
          flex: 2,
          height: 58,
          borderRadius: 18,
          overflow: 'hidden',
          elevation: 6,
          shadowColor: '#FF8C00',
          shadowOffset: { width: 0, height: 3 },
          shadowOpacity: 0.3,
          shadowRadius: 8,
        },
        saveGrad: {
          flex: 1,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 8,
        },
        saveTxt: {
          color: '#FFFFFF',
          fontSize: 16,
          fontWeight: '800',
        },
        statusTxt: {
          textAlign: 'center',
          fontSize: 13,
          color: theme.accent,
          fontWeight: '700',
          marginBottom: 10,
        },
        // Bottom Sheet Styles
        bottomSheetOverlay: {
          flex: 1,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          justifyContent: 'flex-end',
        },
        bottomSheetContainer: {
          backgroundColor: theme.surface,
          borderTopLeftRadius: 30,
          borderTopRightRadius: 30,
          padding: 24,
          paddingBottom: insets.bottom > 0 ? insets.bottom + 10 : 24,
          borderTopWidth: 1,
          borderColor: theme.border,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -4 },
          shadowOpacity: 0.15,
          shadowRadius: 10,
          elevation: 20,
        },
        bottomSheetHandle: {
          width: 44,
          height: 6,
          backgroundColor: theme.border,
          borderRadius: 3,
          alignSelf: 'center',
          marginBottom: 20,
        },
        bottomSheetTitle: {
          fontSize: 18,
          fontWeight: '800',
          color: theme.text,
          marginBottom: 16,
        },
        bottomSheetList: {
          gap: 12,
        },
        bottomSheetItem: {
          flexDirection: 'row',
          alignItems: 'center',
          gap: 14,
          paddingVertical: 12,
          paddingHorizontal: 8,
          borderRadius: 14,
        },
        bottomSheetItemIconContainer: {
          width: 42,
          height: 42,
          borderRadius: 21,
          alignItems: 'center',
          justifyContent: 'center',
        },
        bottomSheetItemText: {
          fontSize: 16,
          fontWeight: '700',
          color: theme.text,
        },
        // Checklist Styles
        checklistItemRow: {
          flexDirection: 'row',
          alignItems: 'center',
          gap: 10,
          marginVertical: 4,
        },
        checklistCheckbox: {
          padding: 4,
        },
        checklistItemInput: {
          flex: 1,
          fontSize: 16,
          color: theme.text,
          paddingVertical: 6,
          paddingHorizontal: 4,
        },
        checklistItemTextChecked: {
          textDecorationLine: 'line-through',
          color: theme.mutedText,
        },
        checklistDeleteBtn: {
          padding: 6,
        },
        checklistAddBtn: {
          flexDirection: 'row',
          alignItems: 'center',
          gap: 10,
          paddingVertical: 12,
          marginTop: 10,
        },
        checklistAddTxt: {
          fontSize: 16,
          color: theme.primary,
          fontWeight: '700',
        },
      }),
    [theme, height, insets]
  );

  return (
    <KeyboardAvoidingView
      style={styles.screen}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      {/* Fixed Header */}
      <LinearGradient
        colors={['#FF8C00', '#FFD700']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.headerGradient}
      >
        <View style={styles.bgCircle} />
        <View style={styles.bgIcon}>
          <Ionicons name="document-text" size={100} color="#FFFFFF" />
        </View>

        <View style={styles.headerTop}>
          <Pressable onPress={onBack} style={styles.iconBtn}>
            <Ionicons name="chevron-back" size={20} color="#FFFFFF" />
          </Pressable>
          
          <View style={{ flexDirection: 'row', gap: 10 }}>
            <Pressable 
              onPress={() => setIsBottomSheetVisible(true)} 
              style={styles.iconBtn}
            >
              <Ionicons name="add" size={22} color="#FFFFFF" />
            </Pressable>
            
            <Pressable 
              onPress={() => {
                setTitle('');
                setBody('');
                setChecklist([]);
                setNoteType('text');
                setImages([]);
                setDrawings([]);
                setAudio([]);
                setStatus('Draft Cleared ✨');
              }} 
              style={styles.iconBtn}
            >
              <Ionicons name="sparkles-outline" size={18} color="#FFFFFF" />
            </Pressable>
          </View>
        </View>

        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>New Note</Text>
          <Text style={styles.headerSubtitle}>Turn your ideas into reality</Text>
        </View>
      </LinearGradient>

      {/* Main Content Area */}
      <ScrollView 
        ref={scrollViewRef}
        style={styles.screen}
        contentContainerStyle={[styles.mainContent, { flexGrow: 1, paddingBottom: 180 }]}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.inputCard}>
          <View style={styles.labelGroup}>
            <Ionicons name="bookmark" size={14} color={theme.primary} />
            <Text style={styles.label}>Note Title</Text>
          </View>
          <TextInput
            value={title}
            onChangeText={setTitle}
            placeholder="What's on your mind?"
            placeholderTextColor={theme.placeholder}
            style={styles.titleInput}
          />

          {/* Horizontally scrolling list of attached images */}
          {images.length > 0 && (
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false} 
              style={styles.imagePreviewsContainer}
              contentContainerStyle={{ gap: 10, paddingBottom: 10 }}
            >
              {images.map((img, idx) => (
                <View key={idx} style={styles.imagePreviewWrapper}>
                  <Pressable onPress={() => setViewerImageUri(img.uri)} style={{ width: '100%', height: '100%' }}>
                    <Image source={{ uri: img.uri }} style={styles.imagePreview} />
                  </Pressable>
                  <Pressable 
                    onPress={() => setImages(prev => prev.filter((_, i) => i !== idx))}
                    style={styles.imageDeleteBtn}
                  >
                    <Ionicons name="close-circle" size={18} color="#FF4444" />
                  </Pressable>
                </View>
              ))}
            </ScrollView>
          )}

          {/* Horizontally scrolling list of drawings */}
          {drawings.length > 0 && (
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false} 
              style={styles.imagePreviewsContainer}
              contentContainerStyle={{ gap: 10, paddingBottom: 10 }}
            >
              {drawings.map((drawing, idx) => (
                <View key={idx} style={[styles.imagePreviewWrapper, { backgroundColor: '#FFFFFF', padding: 4 }]}>
                  <Svg width={90} height={90} viewBox="0 0 350 450" style={styles.imagePreview}>
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
                  <Pressable 
                    onPress={() => setDrawings(prev => prev.filter((_, i) => i !== idx))}
                    style={styles.imageDeleteBtn}
                  >
                    <Ionicons name="close-circle" size={18} color="#FF4444" />
                  </Pressable>
                </View>
              ))}
            </ScrollView>
          )}

          {/* List of attached audio files */}
          {audio.length > 0 && (
            <View style={{ marginVertical: 10 }}>
              {audio.map((track, idx) => (
                <AudioPlayerRow 
                  key={idx}
                  uri={track.uri}
                  duration={track.duration}
                  onDelete={() => setAudio(prev => prev.filter((_, i) => i !== idx))}
                />
              ))}
            </View>
          )}

          <View style={styles.labelGroup}>
            <Ionicons name="reader" size={14} color={theme.primary} />
            <Text style={styles.label}>
              {noteType === 'checklist' ? 'Checklist Items' : 'Description'}
            </Text>
          </View>
          
          {noteType === 'checklist' ? (
            <View style={{ flexGrow: 1, paddingBottom: 20 }}>
              {checklist.map((item) => (
                <View key={item.id} style={styles.checklistItemRow}>
                  <Pressable 
                    onPress={() => handleToggleChecklistItem(item.id)}
                    style={styles.checklistCheckbox}
                  >
                    <Ionicons 
                      name={item.checked ? "checkbox" : "square-outline"} 
                      size={20} 
                      color={item.checked ? theme.primary : theme.mutedText} 
                    />
                  </Pressable>
                  <TextInput
                    value={item.text}
                    onChangeText={(text) => handleUpdateChecklistItem(item.id, text)}
                    placeholder="List item"
                    placeholderTextColor={theme.placeholder}
                    style={[
                      styles.checklistItemInput,
                      item.checked && styles.checklistItemTextChecked
                    ]}
                  />
                  <Pressable 
                    onPress={() => handleRemoveChecklistItem(item.id)}
                    style={styles.checklistDeleteBtn}
                  >
                    <Ionicons name="close" size={20} color={theme.mutedText} />
                  </Pressable>
                </View>
              ))}
              
              <Pressable onPress={handleAddChecklistItem} style={styles.checklistAddBtn}>
                <Ionicons name="add" size={20} color={theme.primary} />
                <Text style={styles.checklistAddTxt}>Add Item</Text>
              </Pressable>
            </View>
          ) : (
            <View style={{ height: 200, marginTop: 8 }}>
              <ScrollView 
                ref={descriptionScrollViewRef}
                nestedScrollEnabled={true}
                style={{ flex: 1 }}
                contentContainerStyle={{ flexGrow: 1 }}
              >
                <TextInput
                  value={body}
                  onChangeText={setBody}
                  placeholder="Write down your thoughts here..."
                  placeholderTextColor={theme.placeholder}
                  style={styles.bodyInput}
                  multiline
                  scrollEnabled={false}
                  textAlignVertical="top"
                  onFocus={() => {
                    setTimeout(() => {
                      scrollViewRef.current?.scrollToEnd({ animated: true });
                      descriptionScrollViewRef.current?.scrollToEnd({ animated: true });
                    }, 100);
                  }}
                  onContentSizeChange={() => {
                    descriptionScrollViewRef.current?.scrollToEnd({ animated: true });
                    scrollViewRef.current?.scrollToEnd({ animated: true });
                  }}
                />
              </ScrollView>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Fixed Footer */}
      {!!status && <Text style={styles.statusTxt}>{status}</Text>}
      
      <View style={styles.footer}>
        <Pressable onPress={onBack} style={styles.cancelBtn}>
          <Text style={styles.cancelTxt}>Cancel</Text>
        </Pressable>

        <Pressable
          onPress={() => {
            const hasChecklistItems = checklist.some(item => item.text.trim() !== '');
            if (title.trim() || body.trim() || hasChecklistItems) {
              onSave({ 
                title: title || 'Untitled Note', 
                content: noteType === 'checklist' 
                  ? checklist.map(item => `${item.checked ? '[x]' : '[ ]'} ${item.text}`).join('\n')
                  : body,
                noteType,
                checklist,
                images,
                drawings,
                audio,
              });
            } else {
              setStatus('Oops! Add some content first ✍️');
            }
          }}
          style={styles.saveBtnContainer}
        >
          <LinearGradient
            colors={['#FF8C00', '#FFD700']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.saveGrad}
          >
            <Ionicons name="checkmark-done" size={20} color="#FFFFFF" />
            <Text style={styles.saveTxt}>Save Note</Text>
          </LinearGradient>
        </Pressable>
      </View>

      {/* Premium Glassmorphic Bottom Sheet Modal */}
      <Modal
        visible={isBottomSheetVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setIsBottomSheetVisible(false)}
      >
        <Pressable 
          style={styles.bottomSheetOverlay} 
          onPress={() => setIsBottomSheetVisible(false)}
        >
          <Pressable style={styles.bottomSheetContainer} onPress={() => {}}>
            <View style={styles.bottomSheetHandle} />
            <Text style={styles.bottomSheetTitle}>Add to Note</Text>
            
            <View style={styles.bottomSheetList}>
              {/* Option 1: Attach Image */}
              <Pressable 
                onPress={triggerImageOptions} 
                style={({ pressed }) => [
                  styles.bottomSheetItem,
                  { backgroundColor: pressed ? theme.overlay : 'transparent' }
                ]}
              >
                <View style={[styles.bottomSheetItemIconContainer, { backgroundColor: '#FFE0B2' }]}>
                  <Ionicons name="image" size={20} color="#F57C00" />
                </View>
                <Text style={styles.bottomSheetItemText}>Add Image</Text>
              </Pressable>

              {/* Option 2: Drawing Canvas */}
              <Pressable 
                onPress={() => {
                  setIsBottomSheetVisible(false);
                  setIsDrawingCanvasVisible(true);
                }} 
                style={({ pressed }) => [
                  styles.bottomSheetItem,
                  { backgroundColor: pressed ? theme.overlay : 'transparent' }
                ]}
              >
                <View style={[styles.bottomSheetItemIconContainer, { backgroundColor: '#E1BEE7' }]}>
                  <Ionicons name="brush" size={20} color="#7B1FA2" />
                </View>
                <Text style={styles.bottomSheetItemText}>Add Drawing</Text>
              </Pressable>

              {/* Option 3: Voice Note */}
              <Pressable 
                onPress={() => {
                  setIsBottomSheetVisible(false);
                  setIsRecordingModalVisible(true);
                }} 
                style={({ pressed }) => [
                  styles.bottomSheetItem,
                  { backgroundColor: pressed ? theme.overlay : 'transparent' }
                ]}
              >
                <View style={[styles.bottomSheetItemIconContainer, { backgroundColor: '#FFCDD2' }]}>
                  <Ionicons name="mic" size={20} color="#D32F2F" />
                </View>
                <Text style={styles.bottomSheetItemText}>Record Audio</Text>
              </Pressable>

              {/* Option 4: Checklist */}
              <Pressable 
                onPress={noteType === 'checklist' ? handleSwitchToText : handleSwitchToChecklist} 
                style={({ pressed }) => [
                  styles.bottomSheetItem,
                  { backgroundColor: pressed ? theme.overlay : 'transparent' }
                ]}
              >
                <View style={[styles.bottomSheetItemIconContainer, { backgroundColor: '#C8E6C9' }]}>
                  <Ionicons 
                    name={noteType === 'checklist' ? "document-text" : "checkbox"} 
                    size={20} 
                    color="#388E3C" 
                  />
                </View>
                <Text style={styles.bottomSheetItemText}>
                  {noteType === 'checklist' ? 'Convert to Text' : 'Add Checklist'}
                </Text>
              </Pressable>
            </View>
          </Pressable>
        </Pressable>
      </Modal>

      <DrawingCanvas
        visible={isDrawingCanvasVisible}
        onClose={() => setIsDrawingCanvasVisible(false)}
        onSave={handleSaveDrawing}
        theme={theme}
      />

      {/* Audio Recorder Modal */}
      <Modal
        visible={isRecordingModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={cancelRecording}
      >
        <Pressable style={styles.bottomSheetOverlay} onPress={cancelRecording}>
          <Pressable style={[styles.bottomSheetContainer, { alignItems: 'center', paddingVertical: 30 }]} onPress={() => {}}>
            <View style={styles.bottomSheetHandle} />
            <Text style={styles.bottomSheetTitle}>Voice Recorder</Text>
            
            <Text style={{ fontSize: 42, fontWeight: '900', color: theme.text, marginVertical: 20 }}>
              {Math.floor(recordDuration / 60).toString().padStart(2, '0')}:{(recordDuration % 60).toString().padStart(2, '0')}
            </Text>
            
            <Text style={{ fontSize: 14, color: theme.mutedText, marginBottom: 30 }}>
              {isRecording ? 'Recording is active... 🎙️' : 'Tap mic to start recording'}
            </Text>
            
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 40, marginBottom: 10 }}>
              <Pressable onPress={cancelRecording} style={{ padding: 10 }}>
                <Text style={{ color: theme.danger, fontWeight: '700', fontSize: 16 }}>Cancel</Text>
              </Pressable>
              
              <Pressable 
                onPress={isRecording ? () => stopRecording(true) : startRecording} 
                style={({ pressed }) => [
                  {
                    width: 76,
                    height: 76,
                    borderRadius: 38,
                    backgroundColor: isRecording ? '#EF4444' : theme.primary,
                    alignItems: 'center',
                    justifyContent: 'center',
                    elevation: 5,
                  },
                  pressed && { scale: 0.95 }
                ]}
              >
                <Ionicons name={isRecording ? "stop" : "mic"} size={36} color="#FFFFFF" />
              </Pressable>
              
              <View style={{ width: 50 }} />
            </View>
          </Pressable>
        </Pressable>
      </Modal>

      {/* Full Screen Image Viewer Modal */}
      <Modal
        visible={!!viewerImageUri}
        transparent={true}
        onRequestClose={() => setViewerImageUri(null)}
        animationType="fade"
      >
        <Pressable 
          style={{
            flex: 1,
            backgroundColor: 'rgba(0,0,0,0.95)',
            justifyContent: 'center',
            alignItems: 'center',
          }}
          onPress={() => setViewerImageUri(null)}
        >
          <Pressable 
            onPress={() => setViewerImageUri(null)} 
            style={{
              position: 'absolute',
              top: Platform.OS === 'ios' ? 60 : 30,
              right: 20,
              zIndex: 10,
              padding: 10,
              backgroundColor: 'rgba(255,255,255,0.2)',
              borderRadius: 20,
            }}
          >
            <Ionicons name="close" size={24} color="#FFFFFF" />
          </Pressable>

          {viewerImageUri && (
            <Image 
              source={{ uri: viewerImageUri }} 
              style={{
                width: '95%',
                height: '80%',
                resizeMode: 'contain',
              }}
            />
          )}
        </Pressable>
      </Modal>
    </KeyboardAvoidingView>
  );
}
