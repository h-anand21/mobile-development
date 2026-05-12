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
};

export default function App() {
  const systemScheme = useColorScheme();
  const [isDark, setIsDark] = useState(systemScheme === 'dark');
  const [screen, setScreen] = useState('welcome');
  const [notes, setNotes] = useState([]);
  const [userProfile, setUserProfile] = useState(null);
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
        const [savedNotes, savedProfile] = await Promise.all([
          AsyncStorage.getItem(STORAGE_KEYS.NOTES),
          AsyncStorage.getItem(STORAGE_KEYS.USER_PROFILE),
        ]);

        if (savedNotes) setNotes(JSON.parse(savedNotes));
        
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

  const handleSaveNote = (newNote) => {
    const noteWithId = {
      ...newNote,
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
    setScreen('list');
  };

  const handleDeleteNote = (id) => {
    setNotes((prev) => prev.filter((note) => note.id !== id));
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
        await AsyncStorage.multiRemove([STORAGE_KEYS.NOTES, STORAGE_KEYS.USER_PROFILE]);
        setNotes([]);
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
            userProfile={userProfile}
            isDark={isDark}
            setIsDark={setIsDark}
            theme={theme}
            onCreateNew={() => setScreen('editor')}
            onDelete={handleDeleteNote}
            onLogout={handleLogout}
          />
        ) : (
          <NoteEditorScreen
            theme={theme}
            onSave={handleSaveNote}
            onBack={() => setScreen('list')}
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
