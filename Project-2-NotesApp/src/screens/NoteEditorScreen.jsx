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

export default function NoteEditorScreen({ onSave, onBack, theme, noteToEdit, folders = [] }) {
  const { height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const [folderId, setFolderId] = useState(noteToEdit ? noteToEdit.folderId : null);
  const [title, setTitle] = useState(noteToEdit ? noteToEdit.title : '');
  const [body, setBody] = useState(noteToEdit ? (noteToEdit.noteType === 'text' ? noteToEdit.content : '') : '');
  const [status, setStatus] = useState('');
  const scrollViewRef = useRef(null);
  const descriptionScrollViewRef = useRef(null);

  // New Media, Checklist & Template states
  const [noteType, setNoteType] = useState(noteToEdit ? noteToEdit.noteType : 'text'); // 'text', 'checklist', or 'template'
  const [templateType, setTemplateType] = useState(noteToEdit ? noteToEdit.templateType : null);
  const [templateData, setTemplateData] = useState(noteToEdit ? (noteToEdit.templateData || {}) : {});
  const [isTemplateModalVisible, setIsTemplateModalVisible] = useState(false);

  const [checklist, setChecklist] = useState(noteToEdit ? (noteToEdit.checklist || []) : []);
  const [images, setImages] = useState(noteToEdit ? (noteToEdit.images || []) : []);
  const [drawings, setDrawings] = useState(noteToEdit ? (noteToEdit.drawings || []) : []);
  const [audio, setAudio] = useState(noteToEdit ? (noteToEdit.audio || []) : []);
  const [isBottomSheetVisible, setIsBottomSheetVisible] = useState(false);
  const [isDrawingCanvasVisible, setIsDrawingCanvasVisible] = useState(false);
  const [editingDrawingIndex, setEditingDrawingIndex] = useState(null);
  const [viewerImageUri, setViewerImageUri] = useState(null);

  const DEFAULT_TEMPLATE_DATA = {
    nutrition: {
      schedule: { "08:00": "", "10:00": "", "12:00": "", "14:00": "", "16:00": "", "18:00": "", "20:00": "", "22:00": "" },
      meals: { breakfast: "", lunch: "", dinner: "", snack: "" },
      priorities: "",
      notes: "",
      productivity: 3
    },
    wellness: {
      mood: "calm",
      morningHabits: [
        { id: "h1", text: "Drink Water", checked: false },
        { id: "h2", text: "Meditation", checked: false },
        { id: "h3", text: "Stretching", checked: false },
      ],
      gratitude: ["", "", ""],
      affirmations: "",
      goals: "",
      sleepHours: 7,
      productivity: 3
    },
    minimal: {
      focus: "",
      todo: [
        { id: "t1", text: "Routine task 1", checked: false },
        { id: "t2", text: "Routine task 2", checked: false },
      ],
      schedule: { "08:00": "", "11:00": "", "14:00": "", "17:00": "", "20:00": "" },
      notes: ""
    },
    cute: {
      focus: "",
      afternoonSchedule: [
        { id: "a1", text: "Lunch break", checked: false },
        { id: "a2", text: "Read / study", checked: false },
      ],
      goals: [
        { id: "g1", text: "Primary goal", checked: false },
      ],
      notes: ""
    },
    habits: {
      health: [
        { id: "ha1", text: "Drink 3L Water", checked: false },
        { id: "ha2", text: "Eat Clean", checked: false },
      ],
      work: [
        { id: "wa1", text: "Clear Inbox", checked: false },
        { id: "wa2", text: "Organize Desk", checked: false },
      ],
      selfcare: [
        { id: "sa1", text: "Read 10 pages", checked: false },
        { id: "sa2", text: "No screens before bed", checked: false },
      ]
    }
  };

  const handleSelectTemplate = (type) => {
    setNoteType('template');
    setTemplateType(type);
    setTemplateData(JSON.parse(JSON.stringify(DEFAULT_TEMPLATE_DATA[type])));
    setIsTemplateModalVisible(false);
    
    // Auto category to Daily Routine if routine folder exists
    const routineFolder = folders.find(f => f.isRoutine);
    if (routineFolder) {
      setFolderId(routineFolder.id);
    }
  };

  const updateTemplateField = (section, key, value) => {
    setTemplateData(prev => {
      const updated = { ...prev };
      if (key !== null && section !== null) {
        updated[section] = { ...updated[section], [key]: value };
      } else if (section !== null) {
        updated[section] = value;
      }
      return updated;
    });
  };

  const toggleTemplateListItem = (section, itemId) => {
    setTemplateData(prev => {
      const updated = { ...prev };
      updated[section] = updated[section].map(item => 
        item.id === itemId ? { ...item, checked: !item.checked } : item
      );
      return updated;
    });
  };

  const updateTemplateListItemText = (section, itemId, text) => {
    setTemplateData(prev => {
      const updated = { ...prev };
      updated[section] = updated[section].map(item => 
        item.id === itemId ? { ...item, text } : item
      );
      return updated;
    });
  };

  const addTemplateListItem = (section, defaultText = "") => {
    setTemplateData(prev => {
      const updated = { ...prev };
      updated[section] = [
        ...updated[section],
        { id: `${section}_${Date.now()}`, text: defaultText, checked: false }
      ];
      return updated;
    });
  };

  const removeTemplateListItem = (section, itemId) => {
    setTemplateData(prev => {
      const updated = { ...prev };
      updated[section] = updated[section].filter(item => item.id !== itemId);
      return updated;
    });
  };

  const handleSaveDrawing = (newDrawingLines) => {
    if (editingDrawingIndex !== null) {
      setDrawings((prev) =>
        prev.map((d, i) => (i === editingDrawingIndex ? { lines: newDrawingLines } : d))
      );
      setEditingDrawingIndex(null);
    } else {
      setDrawings((prev) => [...prev, { lines: newDrawingLines }]);
    }
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
        folderSelectRow: {
          flexDirection: 'row',
          alignItems: 'center',
          gap: 10,
          marginBottom: 16,
          paddingBottom: 10,
          borderBottomWidth: 1,
          borderBottomColor: theme.border,
        },
        folderSelectLabel: {
          fontSize: 13,
          fontWeight: '700',
        },
        folderTag: {
          flexDirection: 'row',
          alignItems: 'center',
          gap: 4,
          paddingVertical: 6,
          paddingHorizontal: 12,
          borderRadius: 20,
          borderWidth: 1.5,
          borderColor: theme.border,
          backgroundColor: 'transparent',
        },
        folderTagText: {
          fontSize: 12,
          fontWeight: '700',
          color: theme.text,
        },
        templateContainer: {
          padding: 16,
          borderRadius: 24,
          borderWidth: 2,
          marginBottom: 16,
        },
        templateSectionHeader: {
          fontSize: 16,
          fontWeight: '900',
          marginTop: 15,
          marginBottom: 8,
        },
        templateInputUnderline: {
          borderBottomWidth: 1.5,
          paddingVertical: 8,
          fontSize: 15,
          fontWeight: '600',
        },
        templateGridTwoColumn: {
          flexDirection: 'row',
          gap: 12,
          marginVertical: 4,
        },
        templateGridCell: {
          flex: 1,
        },
        templateGridLabel: {
          fontSize: 13,
          fontWeight: '700',
          marginBottom: 4,
        },
        templateInputBox: {
          borderWidth: 1.5,
          borderRadius: 12,
          paddingHorizontal: 12,
          paddingVertical: 8,
          fontSize: 14,
          fontWeight: '600',
        },
        templateInputBoxMultiline: {
          borderWidth: 1.5,
          borderRadius: 12,
          paddingHorizontal: 12,
          paddingVertical: 10,
          fontSize: 14,
          fontWeight: '600',
          height: 80,
          textAlignVertical: 'top',
        },
        templateTimelineRow: {
          flexDirection: 'row',
          alignItems: 'center',
          gap: 10,
          marginVertical: 6,
        },
        templateTimelineTime: {
          fontSize: 14,
          fontWeight: '800',
          width: 50,
        },
        templateTimelineInput: {
          flex: 1,
          borderBottomWidth: 1.5,
          paddingVertical: 6,
          fontSize: 14,
          fontWeight: '600',
        },
        templateStarsRow: {
          flexDirection: 'row',
          gap: 6,
          marginVertical: 8,
        },
        templateMoodRow: {
          flexDirection: 'row',
          justifyContent: 'space-between',
          marginVertical: 8,
        },
        templateMoodBubble: {
          alignItems: 'center',
          justifyContent: 'center',
          paddingVertical: 10,
          paddingHorizontal: 12,
          borderRadius: 16,
          backgroundColor: '#FFFFFF',
          elevation: 2,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.05,
          shadowRadius: 4,
          width: '22%',
        },
        templateMoodText: {
          fontSize: 11,
          fontWeight: '800',
          marginTop: 4,
        },
        templateListItemRow: {
          flexDirection: 'row',
          alignItems: 'center',
          gap: 10,
          marginVertical: 4,
        },
        templateListItemInput: {
          flex: 1,
          fontSize: 14,
          fontWeight: '600',
          paddingVertical: 6,
        },
        templateAddListItemBtn: {
          flexDirection: 'row',
          alignItems: 'center',
          gap: 6,
          paddingVertical: 8,
          paddingHorizontal: 14,
          borderRadius: 10,
          borderWidth: 1.5,
          borderStyle: 'dashed',
          justifyContent: 'center',
          marginTop: 8,
          borderColor: theme.border,
        },
        templateCardOption: {
          flexDirection: 'row',
          alignItems: 'center',
          gap: 14,
          padding: 16,
          borderRadius: 18,
          borderWidth: 2,
        },
        templateCardIconCircle: {
          width: 48,
          height: 48,
          borderRadius: 24,
          backgroundColor: '#FFFFFF',
          alignItems: 'center',
          justifyContent: 'center',
          elevation: 2,
        },
        templateCardTitle: {
          fontSize: 15,
          fontWeight: '800',
          marginBottom: 4,
        },
        templateCardDesc: {
          fontSize: 11,
          fontWeight: '500',
          lineHeight: 15,
        },
      }),
    [theme, height, insets]
  );

  const generateTemplateSummary = (type, data) => {
    if (type === 'nutrition') {
      const mealSum = `Meals: B: ${data.meals?.breakfast || '-'}, L: ${data.meals?.lunch || '-'}, D: ${data.meals?.dinner || '-'}`;
      const prioritySum = data.priorities ? `Priorities: ${data.priorities}` : '';
      return `${mealSum}\n${prioritySum}\nProductivity: ${'⭐'.repeat(data.productivity || 0)}`;
    }
    if (type === 'wellness') {
      const moodSum = `Mood: ${data.mood?.toUpperCase() || '-'}`;
      const sleepSum = `Sleep: ${data.sleepHours || 0} hours`;
      const grats = (data.gratitude || []).filter(g => g.trim() !== '').map(g => `- ${g}`).join('\n');
      return `${moodSum} | ${sleepSum}\n${grats ? 'Gratitude:\n' + grats : ''}`;
    }
    if (type === 'minimal') {
      return `Focus: ${data.focus || '-'}\nSchedule and Todo checklist`;
    }
    if (type === 'cute') {
      return `Focus: ${data.focus || '-'}\nCute organizer schedule and goals`;
    }
    if (type === 'habits') {
      const healthDone = (data.health || []).filter(h => h.checked).length;
      const workDone = (data.work || []).filter(w => w.checked).length;
      const selfDone = (data.selfcare || []).filter(s => s.checked).length;
      return `Habits tracker progress:\nHealth: ${healthDone}/${data.health?.length || 0}\nWork: ${workDone}/${data.work?.length || 0}\nSelf-care: ${selfDone}/${data.selfcare?.length || 0}`;
    }
    return '';
  };

  const renderTemplateEditorForm = () => {
    if (templateType === 'nutrition') {
      return (
        <View style={[styles.templateContainer, { backgroundColor: '#E3F2FD', borderColor: '#90CAF9' }]}>
          {/* Priorities */}
          <Text style={[styles.templateSectionHeader, { color: '#0D47A1' }]}>Key Priorities</Text>
          <TextInput
            value={templateData.priorities}
            onChangeText={(txt) => updateTemplateField('priorities', null, txt)}
            placeholder="Focus of the day..."
            placeholderTextColor="#78909C"
            style={[styles.templateInputUnderline, { borderBottomColor: '#90CAF9', color: '#1C1C1C' }]}
          />

          {/* Meals */}
          <Text style={[styles.templateSectionHeader, { color: '#0D47A1' }]}>Meal Logger</Text>
          <View style={styles.templateGridTwoColumn}>
            <View style={styles.templateGridCell}>
              <Text style={[styles.templateGridLabel, { color: '#1A237E' }]}>Breakfast</Text>
              <TextInput
                value={templateData.meals?.breakfast}
                onChangeText={(txt) => updateTemplateField('meals', 'breakfast', txt)}
                placeholder="What did you eat?"
                placeholderTextColor="#78909C"
                style={[styles.templateInputBox, { borderColor: '#90CAF9', color: '#1C1C1C' }]}
              />
            </View>
            <View style={styles.templateGridCell}>
              <Text style={[styles.templateGridLabel, { color: '#1A237E' }]}>Lunch</Text>
              <TextInput
                value={templateData.meals?.lunch}
                onChangeText={(txt) => updateTemplateField('meals', 'lunch', txt)}
                placeholder="What did you eat?"
                placeholderTextColor="#78909C"
                style={[styles.templateInputBox, { borderColor: '#90CAF9', color: '#1C1C1C' }]}
              />
            </View>
          </View>
          <View style={styles.templateGridTwoColumn}>
            <View style={styles.templateGridCell}>
              <Text style={[styles.templateGridLabel, { color: '#1A237E' }]}>Dinner</Text>
              <TextInput
                value={templateData.meals?.dinner}
                onChangeText={(txt) => updateTemplateField('meals', 'dinner', txt)}
                placeholder="What did you eat?"
                placeholderTextColor="#78909C"
                style={[styles.templateInputBox, { borderColor: '#90CAF9', color: '#1C1C1C' }]}
              />
            </View>
            <View style={styles.templateGridCell}>
              <Text style={[styles.templateGridLabel, { color: '#1A237E' }]}>Snacks</Text>
              <TextInput
                value={templateData.meals?.snack}
                onChangeText={(txt) => updateTemplateField('meals', 'snack', txt)}
                placeholder="Snacks details..."
                placeholderTextColor="#78909C"
                style={[styles.templateInputBox, { borderColor: '#90CAF9', color: '#1C1C1C' }]}
              />
            </View>
          </View>

          {/* Hourly Timeline */}
          <Text style={[styles.templateSectionHeader, { color: '#0D47A1' }]}>Schedule Timeline</Text>
          {Object.keys(templateData.schedule || {}).sort().map(time => (
            <View key={time} style={styles.templateTimelineRow}>
              <Text style={[styles.templateTimelineTime, { color: '#1A237E' }]}>{time}</Text>
              <TextInput
                value={templateData.schedule[time]}
                onChangeText={(txt) => {
                  const updatedSchedule = { ...templateData.schedule, [time]: txt };
                  updateTemplateField('schedule', null, updatedSchedule);
                }}
                placeholder="Schedule task..."
                placeholderTextColor="#90A4AE"
                style={[styles.templateTimelineInput, { borderBottomColor: '#90CAF9', color: '#1C1C1C' }]}
              />
            </View>
          ))}

          {/* Productivity rating */}
          <Text style={[styles.templateSectionHeader, { color: '#0D47A1' }]}>Productivity Score</Text>
          <View style={styles.templateStarsRow}>
            {[1, 2, 3, 4, 5].map(star => (
              <Pressable 
                key={star} 
                onPress={() => updateTemplateField('productivity', null, star)}
                style={{ padding: 4 }}
              >
                <Ionicons 
                  name={star <= (templateData.productivity || 0) ? "star" : "star-outline"} 
                  size={28} 
                  color="#FFB300" 
                />
              </Pressable>
            ))}
          </View>

          {/* Notes */}
          <Text style={[styles.templateSectionHeader, { color: '#0D47A1' }]}>Thoughts & Notes</Text>
          <TextInput
            value={templateData.notes}
            onChangeText={(txt) => updateTemplateField('notes', null, txt)}
            placeholder="Write down general thoughts..."
            placeholderTextColor="#78909C"
            style={[styles.templateInputBoxMultiline, { borderColor: '#90CAF9', color: '#1C1C1C' }]}
            multiline
            numberOfLines={3}
          />
        </View>
      );
    }

    if (templateType === 'wellness') {
      return (
        <View style={[styles.templateContainer, { backgroundColor: '#FCE4EC', borderColor: '#F48FB1' }]}>
          {/* Mood Selector */}
          <Text style={[styles.templateSectionHeader, { color: '#880E4F' }]}>Today's Mood</Text>
          <View style={styles.templateMoodRow}>
            {[
              { id: 'calm', icon: '🧘', label: 'Calm' },
              { id: 'happy', icon: '😊', label: 'Happy' },
              { id: 'tired', icon: '😴', label: 'Tired' },
              { id: 'sad', icon: '😢', label: 'Sad' },
            ].map(m => {
              const isSelected = templateData.mood === m.id;
              return (
                <Pressable
                  key={m.id}
                  onPress={() => updateTemplateField('mood', null, m.id)}
                  style={[
                    styles.templateMoodBubble,
                    isSelected && { backgroundColor: '#F48FB1', transform: [{ scale: 1.15 }] }
                  ]}
                >
                  <Text style={{ fontSize: 24 }}>{m.icon}</Text>
                  <Text style={[styles.templateMoodText, { color: isSelected ? '#FFFFFF' : '#880E4F' }]}>{m.label}</Text>
                </Pressable>
              );
            })}
          </View>

          {/* Sleep and Stars */}
          <View style={styles.templateGridTwoColumn}>
            <View style={styles.templateGridCell}>
              <Text style={[styles.templateSectionHeader, { color: '#880E4F', marginBottom: 4 }]}>Sleep (Hours)</Text>
              <TextInput
                value={String(templateData.sleepHours || '')}
                onChangeText={(txt) => {
                  const val = parseInt(txt) || 0;
                  updateTemplateField('sleepHours', null, val);
                }}
                keyboardType="numeric"
                placeholder="7"
                placeholderTextColor="#F48FB1"
                style={[styles.templateInputBox, { borderColor: '#F48FB1', color: '#1C1C1C' }]}
              />
            </View>
            <View style={styles.templateGridCell}>
              <Text style={[styles.templateSectionHeader, { color: '#880E4F', marginBottom: 4 }]}>Mindfulness Score</Text>
              <View style={styles.templateStarsRow}>
                {[1, 2, 3, 4, 5].map(star => (
                  <Pressable 
                    key={star} 
                    onPress={() => updateTemplateField('productivity', null, star)}
                    style={{ padding: 2 }}
                  >
                    <Ionicons 
                      name={star <= (templateData.productivity || 0) ? "star" : "star-outline"} 
                      size={20} 
                      color="#EC407A" 
                    />
                  </Pressable>
                ))}
              </View>
            </View>
          </View>

          {/* Morning habits checklist */}
          <Text style={[styles.templateSectionHeader, { color: '#880E4F' }]}>Habits Checklist</Text>
          {(templateData.morningHabits || []).map(item => (
            <View key={item.id} style={styles.templateListItemRow}>
              <Pressable onPress={() => toggleTemplateListItem('morningHabits', item.id)} style={{ padding: 4 }}>
                <Ionicons 
                  name={item.checked ? "checkbox" : "square-outline"} 
                  size={20} 
                  color="#D81B60" 
                />
              </Pressable>
              <TextInput
                value={item.text}
                onChangeText={(txt) => updateTemplateListItemText('morningHabits', item.id, txt)}
                placeholder="Habit text..."
                placeholderTextColor="#F48FB1"
                style={[styles.templateListItemInput, { color: '#1C1C1C' }, item.checked && { textDecorationLine: 'line-through', opacity: 0.6 }]}
              />
              <Pressable onPress={() => removeTemplateListItem('morningHabits', item.id)} style={{ padding: 4 }}>
                <Ionicons name="close" size={16} color="#EC407A" />
              </Pressable>
            </View>
          ))}
          <Pressable 
            onPress={() => addTemplateListItem('morningHabits', "New Habit")}
            style={[styles.templateAddListItemBtn, { borderColor: '#F48FB1' }]}
          >
            <Ionicons name="add" size={16} color="#D81B60" />
            <Text style={{ color: '#D81B60', fontSize: 13, fontWeight: '700' }}>Add Habit</Text>
          </Pressable>

          {/* Gratitude bullets */}
          <Text style={[styles.templateSectionHeader, { color: '#880E4F', marginTop: 15 }]}>I am Grateful For...</Text>
          {(templateData.gratitude || []).map((grat, index) => (
            <View key={index} style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginVertical: 4 }}>
              <Text style={{ fontSize: 14, color: '#D81B60', fontWeight: '800' }}>{index + 1}.</Text>
              <TextInput
                value={grat}
                onChangeText={(txt) => {
                  const updatedGrat = [...templateData.gratitude];
                  updatedGrat[index] = txt;
                  updateTemplateField('gratitude', null, updatedGrat);
                }}
                placeholder="Something wonderful..."
                placeholderTextColor="#F48FB1"
                style={[styles.templateInputUnderline, { borderBottomColor: '#F48FB1', color: '#1C1C1C' }]}
              />
            </View>
          ))}

          {/* Affirmation & Goals */}
          <Text style={[styles.templateSectionHeader, { color: '#880E4F', marginTop: 15 }]}>Daily Affirmations</Text>
          <TextInput
            value={templateData.affirmations}
            onChangeText={(txt) => updateTemplateField('affirmations', null, txt)}
            placeholder="I am strong, I am focused..."
            placeholderTextColor="#F48FB1"
            style={[styles.templateInputBoxMultiline, { borderColor: '#F48FB1', color: '#1C1C1C' }]}
            multiline
            numberOfLines={2}
          />
        </View>
      );
    }

    if (templateType === 'minimal') {
      return (
        <View style={[styles.templateContainer, { backgroundColor: '#F9F6F0', borderColor: '#D7CCC8' }]}>
          {/* Today's Focus */}
          <Text style={[styles.templateSectionHeader, { color: '#3E2723' }]}>Today's Focus</Text>
          <TextInput
            value={templateData.focus}
            onChangeText={(txt) => updateTemplateField('focus', null, txt)}
            placeholder="Write main focus..."
            placeholderTextColor="#8D6E63"
            style={[styles.templateInputUnderline, { borderBottomColor: '#A1887F', color: '#1C1C1C' }]}
          />

          {/* Todo checklist */}
          <Text style={[styles.templateSectionHeader, { color: '#3E2723', marginTop: 15 }]}>To-Do Tasks</Text>
          {(templateData.todo || []).map(item => (
            <View key={item.id} style={styles.templateListItemRow}>
              <Pressable onPress={() => toggleTemplateListItem('todo', item.id)} style={{ padding: 4 }}>
                <Ionicons 
                  name={item.checked ? "checkbox" : "square-outline"} 
                  size={20} 
                  color="#5D4037" 
                />
              </Pressable>
              <TextInput
                value={item.text}
                onChangeText={(txt) => updateTemplateListItemText('todo', item.id, txt)}
                placeholder="Todo item..."
                placeholderTextColor="#8D6E63"
                style={[styles.templateListItemInput, { color: '#1C1C1C' }, item.checked && { textDecorationLine: 'line-through', opacity: 0.6 }]}
              />
              <Pressable onPress={() => removeTemplateListItem('todo', item.id)} style={{ padding: 4 }}>
                <Ionicons name="close" size={16} color="#8D6E63" />
              </Pressable>
            </View>
          ))}
          <Pressable 
            onPress={() => addTemplateListItem('todo', "New Task")}
            style={[styles.templateAddListItemBtn, { borderColor: '#A1887F' }]}
          >
            <Ionicons name="add" size={16} color="#5D4037" />
            <Text style={{ color: '#5D4037', fontSize: 13, fontWeight: '700' }}>Add Task</Text>
          </Pressable>

          {/* Schedule */}
          <Text style={[styles.templateSectionHeader, { color: '#3E2723', marginTop: 15 }]}>Timeline</Text>
          {Object.keys(templateData.schedule || {}).sort().map(time => (
            <View key={time} style={styles.templateTimelineRow}>
              <Text style={[styles.templateTimelineTime, { color: '#5D4037' }]}>{time}</Text>
              <TextInput
                value={templateData.schedule[time]}
                onChangeText={(txt) => {
                  const updatedSchedule = { ...templateData.schedule, [time]: txt };
                  updateTemplateField('schedule', null, updatedSchedule);
                }}
                placeholder="Schedule task..."
                placeholderTextColor="#8D6E63"
                style={[styles.templateTimelineInput, { borderBottomColor: '#D7CCC8', color: '#1C1C1C' }]}
              />
            </View>
          ))}

          {/* Notes */}
          <Text style={[styles.templateSectionHeader, { color: '#3E2723', marginTop: 15 }]}>General Notes</Text>
          <TextInput
            value={templateData.notes}
            onChangeText={(txt) => updateTemplateField('notes', null, txt)}
            placeholder="Any other details..."
            placeholderTextColor="#8D6E63"
            style={[styles.templateInputBoxMultiline, { borderColor: '#D7CCC8', color: '#1C1C1C' }]}
            multiline
            numberOfLines={3}
          />
        </View>
      );
    }

    if (templateType === 'cute') {
      return (
        <View style={[styles.templateContainer, { backgroundColor: '#FFFDE7', borderColor: '#FFF59D' }]}>
          {/* Focus */}
          <Text style={[styles.templateSectionHeader, { color: '#F57F17' }]}>⭐ Daily Focus</Text>
          <TextInput
            value={templateData.focus}
            onChangeText={(txt) => updateTemplateField('focus', null, txt)}
            placeholder="Today's star goal..."
            placeholderTextColor="#FBC02D"
            style={[styles.templateInputUnderline, { borderBottomColor: '#FBC02D', color: '#1C1C1C' }]}
          />

          {/* Goals */}
          <Text style={[styles.templateSectionHeader, { color: '#F57F17', marginTop: 15 }]}>🌿 Main Goals</Text>
          {(templateData.goals || []).map(item => (
            <View key={item.id} style={styles.templateListItemRow}>
              <Pressable onPress={() => toggleTemplateListItem('goals', item.id)} style={{ padding: 4 }}>
                <Ionicons 
                  name={item.checked ? "checkbox" : "square-outline"} 
                  size={20} 
                  color="#FBC02D" 
                />
              </Pressable>
              <TextInput
                value={item.text}
                onChangeText={(txt) => updateTemplateListItemText('goals', item.id, txt)}
                placeholder="Goal item..."
                placeholderTextColor="#FBC02D"
                style={[styles.templateListItemInput, { color: '#1C1C1C' }, item.checked && { textDecorationLine: 'line-through', opacity: 0.6 }]}
              />
              <Pressable onPress={() => removeTemplateListItem('goals', item.id)} style={{ padding: 4 }}>
                <Ionicons name="close" size={16} color="#FBC02D" />
              </Pressable>
            </View>
          ))}
          <Pressable 
            onPress={() => addTemplateListItem('goals', "New Goal")}
            style={[styles.templateAddListItemBtn, { borderColor: '#FFF59D' }]}
          >
            <Ionicons name="add" size={16} color="#F57F17" />
            <Text style={{ color: '#F57F17', fontSize: 13, fontWeight: '700' }}>Add Goal</Text>
          </Pressable>

          {/* Afternoon Schedule */}
          <Text style={[styles.templateSectionHeader, { color: '#F57F17', marginTop: 15 }]}>⛅ Afternoon Schedule</Text>
          {(templateData.afternoonSchedule || []).map(item => (
            <View key={item.id} style={styles.templateListItemRow}>
              <Pressable onPress={() => toggleTemplateListItem('afternoonSchedule', item.id)} style={{ padding: 4 }}>
                <Ionicons 
                  name={item.checked ? "checkbox" : "square-outline"} 
                  size={20} 
                  color="#FBC02D" 
                />
              </Pressable>
              <TextInput
                value={item.text}
                onChangeText={(txt) => updateTemplateListItemText('afternoonSchedule', item.id, txt)}
                placeholder="Schedule item..."
                placeholderTextColor="#FBC02D"
                style={[styles.templateListItemInput, { color: '#1C1C1C' }, item.checked && { textDecorationLine: 'line-through', opacity: 0.6 }]}
              />
              <Pressable onPress={() => removeTemplateListItem('afternoonSchedule', item.id)} style={{ padding: 4 }}>
                <Ionicons name="close" size={16} color="#FBC02D" />
              </Pressable>
            </View>
          ))}
          <Pressable 
            onPress={() => addTemplateListItem('afternoonSchedule', "New Task")}
            style={[styles.templateAddListItemBtn, { borderColor: '#FFF59D' }]}
          >
            <Ionicons name="add" size={16} color="#F57F17" />
            <Text style={{ color: '#F57F17', fontSize: 13, fontWeight: '700' }}>Add Task</Text>
          </Pressable>

          {/* Notes */}
          <Text style={[styles.templateSectionHeader, { color: '#F57F17', marginTop: 15 }]}>📝 Planner Notes</Text>
          <TextInput
            value={templateData.notes}
            onChangeText={(txt) => updateTemplateField('notes', null, txt)}
            placeholder="Jot down notes..."
            placeholderTextColor="#FBC02D"
            style={[styles.templateInputBoxMultiline, { borderColor: '#FFF59D', color: '#1C1C1C' }]}
            multiline
            numberOfLines={3}
          />
        </View>
      );
    }

    if (templateType === 'habits') {
      return (
        <View style={[styles.templateContainer, { backgroundColor: '#E8F5E9', borderColor: '#A5D6A7' }]}>
          {/* Health Habits */}
          <Text style={[styles.templateSectionHeader, { color: '#1B5E20' }]}>🥦 Health Habits</Text>
          {(templateData.health || []).map(item => (
            <View key={item.id} style={styles.templateListItemRow}>
              <Pressable onPress={() => toggleTemplateListItem('health', item.id)} style={{ padding: 4 }}>
                <Ionicons 
                  name={item.checked ? "checkbox" : "square-outline"} 
                  size={20} 
                  color="#2E7D32" 
                />
              </Pressable>
              <TextInput
                value={item.text}
                onChangeText={(txt) => updateTemplateListItemText('health', item.id, txt)}
                placeholder="Health habit..."
                placeholderTextColor="#A5D6A7"
                style={[styles.templateListItemInput, { color: '#1C1C1C' }, item.checked && { textDecorationLine: 'line-through', opacity: 0.6 }]}
              />
              <Pressable onPress={() => removeTemplateListItem('health', item.id)} style={{ padding: 4 }}>
                <Ionicons name="close" size={16} color="#A5D6A7" />
              </Pressable>
            </View>
          ))}
          <Pressable 
            onPress={() => addTemplateListItem('health', "New Health Habit")}
            style={[styles.templateAddListItemBtn, { borderColor: '#A5D6A7' }]}
          >
            <Ionicons name="add" size={16} color="#2E7D32" />
            <Text style={{ color: '#2E7D32', fontSize: 13, fontWeight: '700' }}>Add Habit</Text>
          </Pressable>

          {/* Work Habits */}
          <Text style={[styles.templateSectionHeader, { color: '#1B5E20', marginTop: 15 }]}>💼 Work / Study habits</Text>
          {(templateData.work || []).map(item => (
            <View key={item.id} style={styles.templateListItemRow}>
              <Pressable onPress={() => toggleTemplateListItem('work', item.id)} style={{ padding: 4 }}>
                <Ionicons 
                  name={item.checked ? "checkbox" : "square-outline"} 
                  size={20} 
                  color="#2E7D32" 
                />
              </Pressable>
              <TextInput
                value={item.text}
                onChangeText={(txt) => updateTemplateListItemText('work', item.id, txt)}
                placeholder="Work habit..."
                placeholderTextColor="#A5D6A7"
                style={[styles.templateListItemInput, { color: '#1C1C1C' }, item.checked && { textDecorationLine: 'line-through', opacity: 0.6 }]}
              />
              <Pressable onPress={() => removeTemplateListItem('work', item.id)} style={{ padding: 4 }}>
                <Ionicons name="close" size={16} color="#A5D6A7" />
              </Pressable>
            </View>
          ))}
          <Pressable 
            onPress={() => addTemplateListItem('work', "New Work Habit")}
            style={[styles.templateAddListItemBtn, { borderColor: '#A5D6A7' }]}
          >
            <Ionicons name="add" size={16} color="#2E7D32" />
            <Text style={{ color: '#2E7D32', fontSize: 13, fontWeight: '700' }}>Add Habit</Text>
          </Pressable>

          {/* Self care */}
          <Text style={[styles.templateSectionHeader, { color: '#1B5E20', marginTop: 15 }]}>✨ Self-Care habits</Text>
          {(templateData.selfcare || []).map(item => (
            <View key={item.id} style={styles.templateListItemRow}>
              <Pressable onPress={() => toggleTemplateListItem('selfcare', item.id)} style={{ padding: 4 }}>
                <Ionicons 
                  name={item.checked ? "checkbox" : "square-outline"} 
                  size={20} 
                  color="#2E7D32" 
                />
              </Pressable>
              <TextInput
                value={item.text}
                onChangeText={(txt) => updateTemplateListItemText('selfcare', item.id, txt)}
                placeholder="Self-care habit..."
                placeholderTextColor="#A5D6A7"
                style={[styles.templateListItemInput, { color: '#1C1C1C' }, item.checked && { textDecorationLine: 'line-through', opacity: 0.6 }]}
              />
              <Pressable onPress={() => removeTemplateListItem('selfcare', item.id)} style={{ padding: 4 }}>
                <Ionicons name="close" size={16} color="#A5D6A7" />
              </Pressable>
            </View>
          ))}
          <Pressable 
            onPress={() => addTemplateListItem('selfcare', "New Self-Care Habit")}
            style={[styles.templateAddListItemBtn, { borderColor: '#A5D6A7' }]}
          >
            <Ionicons name="add" size={16} color="#2E7D32" />
            <Text style={{ color: '#2E7D32', fontSize: 13, fontWeight: '700' }}>Add Habit</Text>
          </Pressable>
        </View>
      );
    }

    return null;
  };

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

          {/* Folder Tag Selector */}
          <View style={styles.folderSelectRow}>
            <Text style={[styles.folderSelectLabel, { color: theme.mutedText }]}>Category:</Text>
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ gap: 8, paddingVertical: 4 }}
            >
              <Pressable
                onPress={() => setFolderId(null)}
                style={[
                  styles.folderTag,
                  folderId === null && { backgroundColor: theme.primary, borderColor: theme.primary }
                ]}
              >
                <Text style={[
                  styles.folderTagText,
                  folderId === null && { color: '#FFFFFF' }
                ]}>Uncategorized</Text>
              </Pressable>
              {folders.map(folder => (
                <Pressable
                  key={folder.id}
                  onPress={() => setFolderId(folder.id)}
                  style={[
                    styles.folderTag,
                    folderId === folder.id && { backgroundColor: folder.color, borderColor: folder.color }
                  ]}
                >
                  <Ionicons 
                    name={folder.icon || 'folder-outline'} 
                    size={12} 
                    color={folderId === folder.id ? '#FFFFFF' : folder.color} 
                  />
                  <Text style={[
                    styles.folderTagText,
                    folderId === folder.id && { color: '#FFFFFF' }
                  ]}>{folder.name}</Text>
                </Pressable>
              ))}
            </ScrollView>
          </View>

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
                  <Pressable
                    onPress={() => {
                      setEditingDrawingIndex(idx);
                      setIsDrawingCanvasVisible(true);
                    }}
                    style={{ width: '100%', height: '100%' }}
                  >
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
                  </Pressable>
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
              {noteType === 'template' ? `${templateType.toUpperCase()} PLANNER` : (noteType === 'checklist' ? 'Checklist Items' : 'Description')}
            </Text>
          </View>
          
          {noteType === 'template' ? (
            <View style={{ flexGrow: 1, paddingBottom: 20 }}>
              {renderTemplateEditorForm()}
            </View>
          ) : noteType === 'checklist' ? (
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
            <View 
              style={{ 
                height: (images.length > 0 || drawings.length > 0 || audio.length > 0) ? 200 : 380, 
                marginTop: 8 
              }}
            >
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
                  style={[
                    styles.bodyInput, 
                    { minHeight: (images.length > 0 || drawings.length > 0 || audio.length > 0) ? 180 : 360 }
                  ]}
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
            const hasTemplateData = noteType === 'template' && templateType;
            if (title.trim() || body.trim() || hasChecklistItems || hasTemplateData) {
              onSave({ 
                title: title || (templateType ? `${templateType.charAt(0).toUpperCase() + templateType.slice(1)} Planner` : 'Untitled Note'), 
                content: noteType === 'template'
                  ? generateTemplateSummary(templateType, templateData)
                  : (noteType === 'checklist' 
                      ? checklist.map(item => `${item.checked ? '[x]' : '[ ]'} ${item.text}`).join('\n')
                      : body),
                noteType,
                templateType,
                templateData,
                folderId,
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

              {/* Option 5: Planner Templates */}
              <Pressable 
                onPress={() => {
                  setIsBottomSheetVisible(false);
                  setIsTemplateModalVisible(true);
                }} 
                style={({ pressed }) => [
                  styles.bottomSheetItem,
                  { backgroundColor: pressed ? theme.overlay : 'transparent' }
                ]}
              >
                <View style={[styles.bottomSheetItemIconContainer, { backgroundColor: '#E0F7FA' }]}>
                  <Ionicons name="calendar-outline" size={20} color="#00ACC1" />
                </View>
                <Text style={styles.bottomSheetItemText}>Planner Templates</Text>
              </Pressable>
            </View>
          </Pressable>
        </Pressable>
      </Modal>

      <DrawingCanvas
        key={editingDrawingIndex !== null ? `edit-drawing-${editingDrawingIndex}` : 'new-drawing'}
        visible={isDrawingCanvasVisible}
        onClose={() => {
          setIsDrawingCanvasVisible(false);
          setEditingDrawingIndex(null);
        }}
        onSave={handleSaveDrawing}
        theme={theme}
        initialLines={editingDrawingIndex !== null ? drawings[editingDrawingIndex]?.lines : []}
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

      {/* Template Browser Modal */}
      <Modal
        visible={isTemplateModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setIsTemplateModalVisible(false)}
      >
        <Pressable 
          style={styles.bottomSheetOverlay} 
          onPress={() => setIsTemplateModalVisible(false)}
        >
          <Pressable 
            style={[styles.bottomSheetContainer, { maxHeight: '80%' }]} 
            onPress={() => {}}
          >
            <View style={styles.bottomSheetHandle} />
            <Text style={styles.bottomSheetTitle}>Select Planner Template</Text>
            
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ gap: 16, paddingBottom: 30 }}>
              
              {/* Template 1: Nutrition */}
              <Pressable 
                onPress={() => handleSelectTemplate('nutrition')}
                style={({ pressed }) => [
                  styles.templateCardOption,
                  { borderColor: '#90CAF9', backgroundColor: '#E3F2FD' },
                  pressed && { opacity: 0.8 }
                ]}
              >
                <View style={styles.templateCardIconCircle}>
                  <Ionicons name="restaurant-outline" size={24} color="#1E88E5" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.templateCardTitle, { color: '#0D47A1' }]}>Schedule & Nutrition</Text>
                  <Text style={[styles.templateCardDesc, { color: '#1565C0' }]}>
                    Hourly schedule list, meal trackers (breakfast, lunch, dinner) & productivity stars.
                  </Text>
                </View>
              </Pressable>

              {/* Template 2: Wellness */}
              <Pressable 
                onPress={() => handleSelectTemplate('wellness')}
                style={({ pressed }) => [
                  styles.templateCardOption,
                  { borderColor: '#F48FB1', backgroundColor: '#FCE4EC' },
                  pressed && { opacity: 0.8 }
                ]}
              >
                <View style={styles.templateCardIconCircle}>
                  <Ionicons name="heart-outline" size={24} color="#D81B60" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.templateCardTitle, { color: '#880E4F' }]}>Mental Wellness & Gratitude</Text>
                  <Text style={[styles.templateCardDesc, { color: '#AD1457' }]}>
                    Mood logging emojis, sleep hours tracker, gratitude lists, and daily affirmations.
                  </Text>
                </View>
              </Pressable>

              {/* Template 3: Minimal */}
              <Pressable 
                onPress={() => handleSelectTemplate('minimal')}
                style={({ pressed }) => [
                  styles.templateCardOption,
                  { borderColor: '#D7CCC8', backgroundColor: '#F9F6F0' },
                  pressed && { opacity: 0.8 }
                ]}
              >
                <View style={styles.templateCardIconCircle}>
                  <Ionicons name="list-outline" size={24} color="#4E4E4E" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.templateCardTitle, { color: '#3E2723' }]}>Beige Minimalist Planner</Text>
                  <Text style={[styles.templateCardDesc, { color: '#5D4037' }]}>
                    Simple clean focus box, time-based tracker & essential to-do checkmarks.
                  </Text>
                </View>
              </Pressable>

              {/* Template 4: Cute */}
              <Pressable 
                onPress={() => handleSelectTemplate('cute')}
                style={({ pressed }) => [
                  styles.templateCardOption,
                  { borderColor: '#FFF59D', backgroundColor: '#FFFDE7' },
                  pressed && { opacity: 0.8 }
                ]}
              >
                <View style={styles.templateCardIconCircle}>
                  <Ionicons name="star-outline" size={24} color="#FBC02D" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.templateCardTitle, { color: '#F57F17' }]}>Cute Star Organizer</Text>
                  <Text style={[styles.templateCardDesc, { color: '#FBC02D' }]}>
                    Warm star theme planner, priorities, afternoon tasks, and main checklist goals.
                  </Text>
                </View>
              </Pressable>

              {/* Template 5: Habits */}
              <Pressable 
                onPress={() => handleSelectTemplate('habits')}
                style={({ pressed }) => [
                  styles.templateCardOption,
                  { borderColor: '#A5D6A7', backgroundColor: '#E8F5E9' },
                  pressed && { opacity: 0.8 }
                ]}
              >
                <View style={styles.templateCardIconCircle}>
                  <Ionicons name="checkmark-circle-outline" size={24} color="#2E7D32" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.templateCardTitle, { color: '#1B5E20' }]}>Habit Tracker Grid</Text>
                  <Text style={[styles.templateCardDesc, { color: '#2E7D32' }]}>
                    Multiple grouped habit checklists: Health, Work, and Self-Care grids.
                  </Text>
                </View>
              </Pressable>

            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>
    </KeyboardAvoidingView>
  );
}
