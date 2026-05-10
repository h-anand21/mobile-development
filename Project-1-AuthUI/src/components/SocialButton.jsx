// src/components/SocialButton.jsx

import React from 'react';

import { Pressable, StyleSheet } from 'react-native';

// Import Ionicons
import { Ionicons } from '@expo/vector-icons';

export default function SocialButton({ label, onPress }) {
  return (
    <Pressable style={styles.button} onPress={onPress}>
      {/* Real Icon */}
      <Ionicons name={label} size={24} color="#333" />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    width: 54,
    height: 54,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#D9D9D9',
    backgroundColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
