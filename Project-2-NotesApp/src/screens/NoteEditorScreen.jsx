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
import NotebookCanvas from './NotebookCanvas';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
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
  const [noteType, setNoteType] = useState(noteToEdit ? noteToEdit.noteType : 'text'); // 'text', 'checklist', or 'template', 'notebook'
  const [templateType, setTemplateType] = useState(noteToEdit ? noteToEdit.templateType : null);
  const [templateData, setTemplateData] = useState(() => {
    if (noteToEdit) {
      if (noteToEdit.noteType === 'notebook' && (!noteToEdit.templateData || !noteToEdit.templateData.pages)) {
        return {
          pages: [
            {
              pageStyle: 'ruled',
              borderDesign: 'classic',
              lines: [],
              textBoxes: [],
              images: [],
              tapes: [],
              tables: [],
              pageHeight: 1500
            }
          ]
        };
      }
      return noteToEdit.templateData || {};
    }
    return {};
  });
  const [isTemplateModalVisible, setIsTemplateModalVisible] = useState(false);

  const [checklist, setChecklist] = useState(() => {
    if (noteToEdit) {
      if (noteToEdit.noteType === 'checklist' && (!noteToEdit.checklist || noteToEdit.checklist.length === 0)) {
        return [{ id: 'c_1', text: '', checked: false }];
      }
      return noteToEdit.checklist || [];
    }
    return [];
  });
  const [images, setImages] = useState(noteToEdit ? (noteToEdit.images || []) : []);
  const [drawings, setDrawings] = useState(noteToEdit ? (noteToEdit.drawings || []) : []);
  const [audio, setAudio] = useState(noteToEdit ? (noteToEdit.audio || []) : []);
  const [isBottomSheetVisible, setIsBottomSheetVisible] = useState(false);
  const [isDrawingCanvasVisible, setIsDrawingCanvasVisible] = useState(false);
  const [isNotebookCanvasVisible, setIsNotebookCanvasVisible] = useState(false);
  const [editingDrawingIndex, setEditingDrawingIndex] = useState(null);
  const [viewerImageUri, setViewerImageUri] = useState(null);

  // Auto-open picker / canvas for preselected note type on creation
  React.useEffect(() => {
    if (noteToEdit && !noteToEdit.id) {
      if (noteToEdit.noteType === 'notebook') {
        setIsNotebookCanvasVisible(true);
      } else if (noteToEdit.noteType === 'template') {
        setIsTemplateModalVisible(true);
      }
    }
  }, [noteToEdit]);

  // Time Picker States
  const [isTimePickerVisible, setIsTimePickerVisible] = useState(false);
  const [timePickerTarget, setTimePickerTarget] = useState(null); // { type, index }
  const [selectedHour, setSelectedHour] = useState("08");
  const [selectedMinute, setSelectedMinute] = useState("00");

  const HOURS = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, '0'));
  const MINUTES = Array.from({ length: 60 }, (_, i) => String(i).padStart(2, '0'));


  const DEFAULT_TEMPLATE_DATA = {
    nutrition: {
      schedule: [
        { time: "08:00", task: "" },
        { time: "12:00", task: "" },
        { time: "16:00", task: "" },
        { time: "20:00", task: "" }
      ],
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
      gratitude: ["Family", "Good health", "Sunshine"],
      affirmations: "",
      sleepHours: 7,
      productivity: 3,
      notes: ""
    },
    minimal: {
      focus: "",
      todo: [
        { id: "t1", text: "Routine task 1", checked: false },
        { id: "t2", text: "Routine task 2", checked: false },
      ],
      schedule: [
        { time: "09:00", task: "" },
        { time: "14:00", task: "" },
        { time: "19:00", task: "" }
      ],
      notes: ""
    },
    cute: {
      focus: "",
      afternoonSchedule: [
        { id: "a1", text: "Lunch break", checked: false },
        { id: "a2", text: "Read / study", checked: false },
      ],
      eveningSchedule: [
        { id: "e1", text: "Evening walk / tea", checked: false },
        { id: "e2", text: "Review daily tasks", checked: false },
      ],
      nightSchedule: [
        { id: "n1", text: "Read a book", checked: false },
        { id: "n2", text: "Bedtime prep", checked: false },
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
      ],
      notes: ""
    },
    student: {
      focus: "",
      classes: [
        { time: "09:00", text: "" },
        { time: "11:00", text: "" }
      ],
      studyTasks: [
        { id: "st1", text: "Revision chapter 2", checked: false },
        { id: "st2", text: "Practice math problems", checked: false }
      ],
      deadlines: [
        { id: "d1", text: "" }
      ],
      notes: ""
    },
    fitness: {
      workout: "",
      waterGlasses: 4,
      calories: "",
      weight: "",
      productivity: 3,
      notes: ""
    },
    exam: {
      subjects: [
        {
          id: "sub_1",
          name: "",
          examDate: "",
          topics: [
            { id: "topic_1", text: "Revision Topic", checked: false }
          ],
          studyHours: 4,
          productivity: 3
        }
      ],
      notes: ""
    },
    travel: {
      destination: "",
      duration: "",
      packingList: [
        { id: "tr1", text: "Passport & Tickets", checked: false },
        { id: "tr2", text: "Phone Charger", checked: false }
      ],
      itinerary: [
        { time: "Day 1", task: "Arrival & Hotel Check-in" }
      ],
      notes: ""
    },
    shopping: {
      store: "",
      budget: "",
      items: [
        { id: "sh1", text: "Groceries", checked: false }
      ],
      notes: ""
    },
    finance: {
      budgetLimit: "",
      income: "",
      savingsGoal: "",
      expenses: [
        { id: "fn1", text: "Groceries - $50", checked: false },
        { id: "fn2", text: "Transport - $20", checked: false }
      ],
      notes: ""
    },
    investment: {
      investmentGoal: "",
      dailyAmount: "",
      assets: [
        { id: "in1", text: "Stocks - $20", checked: false },
        { id: "in2", text: "Mutual Funds - $30", checked: false }
      ],
      productivity: 3,
      notes: ""
    },
    medical: {
      shiftInfo: {
        role: "Resident",
        shiftTime: "08:00 - 16:00",
        onCall: false
      },
      patients: [
        {
          id: "p1",
          bedNumber: "Bed 10A",
          diagnosis: "Post-op Recovery",
          vitalsChecked: false,
          roundsDone: false
        }
      ],
      clinicalTasks: [
        { id: "ct1", text: "Review blood reports", checked: false },
        { id: "ct2", text: "Prepare discharge summaries", checked: false }
      ],
      clinicianCare: {
        hydrationGlasses: 4,
        stressLevel: 3,
        lunchBreak: false
      },
      notes: ""
    },
    med_study: {
      studyGoal: "",
      subjects: [
        {
          id: "ms1",
          name: "Anatomy",
          studyDuration: "2 hours",
          rating: 3,
          topics: [
            { id: "mst1_1", text: "Coronary Arteries", duration: "45 mins", checked: false },
            { id: "mst1_2", text: "Cardiac Chambers", duration: "30 mins", checked: false }
          ],
          routine: [
            { id: "r1_1", time: "08:00", task: "Ward rounds & clinical cases", checked: false },
            { id: "r1_2", time: "14:00", task: "Library study & lecture", checked: false },
            { id: "r1_3", time: "18:00", task: "M&M conference review", checked: false },
            { id: "r1_4", time: "22:00", task: "Self study & pathology notes", checked: false }
          ]
        },
        {
          id: "ms2",
          name: "Pharmacology",
          studyDuration: "1 hour",
          rating: 4,
          topics: [
            { id: "mst2_1", text: "Beta Blockers", duration: "30 mins", checked: false },
            { id: "mst2_2", text: "Calcium Channel Blockers", duration: "30 mins", checked: false }
          ],
          routine: [
            { id: "r2_1", time: "08:00", task: "Ward rounds & clinical cases", checked: false },
            { id: "r2_2", time: "14:00", task: "Library study & lecture", checked: false },
            { id: "r2_3", time: "18:00", task: "M&M conference review", checked: false },
            { id: "r2_4", time: "22:00", task: "Self study & pathology notes", checked: false }
          ]
        }
      ],
      clinicalLog: [
        { id: "cl1", text: "Observe suture removal in Ward 3", checked: false },
        { id: "cl2", text: "Review ABG reports of ICU patient", checked: false }
      ],
      notes: ""
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

  // Exam Subject / Topics Helpers
  const addSubject = () => {
    setTemplateData(prev => {
      const updated = { ...prev };
      const newSubject = {
        id: `sub_${Date.now()}`,
        name: "",
        examDate: "",
        topics: [
          { id: `topic_${Date.now()}`, text: "Revision Topic", checked: false }
        ],
        studyHours: 4,
        productivity: 3
      };
      updated.subjects = [...(updated.subjects || []), newSubject];
      return updated;
    });
  };

  const removeSubject = (subjectId) => {
    setTemplateData(prev => {
      const updated = { ...prev };
      updated.subjects = (updated.subjects || []).filter(sub => sub.id !== subjectId);
      return updated;
    });
  };

  const updateSubjectField = (subjectId, key, value) => {
    setTemplateData(prev => {
      const updated = { ...prev };
      updated.subjects = (updated.subjects || []).map(sub => 
        sub.id === subjectId ? { ...sub, [key]: value } : sub
      );
      return updated;
    });
  };

  const addSubjectTopic = (subjectId, defaultText = "") => {
    setTemplateData(prev => {
      const updated = { ...prev };
      updated.subjects = (updated.subjects || []).map(sub => {
        if (sub.id === subjectId) {
          return {
            ...sub,
            topics: [...(sub.topics || []), { id: `topic_${Date.now()}`, text: defaultText, checked: false }]
          };
        }
        return sub;
      });
      return updated;
    });
  };

  const updateSubjectTopicText = (subjectId, topicId, text) => {
    setTemplateData(prev => {
      const updated = { ...prev };
      updated.subjects = (updated.subjects || []).map(sub => {
        if (sub.id === subjectId) {
          return {
            ...sub,
            topics: (sub.topics || []).map(t => t.id === topicId ? { ...t, text } : t)
          };
        }
        return sub;
      });
      return updated;
    });
  };

  const removeSubjectTopic = (subjectId, topicId) => {
    setTemplateData(prev => {
      const updated = { ...prev };
      updated.subjects = (updated.subjects || []).map(sub => {
        if (sub.id === subjectId) {
          return {
            ...sub,
            topics: (sub.topics || []).filter(t => t.id !== topicId)
          };
        }
        return sub;
      });
      return updated;
    });
  };

  const toggleSubjectTopic = (subjectId, topicId) => {
    setTemplateData(prev => {
      const updated = { ...prev };
      updated.subjects = (updated.subjects || []).map(sub => {
        if (sub.id === subjectId) {
          return {
            ...sub,
            topics: (sub.topics || []).map(t => t.id === topicId ? { ...t, checked: !t.checked } : t)
          };
        }
        return sub;
      });
      return updated;
    });
  };

  // Medical Helpers
  const addMedicalPatient = () => {
    setTemplateData(prev => {
      const updated = { ...prev };
      const newPatient = {
        id: `p_${Date.now()}`,
        bedNumber: "",
        diagnosis: "",
        vitalsChecked: false,
        roundsDone: false
      };
      updated.patients = [...(updated.patients || []), newPatient];
      return updated;
    });
  };

  const removeMedicalPatient = (patientId) => {
    setTemplateData(prev => {
      const updated = { ...prev };
      updated.patients = (updated.patients || []).filter(p => p.id !== patientId);
      return updated;
    });
  };

  const updatePatientField = (patientId, key, value) => {
    setTemplateData(prev => {
      const updated = { ...prev };
      updated.patients = (updated.patients || []).map(p => 
        p.id === patientId ? { ...p, [key]: value } : p
      );
      return updated;
    });
  };

  // Medical Student/Study Helpers
  const addMedStudySubject = () => {
    setTemplateData(prev => {
      const updated = { ...prev };
      const newSub = {
        id: `ms_${Date.now()}`,
        name: "",
        studyDuration: "",
        rating: 3,
        topics: [
          { id: `mst_${Date.now()}_1`, text: "", duration: "", checked: false }
        ],
        routine: [
          { id: `r_${Date.now()}_1`, time: "08:00", task: "", checked: false },
          { id: `r_${Date.now()}_2`, time: "12:00", task: "", checked: false },
          { id: `r_${Date.now()}_3`, time: "18:00", task: "", checked: false },
          { id: `r_${Date.now()}_4`, time: "22:00", task: "", checked: false }
        ]
      };
      updated.subjects = [...(updated.subjects || []), newSub];
      return updated;
    });
  };

  const removeMedStudySubject = (subId) => {
    setTemplateData(prev => {
      const updated = { ...prev };
      updated.subjects = (updated.subjects || []).filter(s => s.id !== subId);
      return updated;
    });
  };

  const updateMedStudySubjectField = (subId, key, value) => {
    setTemplateData(prev => {
      const updated = { ...prev };
      updated.subjects = (updated.subjects || []).map(s => 
        s.id === subId ? { ...s, [key]: value } : s
      );
      return updated;
    });
  };

  const updateMedStudySubjectRoutineField = (subId, itemId, field, value) => {
    setTemplateData(prev => {
      const updated = { ...prev };
      updated.subjects = (updated.subjects || []).map(s => {
        if (s.id === subId) {
          return {
            ...s,
            routine: getSafeRoutineArray(s.routine).map(r => 
              r.id === itemId ? { ...r, [field]: value } : r
            )
          };
        }
        return s;
      });
      return updated;
    });
  };

  const addMedStudySubjectRoutineItem = (subId) => {
    setTemplateData(prev => {
      const updated = { ...prev };
      updated.subjects = (updated.subjects || []).map(s => {
        if (s.id === subId) {
          const newRoutine = {
            id: `r_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
            time: "12:00",
            task: "",
            checked: false
          };
          return {
            ...s,
            routine: [...getSafeRoutineArray(s.routine), newRoutine]
          };
        }
        return s;
      });
      return updated;
    });
  };

  const removeMedStudySubjectRoutineItem = (subId, itemId) => {
    setTemplateData(prev => {
      const updated = { ...prev };
      updated.subjects = (updated.subjects || []).map(s => {
        if (s.id === subId) {
          return {
            ...s,
            routine: getSafeRoutineArray(s.routine).filter(r => r.id !== itemId)
          };
        }
        return s;
      });
      return updated;
    });
  };

  const addMedStudySubjectTopic = (subId) => {
    setTemplateData(prev => {
      const updated = { ...prev };
      updated.subjects = (updated.subjects || []).map(s => {
        if (s.id === subId) {
          const newTopic = {
            id: `mst_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
            text: "",
            duration: "",
            checked: false
          };
          return {
            ...s,
            topics: [...(s.topics || []), newTopic]
          };
        }
        return s;
      });
      return updated;
    });
  };

  const removeMedStudySubjectTopic = (subId, topicId) => {
    setTemplateData(prev => {
      const updated = { ...prev };
      updated.subjects = (updated.subjects || []).map(s => {
        if (s.id === subId) {
          return {
            ...s,
            topics: (s.topics || []).filter(t => t.id !== topicId)
          };
        }
        return s;
      });
      return updated;
    });
  };

  const updateMedStudySubjectTopicField = (subId, topicId, field, value) => {
    setTemplateData(prev => {
      const updated = { ...prev };
      updated.subjects = (updated.subjects || []).map(s => {
        if (s.id === subId) {
          return {
            ...s,
            topics: (s.topics || []).map(t => 
              t.id === topicId ? { ...t, [field]: value } : t
            )
          };
        }
        return s;
      });
      return updated;
    });
  };


  // Time Picker Helpers
  const openTimePicker = (type, index) => {
    setTimePickerTarget({ type, index });
    let currentTime = "08:00";
    
    if (type === 'schedule') {
      currentTime = templateData.schedule[index]?.time || "08:00";
    } else if (type === 'classes') {
      currentTime = templateData.classes[index]?.time || "09:00";
    } else if (type === 'medicalStart') {
      const shiftTime = templateData.shiftInfo?.shiftTime || "08:00 - 16:00";
      currentTime = shiftTime.split(" - ")[0] || "08:00";
    } else if (type === 'medicalEnd') {
      const shiftTime = templateData.shiftInfo?.shiftTime || "08:00 - 16:00";
      currentTime = shiftTime.split(" - ")[1] || "16:00";
    } else if (type.startsWith('med_study|')) {
      const [, subId, itemId] = type.split('|');
      const sub = (templateData.subjects || []).find(s => s.id === subId);
      const rArr = getSafeRoutineArray(sub?.routine);
      const item = rArr.find(r => r.id === itemId);
      currentTime = item?.time || "08:00";
    }
    
    // Parse HH:MM
    const parts = currentTime.split(":");
    const hr = parts[0] ? parts[0].trim() : "08";
    const min = parts[1] ? parts[1].trim() : "00";
    
    setSelectedHour(hr.padStart(2, '0'));
    setSelectedMinute(min.padStart(2, '0'));
    setIsTimePickerVisible(true);
  };

  const confirmTimeSelection = () => {
    if (!timePickerTarget) return;
    const formattedTime = `${selectedHour}:${selectedMinute}`;
    const { type, index } = timePickerTarget;
    
    if (type === 'schedule') {
      const updatedSchedule = [...(templateData.schedule || [])];
      if (updatedSchedule[index]) {
        updatedSchedule[index].time = formattedTime;
        updateTemplateField('schedule', null, updatedSchedule);
      }
    } else if (type === 'classes') {
      const updatedClasses = [...(templateData.classes || [])];
      if (updatedClasses[index]) {
        updatedClasses[index].time = formattedTime;
        updateTemplateField('classes', null, updatedClasses);
      }
    } else if (type === 'medicalStart' || type === 'medicalEnd') {
      const shift = templateData.shiftInfo || { role: "Resident", shiftTime: "08:00 - 16:00", onCall: false };
      const times = (shift.shiftTime || "08:00 - 16:00").split(" - ");
      let start = times[0] ? times[0].trim() : "08:00";
      let end = times[1] ? times[1].trim() : "16:00";
      
      if (type === 'medicalStart') {
        start = formattedTime;
      } else {
        end = formattedTime;
      }
      
      updateTemplateField('shiftInfo', 'shiftTime', `${start} - ${end}`);
    } else if (type.startsWith('med_study|')) {
      const [, subId, itemId] = type.split('|');
      const updatedSubjects = (templateData.subjects || []).map(s => {
        if (s.id === subId) {
          const rArr = getSafeRoutineArray(s.routine);
          return {
            ...s,
            routine: rArr.map(r => 
              r.id === itemId ? { ...r, time: formattedTime } : r
            )
          };
        }
        return s;
      });
      updateTemplateField('subjects', null, updatedSubjects);
    }
    
    setIsTimePickerVisible(false);
    setTimePickerTarget(null);
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
          flexWrap: 'wrap',
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
        timePickerOverlay: {
          flex: 1,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          justifyContent: 'center',
          alignItems: 'center',
        },
        timePickerContainer: {
          width: 280,
          backgroundColor: '#FFFFFF',
          borderRadius: 20,
          padding: 20,
          alignItems: 'center',
          elevation: 5,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.25,
          shadowRadius: 4,
        },
        timePickerTitle: {
          fontSize: 16,
          fontWeight: '800',
          color: '#1C1C1C',
          marginBottom: 15,
        },
        timePickerColumnsRow: {
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          height: 180,
          width: '100%',
        },
        timePickerColumnWrapper: {
          flex: 1,
          alignItems: 'center',
        },
        timePickerColumnLabel: {
          fontSize: 12,
          fontWeight: '700',
          color: '#78909C',
          marginBottom: 6,
        },
        timePickerColumnScroll: {
          width: '100%',
          backgroundColor: '#F5F7F8',
          borderRadius: 12,
        },
        timePickerItem: {
          paddingVertical: 10,
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: 8,
          marginHorizontal: 6,
          marginVertical: 2,
        },
        timePickerItemActive: {
          backgroundColor: '#37474F',
        },
        timePickerItemText: {
          fontSize: 16,
          fontWeight: '700',
          color: '#455A64',
        },
        timePickerItemTextActive: {
          color: '#FFFFFF',
        },
        timePickerColon: {
          fontSize: 28,
          fontWeight: '900',
          color: '#37474F',
          marginHorizontal: 10,
          paddingBottom: 20,
        },
        timePickerActionsRow: {
          flexDirection: 'row',
          justifyContent: 'space-between',
          width: '100%',
          marginTop: 20,
          gap: 10,
        },
        timePickerBtn: {
          flex: 1,
          paddingVertical: 12,
          borderRadius: 12,
          alignItems: 'center',
          justifyContent: 'center',
        },
        timePickerBtnCancel: {
          backgroundColor: '#ECEFF1',
        },
        timePickerBtnConfirm: {
          backgroundColor: '#37474F',
        },
        timePickerBtnTextCancel: {
          color: '#546E7A',
          fontSize: 14,
          fontWeight: '700',
        },
        timePickerBtnTextConfirm: {
          color: '#FFFFFF',
          fontSize: 14,
          fontWeight: '800',
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
      const grats = (data.gratitude || []).filter(g => g && typeof g === 'string' && g.trim() !== '').map(g => `- ${g}`).join('\n');
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
        if (s.routine) {
          Object.values(s.routine).forEach(r => {
            totalRoutine++;
            if (r.checked) routineDone++;
          });
        }
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
          {(templateData.schedule || []).map((item, idx) => (
            <View key={idx} style={styles.templateTimelineRow}>
              <View 
                style={{
                  width: 80,
                  borderBottomWidth: 1.5,
                  borderBottomColor: '#90CAF9',
                  paddingVertical: 2,
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 2
                }}
              >
                <TextInput
                  value={item.time}
                  onChangeText={(val) => {
                    const updatedSchedule = [...templateData.schedule];
                    updatedSchedule[idx].time = val;
                    updateTemplateField('schedule', null, updatedSchedule);
                  }}
                  placeholder="08:00"
                  placeholderTextColor="#90A4AE"
                  style={{ fontSize: 13, fontWeight: '800', flex: 1, color: '#1A237E', padding: 0 }}
                />
                <Pressable onPress={() => openTimePicker('schedule', idx)} style={{ padding: 2 }}>
                  <Ionicons name="time-outline" size={14} color="#1A237E" />
                </Pressable>
              </View>


              <TextInput
                value={item.task}
                onChangeText={(txt) => {
                  const updatedSchedule = [...templateData.schedule];
                  updatedSchedule[idx].task = txt;
                  updateTemplateField('schedule', null, updatedSchedule);
                }}
                placeholder="Schedule task..."
                placeholderTextColor="#90A4AE"
                style={[styles.templateTimelineInput, { borderBottomColor: '#90CAF9', color: '#1C1C1C' }]}
              />
              <Pressable onPress={() => {
                const updatedSchedule = templateData.schedule.filter((_, i) => i !== idx);
                updateTemplateField('schedule', null, updatedSchedule);
              }} style={{ padding: 4 }}>
                <Ionicons name="close" size={16} color="#EF4444" />
              </Pressable>
            </View>
          ))}
          <Pressable 
            onPress={() => {
              const updatedSchedule = [...(templateData.schedule || []), { time: "12:00", task: "" }];
              updateTemplateField('schedule', null, updatedSchedule);
            }}
            style={[styles.templateAddListItemBtn, { borderColor: '#90CAF9' }]}
          >
            <Ionicons name="add" size={16} color="#0D47A1" />
            <Text style={{ color: '#0D47A1', fontSize: 13, fontWeight: '700' }}>Add Time Slot</Text>
          </Pressable>

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
          <Text style={[styles.templateSectionHeader, { color: '#880E4F' }]}>Today&apos;s Mood</Text>
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
                style={[styles.templateInputUnderline, { borderBottomColor: '#F48FB1', color: '#1C1C1C', flex: 1 }]}
              />
              <Pressable onPress={() => {
                const updatedGrat = templateData.gratitude.filter((_, idx) => idx !== index);
                updateTemplateField('gratitude', null, updatedGrat);
              }} style={{ padding: 4 }}>
                <Ionicons name="close" size={16} color="#EC407A" />
              </Pressable>
            </View>
          ))}
          <Pressable 
            onPress={() => {
              const updatedGrat = [...(templateData.gratitude || []), ""];
              updateTemplateField('gratitude', null, updatedGrat);
            }}
            style={[styles.templateAddListItemBtn, { borderColor: '#F48FB1' }]}
          >
            <Ionicons name="add" size={16} color="#D81B60" />
            <Text style={{ color: '#D81B60', fontSize: 13, fontWeight: '700' }}>Add Gratitude Entry</Text>
          </Pressable>

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

          {/* Notes */}
          <Text style={[styles.templateSectionHeader, { color: '#880E4F', marginTop: 15 }]}>Planner Notes</Text>
          <TextInput
            value={templateData.notes}
            onChangeText={(txt) => updateTemplateField('notes', null, txt)}
            placeholder="Jot down notes..."
            placeholderTextColor="#F48FB1"
            style={[styles.templateInputBoxMultiline, { borderColor: '#F48FB1', color: '#1C1C1C' }]}
            multiline
            numberOfLines={3}
          />
        </View>
      );
    }

    if (templateType === 'minimal') {
      return (
        <View style={[styles.templateContainer, { backgroundColor: '#F9F6F0', borderColor: '#D7CCC8' }]}>
          {/* Today's Focus */}
          <Text style={[styles.templateSectionHeader, { color: '#3E2723' }]}>Today&apos;s Focus</Text>
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
          {(templateData.schedule || []).map((item, idx) => (
            <View key={idx} style={styles.templateTimelineRow}>
              <View 
                style={{
                  width: 80,
                  borderBottomWidth: 1.5,
                  borderBottomColor: '#D7CCC8',
                  paddingVertical: 2,
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 2
                }}
              >
                <TextInput
                  value={item.time}
                  onChangeText={(val) => {
                    const updatedSchedule = [...templateData.schedule];
                    updatedSchedule[idx].time = val;
                    updateTemplateField('schedule', null, updatedSchedule);
                  }}
                  placeholder="09:00"
                  placeholderTextColor="#8D6E63"
                  style={{ fontSize: 13, fontWeight: '800', flex: 1, color: '#5D4037', padding: 0 }}
                />
                <Pressable onPress={() => openTimePicker('schedule', idx)} style={{ padding: 2 }}>
                  <Ionicons name="time-outline" size={14} color="#5D4037" />
                </Pressable>
              </View>


              <TextInput
                value={item.task}
                onChangeText={(txt) => {
                  const updatedSchedule = [...templateData.schedule];
                  updatedSchedule[idx].task = txt;
                  updateTemplateField('schedule', null, updatedSchedule);
                }}
                placeholder="Schedule task..."
                placeholderTextColor="#8D6E63"
                style={[styles.templateTimelineInput, { borderBottomColor: '#D7CCC8', color: '#1C1C1C' }]}
              />
              <Pressable onPress={() => {
                const updatedSchedule = templateData.schedule.filter((_, i) => i !== idx);
                updateTemplateField('schedule', null, updatedSchedule);
              }} style={{ padding: 4 }}>
                <Ionicons name="close" size={16} color="#8D6E63" />
              </Pressable>
            </View>
          ))}
          <Pressable 
            onPress={() => {
              const updatedSchedule = [...(templateData.schedule || []), { time: "12:00", task: "" }];
              updateTemplateField('schedule', null, updatedSchedule);
            }}
            style={[styles.templateAddListItemBtn, { borderColor: '#D7CCC8' }]}
          >
            <Ionicons name="add" size={16} color="#5D4037" />
            <Text style={{ color: '#5D4037', fontSize: 13, fontWeight: '700' }}>Add Time Slot</Text>
          </Pressable>

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

          {/* Evening Schedule */}
          <Text style={[styles.templateSectionHeader, { color: '#F57F17', marginTop: 15 }]}>🌆 Evening Schedule</Text>
          {(templateData.eveningSchedule || []).map(item => (
            <View key={item.id} style={styles.templateListItemRow}>
              <Pressable onPress={() => toggleTemplateListItem('eveningSchedule', item.id)} style={{ padding: 4 }}>
                <Ionicons 
                  name={item.checked ? "checkbox" : "square-outline"} 
                  size={20} 
                  color="#FBC02D" 
                />
              </Pressable>
              <TextInput
                value={item.text}
                onChangeText={(txt) => updateTemplateListItemText('eveningSchedule', item.id, txt)}
                placeholder="Schedule item..."
                placeholderTextColor="#FBC02D"
                style={[styles.templateListItemInput, { color: '#1C1C1C' }, item.checked && { textDecorationLine: 'line-through', opacity: 0.6 }]}
              />
              <Pressable onPress={() => removeTemplateListItem('eveningSchedule', item.id)} style={{ padding: 4 }}>
                <Ionicons name="close" size={16} color="#FBC02D" />
              </Pressable>
            </View>
          ))}
          <Pressable 
            onPress={() => addTemplateListItem('eveningSchedule', "New Task")}
            style={[styles.templateAddListItemBtn, { borderColor: '#FFF59D' }]}
          >
            <Ionicons name="add" size={16} color="#F57F17" />
            <Text style={{ color: '#F57F17', fontSize: 13, fontWeight: '700' }}>Add Task</Text>
          </Pressable>

          {/* Night Schedule */}
          <Text style={[styles.templateSectionHeader, { color: '#F57F17', marginTop: 15 }]}>🌙 Night Schedule</Text>
          {(templateData.nightSchedule || []).map(item => (
            <View key={item.id} style={styles.templateListItemRow}>
              <Pressable onPress={() => toggleTemplateListItem('nightSchedule', item.id)} style={{ padding: 4 }}>
                <Ionicons 
                  name={item.checked ? "checkbox" : "square-outline"} 
                  size={20} 
                  color="#FBC02D" 
                />
              </Pressable>
              <TextInput
                value={item.text}
                onChangeText={(txt) => updateTemplateListItemText('nightSchedule', item.id, txt)}
                placeholder="Schedule item..."
                placeholderTextColor="#FBC02D"
                style={[styles.templateListItemInput, { color: '#1C1C1C' }, item.checked && { textDecorationLine: 'line-through', opacity: 0.6 }]}
              />
              <Pressable onPress={() => removeTemplateListItem('nightSchedule', item.id)} style={{ padding: 4 }}>
                <Ionicons name="close" size={16} color="#FBC02D" />
              </Pressable>
            </View>
          ))}
          <Pressable 
            onPress={() => addTemplateListItem('nightSchedule', "New Task")}
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

          {/* Notes */}
          <Text style={[styles.templateSectionHeader, { color: '#1B5E20', marginTop: 15 }]}>Planner Notes</Text>
          <TextInput
            value={templateData.notes}
            onChangeText={(txt) => updateTemplateField('notes', null, txt)}
            placeholder="Jot down notes..."
            placeholderTextColor="#A5D6A7"
            style={[styles.templateInputBoxMultiline, { borderColor: '#A5D6A7', color: '#1C1C1C' }]}
            multiline
            numberOfLines={3}
          />
        </View>
      );
    }

    if (templateType === 'student') {
      return (
        <View style={[styles.templateContainer, { backgroundColor: '#F3E5F5', borderColor: '#E1BEE7' }]}>
          {/* Focus */}
          <Text style={[styles.templateSectionHeader, { color: '#6A1B9A' }]}>🎓 Today&apos;s Study Focus</Text>
          <TextInput
            value={templateData.focus}
            onChangeText={(txt) => updateTemplateField('focus', null, txt)}
            placeholder="Main study goal today..."
            placeholderTextColor="#BA68C8"
            style={[styles.templateInputUnderline, { borderBottomColor: '#BA68C8', color: '#1C1C1C' }]}
          />

          {/* Classes / Lectures */}
          <Text style={[styles.templateSectionHeader, { color: '#6A1B9A', marginTop: 15 }]}>📚 Classes & Lectures</Text>
          {(templateData.classes || []).map((item, idx) => (
            <View key={idx} style={styles.templateTimelineRow}>
              <View 
                style={{
                  width: 80,
                  borderBottomWidth: 1.5,
                  borderBottomColor: '#BA68C8',
                  paddingVertical: 2,
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 2
                }}
              >
                <TextInput
                  value={item.time}
                  onChangeText={(val) => {
                    const updatedClasses = [...templateData.classes];
                    updatedClasses[idx].time = val;
                    updateTemplateField('classes', null, updatedClasses);
                  }}
                  placeholder="09:00"
                  placeholderTextColor="#BA68C8"
                  style={{ fontSize: 13, fontWeight: '800', flex: 1, color: '#6A1B9A', padding: 0 }}
                />
                <Pressable onPress={() => openTimePicker('classes', idx)} style={{ padding: 2 }}>
                  <Ionicons name="time-outline" size={14} color="#6A1B9A" />
                </Pressable>
              </View>


              <TextInput
                value={item.text}
                onChangeText={(txt) => {
                  const updatedClasses = [...templateData.classes];
                  updatedClasses[idx].text = txt;
                  updateTemplateField('classes', null, updatedClasses);
                }}
                placeholder="Subject / Class name..."
                placeholderTextColor="#BA68C8"
                style={[styles.templateTimelineInput, { borderBottomColor: '#BA68C8', color: '#1C1C1C' }]}
              />
              <Pressable onPress={() => {
                const updatedClasses = templateData.classes.filter((_, i) => i !== idx);
                updateTemplateField('classes', null, updatedClasses);
              }} style={{ padding: 4 }}>
                <Ionicons name="close" size={16} color="#BA68C8" />
              </Pressable>
            </View>
          ))}
          <Pressable 
            onPress={() => {
              const updatedClasses = [...(templateData.classes || []), { time: "09:00", text: "" }];
              updateTemplateField('classes', null, updatedClasses);
            }}
            style={[styles.templateAddListItemBtn, { borderColor: '#E1BEE7' }]}
          >
            <Ionicons name="add" size={16} color="#6A1B9A" />
            <Text style={{ color: '#6A1B9A', fontSize: 13, fontWeight: '700' }}>Add Class</Text>
          </Pressable>

          {/* Study Tasks checklist */}
          <Text style={[styles.templateSectionHeader, { color: '#6A1B9A', marginTop: 15 }]}>✏️ Study Tasks & Homework</Text>
          {(templateData.studyTasks || []).map(item => (
            <View key={item.id} style={styles.templateListItemRow}>
              <Pressable onPress={() => toggleTemplateListItem('studyTasks', item.id)} style={{ padding: 4 }}>
                <Ionicons 
                  name={item.checked ? "checkbox" : "square-outline"} 
                  size={20} 
                  color="#8E24AA" 
                />
              </Pressable>
              <TextInput
                value={item.text}
                onChangeText={(txt) => updateTemplateListItemText('studyTasks', item.id, txt)}
                placeholder="Task description..."
                placeholderTextColor="#BA68C8"
                style={[styles.templateListItemInput, { color: '#1C1C1C' }, item.checked && { textDecorationLine: 'line-through', opacity: 0.6 }]}
              />
              <Pressable onPress={() => removeTemplateListItem('studyTasks', item.id)} style={{ padding: 4 }}>
                <Ionicons name="close" size={16} color="#8E24AA" />
              </Pressable>
            </View>
          ))}
          <Pressable 
            onPress={() => addTemplateListItem('studyTasks', "New Study Task")}
            style={[styles.templateAddListItemBtn, { borderColor: '#E1BEE7' }]}
          >
            <Ionicons name="add" size={16} color="#6A1B9A" />
            <Text style={{ color: '#6A1B9A', fontSize: 13, fontWeight: '700' }}>Add Task</Text>
          </Pressable>

          {/* Deadlines */}
          <Text style={[styles.templateSectionHeader, { color: '#6A1B9A', marginTop: 15 }]}>⚠️ Upcoming Deadlines & Exams</Text>
          {(templateData.deadlines || []).map((item, idx) => (
            <View key={item.id} style={styles.templateListItemRow}>
              <TextInput
                value={item.text}
                onChangeText={(txt) => {
                  const updatedDeadlines = templateData.deadlines.map(d => d.id === item.id ? { ...d, text: txt } : d);
                  updateTemplateField('deadlines', null, updatedDeadlines);
                }}
                placeholder="Assignment / Exam..."
                placeholderTextColor="#BA68C8"
                style={[styles.templateListItemInput, { color: '#1C1C1C', flex: 1 }]}
              />
              <Pressable onPress={() => {
                const updatedDeadlines = templateData.deadlines.filter(d => d.id !== item.id);
                updateTemplateField('deadlines', null, updatedDeadlines);
              }} style={{ padding: 4 }}>
                <Ionicons name="close" size={16} color="#8E24AA" />
              </Pressable>
            </View>
          ))}
          <Pressable 
            onPress={() => {
              const updatedDeadlines = [...(templateData.deadlines || []), { id: `d_${Date.now()}`, text: "" }];
              updateTemplateField('deadlines', null, updatedDeadlines);
            }}
            style={[styles.templateAddListItemBtn, { borderColor: '#E1BEE7' }]}
          >
            <Ionicons name="add" size={16} color="#6A1B9A" />
            <Text style={{ color: '#6A1B9A', fontSize: 13, fontWeight: '700' }}>Add Deadline</Text>
          </Pressable>

          {/* Notes */}
          <Text style={[styles.templateSectionHeader, { color: '#6A1B9A', marginTop: 15 }]}>📝 Study Notes & Reminders</Text>
          <TextInput
            value={templateData.notes}
            onChangeText={(txt) => updateTemplateField('notes', null, txt)}
            placeholder="Jot down formulas, study notes..."
            placeholderTextColor="#BA68C8"
            style={[styles.templateInputBoxMultiline, { borderColor: '#E1BEE7', color: '#1C1C1C' }]}
            multiline
            numberOfLines={3}
          />
        </View>
      );
    }

    if (templateType === 'fitness') {
      return (
        <View style={[styles.templateContainer, { backgroundColor: '#E0F2F1', borderColor: '#B2DFDB' }]}>
          {/* Workout Target */}
          <Text style={[styles.templateSectionHeader, { color: '#004D40' }]}>🏋️ Workout Target</Text>
          <TextInput
            value={templateData.workout}
            onChangeText={(txt) => updateTemplateField('workout', null, txt)}
            placeholder="Workout plan (e.g. Cardio / Leg Day)..."
            placeholderTextColor="#80CBC4"
            style={[styles.templateInputUnderline, { borderBottomColor: '#80CBC4', color: '#1C1C1C' }]}
          />

          {/* Water Intake */}
          <Text style={[styles.templateSectionHeader, { color: '#004D40', marginTop: 15 }]}>💧 Water Intake (Glasses)</Text>
          <View style={styles.templateStarsRow}>
            {Array.from({ length: 8 }).map((_, i) => {
              const isActive = (templateData.waterGlasses || 0) > i;
              return (
                <Pressable 
                  key={i} 
                  onPress={() => updateTemplateField('waterGlasses', null, i + 1)} 
                  style={{ padding: 4 }}
                >
                  <Ionicons 
                    name={isActive ? "water" : "water-outline"} 
                    size={26} 
                    color={isActive ? "#00BCD4" : "#80CBC4"} 
                  />
                </Pressable>
              );
            })}
          </View>

          {/* Calories and Weight */}
          <View style={styles.templateGridTwoColumn}>
            <View style={styles.templateGridCell}>
              <Text style={[styles.templateGridLabel, { color: '#004D40' }]}>Calories Intake</Text>
              <TextInput
                value={templateData.calories}
                onChangeText={(txt) => updateTemplateField('calories', null, txt)}
                placeholder="e.g. 2000 kcal"
                placeholderTextColor="#80CBC4"
                style={[styles.templateInputBox, { borderColor: '#80CBC4', color: '#1C1C1C' }]}
              />
            </View>
            <View style={styles.templateGridCell}>
              <Text style={[styles.templateGridLabel, { color: '#004D40' }]}>Body Weight</Text>
              <TextInput
                value={templateData.weight}
                onChangeText={(txt) => updateTemplateField('weight', null, txt)}
                placeholder="e.g. 70 kg"
                placeholderTextColor="#80CBC4"
                style={[styles.templateInputBox, { borderColor: '#80CBC4', color: '#1C1C1C' }]}
              />
            </View>
          </View>

          {/* Energy level rating */}
          <Text style={[styles.templateSectionHeader, { color: '#004D40', marginTop: 15 }]}>⚡ Energy Score</Text>
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
          <Text style={[styles.templateSectionHeader, { color: '#004D40', marginTop: 15 }]}>📝 Workout Notes & Reflections</Text>
          <TextInput
            value={templateData.notes}
            onChangeText={(txt) => updateTemplateField('notes', null, txt)}
            placeholder="Jot down notes, stretch logs..."
            placeholderTextColor="#80CBC4"
            style={[styles.templateInputBoxMultiline, { borderColor: '#80CBC4', color: '#1C1C1C' }]}
            multiline
            numberOfLines={3}
          />
        </View>
      );
    }

    if (templateType === 'exam') {
      const subjectsList = templateData.subjects || [];
      return (
        <View style={[styles.templateContainer, { backgroundColor: '#FBE9E7', borderColor: '#FFAB91' }]}>
          <Text style={[styles.templateSectionHeader, { color: '#BF360C', fontSize: 16, fontWeight: '900', marginBottom: 12 }]}>
            🎓 Exam Subjects List
          </Text>

          {subjectsList.map((sub, sIdx) => (
            <View 
              key={sub.id} 
              style={{
                backgroundColor: '#FFFFFF',
                borderRadius: 18,
                padding: 14,
                borderWidth: 1.5,
                borderColor: '#FFAB91',
                marginBottom: 16,
              }}
            >
              {/* Header inside Card */}
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                <Text style={{ fontSize: 14, fontWeight: '800', color: '#BF360C' }}>
                  Subject #{sIdx + 1}
                </Text>
                {subjectsList.length > 1 && (
                  <Pressable onPress={() => removeSubject(sub.id)} style={{ padding: 4 }}>
                    <Ionicons name="trash-outline" size={18} color="#EF5350" />
                  </Pressable>
                )}
              </View>

              {/* Subject Details Grid */}
              <View style={styles.templateGridTwoColumn}>
                <View style={styles.templateGridCell}>
                  <Text style={[styles.templateGridLabel, { color: '#BF360C' }]}>Subject Name</Text>
                  <TextInput
                    value={sub.name}
                    onChangeText={(txt) => updateSubjectField(sub.id, 'name', txt)}
                    placeholder="e.g. Mathematics"
                    placeholderTextColor="#FFAB91"
                    style={[styles.templateInputBox, { borderColor: '#FFAB91', color: '#1C1C1C' }]}
                  />
                </View>
                <View style={styles.templateGridCell}>
                  <Text style={[styles.templateGridLabel, { color: '#BF360C' }]}>Exam Date</Text>
                  <TextInput
                    value={sub.examDate}
                    onChangeText={(txt) => updateSubjectField(sub.id, 'examDate', txt)}
                    placeholder="e.g. June 28"
                    placeholderTextColor="#FFAB91"
                    style={[styles.templateInputBox, { borderColor: '#FFAB91', color: '#1C1C1C' }]}
                  />
                </View>
              </View>

              {/* Study Hours Target */}
              <View style={{ marginVertical: 8 }}>
                <Text style={[styles.templateGridLabel, { color: '#BF360C' }]}>Study Hours Target</Text>
                <TextInput
                  value={String(sub.studyHours || '')}
                  onChangeText={(txt) => {
                    const val = parseInt(txt) || 0;
                    updateSubjectField(sub.id, 'studyHours', val);
                  }}
                  keyboardType="numeric"
                  placeholder="4"
                  placeholderTextColor="#FFAB91"
                  style={[styles.templateInputBox, { borderColor: '#FFAB91', color: '#1C1C1C' }]}
                />
              </View>

              {/* Preparedness Score */}
              <View style={{ marginVertical: 8 }}>
                <Text style={[styles.templateGridLabel, { color: '#BF360C', marginBottom: 4 }]}>Preparedness Score</Text>
                <View style={styles.templateStarsRow}>
                  {[1, 2, 3, 4, 5].map(star => (
                    <Pressable 
                      key={star} 
                      onPress={() => updateSubjectField(sub.id, 'productivity', star)}
                      style={{ padding: 2 }}
                    >
                      <Ionicons 
                        name={star <= (sub.productivity || 0) ? "star" : "star-outline"} 
                        size={22} 
                        color="#D84315" 
                      />
                    </Pressable>
                  ))}
                </View>
              </View>

              {/* Prepared Topics checklist */}
              <Text style={[styles.templateSectionHeader, { color: '#BF360C', marginTop: 10, fontSize: 13 }]}>
                ✏️ Topics to Prepare
              </Text>
              {(sub.topics || []).map(topic => (
                <View key={topic.id} style={styles.templateListItemRow}>
                  <Pressable onPress={() => toggleSubjectTopic(sub.id, topic.id)} style={{ padding: 4 }}>
                    <Ionicons 
                      name={topic.checked ? "checkbox" : "square-outline"} 
                      size={20} 
                      color="#BF360C" 
                    />
                  </Pressable>
                  <TextInput
                    value={topic.text}
                    onChangeText={(txt) => updateSubjectTopicText(sub.id, topic.id, txt)}
                    placeholder="Topic name..."
                    placeholderTextColor="#FFAB91"
                    style={[styles.templateListItemInput, { color: '#1C1C1C' }, topic.checked && { textDecorationLine: 'line-through', opacity: 0.6 }]}
                  />
                  <Pressable onPress={() => removeSubjectTopic(sub.id, topic.id)} style={{ padding: 4 }}>
                    <Ionicons name="close" size={16} color="#BF360C" />
                  </Pressable>
                </View>
              ))}
              <Pressable 
                onPress={() => addSubjectTopic(sub.id, "New Topic")}
                style={[styles.templateAddListItemBtn, { borderColor: '#FFAB91', marginTop: 8 }]}
              >
                <Ionicons name="add" size={16} color="#BF360C" />
                <Text style={{ color: '#BF360C', fontSize: 13, fontWeight: '700' }}>Add Topic</Text>
              </Pressable>
            </View>
          ))}

          {/* Add Subject Button */}
          <Pressable 
            onPress={addSubject}
            style={[styles.templateAddListItemBtn, { borderColor: '#BF360C', backgroundColor: '#FFFFFF', borderStyle: 'solid', paddingVertical: 12, marginBottom: 15 }]}
          >
            <Ionicons name="add-circle" size={18} color="#BF360C" />
            <Text style={{ color: '#BF360C', fontSize: 14, fontWeight: '800' }}>Add Subject</Text>
          </Pressable>

          {/* General Notes */}
          <Text style={[styles.templateSectionHeader, { color: '#BF360C', marginTop: 10 }]}>📝 General Study Notes</Text>
          <TextInput
            value={templateData.notes}
            onChangeText={(txt) => updateTemplateField('notes', null, txt)}
            placeholder="Jot down formulas, notes, exam center details..."
            placeholderTextColor="#FFAB91"
            style={[styles.templateInputBoxMultiline, { borderColor: '#FFAB91', color: '#1C1C1C' }]}
            multiline
            numberOfLines={3}
          />
        </View>
      );
    }

    if (templateType === 'travel') {
      return (
        <View style={[styles.templateContainer, { backgroundColor: '#E0F7FA', borderColor: '#80DEEA' }]}>
          {/* Destination & Duration */}
          <View style={styles.templateGridTwoColumn}>
            <View style={styles.templateGridCell}>
              <Text style={[styles.templateGridLabel, { color: '#006064' }]}>Destination</Text>
              <TextInput
                value={templateData.destination}
                onChangeText={(txt) => updateTemplateField('destination', null, txt)}
                placeholder="e.g. Paris, France"
                placeholderTextColor="#80DEEA"
                style={[styles.templateInputBox, { borderColor: '#80DEEA', color: '#1C1C1C' }]}
              />
            </View>
            <View style={styles.templateGridCell}>
              <Text style={[styles.templateGridLabel, { color: '#006064' }]}>Duration</Text>
              <TextInput
                value={templateData.duration}
                onChangeText={(txt) => updateTemplateField('duration', null, txt)}
                placeholder="e.g. 5 Days"
                placeholderTextColor="#80DEEA"
                style={[styles.templateInputBox, { borderColor: '#80DEEA', color: '#1C1C1C' }]}
              />
            </View>
          </View>

          {/* Packing List checklist */}
          <Text style={[styles.templateSectionHeader, { color: '#006064' }]}>🎒 Packing List</Text>
          {(templateData.packingList || []).map(item => (
            <View key={item.id} style={styles.templateListItemRow}>
              <Pressable onPress={() => toggleTemplateListItem('packingList', item.id)} style={{ padding: 4 }}>
                <Ionicons 
                  name={item.checked ? "checkbox" : "square-outline"} 
                  size={20} 
                  color="#006064" 
                />
              </Pressable>
              <TextInput
                value={item.text}
                onChangeText={(txt) => updateTemplateListItemText('packingList', item.id, txt)}
                placeholder="Item name..."
                placeholderTextColor="#80DEEA"
                style={[styles.templateListItemInput, { color: '#1C1C1C' }, item.checked && { textDecorationLine: 'line-through', opacity: 0.6 }]}
              />
              <Pressable onPress={() => removeTemplateListItem('packingList', item.id)} style={{ padding: 4 }}>
                <Ionicons name="close" size={16} color="#006064" />
              </Pressable>
            </View>
          ))}
          <Pressable 
            onPress={() => addTemplateListItem('packingList', "New Item")}
            style={[styles.templateAddListItemBtn, { borderColor: '#80DEEA' }]}
          >
            <Ionicons name="add" size={16} color="#006064" />
            <Text style={{ color: '#006064', fontSize: 13, fontWeight: '700' }}>Add Item</Text>
          </Pressable>

          {/* Itinerary Timeline */}
          <Text style={[styles.templateSectionHeader, { color: '#006064', marginTop: 15 }]}>🗺️ Itinerary / Plans</Text>
          {(templateData.itinerary || []).map((item, idx) => (
            <View key={idx} style={styles.templateTimelineRow}>
              <TextInput
                value={item.time}
                onChangeText={(val) => {
                  const updatedItinerary = [...templateData.itinerary];
                  updatedItinerary[idx].time = val;
                  updateTemplateField('itinerary', null, updatedItinerary);
                }}
                placeholder="Day 1"
                placeholderTextColor="#80DEEA"
                style={{ fontSize: 14, fontWeight: '800', width: 60, color: '#006064', borderBottomWidth: 1, borderBottomColor: '#80DEEA', paddingVertical: 4 }}
              />
              <TextInput
                value={item.task}
                onChangeText={(txt) => {
                  const updatedItinerary = [...templateData.itinerary];
                  updatedItinerary[idx].task = txt;
                  updateTemplateField('itinerary', null, updatedItinerary);
                }}
                placeholder="Plans..."
                placeholderTextColor="#80DEEA"
                style={[styles.templateTimelineInput, { borderBottomColor: '#80DEEA', color: '#1C1C1C' }]}
              />
              <Pressable onPress={() => {
                const updatedItinerary = templateData.itinerary.filter((_, i) => i !== idx);
                updateTemplateField('itinerary', null, updatedItinerary);
              }} style={{ padding: 4 }}>
                <Ionicons name="close" size={16} color="#006064" />
              </Pressable>
            </View>
          ))}
          <Pressable 
            onPress={() => {
              const updatedItinerary = [...(templateData.itinerary || []), { time: "Day 1", task: "" }];
              updateTemplateField('itinerary', null, updatedItinerary);
            }}
            style={[styles.templateAddListItemBtn, { borderColor: '#80DEEA' }]}
          >
            <Ionicons name="add" size={16} color="#006064" />
            <Text style={{ color: '#006064', fontSize: 13, fontWeight: '700' }}>Add Plan Slot</Text>
          </Pressable>

          {/* Notes */}
          <Text style={[styles.templateSectionHeader, { color: '#006064', marginTop: 15 }]}>📝 Travel Notes & Details</Text>
          <TextInput
            value={templateData.notes}
            onChangeText={(txt) => updateTemplateField('notes', null, txt)}
            placeholder="Flights, hotels, budget references..."
            placeholderTextColor="#80DEEA"
            style={[styles.templateInputBoxMultiline, { borderColor: '#80DEEA', color: '#1C1C1C' }]}
            multiline
            numberOfLines={3}
          />
        </View>
      );
    }

    if (templateType === 'shopping') {
      return (
        <View style={[styles.templateContainer, { backgroundColor: '#FFF8E1', borderColor: '#FFE082' }]}>
          {/* Store Name & Budget Limit */}
          <View style={styles.templateGridTwoColumn}>
            <View style={styles.templateGridCell}>
              <Text style={[styles.templateGridLabel, { color: '#E65100' }]}>Store / App</Text>
              <TextInput
                value={templateData.store}
                onChangeText={(txt) => updateTemplateField('store', null, txt)}
                placeholder="e.g. Costco / Amazon"
                placeholderTextColor="#FFE082"
                style={[styles.templateInputBox, { borderColor: '#FFE082', color: '#1C1C1C' }]}
              />
            </View>
            <View style={styles.templateGridCell}>
              <Text style={[styles.templateGridLabel, { color: '#E65100' }]}>Budget Limit</Text>
              <TextInput
                value={templateData.budget}
                onChangeText={(txt) => updateTemplateField('budget', null, txt)}
                placeholder="e.g. $100"
                placeholderTextColor="#FFE082"
                style={[styles.templateInputBox, { borderColor: '#FFE082', color: '#1C1C1C' }]}
              />
            </View>
          </View>

          {/* Shopping Checklist */}
          <Text style={[styles.templateSectionHeader, { color: '#E65100' }]}>🛒 Shopping List Items</Text>
          {(templateData.items || []).map(item => (
            <View key={item.id} style={styles.templateListItemRow}>
              <Pressable onPress={() => toggleTemplateListItem('items', item.id)} style={{ padding: 4 }}>
                <Ionicons 
                  name={item.checked ? "checkbox" : "square-outline"} 
                  size={20} 
                  color="#E65100" 
                />
              </Pressable>
              <TextInput
                value={item.text}
                onChangeText={(txt) => updateTemplateListItemText('items', item.id, txt)}
                placeholder="Item name / Qty..."
                placeholderTextColor="#FFE082"
                style={[styles.templateListItemInput, { color: '#1C1C1C' }, item.checked && { textDecorationLine: 'line-through', opacity: 0.6 }]}
              />
              <Pressable onPress={() => removeTemplateListItem('items', item.id)} style={{ padding: 4 }}>
                <Ionicons name="close" size={16} color="#E65100" />
              </Pressable>
            </View>
          ))}
          <Pressable 
            onPress={() => addTemplateListItem('items', "New Item")}
            style={[styles.templateAddListItemBtn, { borderColor: '#FFE082' }]}
          >
            <Ionicons name="add" size={16} color="#E65100" />
            <Text style={{ color: '#E65100', fontSize: 13, fontWeight: '700' }}>Add Item</Text>
          </Pressable>

          {/* Notes */}
          <Text style={[styles.templateSectionHeader, { color: '#E65100', marginTop: 15 }]}>📝 Shopping Notes</Text>
          <TextInput
            value={templateData.notes}
            onChangeText={(txt) => updateTemplateField('notes', null, txt)}
            placeholder="Jot down store timing, coupons..."
            placeholderTextColor="#FFE082"
            style={[styles.templateInputBoxMultiline, { borderColor: '#FFE082', color: '#1C1C1C' }]}
            multiline
            numberOfLines={3}
          />
        </View>
      );
    }

    if (templateType === 'finance') {
      return (
        <View style={[styles.templateContainer, { backgroundColor: '#E8F5E9', borderColor: '#A5D6A7' }]}>
          {/* Income, Budget & Savings Goal */}
          <View style={styles.templateGridTwoColumn}>
            <View style={styles.templateGridCell}>
              <Text style={[styles.templateGridLabel, { color: '#1B5E20' }]}>Income</Text>
              <TextInput
                value={templateData.income}
                onChangeText={(txt) => updateTemplateField('income', null, txt)}
                placeholder="e.g. $3000"
                placeholderTextColor="#A5D6A7"
                style={[styles.templateInputBox, { borderColor: '#A5D6A7', color: '#1C1C1C' }]}
              />
            </View>
            <View style={styles.templateGridCell}>
              <Text style={[styles.templateGridLabel, { color: '#1B5E20' }]}>Budget Limit</Text>
              <TextInput
                value={templateData.budgetLimit}
                onChangeText={(txt) => updateTemplateField('budgetLimit', null, txt)}
                placeholder="e.g. $1500"
                placeholderTextColor="#A5D6A7"
                style={[styles.templateInputBox, { borderColor: '#A5D6A7', color: '#1C1C1C' }]}
              />
            </View>
          </View>
          <View style={{ marginTop: 8 }}>
            <Text style={[styles.templateGridLabel, { color: '#1B5E20' }]}>Savings Goal</Text>
            <TextInput
              value={templateData.savingsGoal}
              onChangeText={(txt) => updateTemplateField('savingsGoal', null, txt)}
              placeholder="e.g. $500"
              placeholderTextColor="#A5D6A7"
              style={[styles.templateInputBox, { borderColor: '#A5D6A7', color: '#1C1C1C' }]}
            />
          </View>

          {/* Expense transactions checklist */}
          <Text style={[styles.templateSectionHeader, { color: '#1B5E20', marginTop: 15 }]}>💸 Expense Tracker List</Text>
          {(templateData.expenses || []).map(item => (
            <View key={item.id} style={styles.templateListItemRow}>
              <Pressable onPress={() => toggleTemplateListItem('expenses', item.id)} style={{ padding: 4 }}>
                <Ionicons 
                  name={item.checked ? "checkbox" : "square-outline"} 
                  size={20} 
                  color="#1B5E20" 
                />
              </Pressable>
              <TextInput
                value={item.text}
                onChangeText={(txt) => updateTemplateListItemText('expenses', item.id, txt)}
                placeholder="Expense item (e.g. Rent - $1000)..."
                placeholderTextColor="#A5D6A7"
                style={[styles.templateListItemInput, { color: '#1C1C1C' }, item.checked && { textDecorationLine: 'line-through', opacity: 0.6 }]}
              />
              <Pressable onPress={() => removeTemplateListItem('expenses', item.id)} style={{ padding: 4 }}>
                <Ionicons name="close" size={16} color="#1B5E20" />
              </Pressable>
            </View>
          ))}
          <Pressable 
            onPress={() => addTemplateListItem('expenses', "New Expense")}
            style={[styles.templateAddListItemBtn, { borderColor: '#A5D6A7' }]}
          >
            <Ionicons name="add" size={16} color="#1B5E20" />
            <Text style={{ color: '#1B5E20', fontSize: 13, fontWeight: '700' }}>Add Expense</Text>
          </Pressable>

          {/* Notes */}
          <Text style={[styles.templateSectionHeader, { color: '#1B5E20', marginTop: 15 }]}>📝 Money Notes & Reminders</Text>
          <TextInput
            value={templateData.notes}
            onChangeText={(txt) => updateTemplateField('notes', null, txt)}
            placeholder="Jot down bills dates, financial summary..."
            placeholderTextColor="#A5D6A7"
            style={[styles.templateInputBoxMultiline, { borderColor: '#A5D6A7', color: '#1C1C1C' }]}
            multiline
            numberOfLines={3}
          />
        </View>
      );
    }

    if (templateType === 'investment') {
      return (
        <View style={[styles.templateContainer, { backgroundColor: '#FFFDF0', borderColor: '#FFD700' }]}>
          {/* Investment Goal & Daily Amount */}
          <View style={styles.templateGridTwoColumn}>
            <View style={styles.templateGridCell}>
              <Text style={[styles.templateGridLabel, { color: '#6F5200' }]}>Investment Goal</Text>
              <TextInput
                value={templateData.investmentGoal}
                onChangeText={(txt) => updateTemplateField('investmentGoal', null, txt)}
                placeholder="e.g. Retirement / House"
                placeholderTextColor="#D4AF37"
                style={[styles.templateInputBox, { borderColor: '#FFD700', color: '#1C1C1C' }]}
              />
            </View>
            <View style={styles.templateGridCell}>
              <Text style={[styles.templateGridLabel, { color: '#6F5200' }]}>Amount Invested Today</Text>
              <TextInput
                value={templateData.dailyAmount}
                onChangeText={(txt) => updateTemplateField('dailyAmount', null, txt)}
                placeholder="e.g. $50"
                placeholderTextColor="#D4AF37"
                style={[styles.templateInputBox, { borderColor: '#FFD700', color: '#1C1C1C' }]}
              />
            </View>
          </View>

          {/* Checklist of assets */}
          <Text style={[styles.templateSectionHeader, { color: '#6F5200' }]}>💰 Assets Checklist (Investments)</Text>
          {(templateData.assets || []).map(item => (
            <View key={item.id} style={styles.templateListItemRow}>
              <Pressable onPress={() => toggleTemplateListItem('assets', item.id)} style={{ padding: 4 }}>
                <Ionicons 
                  name={item.checked ? "checkbox" : "square-outline"} 
                  size={20} 
                  color="#6F5200" 
                />
              </Pressable>
              <TextInput
                value={item.text}
                onChangeText={(txt) => updateTemplateListItemText('assets', item.id, txt)}
                placeholder="Asset item (e.g. Stocks - $20)..."
                placeholderTextColor="#D4AF37"
                style={[styles.templateListItemInput, { color: '#1C1C1C' }, item.checked && { textDecorationLine: 'line-through', opacity: 0.6 }]}
              />
              <Pressable onPress={() => removeTemplateListItem('assets', item.id)} style={{ padding: 4 }}>
                <Ionicons name="close" size={16} color="#6F5200" />
              </Pressable>
            </View>
          ))}
          <Pressable 
            onPress={() => addTemplateListItem('assets', "New Asset")}
            style={[styles.templateAddListItemBtn, { borderColor: '#FFD700' }]}
          >
            <Ionicons name="add" size={16} color="#6F5200" />
            <Text style={{ color: '#6F5200', fontSize: 13, fontWeight: '700' }}>Add Asset</Text>
          </Pressable>

          {/* Investment Discipline Score */}
          <Text style={[styles.templateSectionHeader, { color: '#6F5200', marginTop: 15 }]}>⭐ Discipline / Confidence Score</Text>
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
          <Text style={[styles.templateSectionHeader, { color: '#6F5200', marginTop: 15 }]}>📝 Investment Notes & Insights</Text>
          <TextInput
            value={templateData.notes}
            onChangeText={(txt) => updateTemplateField('notes', null, txt)}
            placeholder="Market insights, allocation breakdown..."
            placeholderTextColor="#D4AF37"
            style={[styles.templateInputBoxMultiline, { borderColor: '#FFD700', color: '#1C1C1C' }]}
            multiline
            numberOfLines={3}
          />
        </View>
      );
    }

    if (templateType === 'medical') {
      const shift = templateData.shiftInfo || {};
      const patientsList = templateData.patients || [];
      const care = templateData.clinicianCare || {};
      return (
        <View style={[styles.templateContainer, { backgroundColor: '#E0F2F1', borderColor: '#80CBC4' }]}>
          {/* Duty Shift Details */}
          <Text style={[styles.templateSectionHeader, { color: '#004D40', fontSize: 16, fontWeight: '900', marginBottom: 12 }]}>
            🩺 On-Duty Shift Details
          </Text>
          <View style={styles.templateGridTwoColumn}>
            <View style={styles.templateGridCell}>
              <Text style={[styles.templateGridLabel, { color: '#004D40' }]}>Clinician Role</Text>
              <TextInput
                value={shift.role}
                onChangeText={(val) => updateTemplateField('shiftInfo', 'role', val)}
                placeholder="e.g. Resident / Student"
                placeholderTextColor="#80CBC4"
                style={[styles.templateInputBox, { borderColor: '#80CBC4', color: '#1C1C1C' }]}
              />
            </View>
            <View style={styles.templateGridCell}>
              <Text style={[styles.templateGridLabel, { color: '#004D40' }]}>Shift Timings</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4 }}>
                <Pressable
                  onPress={() => openTimePicker('medicalStart')}
                  style={[styles.templateInputBox, { flex: 1, borderColor: '#80CBC4', backgroundColor: '#FFFFFF', paddingVertical: 10, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4 }]}
                >
                  <Ionicons name="time-outline" size={16} color="#004D40" />
                  <Text style={{ fontSize: 13, fontWeight: '700', color: '#1C1C1C' }}>
                    {(shift.shiftTime || "08:00 - 16:00").split(" - ")[0] || "08:00"}
                  </Text>
                </Pressable>
                <Text style={{ color: '#004D40', fontWeight: '800' }}>to</Text>
                <Pressable
                  onPress={() => openTimePicker('medicalEnd')}
                  style={[styles.templateInputBox, { flex: 1, borderColor: '#80CBC4', backgroundColor: '#FFFFFF', paddingVertical: 10, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4 }]}
                >
                  <Ionicons name="time-outline" size={16} color="#004D40" />
                  <Text style={{ fontSize: 13, fontWeight: '700', color: '#1C1C1C' }}>
                    {(shift.shiftTime || "08:00 - 16:00").split(" - ")[1] || "16:00"}
                  </Text>
                </Pressable>
              </View>

            </View>
          </View>

          {/* On Call status toggle */}
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginVertical: 12, paddingHorizontal: 4 }}>
            <Text style={{ fontSize: 14, fontWeight: '700', color: '#004D40' }}>On-Call Duty Active</Text>
            <Pressable 
              onPress={() => updateTemplateField('shiftInfo', 'onCall', !shift.onCall)}
              style={{
                width: 50,
                height: 28,
                borderRadius: 14,
                backgroundColor: shift.onCall ? '#00796B' : '#B2DFDB',
                justifyContent: 'center',
                paddingHorizontal: 4,
              }}
            >
              <View style={{
                width: 20,
                height: 20,
                borderRadius: 10,
                backgroundColor: '#FFFFFF',
                alignSelf: shift.onCall ? 'flex-end' : 'flex-start',
                elevation: 2,
              }} />
            </Pressable>
          </View>

          {/* Patient Rounds Cards */}
          <Text style={[styles.templateSectionHeader, { color: '#004D40', marginTop: 15, marginBottom: 8 }]}>
            👥 Ward Patient Rounds ({patientsList.length})
          </Text>

          {patientsList.map((patient, pIdx) => (
            <View 
              key={patient.id} 
              style={{
                backgroundColor: '#FFFFFF',
                borderRadius: 18,
                padding: 14,
                borderWidth: 1.5,
                borderColor: '#80CBC4',
                marginBottom: 16,
              }}
            >
              {/* Header inside Card */}
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                <Text style={{ fontSize: 14, fontWeight: '800', color: '#004D40' }}>
                  Patient #{pIdx + 1}
                </Text>
                {patientsList.length > 1 && (
                  <Pressable onPress={() => removeMedicalPatient(patient.id)} style={{ padding: 4 }}>
                    <Ionicons name="trash-outline" size={18} color="#EF5350" />
                  </Pressable>
                )}
              </View>

              {/* Patient details */}
              <View style={{ marginBottom: 10 }}>
                <Text style={[styles.templateGridLabel, { color: '#004D40', marginBottom: 4 }]}>Ward / Bed No.</Text>
                <TextInput
                  value={patient.bedNumber}
                  onChangeText={(txt) => updatePatientField(patient.id, 'bedNumber', txt)}
                  placeholder="e.g. Bed 10A"
                  placeholderTextColor="#80CBC4"
                  style={[styles.templateInputBox, { borderColor: '#80CBC4', color: '#1C1C1C' }]}
                />
              </View>
              <View style={{ marginBottom: 10 }}>
                <Text style={[styles.templateGridLabel, { color: '#004D40', marginBottom: 4 }]}>Diagnosis / Concern</Text>
                <TextInput
                  value={patient.diagnosis}
                  onChangeText={(txt) => updatePatientField(patient.id, 'diagnosis', txt)}
                  placeholder="e.g. Post-op check"
                  placeholderTextColor="#80CBC4"
                  style={[styles.templateInputBox, { borderColor: '#80CBC4', color: '#1C1C1C' }]}
                />
              </View>


              {/* Interactive checkboxes inside Patient Card */}
              <View style={{ flexDirection: 'row', gap: 15, marginTop: 12, borderTopWidth: 1, borderTopColor: '#E0F2F1', paddingTop: 8 }}>
                <Pressable 
                  onPress={() => updatePatientField(patient.id, 'vitalsChecked', !patient.vitalsChecked)}
                  style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}
                >
                  <Ionicons 
                    name={patient.vitalsChecked ? "checkbox" : "square-outline"} 
                    size={18} 
                    color="#004D40" 
                  />
                  <Text style={{ fontSize: 13, fontWeight: '700', color: '#004D40' }}>Vitals Checked</Text>
                </Pressable>
                <Pressable 
                  onPress={() => updatePatientField(patient.id, 'roundsDone', !patient.roundsDone)}
                  style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}
                >
                  <Ionicons 
                    name={patient.roundsDone ? "checkbox" : "square-outline"} 
                    size={18} 
                    color="#004D40" 
                  />
                  <Text style={{ fontSize: 13, fontWeight: '700', color: '#004D40' }}>Rounds Done</Text>
                </Pressable>
              </View>
            </View>
          ))}

          {/* Add Patient Button */}
          <Pressable 
            onPress={addMedicalPatient}
            style={[styles.templateAddListItemBtn, { borderColor: '#004D40', backgroundColor: '#FFFFFF', borderStyle: 'solid', paddingVertical: 12, marginBottom: 15 }]}
          >
            <Ionicons name="add-circle" size={18} color="#004D40" />
            <Text style={{ color: '#004D40', fontSize: 14, fontWeight: '800' }}>Add Patient Bed</Text>
          </Pressable>

          {/* Clinical Duties Checklist */}
          <Text style={[styles.templateSectionHeader, { color: '#004D40' }]}>📋 Clinical Duties Checklist</Text>
          {(templateData.clinicalTasks || []).map(item => (
            <View key={item.id} style={styles.templateListItemRow}>
              <Pressable onPress={() => toggleTemplateListItem('clinicalTasks', item.id)} style={{ padding: 4 }}>
                <Ionicons 
                  name={item.checked ? "checkbox" : "square-outline"} 
                  size={20} 
                  color="#004D40" 
                />
              </Pressable>
              <TextInput
                value={item.text}
                onChangeText={(txt) => updateTemplateListItemText('clinicalTasks', item.id, txt)}
                placeholder="Duty task..."
                placeholderTextColor="#80CBC4"
                style={[styles.templateListItemInput, { color: '#1C1C1C' }, item.checked && { textDecorationLine: 'line-through', opacity: 0.6 }]}
              />
              <Pressable onPress={() => removeTemplateListItem('clinicalTasks', item.id)} style={{ padding: 4 }}>
                <Ionicons name="close" size={16} color="#80CBC4" />
              </Pressable>
            </View>
          ))}
          <Pressable 
            onPress={() => addTemplateListItem('clinicalTasks', "New Clinical Task")}
            style={[styles.templateAddListItemBtn, { borderColor: '#80CBC4' }]}
          >
            <Ionicons name="add" size={16} color="#004D40" />
            <Text style={{ color: '#004D40', fontSize: 13, fontWeight: '700' }}>Add Task</Text>
          </Pressable>

          {/* Hydration Water intake */}
          <Text style={[styles.templateSectionHeader, { color: '#004D40', marginTop: 15 }]}>💧 Hydration Tracker</Text>
          <View style={styles.templateStarsRow}>
            {Array.from({ length: 8 }).map((_, i) => {
              const isActive = (care.hydrationGlasses || 0) > i;
              return (
                <Pressable 
                  key={i} 
                  onPress={() => updateTemplateField('clinicianCare', 'hydrationGlasses', i + 1)} 
                  style={{ padding: 4 }}
                >
                  <Ionicons 
                    name={isActive ? "water" : "water-outline"} 
                    size={26} 
                    color={isActive ? "#00BCD4" : "#80CBC4"} 
                  />
                </Pressable>
              );
            })}
          </View>

          {/* Clinician self care: stress rating & lunch break */}
          <View style={{ marginVertical: 8 }}>
            <Text style={[styles.templateSectionHeader, { color: '#004D40', marginBottom: 4 }]}>Shift Stress Score</Text>
            <View style={styles.templateStarsRow}>
              {[1, 2, 3, 4, 5].map(star => (
                <Pressable 
                  key={star} 
                  onPress={() => updateTemplateField('clinicianCare', 'stressLevel', star)}
                  style={{ padding: 2 }}
                >
                  <Ionicons 
                    name={star <= (care.stressLevel || 0) ? "heart" : "heart-outline"} 
                    size={24} 
                    color="#EF5350" 
                  />
                </Pressable>
              ))}
            </View>
          </View>
          <View style={{ marginVertical: 8 }}>
            <Text style={[styles.templateSectionHeader, { color: '#004D40', marginBottom: 4 }]}>Lunch Taken</Text>
            <Pressable 
              onPress={() => updateTemplateField('clinicianCare', 'lunchBreak', !care.lunchBreak)}
              style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 4 }}
            >
              <Ionicons 
                name={care.lunchBreak ? "checkbox" : "square-outline"} 
                size={20} 
                color="#004D40" 
              />
              <Text style={{ fontSize: 14, fontWeight: '700', color: '#1C1C1C' }}>Yes, had lunch</Text>
            </Pressable>
          </View>


          {/* General clinical notes */}
          <Text style={[styles.templateSectionHeader, { color: '#004D40', marginTop: 15 }]}>📝 Clinical Pearls & Handover Notes</Text>
          <TextInput
            value={templateData.notes}
            onChangeText={(txt) => updateTemplateField('notes', null, txt)}
            placeholder="Jot down interesting clinical cases, dosages, or shift handover summary..."
            placeholderTextColor="#80CBC4"
            style={[styles.templateInputBoxMultiline, { borderColor: '#80CBC4', color: '#1C1C1C' }]}
            multiline
            numberOfLines={3}
          />
        </View>
      );
    }

    if (templateType === 'med_study') {
      const subjectsList = templateData.subjects || [];
      const clinicalLogList = templateData.clinicalLog || [];

      return (
        <View style={[styles.templateContainer, { backgroundColor: '#E8F5E9', borderColor: '#81C784' }]}>
          {/* Main Study Goal */}
          <Text style={[styles.templateSectionHeader, { color: '#2E7D32', fontSize: 16, fontWeight: '900', marginBottom: 6 }]}>
            🎓 Today&apos;s Medical Study Goal
          </Text>
          <TextInput
            value={templateData.studyGoal}
            onChangeText={(txt) => updateTemplateField('studyGoal', null, txt)}
            placeholder="e.g. Cardiothoracic surgery case review or Pathology notes..."
            placeholderTextColor="#A5D6A7"
            style={[styles.templateInputUnderline, { borderBottomColor: '#81C784', color: '#1C1C1C', marginBottom: 15 }]}
          />

          {/* Medical Subjects Checklist */}
          <Text style={[styles.templateSectionHeader, { color: '#2E7D32', marginTop: 10, marginBottom: 8 }]}>
            📚 Medical Subjects & Confidence ({subjectsList.length})
          </Text>

          {subjectsList.map((sub, idx) => (
            <View 
              key={sub.id} 
              style={{
                backgroundColor: '#FFFFFF',
                borderRadius: 16,
                padding: 12,
                borderWidth: 1.5,
                borderColor: '#81C784',
                marginBottom: 12,
              }}
            >
              {/* Header inside Card */}
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <Text style={{ fontSize: 13, fontWeight: '800', color: '#2E7D32' }}>
                  Subject #{idx + 1}
                </Text>
                {subjectsList.length > 1 && (
                  <Pressable onPress={() => removeMedStudySubject(sub.id)} style={{ padding: 4 }}>
                    <Ionicons name="trash-outline" size={16} color="#EF5350" />
                  </Pressable>
                )}
              </View>

              {/* Subject details inputs */}
              <View style={styles.templateGridTwoColumn}>
                <View style={styles.templateGridCell}>
                  <Text style={[styles.templateGridLabel, { color: '#2E7D32' }]}>Subject Name</Text>
                  <TextInput
                    value={sub.name}
                    onChangeText={(txt) => updateMedStudySubjectField(sub.id, 'name', txt)}
                    placeholder="e.g. Pathology"
                    placeholderTextColor="#A5D6A7"
                    style={[styles.templateInputBox, { borderColor: '#81C784', color: '#1C1C1C' }]}
                  />
                </View>
                <View style={styles.templateGridCell}>
                  <Text style={[styles.templateGridLabel, { color: '#2E7D32' }]}>Subject Target Time</Text>
                  <TextInput
                    value={sub.studyDuration}
                    onChangeText={(txt) => updateMedStudySubjectField(sub.id, 'studyDuration', txt)}
                    placeholder="e.g. 2 hours"
                    placeholderTextColor="#A5D6A7"
                    style={[styles.templateInputBox, { borderColor: '#81C784', color: '#1C1C1C' }]}
                  />
                </View>
              </View>

              {/* Study Topics */}
              <Text style={{ fontSize: 12, fontWeight: '700', color: '#2E7D32', marginTop: 12, marginBottom: 4 }}>
                📖 Study Topics & Target Duration
              </Text>
              {(sub.topics || []).map((topic, tIdx) => (
                <View key={topic.id || tIdx} style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginVertical: 4 }}>
                  {/* Topic Checkbox Toggle */}
                  <Pressable 
                    onPress={() => updateMedStudySubjectTopicField(sub.id, topic.id, 'checked', !topic.checked)}
                    style={{ padding: 4 }}
                  >
                    <Ionicons 
                      name={topic.checked ? "checkbox" : "square-outline"} 
                      size={18} 
                      color="#2E7D32" 
                    />
                  </Pressable>

                  {/* Topic text input */}
                  <TextInput
                    value={topic.text}
                    onChangeText={(txt) => updateMedStudySubjectTopicField(sub.id, topic.id, 'text', txt)}
                    placeholder="e.g. Cell Injury"
                    placeholderTextColor="#A5D6A7"
                    style={[
                      styles.templateTimelineInput, 
                      { borderBottomColor: '#81C784', color: '#1C1C1C', flex: 1 },
                      topic.checked && { textDecorationLine: 'line-through', opacity: 0.6 }
                    ]}
                  />

                  {/* Topic duration input */}
                  <TextInput
                    value={topic.duration}
                    onChangeText={(txt) => updateMedStudySubjectTopicField(sub.id, topic.id, 'duration', txt)}
                    placeholder="e.g. 45m"
                    placeholderTextColor="#A5D6A7"
                    style={{
                      width: 60,
                      borderBottomWidth: 1.2,
                      borderBottomColor: '#81C784',
                      fontSize: 12,
                      color: '#1C1C1C',
                      padding: 1,
                      textAlign: 'center'
                    }}
                  />

                  {/* Delete topic button */}
                  {sub.topics && sub.topics.length > 1 && (
                    <Pressable onPress={() => removeMedStudySubjectTopic(sub.id, topic.id)} style={{ padding: 4 }}>
                      <Ionicons name="close-circle-outline" size={16} color="#EF5350" />
                    </Pressable>
                  )}
                </View>
              ))}

              {/* Add Topic Button */}
              <Pressable 
                onPress={() => addMedStudySubjectTopic(sub.id)}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 4,
                  alignSelf: 'flex-start',
                  marginTop: 6,
                  paddingVertical: 4,
                  paddingHorizontal: 8,
                  borderRadius: 6,
                  borderWidth: 1,
                  borderColor: '#81C784',
                  backgroundColor: '#F1F8E9'
                }}
              >
                <Ionicons name="add" size={14} color="#2E7D32" />
                <Text style={{ fontSize: 11, fontWeight: '700', color: '#2E7D32' }}>Add Topic</Text>
              </Pressable>

              {/* Daily Shift & Study Routine for this subject */}
              <Text style={{ fontSize: 12, fontWeight: '700', color: '#2E7D32', marginTop: 12, marginBottom: 4 }}>
                ⏰ Subject Daily Routine
              </Text>
              {getSafeRoutineArray(sub.routine).map((item, rIdx) => {
                return (
                  <View key={item.id || rIdx} style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginVertical: 4 }}>
                    {/* Checked Toggle */}
                    <Pressable 
                      onPress={() => updateMedStudySubjectRoutineField(sub.id, item.id, 'checked', !item.checked)}
                      style={{ padding: 4 }}
                    >
                      <Ionicons 
                        name={item.checked ? "checkbox" : "square-outline"} 
                        size={18} 
                        color="#2E7D32" 
                      />
                    </Pressable>

                    {/* Time input + Clock Icon */}
                    <View 
                      style={{
                        width: 75,
                        borderBottomWidth: 1.2,
                        borderBottomColor: '#81C784',
                        paddingVertical: 1,
                        flexDirection: 'row',
                        alignItems: 'center',
                        gap: 2
                      }}
                    >
                      <TextInput
                        value={item.time}
                        onChangeText={(val) => updateMedStudySubjectRoutineField(sub.id, item.id, 'time', val)}
                        placeholder="08:00"
                        placeholderTextColor="#A5D6A7"
                        style={{ fontSize: 12, fontWeight: '800', flex: 1, color: '#2E7D32', padding: 0 }}
                      />
                      <Pressable onPress={() => openTimePicker(`med_study|${sub.id}|${item.id}`)} style={{ padding: 2 }}>
                        <Ionicons name="time-outline" size={13} color="#2E7D32" />
                      </Pressable>
                    </View>

                    {/* Task Description */}
                    <TextInput
                      value={item.task}
                      onChangeText={(txt) => updateMedStudySubjectRoutineField(sub.id, item.id, 'task', txt)}
                      placeholder="Routine Activity..."
                      placeholderTextColor="#A5D6A7"
                      style={[
                        styles.templateTimelineInput, 
                        { borderBottomColor: '#81C784', color: '#1C1C1C', flex: 1 },
                        item.checked && { textDecorationLine: 'line-through', opacity: 0.6 }
                      ]}
                    />

                    {/* Delete routine item button */}
                    {getSafeRoutineArray(sub.routine).length > 1 && (
                      <Pressable onPress={() => removeMedStudySubjectRoutineItem(sub.id, item.id)} style={{ padding: 4 }}>
                        <Ionicons name="trash-outline" size={14} color="#EF5350" />
                      </Pressable>
                    )}
                  </View>
                );
              })}

              {/* Add Routine Task Button */}
              <Pressable 
                onPress={() => addMedStudySubjectRoutineItem(sub.id)}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 4,
                  alignSelf: 'flex-start',
                  marginTop: 6,
                  paddingVertical: 4,
                  paddingHorizontal: 8,
                  borderRadius: 6,
                  borderWidth: 1,
                  borderColor: '#81C784',
                  backgroundColor: '#F1F8E9'
                }}
              >
                <Ionicons name="add" size={14} color="#2E7D32" />
                <Text style={{ fontSize: 11, fontWeight: '700', color: '#2E7D32' }}>Add Routine Task</Text>
              </Pressable>

              {/* Confidence Rating */}
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 10, borderTopWidth: 1, borderTopColor: '#E8F5E9', paddingTop: 8 }}>
                <Text style={{ fontSize: 12, fontWeight: '700', color: '#2E7D32' }}>Study Confidence Rating</Text>
                <View style={{ flexDirection: 'row', gap: 6, alignItems: 'center' }}>
                  {[1, 2, 3, 4, 5].map(star => (
                    <Pressable 
                      key={star} 
                      onPress={() => updateMedStudySubjectField(sub.id, 'rating', star)}
                      style={{ padding: 1 }}
                    >
                      <Ionicons 
                        name={star <= (sub.rating || 0) ? "star" : "star-outline"} 
                        size={18} 
                        color="#4CAF50" 
                      />
                    </Pressable>
                  ))}
                </View>
              </View>
            </View>
          ))}

          {/* Add Subject Button */}
          <Pressable 
            onPress={addMedStudySubject}
            style={[styles.templateAddListItemBtn, { borderColor: '#2E7D32', backgroundColor: '#FFFFFF', borderStyle: 'solid', paddingVertical: 10, marginBottom: 15 }]}
          >
            <Ionicons name="add-circle" size={16} color="#2E7D32" />
            <Text style={{ color: '#2E7D32', fontSize: 13, fontWeight: '800' }}>Add Study Subject</Text>
          </Pressable>

          {/* Clinical Practical Log Checklist */}
          <Text style={[styles.templateSectionHeader, { color: '#2E7D32', marginTop: 10 }]}>📋 Clinical Practical & Case Log</Text>
          {(clinicalLogList || []).map((item, cIdx) => (
            <View key={item.id || cIdx} style={styles.templateListItemRow}>
              <Pressable onPress={() => toggleTemplateListItem('clinicalLog', item.id)} style={{ padding: 4 }}>
                <Ionicons 
                  name={item.checked ? "checkbox" : "square-outline"} 
                  size={20} 
                  color="#2E7D32" 
                />
              </Pressable>
              <TextInput
                value={item.text}
                onChangeText={(txt) => updateTemplateListItemText('clinicalLog', item.id, txt)}
                placeholder="Observe procedure, study patient files..."
                placeholderTextColor="#A5D6A7"
                style={[styles.templateListItemInput, { color: '#1C1C1C' }, item.checked && { textDecorationLine: 'line-through', opacity: 0.6 }]}
              />
              <Pressable onPress={() => removeTemplateListItem('clinicalLog', item.id)} style={{ padding: 4 }}>
                <Ionicons name="close" size={16} color="#A5D6A7" />
              </Pressable>
            </View>
          ))}
          <Pressable 
            onPress={() => addTemplateListItem('clinicalLog', "New Practical Task")}
            style={[styles.templateAddListItemBtn, { borderColor: '#81C784' }]}
          >
            <Ionicons name="add" size={16} color="#2E7D32" />
            <Text style={{ color: '#2E7D32', fontSize: 13, fontWeight: '700' }}>Add Task</Text>
          </Pressable>

          {/* Study Summary Notes */}
          <Text style={[styles.templateSectionHeader, { color: '#2E7D32', marginTop: 15 }]}>📝 Study Pearls & Key Learnings</Text>
          <TextInput
            value={templateData.notes}
            onChangeText={(txt) => updateTemplateField('notes', null, txt)}
            placeholder="Jot down quick medical formulas, drug names, patient symptoms or diagnostic notes..."
            placeholderTextColor="#A5D6A7"
            style={[styles.templateInputBoxMultiline, { borderColor: '#81C784', color: '#1C1C1C' }]}
            multiline
            numberOfLines={3}
          />
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
              {noteType === 'template' ? `${(templateType || 'Template').toUpperCase()} PLANNER` : (noteType === 'notebook' ? 'Digital Notebook Pages' : (noteType === 'checklist' ? 'Checklist Items' : 'Description'))}
            </Text>
          </View>
          
          {noteType === 'template' ? (
            <View style={{ flexGrow: 1, paddingBottom: 20 }}>
              {renderTemplateEditorForm()}
            </View>
          ) : noteType === 'notebook' ? (
            <View style={{ flexGrow: 1, paddingBottom: 20, alignItems: 'center', justifyContent: 'center', minHeight: 280 }}>
              <LinearGradient
                colors={['#FF8C00', '#FFD700']}
                style={{
                  width: 130,
                  height: 170,
                  borderRadius: 16,
                  alignItems: 'center',
                  justifyContent: 'center',
                  elevation: 5,
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.15,
                  shadowRadius: 6,
                  marginBottom: 16,
                  position: 'relative'
                }}
              >
                <View style={{ position: 'absolute', left: 8, top: 18, bottom: 18, width: 4, backgroundColor: '#E07B00', borderRadius: 2 }} />
                <Ionicons name="book" size={50} color="#FFFFFF" />
                <Text style={{ color: '#FFFFFF', fontWeight: '900', fontSize: 13, marginTop: 8, textAlign: 'center', paddingHorizontal: 10 }}>
                  Notebook
                </Text>
              </LinearGradient>
              <Text style={{ fontSize: 18, fontWeight: '900', color: theme.text, marginBottom: 4 }}>
                Digital Notebook Note
              </Text>
              <Text style={{ fontSize: 13, color: theme.mutedText, marginBottom: 20 }}>
                {templateData.pages?.length || 1} Pages • Ruled, Grid & Custom Borders
              </Text>
              <Pressable
                onPress={() => setIsNotebookCanvasVisible(true)}
                style={{
                  backgroundColor: theme.primary,
                  paddingHorizontal: 22,
                  paddingVertical: 12,
                  borderRadius: 14,
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 8,
                  elevation: 3,
                }}
              >
                <Ionicons name="create" size={18} color="#FFFFFF" />
                <Text style={{ color: '#FFFFFF', fontWeight: '800', fontSize: 14 }}>Edit Notebook Pages</Text>
              </Pressable>
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
            const hasChecklistItems = checklist.some(item => item && item.text && typeof item.text === 'string' && item.text.trim() !== '');
            const hasTemplateData = noteType === 'template' && templateType;
            const hasNotebookData = noteType === 'notebook' && templateData.pages && templateData.pages.length > 0;
            const isTitleValid = title && typeof title === 'string' && title.trim();
            const isBodyValid = body && typeof body === 'string' && body.trim();
            if (isTitleValid || isBodyValid || hasChecklistItems || hasTemplateData || hasNotebookData) {
              onSave({ 
                title: title || (templateType ? `${templateType.charAt(0).toUpperCase() + templateType.slice(1)} Planner` : (noteType === 'notebook' ? 'Digital Notebook' : 'Untitled Note')), 
                content: noteType === 'template'
                  ? generateTemplateSummary(templateType, templateData)
                  : (noteType === 'checklist' 
                      ? checklist.map(item => `${item.checked ? '[x]' : '[ ]'} ${item.text}`).join('\n')
                      : (noteType === 'notebook'
                          ? `${templateData.pages?.length || 1} Pages Digital Notebook`
                          : body)),
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

              {/* Option 6: Digital Notebook */}
              <Pressable 
                onPress={() => {
                  setIsBottomSheetVisible(false);
                  setNoteType('notebook');
                  if (!templateData.pages || templateData.pages.length === 0) {
                    setTemplateData({
                      pages: [
                        {
                          pageStyle: 'ruled',
                          borderDesign: 'classic',
                          lines: [],
                          textBoxes: []
                        }
                      ]
                    });
                  }
                  setIsNotebookCanvasVisible(true);
                }} 
                style={({ pressed }) => [
                   styles.bottomSheetItem,
                   { backgroundColor: pressed ? theme.overlay : 'transparent' }
                ]}
              >
                <View style={[styles.bottomSheetItemIconContainer, { backgroundColor: '#BBDEFB' }]}>
                  <Ionicons name="book" size={20} color="#1565C0" />
                </View>
                <Text style={styles.bottomSheetItemText}>Digital Notebook</Text>
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

      <NotebookCanvas
        visible={isNotebookCanvasVisible}
        onClose={() => setIsNotebookCanvasVisible(false)}
        onSave={(updatedPages) => {
          setTemplateData({ pages: updatedPages });
          setNoteType('notebook');
          setIsNotebookCanvasVisible(false);
          setStatus('Notebook updated! 📓');
        }}
        theme={theme}
        initialPages={templateData.pages || []}
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

              {/* Template 6: Student */}
              <Pressable 
                onPress={() => handleSelectTemplate('student')}
                style={({ pressed }) => [
                  styles.templateCardOption,
                  { borderColor: '#E1BEE7', backgroundColor: '#F3E5F5' },
                  pressed && { opacity: 0.8 }
                ]}
              >
                <View style={styles.templateCardIconCircle}>
                  <Ionicons name="school-outline" size={24} color="#6A1B9A" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.templateCardTitle, { color: '#6A1B9A' }]}>Student Planner</Text>
                  <Text style={[styles.templateCardDesc, { color: '#8E24AA' }]}>
                    Today&apos;s study focus, class schedule, tasks & homework checklists, upcoming deadlines & exam log.
                  </Text>
                </View>
              </Pressable>

              {/* Template 7: Fitness */}
              <Pressable 
                onPress={() => handleSelectTemplate('fitness')}
                style={({ pressed }) => [
                  styles.templateCardOption,
                  { borderColor: '#B2DFDB', backgroundColor: '#E0F2F1' },
                  pressed && { opacity: 0.8 }
                ]}
              >
                <View style={styles.templateCardIconCircle}>
                  <Ionicons name="fitness-outline" size={24} color="#004D40" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.templateCardTitle, { color: '#004D40' }]}>Fitness & Health Tracker</Text>
                  <Text style={[styles.templateCardDesc, { color: '#00796B' }]}>
                    Workout plans, interactive water intake log, body weight tracker, calories count & energy rating.
                  </Text>
                </View>
              </Pressable>

              {/* Template 8: Exam Prep */}
              <Pressable 
                onPress={() => handleSelectTemplate('exam')}
                style={({ pressed }) => [
                  styles.templateCardOption,
                  { borderColor: '#FFAB91', backgroundColor: '#FBE9E7' },
                  pressed && { opacity: 0.8 }
                ]}
              >
                <View style={styles.templateCardIconCircle}>
                  <Ionicons name="document-text-outline" size={24} color="#D84315" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.templateCardTitle, { color: '#BF360C' }]}>Exam Preparation Planner</Text>
                  <Text style={[styles.templateCardDesc, { color: '#D84315' }]}>
                    Subject title, exam date, topics checklists, study hours targets & preparedness index.
                  </Text>
                </View>
              </Pressable>

              {/* Template 9: Travel */}
              <Pressable 
                onPress={() => handleSelectTemplate('travel')}
                style={({ pressed }) => [
                  styles.templateCardOption,
                  { borderColor: '#80DEEA', backgroundColor: '#E0F7FA' },
                  pressed && { opacity: 0.8 }
                ]}
              >
                <View style={styles.templateCardIconCircle}>
                  <Ionicons name="airplane-outline" size={24} color="#006064" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.templateCardTitle, { color: '#006064' }]}>Travel & Itinerary Planner</Text>
                  <Text style={[styles.templateCardDesc, { color: '#00838F' }]}>
                    Destination logs, travel duration, itinerary schedules and packing list trackers.
                  </Text>
                </View>
              </Pressable>

              {/* Template 10: Shopping */}
              <Pressable 
                onPress={() => handleSelectTemplate('shopping')}
                style={({ pressed }) => [
                  styles.templateCardOption,
                  { borderColor: '#FFE082', backgroundColor: '#FFF8E1' },
                  pressed && { opacity: 0.8 }
                ]}
              >
                <View style={styles.templateCardIconCircle}>
                  <Ionicons name="cart-outline" size={24} color="#E65100" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.templateCardTitle, { color: '#E65100' }]}>Shopping & Grocery List</Text>
                  <Text style={[styles.templateCardDesc, { color: '#F57C00' }]}>
                    Store or app name, total shopping budget limits and item checklist tracker.
                  </Text>
                </View>
              </Pressable>

              {/* Template 11: Finance */}
              <Pressable 
                onPress={() => handleSelectTemplate('finance')}
                style={({ pressed }) => [
                  styles.templateCardOption,
                  { borderColor: '#A5D6A7', backgroundColor: '#E8F5E9' },
                  pressed && { opacity: 0.8 }
                ]}
              >
                <View style={styles.templateCardIconCircle}>
                  <Ionicons name="cash-outline" size={24} color="#1B5E20" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.templateCardTitle, { color: '#1B5E20' }]}>Personal Finance & Expenses</Text>
                  <Text style={[styles.templateCardDesc, { color: '#2E7D32' }]}>
                    Income and savings goals tracker, budget threshold & expense transaction checkers.
                  </Text>
                </View>
              </Pressable>

              {/* Template 12: Investment */}
              <Pressable 
                onPress={() => handleSelectTemplate('investment')}
                style={({ pressed }) => [
                  styles.templateCardOption,
                  { borderColor: '#FFD700', backgroundColor: '#FFFDF0' },
                  pressed && { opacity: 0.8 }
                ]}
              >
                <View style={styles.templateCardIconCircle}>
                  <Ionicons name="trending-up-outline" size={24} color="#6F5200" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.templateCardTitle, { color: '#6F5200' }]}>Daily Investment Tracker</Text>
                  <Text style={[styles.templateCardDesc, { color: '#8A6D00' }]}>
                    Daily investment goals, asset checklists, amount invested today & confidence rating.
                  </Text>
                </View>
              </Pressable>

              {/* Template 13: Medical */}
              <Pressable 
                onPress={() => handleSelectTemplate('medical')}
                style={({ pressed }) => [
                  styles.templateCardOption,
                  { borderColor: '#80CBC4', backgroundColor: '#E0F2F1' },
                  pressed && { opacity: 0.8 }
                ]}
              >
                <View style={styles.templateCardIconCircle}>
                  <Ionicons name="medical-outline" size={24} color="#004D40" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.templateCardTitle, { color: '#004D40' }]}>Clinical Rounds & Duty Planner</Text>
                  <Text style={[styles.templateCardDesc, { color: '#00796B' }]}>
                    Duty shifts details, dynamic patient lists, vital checks, clinical tasks & stress/water trackers.
                  </Text>
                </View>
              </Pressable>

              {/* Template 14: Med Study */}
              <Pressable 
                onPress={() => handleSelectTemplate('med_study')}
                style={({ pressed }) => [
                  styles.templateCardOption,
                  { borderColor: '#81C784', backgroundColor: '#E8F5E9' },
                  pressed && { opacity: 0.8 }
                ]}
              >
                <View style={styles.templateCardIconCircle}>
                  <Ionicons name="school-outline" size={24} color="#2E7D32" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.templateCardTitle, { color: '#2E7D32' }]}>Medical Student Routine & Study</Text>
                  <Text style={[styles.templateCardDesc, { color: '#2E7D32' }]}>
                    Morning, afternoon, evening & night routines with time pickers, study goals, subjects tracker & clinical case logs.
                  </Text>
                </View>
              </Pressable>


            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>

      {/* Time Picker Modal */}
      <Modal
        visible={isTimePickerVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setIsTimePickerVisible(false)}
      >
        <View style={styles.timePickerOverlay}>
          <View style={styles.timePickerContainer}>
            <Text style={styles.timePickerTitle}>Select Time (24h)</Text>
            
            <View style={styles.timePickerColumnsRow}>
              {/* Hours Column */}
              <View style={styles.timePickerColumnWrapper}>
                <Text style={styles.timePickerColumnLabel}>Hour</Text>
                <ScrollView 
                  style={styles.timePickerColumnScroll} 
                  showsVerticalScrollIndicator={false}
                  contentContainerStyle={{ paddingVertical: 10 }}
                >
                  {HOURS.map(hr => {
                    const isSelected = hr === selectedHour;
                    return (
                      <Pressable 
                        key={hr} 
                        onPress={() => setSelectedHour(hr)}
                        style={[
                          styles.timePickerItem,
                          isSelected && styles.timePickerItemActive
                        ]}
                      >
                        <Text style={[
                          styles.timePickerItemText,
                          isSelected && styles.timePickerItemTextActive
                        ]}>
                          {hr}
                        </Text>
                      </Pressable>
                    );
                  })}
                </ScrollView>
              </View>

              {/* Colon */}
              <Text style={styles.timePickerColon}>:</Text>

              {/* Minutes Column */}
              <View style={styles.timePickerColumnWrapper}>
                <Text style={styles.timePickerColumnLabel}>Minute</Text>
                <ScrollView 
                  style={styles.timePickerColumnScroll} 
                  showsVerticalScrollIndicator={false}
                  contentContainerStyle={{ paddingVertical: 10 }}
                >
                  {MINUTES.map(min => {
                    const isSelected = min === selectedMinute;
                    return (
                      <Pressable 
                        key={min} 
                        onPress={() => setSelectedMinute(min)}
                        style={[
                          styles.timePickerItem,
                          isSelected && styles.timePickerItemActive
                        ]}
                      >
                        <Text style={[
                          styles.timePickerItemText,
                          isSelected && styles.timePickerItemTextActive
                        ]}>
                          {min}
                        </Text>
                      </Pressable>
                    );
                  })}
                </ScrollView>
              </View>
            </View>

            {/* Modal Actions */}
            <View style={styles.timePickerActionsRow}>
              <Pressable 
                onPress={() => setIsTimePickerVisible(false)}
                style={[styles.timePickerBtn, styles.timePickerBtnCancel]}
              >
                <Text style={styles.timePickerBtnTextCancel}>Cancel</Text>
              </Pressable>
              <Pressable 
                onPress={confirmTimeSelection}
                style={[styles.timePickerBtn, styles.timePickerBtnConfirm]}
              >
                <Text style={styles.timePickerBtnTextConfirm}>Confirm</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
}
