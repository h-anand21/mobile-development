import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import NotesListScreen from '../screens/NotesListScreen';
import NoteEditorScreen from '../screens/NoteEditorScreen';

export default function App() {
  const [screen, setScreen] = useState('list');

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.container}>
        {screen === 'list' ? (
          <NotesListScreen onCreateNew={() => setScreen('editor')} />
        ) : (
          <NoteEditorScreen onBack={() => setScreen('list')} />
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
