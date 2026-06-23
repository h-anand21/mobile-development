import React, { useMemo, useState, useEffect, useRef } from 'react';
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
  Animated,
  Switch,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Path, Circle, Rect, Text as SvgText } from 'react-native-svg';
import NoteCard from '../components/NoteCard';

const TABLE_TEMPLATES = [
  {
    id: 'gray',
    name: 'Classic Gray',
    headerBg: '#475569',
    headerText: '#FFFFFF',
    cellBg: '#FFFFFF',
    altCellBg: '#F8FAFC',
    borderColor: '#94A3B8'
  },
  {
    id: 'amber',
    name: 'Warm Amber',
    headerBg: '#D97706',
    headerText: '#FFFFFF',
    cellBg: '#FFFBEB',
    altCellBg: '#FEF3C7',
    borderColor: '#F59E0B'
  },
  {
    id: 'green',
    name: 'Forest Green',
    headerBg: '#059669',
    headerText: '#FFFFFF',
    cellBg: '#ECFDF5',
    altCellBg: '#D1FAE5',
    borderColor: '#10B981'
  },
  {
    id: 'blue',
    name: 'Ocean Blue',
    headerBg: '#2563EB',
    headerText: '#FFFFFF',
    cellBg: '#EFF6FF',
    altCellBg: '#DBEAFE',
    borderColor: '#3B82F6'
  },
  {
    id: 'lavender',
    name: 'Lavender',
    headerBg: '#7C3AED',
    headerText: '#FFFFFF',
    cellBg: '#F5F3FF',
    altCellBg: '#EDE9FE',
    borderColor: '#8B5CF6'
  }
];

let Audio = null;
try {
  Audio = require('expo-av').Audio;
} catch (error) {
  console.warn('Audio module not loaded:', error);
}

const getSafeRoutineArray = (routine) => {
  if (Array.isArray(routine)) {
    return routine.map((r, index) => ({
      id: r?.id || `r_${index}`,
      time: r?.time || '08:00',
      task: r?.task || '',
      checked: !!r?.checked
    }));
  }
  if (routine && typeof routine === 'object') {
    return Object.keys(routine).map((key, index) => ({
      id: routine[key]?.id || key || `r_${index}`,
      time: routine[key]?.time || '08:00',
      task: routine[key]?.task || '',
      checked: !!routine[key]?.checked
    }));
  }
  return [];
};

export default function NotesListScreen({ 
  notes, 
  folders = [],
  onUpdateFolders,
  onCreateNew, 
  onDelete, 
  theme, 
  isDark, 
  setIsDark,
  userProfile,
  onLogout,
  onEdit,
  onUpdateNote,
  onPinToggle
}) {
  const { width, height } = useWindowDimensions();
  const isTablet = width >= 768;
  const [query, setQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [selectedNote, setSelectedNote] = useState(null);
  const [viewerImageUri, setViewerImageUri] = useState(null);

  // Folders and Drawer States
  const [selectedFolderId, setSelectedFolderId] = useState(null); // null means "All Notes"
  const [viewerPageIdx, setViewerPageIdx] = useState(0);

  useEffect(() => {
    setViewerPageIdx(0);
  }, [selectedNote]);
  const [isDrawerVisible, setIsDrawerVisible] = useState(false);
  const [isTypePickerVisible, setIsTypePickerVisible] = useState(false);
  const drawerAnimation = useRef(new Animated.Value(-280)).current;

  // Folder creation modal states
  const [isFolderModalVisible, setIsFolderModalVisible] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [newFolderColor, setNewFolderColor] = useState('#FF6B6B');
  const [newFolderIcon, setNewFolderIcon] = useState('checkbox-outline');
  const [newFolderIsRoutine, setNewFolderIsRoutine] = useState(false);

  const FOLDER_COLORS = ['#FF6B6B', '#FF9F43', '#1DD1A1', '#54A0FF', '#5F27CD', '#FD79A8', '#00D2D3', '#8395A7'];
  const FOLDER_ICONS = ['checkbox-outline', 'person-outline', 'briefcase-outline', 'heart-outline', 'book-outline', 'cart-outline', 'star-outline'];

  const openDrawer = () => {
    setIsDrawerVisible(true);
    Animated.timing(drawerAnimation, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  const closeDrawer = () => {
    Animated.timing(drawerAnimation, {
      toValue: -280,
      duration: 250,
      useNativeDriver: true,
    }).start(() => {
      setIsDrawerVisible(false);
    });
  };

  const handleCreateFolder = () => {
    if (!newFolderName.trim()) {
      Alert.alert('Required', 'Please enter a name for the folder.');
      return;
    }
    const newFolder = {
      id: `folder_${Date.now()}`,
      name: newFolderName.trim(),
      color: newFolderColor,
      icon: newFolderIcon,
      isRoutine: newFolderIsRoutine
    };
    onUpdateFolders([...folders, newFolder]);
    
    // Reset inputs
    setNewFolderName('');
    setNewFolderColor('#FF6B6B');
    setNewFolderIcon('checkbox-outline');
    setNewFolderIsRoutine(false);
    setIsFolderModalVisible(false);
    
    // Open drawer again so user can see it
    setTimeout(() => {
      openDrawer();
    }, 400);
  };

  const handleDeleteFolder = (folderId) => {
    if (folderId === 'folder_routine' || folderId === 'folder_personal' || folderId === 'folder_work') {
      Alert.alert('Restricted', 'Default system folders cannot be deleted.');
      return;
    }

    Alert.alert(
      "Delete Category",
      "Are you sure you want to delete this category? The notes inside will not be deleted, they will just become uncategorized.",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Delete", 
          style: "destructive", 
          onPress: () => {
            const newFolders = folders.filter(f => f.id !== folderId);
            onUpdateFolders(newFolders);
            
            // Set notes under this folder to uncategorized
            notes.forEach(note => {
              if (note.folderId === folderId) {
                onUpdateNote({ ...note, folderId: null });
              }
            });

            if (selectedFolderId === folderId) {
              setSelectedFolderId(null);
            }
          }
        }
      ]
    );
  };

  const handleToggleChecklistItem = (itemId) => {
    if (!selectedNote || !onUpdateNote) return;
    const updatedChecklist = selectedNote.checklist.map((item) =>
      item.id === itemId ? { ...item, checked: !item.checked } : item
    );
    const updatedContent = updatedChecklist
      .map((item) => `${item.checked ? '[x]' : '[ ]'} ${item.text}`)
      .join('\n');
    const updatedNote = {
      ...selectedNote,
      checklist: updatedChecklist,
      content: updatedContent,
    };
    setSelectedNote(updatedNote);
    onUpdateNote(updatedNote);
  };

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
    if (type === 'student') {
      const tasksDone = (data.studyTasks || []).filter(t => t.checked).length;
      return `Study Focus: ${data.focus || '-'}\nStudy tasks: ${tasksDone}/${data.studyTasks?.length || 0} complete`;
    }
    if (type === 'fitness') {
      return `Workout: ${data.workout || '-'}\nWater intake: ${data.waterGlasses || 0} glasses`;
    }
    if (type === 'exam') {
      const subs = data.subjects || [];
      const totalTopics = subs.reduce((acc, sub) => acc + (sub.topics?.length || 0), 0);
      const doneTopics = subs.reduce((acc, sub) => acc + (sub.topics?.filter(t => t.checked).length || 0), 0);
      return `Exam Prep - Subjects: ${subs.length} | Topics: ${doneTopics}/${totalTopics} completed`;
    }
    if (type === 'travel') {
      return `Travel destination: ${data.destination || '-'}\nPacking checklist: ${(data.packingList || []).filter(p => p.checked).length}/${data.packingList?.length || 0} items packed`;
    }
    if (type === 'shopping') {
      const itemsDone = (data.items || []).filter(i => i.checked).length;
      return `Shopping - Store: ${data.store || '-'}\nItems: ${itemsDone}/${data.items?.length || 0} bought`;
    }
    if (type === 'finance') {
      return `Finance Tracker - Budget limit: ${data.budgetLimit || '-'}\nIncome: ${data.income || '-'} | Savings Goal: ${data.savingsGoal || '-'}`;
    }
    if (type === 'investment') {
      const assetsDone = (data.assets || []).filter(a => a.checked).length;
      return `Investment Goal: ${data.investmentGoal || '-'}\nDaily Invested: ${data.dailyAmount || '-'} | Assets checked: ${assetsDone}/${data.assets?.length || 0}`;
    }
    if (type === 'medical') {
      const shift = data.shiftInfo || {};
      const patientsDone = (data.patients || []).filter(p => p.roundsDone).length;
      return `Clinical Rounds - ${shift.role || 'Doctor'} | Patients: ${patientsDone}/${data.patients?.length || 0} rounds done`;
    }
    if (type === 'med_study') {
      let routineDone = 0;
      let totalRoutine = 0;
      let topicsDone = 0;
      let totalTopics = 0;
      (data.subjects || []).forEach(s => {
        const rArr = getSafeRoutineArray(s.routine);
        rArr.forEach(r => {
          totalRoutine++;
          if (r.checked) routineDone++;
        });
        if (s.topics) {
          s.topics.forEach(t => {
            totalTopics++;
            if (t.checked) topicsDone++;
          });
        }
      });
      return `Med Study Routine | Goal: ${data.studyGoal || '-'}\nRoutine: ${routineDone}/${totalRoutine} | Topics: ${topicsDone}/${totalTopics} checked | Subjects: ${data.subjects?.length || 0}`;
    }
    return '';
  };

  const handleToggleTemplateCheckbox = (section, itemId) => {
    if (!selectedNote || !onUpdateNote) return;
    const updatedSection = selectedNote.templateData[section].map((item) =>
      item.id === itemId ? { ...item, checked: !item.checked } : item
    );
    const updatedData = {
      ...selectedNote.templateData,
      [section]: updatedSection
    };
    const updatedNote = {
      ...selectedNote,
      templateData: updatedData,
      content: generateTemplateSummary(selectedNote.templateType, updatedData)
    };
    setSelectedNote(updatedNote);
    onUpdateNote(updatedNote);
  };

  const handleUpdateTemplateField = (section, key, value) => {
    if (!selectedNote || !onUpdateNote) return;
    const updatedData = { ...selectedNote.templateData };
    if (section && key) {
      updatedData[section] = {
        ...updatedData[section],
        [key]: value
      };
    } else if (section) {
      updatedData[section] = value;
    }
    const updatedNote = {
      ...selectedNote,
      templateData: updatedData,
      content: generateTemplateSummary(selectedNote.templateType, updatedData)
    };
    setSelectedNote(updatedNote);
    onUpdateNote(updatedNote);
  };

  const handleToggleSubjectTopic = (subjectId, topicId) => {
    if (!selectedNote || !onUpdateNote) return;
    const updatedSubjects = selectedNote.templateData.subjects.map(sub => {
      if (sub.id === subjectId) {
        return {
          ...sub,
          topics: sub.topics.map(t => t.id === topicId ? { ...t, checked: !t.checked } : t)
        };
      }
      return sub;
    });
    const updatedData = {
      ...selectedNote.templateData,
      subjects: updatedSubjects
    };
    const updatedNote = {
      ...selectedNote,
      templateData: updatedData,
      content: generateTemplateSummary(selectedNote.templateType, updatedData)
    };
    setSelectedNote(updatedNote);
    onUpdateNote(updatedNote);
  };

  const handleUpdateSubjectField = (subjectId, key, value) => {
    if (!selectedNote || !onUpdateNote) return;
    const updatedSubjects = selectedNote.templateData.subjects.map(sub => {
      if (sub.id === subjectId) {
        return { ...sub, [key]: value };
      }
      return sub;
    });
    const updatedData = {
      ...selectedNote.templateData,
      subjects: updatedSubjects
    };
    const updatedNote = {
      ...selectedNote,
      templateData: updatedData,
      content: generateTemplateSummary(selectedNote.templateType, updatedData)
    };
    setSelectedNote(updatedNote);
    onUpdateNote(updatedNote);
  };

  const handleTogglePatientCheckbox = (patientId, field) => {
    if (!selectedNote || !onUpdateNote) return;
    const updatedPatients = selectedNote.templateData.patients.map(p => {
      if (p.id === patientId) {
        return { ...p, [field]: !p[field] };
      }
      return p;
    });
    const updatedData = {
      ...selectedNote.templateData,
      patients: updatedPatients
    };
    const updatedNote = {
      ...selectedNote,
      templateData: updatedData,
      content: generateTemplateSummary(selectedNote.templateType, updatedData)
    };
    setSelectedNote(updatedNote);
    onUpdateNote(updatedNote);
  };

  const handleUpdateMedicalCare = (key, value) => {
    if (!selectedNote || !onUpdateNote) return;
    const updatedData = {
      ...selectedNote.templateData,
      clinicianCare: {
        ...selectedNote.templateData.clinicianCare,
        [key]: value
      }
    };
    const updatedNote = {
      ...selectedNote,
      templateData: updatedData,
      content: generateTemplateSummary(selectedNote.templateType, updatedData)
    };
    setSelectedNote(updatedNote);
    onUpdateNote(updatedNote);
  };

  const handleToggleMedStudySubjectRoutine = (subId, itemId) => {
    if (!selectedNote || !onUpdateNote) return;
    const updatedSubjects = (selectedNote.templateData.subjects || []).map(s => {
      if (s.id === subId) {
        const rArr = getSafeRoutineArray(s.routine);
        return {
          ...s,
          routine: rArr.map(r => 
            r.id === itemId ? { ...r, checked: !r.checked } : r
          )
        };
      }
      return s;
    });
    const updatedData = {
      ...selectedNote.templateData,
      subjects: updatedSubjects
    };
    const updatedNote = {
      ...selectedNote,
      templateData: updatedData,
      content: generateTemplateSummary(selectedNote.templateType, updatedData)
    };
    setSelectedNote(updatedNote);
    onUpdateNote(updatedNote);
  };

  const handleToggleMedStudySubjectTopic = (subId, topicId) => {
    if (!selectedNote || !onUpdateNote) return;
    const updatedSubjects = (selectedNote.templateData.subjects || []).map(s => {
      if (s.id === subId) {
        return {
          ...s,
          topics: (s.topics || []).map(t => 
            t.id === topicId ? { ...t, checked: !t.checked } : t
          )
        };
      }
      return s;
    });
    const updatedData = {
      ...selectedNote.templateData,
      subjects: updatedSubjects
    };
    const updatedNote = {
      ...selectedNote,
      templateData: updatedData,
      content: generateTemplateSummary(selectedNote.templateType, updatedData)
    };
    setSelectedNote(updatedNote);
    onUpdateNote(updatedNote);
  };

  const handleUpdateMedStudySubjectRating = (subId, rating) => {
    if (!selectedNote || !onUpdateNote) return;
    const updatedSubjects = (selectedNote.templateData.subjects || []).map(s => 
      s.id === subId ? { ...s, rating } : s
    );
    const updatedData = {
      ...selectedNote.templateData,
      subjects: updatedSubjects
    };
    const updatedNote = {
      ...selectedNote,
      templateData: updatedData,
      content: generateTemplateSummary(selectedNote.templateType, updatedData)
    };
    setSelectedNote(updatedNote);
    onUpdateNote(updatedNote);
  };


  const renderSpiralSpine = () => {
    const loops = Array.from({ length: 12 });
    return (
      <View style={styles.spiralSpine}>
        {loops.map((_, i) => (
          <View key={i} style={styles.spiralLoopContainer}>
            <View style={styles.spiralHole} />
            <View style={styles.spiralRing} />
          </View>
        ))}
      </View>
    );
  };

  const getModalPaperStyle = () => {
    if (!selectedNote) return styles.modalPaper;
    if (selectedNote.noteType === 'template') {
      switch (selectedNote.templateType) {
        case 'nutrition':
          return [styles.modalPaper, { backgroundColor: '#E3F2FD', borderRadius: 16, transform: [{ rotate: '0deg' }] }];
        case 'wellness':
          return [styles.modalPaper, { backgroundColor: '#FCE4EC', borderRadius: 24, transform: [{ rotate: '1.2deg' }] }];
        case 'minimal':
          return [styles.modalPaper, { backgroundColor: '#F9F6F0', borderRadius: 4, transform: [{ rotate: '0deg' }], borderWidth: 1.5, borderColor: '#D7CCC8' }];
        case 'cute':
          return [styles.modalPaper, { backgroundColor: '#FFFDE7', borderRadius: 28, transform: [{ rotate: '-1.5deg' }] }];
        case 'habits':
          return [styles.modalPaper, { backgroundColor: '#E8F5E9', borderRadius: 16, transform: [{ rotate: '0deg' }] }];
        case 'student':
          return [styles.modalPaper, { backgroundColor: '#F3E5F5', borderRadius: 16, transform: [{ rotate: '0deg' }] }];
        case 'fitness':
          return [styles.modalPaper, { backgroundColor: '#E0F2F1', borderRadius: 16, transform: [{ rotate: '0deg' }] }];
        case 'exam':
          return [styles.modalPaper, { backgroundColor: '#FBE9E7', borderRadius: 24, transform: [{ rotate: '1.2deg' }] }];
        case 'travel':
          return [styles.modalPaper, { backgroundColor: '#E0F7FA', borderRadius: 16, transform: [{ rotate: '0deg' }] }];
        case 'shopping':
          return [styles.modalPaper, { backgroundColor: '#FFF8E1', borderRadius: 28, transform: [{ rotate: '-1.5deg' }] }];
        case 'finance':
          return [styles.modalPaper, { backgroundColor: '#E8F5E9', borderRadius: 16, transform: [{ rotate: '0deg' }] }];
        case 'investment':
          return [styles.modalPaper, { backgroundColor: '#FFFDF0', borderRadius: 16, transform: [{ rotate: '0deg' }] }];
        case 'medical':
          return [styles.modalPaper, { backgroundColor: '#E0F2F1', borderRadius: 20, transform: [{ rotate: '0.8deg' }] }];
        case 'med_study':
          return [styles.modalPaper, { backgroundColor: '#E8F5E9', borderRadius: 20, transform: [{ rotate: '-0.8deg' }] }];
        default:
          return styles.modalPaper;
      }
    }
    return styles.modalPaper;
  };

  const renderNotebookDetailView = () => {
    const pagesList = selectedNote?.templateData?.pages || [];
    if (pagesList.length === 0) {
      return <Text style={{ fontStyle: 'italic', color: theme.mutedText, textAlign: 'center', margin: 20 }}>Notebook is empty.</Text>;
    }
    
    const pageIdx = Math.max(0, Math.min(viewerPageIdx, pagesList.length - 1));
    const page = pagesList[pageIdx] || { pageStyle: 'ruled', borderDesign: 'classic', lines: [], textBoxes: [] };
    const pageLines = page.lines || [];
    const pageTextBoxes = page.textBoxes || [];
    const isPageDark = page.pageThemeMode ? page.pageThemeMode === 'dark' : isDark;

    const resolveColor = (color) => {
      if (!color) return isPageDark ? '#FFFFFF' : '#000000';
      const c = color.toUpperCase();
      if (c === '#000000' && isPageDark) return '#FFFFFF';
      if (c === '#FFFFFF' && !isPageDark) return '#000000';
      return color;
    };

     const pageHeight = page.pageHeight || 500;
     const displayWidth = Math.min(320, width - 60);
     const displayHeight = displayWidth * (pageHeight / 360);
     const viewerScale = displayWidth / 360;

     const renderViewerGuidelines = (style) => {
       if (style === 'ruled') {
         const lineSlots = Math.floor(pageHeight / 24);
         return (
           <>
             {Array.from({ length: lineSlots }).map((_, i) => (
               <Path
                 key={`v-ruled-${i}`}
                 d={`M 0 ${(i + 1) * 24} L 360 ${(i + 1) * 24}`}
                 stroke={isPageDark ? "#2C3E50" : "#B3E5FC"}
                 strokeWidth={0.8}
                 opacity={isPageDark ? 0.6 : 0.8}
               />
             ))}
             <Path
               d={`M 45 0 L 45 ${pageHeight}`}
               stroke={isPageDark ? "#E74C3C" : "#FFCDD2"}
               strokeWidth={1.2}
               opacity={isPageDark ? 0.5 : 0.8}
             />
           </>
         );
       }
       if (style === 'grid') {
         const hSlots = Math.floor(pageHeight / 20);
         const vSlots = Math.floor(360 / 20);
         return (
           <>
             {Array.from({ length: hSlots }).map((_, i) => (
               <Path
                 key={`v-grid-h-${i}`}
                 d={`M 0 ${(i + 1) * 20} L 360 ${(i + 1) * 20}`}
                 stroke={isPageDark ? "#2A2A2A" : "#ECEFF1"}
                 strokeWidth={0.8}
               />
             ))}
             {Array.from({ length: vSlots }).map((_, i) => (
               <Path
                 key={`v-grid-v-${i}`}
                 d={`M ${(i + 1) * 20} 0 L ${(i + 1) * 20} ${pageHeight}`}
                 stroke={isPageDark ? "#2A2A2A" : "#ECEFF1"}
                 strokeWidth={0.8}
               />
             ))}
           </>
         );
       }
       if (style === 'dotted') {
         const rCount = Math.floor(pageHeight / 20);
         const cCount = Math.floor(360 / 20);
         const dots = [];
         for (let r = 1; r < rCount; r++) {
           for (let c = 1; c < cCount; c++) {
             dots.push(
               <Circle
                 key={`v-dot-${r}-${c}`}
                 cx={c * 20}
                 cy={r * 20}
                 r={1.2}
                 fill={isPageDark ? "#444444" : "#B0BEC5"}
                 opacity={0.7}
               />
             );
           }
         }
         return dots;
       }
       return null;
     };

    const renderViewerBorderDesign = (design) => {
      if (design === 'minimal') {
        return (
          <Rect
            x={10}
            y={10}
            width={340}
            height={pageHeight - 20}
            rx={10}
            stroke="#B0BEC5"
            strokeWidth={1.5}
            fill="none"
          />
        );
      }
      if (design === 'classic') {
        return (
          <>
            <Rect
              x={10}
              y={10}
              width={340}
              height={pageHeight - 20}
              rx={6}
              stroke="#5D4037"
              strokeWidth={1.5}
              fill="none"
            />
            <Rect
              x={14}
              y={14}
              width={332}
              height={pageHeight - 28}
              rx={4}
              stroke="#8D6E63"
              strokeWidth={0.6}
              fill="none"
            />
          </>
        );
      }
      if (design === 'cute') {
        return (
          <>
            <Rect
              x={12}
              y={12}
              width={336}
              height={pageHeight - 24}
              rx={20}
              stroke="#FF8A80"
              strokeDasharray="4,4"
              strokeWidth={2}
              fill="none"
            />
            <Path d="M 22 22 L 25 28 L 31 29 L 26 33 L 28 39 L 22 36 L 16 39 L 18 33 L 13 29 L 19 28 Z" fill="#FF8A80" />
            <Path d="M 338 22 L 341 28 L 347 29 L 342 33 L 344 39 L 338 36 L 332 39 L 334 33 L 329 29 L 335 28 Z" fill="#FF8A80" />
            <Path d={`M 22 ${pageHeight - 22} L 25 ${pageHeight - 16} L 31 ${pageHeight - 15} L 26 ${pageHeight - 11} L 28 ${pageHeight - 5} L 22 ${pageHeight - 8} L 16 ${pageHeight - 5} L 18 ${pageHeight - 11} L 13 ${pageHeight - 15} L 19 ${pageHeight - 16} Z`} fill="#FF8A80" />
            <Path d={`M 338 ${pageHeight - 22} L 341 ${pageHeight - 16} L 347 ${pageHeight - 15} L 342 ${pageHeight - 11} L 344 ${pageHeight - 5} L 338 ${pageHeight - 8} L 332 ${pageHeight - 5} L 334 ${pageHeight - 11} L 329 ${pageHeight - 15} L 335 ${pageHeight - 16} Z`} fill="#FF8A80" />
          </>
        );
      }
      if (design === 'elegant') {
        return (
          <>
            <Rect
              x={10}
              y={10}
              width={340}
              height={pageHeight - 20}
              stroke="#D4AF37"
              strokeWidth={1.5}
              fill="none"
            />
            <Path d={`M 6 15 L 15 6 M 354 15 L 345 6 M 6 ${pageHeight - 15} L 15 ${pageHeight - 6} M 354 ${pageHeight - 15} L 345 ${pageHeight - 6}`} stroke="#D4AF37" strokeWidth={1.5} />
            <Rect
              x={15}
              y={15}
              width={330}
              height={pageHeight - 30}
              stroke="#D4AF37"
              strokeWidth={0.8}
              fill="none"
            />
          </>
        );
      }
      if (design === 'floral') {
        return (
          <>
            <Rect
              x={12}
              y={12}
              width={336}
              height={pageHeight - 24}
              rx={12}
              stroke="#81C784"
              strokeWidth={1.2}
              fill="none"
            />
            <Path d="M 12 25 Q 25 25 25 12 Q 20 20 12 25 Z" fill="#4CAF50" />
            <Path d="M 348 25 Q 335 25 335 12 Q 340 20 348 25 Z" fill="#4CAF50" />
            <Path d={`M 12 ${pageHeight - 25} Q 25 ${pageHeight - 25} 25 ${pageHeight - 12} Q 20 ${pageHeight - 20} 12 ${pageHeight - 25} Z`} fill="#4CAF50" />
            <Path d={`M 348 ${pageHeight - 25} Q 335 ${pageHeight - 25} 335 ${pageHeight - 12} Q 340 ${pageHeight - 20} 348 ${pageHeight - 25} Z`} fill="#4CAF50" />
          </>
        );
      }
      return null;
    };

    const getPathData = (points) => {
      if (points.length === 0) return '';
      const path = points.reduce((acc, point, idx) => {
        if (idx === 0) return `M ${point.x} ${point.y}`;
        return `${acc} L ${point.x} ${point.y}`;
      }, '');
      const first = points[0];
      const last = points[points.length - 1];
      if (first && last && points.length > 2) {
        const dist = Math.sqrt((first.x - last.x) ** 2 + (first.y - last.y) ** 2);
        if (dist < 8) return path + ' Z';
      }
      return path;
    };

    const getBoundingBox = (line) => {
      if (!line || line.length === 0) return null;
      let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
      line.forEach((p) => {
        if (p.x < minX) minX = p.x;
        if (p.x > maxX) maxX = p.x;
        if (p.y < minY) minY = p.y;
        if (p.y > maxY) maxY = p.y;
      });
      return { minX, maxX, minY, maxY };
    };

    return (
      <View style={{ flex: 1, alignItems: 'center', width: '100%' }}>
        <ScrollView
          style={{ flex: 1, width: '100%' }}
          contentContainerStyle={{ alignItems: 'center', paddingVertical: 10 }}
        >
          <View
            style={{
              width: displayWidth,
              height: displayHeight,
              backgroundColor: isPageDark ? '#121212' : '#FFFFFF',
              borderRadius: 10,
              overflow: 'hidden',
              elevation: 3,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.1,
              shadowRadius: 4,
              position: 'relative'
            }}
          >
            <Svg
              style={StyleSheet.absoluteFill}
              viewBox={`0 0 360 ${pageHeight}`}
            >
            {renderViewerGuidelines(page.pageStyle)}
            {renderViewerBorderDesign(page.borderDesign)}

            {pageLines.map((line, idx) => (
              <Path
                key={idx}
                d={getPathData(line)}
                stroke={resolveColor(line[0]?.color)}
                strokeWidth={line[0]?.width || 4}
                strokeOpacity={line[0]?.opacity !== undefined ? line[0].opacity : 1}
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            ))}

            {pageLines.map((line, idx) => {
              if (line[0]?.text) {
                const box = getBoundingBox(line);
                if (box) {
                  const cx = (box.minX + box.maxX) / 2;
                  const cy = (box.minY + box.maxY) / 2;
                  return (
                    <SvgText
                      key={`v-label-${idx}`}
                      x={cx}
                      y={cy + 4}
                      fill={resolveColor(line[0].color)}
                      fontSize={14}
                      fontWeight="bold"
                      textAnchor="middle"
                      alignmentBaseline="middle"
                    >
                      {line[0].text}
                    </SvgText>
                  );
                }
              }
              return null;
            })}

            {/* Render Saved Tapes in preview */}
            {(page.tapes || []).map((t) => (
              <Rect
                key={t.id}
                x={t.x}
                y={t.y}
                width={t.width}
                height={t.height}
                rx={4}
                fill={t.color}
                opacity={t.hidden ? 0.15 : 0.95}
                stroke={t.hidden ? undefined : resolveColor(t.color)}
                strokeWidth={t.hidden ? 0 : 1}
                strokeDasharray={t.hidden ? '2,2' : undefined}
              />
            ))}
          </Svg>

          {(page.images || []).map((img) => (
            <Image
              key={img.id}
              source={{ uri: img.uri }}
              style={{
                position: 'absolute',
                left: img.x * viewerScale,
                top: img.y * viewerScale,
                width: img.width * viewerScale,
                height: img.height * viewerScale,
              }}
              resizeMode="contain"
            />
          ))}

          {pageTextBoxes.map((box) => {
            const alignmentStyle = box.alignment || 'left';
            const isBoxBold = box.fontStyle?.includes('bold');
            const isBoxItalic = box.fontStyle?.includes('italic');

            return (
              <View
                key={box.id}
                style={{
                  position: 'absolute',
                  left: box.x * viewerScale,
                  top: box.y * viewerScale,
                  width: box.width * viewerScale,
                  height: box.height * viewerScale,
                  backgroundColor: box.bgColor || 'transparent',
                  borderRadius: box.bgColor ? 6 * viewerScale : 0,
                  padding: box.bgColor ? 8 * viewerScale : 4,
                  elevation: box.bgColor ? 2 : 0,
                }}
              >
                <Text
                  style={{
                    fontSize: (box.fontSize || 16) * viewerScale * 1.1,
                    color: box.bgColor ? box.color : resolveColor(box.color),
                    textAlign: alignmentStyle,
                    fontWeight: isBoxBold ? 'bold' : 'normal',
                    fontStyle: isBoxItalic ? 'italic' : 'normal',
                  }}
                  numberOfLines={4}
                >
                  {box.text}
                </Text>
              </View>
            );
          })}

          {/* Render Tables in preview overlay */}
          {(page.tables || []).map((tab) => {
            const templateId = tab.template || 'gray';
            const template = TABLE_TEMPLATES.find(t => t.id === templateId) || TABLE_TEMPLATES[0];
            const borderDark = tab.borderDark !== false;
            
            const headerBg = isPageDark ? '#1E293B' : template.headerBg;
            const headerText = template.headerText;
            const borderColor = borderDark 
              ? (isPageDark ? '#475569' : '#334155') 
              : (isPageDark ? '#1E293B' : '#E2E8F0');

            return (
              <View
                key={tab.id}
                style={{
                  position: 'absolute',
                  left: tab.x * viewerScale,
                  top: tab.y * viewerScale,
                  width: tab.width * viewerScale,
                  height: tab.height * viewerScale,
                }}
              >
                <View style={{ flexDirection: 'column', width: '100%', height: '100%' }}>
                  {Array.from({ length: tab.rows }).map((_, rIdx) => {
                    const rowHeight = tab.cellHeights[rIdx] * viewerScale;
                    return (
                      <View key={rIdx} style={{ flexDirection: 'row', height: rowHeight, width: '100%' }}>
                        {Array.from({ length: tab.cols }).map((_, cIdx) => {
                          const colWidth = tab.cellWidths[cIdx] * viewerScale;
                          const cellText = tab.data[rIdx]?.[cIdx] || '';
                          const isHeader = rIdx === 0;
                          
                          let cellBg = isPageDark ? '#121212' : '#FFFFFF';
                          if (isHeader) {
                            cellBg = headerBg;
                          } else if (rIdx % 2 === 1) {
                            cellBg = isPageDark ? '#1E1E1E' : template.cellBg;
                          } else {
                            cellBg = isPageDark ? '#181818' : template.altCellBg;
                          }

                          const cellTextColor = isHeader 
                            ? headerText 
                            : resolveColor(isPageDark ? '#FFFFFF' : '#000000');

                          return (
                            <View
                              key={cIdx}
                              style={{
                                width: colWidth,
                                height: '100%',
                                borderWidth: borderDark ? 1.2 * viewerScale : 0.6 * viewerScale,
                                borderColor: borderColor,
                                backgroundColor: cellBg,
                                justifyContent: 'center',
                                alignItems: 'center',
                                padding: 1,
                              }}
                            >
                              <Text
                                style={{
                                  fontSize: (isHeader ? 11 : 10) * viewerScale,
                                  fontWeight: isHeader ? 'bold' : 'normal',
                                  color: cellTextColor,
                                  textAlign: 'center',
                                }}
                                numberOfLines={2}
                              >
                                {cellText}
                              </Text>
                            </View>
                          );
                        })}
                      </View>
                    );
                  })}
                </View>
              </View>
            );
          })}
        </View>
      </ScrollView>

      <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: 16,
            marginTop: 15,
            backgroundColor: isDark ? '#2A2A2A' : '#ECEFF1',
            paddingVertical: 6,
            paddingHorizontal: 16,
            borderRadius: 20
          }}
        >
          <Pressable
            onPress={() => setViewerPageIdx(Math.max(0, pageIdx - 1))}
            disabled={pageIdx === 0}
            style={{ opacity: pageIdx === 0 ? 0.3 : 1, padding: 4 }}
          >
            <Ionicons name="chevron-back" size={20} color={theme.text} />
          </Pressable>
          <Text style={{ fontSize: 13, fontWeight: '800', color: theme.text }}>
            Page {pageIdx + 1} of {pagesList.length}
          </Text>
          <Pressable
            onPress={() => setViewerPageIdx(Math.min(pagesList.length - 1, pageIdx + 1))}
            disabled={pageIdx === pagesList.length - 1}
            style={{ opacity: pageIdx === pagesList.length - 1 ? 0.3 : 1, padding: 4 }}
          >
            <Ionicons name="chevron-forward" size={20} color={theme.text} />
          </Pressable>
        </View>
      </View>
    );
  };

  const renderTemplateDetailView = () => {
    const data = selectedNote?.templateData || {};
    const type = selectedNote?.templateType;

    if (type === 'nutrition') {
      return (
        <View style={styles.nutritionDetailContainer}>
          {renderSpiralSpine()}
          <View style={styles.ruledContent}>
            <View style={styles.detailSection}>
              <Text style={styles.notebookSectionTitle}>🎯 TODAY&apos;S PRIORITIES</Text>
              <Text selectable={true} style={styles.handwrittenText}>{data.priorities || "No priorities listed."}</Text>
            </View>

            <View style={styles.detailSection}>
              <Text style={styles.notebookSectionTitle}>🥦 MEAL LOGGER</Text>
              <View style={styles.mealGrid}>
                <View style={styles.mealBox}>
                  <Text style={styles.mealBoxTitle}>🍳 Breakfast</Text>
                  <Text selectable={true} style={styles.mealBoxText}>{data.meals?.breakfast || "—"}</Text>
                </View>
                <View style={styles.mealBox}>
                  <Text style={styles.mealBoxTitle}>🍎 Lunch</Text>
                  <Text selectable={true} style={styles.mealBoxText}>{data.meals?.lunch || "—"}</Text>
                </View>
                <View style={styles.mealBox}>
                  <Text style={styles.mealBoxTitle}>🥗 Dinner</Text>
                  <Text selectable={true} style={styles.mealBoxText}>{data.meals?.dinner || "—"}</Text>
                </View>
                <View style={styles.mealBox}>
                  <Text style={styles.mealBoxTitle}>🍿 Snack</Text>
                  <Text selectable={true} style={styles.mealBoxText}>{data.meals?.snack || "—"}</Text>
                </View>
              </View>
            </View>

            <View style={styles.detailSection}>
              <Text style={styles.notebookSectionTitle}>⏰ TIMELINE SCHEDULE</Text>
              {(data.schedule || []).map((item, idx) => {
                const isNotEmpty = !!item.task;
                return (
                  <View key={idx} style={styles.timelineRow}>
                    <Text style={styles.timelineTimeText}>{item.time}</Text>
                    <View style={styles.timelineRuledLine}>
                      <Text selectable={true} style={[styles.timelineContentText, !isNotEmpty && { color: '#B0BEC5', fontStyle: 'italic' }]}>
                        {item.task || "Free Slot"}
                      </Text>
                    </View>
                  </View>
                );
              })}
            </View>

            <View style={styles.detailSection}>
              <Text style={styles.notebookSectionTitle}>⚡ PRODUCTIVITY SCORE</Text>
              <View style={styles.detailStarsRow}>
                {[1, 2, 3, 4, 5].map(star => (
                  <Pressable 
                    key={star} 
                    onPress={() => handleUpdateTemplateField('productivity', null, star)}
                    style={{ padding: 4 }}
                  >
                    <Ionicons 
                      name={star <= (data.productivity || 0) ? "star" : "star-outline"} 
                      size={28} 
                      color="#FFB300" 
                    />
                  </Pressable>
                ))}
              </View>
            </View>

            <View style={styles.detailSection}>
              <Text style={styles.notebookSectionTitle}>📝 NOTES & REFLECTIONS</Text>
              <Text selectable={true} style={styles.handwrittenText}>{data.notes || "No extra thoughts."}</Text>
            </View>
          </View>
        </View>
      );
    }

    if (type === 'wellness') {
      return (
        <View style={styles.wellnessDetailContainer}>
          <View style={styles.detailSection}>
            <Text style={[styles.notebookSectionTitle, { color: '#880E4F' }]}>🧘 TODAY&apos;S MOOD</Text>
            <View style={styles.wellnessMoodRow}>
              {[
                { id: 'calm', icon: '🧘', label: 'Calm' },
                { id: 'happy', icon: '😊', label: 'Happy' },
                { id: 'tired', icon: '😴', label: 'Tired' },
                { id: 'sad', icon: '😢', label: 'Sad' },
              ].map(m => {
                const isSelected = data.mood === m.id;
                return (
                  <Pressable
                    key={m.id}
                    onPress={() => handleUpdateTemplateField('mood', null, m.id)}
                    style={[
                      styles.wellnessMoodBubble,
                      isSelected && { backgroundColor: '#F48FB1', transform: [{ scale: 1.1 }] }
                    ]}
                  >
                    <Text style={{ fontSize: 24 }}>{m.icon}</Text>
                    <Text style={[styles.wellnessMoodText, { color: isSelected ? '#FFFFFF' : '#880E4F' }]}>{m.label}</Text>
                  </Pressable>
                );
              })}
            </View>
          </View>

          <View style={styles.wellnessGridRow}>
            <View style={styles.wellnessGridCol}>
              <Text style={[styles.notebookSectionTitle, { color: '#880E4F' }]}>🛌 SLEEP</Text>
              <View style={styles.sleepCounter}>
                <Pressable 
                  style={styles.sleepCounterBtn} 
                  onPress={() => {
                    const newSleep = Math.max(0, (data.sleepHours || 0) - 1);
                    handleUpdateTemplateField('sleepHours', null, newSleep);
                  }}
                >
                  <Ionicons name="remove" size={16} color="#880E4F" />
                </Pressable>
                <Text style={styles.sleepText}>{data.sleepHours || 0} hrs</Text>
                <Pressable 
                  style={styles.sleepCounterBtn} 
                  onPress={() => {
                    const newSleep = (data.sleepHours || 0) + 1;
                    handleUpdateTemplateField('sleepHours', null, newSleep);
                  }}
                >
                  <Ionicons name="add" size={16} color="#880E4F" />
                </Pressable>
              </View>
            </View>
            <View style={styles.wellnessGridCol}>
              <Text style={[styles.notebookSectionTitle, { color: '#880E4F' }]}>🌸 MINDFULNESS</Text>
              <View style={styles.detailStarsRow}>
                {[1, 2, 3, 4, 5].map(star => (
                  <Pressable 
                    key={star} 
                    onPress={() => handleUpdateTemplateField('productivity', null, star)}
                    style={{ padding: 2 }}
                  >
                    <Ionicons 
                      name={star <= (data.productivity || 0) ? "star" : "star-outline"} 
                      size={22} 
                      color="#EC407A" 
                    />
                  </Pressable>
                ))}
              </View>
            </View>
          </View>

          <View style={styles.detailSection}>
            <Text style={[styles.notebookSectionTitle, { color: '#880E4F' }]}>✅ ROUTINE HABITS</Text>
            {(data.morningHabits || []).map(item => (
              <Pressable 
                key={item.id} 
                onPress={() => handleToggleTemplateCheckbox('morningHabits', item.id)}
                style={styles.wellnessHabitRow}
              >
                <Ionicons 
                  name={item.checked ? "checkbox" : "square-outline"} 
                  size={20} 
                  color="#D81B60" 
                />
                <Text style={[
                  styles.wellnessHabitText,
                  item.checked && { textDecorationLine: 'line-through', opacity: 0.6 }
                ]}>
                  {item.text}
                </Text>
              </Pressable>
            ))}
          </View>

          <View style={styles.detailSection}>
            <Text style={[styles.notebookSectionTitle, { color: '#880E4F' }]}>🙏 GRATITUDE LIST</Text>
            <View style={styles.gratitudeListCard}>
              {(data.gratitude || []).map((grat, idx) => (
                <View key={idx} style={styles.gratitudeRow}>
                  <Text style={styles.gratitudeIdx}>{idx + 1}.</Text>
                  <Text selectable={true} style={styles.gratitudeText}>{grat || "—"}</Text>
                </View>
              ))}
            </View>
          </View>

          {data.affirmations ? (
            <View style={styles.detailSection}>
              <Text style={[styles.notebookSectionTitle, { color: '#880E4F' }]}>🌟 AFFIRMATION</Text>
              <Text selectable={true} style={styles.affirmationText}>&quot;{data.affirmations}&quot;</Text>
            </View>
          ) : null}

          {data.notes ? (
            <View style={styles.detailSection}>
              <Text style={[styles.notebookSectionTitle, { color: '#880E4F' }]}>📝 PLANNER NOTES</Text>
              <Text selectable={true} style={styles.handwrittenText}>{data.notes}</Text>
            </View>
          ) : null}
        </View>
      );
    }

    if (type === 'minimal') {
      return (
        <View style={styles.minimalDetailContainer}>
          <View style={styles.minimalFocusContainer}>
            <Text style={styles.minimalFocusLabel}>TODAY&apos;S FOCUS</Text>
            <Text selectable={true} style={styles.minimalFocusText}>{data.focus || "No primary focus."}</Text>
          </View>

          <View style={styles.detailSection}>
            <Text style={styles.minimalSectionTitle}>TO-DO LIST</Text>
            {(data.todo || []).map(item => (
              <Pressable
                key={item.id}
                onPress={() => handleToggleTemplateCheckbox('todo', item.id)}
                style={styles.minimalTodoRow}
              >
                <Ionicons
                  name={item.checked ? "checkbox" : "square-outline"}
                  size={18}
                  color="#5D4037"
                />
                <Text style={[
                  styles.minimalTodoText,
                  item.checked && { textDecorationLine: 'line-through', opacity: 0.5 }
                ]}>
                  {item.text}
                </Text>
              </Pressable>
            ))}
          </View>

          <View style={styles.detailSection}>
            <Text style={styles.minimalSectionTitle}>TIMELINE</Text>
            {(data.schedule || []).map((item, idx) => {
              const hasTask = !!item.task;
              return (
                <View key={idx} style={styles.minimalScheduleRow}>
                  <Text style={styles.minimalScheduleTime}>{item.time}</Text>
                  <Text selectable={true} style={[styles.minimalScheduleTask, !hasTask && { color: '#BCAAA4', fontStyle: 'italic' }]}>
                    {item.task || "Empty"}
                  </Text>
                </View>
              );
            })}
          </View>

          {data.notes ? (
            <View style={styles.detailSection}>
              <Text style={styles.minimalSectionTitle}>REFLECTIONS</Text>
              <Text selectable={true} style={styles.minimalNotesText}>{data.notes}</Text>
            </View>
          ) : null}
        </View>
      );
    }

    if (type === 'cute') {
      return (
        <View style={styles.cuteDetailContainer}>
          <View style={styles.cuteFocusCard}>
            <Text style={styles.cuteFocusLabel}>⭐ Daily Focus ⭐</Text>
            <Text selectable={true} style={styles.cuteFocusText}>{data.focus || "Have a wonderful day!"}</Text>
          </View>

          <View style={styles.detailSection}>
            <Text style={styles.cuteSectionTitle}>🌿 Main Goals</Text>
            {(data.goals || []).map(item => (
              <Pressable
                key={item.id}
                onPress={() => handleToggleTemplateCheckbox('goals', item.id)}
                style={styles.cuteCheckboxRow}
              >
                <Ionicons
                  name={item.checked ? "checkbox" : "square-outline"}
                  size={20}
                  color="#FBC02D"
                />
                <Text style={[
                  styles.cuteCheckboxText,
                  item.checked && { textDecorationLine: 'line-through', opacity: 0.5 }
                ]}>
                  {item.text}
                </Text>
              </Pressable>
            ))}
          </View>

          <View style={styles.detailSection}>
            <Text style={styles.cuteSectionTitle}>⛅ Afternoon Schedule</Text>
            {(data.afternoonSchedule || []).map(item => (
              <Pressable
                key={item.id}
                onPress={() => handleToggleTemplateCheckbox('afternoonSchedule', item.id)}
                style={styles.cuteCheckboxRow}
              >
                <Ionicons
                  name={item.checked ? "checkbox" : "square-outline"}
                  size={20}
                  color="#FBC02D"
                />
                <Text style={[
                  styles.cuteCheckboxText,
                  item.checked && { textDecorationLine: 'line-through', opacity: 0.5 }
                ]}>
                  {item.text}
                </Text>
              </Pressable>
            ))}
          </View>

          <View style={styles.detailSection}>
            <Text style={styles.cuteSectionTitle}>🌆 Evening Schedule</Text>
            {(data.eveningSchedule || []).map(item => (
              <Pressable
                key={item.id}
                onPress={() => handleToggleTemplateCheckbox('eveningSchedule', item.id)}
                style={styles.cuteCheckboxRow}
              >
                <Ionicons
                  name={item.checked ? "checkbox" : "square-outline"}
                  size={20}
                  color="#FBC02D"
                />
                <Text style={[
                  styles.cuteCheckboxText,
                  item.checked && { textDecorationLine: 'line-through', opacity: 0.5 }
                ]}>
                  {item.text}
                </Text>
              </Pressable>
            ))}
          </View>

          <View style={styles.detailSection}>
            <Text style={styles.cuteSectionTitle}>🌙 Night Schedule</Text>
            {(data.nightSchedule || []).map(item => (
              <Pressable
                key={item.id}
                onPress={() => handleToggleTemplateCheckbox('nightSchedule', item.id)}
                style={styles.cuteCheckboxRow}
              >
                <Ionicons
                  name={item.checked ? "checkbox" : "square-outline"}
                  size={20}
                  color="#FBC02D"
                />
                <Text style={[
                  styles.cuteCheckboxText,
                  item.checked && { textDecorationLine: 'line-through', opacity: 0.5 }
                ]}>
                  {item.text}
                </Text>
              </Pressable>
            ))}
          </View>

          {data.notes ? (
            <View style={styles.cuteNotesCard}>
              <Text style={styles.cuteSectionTitle}>📝 Planner Notes</Text>
              <Text selectable={true} style={styles.cuteNotesText}>{data.notes}</Text>
            </View>
          ) : null}
        </View>
      );
    }

    if (type === 'habits') {
      const HABIT_GROUPS = [
        { key: 'health', title: '🥦 Health & Nutrition', color: '#2E7D32' },
        { key: 'work', title: '💼 Work / Study Habits', color: '#1565C0' },
        { key: 'selfcare', title: '✨ Self-Care habits', color: '#6A1B9A' }
      ];

      return (
        <View style={styles.habitsGridContainer}>
          {HABIT_GROUPS.map(grp => {
            const list = data[grp.key] || [];
            return (
              <View key={grp.key} style={styles.habitGroupCard}>
                <Text style={[styles.habitGroupTitle, { color: grp.color }]}>{grp.title}</Text>
                {list.map(item => (
                  <Pressable
                    key={item.id}
                    onPress={() => handleToggleTemplateCheckbox(grp.key, item.id)}
                    style={styles.habitGridItemRow}
                  >
                    <Ionicons
                      name={item.checked ? "checkbox" : "square-outline"}
                      size={20}
                      color={grp.color}
                    />
                    <Text style={[
                      styles.habitGridItemText,
                      item.checked && { textDecorationLine: 'line-through', opacity: 0.5 }
                    ]}>
                      {item.text}
                    </Text>
                  </Pressable>
                ))}
                {list.length === 0 ? (
                  <Text style={styles.habitEmptyText}>No habits defined.</Text>
                ) : null}
              </View>
            );
          })}
          {data.notes ? (
            <View style={[styles.habitGroupCard, { borderColor: '#A5D6A7' }]}>
              <Text style={[styles.habitGroupTitle, { color: '#1B5E20' }]}>📝 PLANNER NOTES</Text>
              <Text selectable={true} style={styles.handwrittenText}>{data.notes}</Text>
            </View>
          ) : null}
        </View>
      );
    }

    if (type === 'student') {
      return (
        <View style={styles.studentDetailContainer}>
          {renderSpiralSpine()}
          <View style={[styles.ruledContent, { borderLeftColor: '#CE93D8' }]}>
            <View style={styles.studentFocusContainer}>
              <Text style={styles.studentFocusLabel}>🎓 TODAY&apos;S STUDY FOCUS</Text>
              <Text selectable={true} style={styles.studentFocusText}>{data.focus || "No study focus set."}</Text>
            </View>

            <View style={styles.detailSection}>
              <Text style={[styles.notebookSectionTitle, { color: '#6A1B9A' }]}>📚 CLASSES & LECTURES</Text>
              {(data.classes || []).map((item, idx) => {
                const isNotEmpty = !!item.text;
                return (
                  <View key={idx} style={styles.timelineRow}>
                    <Text style={[styles.timelineTimeText, { color: '#6A1B9A', width: 50 }]}>{item.time}</Text>
                    <View style={[styles.timelineRuledLine, { borderBottomColor: '#E1BEE7' }]}>
                      <Text selectable={true} style={[styles.timelineContentText, !isNotEmpty && { color: '#BA68C8', fontStyle: 'italic' }]}>
                        {item.text || "No Class"}
                      </Text>
                    </View>
                  </View>
                );
              })}
              {(!data.classes || data.classes.length === 0) && (
                <Text style={styles.habitEmptyText}>No classes today.</Text>
              )}
            </View>

            <View style={styles.detailSection}>
              <Text style={[styles.notebookSectionTitle, { color: '#6A1B9A' }]}>✏️ STUDY TASKS & HOMEWORK</Text>
              {(data.studyTasks || []).map(item => (
                <Pressable
                  key={item.id}
                  onPress={() => handleToggleTemplateCheckbox('studyTasks', item.id)}
                  style={styles.wellnessHabitRow}
                >
                  <Ionicons
                    name={item.checked ? "checkbox" : "square-outline"}
                    size={20}
                    color="#8E24AA"
                  />
                  <Text style={[
                    styles.wellnessHabitText,
                    { color: '#4A148C' },
                    item.checked && { textDecorationLine: 'line-through', opacity: 0.6 }
                  ]}>
                    {item.text}
                  </Text>
                </Pressable>
              ))}
              {(!data.studyTasks || data.studyTasks.length === 0) && (
                <Text style={styles.habitEmptyText}>No study tasks listed.</Text>
              )}
            </View>

            <View style={styles.detailSection}>
              <Text style={[styles.notebookSectionTitle, { color: '#6A1B9A' }]}>⚠️ DEADLINES & EXAMS</Text>
              {(data.deadlines || []).map((item, idx) => {
                if (!item.text || item.text.trim() === '') return null;
                return (
                  <View key={item.id || idx} style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginVertical: 4 }}>
                    <Ionicons name="alert-circle-outline" size={16} color="#BA68C8" />
                    <Text selectable={true} style={[styles.timelineContentText, { color: '#4A148C' }]}>
                      {item.text}
                    </Text>
                  </View>
                );
              })}
              {(!data.deadlines || data.deadlines.length === 0 || (data.deadlines.length === 1 && !data.deadlines[0].text)) && (
                <Text style={styles.habitEmptyText}>No upcoming deadlines.</Text>
              )}
            </View>

            {data.notes ? (
              <View style={styles.detailSection}>
                <Text style={[styles.notebookSectionTitle, { color: '#6A1B9A' }]}>📝 STUDY NOTES & REMINDERS</Text>
                <Text selectable={true} style={styles.handwrittenText}>{data.notes}</Text>
              </View>
            ) : null}
          </View>
        </View>
      );
    }

    if (type === 'fitness') {
      return (
        <View style={styles.fitnessDetailContainer}>
          <View style={styles.fitnessWorkoutCard}>
            <Text style={styles.fitnessWorkoutLabel}>🏋️ Workout Target</Text>
            <Text selectable={true} style={styles.fitnessWorkoutText}>{data.workout || "Rest Day 🧘"}</Text>
          </View>

          <View style={styles.detailSection}>
            <Text style={[styles.notebookSectionTitle, { color: '#004D40' }]}>💧 Water Intake Tracker</Text>
            <Text style={{ fontSize: 13, fontWeight: '700', color: '#00796B', marginBottom: 6 }}>
              {data.waterGlasses || 0} / 8 Glasses
            </Text>
            <View style={[styles.detailStarsRow, { flexWrap: 'wrap', gap: 12 }]}>
              {Array.from({ length: 8 }).map((_, i) => {
                const isActive = (data.waterGlasses || 0) > i;
                return (
                  <Pressable 
                    key={i} 
                    onPress={() => handleUpdateTemplateField('waterGlasses', null, i + 1)} 
                    style={{ padding: 4 }}
                  >
                    <Ionicons 
                      name={isActive ? "water" : "water-outline"} 
                      size={28} 
                      color={isActive ? "#00BCD4" : "#80CBC4"} 
                    />
                  </Pressable>
                );
              })}
            </View>
          </View>

          <View style={styles.wellnessGridRow}>
            <View style={styles.wellnessGridCol}>
              <View style={[styles.sleepCounter, { borderColor: '#80CBC4', padding: 8 }]}>
                <Text style={[styles.mealBoxTitle, { color: '#004D40', marginBottom: 2 }]}>🔥 Calories</Text>
                <Text selectable={true} style={styles.mealBoxText}>{data.calories || "—"}</Text>
              </View>
            </View>
            <View style={styles.wellnessGridCol}>
              <View style={[styles.sleepCounter, { borderColor: '#80CBC4', padding: 8 }]}>
                <Text style={[styles.mealBoxTitle, { color: '#004D40', marginBottom: 2 }]}>⚖️ Weight</Text>
                <Text selectable={true} style={styles.mealBoxText}>{data.weight || "—"}</Text>
              </View>
            </View>
          </View>

          <View style={styles.detailSection}>
            <Text style={[styles.notebookSectionTitle, { color: '#004D40' }]}>⚡ Energy Score</Text>
            <View style={styles.detailStarsRow}>
              {[1, 2, 3, 4, 5].map(star => (
                <Pressable 
                  key={star} 
                  onPress={() => handleUpdateTemplateField('productivity', null, star)}
                  style={{ padding: 4 }}
                >
                  <Ionicons 
                    name={star <= (data.productivity || 0) ? "star" : "star-outline"} 
                    size={28} 
                    color="#FFB300" 
                  />
                </Pressable>
              ))}
            </View>
          </View>

          {data.notes ? (
            <View style={styles.detailSection}>
              <Text style={[styles.notebookSectionTitle, { color: '#004D40' }]}>📝 Workout Notes & Reflections</Text>
              <Text selectable={true} style={styles.handwrittenText}>{data.notes}</Text>
            </View>
          ) : null}
        </View>
      );
    }

    if (type === 'exam') {
      const subjectsList = data.subjects || [];
      return (
        <View style={styles.examDetailContainer}>
          {subjectsList.map((sub, sIdx) => {
            const totalTopics = sub.topics?.length || 0;
            const doneTopics = (sub.topics || []).filter(t => t.checked).length;
            return (
              <View 
                key={sub.id || sIdx} 
                style={{
                  backgroundColor: '#FFFFFF',
                  borderRadius: 16,
                  padding: 14,
                  borderWidth: 1.5,
                  borderColor: '#FFAB91',
                  marginBottom: 16,
                }}
              >
                {/* Subject Header */}
                <Text style={[styles.examFocusLabel, { color: '#BF360C', fontSize: 15, fontWeight: '900', marginBottom: 4 }]}>
                  🎓 {sub.name || `Subject #${sIdx + 1}`}
                </Text>
                {sub.examDate ? (
                  <Text style={{ fontSize: 12, color: '#E64A19', fontWeight: '700', marginBottom: 10 }}>
                    📅 Exam Date: {sub.examDate}
                  </Text>
                ) : null}

                {/* Topics list */}
                <View style={[styles.detailSection, { marginBottom: 12 }]}>
                  <Text style={[styles.notebookSectionTitle, { color: '#BF360C', fontSize: 12, marginBottom: 6 }]}>
                    ✏️ Topics to Prepare ({doneTopics}/{totalTopics})
                  </Text>
                  {(sub.topics || []).map(topic => (
                    <Pressable
                      key={topic.id}
                      onPress={() => handleToggleSubjectTopic(sub.id, topic.id)}
                      style={styles.wellnessHabitRow}
                    >
                      <Ionicons
                        name={topic.checked ? "checkbox" : "square-outline"}
                        size={20}
                        color="#BF360C"
                      />
                      <Text style={[
                        styles.wellnessHabitText,
                        { color: '#4E342E' },
                        topic.checked && { textDecorationLine: 'line-through', opacity: 0.5 }
                      ]}>
                        {topic.text}
                      </Text>
                    </Pressable>
                  ))}
                  {(!sub.topics || sub.topics.length === 0) && (
                    <Text style={styles.habitEmptyText}>No topics defined.</Text>
                  )}
                </View>

                {/* Stats row inside Card */}
                <View style={styles.wellnessGridRow}>
                  <View style={styles.wellnessGridCol}>
                    <View style={[styles.sleepCounter, { borderColor: '#FFAB91', padding: 8, marginTop: 0 }]}>
                      <Text style={[styles.mealBoxTitle, { color: '#BF360C', marginBottom: 2 }]}>⏱️ Study Target</Text>
                      <Text style={styles.mealBoxText}>{sub.studyHours || 0} hrs</Text>
                    </View>
                  </View>
                  <View style={styles.wellnessGridCol}>
                    <View style={[styles.sleepCounter, { borderColor: '#FFAB91', padding: 8, marginTop: 0 }]}>
                      <Text style={[styles.mealBoxTitle, { color: '#BF360C', marginBottom: 2 }]}>⭐ Preparedness</Text>
                      <View style={styles.detailStarsRow}>
                        {[1, 2, 3, 4, 5].map(star => (
                          <Pressable 
                            key={star} 
                            onPress={() => handleUpdateSubjectField(sub.id, 'productivity', star)}
                            style={{ padding: 1 }}
                          >
                            <Ionicons 
                              name={star <= (sub.productivity || 0) ? "star" : "star-outline"} 
                              size={16} 
                              color="#FF7043" 
                            />
                          </Pressable>
                        ))}
                      </View>
                    </View>
                  </View>
                </View>
              </View>
            );
          })}

          {data.notes ? (
            <View style={styles.detailSection}>
              <Text style={[styles.notebookSectionTitle, { color: '#BF360C' }]}>📝 General Study Notes</Text>
              <Text selectable={true} style={styles.handwrittenText}>{data.notes}</Text>
            </View>
          ) : null}
        </View>
      );
    }

    if (type === 'travel') {
      return (
        <View style={styles.travelDetailContainer}>
          {renderSpiralSpine()}
          <View style={[styles.ruledContent, { borderLeftColor: '#80DEEA' }]}>
            <View style={styles.travelFocusContainer}>
              <Text style={styles.travelFocusLabel}>✈️ TRAVEL PLANNER</Text>
              <Text selectable={true} style={styles.travelFocusText}>
                {data.destination || "No destination set"} {data.duration ? `(${data.duration})` : ""}
              </Text>
            </View>

            <View style={styles.detailSection}>
              <Text style={[styles.notebookSectionTitle, { color: '#006064' }]}>🎒 Packing Checklist</Text>
              {(data.packingList || []).map(item => (
                <Pressable
                  key={item.id}
                  onPress={() => handleToggleTemplateCheckbox('packingList', item.id)}
                  style={styles.wellnessHabitRow}
                >
                  <Ionicons
                    name={item.checked ? "checkbox" : "square-outline"}
                    size={20}
                    color="#006064"
                  />
                  <Text style={[
                    styles.wellnessHabitText,
                    { color: '#004D40' },
                    item.checked && { textDecorationLine: 'line-through', opacity: 0.5 }
                  ]}>
                    {item.text}
                  </Text>
                </Pressable>
              ))}
              {(!data.packingList || data.packingList.length === 0) && (
                <Text style={styles.habitEmptyText}>No packing items listed.</Text>
              )}
            </View>

            <View style={styles.detailSection}>
              <Text style={[styles.notebookSectionTitle, { color: '#006064' }]}>🗺️ Itinerary Details</Text>
              {(data.itinerary || []).map((item, idx) => {
                const isNotEmpty = !!item.task;
                return (
                  <View key={idx} style={styles.timelineRow}>
                    <Text style={[styles.timelineTimeText, { color: '#006064', width: 50 }]}>{item.time}</Text>
                    <View style={[styles.timelineRuledLine, { borderBottomColor: '#80DEEA' }]}>
                      <Text selectable={true} style={[styles.timelineContentText, !isNotEmpty && { color: '#00838F', fontStyle: 'italic' }]}>
                        {item.task || "No Plans"}
                      </Text>
                    </View>
                  </View>
                );
              })}
              {(!data.itinerary || data.itinerary.length === 0) && (
                <Text style={styles.habitEmptyText}>No itinerary slots today.</Text>
              )}
            </View>

            {data.notes ? (
              <View style={styles.detailSection}>
                <Text style={[styles.notebookSectionTitle, { color: '#006064' }]}>📝 Travel Notes & References</Text>
                <Text selectable={true} style={styles.handwrittenText}>{data.notes}</Text>
              </View>
            ) : null}
          </View>
        </View>
      );
    }

    if (type === 'shopping') {
      return (
        <View style={styles.shoppingDetailContainer}>
          <View style={styles.shoppingFocusCard}>
            <Text style={styles.shoppingFocusLabel}>🛒 Shopping & Grocery List</Text>
            <Text selectable={true} style={styles.shoppingFocusText}>
              Store: {data.store || "Any Store"} {data.budget ? `(Budget: ${data.budget})` : ""}
            </Text>
          </View>

          <View style={styles.detailSection}>
            <Text style={[styles.notebookSectionTitle, { color: '#E65100' }]}>📋 Shopping Items</Text>
            {(data.items || []).map(item => (
              <Pressable
                key={item.id}
                onPress={() => handleToggleTemplateCheckbox('items', item.id)}
                style={styles.wellnessHabitRow}
              >
                <Ionicons
                  name={item.checked ? "checkbox" : "square-outline"}
                  size={20}
                  color="#E65100"
                />
                <Text style={[
                  styles.wellnessHabitText,
                  { color: '#5D4037' },
                  item.checked && { textDecorationLine: 'line-through', opacity: 0.5 }
                ]}>
                  {item.text}
                </Text>
              </Pressable>
            ))}
            {(!data.items || data.items.length === 0) && (
              <Text style={styles.habitEmptyText}>No items added.</Text>
            )}
          </View>

          {data.notes ? (
            <View style={styles.detailSection}>
              <Text style={[styles.notebookSectionTitle, { color: '#E65100' }]}>📝 Shopping Notes</Text>
              <Text selectable={true} style={styles.handwrittenText}>{data.notes}</Text>
            </View>
          ) : null}
        </View>
      );
    }

    if (type === 'finance') {
      return (
        <View style={styles.financeDetailContainer}>
          <View style={[styles.detailSection, { marginBottom: 12 }]}>
            <Text style={[styles.notebookSectionTitle, { color: '#1B5E20' }]}>📊 Financial Thresholds</Text>
            <View style={styles.wellnessGridRow}>
              <View style={styles.wellnessGridCol}>
                <View style={[styles.sleepCounter, { borderColor: '#A5D6A7', padding: 8 }]}>
                  <Text style={[styles.mealBoxTitle, { color: '#1B5E20', marginBottom: 2 }]}>💵 Income</Text>
                  <Text selectable={true} style={styles.mealBoxText}>{data.income || "—"}</Text>
                </View>
              </View>
              <View style={styles.wellnessGridCol}>
                <View style={[styles.sleepCounter, { borderColor: '#A5D6A7', padding: 8 }]}>
                  <Text style={[styles.mealBoxTitle, { color: '#1B5E20', marginBottom: 2 }]}>⚠️ Budget Limit</Text>
                  <Text selectable={true} style={styles.mealBoxText}>{data.budgetLimit || "—"}</Text>
                </View>
              </View>
            </View>
            <View style={{ marginTop: 10 }}>
              <View style={[styles.sleepCounter, { borderColor: '#A5D6A7', padding: 8 }]}>
                <Text style={[styles.mealBoxTitle, { color: '#1B5E20', marginBottom: 2 }]}>🎯 Savings Goal</Text>
                <Text selectable={true} style={styles.mealBoxText}>{data.savingsGoal || "—"}</Text>
              </View>
            </View>
          </View>

          <View style={styles.detailSection}>
            <Text style={[styles.notebookSectionTitle, { color: '#1B5E20' }]}>💸 Expense transactions checklist</Text>
            {(data.expenses || []).map(item => (
              <Pressable
                key={item.id}
                onPress={() => handleToggleTemplateCheckbox('expenses', item.id)}
                style={styles.wellnessHabitRow}
              >
                <Ionicons
                  name={item.checked ? "checkbox" : "square-outline"}
                  size={20}
                  color="#1B5E20"
                />
                <Text style={[
                  styles.wellnessHabitText,
                  { color: '#2E7D32' },
                  item.checked && { textDecorationLine: 'line-through', opacity: 0.5 }
                ]}>
                  {item.text}
                </Text>
              </Pressable>
            ))}
            {(!data.expenses || data.expenses.length === 0) && (
              <Text style={styles.habitEmptyText}>No expenses listed.</Text>
            )}
          </View>

          {data.notes ? (
            <View style={styles.detailSection}>
              <Text style={[styles.notebookSectionTitle, { color: '#1B5E20' }]}>📝 Money Notes & Reminders</Text>
              <Text selectable={true} style={styles.handwrittenText}>{data.notes}</Text>
            </View>
          ) : null}
        </View>
      );
    }

    if (type === 'investment') {
      return (
        <View style={styles.investmentDetailContainer}>
          <View style={styles.investmentFocusCard}>
            <Text style={styles.investmentFocusLabel}>📈 Investment Goal</Text>
            <Text selectable={true} style={styles.investmentFocusText}>
              {data.investmentGoal || "Accumulate Wealth"} {data.dailyAmount ? `(Today: ${data.dailyAmount})` : ""}
            </Text>
          </View>

          <View style={styles.detailSection}>
            <Text style={[styles.notebookSectionTitle, { color: '#6F5200' }]}>💰 Assets & Allocations Checklist</Text>
            {(data.assets || []).map(item => (
              <Pressable
                key={item.id}
                onPress={() => handleToggleTemplateCheckbox('assets', item.id)}
                style={styles.wellnessHabitRow}
              >
                <Ionicons
                  name={item.checked ? "checkbox" : "square-outline"}
                  size={20}
                  color="#6F5200"
                />
                <Text style={[
                  styles.wellnessHabitText,
                  { color: '#5D4037' },
                  item.checked && { textDecorationLine: 'line-through', opacity: 0.5 }
                ]}>
                  {item.text}
                </Text>
              </Pressable>
            ))}
            {(!data.assets || data.assets.length === 0) && (
              <Text style={styles.habitEmptyText}>No assets defined.</Text>
            )}
          </View>

          <View style={styles.detailSection}>
            <Text style={[styles.notebookSectionTitle, { color: '#6F5200' }]}>⭐ Discipline / Confidence Score</Text>
            <View style={styles.detailStarsRow}>
              {[1, 2, 3, 4, 5].map(star => (
                <Pressable 
                  key={star} 
                  onPress={() => handleUpdateTemplateField('productivity', null, star)}
                  style={{ padding: 4 }}
                >
                  <Ionicons 
                    name={star <= (data.productivity || 0) ? "star" : "star-outline"} 
                    size={28} 
                    color="#FFB300" 
                  />
                </Pressable>
              ))}
            </View>
          </View>

        </View>
      );
    }

    if (type === 'medical') {
      const shift = data.shiftInfo || {};
      const patientsList = data.patients || [];
      const care = data.clinicianCare || {};
      return (
        <View style={styles.fitnessDetailContainer}>
          {/* Shift Details Banner */}
          <View style={[styles.fitnessWorkoutCard, { borderColor: '#80CBC4', backgroundColor: '#E0F2F1' }]}>
            <Text style={[styles.fitnessWorkoutLabel, { color: '#004D40' }]}>🩺 Clinical Shift Duty</Text>
            <Text selectable={true} style={[styles.fitnessWorkoutText, { color: '#1C1C1C' }]}>
              {shift.role || 'Doctor'} {shift.shiftTime ? `(${shift.shiftTime})` : ''}
            </Text>
            {shift.onCall ? (
              <View style={{ backgroundColor: '#EF5350', borderRadius: 12, paddingHorizontal: 10, paddingVertical: 4, marginTop: 6 }}>
                <Text style={{ fontSize: 11, color: '#FFFFFF', fontWeight: '900' }}>🔴 ON-CALL ACTIVE</Text>
              </View>
            ) : null}
          </View>

          {/* Patient Round Cards */}
          <View style={styles.detailSection}>
            <Text style={[styles.notebookSectionTitle, { color: '#004D40', marginBottom: 8 }]}>👥 Patients Ward Rounds</Text>
            {patientsList.map((patient, pIdx) => {
              return (
                <View 
                  key={patient.id || pIdx} 
                  style={{
                    backgroundColor: '#FFFFFF',
                    borderRadius: 16,
                    padding: 12,
                    borderWidth: 1.5,
                    borderColor: '#80CBC4',
                    marginBottom: 12,
                  }}
                >
                  <Text style={{ fontSize: 14, fontWeight: '900', color: '#004D40', marginBottom: 4 }}>
                    🛏️ Bed: {patient.bedNumber || '—'}
                  </Text>
                  {patient.diagnosis ? (
                    <Text selectable={true} style={{ fontSize: 13, color: '#555', fontStyle: 'italic', marginBottom: 8 }}>
                      Diagnosis: {patient.diagnosis}
                    </Text>
                  ) : null}

                  {/* Actions inside Patient Card */}
                  <View style={{ flexDirection: 'row', gap: 15, borderTopWidth: 1, borderTopColor: '#E0F2F1', paddingTop: 8 }}>
                    <Pressable 
                      onPress={() => handleTogglePatientCheckbox(patient.id, 'vitalsChecked')}
                      style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}
                    >
                      <Ionicons 
                        name={patient.vitalsChecked ? "checkbox" : "square-outline"} 
                        size={18} 
                        color="#004D40" 
                      />
                      <Text style={{ fontSize: 12, fontWeight: '700', color: patient.vitalsChecked ? '#9E9E9E' : '#004D40', textDecorationLine: patient.vitalsChecked ? 'line-through' : 'none' }}>
                        Vitals Checked
                      </Text>
                    </Pressable>
                    <Pressable 
                      onPress={() => handleTogglePatientCheckbox(patient.id, 'roundsDone')}
                      style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}
                    >
                      <Ionicons 
                        name={patient.roundsDone ? "checkbox" : "square-outline"} 
                        size={18} 
                        color="#004D40" 
                      />
                      <Text style={{ fontSize: 12, fontWeight: '700', color: patient.roundsDone ? '#9E9E9E' : '#004D40', textDecorationLine: patient.roundsDone ? 'line-through' : 'none' }}>
                        Rounds Done
                      </Text>
                    </Pressable>
                  </View>
                </View>
              );
            })}
            {patientsList.length === 0 ? (
              <Text style={styles.habitEmptyText}>No patients listed.</Text>
            ) : null}
          </View>

          {/* Clinical Tasks Checklist */}
          <View style={styles.detailSection}>
            <Text style={[styles.notebookSectionTitle, { color: '#004D40' }]}>📋 On-Duty Clinical Tasks</Text>
            {(data.clinicalTasks || []).map(item => (
              <Pressable
                key={item.id}
                onPress={() => handleToggleTemplateCheckbox('clinicalTasks', item.id)}
                style={styles.wellnessHabitRow}
              >
                <Ionicons
                  name={item.checked ? "checkbox" : "square-outline"}
                  size={20}
                  color="#004D40"
                />
                <Text style={[
                  styles.wellnessHabitText,
                  { color: '#1C1C1C' },
                  item.checked && { textDecorationLine: 'line-through', opacity: 0.5 }
                ]}>
                  {item.text}
                </Text>
              </Pressable>
            ))}
            {(!data.clinicalTasks || data.clinicalTasks.length === 0) && (
              <Text style={styles.habitEmptyText}>No clinical tasks listed.</Text>
            )}
          </View>

          {/* Hydration Tracker */}
          <View style={styles.detailSection}>
            <Text style={[styles.notebookSectionTitle, { color: '#004D40' }]}>💧 Hydration intake</Text>
            <Text style={{ fontSize: 13, fontWeight: '700', color: '#00796B', marginBottom: 6 }}>
              {care.hydrationGlasses || 0} / 8 Glasses
            </Text>
            <View style={[styles.detailStarsRow, { flexWrap: 'wrap', gap: 12 }]}>
              {Array.from({ length: 8 }).map((_, i) => {
                const isActive = (care.hydrationGlasses || 0) > i;
                return (
                  <Pressable 
                    key={i} 
                    onPress={() => handleUpdateMedicalCare('hydrationGlasses', i + 1)} 
                    style={{ padding: 4 }}
                  >
                    <Ionicons 
                      name={isActive ? "water" : "water-outline"} 
                      size={28} 
                      color={isActive ? "#00BCD4" : "#80CBC4"} 
                    />
                  </Pressable>
                );
              })}
            </View>
          </View>

          {/* Self care & Stress */}
          <View style={styles.wellnessGridRow}>
            <View style={styles.wellnessGridCol}>
              <View style={[styles.sleepCounter, { borderColor: '#80CBC4', padding: 8, marginTop: 0, flexDirection: 'column', alignItems: 'flex-start' }]}>
                <Text style={[styles.mealBoxTitle, { color: '#004D40', marginBottom: 4 }]}>❤️ Stress level</Text>
                <View style={styles.detailStarsRow}>
                  {[1, 2, 3, 4, 5].map(star => (
                    <Pressable 
                      key={star} 
                      onPress={() => handleUpdateMedicalCare('stressLevel', star)}
                      style={{ padding: 1 }}
                    >
                      <Ionicons 
                        name={star <= (care.stressLevel || 0) ? "heart" : "heart-outline"} 
                        size={16} 
                        color="#EF5350" 
                      />
                    </Pressable>
                  ))}
                </View>
              </View>
            </View>
            <View style={styles.wellnessGridCol}>
              <Pressable 
                onPress={() => handleUpdateMedicalCare('lunchBreak', !care.lunchBreak)}
                style={[styles.sleepCounter, { borderColor: '#80CBC4', padding: 8, marginTop: 0, justifyContent: 'center', gap: 8 }]}
              >
                <Ionicons name={care.lunchBreak ? "checkbox" : "square-outline"} size={18} color="#004D40" />
                <Text style={{ fontSize: 13, fontWeight: '700', color: '#1C1C1C' }}>Lunch Taken</Text>
              </Pressable>
            </View>
          </View>

          {/* Clinical notes */}
          {data.notes ? (
            <View style={styles.detailSection}>
              <Text style={[styles.notebookSectionTitle, { color: '#004D40' }]}>📝 Clinical Notes & Handover</Text>
              <Text selectable={true} style={styles.handwrittenText}>{data.notes}</Text>
            </View>
          ) : null}
        </View>
      );
    }

    if (type === 'med_study') {
      const subjectsList = data.subjects || [];
      const clinicalLogList = data.clinicalLog || [];

      const renderDetailRoutineRow = (subId, item, idx) => {
        return (
          <Pressable
            key={item.id || idx}
            onPress={() => handleToggleMedStudySubjectRoutine(subId, item.id)}
            style={styles.wellnessHabitRow}
          >
            <Ionicons
              name={item.checked ? "checkbox" : "square-outline"}
              size={18}
              color="#2E7D32"
            />
            <Text style={{ fontSize: 12, fontWeight: '800', color: '#2E7D32', width: 45 }}>
              {item.time}
            </Text>
            <Text style={[
              styles.wellnessHabitText,
              { color: '#1C1C1C', flex: 1, fontSize: 12 },
              item.checked && { textDecorationLine: 'line-through', opacity: 0.5 }
            ]}>
              {item.task || '—'}
            </Text>
          </Pressable>
        );
      };

      return (
        <View style={styles.fitnessDetailContainer}>
          {/* Main Study Goal Banner */}
          {data.studyGoal ? (
            <View style={[styles.fitnessWorkoutCard, { borderColor: '#81C784', backgroundColor: '#E8F5E9' }]}>
              <Text style={[styles.fitnessWorkoutLabel, { color: '#2E7D32' }]}>🎓 Main Medical Study Goal</Text>
              <Text selectable={true} style={[styles.fitnessWorkoutText, { color: '#1C1C1C', fontSize: 14, fontWeight: '700' }]}>
                {data.studyGoal}
              </Text>
            </View>
          ) : null}

          {/* Medical Subjects Confidence Rating & Routines */}
          <View style={styles.detailSection}>
            <Text style={[styles.notebookSectionTitle, { color: '#2E7D32', marginBottom: 8 }]}>📚 Subjects, Topics & Routines</Text>
            {subjectsList.map((sub, idx) => {
              return (
                <View 
                  key={sub.id || idx} 
                  style={{
                    backgroundColor: '#FFFFFF',
                    borderRadius: 14,
                    padding: 12,
                    borderWidth: 1.5,
                    borderColor: '#81C784',
                    marginBottom: 12,
                  }}
                >
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                    <Text style={{ fontSize: 14, fontWeight: '900', color: '#2E7D32' }}>
                      {sub.name || 'Unnamed Subject'}
                    </Text>
                    {sub.studyDuration ? (
                      <Text style={{ fontSize: 11, fontWeight: '800', color: '#1B5E20', backgroundColor: '#E8F5E9', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 }}>
                        ⏱️ {sub.studyDuration}
                      </Text>
                    ) : null}
                  </View>

                  {/* Nested Topics Checklist */}
                  <View style={{ marginBottom: 8, paddingVertical: 4 }}>
                    <Text style={{ fontSize: 11, fontWeight: '700', color: '#2E7D32', marginBottom: 4 }}>📖 Study Topics & Targets</Text>
                    {(sub.topics || []).map((topic, tIdx) => (
                      <Pressable
                        key={topic.id || tIdx}
                        onPress={() => handleToggleMedStudySubjectTopic(sub.id, topic.id)}
                        style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginVertical: 3 }}
                      >
                        <Ionicons
                          name={topic.checked ? "checkbox" : "square-outline"}
                          size={18}
                          color="#2E7D32"
                        />
                        <Text style={[
                          { color: '#1C1C1C', flex: 1, fontSize: 12 },
                          topic.checked && { textDecorationLine: 'line-through', opacity: 0.5 }
                        ]}>
                          {topic.text || '—'}
                        </Text>
                        {topic.duration ? (
                          <Text style={{ fontSize: 11, color: '#666', fontStyle: 'italic' }}>
                            ({topic.duration})
                          </Text>
                        ) : null}
                      </Pressable>
                    ))}
                    {(!sub.topics || sub.topics.length === 0) && (
                      <Text style={{ fontSize: 11, color: '#999', fontStyle: 'italic' }}>No topics listed.</Text>
                    )}
                  </View>

                  {/* Subject Routine */}
                  <View style={{ marginVertical: 6, paddingVertical: 4, borderTopWidth: 1, borderTopColor: '#E8F5E9', borderBottomWidth: 1, borderBottomColor: '#E8F5E9' }}>
                    <Text style={{ fontSize: 11, fontWeight: '700', color: '#2E7D32', marginBottom: 4 }}>⏰ Subject Routine</Text>
                    {getSafeRoutineArray(sub.routine).map((rItem, rIdx) => renderDetailRoutineRow(sub.id, rItem, rIdx))}
                    {(getSafeRoutineArray(sub.routine).length === 0) && (
                      <Text style={{ fontSize: 11, color: '#999', fontStyle: 'italic' }}>No routines listed.</Text>
                    )}
                  </View>

                  {/* Confidence Rating Stars */}
                  <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 6 }}>
                    <Text style={{ fontSize: 11, color: '#777', fontWeight: '700' }}>Confidence</Text>
                    <View style={{ flexDirection: 'row', gap: 6, alignItems: 'center' }}>
                      {[1, 2, 3, 4, 5].map(star => (
                        <Pressable 
                          key={star} 
                          onPress={() => handleUpdateMedStudySubjectRating(sub.id, star)}
                          style={{ padding: 1 }}
                        >
                          <Ionicons 
                            name={star <= (sub.rating || 0) ? "star" : "star-outline"} 
                            size={16} 
                            color="#4CAF50" 
                          />
                        </Pressable>
                      ))}
                    </View>
                  </View>
                </View>
              );
            })}
            {subjectsList.length === 0 ? (
              <Text style={styles.habitEmptyText}>No subjects listed.</Text>
            ) : null}
          </View>

          {/* Clinical Practical Checklist */}
          <View style={styles.detailSection}>
            <Text style={[styles.notebookSectionTitle, { color: '#2E7D32' }]}>📋 Clinical Practical & Case Log</Text>
            {(clinicalLogList || []).map((item, cIdx) => (
              <Pressable
                key={item.id || cIdx}
                onPress={() => handleToggleTemplateCheckbox('clinicalLog', item.id)}
                style={styles.wellnessHabitRow}
              >
                <Ionicons
                  name={item.checked ? "checkbox" : "square-outline"}
                  size={20}
                  color="#2E7D32"
                />
                <Text style={[
                  styles.wellnessHabitText,
                  { color: '#1C1C1C' },
                  item.checked && { textDecorationLine: 'line-through', opacity: 0.5 }
                ]}>
                  {item.text}
                </Text>
              </Pressable>
            ))}
            {(clinicalLogList.length === 0) && (
              <Text style={styles.habitEmptyText}>No practical tasks listed.</Text>
            )}
          </View>

          {/* Study Summary Notes */}
          {data.notes ? (
            <View style={styles.detailSection}>
              <Text style={[styles.notebookSectionTitle, { color: '#2E7D32' }]}>📝 Study Pearls & Key Learnings</Text>
              <Text selectable={true} style={styles.handwrittenText}>{data.notes}</Text>
            </View>
          ) : null}
        </View>
      );
    }

    return null;
  };

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

  // Handle Back Button to close Search or Modal or Drawer
  useEffect(() => {
    const backAction = () => {
      if (isDrawerVisible) {
        closeDrawer();
        return true;
      }
      if (isFolderModalVisible) {
        setIsFolderModalVisible(false);
        return true;
      }
      if (selectedNote) {
        setSelectedNote(null);
        return true;
      }
      if (isSearching) {
        setIsSearching(false);
        setQuery('');
        return true;
      }
      return false;
    };

    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      backAction
    );

    return () => backHandler.remove();
  }, [isSearching, selectedNote, isDrawerVisible, isFolderModalVisible]);

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
        modalActionBtn: {
          width: 38,
          height: 38,
          borderRadius: 19,
          backgroundColor: 'rgba(0,0,0,0.05)',
          alignItems: 'center',
          justifyContent: 'center',
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
        drawerBackdrop: {
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.4)',
          zIndex: 99,
        },
        drawerPanel: {
          position: 'absolute',
          top: 0,
          left: 0,
          width: 280,
          bottom: 0,
          zIndex: 100,
          paddingTop: Platform.OS === 'ios' ? 50 : 35,
          paddingHorizontal: 16,
          borderTopRightRadius: 24,
          borderBottomRightRadius: 24,
          elevation: 20,
          shadowColor: '#000',
          shadowOffset: { width: 4, height: 0 },
          shadowOpacity: 0.2,
          shadowRadius: 10,
        },
        drawerHeader: {
          flexDirection: 'row',
          alignItems: 'center',
          gap: 12,
          paddingBottom: 20,
          borderBottomWidth: 1,
          borderBottomColor: 'rgba(0, 0, 0, 0.08)',
          marginBottom: 20,
        },
        drawerAvatar: {
          width: 46,
          height: 46,
          borderRadius: 23,
          borderWidth: 2,
          borderColor: theme.primary,
        },
        drawerProfileInfo: {
          flex: 1,
        },
        drawerName: {
          fontSize: 16,
          fontWeight: '700',
          color: theme.text,
        },
        drawerSubName: {
          fontSize: 11,
          color: theme.mutedText,
          marginTop: 1,
        },
        drawerSectionTitle: {
          fontSize: 12,
          fontWeight: '800',
          color: theme.mutedText,
          textTransform: 'uppercase',
          letterSpacing: 1,
          marginBottom: 10,
          paddingLeft: 4,
        },
        drawerScroll: {
          flex: 1,
        },
        drawerItem: {
          flexDirection: 'row',
          alignItems: 'center',
          gap: 12,
          paddingVertical: 12,
          paddingHorizontal: 14,
          borderRadius: 14,
          marginVertical: 3,
        },
        drawerItemActive: {
          backgroundColor: theme.primary,
        },
        drawerItemText: {
          fontSize: 15,
          fontWeight: '600',
          color: theme.text,
        },
        drawerItemTextActive: {
          color: '#FFFFFF',
          fontWeight: '700',
        },
        drawerDeleteBtn: {
          padding: 4,
          marginLeft: 'auto',
        },
        drawerCreateBtn: {
          flexDirection: 'row',
          alignItems: 'center',
          gap: 8,
          paddingVertical: 12,
          paddingHorizontal: 14,
          marginTop: 10,
          borderRadius: 14,
          borderWidth: 1.5,
          borderColor: theme.border,
          borderStyle: 'dashed',
        },
        drawerCreateTxt: {
          fontSize: 14,
          color: theme.primary,
          fontWeight: '700',
        },
        drawerSettings: {
          borderTopWidth: 1,
          borderTopColor: 'rgba(0, 0, 0, 0.08)',
          paddingTop: 15,
          paddingBottom: 25,
          gap: 6,
        },
        drawerSettingsRow: {
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingVertical: 10,
          paddingHorizontal: 8,
        },
        drawerSettingsBtn: {
          flexDirection: 'row',
          alignItems: 'center',
          gap: 10,
          paddingVertical: 10,
          paddingHorizontal: 8,
          borderRadius: 10,
        },
        drawerSettingsTxt: {
          fontSize: 14,
          color: theme.text,
          fontWeight: '600',
        },
        routineProgressCard: {
          backgroundColor: theme.surface,
          borderRadius: 24,
          padding: 16,
          borderWidth: 1,
          marginBottom: 16,
          elevation: 2,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.05,
          shadowRadius: 6,
        },
        routineHeader: {
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 12,
        },
        routineProgressTitle: {
          fontSize: 15,
          fontWeight: '700',
          flex: 1,
          marginLeft: 8,
        },
        routineProgressText: {
          fontSize: 13,
          fontWeight: '700',
        },
        progressBarBg: {
          height: 8,
          borderRadius: 4,
          backgroundColor: theme.border,
          overflow: 'hidden',
          marginBottom: 10,
        },
        progressBarActive: {
          height: '100%',
          borderRadius: 4,
        },
        routineMotivationText: {
          fontSize: 12,
          fontWeight: '600',
          lineHeight: 16,
        },
        folderModalContainer: {
          flex: 1,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          justifyContent: 'center',
          alignItems: 'center',
          padding: 20,
        },
        folderModalContent: {
          width: '90%',
          borderRadius: 24,
          padding: 24,
          elevation: 20,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 10 },
          shadowOpacity: 0.25,
          shadowRadius: 15,
        },
        folderModalTitle: {
          fontSize: 18,
          fontWeight: '800',
          marginBottom: 16,
          textAlign: 'center',
        },
        folderInput: {
          borderWidth: 1.5,
          borderRadius: 14,
          paddingHorizontal: 16,
          paddingVertical: 12,
          fontSize: 16,
          marginBottom: 16,
        },
        colorSection: {
          marginBottom: 16,
        },
        gridRow: {
          flexDirection: 'row',
          flexWrap: 'wrap',
          gap: 10,
          marginTop: 8,
        },
        colorBubble: {
          width: 38,
          height: 38,
          borderRadius: 19,
          alignItems: 'center',
          justifyContent: 'center',
        },
        iconSection: {
          marginBottom: 16,
        },
        iconBubble: {
          width: 38,
          height: 38,
          borderRadius: 10,
          alignItems: 'center',
          justifyContent: 'center',
          borderWidth: 1.5,
        },
        routineToggleSection: {
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 20,
          paddingVertical: 8,
        },
        routineToggleLabel: {
          fontSize: 15,
          fontWeight: '700',
        },
        routineToggleDesc: {
          fontSize: 11,
          marginTop: 2,
        },
        folderModalButtons: {
          flexDirection: 'row',
          gap: 12,
        },
        folderModalBtnCancel: {
          flex: 1,
          paddingVertical: 14,
          borderRadius: 14,
          alignItems: 'center',
          borderWidth: 1.5,
        },
        folderModalBtnSave: {
          flex: 2,
          paddingVertical: 14,
          borderRadius: 14,
          alignItems: 'center',
          justifyContent: 'center',
        },
        folderModalBtnTxt: {
          fontSize: 15,
          fontWeight: '800',
        },
        // Daily Routine Styles in details modal
        spiralSpine: {
          position: 'absolute',
          left: 4,
          top: 20,
          bottom: 20,
          width: 20,
          justifyContent: 'space-between',
          alignItems: 'center',
          zIndex: 30,
        },
        spiralLoopContainer: {
          flexDirection: 'row',
          alignItems: 'center',
          height: 14,
        },
        spiralHole: {
          width: 7,
          height: 7,
          borderRadius: 3.5,
          backgroundColor: 'rgba(0,0,0,0.15)',
        },
        spiralRing: {
          width: 22,
          height: 5,
          borderRadius: 2.5,
          backgroundColor: '#CFD8DC',
          marginLeft: -5,
          borderWidth: 1,
          borderColor: '#90A4AE',
          shadowColor: '#000',
          shadowOffset: { width: 1, height: 1 },
          shadowOpacity: 0.2,
          shadowRadius: 1,
        },
        nutritionDetailContainer: {
          flex: 1,
          paddingLeft: 18,
        },
        ruledContent: {
          flex: 1,
          borderLeftWidth: 1,
          borderLeftColor: '#FFCDD2',
          paddingLeft: 14,
        },
        notebookSectionTitle: {
          fontSize: 14,
          fontWeight: '900',
          letterSpacing: 0.5,
          color: theme.primary,
          marginBottom: 8,
          textTransform: 'uppercase',
        },
        detailSection: {
          marginBottom: 20,
        },
        handwrittenText: {
          fontSize: 16,
          lineHeight: 22,
          color: '#37474F',
          fontFamily: Platform.OS === 'ios' ? 'Chalkboard SE' : 'serif',
          fontStyle: 'italic',
        },
        mealGrid: {
          flexDirection: 'row',
          flexWrap: 'wrap',
          gap: 10,
        },
        mealBox: {
          width: '47%',
          backgroundColor: '#FFFFFF',
          borderRadius: 12,
          padding: 10,
          borderWidth: 1.5,
          borderColor: '#B3E5FC',
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.05,
          shadowRadius: 2,
        },
        mealBoxTitle: {
          fontSize: 12,
          fontWeight: '800',
          color: '#0288D1',
          marginBottom: 3,
        },
        mealBoxText: {
          fontSize: 14,
          color: '#37474F',
          fontWeight: '600',
        },
        timelineRow: {
          flexDirection: 'row',
          alignItems: 'center',
          gap: 10,
          marginVertical: 4,
        },
        timelineTimeText: {
          fontSize: 13,
          fontWeight: '900',
          color: '#0288D1',
          width: 44,
        },
        timelineRuledLine: {
          flex: 1,
          borderBottomWidth: 1,
          borderBottomColor: '#B3E5FC',
          paddingBottom: 4,
        },
        timelineContentText: {
          fontSize: 15,
          color: '#37474F',
          fontWeight: '600',
        },
        detailStarsRow: {
          flexDirection: 'row',
          flexWrap: 'wrap',
          gap: 6,
          marginVertical: 4,
        },

        wellnessDetailContainer: {
          flex: 1,
          paddingHorizontal: 6,
        },
        wellnessMoodRow: {
          flexDirection: 'row',
          justifyContent: 'space-between',
          marginVertical: 4,
        },
        wellnessMoodBubble: {
          alignItems: 'center',
          justifyContent: 'center',
          paddingVertical: 8,
          paddingHorizontal: 10,
          borderRadius: 14,
          backgroundColor: '#FFFFFF',
          elevation: 1,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.05,
          shadowRadius: 2,
          width: '23%',
        },
        wellnessMoodText: {
          fontSize: 10,
          fontWeight: '800',
          marginTop: 4,
        },
        wellnessGridRow: {
          flexDirection: 'row',
          gap: 16,
          marginBottom: 16,
        },
        wellnessGridCol: {
          flex: 1,
        },
        sleepCounter: {
          flexDirection: 'row',
          alignItems: 'center',
          backgroundColor: '#FFFFFF',
          borderRadius: 12,
          padding: 4,
          borderWidth: 1.5,
          borderColor: '#F8BBD0',
          justifyContent: 'space-between',
          marginTop: 4,
        },
        sleepCounterBtn: {
          width: 28,
          height: 28,
          borderRadius: 6,
          backgroundColor: '#FCE4EC',
          alignItems: 'center',
          justifyContent: 'center',
        },
        sleepText: {
          fontSize: 14,
          fontWeight: '800',
          color: '#880E4F',
        },
        wellnessHabitRow: {
          flexDirection: 'row',
          alignItems: 'center',
          gap: 10,
          paddingVertical: 6,
        },
        wellnessHabitText: {
          fontSize: 15,
          color: '#494949',
          fontWeight: '600',
        },
        gratitudeListCard: {
          backgroundColor: '#FFFFFF',
          borderRadius: 16,
          padding: 12,
          borderWidth: 1.5,
          borderColor: '#F8BBD0',
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.05,
          shadowRadius: 2,
        },
        gratitudeRow: {
          flexDirection: 'row',
          alignItems: 'center',
          gap: 8,
          marginVertical: 4,
        },
        gratitudeIdx: {
          fontSize: 14,
          fontWeight: '800',
          color: '#C2185B',
        },
        gratitudeText: {
          fontSize: 15,
          color: '#37474F',
          fontWeight: '600',
          fontStyle: 'italic',
        },
        affirmationText: {
          fontSize: 16,
          lineHeight: 22,
          color: '#880E4F',
          textAlign: 'center',
          fontWeight: '700',
          fontStyle: 'italic',
          paddingVertical: 10,
          paddingHorizontal: 12,
          backgroundColor: '#FFF0F5',
          borderRadius: 14,
          borderWidth: 1,
          borderColor: '#F8BBD0',
        },
        minimalDetailContainer: {
          flex: 1,
          paddingHorizontal: 4,
        },
        minimalFocusContainer: {
          backgroundColor: '#EFEBE9',
          borderRadius: 10,
          padding: 12,
          alignItems: 'center',
          borderWidth: 1,
          borderColor: '#D7CCC8',
          marginBottom: 16,
        },
        minimalFocusLabel: {
          fontSize: 11,
          fontWeight: '900',
          color: '#5D4037',
          letterSpacing: 1.5,
          marginBottom: 4,
        },
        minimalFocusText: {
          fontSize: 16,
          color: '#3E2723',
          fontWeight: '700',
          textAlign: 'center',
        },
        minimalSectionTitle: {
          fontSize: 13,
          fontWeight: '900',
          letterSpacing: 1.2,
          color: '#5D4037',
          marginBottom: 8,
          textTransform: 'uppercase',
          borderBottomWidth: 1,
          borderBottomColor: '#D7CCC8',
          paddingBottom: 4,
        },
        minimalTodoRow: {
          flexDirection: 'row',
          alignItems: 'center',
          gap: 10,
          paddingVertical: 6,
        },
        minimalTodoText: {
          fontSize: 15,
          color: '#4E342E',
          fontWeight: '600',
        },
        minimalScheduleRow: {
          flexDirection: 'row',
          alignItems: 'center',
          paddingVertical: 6,
          borderBottomWidth: 0.5,
          borderBottomColor: '#E0D8D0',
        },
        minimalScheduleTime: {
          fontSize: 13,
          fontWeight: '800',
          color: '#5D4037',
          width: 50,
        },
        minimalScheduleTask: {
          fontSize: 15,
          color: '#4E342E',
          fontWeight: '600',
        },
        minimalNotesText: {
          fontSize: 15,
          lineHeight: 20,
          color: '#4E342E',
          fontWeight: '500',
          fontStyle: 'italic',
        },
        cuteDetailContainer: {
          flex: 1,
          paddingHorizontal: 4,
        },
        cuteFocusCard: {
          backgroundColor: '#FFF9C4',
          borderRadius: 20,
          padding: 14,
          alignItems: 'center',
          borderWidth: 2,
          borderColor: '#FFF59D',
          borderStyle: 'dashed',
          marginBottom: 16,
        },
        cuteFocusLabel: {
          fontSize: 14,
          fontWeight: '900',
          color: '#F57F17',
          marginBottom: 4,
        },
        cuteFocusText: {
          fontSize: 16,
          color: '#5D4037',
          fontWeight: '800',
          textAlign: 'center',
        },
        cuteSectionTitle: {
          fontSize: 14,
          fontWeight: '900',
          color: '#F57F17',
          marginBottom: 8,
        },
        cuteCheckboxRow: {
          flexDirection: 'row',
          alignItems: 'center',
          gap: 10,
          paddingVertical: 6,
        },
        cuteCheckboxText: {
          fontSize: 15,
          color: '#5D4037',
          fontWeight: '700',
        },
        cuteNotesCard: {
          backgroundColor: '#FFFFFF',
          borderRadius: 18,
          padding: 14,
          borderWidth: 1.5,
          borderColor: '#FFF59D',
          marginTop: 10,
        },
        cuteNotesText: {
          fontSize: 14,
          color: '#5D4037',
          lineHeight: 18,
          fontWeight: '600',
        },
        habitsGridContainer: {
          flex: 1,
          gap: 16,
        },
        habitGroupCard: {
          backgroundColor: '#FFFFFF',
          borderRadius: 16,
          padding: 14,
          borderWidth: 1.5,
          borderColor: '#C8E6C9',
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.05,
          shadowRadius: 2,
        },
        habitGroupTitle: {
          fontSize: 14,
          fontWeight: '900',
          marginBottom: 10,
          textTransform: 'uppercase',
          letterSpacing: 0.5,
        },
        habitGridItemRow: {
          flexDirection: 'row',
          alignItems: 'center',
          gap: 10,
          paddingVertical: 6,
        },
        habitGridItemText: {
          fontSize: 15,
          color: '#2E7D32',
          fontWeight: '700',
        },
        habitEmptyText: {
          fontSize: 13,
          color: '#9E9E9E',
          fontStyle: 'italic',
          textAlign: 'center',
          marginVertical: 4,
        },
        studentDetailContainer: {
          flex: 1,
          paddingLeft: 18,
        },
        studentFocusContainer: {
          backgroundColor: '#F3E5F5',
          borderRadius: 12,
          padding: 12,
          borderWidth: 1.5,
          borderColor: '#E1BEE7',
          marginBottom: 16,
          alignItems: 'center',
        },
        studentFocusLabel: {
          fontSize: 12,
          fontWeight: '900',
          color: '#6A1B9A',
          letterSpacing: 1,
          marginBottom: 4,
        },
        studentFocusText: {
          fontSize: 16,
          fontWeight: '800',
          color: '#1C1C1C',
          textAlign: 'center',
        },
        fitnessDetailContainer: {
          flex: 1,
          paddingHorizontal: 4,
        },
        fitnessWorkoutCard: {
          backgroundColor: '#E0F2F1',
          borderRadius: 16,
          padding: 14,
          alignItems: 'center',
          borderWidth: 2,
          borderColor: '#B2DFDB',
          marginBottom: 16,
        },
        fitnessWorkoutLabel: {
          fontSize: 13,
          fontWeight: '900',
          color: '#004D40',
          marginBottom: 4,
          textTransform: 'uppercase',
          letterSpacing: 0.5,
        },
        fitnessWorkoutText: {
          fontSize: 16,
          color: '#1C1C1C',
          fontWeight: '800',
          textAlign: 'center',
        },
        examDetailContainer: {
          flex: 1,
          paddingHorizontal: 4,
        },
        examFocusCard: {
          backgroundColor: '#FFFFFF',
          borderRadius: 16,
          padding: 14,
          alignItems: 'center',
          borderWidth: 2,
          borderColor: '#FFAB91',
          marginBottom: 16,
        },
        examFocusLabel: {
          fontSize: 13,
          fontWeight: '900',
          color: '#BF360C',
          marginBottom: 4,
          textTransform: 'uppercase',
          letterSpacing: 0.5,
        },
        examFocusText: {
          fontSize: 16,
          color: '#1C1C1C',
          fontWeight: '800',
          textAlign: 'center',
        },
        travelDetailContainer: {
          flex: 1,
          paddingLeft: 18,
        },
        travelFocusContainer: {
          backgroundColor: '#E0F7FA',
          borderRadius: 12,
          padding: 12,
          borderWidth: 1.5,
          borderColor: '#80DEEA',
          marginBottom: 16,
          alignItems: 'center',
        },
        travelFocusLabel: {
          fontSize: 12,
          fontWeight: '900',
          color: '#006064',
          letterSpacing: 1,
          marginBottom: 4,
        },
        travelFocusText: {
          fontSize: 16,
          fontWeight: '800',
          color: '#1C1C1C',
          textAlign: 'center',
        },
        shoppingDetailContainer: {
          flex: 1,
          paddingHorizontal: 4,
        },
        shoppingFocusCard: {
          backgroundColor: '#FFFFFF',
          borderRadius: 16,
          padding: 14,
          alignItems: 'center',
          borderWidth: 2,
          borderColor: '#FFE082',
          marginBottom: 16,
        },
        shoppingFocusLabel: {
          fontSize: 13,
          fontWeight: '900',
          color: '#E65100',
          marginBottom: 4,
          textTransform: 'uppercase',
          letterSpacing: 0.5,
        },
        shoppingFocusText: {
          fontSize: 16,
          color: '#1C1C1C',
          fontWeight: '800',
          textAlign: 'center',
        },
        financeDetailContainer: {
          flex: 1,
          paddingHorizontal: 4,
        },
        investmentDetailContainer: {
          flex: 1,
          paddingHorizontal: 4,
        },
        investmentFocusCard: {
          backgroundColor: '#FFFFFF',
          borderRadius: 16,
          padding: 14,
          alignItems: 'center',
          borderWidth: 2,
          borderColor: '#FFD700',
          marginBottom: 16,
        },
        investmentFocusLabel: {
          fontSize: 13,
          fontWeight: '900',
          color: '#6F5200',
          marginBottom: 4,
          textTransform: 'uppercase',
          letterSpacing: 0.5,
        },
        investmentFocusText: {
          fontSize: 16,
          color: '#1C1C1C',
          fontWeight: '800',
          textAlign: 'center',
        },
        typePickerItem: {
          flexDirection: 'row',
          alignItems: 'center',
          padding: 12,
          borderRadius: 14,
          borderWidth: 1,
          gap: 12,
        },
        typePickerIconBg: {
          width: 40,
          height: 40,
          borderRadius: 10,
          justifyContent: 'center',
          alignItems: 'center',
        },
        typePickerItemTitle: {
          fontSize: 15,
          fontWeight: '800',
        },
        typePickerItemDesc: {
          fontSize: 11,
          marginTop: 2,
        },
        pickerContainer: {
          width: '90%',
          borderRadius: 24,
          padding: 24,
          alignItems: 'center',
          elevation: 20,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 10 },
          shadowOpacity: 0.25,
          shadowRadius: 15,
        },
        pickerTitle: {
          fontSize: 20,
          fontWeight: '900',
          marginBottom: 20,
        },
        pickerCloseBtn: {
          height: 50,
          borderRadius: 16,
          justifyContent: 'center',
          alignItems: 'center',
        },
        pickerCloseBtnText: {
          color: '#FFFFFF',
          fontSize: 16,
          fontWeight: '700',
        },
      }),
    [theme, isDark, isTablet]
  );

  const filteredNotes = useMemo(() => {
    const q = query.trim().toLowerCase();
    
    // Filter notes based on selected folder first
    let folderNotes = notes;
    if (selectedFolderId === 'filter_notebook') {
      folderNotes = notes.filter(note => note.noteType === 'notebook');
    } else if (selectedFolderId !== null) {
      folderNotes = notes.filter(note => note.folderId === selectedFolderId);
    }
    
    const baseNotes = !q 
      ? folderNotes 
      : folderNotes.filter(
          (note) =>
            (note.title || '').toLowerCase().includes(q) ||
            (note.content || '').toLowerCase().includes(q)
        );
    return [...baseNotes].sort((a, b) => {
      const aPinned = a.isPinned ? 1 : 0;
      const bPinned = b.isPinned ? 1 : 0;
      return bPinned - aPinned;
    });
  }, [query, notes, selectedFolderId]);

  const routineProgress = useMemo(() => {
    const routineNotes = notes.filter(note => {
      if (selectedFolderId) {
        if (selectedFolderId === 'filter_notebook') return false;
        return note.folderId === selectedFolderId;
      }
      const folder = folders.find(f => f.id === note.folderId);
      return folder?.isRoutine;
    });

    let totalChecklistItems = 0;
    let completedChecklistItems = 0;

    routineNotes.forEach(note => {
      if (note.noteType === 'checklist' && note.checklist) {
        note.checklist.forEach(item => {
          totalChecklistItems++;
          if (item.checked) {
            completedChecklistItems++;
          }
        });
      } else if (note.noteType === 'template' && note.templateData) {
        const data = note.templateData;
        if (note.templateType === 'wellness' && data.morningHabits) {
          data.morningHabits.forEach(item => {
            totalChecklistItems++;
            if (item.checked) completedChecklistItems++;
          });
        } else if (note.templateType === 'minimal' && data.todo) {
          data.todo.forEach(item => {
            totalChecklistItems++;
            if (item.checked) completedChecklistItems++;
          });
        } else if (note.templateType === 'cute') {
          if (data.goals) {
            data.goals.forEach(item => {
              totalChecklistItems++;
              if (item.checked) completedChecklistItems++;
            });
          }
          if (data.afternoonSchedule) {
            data.afternoonSchedule.forEach(item => {
              totalChecklistItems++;
              if (item.checked) completedChecklistItems++;
            });
          }
          if (data.eveningSchedule) {
            data.eveningSchedule.forEach(item => {
              totalChecklistItems++;
              if (item.checked) completedChecklistItems++;
            });
          }
          if (data.nightSchedule) {
            data.nightSchedule.forEach(item => {
              totalChecklistItems++;
              if (item.checked) completedChecklistItems++;
            });
          }
        } else if (note.templateType === 'habits') {
          ['health', 'work', 'selfcare'].forEach(grp => {
            if (data[grp]) {
              data[grp].forEach(item => {
                totalChecklistItems++;
                if (item.checked) completedChecklistItems++;
              });
            }
          });
        } else if (note.templateType === 'student' && data.studyTasks) {
          data.studyTasks.forEach(item => {
            totalChecklistItems++;
            if (item.checked) completedChecklistItems++;
          });
        } else if (note.templateType === 'exam' && data.subjects) {
          data.subjects.forEach(sub => {
            if (sub.topics) {
              sub.topics.forEach(item => {
                totalChecklistItems++;
                if (item.checked) completedChecklistItems++;
              });
            }
          });
        } else if (note.templateType === 'travel' && data.packingList) {
          data.packingList.forEach(item => {
            totalChecklistItems++;
            if (item.checked) completedChecklistItems++;
          });
        } else if (note.templateType === 'shopping' && data.items) {
          data.items.forEach(item => {
            totalChecklistItems++;
            if (item.checked) completedChecklistItems++;
          });
        } else if (note.templateType === 'finance' && data.expenses) {
          data.expenses.forEach(item => {
            totalChecklistItems++;
            if (item.checked) completedChecklistItems++;
          });
        } else if (note.templateType === 'investment' && data.assets) {
          data.assets.forEach(item => {
            totalChecklistItems++;
            if (item.checked) completedChecklistItems++;
          });
        } else if (note.templateType === 'medical') {
          if (data.clinicalTasks) {
            data.clinicalTasks.forEach(item => {
              totalChecklistItems++;
              if (item.checked) completedChecklistItems++;
            });
          }
          if (data.patients) {
            data.patients.forEach(item => {
              totalChecklistItems++;
              if (item.roundsDone) completedChecklistItems++;
            });
          }
          if (data.clinicianCare) {
            totalChecklistItems++;
            if (data.clinicianCare.lunchBreak) completedChecklistItems++;
          }
        } else if (note.templateType === 'med_study') {
          if (data.subjects && Array.isArray(data.subjects)) {
            data.subjects.forEach(s => {
              if (s.routine) {
                Object.values(s.routine).forEach(item => {
                  totalChecklistItems++;
                  if (item.checked) completedChecklistItems++;
                });
              }
              if (s.topics && Array.isArray(s.topics)) {
                s.topics.forEach(item => {
                  totalChecklistItems++;
                  if (item.checked) completedChecklistItems++;
                });
              }
            });
          }
          if (data.clinicalLog) {
            data.clinicalLog.forEach(item => {
              totalChecklistItems++;
              if (item.checked) completedChecklistItems++;
            });
          }
        }
      }
    });

    return {
      total: totalChecklistItems,
      completed: completedChecklistItems,
      percentage: totalChecklistItems > 0 ? Math.round((completedChecklistItems / totalChecklistItems) * 100) : 0
    };
  }, [notes, selectedFolderId, folders]);

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
                <Pressable onPress={openDrawer} style={styles.iconCircle}>
                  <Ionicons name="menu" size={24} color={theme.text} />
                </Pressable>
                <Text style={styles.greeting}>{greetingPrefix}, {userProfile?.name || 'H.Anand'} 👋</Text>
              </View>

              <View style={styles.actionButtons}>
                <Pressable onPress={toggleSearch} style={styles.iconCircle}>
                  <Ionicons name="search" size={22} color={theme.text} />
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
            <Text style={styles.mainTitle}>
              {selectedFolderId === null 
                ? "My Notes" 
                : (selectedFolderId === 'filter_notebook'
                    ? "Digital Notebooks"
                    : (folders.find(f => f.id === selectedFolderId)?.name || "My Notes"))}
            </Text>
            <Text style={styles.dateSub}>Today {today}</Text>
          </View>
        )}

        {/* Daily Routine Progress Card */}
        {!isSearching && selectedFolderId && folders.find(f => f.id === selectedFolderId)?.isRoutine && routineProgress.total > 0 && (
          <View style={[styles.routineProgressCard, { borderColor: theme.border }]}>
            <View style={styles.routineHeader}>
              <Ionicons name="flame" size={22} color="#FF8C00" />
              <Text style={[styles.routineProgressTitle, { color: theme.text }]}>Today&apos;s Routine Progress</Text>
              <Text style={[styles.routineProgressText, { color: theme.mutedText }]}>
                {routineProgress.completed}/{routineProgress.total} Tasks
              </Text>
            </View>
            
            <View style={styles.progressBarBg}>
              <View 
                style={[
                  styles.progressBarActive, 
                  { 
                    width: `${routineProgress.percentage}%`,
                    backgroundColor: routineProgress.percentage === 100 ? '#4CAF50' : '#FF8C00'
                  }
                ]} 
              />
            </View>
            
            <Text style={[styles.routineMotivationText, { color: theme.mutedText }]}>
              {routineProgress.percentage === 100 
                ? "All tasks completed! Amazing job! 🔥🎉" 
                : `You've completed ${routineProgress.percentage}% of your daily tasks. Keep going!`}
            </Text>
          </View>
        )}

        {/* Create Card (Hide when searching) */}
        {!isSearching && (
          <Pressable onPress={() => setIsTypePickerVisible(true)} style={styles.createCard}>
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
            isDark={isDark}
            onPress={() => setSelectedNote(item)}
            onPinToggle={() => onPinToggle(item.id)}
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
        <View style={styles.modalOverlay}>
          {/* Backdrop to close modal when clicking outside */}
          <Pressable 
            style={StyleSheet.absoluteFill} 
            onPress={() => setSelectedNote(null)} 
          />

          <View style={getModalPaperStyle()}>
            {/* Decorative Tape & Pin (Hide for nutrition and minimal templates) */}
            {selectedNote?.templateType !== 'nutrition' && selectedNote?.templateType !== 'minimal' && (
              <>
                <View style={styles.modalTape} />
                <View style={styles.modalPin} />
              </>
            )}

            <View style={styles.modalHeader}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <View style={{ flex: 1 }}>
                  <Text selectable={true} style={styles.modalTitle}>{selectedNote?.title}</Text>
                  <Text style={styles.modalDate}>{selectedNote?.date}</Text>
                </View>
                <View style={{ flexDirection: 'row', gap: 12, paddingLeft: 10, marginRight: 25 }}>
                  <Pressable 
                    onPress={() => {
                      const note = selectedNote;
                      setSelectedNote(null);
                      onEdit(note);
                    }}
                    style={styles.modalActionBtn}
                  >
                    <Ionicons name="pencil-outline" size={20} color="#1E88E5" />
                  </Pressable>
                  <Pressable 
                    onPress={() => {
                      Alert.alert(
                        "Delete Note",
                        "Are you sure you want to delete this note?",
                        [
                          { text: "Cancel", style: "cancel" },
                          { 
                            text: "Delete", 
                            style: "destructive", 
                            onPress: () => {
                              onDelete(selectedNote.id);
                              setSelectedNote(null);
                            }
                          }
                        ]
                      );
                    }}
                    style={styles.modalActionBtn}
                  >
                    <Ionicons name="trash-outline" size={20} color="#E53935" />
                  </Pressable>
                </View>
              </View>
            </View>

            <ScrollView 
              style={styles.modalBody} 
              showsVerticalScrollIndicator={true}
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
                    <Pressable key={idx} onPress={() => setViewerImageUri(img.uri)}>
                      <Image 
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
                    </Pressable>
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

              {selectedNote?.noteType === 'template' ? (
                renderTemplateDetailView()
              ) : selectedNote?.noteType === 'notebook' ? (
                renderNotebookDetailView()
              ) : selectedNote?.noteType === 'checklist' && selectedNote.checklist && selectedNote.checklist.length > 0 ? (
                <View style={{ gap: 8, marginVertical: 8 }}>
                  {selectedNote.checklist.map((item) => (
                    <Pressable 
                      key={item.id} 
                      onPress={() => handleToggleChecklistItem(item.id)}
                      style={{ flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 4 }}
                    >
                      <Ionicons 
                        name={item.checked ? "checkbox" : "square-outline"} 
                        size={20} 
                        color={item.checked ? '#757575' : '#333333'} 
                      />
                      <Text 
                        selectable={true}
                        style={{
                          fontSize: 18,
                          color: item.checked ? '#757575' : '#333333',
                          textDecorationLine: item.checked ? 'line-through' : 'none',
                          opacity: item.checked ? 0.6 : 1,
                        }}
                      >
                        {item.text}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              ) : (
                <Text selectable={true} style={styles.modalContent}>{selectedNote?.content}</Text>
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
          </View>
        </View>
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

      {/* Note Type Picker Modal */}
      <Modal
        visible={isTypePickerVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setIsTypePickerVisible(false)}
      >
        <Pressable 
          style={styles.modalOverlay} 
          onPress={() => setIsTypePickerVisible(false)}
        >
          <Pressable 
            style={[styles.pickerContainer, { backgroundColor: isDark ? '#1E1E1E' : '#F9F7F2', width: '90%', padding: 22 }]} 
            onPress={() => {}}
          >
            <Text style={[styles.pickerTitle, { color: theme.text, marginBottom: 15 }]}>Create New</Text>
            
            <View style={{ gap: 12, width: '100%' }}>
              {[
                { 
                  type: 'text', 
                  title: 'Text Note', 
                  desc: 'Standard note with rich media & drawings',
                  icon: 'document-text-outline',
                  iconBg: '#E8F5E9',
                  iconColor: '#4CAF50'
                },
                { 
                  type: 'checklist', 
                  title: 'Task Checklist', 
                  desc: 'Quick todo list to track tasks',
                  icon: 'checkbox-outline',
                  iconBg: '#FFF3E0',
                  iconColor: '#FF9800'
                },
                { 
                  type: 'notebook', 
                  title: 'Digital Notebook', 
                  desc: 'Canvas page with ruler, tables, tapes',
                  icon: 'book-outline',
                  iconBg: '#E3F2FD',
                  iconColor: '#2196F3'
                },
                { 
                  type: 'template', 
                  title: 'Planner Template', 
                  desc: 'Wellness, routines, studies & diet logs',
                  icon: 'calendar-outline',
                  iconBg: '#F3E5F5',
                  iconColor: '#9C27B0'
                }
              ].map((item) => (
                <Pressable
                  key={item.type}
                  onPress={() => {
                    setIsTypePickerVisible(false);
                    onCreateNew(item.type);
                  }}
                  style={({ pressed }) => [
                    styles.typePickerItem,
                    { 
                      backgroundColor: isDark ? '#2A2A2A' : '#FFFFFF',
                      borderColor: isDark ? '#333333' : '#E5E5E5',
                      opacity: pressed ? 0.8 : 1
                    }
                  ]}
                >
                  <View style={[styles.typePickerIconBg, { backgroundColor: item.iconBg }]}>
                    <Ionicons name={item.icon} size={22} color={item.iconColor} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.typePickerItemTitle, { color: theme.text }]}>{item.title}</Text>
                    <Text style={[styles.typePickerItemDesc, { color: theme.mutedText }]}>{item.desc}</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={18} color={theme.mutedText} />
                </Pressable>
              ))}
            </View>

            <Pressable 
              style={[styles.pickerCloseBtn, { backgroundColor: theme.primary, marginTop: 20, width: '100%' }]} 
              onPress={() => setIsTypePickerVisible(false)}
            >
              <Text style={styles.pickerCloseBtnText}>Cancel</Text>
            </Pressable>
          </Pressable>
        </Pressable>
      </Modal>

      {/* Custom Left Drawer Sidebar */}
      {isDrawerVisible && (
        <View style={styles.drawerBackdrop}>
          <Pressable style={StyleSheet.absoluteFillObject} onPress={closeDrawer} />
          <Animated.View 
            style={[
              styles.drawerPanel, 
              { 
                transform: [{ translateX: drawerAnimation }],
                backgroundColor: isDark ? '#1E1E1E' : '#F5F5F0'
              }
            ]}
          >
            {/* Drawer Profile Header */}
            <View style={styles.drawerHeader}>
              <Image 
                source={{ uri: userProfile?.avatar || 'https://api.dicebear.com/7.x/avataaars/png?seed=Felix' }} 
                style={styles.drawerAvatar} 
              />
              <View style={styles.drawerProfileInfo}>
                <Text numberOfLines={1} style={styles.drawerName}>{userProfile?.name || 'H.Anand'}</Text>
                <Text style={styles.drawerSubName}>Keep notes organized ✨</Text>
              </View>
            </View>

            {/* Categories scroll section */}
            <Text style={styles.drawerSectionTitle}>Categories</Text>
            <ScrollView style={styles.drawerScroll} showsVerticalScrollIndicator={false}>
              {/* All Notes */}
              <Pressable 
                onPress={() => {
                  setSelectedFolderId(null);
                  closeDrawer();
                }}
                style={[
                  styles.drawerItem,
                  selectedFolderId === null && styles.drawerItemActive
                ]}
              >
                <Ionicons 
                  name="documents-outline" 
                  size={20} 
                  color={selectedFolderId === null ? '#FFFFFF' : theme.text} 
                />
                <Text style={[
                  styles.drawerItemText,
                  selectedFolderId === null && styles.drawerItemTextActive,
                  { color: selectedFolderId === null ? '#FFFFFF' : theme.text }
                ]}>All Notes</Text>
              </Pressable>
              
              {/* Digital Notebooks Filter */}
              <Pressable 
                onPress={() => {
                  setSelectedFolderId('filter_notebook');
                  closeDrawer();
                }}
                style={[
                  styles.drawerItem,
                  selectedFolderId === 'filter_notebook' && styles.drawerItemActive
                ]}
              >
                <Ionicons 
                  name="book-outline" 
                  size={20} 
                  color={selectedFolderId === 'filter_notebook' ? '#FFFFFF' : theme.text} 
                />
                <Text style={[
                  styles.drawerItemText,
                  selectedFolderId === 'filter_notebook' && styles.drawerItemTextActive,
                  { color: selectedFolderId === 'filter_notebook' ? '#FFFFFF' : theme.text }
                ]}>Digital Notebooks</Text>
              </Pressable>

              {/* Custom Folders */}
              {folders.map((folder) => {
                const isSelected = selectedFolderId === folder.id;
                return (
                  <Pressable
                    key={folder.id}
                    onPress={() => {
                      setSelectedFolderId(folder.id);
                      closeDrawer();
                    }}
                    onLongPress={() => handleDeleteFolder(folder.id)}
                    style={[
                      styles.drawerItem,
                      isSelected && { backgroundColor: folder.color }
                    ]}
                  >
                    <Ionicons 
                      name={folder.icon || 'folder-outline'} 
                      size={20} 
                      color={isSelected ? '#FFFFFF' : folder.color} 
                    />
                    <Text style={[
                      styles.drawerItemText,
                      isSelected && styles.drawerItemTextActive,
                      { color: isSelected ? '#FFFFFF' : theme.text }
                    ]}>
                      {folder.name}
                    </Text>
                    {folder.isRoutine && (
                      <Ionicons 
                        name="repeat" 
                        size={14} 
                        color={isSelected ? '#FFFFFF' : theme.mutedText} 
                        style={{ marginLeft: 8 }}
                      />
                    )}
                    {folder.id !== 'folder_routine' && folder.id !== 'folder_personal' && folder.id !== 'folder_work' && (
                      <Pressable 
                        onPress={() => handleDeleteFolder(folder.id)}
                        style={styles.drawerDeleteBtn}
                      >
                        <Ionicons 
                          name="trash-outline" 
                          size={16} 
                          color={isSelected ? '#FFFFFF' : '#EF4444'} 
                        />
                      </Pressable>
                    )}
                  </Pressable>
                );
              })}

              {/* Add New Folder */}
              <Pressable
                onPress={() => {
                  closeDrawer();
                  setIsFolderModalVisible(true);
                }}
                style={styles.drawerCreateBtn}
              >
                <Ionicons name="add-circle-outline" size={20} color={theme.primary} />
                <Text style={styles.drawerCreateTxt}>New Category</Text>
              </Pressable>
            </ScrollView>

            {/* Drawer Settings / Footer */}
            <View style={styles.drawerSettings}>
              {/* Theme Toggle Row */}
              <View style={styles.drawerSettingsRow}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                  <Ionicons name={isDark ? "sunny" : "moon"} size={20} color={theme.text} />
                  <Text style={[styles.drawerSettingsTxt, { color: theme.text }]}>Dark Mode</Text>
                </View>
                <Switch 
                  value={isDark}
                  onValueChange={(val) => setIsDark(val)}
                  trackColor={{ false: "#767577", true: theme.primary }}
                  thumbColor={isDark ? "#FFF" : "#f4f3f4"}
                />
              </View>

              {/* Profile/Logout Trigger */}
              <Pressable onPress={handleProfilePress} style={styles.drawerSettingsBtn}>
                <Ionicons name="settings-outline" size={20} color={theme.text} />
                <Text style={[styles.drawerSettingsTxt, { color: theme.text }]}>Profile & Logout</Text>
              </Pressable>
            </View>
          </Animated.View>
        </View>
      )}

      {/* Folder Creation Modal */}
      <Modal
        visible={isFolderModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setIsFolderModalVisible(false)}
      >
        <View style={styles.folderModalContainer}>
          <View style={[styles.folderModalContent, { backgroundColor: theme.surface }]}>
            <Text style={[styles.folderModalTitle, { color: theme.text }]}>Create New Category</Text>
            
            <TextInput
              value={newFolderName}
              onChangeText={setNewFolderName}
              placeholder="e.g. Health, Cooking, Studies"
              placeholderTextColor={theme.placeholder}
              style={[styles.folderInput, { borderColor: theme.border, color: theme.text }]}
              autoFocus
            />

            {/* Colors picker */}
            <View style={styles.colorSection}>
              <Text style={[styles.drawerSectionTitle, { marginBottom: 4, color: theme.mutedText }]}>Select Color</Text>
              <View style={styles.gridRow}>
                {FOLDER_COLORS.map((color) => (
                  <Pressable
                    key={color}
                    onPress={() => setNewFolderColor(color)}
                    style={[
                      styles.colorBubble,
                      { backgroundColor: color },
                      newFolderColor === color && { borderWidth: 3, borderColor: theme.text }
                    ]}
                  >
                    {newFolderColor === color && (
                      <Ionicons name="checkmark" size={18} color="#FFFFFF" />
                    )}
                  </Pressable>
                ))}
              </View>
            </View>

            {/* Icons picker */}
            <View style={styles.iconSection}>
              <Text style={[styles.drawerSectionTitle, { marginBottom: 4, color: theme.mutedText }]}>Select Icon</Text>
              <View style={styles.gridRow}>
                {FOLDER_ICONS.map((iconName) => (
                  <Pressable
                    key={iconName}
                    onPress={() => setNewFolderIcon(iconName)}
                    style={[
                      styles.iconBubble,
                      { 
                        borderColor: newFolderIcon === iconName ? theme.primary : theme.border,
                        backgroundColor: newFolderIcon === iconName ? theme.surface : 'transparent'
                      }
                    ]}
                  >
                    <Ionicons 
                      name={iconName} 
                      size={20} 
                      color={newFolderIcon === iconName ? theme.primary : theme.mutedText} 
                    />
                  </Pressable>
                ))}
              </View>
            </View>

            {/* Daily Routine Toggle */}
            <View style={styles.routineToggleSection}>
              <View style={{ flex: 1, paddingRight: 10 }}>
                <Text style={[styles.routineToggleLabel, { color: theme.text }]}>Daily Routine Mode</Text>
                <Text style={[styles.routineToggleDesc, { color: theme.mutedText }]}>
                  Checklists in this category will reset automatic every day.
                </Text>
              </View>
              <Switch 
                value={newFolderIsRoutine}
                onValueChange={setNewFolderIsRoutine}
                trackColor={{ false: "#767577", true: theme.primary }}
                thumbColor={newFolderIsRoutine ? "#FFF" : "#f4f3f4"}
              />
            </View>

            {/* Action buttons */}
            <View style={styles.folderModalButtons}>
              <Pressable 
                onPress={() => setIsFolderModalVisible(false)}
                style={[styles.folderModalBtnCancel, { borderColor: theme.border }]}
              >
                <Text style={[styles.folderModalBtnTxt, { color: theme.text }]}>Cancel</Text>
              </Pressable>
              
              <Pressable 
                onPress={handleCreateFolder}
                style={[styles.folderModalBtnSave, { backgroundColor: theme.primary }]}
              >
                <Text style={[styles.folderModalBtnTxt, { color: '#FFFFFF' }]}>Create</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}
