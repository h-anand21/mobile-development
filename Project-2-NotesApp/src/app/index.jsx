import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { StyleSheet, View, useColorScheme, ActivityIndicator, BackHandler } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';

import NotesListScreen from '../screens/NotesListScreen';
import NoteEditorScreen from '../screens/NoteEditorScreen';
import WelcomeScreen from '../screens/WelcomeScreen';
import SetupProfileScreen from '../screens/SetupProfileScreen';
import { lightTheme, darkTheme } from '../constants/theme';

const STORAGE_KEYS = {
  NOTES: 'wordsy_notes',
  USER_PROFILE: 'wordsy_user_profile',
  FOLDERS: 'wordsy_folders',
  LAST_RESET_DATE: 'wordsy_last_reset_date',
};

const localGenerateTemplateSummary = (type, data) => {
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
  return '';
};

export default function App() {
  const systemScheme = useColorScheme();
  const [isDark, setIsDark] = useState(systemScheme === 'dark');
  const [screen, setScreen] = useState('welcome');
  const [notes, setNotes] = useState([]);
  const [folders, setFolders] = useState([]);
  const [userProfile, setUserProfile] = useState(null);
  const [editingNote, setEditingNote] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const theme = useMemo(() => (isDark ? darkTheme : lightTheme), [isDark]);

  // Handle Hardware Back Button (Android)
  useEffect(() => {
    const backAction = () => {
      if (screen === 'editor') {
        setScreen('list');
        return true; // Stop default behavior (closing app)
      }
      if (screen === 'setup') {
        setScreen('welcome');
        return true;
      }
      return false; // Default behavior (exit app)
    };

    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      backAction
    );

    return () => backHandler.remove();
  }, [screen]);

  // Load Data on Startup
  useEffect(() => {
    const loadData = async () => {
      try {
        const [savedNotes, savedProfile, savedFolders, savedLastReset] = await Promise.all([
          AsyncStorage.getItem(STORAGE_KEYS.NOTES),
          AsyncStorage.getItem(STORAGE_KEYS.USER_PROFILE),
          AsyncStorage.getItem(STORAGE_KEYS.FOLDERS),
          AsyncStorage.getItem(STORAGE_KEYS.LAST_RESET_DATE),
        ]);

        let parsedFolders = [];
        if (savedFolders) {
          parsedFolders = JSON.parse(savedFolders);
        } else {
          // Pre-create default folders on first launch
          parsedFolders = [
            { id: 'folder_routine', name: 'Daily Routine', color: '#FF8C00', icon: 'checkbox-outline', isRoutine: true },
            { id: 'folder_personal', name: 'Personal', color: '#4CAF50', icon: 'person-outline', isRoutine: false },
            { id: 'folder_work', name: 'Work', color: '#2196F3', icon: 'briefcase-outline', isRoutine: false },
          ];
          await AsyncStorage.setItem(STORAGE_KEYS.FOLDERS, JSON.stringify(parsedFolders));
        }
        setFolders(parsedFolders);

        let parsedNotes = [];
        if (savedNotes) {
          parsedNotes = JSON.parse(savedNotes);
        }

        // Daily Routine Auto-Reset Logic
        const todayStr = new Date().toDateString(); // e.g. "Sun Jun 21 2026"
        if (savedLastReset !== todayStr) {
          // Identify routine folder IDs
          const routineFolderIds = parsedFolders
            .filter(f => f.isRoutine)
            .map(f => f.id);

          let resetDone = false;
          parsedNotes = parsedNotes.map(note => {
            if (note.folderId && routineFolderIds.includes(note.folderId)) {
              // It's a note in a routine folder, reset checklist if it has one
              if (note.noteType === 'checklist' && note.checklist && note.checklist.length > 0) {
                const updatedChecklist = note.checklist.map(item => ({ ...item, checked: false }));
                const updatedContent = updatedChecklist
                  .map(item => `[ ] ${item.text}`)
                  .join('\n');
                resetDone = true;
                return {
                  ...note,
                  checklist: updatedChecklist,
                  content: updatedContent,
                };
              } else if (note.noteType === 'template' && note.templateData) {
                const updatedData = { ...note.templateData };
                let dataChanged = false;
                 const checkboxSections = [
                  'morningHabits', 'todo', 'goals', 'afternoonSchedule', 
                  'eveningSchedule', 'nightSchedule',
                  'health', 'work', 'selfcare', 'studyTasks', 
                  'packingList', 'items', 'expenses', 'assets', 'clinicalTasks'
                ];
                checkboxSections.forEach(section => {
                  if (updatedData[section] && Array.isArray(updatedData[section])) {
                    updatedData[section] = updatedData[section].map(item => ({ ...item, checked: false }));
                    dataChanged = true;
                  }
                });

                // Reset exam subjects topics
                if (updatedData.subjects && Array.isArray(updatedData.subjects)) {
                  updatedData.subjects = updatedData.subjects.map(sub => {
                    if (sub.topics && Array.isArray(sub.topics)) {
                      return {
                        ...sub,
                        topics: sub.topics.map(item => ({ ...item, checked: false }))
                      };
                    }
                    return sub;
                  });
                  dataChanged = true;
                }

                // Reset medical patient rounds & vitals
                if (updatedData.patients && Array.isArray(updatedData.patients)) {
                  updatedData.patients = updatedData.patients.map(p => ({
                    ...p,
                    vitalsChecked: false,
                    roundsDone: false
                  }));
                  dataChanged = true;
                }

                // Reset clinician self-care checklist items
                if (updatedData.clinicianCare) {
                  updatedData.clinicianCare = {
                    ...updatedData.clinicianCare,
                    lunchBreak: false
                  };
                  dataChanged = true;
                }

                if (dataChanged) {
                  resetDone = true;
                  const updatedContent = localGenerateTemplateSummary(note.templateType, updatedData);
                  return {
                    ...note,
                    templateData: updatedData,
                    content: updatedContent
                  };
                }
              }
            }
            return note;
          });

          if (resetDone) {
            await AsyncStorage.setItem(STORAGE_KEYS.NOTES, JSON.stringify(parsedNotes));
          }
          await AsyncStorage.setItem(STORAGE_KEYS.LAST_RESET_DATE, todayStr);
        }

        setNotes(parsedNotes);
        
        if (savedProfile) {
          const profile = JSON.parse(savedProfile);
          setUserProfile(profile);
          setScreen('list'); // Skip welcome if user already has a profile
        }
      } catch (error) {
        console.error('Failed to load data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  // Save Notes whenever they change
  useEffect(() => {
    if (!isLoading) {
      AsyncStorage.setItem(STORAGE_KEYS.NOTES, JSON.stringify(notes)).catch(err => 
        console.error('Failed to save notes:', err)
      );
    }
  }, [notes, isLoading]);

  // Save Folders whenever they change
  useEffect(() => {
    if (!isLoading) {
      AsyncStorage.setItem(STORAGE_KEYS.FOLDERS, JSON.stringify(folders)).catch(err => 
        console.error('Failed to save folders:', err)
      );
    }
  }, [folders, isLoading]);

  const handleSaveNote = (updatedNote) => {
    if (editingNote) {
      setNotes((prev) =>
        prev.map((note) =>
          note.id === editingNote.id
            ? {
                ...note,
                ...updatedNote,
                date: new Date().toLocaleString('en-IN', {
                  day: '2-digit',
                  month: 'short',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                }),
              }
            : note
        )
      );
      setEditingNote(null);
    } else {
      const noteWithId = {
        ...updatedNote,
        id: Date.now().toString(),
        date: new Date().toLocaleString('en-IN', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        }),
      };
      setNotes((prev) => [noteWithId, ...prev]);
    }
    setScreen('list');
  };

  const handleDeleteNote = (id) => {
    setNotes((prev) => prev.filter((note) => note.id !== id));
  };

  const handlePinToggle = (id) => {
    setNotes((prev) =>
      prev.map((note) =>
        note.id === id ? { ...note, isPinned: !note.isPinned } : note
      )
    );
  };

  const handleProfileComplete = async (profile) => {
    try {
      setUserProfile(profile);
      await AsyncStorage.setItem(STORAGE_KEYS.USER_PROFILE, JSON.stringify(profile));
      setScreen('list');
    } catch (error) {
      console.error('Failed to save profile:', error);
    }
  };

  const handleLogout = async (clearAllData) => {
    try {
      if (clearAllData) {
        await AsyncStorage.multiRemove([
          STORAGE_KEYS.NOTES, 
          STORAGE_KEYS.USER_PROFILE,
          STORAGE_KEYS.FOLDERS,
          STORAGE_KEYS.LAST_RESET_DATE
        ]);
        setNotes([]);
        setFolders([
          { id: 'folder_routine', name: 'Daily Routine', color: '#FF8C00', icon: 'checkbox-outline', isRoutine: true },
          { id: 'folder_personal', name: 'Personal', color: '#4CAF50', icon: 'person-outline', isRoutine: false },
          { id: 'folder_work', name: 'Work', color: '#2196F3', icon: 'briefcase-outline', isRoutine: false },
        ]);
      } else {
        await AsyncStorage.removeItem(STORAGE_KEYS.USER_PROFILE);
      }
      setUserProfile(null);
      setScreen('welcome');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const currentBackgroundColor = screen === 'welcome' 
    ? '#FF8C00' 
    : (screen === 'setup' ? '#F9F7F2' : (screen === 'list' && isDark ? '#121212' : theme.background));

  if (isLoading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: theme.background }]}>
        <ActivityIndicator size="large" color="#FF8C00" />
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <SafeAreaView style={[styles.container, { backgroundColor: currentBackgroundColor }]}>
        {screen === 'welcome' ? (
          <WelcomeScreen onGetStarted={() => setScreen('setup')} />
        ) : screen === 'setup' ? (
          <SetupProfileScreen onComplete={handleProfileComplete} />
        ) : screen === 'list' ? (
          <NotesListScreen
            notes={notes}
            folders={folders}
            onUpdateFolders={setFolders}
            userProfile={userProfile}
            isDark={isDark}
            setIsDark={setIsDark}
            theme={theme}
            onCreateNew={() => {
              setEditingNote(null);
              setScreen('editor');
            }}
            onDelete={handleDeleteNote}
            onLogout={handleLogout}
            onEdit={(note) => {
              setEditingNote(note);
              setScreen('editor');
            }}
            onUpdateNote={(updatedNote) => {
              setNotes((prev) =>
                prev.map((n) => (n.id === updatedNote.id ? updatedNote : n))
              );
            }}
            onPinToggle={handlePinToggle}
          />
        ) : (
          <NoteEditorScreen
            theme={theme}
            folders={folders}
            noteToEdit={editingNote}
            onSave={handleSaveNote}
            onBack={() => {
              setEditingNote(null);
              setScreen('list');
            }}
          />
        )}
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
