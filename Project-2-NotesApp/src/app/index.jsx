import React, { useState, useMemo } from 'react';
import { StyleSheet, View, useColorScheme } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import NotesListScreen from '../screens/NotesListScreen';
import NoteEditorScreen from '../screens/NoteEditorScreen';
import WelcomeScreen from '../screens/WelcomeScreen';
import { lightTheme, darkTheme } from '../constants/theme';
import { NOTES } from '../constants/notes';

export default function App() {
  const systemScheme = useColorScheme();
  const [isDark, setIsDark] = useState(systemScheme === 'dark');
  const [screen, setScreen] = useState('welcome');
  const [notes, setNotes] = useState(NOTES);

  const theme = useMemo(() => (isDark ? darkTheme : lightTheme), [isDark]);

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

  const currentBackgroundColor = screen === 'welcome' ? '#FF8C00' : (screen === 'list' && isDark ? '#121212' : theme.background);

  return (
    <SafeAreaProvider>
      <SafeAreaView style={[styles.container, { backgroundColor: currentBackgroundColor }]}>
        {screen === 'welcome' ? (
          <WelcomeScreen onGetStarted={() => setScreen('list')} />
        ) : screen === 'list' ? (
          <NotesListScreen
            notes={notes}
            isDark={isDark}
            setIsDark={setIsDark}
            theme={theme}
            onCreateNew={() => setScreen('editor')}
            onDelete={handleDeleteNote}
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
});
